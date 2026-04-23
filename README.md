# Matsyavan — Fisherman Assistant Bot

This repo contains:

- **Backend**: FastAPI (`Fisherman-bot/backend`) running on `http://localhost:8000`
- **Frontend**: React (CRACO) (`Fisherman-bot/frontend`) running on `http://localhost:3000`
- **Database**: MongoDB (optional but recommended) on `mongodb://localhost:27017`

---

## Prerequisites

- **Node.js**: 18+ recommended (React scripts tooling can be flaky on very new Node versions)
- **Python**: 3.11+ recommended
- **MongoDB**: Community edition (optional; without it chat history won’t persist)

---

## Run the Backend (FastAPI)

From the project root:

```bash
cd "Fisherman-bot/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:

- `http://localhost:8000/api` (API root)
- `http://localhost:8000/docs` (Swagger UI)

### Backend environment variables

Backend reads `Fisherman-bot/backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="matsyavan"
CORS_ORIGINS="*"
```

If MongoDB is **not running**, the backend will still reply, but it will log warnings and chat persistence/history will be disabled.

---

## Run MongoDB (Optional)

If you want persistence, start MongoDB locally. Common options:

- Install MongoDB and run it as a service (recommended)
- Or run via Docker:

```bash
docker run --name matsyavan-mongo -p 27017:27017 -d mongo:7
```

---

## Run the Frontend (React + CRACO)

In a new terminal:

```bash
cd "Fisherman-bot/frontend"
npm install --legacy-peer-deps
REACT_APP_BACKEND_URL="http://localhost:8000" npm start
```

Open:

- `http://localhost:3000`

### Why `--legacy-peer-deps`?

This frontend’s dependency tree can conflict (example: `react-day-picker` vs `date-fns`). Using `--legacy-peer-deps` makes npm behave like older npm versions and install successfully.

---

## Common Issues

### 1) `zsh: command not found: yarn`

This project can be run with **npm** (no Yarn required). Use the frontend commands above.

### 2) `Cannot find module 'ajv/dist/compile/codegen'`

If this happens, reinstall deps and ensure `ajv` is present:

```bash
cd "Fisherman-bot/frontend"
npm install --legacy-peer-deps
npm install --legacy-peer-deps ajv@^8 ajv-keywords@^5
```

### 3) Backend: `Chat persistence failed: localhost:27017 ... Connection refused`

MongoDB isn’t running. Start MongoDB (see above) or ignore if you don’t need persistence.

### 4) Backend: `Address already in use`

Port `8000` is already taken. Stop the old process or run on a different port:

```bash
uvicorn server:app --reload --port 8001
```

Then start frontend with:

```bash
REACT_APP_BACKEND_URL="http://localhost:8001" npm start
```

---

## Quick “Run Everything” (2 terminals)

**Terminal A (backend):**

```bash
cd "Fisherman-bot/backend"
source .venv/bin/activate 2>/dev/null || true
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal B (frontend):**

```bash
cd "Fisherman-bot/frontend"
REACT_APP_BACKEND_URL="http://localhost:8000" npm start
```
