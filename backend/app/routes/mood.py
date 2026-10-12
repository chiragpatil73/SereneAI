from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import MoodEntry, User
from ..schemas.mood import MoodIn, MoodOut
from ..services import mood_service

router = APIRouter(prefix="/api", tags=["mood"])


@router.post("/mood", response_model=MoodOut, status_code=status.HTTP_201_CREATED)
def add_mood(payload: MoodIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MoodEntry:
    entry = MoodEntry(
        user_id=user.id, mood=payload.mood, stress_level=payload.stress_level,
        anxiety_level=payload.anxiety_level, note=payload.note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/mood", response_model=list[MoodOut])
def list_mood(user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = 100) -> list[MoodEntry]:
    return list(
        db.scalars(select(MoodEntry).where(MoodEntry.user_id == user.id).order_by(MoodEntry.timestamp.desc()).limit(min(limit, 500)))
    )


@router.delete("/mood/{entry_id}")
def delete_mood(entry_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    entry = db.get(MoodEntry, entry_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mood entry not found.")
    db.delete(entry)
    db.commit()
    return {"status": "deleted"}


@router.get("/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return mood_service.dashboard_state(db, user)


@router.get("/analytics")
def analytics(
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
    days: int = Query(default=7, ge=1, le=30), tz_offset_minutes: int = Query(default=0, ge=-840, le=840),
) -> dict:
    return mood_service.analytics(db, user, days=days, tz_offset_minutes=tz_offset_minutes)
