from app.services import pipeline
from app.database import SessionLocal
from app.models import ChatSession, User
from sqlalchemy import select


def _get_session(db, session_id):
    return db.get(ChatSession, session_id)


def test_demo_scenario_stressed_day(client, auth_headers):
    r = client.post("/api/chat/analyze", json={"message": "I had a really stressful day."}, headers=auth_headers)
    body = r.json()
    assert r.status_code == 200
    assert body["type"] == "response"
    assert body["ai_estimated"]["emotion"] == "stressed"
    assert body["ai_estimated"]["stress_level"] in {"Low", "Moderate", "High"}
    assert body["safety"]["risk_level"] == "normal"
    assert body["recommendation"] is not None


def test_demo_scenario_overwhelmed(client, auth_headers):
    r = client.post(
        "/api/chat/analyze", json={"message": "My thoughts are racing and I feel overwhelmed."}, headers=auth_headers
    )
    body = r.json()
    assert body["ai_estimated"]["emotion"] == "overwhelmed"
    assert body["recommendation"]["id"] == "five_four_three_two_one"


def test_emergency_blocks_normal_flow_and_shows_emergency_ui(client, auth_headers):
    r = client.post("/api/chat/analyze", json={"message": "I want to kill myself"}, headers=auth_headers)
    body = r.json()
    assert r.status_code == 200
    assert body["type"] == "emergency"
    assert body["ai_estimated"] is None
    assert body["recommendation"] is None
    emergency = body["emergency"]
    assert emergency["title"] == "Immediate Help May Be Needed"
    assert "cannot diagnose" in emergency["body"]
    assert emergency["services"]["emergency_number"]
    assert "not a replacement" in emergency["disclaimer"].lower()


def test_emergency_response_never_contains_a_method():
    from app.services import response_engine

    banned_terms = ["how to", "dosage", "lethal", "grams", "instructions"]
    text = (response_engine.EMERGENCY_BODY + response_engine.EMERGENCY_MEDICAL_NOTICE).lower()
    for term in banned_terms:
        assert term not in text
