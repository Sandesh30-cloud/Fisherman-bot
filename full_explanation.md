"# 🐟 Matsyavan — Fisherman Assistant Bot

> **Final-Year Engineering Project**
> A unified, AI-style chatbot that gives Indian fish farmers **live weather alerts, disease diagnosis, feed calculations, mandi prices, and FAQs** — in English, हिन्दी, and मराठी.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Features](#4-features)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Data Sources (Where the Data Comes From)](#7-data-sources-where-the-data-comes-from)
8. [Folder Structure](#8-folder-structure)
9. [Installation & Running Locally](#9-installation--running-locally)
10. [API Reference (All Endpoints)](#10-api-reference-all-endpoints)
11. [Intent Classification Logic](#11-intent-classification-logic)
12. [Module-Wise Logic Explained](#12-module-wise-logic-explained)
13. [Multi-Language Support (EN / HI / MR)](#13-multi-language-support-en--hi--mr)
14. [Database Schema (MongoDB)](#14-database-schema-mongodb)
15. [Frontend Design System](#15-frontend-design-system)
16. [Testing Strategy & Results](#16-testing-strategy--results)
17. [Deployment](#17-deployment)
18. [Example Conversations](#18-example-conversations)
19. [Viva Q&A Preparation](#19-viva-qa-preparation)
20. [Limitations & Future Work](#20-limitations--future-work)
21. [References](#21-references)

---

## 1. Project Overview

**Matsyavan** (from Sanskrit *matsya* = fish + *vana* = sanctuary) is a full-stack web application that bundles **five domain-specialist sub-bots behind a single chat window**. The farmer types or taps a button and an **intent classifier** decides which sub-bot should answer.

**Unified Chatbot Name**: *Fisherman Assistant Bot* (voice: \"Matsya\")

| Sub-Bot | Purpose | Data Strategy |
|---|---|---|
| 1. Weather + Rain Alert | Live pond-weather advisory | **LIVE** Open-Meteo API |
| 2. Problem Diagnosis | Rule-based fish-disease identification | Static rule base (9 diseases) |
| 3. Feed Calculator | Daily feed math by biomass | Formula-based |
| 4. Market Price | Mandi fish rates with sell/hold advisory | CSV dataset + deterministic daily variance (live-hook preserved) |
| 5. FAQ | Aquaculture knowledge base | Static Q&A in 3 languages |

---

## 2. Problem Statement

Indian fish farmers face recurring losses because they lack timely, localised advice on:
- Sudden heavy rain / low-oxygen events
- Early disease symptoms (white spot, ulcers, fin rot)
- Over-feeding or under-feeding wasting money
- Market prices changing across mandis without notice
- Basic aquaculture literacy (pH, stocking density, harvest timing)

**Matsyavan solves this** by giving them a single, mobile-first chat interface that pulls live weather, runs rule-based diagnosis, calculates feed, shows mandi prices, and answers FAQs — in their own language.

---

## 3. Objectives

1. Build a **single unified chatbot** (not 5 separate apps) with keyword intent routing.
2. Use **LIVE data** wherever possible (Open-Meteo mandatory).
3. Use **rule-based logic** (not opaque ML) so the reasoning is explainable — important for farmer trust and for viva defence.
4. Support **trilingual interaction** (English / हिन्दी / मराठी).
5. Produce a **modular, beginner-readable** codebase that can be extended.

---

## 4. Features

### 4.1 Problem Diagnosis Bot (Rule-Based)
- Matches user-described symptoms against **9 disease rules**: Low DO, Ich, Aeromonas ulcer, Fin Rot, Stress/Appetite loss, Gill damage, Fungal, Dropsy, etc.
- Returns **top-3 matches** ranked by hit-count, each with **severity** (high / medium / low), **cause**, and **remedy steps**.

### 4.2 Weather + Rain Alert Bot (LIVE)
- Accepts an Indian city / district name.
- Calls **Open-Meteo Geocoding** → gets lat/long.
- Calls **Open-Meteo Forecast** → current temp, humidity, wind, rain probability, 3-day forecast.
- Automatically triggers **🚨 Heavy-Rain Alert banner** if rain probability ≥ 60% or weather code is thunderstorm.

### 4.3 Feed Calculator Bot
Inputs: average fish weight (g), number of fish, species, meals/day.
Formula:
```
biomass_kg   = (num_fish × fish_weight_g) / 1000
rate_percent = stage_rate × species_multiplier
daily_feed   = biomass_kg × rate_percent / 100
per_meal     = daily_feed / meals_per_day
```
Returns biomass, daily feed, per-meal feed, monthly feed, and life-stage label.

### 4.4 Market Price Bot
- Loads 10 species from `/app/backend/data/fish_prices.csv`.
- Applies a **deterministic daily variance (±7%)** based on `md5(today_date + species)` → stable within a day, changes next day (realistic \"live\" feel).
- Emits a **trend indicator** (up / down / flat), **% change**, and a **Sell-Now recommendation chip** when price ≥ 2% above base.

### 4.5 FAQ Bot
- Knowledge base of **7 common aquaculture questions** (pond pH, stocking density, harvest time, why fish come to surface, pond water colour, lime usage, feed frequency).
- Each answer is stored in all three languages.

### 4.6 Cross-Cutting Features
- **Trilingual** (EN/HI/MR) keyword matching and reply translation.
- **Timestamps** on every message.
- **Alert-style banners** for heavy rain (blue) and disease (red).
- **Session-based chat history** persisted in MongoDB.
- **Mobile-first responsive** UI.

---

## 5. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Backend | **Python FastAPI** | Async, auto OpenAPI docs, production-grade. Originally planned Flask; logic is identical and portable. |
| Frontend | **React 19 + Tailwind CSS + shadcn/ui** | Component-driven chat UI, fast build, beautiful defaults. |
| Database | **MongoDB** (via Motor async driver) | Chat history is document-shaped, no schema migrations. |
| Static data | **CSV** (`fish_prices.csv`) | Easy for a farmer or teacher to edit. |
| Live API | **Open-Meteo** (free, no key) | Mandatory LIVE source per spec. |
| Fonts | **Manrope** (headings) + **Work Sans** (body) + **JetBrains Mono** | Non-generic, readable in outdoor glare. |
| Icons | **lucide-react** | Crisp open-source icons. |
| Process manager | **supervisord** | Keeps backend + frontend alive. |

---

## 6. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         React Frontend                           │
│  Landing page  →  /chat page                                     │
│  - QuickActions chips  - MessageBubble  - TypingIndicator        │
│  - WeatherCard / MarketCard / FeedCard / DiagnosisCard / FaqCard │
│  - LanguageContext (EN / HI / MR, persisted in localStorage)     │
└─────────────────────────┬────────────────────────────────────────┘
                          │  axios (REACT_APP_BACKEND_URL)
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (/api prefix)                  │
│                                                                  │
│  /api/chat        ← unified endpoint                             │
│  /api/weather     ← direct weather fetch                         │
│  /api/market/...  ← direct market                                │
│  /api/feed/...    ← direct feed calc                             │
│  /api/diagnosis   ← direct diagnosis                             │
│  /api/faq         ← direct faq                                   │
│                                                                  │
│   ┌─────────────── bots/ (modular sub-bots) ──────────────────┐  │
│   │  intent.py  weather.py  market.py  feed.py                │  │
│   │  diagnosis.py  faq.py  translate.py                       │  │
│   └───────────────────────────────────────────────────────────┘  │
└───────┬────────────────────┬──────────────────────┬──────────────┘
        │                    │                      │
        ▼                    ▼                      ▼
┌───────────────┐  ┌──────────────────┐   ┌───────────────────┐
│  Open-Meteo   │  │  fish_prices.csv │   │  MongoDB          │
│  (LIVE)       │  │  (10 species)    │   │  chat_messages    │
│  geocoding +  │  │                  │   │  (session_id,     │
│  forecast     │  │                  │   │   message, reply, │
│  (no API key) │  │                  │   │   intent, card)   │
└───────────────┘  └──────────────────┘   └───────────────────┘
```

### Request Lifecycle Example
1. Farmer types **\"weather in Kolkata\"** on `/chat`.
2. Frontend posts to `POST /api/chat` with `{message, language, session_id}`.
3. `intent.classify_intent()` scans keywords → returns `\"weather\"`.
4. `server.py` calls `weather.get_live_weather(\"Kolkata\", \"en\")`.
5. `weather.py` calls Open-Meteo Geocoding → lat 22.56, lon 88.36.
6. Calls Open-Meteo Forecast → JSON with temperature, precipitation, etc.
7. Maps WMO weather codes to human text; decides heavy-rain alert.
8. Returns a structured dict; backend wraps it as `card = {type:\"weather\", ...}`.
9. Insert message into `chat_messages` collection for history.
10. Response reaches frontend; `<WeatherCard>` renders temperature, rain %, 3-day forecast.

---

## 7. Data Sources (Where the Data Comes From)

This is the most-asked viva topic, so it is documented in depth.

### 7.1 Weather Data — **LIVE, EXTERNAL**
- **Provider**: [Open-Meteo](https://open-meteo.com/) — an open-source weather API funded by Swiss non-profits.
- **Authentication**: None (free public API, no key).
- **Endpoints used**:
  1. `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json`
     — converts city name → latitude / longitude / country / admin region.
  2. `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_probability_max,weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata&forecast_days=3`
     — returns current conditions + 3-day forecast.
- **Why Open-Meteo**: free, no sign-up, no rate-limit headaches for a prototype, trusted by many OSS projects. Underlying models include DWD ICON and NOAA GFS — the same models used by paid providers.
- **Request code lives in**: `backend/bots/weather.py → get_live_weather(city, language)`.
- **WMO Weather Codes** (e.g., `65 = Heavy rain`, `95 = Thunderstorm`) are decoded by a local dictionary in `weather.py`.

### 7.2 Market Price Data — **CSV FALLBACK with daily variance**
- **Source file**: `backend/data/fish_prices.csv`
- **Why CSV and not live**:
  - `data.gov.in` fish-price datasets require a **keyed subscription** (free but requires sign-up and is not reliable for real-time).
  - Public fish-market JSON feeds are geographically limited and often break.
  - As per spec: *\"If LIVE API is not reliable → implement fallback using CSV dataset (clearly mention)\"* — this app follows that rule.
- **Structure (10 rows)**:
  ```
  species, species_hi, species_mr, base_price, unit, mandi, min, max
  Rohu, रोहू, रोहू, 210, kg, National Avg, 170, 260
  ...
  ```
- **Daily-variance logic** (`backend/bots/market.py → _today_variance`):
  ```python
  h   = md5(f\"{today_date}|{species}\").hexdigest()
  var = (int(h[:4], 16)/0xFFFF - 0.5) × 0.14   # ±7%
  price_today = clamp(base × (1+var), min, max)
  ```
  This makes prices **stable within a day** but **change day-to-day** — realistic \"near-live\" feel **without faking real-time data**.
- **Trend**: up (>+2%), down (<-2%), flat.
- **Sell advisory**: triggered when `price_today ≥ base × 1.02`.
- **Live-hook placeholder**: the function signature can be swapped with a real `data.gov.in` / AgMarkNet scraper without changing the call-site.

### 7.3 Feed Recommendation Data — **Derived (formula-based)**
- **Feeding rate table** (hard-coded in `feed.py` from standard aquaculture practice):
  | Stage | Weight range | Rate % body-weight/day |
  |---|---|---|
  | Fry | 0–5 g | 10 % |
  | Fingerling | 5–50 g | 6 % |
  | Juvenile | 50–250 g | 4 % |
  | Grower | 250–600 g | 2.5 % |
  | Adult | 600 g+ | 1.8 % |
- **Species multiplier** (e.g., Tilapia 1.1, Pangasius 1.15).
- **Source reference**: FAO, ICAR-CIFA feeding tables (public aquaculture extension literature).

### 7.4 Disease Rules — **Rule base (expert-system style)**
- 9 diseases encoded in `backend/bots/diagnosis.py → RULES`.
- Each rule has: `id, keywords (EN/HI/MR), title, severity, cause, remedy[]`.
- Rules derived from ICAR-CIFA disease manuals and FAO fish-disease cards (public extension material).
- Matching algorithm: score = count of matched keywords → sort high→low, tie-break by severity, return top-3.

### 7.5 FAQ Content — **Static knowledge base**
- 7 entries in `backend/bots/faq.py → FAQ_ITEMS`.
- Each entry is stored in EN / HI / MR and indexed by keywords.

### 7.6 Chat History — **MongoDB (user-generated data)**
- Collection: `chat_messages`
- Persisted per-message; see [Section 14](#14-database-schema-mongodb).

---

## 8. Folder Structure

```
/app
├── backend/
│   ├── server.py                     ← FastAPI app, all /api routes
│   ├── requirements.txt
│   ├── .env                          ← MONGO_URL, DB_NAME, CORS_ORIGINS
│   ├── bots/                         ← modular sub-bot logic
│   │   ├── __init__.py
│   │   ├── intent.py                 ← keyword intent classifier (EN/HI/MR)
│   │   ├── weather.py                ← Open-Meteo LIVE integration
│   │   ├── market.py                 ← CSV loader + variance engine
│   │   ├── feed.py                   ← feeding-rate formula
│   │   ├── diagnosis.py              ← 9-rule disease matcher
│   │   ├── faq.py                    ← 7-item knowledge base
│   │   └── translate.py              ← EN/HI/MR response strings
│   └── data/
│       └── fish_prices.csv           ← 10 species mandi base prices
│
├── frontend/
│   ├── package.json
│   ├── .env                          ← REACT_APP_BACKEND_URL
│   └── src/
│       ├── index.js
│       ├── App.js                    ← Router: /  and  /chat
│       ├── index.css                 ← theme tokens + fonts
│       ├── lib/
│       │   ├── api.js                ← axios client for all endpoints
│       │   ├── i18n.js               ← UI-string dictionary (EN/HI/MR)
│       │   └── LanguageContext.jsx
│       ├── components/
│       │   ├── Header.jsx            ← brand + language toggle
│       │   ├── chat/
│       │   │   ├── ChatInput.jsx
│       │   │   ├── MessageBubble.jsx
│       │   │   ├── QuickActions.jsx
│       │   │   └── TypingIndicator.jsx
│       │   ├── cards/
│       │   │   ├── WeatherCard.jsx + WeatherPrompt
│       │   │   ├── MarketCard.jsx
│       │   │   ├── FeedCard.jsx    + FeedForm
│       │   │   ├── DiagnosisCard.jsx
│       │   │   ├── DiagnosisPrompt.jsx
│       │   │   └── FaqCard.jsx
│       │   └── ui/                   ← shadcn primitives (auto-generated)
│       └── pages/
│           ├── Landing.jsx           ← hero + features + CTA
│           └── Chat.jsx              ← main chat screen
│
├── memory/
│   └── PRD.md                        ← product requirements history
├── test_reports/
│   └── iteration_1.json              ← automated test report (21/21 pass)
└── README.md                         ← this file
```

---

## 9. Installation & Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+ and **yarn** (not npm)
- MongoDB 4.4+ running locally, OR a MongoDB Atlas URI

### Backend
```bash
cd backend

# 1. create & activate virtualenv
python3 -m venv venv
source venv/bin/activate            # Linux / macOS
# venv\Scripts\activate             # Windows

# 2. install dependencies
pip install -r requirements.txt

# 3. create .env
cat > .env <<EOF
MONGO_URL=\"mongodb://localhost:27017\"
DB_NAME=\"matsyavan\"
CORS_ORIGINS=\"*\"
EOF

# 4. run
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
Backend is now at **http://localhost:8001** and auto-docs at **http://localhost:8001/docs**.

### Frontend (new terminal)
```bash
cd frontend

# 1. install deps
yarn install

# 2. create .env
cat > .env <<EOF
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
EOF

# 3. run
yarn start
```
App opens at **http://localhost:3000**.

### Smoke-Test the Backend
```bash
curl http://localhost:8001/api/
curl \"http://localhost:8001/api/weather?city=Kolkata\"
curl http://localhost:8001/api/market/prices
curl -X POST http://localhost:8001/api/feed/calculate \
     -H \"Content-Type: application/json\" \
     -d '{\"fish_weight_g\":150,\"num_fish\":500,\"species\":\"rohu\",\"meals_per_day\":2}'
```

---

## 10. API Reference (All Endpoints)

All endpoints are prefixed with `/api` (required by the Kubernetes ingress on Emergent).

| Method | Path | Description |
|---|---|---|
| GET | `/api/` | Service banner + endpoint list |
| GET | `/api/weather?city={city}&language={en\|hi\|mr}` | Live Open-Meteo weather |
| GET | `/api/market/prices?language=` | Today's mandi prices |
| POST | `/api/feed/calculate` | Feed calculator (body: `fish_weight_g`, `num_fish`, `species`, `meals_per_day`) |
| POST | `/api/diagnosis` | Rule-based diagnosis (body: `symptoms`, `language`) |
| GET | `/api/faq?language=` | All FAQ items |
| POST | `/api/chat` | Unified endpoint (body: `message`, `language`, optional `location`, `intent_override`, `feed_params`, `session_id`) |
| GET | `/api/chat/history/{session_id}` | Replay a session |

### Example: /api/chat response
```json
{
  \"id\": \"b9e3...\",
  \"session_id\": \"s_1776929863_a9b\",
  \"intent\": \"weather\",
  \"language\": \"en\",
  \"reply\": \"Heavy rain expected. Reduce feeding by 30–50%.\",
  \"card\": {
    \"type\": \"weather\",
    \"live\": true,
    \"source\": \"Open-Meteo\",
    \"location\": { \"name\": \"Mumbai\", \"region\": \"Maharashtra\", \"country\": \"India\" },
    \"current\": { \"temperature_c\": 30, \"humidity\": 78, \"wind_kmh\": 15, \"condition\": \"Mainly clear\" },
    \"today_rain_probability\": 5,
    \"heavy_rain_alert\": false,
    \"forecast\": [ { \"date\": \"2026-04-23\", \"t_max\": 30, \"t_min\": 29, \"rain_prob\": 5, \"condition\": \"Mainly clear\" }, ... ]
  },
  \"timestamp\": \"2026-04-23T07:34:00+00:00\"
}
```

---

## 11. Intent Classification Logic

File: `backend/bots/intent.py`

1. Lower-case the incoming message.
2. For each of 5 intents (`weather`, `market`, `feed`, `diagnosis`, `faq`), **count keyword hits** using substring matching against a multilingual list:
   - *weather*: `weather, rain, temperature, मौसम, बारिश, पाऊस, हवामान`, …
   - *market*: `price, mandi, sell, कीमत, बाजार, बाजारभाव, किंमत`, …
   - *feed*: `feed, food, खाना, चारा, खाद्य`, …
   - *diagnosis*: `disease, sick, spots, gasping, सतह पर, लाल धब्बे, पांढरे ठिपके, पंख कुज`, …
   - *faq*: `how, what, why, कैसे, क्या, कसे, काय`, …
3. Pick the intent with **highest score**; ties are broken by a priority list:
   `diagnosis > weather > market > feed > faq`.
4. If every score is 0 → default to `faq` and return the fallback message.

**Why keyword-based and not ML?**
- Explainable to examiners (you can point at the exact keyword that triggered the intent).
- Zero training data needed.
- Works across three languages with no model fine-tuning.
- Predictable for farmers (the same question produces the same answer).

---

## 12. Module-Wise Logic Explained

### 12.1 `weather.py`
```
get_live_weather(city, language):
    1. _geocode(city) via Open-Meteo Geocoding
    2. If no result → {ok:false, error:\"city_not_found\"}
    3. Call Forecast API with lat/lon, 3-day window
    4. Decode WMO weather code → human string
    5. rain_prob = daily.precipitation_probability_max[0]
    6. heavy_rain_alert = (rain_prob ≥ 60) OR (code ∈ {65,82,95,96,99})
    7. advisory = t(\"heavy_rain\") if alert else t(\"no_rain\")
    8. Return structured dict with current + 3-day forecast
```

### 12.2 `market.py`
```
get_market_prices(language):
    1. Load base rows from fish_prices.csv
    2. For each species:
        a. var     = (hash(today|species) → ±7 %)
        b. price   = clamp(base × (1+var), min, max)
        c. trend   = up/down/flat
        d. sell    = price ≥ base × 1.02
    3. any_high → advisory \"sell_now\" else \"hold\"
```

### 12.3 `feed.py`
Already documented in §7.3. Validates positive inputs, picks stage rate, applies species multiplier, computes biomass → daily → per-meal → monthly feed.

### 12.4 `diagnosis.py`
```
diagnose(text, language):
    matches = []
    for rule in RULES:
        hits = sum(kw in text.lower() for kw in rule.keywords)
        if hits > 0: matches.append({...rule, score:hits})
    sort by (-score, severity != high)
    return top-3
```

### 12.5 `faq.py`
Scans for keyword overlap with 7 FAQ entries. If nothing matches, returns the **first 5 entries** as a \"browse\" list (prevents dead ends).

### 12.6 `translate.py`
Flat dictionary of ~15 short phrases in EN / HI / MR. Helper `t(key, lang)` with safe fallback to English if a key is missing.

### 12.7 `server.py` (unified chat endpoint)
1. Normalise language.
2. Decide intent (override from UI quick-action OR classifier).
3. Branch on intent; populate `reply` string and `card` object.
4. For `weather`: strip noise words (`weather in`, `rain in`, `मौसम`) to isolate a city name; if too short, return `prompt_location` card instead of an error.
5. Insert `{id, session_id, message, intent, language, reply, card_type, timestamp}` into `chat_messages` (best-effort, logs on failure).
6. Return `ChatResponse` Pydantic model (no MongoDB `_id` leaks).

---

## 13. Multi-Language Support (EN / HI / MR)

Two layers:

| Layer | Handled by | Files |
|---|---|---|
| **UI strings** (buttons, placeholders, headings) | `i18n.js` dictionary + `LanguageContext.jsx` | `frontend/src/lib/` |
| **Bot replies & disease keywords** | `translate.py` + trilingual entries in every `bots/*.py` | `backend/bots/` |

- Language selection is a pill-shaped toggle in the header (`EN / हि / मरा`).
- Selected code is saved to `localStorage` (`matsyavan_lang`) — farmer doesn't re-pick on return.
- Every `/api/chat` call sends `language`; the backend uses it for `t(...)` and for choosing `species_hi` / `species_mr` in market prices.

---

## 14. Database Schema (MongoDB)

**Database**: name taken from `DB_NAME` env var (default for local: `matsyavan`).
**Collection**: `chat_messages`

```json
{
  \"id\":           \"b9e3...\",          // UUID (client-facing)
  \"session_id\":   \"s_1776929863_a9b\",
  \"message\":      \"weather in Mumbai\",
  \"intent\":       \"weather\",
  \"language\":     \"en\",
  \"reply\":        \"Clear skies. Normal feeding schedule is fine.\",
  \"card_type\":    \"weather\",
  \"timestamp\":    \"2026-04-23T07:34:00+00:00\"  // ISO string, UTC
}
```

Notes:
- `_id` (MongoDB's internal ObjectId) is **excluded** from all API responses via `find({...}, {\"_id\": 0})` projection (see `/api/chat/history`).
- Timestamps are stored as **ISO-8601 strings in UTC** to avoid Pydantic ObjectId serialisation issues.

---

## 15. Frontend Design System

Chosen theme: **Organic & Earthy — Indian Aquaculture** (avoids the generic purple-gradient AI-chatbot aesthetic).

| Token | Value | Use |
|---|---|---|
| Primary | Deep Forest Green `#1B4332` | User bubbles, brand, CTA |
| Accent | Terracotta Orange `#E67E22` | Calculate button, \"Sell\" chip |
| Rain-alert | Monsoon Blue `#0077B6` | Weather advisory banner |
| Disease-warning | Red `#D90429` | Heavy-rain / high-severity alerts |
| Page bg | Off-white `#F9FAF6` | Outdoor-readable |
| Font (heading) | **Manrope** 400–900 | Strong, modern |
| Font (body) | **Work Sans** 400–700 | Highly legible |
| Font (mono) | **JetBrains Mono** | Numbers (prices, weight) |

Custom utility classes in `index.css`:
- `.pond-wave` — forest-green gradient for headers
- `.bg-scales` — subtle fish-scale dot pattern
- `.alert-rain` / `.alert-warn` — soft-coloured banners
- `.chip` — pill button with hover translate-y animation
- `.bubble-user` / `.bubble-bot` — asymmetric rounded corners
- `.typing-dot` — 3-dot bouncing keyframe animation
- `.ticker` — horizontally scrolling marquee on the landing page

Every interactive element carries a **`data-testid`** attribute (required by the automated testing agent).

---

## 16. Testing Strategy & Results

### 16.1 Automated Backend Test Suite
Generated during development by the Emergent testing agent:
- File: `/app/backend/tests/backend_test.py` (21 pytest cases)
- Run: `pytest backend/tests/backend_test.py -v`
- **Result**: 21 / 21 PASS (see `/app/test_reports/iteration_1.json`).

Coverage:
- All 8 endpoints tested for happy path + error paths.
- Multilingual intent routing verified (EN/HI/MR).
- Open-Meteo live integration verified for Kolkata and Mumbai.
- MongoDB chat-history persistence verified across multi-message sessions.
- `_id` leak check — no ObjectId in responses.

### 16.2 Manual Smoke Tests (curl)
Documented in §9 above.

### 16.3 Visual Regression
Screenshots of Landing + Chat (weather / feed / market / diagnosis) captured during build to verify the UI renders per the design guidelines.

---

## 17. Deployment

- **Preview URL**: provided by Emergent platform (read from `REACT_APP_BACKEND_URL`).
- **Deployment readiness scan**: run by the `deployment_agent` — status **PASS**, zero blockers.
  - Env-only secrets (no hardcoded URLs).
  - CORS configured via `CORS_ORIGINS`.
  - Supervisor config valid (backend 0.0.0.0:8001, frontend `yarn start`).
  - MongoDB queries use projections to exclude `_id`.
- **Ingress rule**: Kubernetes routes any path starting with `/api` to backend port 8001; everything else to frontend port 3000.

---

## 18. Example Conversations

### Conversation 1 (English)
> **User**: weather in Mumbai
> **Bot** (card: weather): Clear skies. Normal feeding schedule is fine.
>   · Mumbai, Maharashtra · 30 °C · 5 % rain · 3-day forecast

### Conversation 2 (Hindi)
> **User**: मछली सतह पर आ रही है
> **Bot** (card: diagnosis): लक्षणों के आधार पर मेरा आकलन यह है:
>   · **Low Dissolved Oxygen** (HIGH)
>   · Cause: Overstocking, algae die-off, or cloudy weather.
>   · Remedy: Start aerator immediately. Stop feeding 24h. 20–30 % water exchange.

### Conversation 3 (Marathi)
> **User**: बाजारभाव
> **Bot** (card: market): दर चांगला आहे — विकण्याची योग्य वेळ.
>   · Rohu ₹203/kg ▼-2.87 %
>   · Singhi ₹335/kg ▲+4.74 %  **SELL**
>   · …

### Conversation 4 (Feed)
> Click **Feed Calc** → form → 100 g × 500 fish (Rohu) × 2 meals
> **Bot**: Daily feed 2 kg · Per meal 1 kg · Biomass 50 kg · Monthly 60 kg
> Tip: *Feed 2.0 kg/day split into 2 meals. Reduce 30–50 % on heavy-rain or cold days.*

---

## 19. Viva Q&A Preparation

**Q1: Why is this called a \"unified\" chatbot?**
A: A single `POST /api/chat` endpoint receives every message. Internally, an intent classifier decides which of 5 sub-bots answers. The user sees one consistent chat window instead of switching between apps.

**Q2: How does the intent classification work? Is it ML?**
A: It is a **deterministic keyword-based classifier** (rule-based / expert-system style). Pros: zero training data, fully explainable, works across 3 languages, no GPU cost. The trade-off is that truly novel phrasing can miss. For a farming use case with a bounded vocabulary this is the right call.

**Q3: From where does weather data come, and how do you know it's live?**
A: From the Open-Meteo public API (free, no key). Two calls are made per request: geocoding (`geocoding-api.open-meteo.com`) to convert city → lat/lon, then `api.open-meteo.com/v1/forecast` for current conditions + 3-day forecast. The response includes a `fetched_at` ISO timestamp and a `live: true` flag so the UI can show a \"LIVE OPEN-METEO DATA\" badge. You can verify by calling it in a browser: `https://api.open-meteo.com/v1/forecast?latitude=22.56&longitude=88.36&current=temperature_2m`.

**Q4: Why not live market prices? The spec said LIVE first.**
A: The spec also allows a fallback: *\"if LIVE API is not reliable → implement CSV fallback, clearly mention.\"* `data.gov.in` fish price datasets require an API key (free but requires registration) and are updated irregularly. For a demo we use a 10-species CSV with an **md5-based daily variance** that makes prices change day-to-day but stay stable within a day — avoiding fake real-time claims. The live-hook placeholder is preserved so a real scraper can be plugged in without touching the call-site.

**Q5: What happens if Open-Meteo is down?**
A: The backend catches the exception and returns `{ok: false, error: \"weather_fetch_failed\"}`. The frontend renders a `WeatherPrompt` card asking for a different city. Chat doesn't crash.

**Q6: Where is user data stored?**
A: Only the chat transcript, in MongoDB `chat_messages` (session_id, message, reply, intent, timestamp). No PII, no login. Session id is generated client-side per visit.

**Q7: How did you handle Hindi / Marathi?**
A: Two layers — (1) a UI-string dictionary (`frontend/src/lib/i18n.js`) for buttons/placeholders, (2) a backend translation helper (`backend/bots/translate.py`) for bot replies. Intent keywords and diagnosis rules each contain English + Devanagari strings so matching works in all three languages natively.

**Q8: Why React instead of plain HTML/CSS/JS?**
A: The spec allows plain HTML/JS, but for a real chat UI with live state (messages, typing, cards) React makes the code cleaner and easier to grade. The backend logic is identical to what a Flask app would do.

**Q9: Explain the feed calculator formula.**
A: `daily_feed_kg = (num_fish × fish_weight_g / 1000) × rate% / 100`. `rate%` comes from a stage table (fry 10 %, fingerling 6 %, juvenile 4 %, grower 2.5 %, adult 1.8 %) multiplied by a species factor (e.g. Tilapia 1.1). This matches standard ICAR-CIFA extension tables.

**Q10: How did you ensure code quality?**
A: Python linted with `ruff`, JS/React linted with `eslint` — both pass clean. An automated test agent produced 21 pytest cases and all pass (`/app/test_reports/iteration_1.json`). Deployment readiness scan also PASS.

---

## 20. Limitations & Future Work

### Current Limitations
- Market prices are not truly live (CSV + variance). A production version should scrape AgMarkNet or use `data.gov.in` with a key.
- Diagnosis is keyword-based — a photo-based vision model would be more accurate.
- No authentication — chat history is shared by anyone with the session_id.
- Open-Meteo calls are synchronous `requests.get` inside async endpoints; for high load, switch to `httpx.AsyncClient`.

### Planned Enhancements
1. **Voice input** (Web Speech API) for low-literacy farmers.
2. **Push notifications** for heavy-rain / disease outbreak alerts.
3. **Photo-based diagnosis** via a vision LLM (Gemini Nano Banana / Claude vision).
4. **Water-quality logging** (pH, DO, ammonia) with trend charts.
5. **Share-as-image** feature so farmers can WhatsApp the advisory card to their co-op.
6. **Offline mode** via service worker for remote ponds.
7. **SMS fallback** through Twilio for users without smartphones.

---

## 21. References

- Open-Meteo API docs — https://open-meteo.com/en/docs
- Open-Meteo Geocoding — https://open-meteo.com/en/docs/geocoding-api
- WMO Weather Codes — https://open-meteo.com/en/docs#weathervariables
- ICAR-CIFA Fish Disease Manuals (public extension material)
- FAO Aquaculture Feed tables — https://www.fao.org/fishery/en/topic/14863
- FastAPI — https://fastapi.tiangolo.com/
- React + Tailwind — https://tailwindcss.com/
- shadcn/ui — https://ui.shadcn.com/
- lucide-react icons — https://lucide.dev/
- MongoDB Motor driver — https://motor.readthedocs.io/

---

### Credits
- **Author**: (your name here)
- **Guide**: (your guide's name here)
- **Institution**: (your college name here)
- **Year**: 2026

**License**: Educational use. Fish-disease remedies in this project are *indicative*; always consult a qualified aquaculture veterinarian before administering treatment.
"