import json
import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import (
    create_access_token,
    get_current_admin,
    get_current_superadmin,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..models import Admin
from ..schemas import (
    AdminCreate,
    AdminLogin,
    AdminManageCreate,
    AdminManageUpdate,
    AdminOut,
    Token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Auth ──────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
async def login(data: AdminLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admin).where(Admin.email == data.email))
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
        )

    token = create_access_token(str(admin.id))
    return Token(access_token=token)


@router.get("/me", response_model=AdminOut)
async def me(admin: Admin = Depends(get_current_admin)):
    return admin


@router.post("/seed", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
async def seed_first_admin(data: AdminCreate, db: AsyncSession = Depends(get_db)):
    """Create the very first admin. Disabled once any admin exists."""
    count_result = await db.execute(select(Admin))
    if count_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Un administrateur existe déjà. Utilisez /register.",
        )

    admin = Admin(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        is_superadmin=True,
    )
    db.add(admin)
    await db.flush()
    await db.refresh(admin)
    return admin


# ── Gestion des admins (superadmin uniquement) ────────────────────────────────

@router.get("/admins", response_model=list[AdminOut])
async def list_admins(
    db: AsyncSession = Depends(get_db),
    _super: Admin = Depends(get_current_superadmin),
):
    result = await db.execute(select(Admin).order_by(Admin.created_at))
    return result.scalars().all()


@router.post("/admins", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
async def create_admin(
    data: AdminManageCreate,
    db: AsyncSession = Depends(get_db),
    _super: Admin = Depends(get_current_superadmin),
):
    existing = await db.execute(select(Admin).where(Admin.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Un admin avec cet email existe déjà.")

    admin = Admin(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        is_superadmin=False,
        permissions=json.dumps(data.permissions),
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


@router.put("/admins/{admin_id}", response_model=AdminOut)
async def update_admin(
    admin_id: _uuid.UUID,
    data: AdminManageUpdate,
    db: AsyncSession = Depends(get_db),
    superadmin: Admin = Depends(get_current_superadmin),
):
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Admin introuvable.")
    if target.is_superadmin and target.id != superadmin.id:
        raise HTTPException(status_code=403, detail="Impossible de modifier un autre superadmin.")

    if data.full_name is not None:
        target.full_name = data.full_name
    if data.password is not None:
        target.hashed_password = hash_password(data.password)
    if data.permissions is not None and not target.is_superadmin:
        target.permissions = json.dumps(data.permissions)

    await db.commit()
    await db.refresh(target)
    return target


@router.delete("/admins/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: _uuid.UUID,
    db: AsyncSession = Depends(get_db),
    superadmin: Admin = Depends(get_current_superadmin),
):
    if admin_id == superadmin.id:
        raise HTTPException(status_code=400, detail="Impossible de supprimer votre propre compte.")

    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Admin introuvable.")
    if target.is_superadmin:
        raise HTTPException(status_code=403, detail="Impossible de supprimer un superadmin.")

    await db.delete(target)
    await db.commit()
