# SereneAI

**An Adaptive AI-Based Real-Time Grounding and Emotional Support System**

> Take a breath. You're not alone.

SereneAI is an AI-assisted emotional grounding and support **prototype**. It helps a person name a
broad emotional state, get a grounding exercise suited to it, adapt as they give feedback, and — if
their message suggests a potentially dangerous situation — get routed straight to human/medical help.

**SereneAI is not a doctor, therapist, psychiatrist, diagnostic tool, or emergency service, and it does
not replace professional care.**

---

## Table of contents

- [Overview](#overview)
- [Problem statement](#problem-statement)
- [Objectives](#objectives)
- [Features](#features)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [AI/ML architecture](#aiml-architecture)
- [Dataset](#dataset)
- [Emotion classifier](#emotion-classifier)
- [Safety engine](#safety-engine)
- [Intervention engine](#intervention-engine)
- [Database](#database)
- [API endpoints](#api-endpoints)
- [Installation](#installation)
- [Running locally](#running-locally)
- [Docker setup](#docker-setup)
- [Deployment](#deployment)
- [Testing](#testing)
- [Limitations](#limitations)
- [Ethical considerations](#ethical-considerations)
- [Future scope](#future-scope)
- [Disclaimer](#disclaimer)

---

## Overview

SereneAI follows one loop: **Detect → Understand → Ground → Adapt → Escalate.** A message is checked for
safety first, then classified into a broad emotion, given a non-clinical stress score, matched to a
grounding exercise, and answered with a templated supportive reply. Feedback on each exercise ("helped"
/ "didn't help") changes what's suggested next in that session.

## Problem statement

People often want a low-stakes way to name what they're feeling and get a short, concrete next step —
without waiting for an appointment, and without their data leaving their own infrastructure. Most
"AI wellness" demos lean on a paid third-party LLM API, which is a poor fit for a safety-sensitive,
self-hostable student project. SereneAI is built to run entirely on infrastructure the developer
controls, using transparent, inspectable local NLP/ML instead.

## Objectives

- Estimate a broad emotional state and a non-clinical stress level from free text, locally.
- Recommend a grounding exercise that adapts to the estimate and to in-session feedback.
- Detect, deterministically and *before* anything else runs, messages that suggest the user may be in
  immediate danger, and route those straight to an emergency pathway — never to a generated reply.
- Do all of this with **zero external AI API dependency**: no OpenAI/Gemini/Claude/Azure key, ever.
- Be explicit, everywhere in the UI and docs, about what SereneAI is not.

## Features

- Local NLP + TF-IDF/Logistic-Regression emotion classifier (7 classes) with a keyword-based fallback.
- Deterministic, rule-based Safety & Escalation Engine (self-harm, medical emergency, and general
  distress detection) that always runs first and can block the normal AI pipeline outright.
- Adaptive Intervention Engine: ranks grounding exercises by emotion/stress and reorders based on
  session feedback ("didn't help" → try something else; "helped" → offer to continue).
- Templated Response Engine: varied, non-repetitive supportive replies with **no LLM** involved.
- Real-time chat over WebSockets (`Listening... / Understanding... / Preparing your next step...`),
  with a REST fallback (`POST /api/chat/analyze`) if the socket can't connect.
- Mood tracker, 7-day analytics (mood journey, AI-estimated stress trend), and session history.
- Browser-only voice input (Web Speech API) and text-to-speech (SpeechSynthesis API) — no speech API key.
- Country-configurable emergency numbers (`backend/app/data/emergency_numbers.json`) — not hardcoded to
  one country.
- Privacy & Data page: export or delete your data, delete your account, at any time.
- JWT auth with Argon2 password hashing; per-endpoint rate limiting.

## Architecture

```text
                  INTERNET
                     │
                     ▼
              ┌─────────────┐
              │   VERCEL    │
              │ React/Vite  │
              └──────┬──────┘
                     │ HTTPS / WSS
                     ▼
              ┌─────────────┐
              │   RENDER    │
              │   FastAPI   │
              └──────┬──────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   PostgreSQL     ML Model    Safety Engine
                     │
                     ▼
               Response Engine
```

No external AI API exists anywhere in this architecture. Everything above the database line runs
inside the FastAPI process.

### Request pipeline

```text
User message
     ↓
Safety Engine  ──── EMERGENCY? ──yes──→  Emergency pathway (normal AI flow BLOCKED)
     │ no
     ↓
Emotion Classifier (TF-IDF + Logistic Regression, keyword fallback)
     ↓
Stress Estimator (0.00–1.00 → Low/Moderate/High)
     ↓
Adaptive Intervention Engine
     ↓
Response Engine (templates, no LLM)
     ↓
Reply + recommendation → user
```

## Technology stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS v4, React Router, Framer Motion, Recharts, Lucide React.

**Backend:** Python, FastAPI, Pydantic, SQLAlchemy 2, WebSockets, Uvicorn.

**AI/ML:** Python, scikit-learn (TF-IDF + Logistic Regression), NLTK (stemming), regex — all local.

**Database:** PostgreSQL (SQLite is also supported for local dev/tests via `DATABASE_URL`).

**Auth:** JWT (PyJWT) + Argon2 (`argon2-cffi`) password hashing.

**Deployment:** Vercel (frontend), Render/Railway (backend + Postgres), or `docker-compose` locally.

## AI/ML architecture

```text
User Message
     ↓
Text Preprocessing (contractions, tokenize, light stopword removal, Porter stemming)
     ↓
Safety Engine (deterministic; not an ML model)
     ↓
Emotion Classifier (TF-IDF 1–2 grams → Logistic Regression, keyword fallback)
     ↓
Stress Estimator (transparent weighted heuristic)
     ↓
Intervention Engine (ranked rules + session-feedback adjustment)
     ↓
Response Engine (template selection, avoids recent repeats)
     ↓
User Feedback → adjusts next Intervention Engine call in this session
```

## Dataset

`dataset/emotion_training.csv` (also produced by `dataset/build_dataset.py`) is a small, hand-written,
English-only demonstration dataset: 290 short sentences across 7 emotions (calm, neutral, stressed,
anxious, overwhelmed, sad, frustrated), roughly balanced (40–46 rows/class). It is written for a
college prototype and is **not clinically validated** and not representative of how real users write.

## Emotion classifier

Pipeline: CSV → stratified train/test split → TF-IDF (1–2 grams, stemmed tokens) → Logistic Regression
(`C=8`, balanced class weights) → evaluation → refit on all data → save with `joblib`.

Train it yourself:

```bash
cd backend
python -m app.ml.train --write-docs   # writes app/ml/model/*.pkl and docs/MODEL_EVALUATION.md
```

Latest run (see [`docs/MODEL_EVALUATION.md`](docs/MODEL_EVALUATION.md) for the full breakdown,
per-class metrics, and confusion matrix):

| Metric | Value |
|---|---|
| Hold-out accuracy | ~0.73 |
| Macro F1 | ~0.72 |
| 5-fold CV accuracy | ~0.75 ± 0.05 |

**The model is a proof-of-concept classifier trained on a small demonstration dataset and is not
clinically validated.** If the model can't be loaded (missing files, corrupt pickle, etc.), SereneAI
automatically retrains once from the CSV, and if that also fails it falls back to a deterministic
keyword classifier (`app/services/emotion_service.py`) rather than failing the request. The frontend
always labels this output **"AI-estimated"**, never as a diagnosis.

## Safety engine

`backend/app/services/safety_service.py` — deterministic and rule-based **on purpose**: it never calls
the ML model or any external service, and it always runs *before* anything else.

- **NORMAL** — nothing concerning detected.
- **ELEVATED** — distress language, worry about someone else, or milder physical symptoms; SereneAI
  stays supportive and surfaces support options (a helpline, a suggested exercise).
- **EMERGENCY** — the user themself may be in immediate danger. The normal AI pipeline (classifier,
  stress estimate, intervention, generated reply) is **skipped entirely**; the fixed Emergency UI is
  shown instead, with a country-configured emergency number and helpline.

Context guards reduce false positives without hiding real risk: third-person mentions ("my friend had
chest pain yesterday"), negation ("I would never hurt myself"), past tense, and common idioms ("dying
to see that movie") are all handled — see `tests/test_safety_engine.py` for the full behavioral spec.
The engine never outputs a method, dosage, or instructions, in any branch.

Emergency numbers are configurable per country in
[`backend/app/data/emergency_numbers.json`](backend/app/data/emergency_numbers.json) — edit that file
to add or correct a country, no code changes needed. India is not hardcoded as the only option.

## Intervention engine

`backend/app/services/intervention_service.py` ranks five grounding exercises (Paced Breathing,
5-4-3-2-1 Grounding, Sensory Grounding, Positive Reflection, Gentle Movement) by the current emotion and
stress level, then adjusts that ranking using this session's feedback history: an exercise the person
said "didn't help" is down-ranked or excluded; one that "helped" is offered again as a follow-up. If
everything sensible in a session has been rejected, it suggests pausing exercises and reaching out to a
person instead, rather than looping.

## Database

PostgreSQL, via SQLAlchemy models in `backend/app/models/__init__.py`:

`users`, `sessions`, `messages`, `assessments`, `interventions`, `mood_entries`, `safety_events` — as
specified in the project brief, with cascading deletes so removing a session or account removes its
associated data.

## API endpoints

All routes are under `/api` (see `/docs` for interactive OpenAPI docs once running).

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, get a JWT |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/users/me` | Update profile / trusted contact |
| POST | `/api/users/me/password` | Change password |
| GET | `/api/users/me/export` | Export all stored data (Privacy & Data) |
| DELETE | `/api/users/me` | Delete account and all data |
| POST | `/api/chat/analyze` | Run one message through the full pipeline (REST) |
| WS | `/ws/chat` | Same pipeline, real-time, with status frames |
| GET/POST/DELETE | `/api/sessions...` | List / fetch / end / delete chat sessions |
| GET | `/api/grounding/library` | List grounding exercises |
| POST | `/api/interventions` | Start a grounding exercise |
| PATCH | `/api/interventions/{id}` | Log completion/feedback, get the adapted next step |
| GET | `/api/history` | Past grounding sessions |
| POST/GET/DELETE | `/api/mood` | Log / list / delete mood entries |
| GET | `/api/dashboard` | Home screen state (current state + suggestion) |
| GET | `/api/analytics` | 7-day mood/stress series |
| GET | `/api/countries`, `/api/emergency-info` | Country-configurable emergency info |
| GET | `/api/health` | Liveness + model-loaded check |

## Installation

Requirements: Python 3.11+, Node 20+, PostgreSQL (or use the SQLite fallback for local dev).

# Backend
cd backend
python -m venv venv 
.venv\Script\activate
pip install -r requirements.txt
cp .env.example .env            # edit DATABASE_URL / JWT_SECRET as needed
python -m app.ml.train --write-docs   # train the local emotion model once

# Frontend
cd ../frontend
npm install
cp .env.example .env.development      # VITE_API_URL, defaults to http://localhost:8000
```
# Data Base
Download PostgreSQL
Port: 5432 ← keep this
then 
Open this SQL Shell
CREATE USER sereneai WITH PASSWORD 'sereneai';
CREATE DATABASE sereneai OWNER sereneai;
## Running locally

```bash
# Terminal 1 — backend (creates tables, seeds a demo account, trains the model if needed)
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open the printed Vite URL (typically `http://localhost:5173`). A demo account is seeded automatically
in non-production environments: `demo@sereneai.app` / `CalmDemo123!`.

Try the four documented demo scenarios (also exercised by the backend test suite):

1. *"I had a really stressful day."* → emotion **Stressed**, moderate stress, **Paced Breathing**.
2. *"My thoughts are racing and I feel overwhelmed."* → emotion **Overwhelmed**, high stress,
   **5-4-3-2-1 Grounding**.
3. Rate an exercise **"Didn't help"** → SereneAI offers a different exercise instead of repeating itself.
4. A message indicating a safety concern → normal AI reply is **blocked**; the Emergency screen and
   country emergency number are shown instead.

## Docker setup

```bash
docker compose up --build
```

This starts `postgres`, `backend` (FastAPI, trains its model at build time), and `frontend` (built and
served by nginx). No `.env` is required to try it — override `JWT_SECRET`, `CORS_ORIGINS`, or
`VITE_API_URL` via environment variables or a `.env` file next to `docker-compose.yml` for anything
beyond local evaluation.

## Deployment

- **Frontend:** deploy `frontend/` to Vercel; set `VITE_API_URL` to your backend's public URL.
- **Backend:** deploy `backend/` to Render or Railway; set `DATABASE_URL` (managed Postgres),
  `JWT_SECRET` (long random value), `ENVIRONMENT=production`, and `CORS_ORIGINS` to your frontend's
  origin. `SEED_DEMO` defaults to off in production.
- **Database:** any managed PostgreSQL instance.

No step in this deployment requires an AI API key of any kind.

## Testing

```bash
cd backend
pytest -q
```

35 tests, including the safety-rule suite from the project brief (`tests/test_safety_engine.py`):
normal / elevated / emergency phrase sets, the false-positive guard ("my friend had chest pain
yesterday" stays NORMAL), the third-party-worry case, and end-to-end pipeline tests confirming that an
emergency message returns **no** `ai_estimated` or `recommendation` and **does** return the Emergency UI
payload with a working country emergency number.

## Limitations

- Emotion classification is not clinically validated.
- The model is trained on a small, hand-written demonstration dataset (English only).
- Stress estimation is a transparent heuristic, not a medical measurement.
- SereneAI cannot diagnose mental-health conditions or physical symptoms.
- Safety detection is keyword/pattern-based; it **will** produce false positives and false negatives.
- Emergency situations require real human/medical intervention — SereneAI only routes toward it.
- This is an academic/prototype system, not a certified health product.

## Ethical considerations

- **Safety first, always.** The Safety Engine runs before the ML pipeline on every message and can
  block the AI response entirely; it never depends on model confidence.
- **No fabricated certainty.** Every AI output is labeled "AI-estimated," distinct from what the user
  reported themselves; "No assessment yet" is shown rather than a guess.
- **Data minimalism.** Only what's needed to personalize the experience is stored; users can export or
  delete their data, or their whole account, at any time (`/api/users/me/export`, `DELETE /api/users/me`).
- **No dark patterns in a crisis.** The Emergency screen leads with a real phone number and a real next
  step, not another chat turn.
- **Transparency about limits.** This README, the in-app Disclaimer component, and the model evaluation
  doc all say plainly what SereneAI is not.

## Future scope

- Larger, professionally reviewed and validated datasets.
- Multilingual NLP support.
- Improved on-device/local transformer models for emotion understanding.
- Wearable and heart-rate data integration.
- Clinician-reviewed intervention content library.
- Richer voice interaction and personalization.
- Privacy-preserving federated learning across deployments.
- Expanded, community-maintained regional crisis-resource configuration.

*(None of the above is implemented today — see [Features](#features) for what currently exists.)*

## Disclaimer

SereneAI is an AI-assisted emotional grounding and support **prototype**. It is not a doctor, therapist,
psychiatrist, diagnostic system, or emergency service, and does not replace professional medical or
mental-health care. If you or someone else may be in immediate danger, contact your local emergency
number right away.
