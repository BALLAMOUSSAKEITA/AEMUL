import re
import unicodedata
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_admin
from ..database import get_db
from ..models import KnowledgeEntry
from ..schemas import (
    ChatAnswer,
    ChatQuestion,
    KnowledgeEntryCreate,
    KnowledgeEntryOut,
    KnowledgeEntryUpdate,
)

router = APIRouter(tags=["knowledge"])

# ── French stopwords ──────────────────────────────────────────────────────────

_STOPWORDS = {
    "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
    "me", "te", "se", "y", "en", "que", "qui", "quoi", "quand", "ou",
    "comment", "pourquoi", "est", "sont", "a", "ont", "ai", "as", "avez",
    "ce", "cet", "cette", "ces", "si", "et", "mais", "donc", "or", "ni",
    "car", "par", "pour", "sur", "sous", "avec", "sans", "dans", "chez",
    "vers", "entre", "depuis", "pendant", "avant", "apres", "lors",
    "quel", "quelle", "quels", "quelles", "deja", "toujours", "jamais",
    "aussi", "tres", "plus", "moins", "bien", "mal", "peut", "doit",
    "savoir", "connaitre", "avoir", "etre", "faire", "aller", "venir",
    "me", "ma", "mon", "mes", "ta", "ton", "tes", "sa", "son", "ses",
}


def _normalize(text: str) -> str:
    """Lowercase, remove accents, keep only alphanumeric + spaces."""
    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s]", " ", text)
    return text


def _keywords(text: str) -> list[str]:
    """Return meaningful words (length ≥ 3, not a stopword)."""
    return [w for w in _normalize(text).split() if len(w) >= 3 and w not in _STOPWORDS]


def _score(entry: KnowledgeEntry, query_words: list[str]) -> float:
    title = _normalize(entry.title)
    content = _normalize(entry.content)
    category = _normalize(entry.category)
    kw = _normalize(entry.keywords or "")

    score = 0.0
    for word in query_words:
        if word in title.split():
            score += 4.0
        elif word in title:
            score += 2.5
        if word in kw.split(",") or word in kw:
            score += 2.0
        if word in category:
            score += 1.5
        if word in content:
            score += 0.8
    return score


def _build_answer(matches: list[tuple[KnowledgeEntry, float]]) -> str:
    if not matches:
        return (
            "Je suis désolé, je n'ai pas trouvé d'information sur ce sujet dans ma base de connaissances. "
            "Je suis spécialisé uniquement sur l'AEMUL. "
            "N'hésitez pas à nous contacter directement pour plus d'informations !"
        )

    if len(matches) == 1:
        entry = matches[0][0]
        return f"**{entry.title}**\n\n{entry.content}"

    parts = []
    for entry, _ in matches[:3]:
        parts.append(f"**{entry.title}**\n{entry.content}")
    return "\n\n---\n\n".join(parts)


# ── CRUD Admin ────────────────────────────────────────────────────────────────

@router.get("/api/kb", response_model=list[KnowledgeEntryOut])
async def list_kb(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(KnowledgeEntry).order_by(KnowledgeEntry.category, KnowledgeEntry.title)
    )
    return result.scalars().all()


@router.post("/api/kb", response_model=KnowledgeEntryOut, status_code=status.HTTP_201_CREATED)
async def create_kb(
    data: KnowledgeEntryCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    entry = KnowledgeEntry(**data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.put("/api/kb/{entry_id}", response_model=KnowledgeEntryOut)
async def update_kb(
    entry_id: uuid.UUID,
    data: KnowledgeEntryUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(select(KnowledgeEntry).where(KnowledgeEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrée introuvable")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(entry, field, value)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/api/kb/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_kb(
    entry_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(select(KnowledgeEntry).where(KnowledgeEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrée introuvable")
    await db.delete(entry)
    await db.commit()


# ── Chat (public) ─────────────────────────────────────────────────────────────

@router.post("/api/chat", response_model=ChatAnswer)
async def chat(
    payload: ChatQuestion,
    db: AsyncSession = Depends(get_db),
):
    question = payload.question.strip()
    if not question:
        return ChatAnswer(answer="Veuillez poser une question.", found=False)

    # Load active entries
    result = await db.execute(
        select(KnowledgeEntry).where(KnowledgeEntry.is_active == True)  # noqa: E712
    )
    entries = result.scalars().all()

    if not entries:
        return ChatAnswer(
            answer=(
                "La base de connaissances est vide pour l'instant. "
                "Revenez bientôt ou contactez-nous directement !"
            ),
            found=False,
        )

    query_words = _keywords(question)

    if not query_words:
        return ChatAnswer(
            answer="Je n'ai pas bien compris votre question. Pouvez-vous reformuler ?",
            found=False,
        )

    # Score and filter
    scored = [(e, _score(e, query_words)) for e in entries]
    scored = [(e, s) for e, s in scored if s > 0.5]
    scored.sort(key=lambda x: x[1], reverse=True)

    if not scored:
        return ChatAnswer(
            answer=(
                "Je suis désolé, je n'ai pas trouvé d'information sur ce sujet. "
                "Je suis uniquement spécialisé sur l'AEMUL (Association des Étudiants Musulmans de l'Université Laval). "
                "Essayez de poser une question sur l'association, ses activités, son bureau ou son adhésion !"
            ),
            found=False,
        )

    return ChatAnswer(answer=_build_answer(scored[:3]), found=True)
