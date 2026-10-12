from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Assessment, ChatSession, Intervention, MoodEntry, Message, SafetyEvent, User
from ..schemas.user import PasswordChange, UserOut, UserUpdate
from ..utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["users"])


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.post("/me/password")
def change_password(payload: PasswordChange, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect.")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"status": "ok"}


@router.delete("/me")
def delete_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    db.delete(user)
    db.commit()
    return {"status": "deleted"}


@router.get("/me/export")
def export_my_data(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user.id).all()
    moods = db.query(MoodEntry).filter(MoodEntry.user_id == user.id).all()
    return {
        "account": {"name": user.name, "email": user.email, "country": user.country, "created_at": str(user.created_at)},
        "mood_entries": [
            {"mood": m.mood, "stress_level": m.stress_level, "anxiety_level": m.anxiety_level, "note": m.note,
             "timestamp": str(m.timestamp)} for m in moods
        ],
        "sessions": [
            {
                "id": s.id, "started_at": str(s.started_at), "status": s.status, "kind": s.kind,
                "messages": [{"sender": m.sender, "content": m.content, "timestamp": str(m.timestamp)} for m in s.messages],
                "assessments": [
                    {"emotion": a.emotion, "confidence": a.confidence, "stress_level": a.stress_level,
                     "risk_level": a.risk_level, "timestamp": str(a.timestamp)} for a in s.assessments
                ],
                "interventions": [
                    {"type": i.type, "completed": i.completed, "feedback": i.feedback, "timestamp": str(i.timestamp)}
                    for i in s.interventions
                ],
            }
            for s in sessions
        ],
    }
