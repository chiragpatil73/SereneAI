from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import ChatSession, Intervention, MoodEntry, User
from .services import pipeline
from .utils.security import hash_password

log = logging.getLogger("sereneai.seed")

DEMO_EMAIL = "demo@sereneai.app"
DEMO_PASSWORD = "CalmDemo123!"


def run() -> None:
    db: Session = SessionLocal()
    try:
        if db.query(User).filter(User.email == DEMO_EMAIL).first():
            return
        user = User(name="Demo User", email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD), country="IN")
        db.add(user)
        db.commit()
        db.refresh(user)

        db.add(MoodEntry(user_id=user.id, mood="okay", stress_level="moderate", anxiety_level="low", note="Regular day."))
        db.add(MoodEntry(user_id=user.id, mood="stressed", stress_level="high", anxiety_level="moderate", note="Big deadline."))
        db.commit()

        session = ChatSession(user_id=user.id, status="ended", kind="chat")
        db.add(session)
        db.commit()
        db.refresh(session)
        pipeline.process_message(db, user=user, session=session, text="I had a really stressful day.")
        pipeline.process_message(db, user=user, session=session, text="My thoughts are racing and I feel overwhelmed.")

        completed = Intervention(session_id=session.id, type="five_four_three_two_one", duration=300, completed=True, feedback="helped")
        db.add(completed)
        db.commit()
        log.info("Seeded demo account %s / %s", DEMO_EMAIL, DEMO_PASSWORD)
    except Exception:
        db.rollback()
        log.exception("Demo seed failed (continuing without it)")
    finally:
        db.close()
