import re
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/prayer-times", tags=["prayer-times"])

MPT_URL = "https://mosqueprayertimes.com/aemul"
_cache: dict = {"data": None, "fetched_at": None}
CACHE_TTL_SECONDS = 3600


def _parse_mpt_entry(raw: str) -> dict | None:
    """Parse a single MPT encoded string into structured prayer times."""
    if not raw or len(raw) < 56:
        return None

    def fmt(hhmm: str) -> str:
        if hhmm == "0000":
            return ""
        return f"{hhmm[:2]}:{hhmm[2:]}"

    return {
        "hijri": raw[:8],
        "fajr_start": fmt(raw[8:12]),
        "fajr_iqama": fmt(raw[12:16]),
        "shurooq": fmt(raw[16:20]),
        "zuhr_start": fmt(raw[20:24]),
        "zuhr_iqama": fmt(raw[24:28]),
        "asr_start": fmt(raw[28:32]),
        "asr_iqama": fmt(raw[32:36]),
        "maghrib_start": fmt(raw[36:40]),
        "maghrib_iqama": fmt(raw[40:44]),
        "isha_start": fmt(raw[44:48]),
        "isha_iqama": fmt(raw[48:52]),
        "jumah": fmt(raw[52:56]) if len(raw) >= 56 else "",
        "jumah2": fmt(raw[56:60]) if len(raw) >= 60 else "",
    }


async def _fetch_prayer_times() -> dict:
    """Scrape mosqueprayertimes.com/aemul and extract the MPT data."""
    now = datetime.now(timezone.utc)

    if (
        _cache["data"]
        and _cache["fetched_at"]
        and (now - _cache["fetched_at"]).total_seconds() < CACHE_TTL_SECONDS
    ):
        return _cache["data"]

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(MPT_URL)
        resp.raise_for_status()

    html = resp.text

    match = re.search(r"MPT\s*=\s*\{([^}]+)\}", html)
    if not match:
        raise HTTPException(status_code=502, detail="Impossible de parser les heures de prieres.")

    raw_block = match.group(1)
    entries: dict[str, dict] = {}

    for m in re.finditer(r'(\d{8})\s*:\s*"(\d+)"', raw_block):
        date_key = m.group(1)
        parsed = _parse_mpt_entry(m.group(2))
        if parsed:
            formatted_date = f"{date_key[:4]}-{date_key[4:6]}-{date_key[6:8]}"
            entries[formatted_date] = parsed

    result = {"times": entries, "source": "mosqueprayertimes.com/aemul"}
    _cache["data"] = result
    _cache["fetched_at"] = now
    return result


@router.get("")
async def get_prayer_times():
    """Return prayer times scraped from mosqueprayertimes.com/aemul."""
    try:
        return await _fetch_prayer_times()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Impossible de contacter mosqueprayertimes.com.")
