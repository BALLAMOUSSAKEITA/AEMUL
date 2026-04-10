import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_admin, get_current_member
from ..database import get_db
from ..models import Admin, Event, EventRegistration, Member
from ..schemas import (
    EventCreate,
    EventOut,
    EventRegistrationOut,
    EventUpdate,
    EventWithRegistrations,
)

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventOut])
async def list_events(
    upcoming_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone

    query = select(Event).where(Event.is_published == True).order_by(Event.date.desc())  # noqa: E712
    if upcoming_only:
        query = query.where(Event.date >= datetime.now(timezone.utc))
        query = query.order_by(Event.date.asc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: EventCreate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    event = Event(**data.model_dump(), created_by=str(admin.id))
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventOut)
async def update_event(
    event_id: uuid.UUID,
    data: EventUpdate,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    await db.flush()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: uuid.UUID,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé.")
    await db.delete(event)


# ── Event registrations (member) ─────────────────────────────────────────────

@router.post("/{event_id}/register", status_code=status.HTTP_201_CREATED)
async def register_for_event(
    event_id: uuid.UUID,
    member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    # Check event exists
    evt = await db.execute(select(Event).where(Event.id == event_id))
    if not evt.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Événement non trouvé.")

    # Check not already registered
    existing = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.member_id == member.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Déjà inscrit à cet événement.")

    reg = EventRegistration(event_id=event_id, member_id=member.id)
    db.add(reg)
    await db.flush()
    return {"message": "Inscription confirmée."}


@router.delete("/{event_id}/register", status_code=status.HTTP_204_NO_CONTENT)
async def unregister_from_event(
    event_id: uuid.UUID,
    member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.member_id == member.id,
        )
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Inscription non trouvée.")
    await db.delete(reg)


@router.get("/{event_id}/registered", response_model=bool)
async def check_registered(
    event_id: uuid.UUID,
    member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.member_id == member.id,
        )
    )
    return result.scalar_one_or_none() is not None


# ── Event registrations (admin) ──────────────────────────────────────────────

@router.get("/admin/list", response_model=list[EventWithRegistrations])
async def list_events_with_registrations(
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    events_result = await db.execute(select(Event).order_by(Event.date.desc()))
    events = events_result.scalars().all()

    result = []
    for evt in events:
        count_result = await db.execute(
            select(func.count(EventRegistration.id)).where(
                EventRegistration.event_id == evt.id
            )
        )
        count = count_result.scalar() or 0
        event_data = EventWithRegistrations.model_validate(evt)
        event_data.registration_count = count
        result.append(event_data)
    return result


@router.get("/{event_id}/registrations", response_model=list[EventRegistrationOut])
async def get_event_registrations(
    event_id: uuid.UUID,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    regs_result = await db.execute(
        select(EventRegistration).where(EventRegistration.event_id == event_id)
        .order_by(EventRegistration.created_at.desc())
    )
    regs = regs_result.scalars().all()

    result = []
    for reg in regs:
        member_result = await db.execute(
            select(Member).where(Member.id == reg.member_id)
        )
        member = member_result.scalar_one_or_none()
        result.append(EventRegistrationOut(
            id=reg.id,
            event_id=reg.event_id,
            member_id=reg.member_id,
            member_name=f"{member.first_name} {member.last_name}" if member else "?",
            member_email=member.email if member else "",
            member_gender=member.gender if member else "",
            created_at=reg.created_at,
        ))
    return result
