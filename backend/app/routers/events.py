import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_admin
from ..database import get_db
from ..models import Admin, Event
from ..schemas import EventCreate, EventOut, EventUpdate

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
