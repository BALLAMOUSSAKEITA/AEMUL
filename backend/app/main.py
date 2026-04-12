from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from .auth import hash_password
from .database import engine, Base, async_session
from .models import Admin, KnowledgeEntry
from .routers import admin, events, ideas, members, prayer_times, access_codes, knowledge


async def _migrate_schema():
    """Add missing columns to existing tables (poor-man's migration)."""
    migrations = [
        ("members", "hashed_password", "VARCHAR(255) NOT NULL DEFAULT ''"),
        ("members", "must_change_password", "BOOLEAN NOT NULL DEFAULT true"),
        ("members", "is_approved", "BOOLEAN NOT NULL DEFAULT false"),
        ("members", "study_level", "VARCHAR(50) NOT NULL DEFAULT 'baccalaureat'"),
        ("members", "gender", "VARCHAR(10) NOT NULL DEFAULT 'frere'"),
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
            async with engine.begin() as conn:
                await conn.execute(text(
                    f"ALTER TABLE {table} ALTER COLUMN {column} SET DEFAULT ''"
                ))
                await conn.execute(text(
                    f"ALTER TABLE {table} ALTER COLUMN {column} DROP NOT NULL"
                ))
        except Exception:
            pass
    # Fix study_year column: drop NOT NULL and set a proper default
    try:
        async with engine.begin() as conn:
            await conn.execute(text(
                "ALTER TABLE members ALTER COLUMN study_year DROP NOT NULL"
            ))
            await conn.execute(text(
                "ALTER TABLE members ALTER COLUMN study_year SET DEFAULT NULL"
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


_KB_SEED = [
    {
        "title": "Présentation de l'AEMUL",
        "category": "Présentation",
        "keywords": "aemul, association, musulmans, université, laval, création, 1976, histoire, islam, paix",
        "content": (
            "L'AEMUL (Association des Étudiants Musulmans de l'Université Laval) a été créée en 1976. "
            "Elle vise à contribuer au rayonnement de l'islam en tant que religion de paix pour toutes les créatures."
        ),
    },
    {
        "title": "Objectifs de l'AEMUL",
        "category": "Mission & valeurs",
        "keywords": "objectifs, mission, foi, accueil, soutien, solidarité, réflexion, activités, culturelles, sportives",
        "content": (
            "Les objectifs de l'AEMUL sont :\n"
            "• Offrir aux membres un cadre adéquat d'expression de leur foi.\n"
            "• Servir de cadre d'accueil et de soutien à tout nouvel arrivant(e), particulièrement aux étudiant(e)s.\n"
            "• Servir de lieu de réflexion et d'échange, surtout ce qui a trait à la foi et à l'actualité islamique.\n"
            "• Promouvoir la solidarité entre les membres.\n"
            "• Promouvoir des relations de compréhension et de bonne entente avec le reste de la communauté universitaire.\n"
            "• Organiser des activités culturelles et sportives pour les membres."
        ),
    },
    {
        "title": "Projets et activités de l'AEMUL",
        "category": "Activités",
        "keywords": "projets, activités, coran, arabe, iftar, ramadan, taraweeh, prière, événements, sociaux, sportifs, culturels, rassemblement",
        "content": (
            "Les principaux projets et activités de l'AEMUL sont :\n"
            "• Apprentissage du Coran et de la langue arabe.\n"
            "• Iftars du Ramadan et prières (Taraweeh).\n"
            "• Rassemblement de la communauté étudiante musulmane autour d'événements sociaux, culturels et sportifs."
        ),
    },
]


async def _seed_knowledge():
    """Seed la base de connaissances avec les informations de l'AEMUL si vide."""
    async with async_session() as session:
        result = await session.execute(select(KnowledgeEntry).limit(1))
        if result.scalar_one_or_none() is not None:
            return
        for entry in _KB_SEED:
            session.add(KnowledgeEntry(**entry))
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _migrate_schema()
    await _seed_admin()
    await _seed_knowledge()
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
app.include_router(ideas.router)
app.include_router(access_codes.router)
app.include_router(knowledge.router)


@app.get("/")
async def root():
    return {"message": "AEMUL API v2.0.0"}
