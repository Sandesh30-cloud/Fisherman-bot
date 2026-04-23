"""
Backend regression tests for Matsyavan – Fisherman Assistant Bot.

Covers every /api route:
- /api/                 root
- /api/weather          Open-Meteo live fetch
- /api/market/prices    CSV-backed market data
- /api/feed/calculate   Feed calculator
- /api/diagnosis        Rule-based disease diagnosis
- /api/faq              FAQ list
- /api/chat             Unified chat endpoint (+ MongoDB persistence)
- /api/chat/history/..  History retrieval

Uses REACT_APP_BACKEND_URL from /app/frontend/.env (public preview URL).
"""
from __future__ import annotations

import os
import uuid
from pathlib import Path

import pytest
import requests

# Load REACT_APP_BACKEND_URL from frontend .env (source of truth for tests)
FRONTEND_ENV = Path("/app/frontend/.env")
if FRONTEND_ENV.exists():
    for line in FRONTEND_ENV.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL"):
            os.environ.setdefault(
                "REACT_APP_BACKEND_URL", line.split("=", 1)[1].strip()
            )

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
TIMEOUT = 30


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------------- Root ----------------
class TestRoot:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert "service" in data
        assert "/api/chat" in data["endpoints"]


# ---------------- Weather ----------------
class TestWeather:
    def test_weather_kolkata_live(self, api):
        r = api.get(f"{BASE_URL}/api/weather", params={"city": "Kolkata", "language": "en"}, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True, f"Expected ok=True, got {d}"
        assert d.get("live") is True
        assert d.get("source") == "Open-Meteo"
        current = d.get("current") or {}
        assert "temperature_c" in current and current["temperature_c"] is not None
        assert "humidity" in current
        assert "wind_kmh" in current
        forecast = d.get("forecast") or []
        assert len(forecast) == 3, f"Expected 3-day forecast, got {len(forecast)}"
        for day in forecast:
            assert "date" in day and "t_max" in day and "t_min" in day

    def test_weather_mumbai(self, api):
        r = api.get(f"{BASE_URL}/api/weather", params={"city": "Mumbai"}, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        assert d["location"]["name"].lower().startswith("mumbai")

    def test_weather_city_not_found(self, api):
        r = api.get(f"{BASE_URL}/api/weather", params={"city": "NonExistentCityXyz"}, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is False
        assert d.get("error") == "city_not_found"


# ---------------- Market ----------------
class TestMarket:
    def test_market_english(self, api):
        r = api.get(f"{BASE_URL}/api/market/prices", params={"language": "en"}, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        prices = d.get("prices") or []
        assert len(prices) == 10, f"Expected 10 fish prices, got {len(prices)}"
        sample = prices[0]
        # Current API returns 'price' (computed), not 'base_price'
        for key in ("species", "price", "trend", "recommend_sell", "unit"):
            assert key in sample, f"Missing {key} in {sample}"
        assert sample["trend"] in ("up", "down", "flat")
        assert isinstance(sample["recommend_sell"], bool)

    def test_market_hindi(self, api):
        r = api.get(f"{BASE_URL}/api/market/prices", params={"language": "hi"}, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        prices = d["prices"]
        assert any(p.get("species_hi") for p in prices), "Expected Hindi names in species_hi"
        # Specifically: Rohu -> रोहू
        rohu = next((p for p in prices if p["species"].lower() == "rohu"), None)
        assert rohu is not None
        assert rohu["species_hi"] == "रोहू"


# ---------------- Feed ----------------
class TestFeed:
    def test_feed_juvenile(self, api):
        payload = {"fish_weight_g": 150, "num_fish": 500, "species": "rohu", "meals_per_day": 2}
        r = api.post(f"{BASE_URL}/api/feed/calculate", json=payload, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        assert d.get("stage") == "juvenile"
        assert "daily_feed_kg" in d and d["daily_feed_kg"] > 0
        assert "per_meal_kg" in d
        assert "feeding_rate_percent" in d
        # 500 * 150g = 75kg biomass; 4% rate = 3.0 kg/day
        assert abs(d["daily_feed_kg"] - 3.0) < 0.1, f"Unexpected daily_feed_kg: {d['daily_feed_kg']}"
        assert abs(d["per_meal_kg"] - 1.5) < 0.1

    def test_feed_invalid(self, api):
        r = api.post(
            f"{BASE_URL}/api/feed/calculate",
            json={"fish_weight_g": -5, "num_fish": 10},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is False
        assert d.get("error") == "invalid_input"


# ---------------- Diagnosis ----------------
class TestDiagnosis:
    def test_diag_low_oxygen(self, api):
        r = api.post(
            f"{BASE_URL}/api/diagnosis",
            json={"symptoms": "fish gasping at surface in morning", "language": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        titles = [m["title"] for m in d.get("matches", [])]
        assert any("Low Dissolved Oxygen" in t for t in titles), f"Got {titles}"

    def test_diag_white_spot(self, api):
        r = api.post(
            f"{BASE_URL}/api/diagnosis",
            json={"symptoms": "white spots on body", "language": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        titles = [m["title"] for m in r.json().get("matches", [])]
        assert any("White Spot" in t for t in titles), f"Got {titles}"

    def test_diag_marathi(self, api):
        r = api.post(
            f"{BASE_URL}/api/diagnosis",
            json={"symptoms": "माझ्या माशांवर लाल ठिपके आहेत", "language": "mr"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        titles = [m["title"] for m in r.json().get("matches", [])]
        assert any("Bacterial Ulcer" in t or "Aeromonas" in t for t in titles), f"Got {titles}"


# ---------------- FAQ ----------------
class TestFAQ:
    def test_faq_list_en(self, api):
        r = api.get(f"{BASE_URL}/api/faq", params={"language": "en"}, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        assert len(d["items"]) == 7


# ---------------- Unified Chat ----------------
class TestChat:
    def test_chat_weather_mumbai(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"message": "weather in Mumbai", "language": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "weather"
        assert d["card"]["type"] == "weather", f"Card: {d['card']}"
        assert d["card"].get("ok") is True
        assert d["card"]["location"]["name"].lower().startswith("mumbai")

    def test_chat_rain_nashik(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"message": "rain in Nashik", "language": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "weather"
        assert d["card"]["type"] == "weather"
        assert d["card"].get("ok") is True

    def test_chat_market_hindi(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"message": "कीमत", "language": "hi"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "market"
        assert d["card"]["type"] == "market"

    def test_chat_diagnosis_hindi(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"message": "मछली सतह पर आ रही है", "language": "hi"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "diagnosis"
        assert d["card"]["type"] == "diagnosis"
        assert len(d["card"].get("matches", [])) > 0

    def test_chat_market_marathi(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"message": "बाजारभाव", "language": "mr"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "market"
        assert d["language"] == "mr"

    def test_chat_feed_override(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={
                "intent_override": "feed",
                "feed_params": {"fish_weight_g": 100, "num_fish": 1000, "species": "rohu"},
                "language": "en",
            },
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "feed"
        assert d["card"]["type"] == "feed_result"
        assert "daily_feed_kg" in d["card"]

    def test_chat_faq(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"message": "pond pH", "language": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "faq"
        assert d["card"]["type"] == "faq"

    def test_chat_fallback(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"message": "random gibberish xyzabc", "language": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["intent"] == "faq"
        assert "reply" in d and len(d["reply"]) > 0


# ---------------- Chat history / persistence ----------------
class TestChatHistory:
    def test_multi_message_persistence(self, api):
        session_id = f"TEST_{uuid.uuid4()}"

        msgs = [
            {"message": "weather in Pune", "language": "en"},
            {"message": "pond pH", "language": "en"},
            {"message": "कीमत", "language": "hi"},
        ]
        for m in msgs:
            m["session_id"] = session_id
            r = api.post(f"{BASE_URL}/api/chat", json=m, timeout=TIMEOUT)
            assert r.status_code == 200
            assert r.json()["session_id"] == session_id

        # Retrieve persisted history
        r = api.get(f"{BASE_URL}/api/chat/history/{session_id}", timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        assert d["session_id"] == session_id
        assert len(d["messages"]) == 3
        intents = [m["intent"] for m in d["messages"]]
        assert "weather" in intents
        assert "faq" in intents
        assert "market" in intents
        # ensure no leaking _id
        for m in d["messages"]:
            assert "_id" not in m
