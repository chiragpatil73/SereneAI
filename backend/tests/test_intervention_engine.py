from app.services import intervention_service as ie


def test_recommend_by_emotion():
    assert ie.recommend("anxious", "High")["id"] == "paced_breathing"
    assert ie.recommend("overwhelmed", "High")["id"] == "five_four_three_two_one"


def test_adapts_after_didnt_help():
    history = [{"type": "paced_breathing", "feedback": "didnt_help"}]
    rec = ie.recommend("anxious", "High", history=history)
    assert rec["id"] != "paced_breathing"


def test_offers_continuation_after_helped():
    outcome = ie.adapt_after_feedback(
        "five_four_three_two_one", "helped", "overwhelmed", "High",
        history=[{"type": "five_four_three_two_one", "feedback": "helped"}],
    )
    assert outcome["action"] == "offer_continue_or_finish"
    assert set(outcome["options"]) == {"continue", "finish"}


def test_suggests_human_support_when_everything_rejected():
    history = [
        {"type": "paced_breathing", "feedback": "didnt_help"},
        {"type": "five_four_three_two_one", "feedback": "didnt_help"},
        {"type": "sensory_grounding", "feedback": "didnt_help"},
    ]
    outcome = ie.adapt_after_feedback("sensory_grounding", "didnt_help", "anxious", "High", history=history)
    assert outcome["action"] == "suggest_human_support"
