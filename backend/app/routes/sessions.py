from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import ChatSession, Intervention, Message, SafetyEvent, User, utcnow
from ..schemas.session import (
    AnalyzeIn, InterventionOut, InterventionStart, InterventionUpdate, SessionDetail, SessionOut,
)
from ..services import intervention_service, mood_service, pipeline, response_engine, safety_service
from ..utils.ratelimit import RateLimiter, limit_requests

router = APIRouter(prefix="/api", tags=["sessions"])
_analyze_limiter = RateLimiter(limit=30, window_seconds=60)


@router.post("/chat/analyze", dependencies=[Depends(limit_requests(_analyze_limiter, "analyze"))])
def analyze(payload: AnalyzeIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    try:
        session = pipeline.get_or_create_session(db, user, payload.session_id, kind="chat")
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    try:
        return pipeline.process_message(
            db, user=user, session=session, text=payload.message, user_reported_stress=payload.user_reported_stress
        )
    except pipeline.InvalidInput as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/sessions", response_model=list[SessionOut])
def list_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ChatSession]:
    return list(
        db.scalars(select(ChatSession).where(ChatSession.user_id == user.id).order_by(ChatSession.started_at.desc()).limit(100))
    )


@router.get("/sessions/{session_id}", response_model=SessionDetail)
def get_session(session_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ChatSession:
    session = db.get(ChatSession, session_id)
    if session is None or session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    return session


@router.post("/sessions/{session_id}/end", response_model=SessionOut)
def end_session(session_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ChatSession:
    session = db.get(ChatSession, session_id)
    if session is None or session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    session.status = "ended"
    session.ended_at = utcnow()
    db.commit()
    db.refresh(session)
    return session


@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    session = db.get(ChatSession, session_id)
    if session is None or session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    db.delete(session)
    db.commit()
    return {"status": "deleted"}


@router.get("/grounding/library")
def grounding_library() -> dict:
    return {"exercises": intervention_service.catalog()}


@router.post("/interventions", response_model=InterventionOut, status_code=status.HTTP_201_CREATED)
def start_intervention(payload: InterventionStart, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Intervention:
    if payload.type not in intervention_service.INTERVENTIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown exercise type.")
    try:
        session = pipeline.get_or_create_session(db, user, payload.session_id, kind="grounding")
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    intervention = Intervention(session_id=session.id, type=payload.type)
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return intervention


@router.patch("/interventions/{intervention_id}")
def update_intervention(
    intervention_id: int, payload: InterventionUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    intervention = db.get(Intervention, intervention_id)
    if intervention is None or intervention.session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise session not found.")
    if payload.completed is not None:
        intervention.completed = payload.completed
    if payload.duration_seconds is not None:
        intervention.duration = payload.duration_seconds
    result = None
    if payload.feedback is not None:
        intervention.feedback = payload.feedback
        db.flush()
        session = intervention.session
        history = [{"type": i.type, "feedback": i.feedback} for i in session.interventions]
        last_assessment = session.assessments[-1] if session.assessments else None
        emotion = last_assessment.emotion if last_assessment else None
        stress_level = last_assessment.stress_level if last_assessment else None
        outcome = intervention_service.adapt_after_feedback(
            intervention.type, payload.feedback, emotion, stress_level, history,
            mood_service.helped_counts(db, user.id),
        )
        reply_text = response_engine.feedback_reply(outcome["action"], payload.feedback, outcome["recommendation"])
        reply_msg = Message(session_id=session.id, sender="sereneai", content=reply_text)
        db.add(reply_msg)
        result = {
            "action": outcome["action"],
            "recommendation": outcome["recommendation"],
            "options": outcome["options"],
            "message": {"id": None, "sender": "sereneai", "content": reply_text},
        }
    db.commit()
    db.refresh(intervention)
    out = InterventionOut.model_validate(intervention).model_dump(mode="json")
    if result:
        out["adaptation"] = result
    return out


@router.get("/history")
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = 50) -> dict:
    rows = db.scalars(
        select(Intervention)
        .join(ChatSession, ChatSession.id == Intervention.session_id)
        .where(ChatSession.user_id == user.id)
        .order_by(Intervention.timestamp.desc())
        .limit(min(limit, 200))
    )
    items = []
    for i in rows:
        session = i.session
        assessment = session.assessments[-1] if session.assessments else None
        items.append(
            {
                "id": i.id,
                "timestamp": mood_service.iso(i.timestamp),
                "type": i.type,
                "title": intervention_service.INTERVENTIONS.get(i.type, {}).get("title", i.type),
                "duration_seconds": i.duration,
                "completed": i.completed,
                "feedback": i.feedback,
                "mood": assessment.emotion if assessment else None,
                "stress_level": assessment.stress_level if assessment else None,
            }
        )
    return {"items": items}
