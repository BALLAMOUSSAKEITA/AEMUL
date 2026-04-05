from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from .auth import hash_password
from .database import engine, Base, async_session
from .models import Admin
from .routers import admin, events, members, prayer_times


async def _migrate_schema():
    """Add missing columns to existing tables (poor-man's migration)."""
    migrations = [
        ("members", "hashed_password", "VARCHAR(255) NOT NULL DEFAULT ''"),
        ("members", "must_change_password", "BOOLEAN NOT NULL DEFAULT true"),
        ("members", "is_approved", "BOOLEAN NOT NULL DEFAULT false"),
        ("members", "study_level", "VARCHAR(50) NOT NULL DEFAULT 'baccalaureat'"),
    ]
    nullable_migrations = [
        ("members", "student_id"),
    ]
    async with engine.begin() as conn:
        for table, column, col_type in migrations:
            await conn.execute(text(
                f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}"
            ))
        for table, column in nullable_migrations:
            try:
                await conn.execute(text(
                    f"ALTER TABLE {table} ALTER COLUMN {column} SET DEFAULT ''"
                ))
                await conn.execute(text(
                    f"ALTER TABLE {table} ALTER COLUMN {column} DROP NOT NULL"
                ))
            except Exception:
                pass


async def _seed_admin():
    """Create default admin if none exists."""
    async with async_session() as session:
        result = await session.execute(select(Admin).limit(1))
        if result.scalar_one_or_none() is None:
            session.add(Admin(
                email="admin@aemul.com",
                hashed_password=hash_password("admin"),
                full_name="Administrateur AEMUL",
            ))
            await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _migrate_schema()
    await _seed_admin()
    yield


app = FastAPI(
    title="AEMUL API",
    description="API pour l'Association des Étudiants Musulmans de l'Université Laval",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(members.router)
app.include_router(admin.router)
app.include_router(prayer_times.router)
app.include_router(events.router)


@app.get("/")
async def root():
    return {"message": "AEMUL API v2.0.0"}
