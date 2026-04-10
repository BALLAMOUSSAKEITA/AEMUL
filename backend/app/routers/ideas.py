from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_admin
from ..database import get_db
from ..models import Admin, Idea
from ..schemas import IdeaCreate, IdeaOut

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


@router.post("", response_model=IdeaOut, status_code=status.HTTP_201_CREATED)
async def submit_idea(data: IdeaCreate, db: AsyncSession = Depends(get_db)):
    """Submit an anonymous idea — no authentication required."""
    idea = Idea(content=data.content)
    db.add(idea)
    await db.flush()
    await db.refresh(idea)
    return idea


@router.get("", response_model=list[IdeaOut])
async def list_ideas(
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Idea).order_by(Idea.created_at.desc()))
    return result.scalars().all()
