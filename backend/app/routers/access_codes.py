import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import decrypt_value, encrypt_value, get_current_admin
from ..database import get_db
from ..models import AccessCode
from ..schemas import AccessCodeCreate, AccessCodeOut, AccessCodeUpdate

router = APIRouter(prefix="/api/access-codes", tags=["access-codes"])


def _to_out(entry: AccessCode) -> AccessCodeOut:
    return AccessCodeOut(
        id=entry.id,
        platform_name=entry.platform_name,
        identifier=entry.identifier,
        password=decrypt_value(entry.encrypted_password),
        notes=entry.notes,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


@router.get("", response_model=list[AccessCodeOut])
async def list_access_codes(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(select(AccessCode).order_by(AccessCode.platform_name))
    return [_to_out(e) for e in result.scalars().all()]


@router.post("", response_model=AccessCodeOut, status_code=status.HTTP_201_CREATED)
async def create_access_code(
    data: AccessCodeCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    entry = AccessCode(
        platform_name=data.platform_name,
        identifier=data.identifier,
        encrypted_password=encrypt_value(data.password),
        notes=data.notes,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return _to_out(entry)


@router.put("/{code_id}", response_model=AccessCodeOut)
async def update_access_code(
    code_id: uuid.UUID,
    data: AccessCodeUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(select(AccessCode).where(AccessCode.id == code_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Code introuvable")

    if data.platform_name is not None:
        entry.platform_name = data.platform_name
    if data.identifier is not None:
        entry.identifier = data.identifier
    if data.password is not None:
        entry.encrypted_password = encrypt_value(data.password)
    if data.notes is not None:
        entry.notes = data.notes

    await db.commit()
    await db.refresh(entry)
    return _to_out(entry)


@router.delete("/{code_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_access_code(
    code_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(select(AccessCode).where(AccessCode.id == code_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Code introuvable")
    await db.delete(entry)
    await db.commit()
