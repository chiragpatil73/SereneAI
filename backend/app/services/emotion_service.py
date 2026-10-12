from __future__ import annotations

import re
from dataclasses import dataclass, field

from ..ml.classifier import EMOTIONS, classifier

MIN_ML_CONFIDENCE = 0.30

KEYWORDS: dict[str, list[str]] = {
    "calm": ["calm", "peaceful", "relaxed", "at ease", "serene", "content", "tranquil", "settled", "at peace"],
    "neutral": ["okay", "fine", "normal", "average", "so-so", "nothing much", "regular day"],
    "stressed": ["stress", "stressed", "stressful", "pressure", "deadline", "tense", "workload", "burned out", "burnt out"],
    "anxious": ["anxious", "anxiety", "worried", "worry", "nervous", "panic", "afraid", "scared", "dread", "racing", "on edge", "uneasy"],
    "overwhelmed": ["overwhelmed", "too much", "overloaded", "drowning", "swamped", "can't cope", "piling up", "at my limit"],
    "sad": ["sad", "down", "low", "lonely", "cry", "crying", "empty", "blue", "heartbroken", "grief", "gloomy", "unhappy"],
    "frustrated": ["frustrated", "frustrating", "angry", "annoyed", "irritated", "furious", "fed up", "mad", "irritating"],
}


@dataclass
class EmotionResult:
    emotion: str
    confidence: float
    probabilities: dict[str, float] = field(default_factory=dict)
    method: str = "ml"


def _keyword_scores(text: str) -> dict[str, int]:
    lowered = (text or "").lower().replace("\u2019", "'")
    scores = {e: 0 for e in EMOTIONS}
    for emotion, words in KEYWORDS.items():
        for w in words:
            if re.search(rf"\b{re.escape(w)}\b", lowered):
                scores[emotion] += 1
    return scores


def keyword_classify(text: str) -> EmotionResult:
    scores = _keyword_scores(text)
    best = max(scores, key=lambda e: scores[e])
    if scores[best] == 0:
        probs = {e: (0.4 if e == "neutral" else 0.1) for e in EMOTIONS}
        return EmotionResult("neutral", 0.4, probs, "keyword")
    confidence = min(0.85, 0.5 + 0.1 * scores[best])
    rest = (1 - confidence) / (len(EMOTIONS) - 1)
    probs = {e: (confidence if e == best else rest) for e in EMOTIONS}
    return EmotionResult(best, round(confidence, 2), probs, "keyword")


def classify(text: str) -> EmotionResult:
    try:
        probs = classifier.predict_proba(text) if classifier.ensure_loaded() else None
    except Exception:
        probs = None
    if not probs:
        return keyword_classify(text)

    top = max(probs, key=lambda e: probs[e])
    if probs[top] < MIN_ML_CONFIDENCE:
        fallback = keyword_classify(text)
        if any(_keyword_scores(text).values()):
            return fallback
    return EmotionResult(top, round(probs[top], 2), probs, "ml")
