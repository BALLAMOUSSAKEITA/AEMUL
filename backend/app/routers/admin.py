from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import create_access_token, get_current_admin, hash_password, verify_password
from ..database import get_db
from ..models import Admin
from ..schemas import AdminCreate, AdminLogin, AdminOut, Token

router = APIRouter(prefix="/api/auth", tags=["auth"])


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


@router.post("/register", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
async def register_admin(
    data: AdminCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    existing = await db.execute(select(Admin).where(Admin.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un administrateur avec cet email existe déjà.",
        )

    admin = Admin(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(admin)
    await db.flush()
    await db.refresh(admin)
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
    )
    db.add(admin)
    await db.flush()
    await db.refresh(admin)
    return admin


@router.get("/me", response_model=AdminOut)
async def me(admin: Admin = Depends(get_current_admin)):
    return admin
