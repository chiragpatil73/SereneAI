from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Assessment, ChatSession, Intervention, MoodEntry, User
from . import intervention_service, stress_service

MOOD_SCORE = {"great": 5, "good": 4, "okay": 3, "low": 2, "stressed": 1}
LEVEL_SCORE = {"low": 1, "moderate": 2, "high": 3}
EMOTION_TO_MOOD_LABEL = {
    "calm": "Calm", "neutral": "Neutral", "stressed": "Stressed", "anxious": "Anxious",
    "overwhelmed": "Overwhelmed", "sad": "Low", "frustrated": "Frustrated",
}


def aware(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


def iso(dt: Optional[datetime]) -> Optional[str]:
    return aware(dt).isoformat().replace("+00:00", "Z") if dt else None


def _avg(values: list[float]) -> Optional[float]:
    return round(sum(values) / len(values), 2) if values else None


def analytics(db: Session, user: User, days: int = 7, tz_offset_minutes: int = 0) -> dict:
    offset = timedelta(minutes=max(-14 * 60, min(14 * 60, tz_offset_minutes)))
    today_local = (datetime.now(timezone.utc) + offset).date()
    first_day = today_local - timedelta(days=days - 1)
    start_utc = datetime.combine(first_day, time.min, tzinfo=timezone.utc) - offset

    def local_date(ts: datetime) -> date:
        return (aware(ts) + offset).date()

    buckets: dict[date, dict[str, list]] = {
        first_day + timedelta(days=i): {"mood": [], "stress": [], "ai": [], "checkins": 0} for i in range(days)
    }

    for e in db.scalars(select(MoodEntry).where(MoodEntry.user_id == user.id, MoodEntry.timestamp >= start_utc)):
        b = buckets.get(local_date(e.timestamp))
        if b is None:
            continue
        b["mood"].append(MOOD_SCORE.get(e.mood, 3))
        if e.stress_level in LEVEL_SCORE:
            b["stress"].append(LEVEL_SCORE[e.stress_level])
        b["checkins"] += 1

    sessions = db.scalars(select(ChatSession).where(ChatSession.user_id == user.id, ChatSession.started_at >= start_utc)).all()
    grounding_completed = 0
    for s in sessions:
        b = buckets.get(local_date(s.started_at))
        if b is not None and s.kind == "chat" and any(m.sender == "user" for m in s.messages):
            b["checkins"] += 1
        for a in s.assessments:
            ab = buckets.get(local_date(a.timestamp))
            if ab is not None:
                ab["ai"].append(LEVEL_SCORE.get(a.stress_level.lower(), 2))
        grounding_completed += sum(1 for i in s.interventions if i.completed and aware(i.timestamp) >= start_utc)

    series = []
    for d, b in buckets.items():
        series.append(
            {
                "date": d.isoformat(),
                "label": d.strftime("%a"),
                "mood_score": _avg(b["mood"]),
                "reported_stress": _avg(b["stress"]),
                "ai_stress": _avg(b["ai"]),
                "checkins": b["checkins"],
            }
        )
    return {
        "days": series,
        "grounding_completed": grounding_completed,
        "weekly_checkins": sum(b["checkins"] for b in buckets.values()),
    }


def helped_counts(db: Session, user_id: int) -> dict[str, int]:
    rows = db.execute(
        select(Intervention.type)
        .join(ChatSession, ChatSession.id == Intervention.session_id)
        .where(ChatSession.user_id == user_id, Intervention.feedback == "helped")
    ).all()
    counts: dict[str, int] = {}
    for (t,) in rows:
        counts[t] = counts.get(t, 0) + 1
    return counts


def dashboard_state(db: Session, user: User) -> dict:
    mood = db.scalars(select(MoodEntry).where(MoodEntry.user_id == user.id).order_by(MoodEntry.timestamp.desc()).limit(1)).first()
    assessment = db.scalars(
        select(Assessment)
        .join(ChatSession, ChatSession.id == Assessment.session_id)
        .where(ChatSession.user_id == user.id)
        .order_by(Assessment.timestamp.desc(), Assessment.id.desc())
        .limit(1)
    ).first()

    user_reported = (
        {
            "mood": mood.mood,
            "stress_level": mood.stress_level,
            "anxiety_level": mood.anxiety_level,
            "timestamp": iso(mood.timestamp),
        }
        if mood
        else None
    )

    ai_estimated = None
    suggestion = None
    if assessment:
        anxiety = stress_service.anxiety_level(assessment.anxiety_score)
        ai_estimated = {
            "emotion": assessment.emotion,
            "mood_label": EMOTION_TO_MOOD_LABEL.get(assessment.emotion, assessment.emotion.title()),
            "confidence": assessment.confidence,
            "stress_score": assessment.stress_score,
            "stress_level": assessment.stress_level,
            "anxiety_level": anxiety,
            "timestamp": iso(assessment.timestamp),
        }
        session = db.get(ChatSession, assessment.session_id)
        history = [{"type": i.type, "feedback": i.feedback} for i in (session.interventions if session else [])]
        rec = intervention_service.recommend(
            assessment.emotion, assessment.stress_level, history, helped_counts(db, user.id)
        )
        if rec:
            suggestion = {**rec, "source": "assessment"}
    if suggestion is None:
        suggestion = {**intervention_service.recommend(None, None), "source": "starter"}

    week = analytics(db, user, days=7)
    return {
        "user_reported": user_reported,
        "ai_estimated": ai_estimated,
        "suggestion": suggestion,
        "stats": {"weekly_checkins": week["weekly_checkins"], "grounding_completed": week["grounding_completed"]},
    }
