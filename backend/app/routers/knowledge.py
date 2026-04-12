import logging
import os
import re
import unicodedata
import uuid

import google.generativeai as genai
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
logger = logging.getLogger(__name__)

# ── Gemini setup ──────────────────────────────────────────────────────────────

_GEMINI_MODEL: genai.GenerativeModel | None = None

_SYSTEM_INSTRUCTION = (
    "Tu es l'assistant officiel de l'AEMUL (Association des Étudiants Musulmans de l'Université Laval). "
    "Ta seule et unique mission est de répondre aux questions concernant l'AEMUL : "
    "son histoire, sa mission, son bureau, ses activités, son adhésion, ses contacts, etc. "
    "Règles absolues que tu dois toujours respecter :\n"
    "1. Réponds TOUJOURS en français.\n"
    "2. Sois chaleureux, professionnel et concis.\n"
    "3. Si la question n'est pas liée à l'AEMUL (météo, politique, technologie, etc.), "
    "réponds exactement : \"Je suis uniquement spécialisé sur l'AEMUL. "
    "N'hésitez pas à me poser une question sur notre association !\"\n"
    "4. Ne fabrique JAMAIS d'informations. "
    "Si le contexte fourni ne contient pas la réponse, dis honnêtement : "
    "\"Je n'ai pas cette information pour le moment. "
    "Contactez-nous directement pour plus de détails !\"\n"
    "5. Tu peux utiliser le Markdown (gras, listes) pour structurer tes réponses."
)


def _get_model() -> genai.GenerativeModel | None:
    global _GEMINI_MODEL
    if _GEMINI_MODEL is not None:
        return _GEMINI_MODEL
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        logger.warning("GEMINI_API_KEY non définie — fallback keyword matching")
        return None
    genai.configure(api_key=api_key)
    _GEMINI_MODEL = genai.GenerativeModel(
        model_name="gemini-2.5-pro-preview-03-25",
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": 800,
        },
        system_instruction=_SYSTEM_INSTRUCTION,
    )
    logger.info("Modèle Gemini 2.5 Pro initialisé")
    return _GEMINI_MODEL


# ── Retrieval helpers (TF-IDF léger) ─────────────────────────────────────────

_STOPWORDS = {
    "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
    "me", "te", "se", "y", "en", "que", "qui", "quoi", "quand", "ou",
    "comment", "pourquoi", "est", "sont", "a", "ont", "ai", "as", "avez",
    "ce", "cet", "cette", "ces", "si", "et", "mais", "donc", "or", "ni",
    "car", "par", "pour", "sur", "sous", "avec", "sans", "dans", "chez",
    "vers", "entre", "depuis", "pendant", "avant", "apres", "lors",
    "quel", "quelle", "quels", "quelles", "tres", "plus", "moins", "bien",
    "ma", "mon", "mes", "ta", "ton", "tes", "sa", "son", "ses",
}


def _normalize(text: str) -> str:
    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s]", " ", text)
    return text


def _query_words(text: str) -> list[str]:
    return [w for w in _normalize(text).split() if len(w) >= 3 and w not in _STOPWORDS]


def _score(entry: KnowledgeEntry, words: list[str]) -> float:
    title = _normalize(entry.title)
    content = _normalize(entry.content)
    category = _normalize(entry.category)
    kw = _normalize(entry.keywords or "")
    score = 0.0
    for w in words:
        if w in title.split():
            score += 4.0
        elif w in title:
            score += 2.5
        if w in kw:
            score += 2.0
        if w in category:
            score += 1.5
        if w in content:
            score += 0.8
    return score


def _retrieve(entries: list[KnowledgeEntry], question: str, top_k: int = 5) -> list[KnowledgeEntry]:
    """Return the top_k most relevant entries using keyword scoring."""
    words = _query_words(question)
    if not words:
        return entries[:top_k]
    scored = sorted(
        ((e, _score(e, words)) for e in entries),
        key=lambda x: x[1],
        reverse=True,
    )
    # Keep entries with a score > 0; if none, return top_k anyway for Gemini to handle
    relevant = [e for e, s in scored if s > 0]
    return (relevant or [e for e, _ in scored])[:top_k]


# ── RAG + Gemini ──────────────────────────────────────────────────────────────

async def _ask_with_rag(question: str, entries: list[KnowledgeEntry]) -> ChatAnswer:
    model = _get_model()

    retrieved = _retrieve(entries, question, top_k=5)

    context_parts = [
        f"### {e.title} ({e.category})\n{e.content}"
        for e in retrieved
    ]
    context_text = "\n\n".join(context_parts) if context_parts else "Aucune entrée disponible."

    prompt = (
        f"=== CONTEXTE DE LA BASE DE CONNAISSANCES AEMUL ===\n"
        f"{context_text}\n\n"
        f"=== QUESTION DE L'UTILISATEUR ===\n"
        f"{question}"
    )

    if model is None:
        # Fallback sans LLM
        words = _query_words(question)
        scored = [(e, _score(e, words)) for e in entries]
        scored = [(e, s) for e, s in scored if s > 0.5]
        scored.sort(key=lambda x: x[1], reverse=True)
        if not scored:
            return ChatAnswer(
                answer=(
                    "Je suis désolé, je n'ai pas trouvé d'information sur ce sujet. "
                    "Je suis uniquement spécialisé sur l'AEMUL. "
                    "N'hésitez pas à nous contacter directement !"
                ),
                found=False,
            )
        parts = [f"**{e.title}**\n{e.content}" for e, _ in scored[:3]]
        return ChatAnswer(answer="\n\n---\n\n".join(parts), found=True)

    try:
        response = await model.generate_content_async(prompt)
        answer = response.text.strip()
        found = not any(
            phrase in answer.lower()
            for phrase in [
                "uniquement spécialisé",
                "pas cette information",
                "contactez-nous",
                "ne peux pas",
            ]
        )
        return ChatAnswer(answer=answer, found=found)
    except Exception as e:
        logger.error("Erreur Gemini : %s", e, exc_info=True)
        return ChatAnswer(
            answer=(
                "Une erreur s'est produite lors de la génération de la réponse. "
                "Veuillez réessayer dans quelques instants."
            ),
            found=False,
        )


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


# ── Chat public ───────────────────────────────────────────────────────────────

@router.post("/api/chat", response_model=ChatAnswer)
async def chat(
    payload: ChatQuestion,
    db: AsyncSession = Depends(get_db),
):
    question = payload.question.strip()
    if not question:
        return ChatAnswer(answer="Veuillez poser une question.", found=False)

    result = await db.execute(
        select(KnowledgeEntry).where(KnowledgeEntry.is_active == True)  # noqa: E712
    )
    entries = list(result.scalars().all())

    if not entries:
        return ChatAnswer(
            answer=(
                "La base de connaissances est encore vide. "
                "Revenez bientôt ou contactez-nous directement pour obtenir des informations sur l'AEMUL !"
            ),
            found=False,
        )

    return await _ask_with_rag(question, entries)
