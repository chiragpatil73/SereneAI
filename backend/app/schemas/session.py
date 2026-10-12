from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from .common import ORMModel, UTCDatetime

Feedback = Literal["helped", "somewhat_helped", "didnt_help", "stopped"]


class MessageOut(ORMModel):
    id: int
    sender: str
    content: str
    timestamp: UTCDatetime


class AnalyzeIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[int] = None
    user_reported_stress: Optional[float] = Field(default=None, ge=0, le=10)


class SessionOut(ORMModel):
    id: int
    started_at: UTCDatetime
    ended_at: Optional[UTCDatetime] = None
    status: str
    kind: str


class SessionDetail(SessionOut):
    messages: list[MessageOut]


class InterventionStart(BaseModel):
    type: str
    session_id: Optional[int] = None


class InterventionUpdate(BaseModel):
    completed: Optional[bool] = None
    feedback: Optional[Feedback] = None
    duration_seconds: Optional[int] = Field(default=None, ge=0, le=6 * 3600)


class InterventionOut(ORMModel):
    id: int
    session_id: int
    type: str
    duration: int
    completed: bool
    feedback: Optional[str] = None
    timestamp: UTCDatetime
