# Matsyavan — Fisherman Assistant Bot · PRD

## Original Problem Statement
Final year engineering project: **Matsyavan – Fish Farming Monitoring System** with a unified chatbot **Fisherman Assistant Bot** featuring 5 sub-bots (Problem Diagnosis, Weather + Rain Alert, Feed Calculator, Market Price, FAQ). Requirement: **LIVE data** wherever possible (Open-Meteo mandatory, market prices live-try + CSV fallback). Keyword-based intent routing. Bonus: Hindi/Marathi + timestamps + alert-style warnings.

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`) + modular `bots/` package (intent, weather, market, feed, diagnosis, faq, translate)
- **Frontend**: React 19 + Tailwind + shadcn/ui chat UI at `/app/frontend/src/pages/{Landing,Chat}.jsx`
- **Database**: MongoDB (chat_messages collection for session history)
- **Data**: `/app/backend/data/fish_prices.csv` (10 species base prices)

## User Persona
Indian fish-farmer / aquaculture owner (pond, tank, cage). Mobile-first, calloused-hand tap targets, multilingual (EN/HI/MR), outdoor-glare-friendly contrast.

## Core Requirements (static)
- Unified chatbot with 5 intents routed by keyword classifier
- LIVE Open-Meteo weather (no key) with 3-day forecast + heavy-rain alert banner
- Near-live market prices (CSV + deterministic daily variance) with sell/hold advisory
- Feed calculator (weight × count × stage-based feeding rate × species multiplier)
- 9-rule symptom diagnosis with severity + remedies
- 7-item FAQ knowledge base
- Trilingual (EN/HI/MR) keyword matching + response translations
- Timestamped message bubbles, alert banners

## Implemented · 2026-02-23 (MVP)
- [x] All 8 backend endpoints: `/api/`, `/api/weather`, `/api/market/prices`, `/api/feed/calculate`, `/api/diagnosis`, `/api/faq`, `/api/chat`, `/api/chat/history/{id}`
- [x] Intent classifier with EN/HI/MR keywords (5 intents)
- [x] Open-Meteo geocoding + forecast (LIVE)
- [x] CSV market data with trend + sell advisory
- [x] Feed calculator (fry → adult stages, 8 species)
- [x] Rule-based diagnosis (9 diseases, severity, remedies, Hindi/Marathi keywords)
- [x] FAQ accordion (7 topics × 3 languages)
- [x] React chat UI: Landing hero + Chat page, quick-action chips, typing indicator, cards (Weather/Market/Feed/Diagnosis/FAQ)
- [x] Language toggle (EN/HI/मरा) with localStorage persistence
- [x] MongoDB chat history persistence per session_id
- [x] Testing agent: 21/21 backend tests passing (iteration_1.json)
- [x] Distinctive aquaculture-themed design (forest green + terracotta, Manrope + Work Sans fonts, bg-scales pattern)

## Prioritized Backlog

### P0 (next session)
- [ ] Add Alpha Vantage / AgMarkNet scraper for truly live mandi prices
- [ ] Voice input (speech-to-text) for low-literacy users
- [ ] Push notifications for heavy rain / disease outbreak alerts

### P1
- [ ] Pond WQ logging (pH, DO, ammonia history) with trend chart (recharts)
- [ ] Photo-based diagnosis via vision LLM (Gemini Nano Banana / Claude vision)
- [ ] Cycle planner: stocking → growth → harvest timeline
- [ ] Share-as-image feature for advisory cards (WhatsApp-ready)

### P2
- [ ] Offline mode (service worker) for remote pond sites
- [ ] SMS fallback via Twilio for farmers without smartphones
- [ ] Admin dashboard to update FAQ/market CSV

## Next Tasks
1. Ask user for feedback on theme, features
2. Pick from P0 backlog for iteration 2
