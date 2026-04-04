import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_admin
from ..database import get_db
from ..models import Admin, Member
from ..schemas import MemberCardData, MemberCreate, MemberOut, MemberStats, MemberUpdate

router = APIRouter(prefix="/api/members", tags=["members"])


def _generate_member_number(seq: int) -> str:
    year = datetime.now(timezone.utc).year
    return f"AEMUL-{year}-{seq:04d}"


@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
async def create_member(data: MemberCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Member).where(Member.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un membre avec cet email existe déjà.",
        )

    count_result = await db.execute(select(func.count(Member.id)))
    seq = (count_result.scalar() or 0) + 1

    member = Member(
        member_number=_generate_member_number(seq),
        **data.model_dump(),
    )
    db.add(member)
    await db.flush()
    await db.refresh(member)
    return member


@router.get("/{member_id}", response_model=MemberOut)
async def get_member(member_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé.")
    return member


@router.get("/{member_id}/card-data", response_model=MemberCardData)
async def get_card_data(member_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé.")
    if not member.is_active:
        raise HTTPException(status_code=403, detail="Membre inactif.")
    return member


@router.get("", response_model=list[MemberOut])
async def list_members(
    search: str | None = Query(None),
    is_active: bool | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Member).order_by(Member.created_at.desc())

    if search:
        pattern = f"%{search}%"
        query = query.where(
            Member.first_name.ilike(pattern)
            | Member.last_name.ilike(pattern)
            | Member.email.ilike(pattern)
            | Member.member_number.ilike(pattern)
            | Member.student_id.ilike(pattern)
        )
    if is_active is not None:
        query = query.where(Member.is_active == is_active)

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{member_id}", response_model=MemberOut)
async def update_member(
    member_id: uuid.UUID,
    data: MemberUpdate,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)

    await db.flush()
    await db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: uuid.UUID,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé.")
    await db.delete(member)


@router.get("/stats/overview", response_model=MemberStats)
async def get_stats(
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count(Member.id)))).scalar() or 0
    active = (
        await db.execute(
            select(func.count(Member.id)).where(Member.is_active == True)
        )
    ).scalar() or 0

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent = (
        await db.execute(
            select(func.count(Member.id)).where(
                Member.created_at >= thirty_days_ago
            )
        )
    ).scalar() or 0

    return MemberStats(
        total_members=total,
        active_members=active,
        inactive_members=total - active,
        recent_registrations=recent,
    )
