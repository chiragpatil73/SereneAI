from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas.user import LoginIn, RegisterIn, TokenOut, UserOut
from ..utils.ratelimit import RateLimiter, limit_requests
from ..utils.security import DUMMY_HASH, create_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
_login_limiter = RateLimiter(limit=10, window_seconds=60)
_register_limiter = RateLimiter(limit=5, window_seconds=60)


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(limit_requests(_register_limiter, "register"))])
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    user = User(
        name=payload.name, email=payload.email.lower(), password_hash=hash_password(payload.password),
        country=payload.country,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut, dependencies=[Depends(limit_requests(_login_limiter, "login"))])
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    password_hash = user.password_hash if user else DUMMY_HASH
    ok = verify_password(payload.password, password_hash)
    if not user or not ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
    token = create_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)
