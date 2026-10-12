from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Assessment, ChatSession, Message, SafetyEvent, User, utcnow
from ..utils import countries
from . import emotion_service, intervention_service, mood_service, response_engine, safety_service, stress_service

MAX_MESSAGE_CHARS = 2000


class InvalidInput(ValueError):
    pass


def clean_text(text: str) -> str:
    text = (text or "").replace("\x00", "").strip()
    if not text:
        raise InvalidInput("Please type a message.")
    if len(text) > MAX_MESSAGE_CHARS:
        raise InvalidInput(f"Messages can be up to {MAX_MESSAGE_CHARS} characters.")
    return text


def get_or_create_session(db: Session, user: User, session_id: Optional[int], kind: str = "chat") -> ChatSession:
    if session_id is not None:
        session = db.get(ChatSession, session_id)
        if session is None or session.user_id != user.id:
            raise LookupError("Session not found")
        if session.status == "active":
            return session
    session = ChatSession(user_id=user.id, kind=kind, status="active")
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def _message_out(m: Message) -> dict:
    return {"id": m.id, "sender": m.sender, "content": m.content, "timestamp": mood_service.iso(m.timestamp)}


def _session_context(db: Session, session: ChatSession) -> tuple[list[dict], Optional[str], list[str], list[Assessment]]:
    history = [{"type": i.type, "feedback": i.feedback} for i in session.interventions]
    last_feedback = next((i.feedback for i in reversed(session.interventions) if i.feedback), None)
    recent_replies = [
        m.content
        for m in db.scalars(
            select(Message).where(Message.session_id == session.id, Message.sender == "sereneai").order_by(Message.id.desc()).limit(6)
        )
    ]
    assessments = list(session.assessments)
    return history, last_feedback, recent_replies, assessments


def process_message(
    db: Session, *, user: User, session: ChatSession, text: str, user_reported_stress: Optional[float] = None
) -> dict:
    text = clean_text(text)
    user_msg = Message(session_id=session.id, sender="user", content=text)
    db.add(user_msg)
    db.flush()

    safety = safety_service.evaluate(text, floor=session.risk_floor or safety_service.NORMAL)
    emergency_info = countries.get_emergency_info(user.country)

    if safety.risk_level == safety_service.EMERGENCY:
        db.add(
            SafetyEvent(
                session_id=session.id, risk_level=safety.risk_level, category=safety.category,
                action_taken="emergency_pathway_shown",
            )
        )
        session.risk_floor = safety_service.ELEVATED
        system_msg = Message(session_id=session.id, sender="system", content=response_engine.EMERGENCY_TRANSCRIPT_TEXT)
        db.add(system_msg)
        db.commit()
        return {
            "type": "emergency",
            "session_id": session.id,
            "user_message": _message_out(user_msg),
            "message": _message_out(system_msg),
            "safety": safety.public(),
            "ai_estimated": None,
            "recommendation": None,
            "emergency": response_engine.emergency_payload(safety.category, emergency_info),
            "support": None,
        }

    emotion = emotion_service.classify(text)
    history, last_feedback, recent_replies, previous = _session_context(db, session)
    stress = stress_service.estimate_stress(text, emotion.probabilities, user_reported_stress, last_feedback)
    anxiety = stress_service.anxiety_score(emotion.probabilities)

    recommendation = intervention_service.recommend(
        emotion.emotion, stress.level, history, mood_service.helped_counts(db, user.id)
    )
    reply = response_engine.generate(
        emotion=emotion.emotion,
        stress_level=stress.level,
        risk_level=safety.risk_level,
        category=safety.category,
        intervention_id=recommendation["id"] if recommendation else None,
        recent_replies=recent_replies,
    )

    assessment = Assessment(
        session_id=session.id,
        emotion=emotion.emotion,
        confidence=emotion.confidence,
        stress_score=stress.score,
        stress_level=stress.level,
        anxiety_score=anxiety,
        risk_level=safety.risk_level,
    )
    db.add(assessment)
    reply_msg = Message(session_id=session.id, sender="sereneai", content=reply)
    db.add(reply_msg)
    if safety.risk_level == safety_service.ELEVATED:
        db.add(
            SafetyEvent(
                session_id=session.id, risk_level=safety.risk_level, category=safety.category,
                action_taken="support_options_shown",
            )
        )
    db.commit()

    return {
        "type": "response",
        "session_id": session.id,
        "user_message": _message_out(user_msg),
        "message": _message_out(reply_msg),
        "safety": safety.public(),
        "ai_estimated": {
            "emotion": emotion.emotion,
            "confidence": emotion.confidence,
            "stress_score": stress.score,
            "stress_level": stress.level,
            "anxiety_level": stress_service.anxiety_level(anxiety),
        },
        "recommendation": recommendation,
        "emergency": None,
        "support": emergency_info if safety.risk_level == safety_service.ELEVATED else None,
    }
