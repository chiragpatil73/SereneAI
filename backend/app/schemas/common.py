from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict


def _utc(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


UTCDatetime = Annotated[datetime, AfterValidator(_utc)]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
