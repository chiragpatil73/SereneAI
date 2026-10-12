from __future__ import annotations

from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..ml.classifier import classifier
from ..models import User
from ..utils import countries

router = APIRouter(prefix="/api", tags=["meta"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "model_loaded": classifier.loaded or classifier.ensure_loaded()}


@router.get("/countries")
def list_countries() -> dict:
    return {"countries": countries.list_countries()}


@router.get("/emergency-info")
def my_emergency_info(user: User = Depends(get_current_user)) -> dict:
    return countries.get_emergency_info(user.country)
