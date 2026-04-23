"""
Matsyavan — Fisherman Assistant Bot.
Unified FastAPI backend exposing a single /api/chat endpoint plus direct
endpoints per sub-bot.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional, List

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

from bots.intent import classify_intent
from bots.weather import get_live_weather
from bots.market import get_market_prices
from bots.feed import calculate_feed
from bots.diagnosis import diagnose
from bots.faq import find_faq, list_all_faq
from bots.translate import normalize_lang, t


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Matsyavan — Fisherman Assistant Bot")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message: str = ""
    language: str = "en"
    location: Optional[str] = None
    # For structured sub-bot calls bypassing NLP:
    intent_override: Optional[str] = None
    feed_params: Optional[dict[str, Any]] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    id: str
    session_id: str
    intent: str
    language: str
    reply: str
    card: Optional[dict[str, Any]] = None
    timestamp: str


class FeedRequest(BaseModel):
    fish_weight_g: float
    num_fish: int
    species: str = "generic"
    meals_per_day: int = 2


class DiagnosisRequest(BaseModel):
    symptoms: str
    language: str = "en"


# ---------- Root ----------
@api_router.get("/")
async def root():
    return {
        "service": "Matsyavan — Fisherman Assistant Bot",
        "ok": True,
        "endpoints": [
            "/api/chat",
            "/api/weather",
            "/api/market/prices",
            "/api/feed/calculate",
            "/api/diagnosis",
            "/api/faq",
        ],
    }


# ---------- Weather ----------
@api_router.get("/weather")
async def weather(city: str, language: str = "en"):
    language = normalize_lang(language)
    data = get_live_weather(city, language)
    return data


# ---------- Market ----------
@api_router.get("/market/prices")
async def market(language: str = "en"):
    language = normalize_lang(language)
    return get_market_prices(language)


# ---------- Feed ----------
@api_router.post("/feed/calculate")
async def feed_calc(req: FeedRequest):
    return calculate_feed(
        req.fish_weight_g, req.num_fish, req.species, req.meals_per_day
    )


# ---------- Diagnosis ----------
@api_router.post("/diagnosis")
async def diagnosis_endpoint(req: DiagnosisRequest):
    return diagnose(req.symptoms, req.language)


# ---------- FAQ ----------
@api_router.get("/faq")
async def faq_list(language: str = "en"):
    language = normalize_lang(language)
    return {"ok": True, "items": list_all_faq(language)}


# ---------- Unified Chat ----------
@api_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    language = normalize_lang(req.language)
    message = (req.message or "").strip()
    session_id = req.session_id or str(uuid.uuid4())

    # Explicit override from frontend quick-actions/forms.
    intent = req.intent_override or classify_intent(message)
    card: Optional[dict[str, Any]] = None
    reply = ""

    if intent == "weather":
        city_candidate = (req.location or message or "").strip()
        # Strip common intent words to try and isolate a city name.
        for noise in (
            "weather in", "weather for", "weather at", "weather",
            "rain in", "rain at", "rain",
            "temperature in", "temperature at", "temperature",
            "forecast in", "forecast", "मौसम", "बारिश", "हवामान", "पाऊस",
        ):
            if noise in city_candidate.lower():
                city_candidate = city_candidate.lower().replace(noise, "").strip(" ,.?:-")
        city_candidate = city_candidate.strip()

        # If only the quick-action label came through (no real city), prompt.
        if not city_candidate or len(city_candidate) < 2:
            reply = t("ask_location", language)
            card = {"type": "prompt_location"}
        else:
            data = get_live_weather(city_candidate, language)
            if data.get("ok"):
                reply = data["advisory"]
                card = {"type": "weather", **data}
            else:
                reply = data.get("message", t("city_not_found", language))
                card = {"type": "prompt_location", "error": data.get("error")}

    elif intent == "market":
        data = get_market_prices(language)
        if data.get("ok"):
            reply = data["advisory"]
            card = {"type": "market", **data}
        else:
            reply = "Market data unavailable right now."
            card = {"type": "error", "detail": data}

    elif intent == "feed":
        if req.feed_params:
            data = calculate_feed(
                float(req.feed_params.get("fish_weight_g", 0) or 0),
                int(req.feed_params.get("num_fish", 0) or 0),
                str(req.feed_params.get("species", "generic")),
                int(req.feed_params.get("meals_per_day", 2) or 2),
            )
            if data.get("ok"):
                reply = t("feed_ready", language)
                card = {"type": "feed_result", **data}
            else:
                reply = data.get("message", "Invalid feed inputs.")
                card = {"type": "error", "detail": data}
        else:
            reply = t("feed_ready", language)
            card = {"type": "feed_form"}

    elif intent == "diagnosis":
        data = diagnose(message, language)
        reply = data.get("intro", "")
        card = {"type": "diagnosis", **data}

    else:  # faq / fallback
        data = find_faq(message, language)
        reply = data.get("intro") or t("fallback", language)
        card = {"type": "faq", **data}

    now = datetime.now(timezone.utc).isoformat()
    msg_id = str(uuid.uuid4())

    # Persist to Mongo (best-effort).
    try:
        await db.chat_messages.insert_one(
            {
                "id": msg_id,
                "session_id": session_id,
                "message": message,
                "intent": intent,
                "language": language,
                "reply": reply,
                "card_type": (card or {}).get("type"),
                "timestamp": now,
            }
        )
    except Exception as exc:  # pragma: no cover
        logger.warning(f"Chat persistence failed: {exc}")

    return ChatResponse(
        id=msg_id,
        session_id=session_id,
        intent=intent,
        language=language,
        reply=reply,
        card=card,
        timestamp=now,
    )


@api_router.get("/chat/history/{session_id}")
async def chat_history(session_id: str, limit: int = 50):
    docs = (
        await db.chat_messages.find(
            {"session_id": session_id}, {"_id": 0}
        )
        .sort("timestamp", 1)
        .to_list(limit)
    )
    return {"ok": True, "session_id": session_id, "messages": docs}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("matsyavan")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
