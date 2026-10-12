from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Optional

import joblib

from ..config import settings

log = logging.getLogger("sereneai.ml")

EMOTIONS = ["calm", "neutral", "stressed", "anxious", "overwhelmed", "sad", "frustrated"]
MODEL_FILE = "emotion_model.pkl"
VECTORIZER_FILE = "vectorizer.pkl"


class EmotionClassifier:
    def __init__(self, model_dir: Path | None = None):
        self.model_dir = Path(model_dir or settings.model_dir)
        self.model = None
        self.vectorizer = None
        self._lock = threading.Lock()

    @property
    def loaded(self) -> bool:
        return self.model is not None and self.vectorizer is not None

    def load(self) -> bool:
        try:
            self.model = joblib.load(self.model_dir / MODEL_FILE)
            self.vectorizer = joblib.load(self.model_dir / VECTORIZER_FILE)
            return True
        except Exception as exc:
            log.warning("Could not load emotion model (%s)", exc)
            self.model = self.vectorizer = None
            return False

    def ensure_loaded(self, auto_train: bool = True) -> bool:
        if self.loaded:
            return True
        with self._lock:
            if self.loaded:
                return True
            if self.load():
                return True
            if auto_train:
                try:
                    from .train import train

                    train(dataset_path=settings.dataset_path, model_dir=self.model_dir, quiet=True)
                    return self.load()
                except Exception as exc:
                    log.warning("Auto-training failed (%s); using keyword fallback.", exc)
            return False

    def predict_proba(self, text: str) -> Optional[dict[str, float]]:
        if not self.loaded:
            return None
        features = self.vectorizer.transform([text])
        probs = self.model.predict_proba(features)[0]
        return {str(label): float(p) for label, p in zip(self.model.classes_, probs)}


classifier = EmotionClassifier()
