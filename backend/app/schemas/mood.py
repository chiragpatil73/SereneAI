from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from .common import ORMModel, UTCDatetime

Mood = Literal["great", "good", "okay", "low", "stressed"]
Level = Literal["low", "moderate", "high"]


class MoodIn(BaseModel):
    mood: Mood
    stress_level: Optional[Level] = None
    anxiety_level: Optional[Level] = None
    note: Optional[str] = Field(default=None, max_length=1000)


class MoodOut(ORMModel):
    id: int
    mood: str
    stress_level: Optional[str] = None
    anxiety_level: Optional[str] = None
    note: Optional[str] = None
    timestamp: UTCDatetime
