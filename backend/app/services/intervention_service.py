from __future__ import annotations

from typing import Optional

INTERVENTIONS: dict[str, dict] = {
    "paced_breathing": {
        "id": "paced_breathing",
        "title": "Paced Breathing",
        "description": "Slow your breathing to help your body settle: inhale 4s, hold 4s, exhale 6s.",
        "duration_minutes": 3,
        "categories": ["Anxiety", "Stress"],
        "icon": "wind",
    },
    "five_four_three_two_one": {
        "id": "five_four_three_two_one",
        "title": "5-4-3-2-1 Grounding",
        "description": "A simple technique to bring your attention back to the present moment.",
        "duration_minutes": 5,
        "categories": ["Overwhelm", "Anxiety"],
        "icon": "eye",
    },
    "sensory_grounding": {
        "id": "sensory_grounding",
        "title": "Sensory Grounding",
        "description": "Use touch, sound and sight to pause and reset when things feel tense.",
        "duration_minutes": 4,
        "categories": ["Stress", "Focus"],
        "icon": "hand",
    },
    "positive_reflection": {
        "id": "positive_reflection",
        "title": "Positive Reflection",
        "description": "A gentle look at what is okay right now, and one kind thing to tell yourself.",
        "duration_minutes": 3,
        "categories": ["Low Mood"],
        "icon": "sun",
    },
    "gentle_movement": {
        "id": "gentle_movement",
        "title": "Gentle Movement",
        "description": "Loosen tense muscles with easy stretches and a slow reset.",
        "duration_minutes": 5,
        "categories": ["Stress", "Low Mood", "Focus"],
        "icon": "activity",
    },
    "guided_check_in": {
        "id": "guided_check_in",
        "title": "Guided Check-In",
        "description": "A short, low-pressure check-in about how your day and body feel.",
        "duration_minutes": 2,
        "categories": [],
        "icon": "message-circle",
        "in_library": False,
    },
}

PREFERENCES: dict[str, list[str]] = {
    "calm": ["positive_reflection", "guided_check_in", "gentle_movement"],
    "neutral": ["guided_check_in", "sensory_grounding", "positive_reflection"],
    "stressed": ["paced_breathing", "sensory_grounding", "gentle_movement", "five_four_three_two_one"],
    "anxious": ["paced_breathing", "five_four_three_two_one", "sensory_grounding"],
    "overwhelmed": ["five_four_three_two_one", "paced_breathing", "sensory_grounding"],
    "sad": ["positive_reflection", "gentle_movement", "sensory_grounding"],
    "frustrated": ["sensory_grounding", "paced_breathing", "gentle_movement"],
}

CONTINUATION = {
    "paced_breathing": "positive_reflection",
    "five_four_three_two_one": "paced_breathing",
    "sensory_grounding": "gentle_movement",
    "positive_reflection": "gentle_movement",
    "gentle_movement": "positive_reflection",
    "guided_check_in": "paced_breathing",
}

FEEDBACK_VALUES = {"helped", "somewhat_helped", "didnt_help", "stopped"}


def public(intervention_id: str) -> dict:
    spec = INTERVENTIONS[intervention_id]
    return {k: spec[k] for k in ("id", "title", "description", "duration_minutes", "categories", "icon")}


def catalog(include_hidden: bool = False) -> list[dict]:
    return [public(i) for i, s in INTERVENTIONS.items() if include_hidden or s.get("in_library", True)]


def _ranked(emotion: Optional[str], stress_level: Optional[str]) -> list[str]:
    if emotion is None:
        return ["guided_check_in", "paced_breathing", "sensory_grounding"]
    order = list(PREFERENCES.get(emotion, PREFERENCES["neutral"]))
    if stress_level == "Moderate" and emotion in {"neutral", "calm"}:
        order.insert(0, "sensory_grounding")
    if stress_level == "High" and "paced_breathing" not in order[:2] and emotion not in {"sad"}:
        order.insert(1, "paced_breathing")
    seen: list[str] = []
    for i in order:
        if i not in seen:
            seen.append(i)
    return seen


def recommend(
    emotion: Optional[str],
    stress_level: Optional[str],
    history: Optional[list[dict]] = None,
    user_helped_counts: Optional[dict[str, int]] = None,
    exclude: Optional[set[str]] = None,
) -> Optional[dict]:
    history = history or []
    user_helped_counts = user_helped_counts or {}
    exclude = set(exclude or ())
    ranked = [i for i in _ranked(emotion, stress_level) if i not in exclude]
    if not ranked:
        return None

    scores: dict[str, float] = {}
    for position, item in enumerate(ranked):
        score = 10.0 - position
        score += min(1.0, 0.25 * user_helped_counts.get(item, 0))
        for entry in history:
            if entry.get("type") != item:
                continue
            fb = entry.get("feedback")
            if fb == "didnt_help":
                score -= 6
            elif fb == "stopped":
                score -= 4
            elif fb == "somewhat_helped":
                score -= 0.5
            elif fb == "helped":
                score -= 1.5
        scores[item] = score

    if history:
        last = history[-1].get("type")
        if last in scores and len(scores) > 1:
            scores[last] -= 1.0

    best = max(scores, key=lambda i: (scores[i], -ranked.index(i)))
    rejected = {e["type"] for e in history if e.get("feedback") in {"didnt_help", "stopped"}}
    if best in rejected and all(i in rejected for i in ranked):
        return None
    return public(best)


def adapt_after_feedback(
    current_type: str,
    feedback: str,
    emotion: Optional[str],
    stress_level: Optional[str],
    history: list[dict],
    user_helped_counts: Optional[dict[str, int]] = None,
) -> dict:
    tried_and_rejected = {e["type"] for e in history if e.get("feedback") in {"didnt_help", "stopped"}}

    if feedback == "helped":
        follow = CONTINUATION.get(current_type)
        if follow in tried_and_rejected:
            follow = None
        rec = public(follow) if follow else None
        return {"action": "offer_continue_or_finish", "recommendation": rec, "options": ["continue", "finish"]}

    if feedback == "somewhat_helped":
        rec = recommend(emotion, stress_level, history, user_helped_counts, exclude={current_type} | tried_and_rejected)
        return {"action": "offer_complement", "recommendation": rec, "options": ["try_another", "finish"]}

    if feedback == "didnt_help":
        rec = recommend(emotion, stress_level, history, user_helped_counts, exclude={current_type} | tried_and_rejected)
        if rec is None:
            return {"action": "suggest_human_support", "recommendation": None, "options": ["talk_to_someone", "finish"]}
        return {"action": "try_different", "recommendation": rec, "options": ["try_another", "finish"]}

    rec = recommend(emotion, stress_level, history, user_helped_counts, exclude={current_type} | tried_and_rejected)
    if rec is not None:
        shorter = sorted(
            [public(i) for i, s in INTERVENTIONS.items() if s.get("in_library", True) and i not in tried_and_rejected and i != current_type],
            key=lambda d: d["duration_minutes"],
        )
        if shorter and shorter[0]["duration_minutes"] < rec["duration_minutes"]:
            rec = shorter[0]
    return {"action": "acknowledge_stop", "recommendation": rec, "options": ["try_another", "finish"]}
