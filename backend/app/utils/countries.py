from __future__ import annotations

import json
from functools import lru_cache

from ..config import settings


@lru_cache(maxsize=1)
def _load() -> dict:
    with open(settings.emergency_config_path, encoding="utf-8") as f:
        return json.load(f)


def reload() -> None:
    _load.cache_clear()


def list_countries() -> list[dict]:
    data = _load()
    items = [{"code": code, "name": c["name"]} for code, c in data["countries"].items()]
    return sorted(items, key=lambda c: c["name"])


def get_emergency_info(country_code: str | None) -> dict:
    data = _load()
    code = (country_code or "").upper()
    entry = data["countries"].get(code)
    if entry is None:
        base = dict(data["default"])
        base.setdefault("helplines", [])
        return base
    return {
        "country": code,
        "name": entry["name"],
        "emergency_number": entry["emergency_number"],
        "emergency_label": entry.get("emergency_label", "Emergency Services"),
        "note": entry.get("note"),
        "helplines": entry.get("helplines", []),
    }
