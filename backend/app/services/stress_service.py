from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

EMOTION_WEIGHT = {
    "calm": 0.05,
    "neutral": 0.15,
    "sad": 0.40,
    "frustrated": 0.55,
    "stressed": 0.55,
    "anxious": 0.70,
    "overwhelmed": 0.85,
}

INTENSIFIERS = {"really", "very", "so", "extremely", "completely", "totally", "constantly", "always", "way", "too", "absolutely", "utterly"}
STRESS_WORDS = {
    "stress", "stressed", "stressful", "pressure", "deadline", "deadlines", "panic", "racing", "overwhelmed", "overwhelming",
    "exhausted", "burnout", "burned", "tense", "anxious", "worried", "frantic", "drowning", "swamped", "overloaded", "unbearable",
}
NEGATIVE_WORDS = {
    "bad", "awful", "terrible", "horrible", "hate", "worst", "hard", "difficult", "tired", "sad", "angry", "scared", "afraid",
    "nervous", "worried", "upset", "annoyed", "frustrated", "lonely", "hurt", "sick",
}
_WORD = re.compile(r"[a-z']+")


@dataclass
class StressResult:
    score: float
    level: str


def level_for(score: float) -> str:
    if score < 0.30:
        return "Low"
    if score < 0.60:
        return "Moderate"
    return "High"


def _language_signal(text: str) -> float:
    words = _WORD.findall((text or "").lower().replace("\u2019", "'"))
    intensity = sum(1 for w in words if w in INTENSIFIERS)
    stress_hits = sum(1 for w in words if w in STRESS_WORDS)
    negatives = sum(1 for w in words if w in NEGATIVE_WORDS)
    shouting = 1 if ("!!" in text or (len(text) > 8 and text.isupper())) else 0
    signal = 0.10 * min(intensity, 2) + 0.25 * min(stress_hits, 3) + 0.10 * max(0, min(negatives - 1, 2)) + 0.10 * shouting
    return min(1.0, signal)


def estimate_stress(
    text: str,
    probabilities: dict[str, float],
    user_reported: Optional[float] = None,
    last_feedback: Optional[str] = None,
) -> StressResult:
    emotion_component = sum(p * EMOTION_WEIGHT.get(e, 0.3) for e, p in probabilities.items())
    language = _language_signal(text)
    if user_reported is not None:
        reported = max(0.0, min(1.0, user_reported / 10.0))
        score = 0.45 * emotion_component + 0.25 * language + 0.30 * reported
    else:
        score = 0.65 * emotion_component + 0.35 * language
    if last_feedback == "helped":
        score -= 0.05
    elif last_feedback in {"didnt_help", "stopped"}:
        score += 0.05
    score = round(max(0.0, min(1.0, score)), 2)
    return StressResult(score, level_for(score))


def anxiety_score(probabilities: dict[str, float]) -> float:
    return round(min(1.0, probabilities.get("anxious", 0.0) + 0.5 * probabilities.get("overwhelmed", 0.0)), 2)


def anxiety_level(score: float) -> str:
    if score < 0.25:
        return "Low"
    if score < 0.50:
        return "Moderate"
    return "High"
