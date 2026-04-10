import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import (
    create_access_token,
    generate_password,
    get_current_admin,
    get_current_member,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..models import Admin, Member
from ..schemas import (
    MemberCardData,
    MemberChangePassword,
    MemberCreate,
    MemberLogin,
    MemberOut,
    MemberProfileUpdate,
    MemberRegistrationResult,
    MemberStats,
    MemberToken,
    MemberUpdate,
)

router = APIRouter(prefix="/api/members", tags=["members"])


def _generate_member_number(seq: int) -> str:
    year = datetime.now(timezone.utc).year
    return f"AEMUL-{year}-{seq:04d}"


# ── Public ───────────────────────────────────────────────────────────────────

@router.post("", response_model=MemberRegistrationResult, status_code=status.HTTP_201_CREATED)
async def create_member(data: MemberCreate, db: AsyncSession = Depends(get_db)):
    import traceback

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

    raw_password = generate_password()

    try:
        member = Member(
            member_number=_generate_member_number(seq),
            hashed_password=hash_password(raw_password),
            must_change_password=True,
            is_approved=False,
            student_id="",
            **data.model_dump(),
        )
        db.add(member)
        await db.flush()
        await db.refresh(member)
    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur création membre: {str(e)} | {tb[-500:]}",
        )
    return MemberRegistrationResult(member=MemberOut.model_validate(member), generated_password=raw_password)


@router.post("/login", response_model=MemberToken)
async def member_login(data: MemberLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Member).where(Member.email == data.email))
    member = result.scalar_one_or_none()

    if not member or not verify_password(data.password, member.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
        )

    if not member.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte est désactivé.",
        )

    token = create_access_token(str(member.id), role="member")
    return MemberToken(
        access_token=token,
        must_change_password=member.must_change_password,
        is_approved=member.is_approved,
    )


# ── Authenticated member ─────────────────────────────────────────────────────

@router.get("/me", response_model=MemberOut)
async def get_me(member: Member = Depends(get_current_member)):
    return member


@router.put("/me/password")
async def change_password(
    data: MemberChangePassword,
    member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères.")
    member.hashed_password = hash_password(data.new_password)
    member.must_change_password = False
    await db.flush()
    return {"message": "Mot de passe modifié avec succès."}


@router.put("/me/profile", response_model=MemberOut)
async def update_profile(
    data: MemberProfileUpdate,
    member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    await db.flush()
    await db.refresh(member)
    return member


@router.get("/me/card", response_model=MemberCardData)
async def get_my_card(member: Member = Depends(get_current_member)):
    if not member.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre inscription n'a pas encore été approuvée par un administrateur.",
        )
    if not member.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte désactivé.")
    return member


# ── Admin-only ────────────────────────────────────────────────────────────────

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
    if not member.is_approved:
        raise HTTPException(status_code=403, detail="Membre non approuvé.")
    return member


@router.get("", response_model=list[MemberOut])
async def list_members(
    search: str | None = Query(None),
    is_active: bool | None = Query(None),
    is_approved: bool | None = Query(None),
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
        )
    if is_active is not None:
        query = query.where(Member.is_active == is_active)
    if is_approved is not None:
        query = query.where(Member.is_approved == is_approved)

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


@router.put("/{member_id}/approve", response_model=MemberOut)
async def approve_member(
    member_id: uuid.UUID,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé.")
    member.is_approved = True
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
            select(func.count(Member.id)).where(Member.is_active == True)  # noqa: E712
        )
    ).scalar() or 0
    approved = (
        await db.execute(
            select(func.count(Member.id)).where(Member.is_approved == True)  # noqa: E712
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
        pending_approvals=total - approved,
    )
