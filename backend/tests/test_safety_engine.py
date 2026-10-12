import pytest

from app.services.safety_service import EMERGENCY, ELEVATED, NORMAL, evaluate

NORMAL_CASES = [
    "I had a stressful day.",
    "My thoughts are racing and I feel overwhelmed.",
    "I feel calm today.",
    "My friend had chest pain yesterday.",
    "We studied suicide prevention in class.",
    "I'm dying to see that movie.",
    "This homework is killing me.",
    "What causes chest pain?",
]

ELEVATED_CASES = [
    "I feel like I can't handle everything.",
    "I feel hopeless about this.",
    "I would never hurt myself.",
    "My friend is having chest pain right now.",
    "I feel short of breath and dizzy.",
    "I'm having a panic attack.",
    "He said he wants to kill himself.",
]

EMERGENCY_CASES = [
    "I want to kill myself.",
    "I don't want to live anymore.",
    "I'm thinking about ending my life.",
    "I have been having thoughts of suicide.",
    "I have severe chest pain right now.",
    "I can't breathe.",
    "I just passed out.",
    "I took too many pills.",
    "I'm bleeding heavily and it won't stop.",
    "I want to end it all.",
]


@pytest.mark.parametrize("text", NORMAL_CASES)
def test_normal(text):
    assert evaluate(text).risk_level == NORMAL, text


@pytest.mark.parametrize("text", ELEVATED_CASES)
def test_elevated(text):
    assert evaluate(text).risk_level == ELEVATED, text


@pytest.mark.parametrize("text", EMERGENCY_CASES)
def test_emergency(text):
    result = evaluate(text)
    assert result.risk_level == EMERGENCY, text
    assert result.triggered is True
    assert result.category in {"self_harm", "medical"}


def test_session_floor_keeps_elevated():
    result = evaluate("I had lunch.", floor=ELEVATED)
    assert result.risk_level == ELEVATED


def test_third_party_worry_is_not_the_users_emergency():
    result = evaluate("My friend had chest pain yesterday.")
    assert result.risk_level == NORMAL

    result = evaluate("My sister wants to kill herself.")
    assert result.risk_level == ELEVATED
    assert result.category == "third_party"
