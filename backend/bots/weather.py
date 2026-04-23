"""
Live weather bot using Open-Meteo (free, no API key).
Docs: https://open-meteo.com/en/docs
Geocoding: https://geocoding-api.open-meteo.com/v1/search
"""
from __future__ import annotations

import requests
from datetime import datetime, timezone
from typing import Any

from .translate import t

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# WMO weather codes → human text. Kept concise.
WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
}


def _geocode(city: str) -> dict[str, Any] | None:
    params = {"name": city, "count": 1, "language": "en", "format": "json"}
    r = requests.get(GEOCODE_URL, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()
    results = data.get("results") or []
    if not results:
        return None
    top = results[0]
    return {
        "name": top.get("name"),
        "country": top.get("country"),
        "admin1": top.get("admin1"),
        "latitude": top.get("latitude"),
        "longitude": top.get("longitude"),
        "timezone": top.get("timezone", "Asia/Kolkata"),
    }


def get_live_weather(city: str, language: str = "en") -> dict[str, Any]:
    """Fetch LIVE weather from Open-Meteo. Returns a structured dict for the
    WeatherCard frontend component."""
    city = (city or "").strip()
    if not city:
        return {
            "ok": False,
            "error": "no_city",
            "message": t("ask_location", language),
        }

    try:
        geo = _geocode(city)
    except Exception as exc:
        return {"ok": False, "error": "geocode_failed", "message": str(exc)}

    if not geo:
        return {
            "ok": False,
            "error": "city_not_found",
            "message": t("city_not_found", language),
        }

    params = {
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "daily": "precipitation_probability_max,weather_code,temperature_2m_max,temperature_2m_min",
        "timezone": geo.get("timezone", "Asia/Kolkata"),
        "forecast_days": 3,
    }

    try:
        r = requests.get(FORECAST_URL, params=params, timeout=12)
        r.raise_for_status()
        data = r.json()
    except Exception as exc:
        return {"ok": False, "error": "weather_fetch_failed", "message": str(exc)}

    current = data.get("current", {}) or {}
    daily = data.get("daily", {}) or {}

    wcode = int(current.get("weather_code") or 0)
    condition = WEATHER_CODES.get(wcode, "Unknown")

    rain_prob = 0
    probs = daily.get("precipitation_probability_max") or []
    if probs:
        rain_prob = int(probs[0] or 0)

    heavy_rain = rain_prob >= 60 or wcode in (65, 82, 95, 96, 99)

    advisory_key = "heavy_rain" if heavy_rain else "no_rain"
    advisory = t(advisory_key, language)

    forecast = []
    dates = daily.get("time") or []
    for i, d in enumerate(dates[:3]):
        forecast.append(
            {
                "date": d,
                "t_max": (daily.get("temperature_2m_max") or [None])[i],
                "t_min": (daily.get("temperature_2m_min") or [None])[i],
                "rain_prob": (daily.get("precipitation_probability_max") or [None])[i],
                "code": (daily.get("weather_code") or [None])[i],
                "condition": WEATHER_CODES.get(
                    int((daily.get("weather_code") or [0])[i] or 0), "Unknown"
                ),
            }
        )

    return {
        "ok": True,
        "live": True,
        "source": "Open-Meteo",
        "location": {
            "name": geo["name"],
            "region": geo.get("admin1"),
            "country": geo.get("country"),
        },
        "current": {
            "temperature_c": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "precipitation_mm": current.get("precipitation"),
            "wind_kmh": current.get("wind_speed_10m"),
            "condition": condition,
            "code": wcode,
        },
        "today_rain_probability": rain_prob,
        "heavy_rain_alert": heavy_rain,
        "advisory": advisory,
        "forecast": forecast,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
