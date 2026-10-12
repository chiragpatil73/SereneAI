from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import Base, engine
from .ml.classifier import classifier
from .routes import auth, meta, mood, sessions, users, ws

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("sereneai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    if not classifier.ensure_loaded():
        log.warning("Emotion model unavailable at startup; keyword fallback will be used until trained.")
    if settings.seed_demo:
        from .seed import run as seed_demo

        seed_demo()
    yield


app = FastAPI(
    title="SereneAI API",
    description="Adaptive AI-based real-time grounding and emotional support system. "
    "All AI/ML runs locally; there is no external AI API.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.get("/")
def root() -> dict:
    return {"name": "SereneAI API", "status": "ok", "docs": "/docs"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(mood.router)
app.include_router(meta.router)
app.include_router(ws.router)
