from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from ..config import settings


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window = window_seconds
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        if not settings.rate_limit_enabled:
            return True
        now = time.monotonic()
        q = self.hits[key]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            return False
        q.append(now)
        return True


def limit_requests(limiter: RateLimiter, scope: str):
    def dependency(request: Request):
        client = request.client.host if request.client else "unknown"
        if not limiter.allow(f"{scope}:{client}"):
            raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment and try again.")

    return dependency
