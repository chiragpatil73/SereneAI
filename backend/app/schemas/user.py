from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from .common import ORMModel, UTCDatetime

_PHONE = re.compile(r"^[0-9+()\-\s]{3,40}$")


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    country: str = Field(default="IN", min_length=2, max_length=2)
    accepted_disclaimer: bool

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("country")
    @classmethod
    def _country(cls, v: str) -> str:
        return v.upper()

    @field_validator("accepted_disclaimer")
    @classmethod
    def _accepted(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must acknowledge the disclaimer to create an account")
        return v


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserOut(ORMModel):
    id: int
    name: str
    email: EmailStr
    country: str
    trusted_contact_name: Optional[str] = None
    trusted_contact_phone: Optional[str] = None
    created_at: UTCDatetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    country: Optional[str] = Field(default=None, min_length=2, max_length=2)
    trusted_contact_name: Optional[str] = Field(default=None, max_length=120)
    trusted_contact_phone: Optional[str] = Field(default=None, max_length=40)

    @field_validator("country")
    @classmethod
    def _country(cls, v):
        return v.upper() if v else v

    @field_validator("trusted_contact_phone")
    @classmethod
    def _phone(cls, v):
        if v and not _PHONE.match(v):
            raise ValueError("Enter a valid phone number")
        return v


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
