"""Authentication and user DTOs."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import Role

_SELF_REGISTERABLE = {Role.DOCTOR, Role.PATIENT}


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=150)
    specialization: str | None = Field(default=None, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role: Role = Role.DOCTOR

    @field_validator("role")
    @classmethod
    def restrict_self_registration(cls, value: Role) -> Role:
        """Self-registration may never mint an ADMIN account."""
        if value not in _SELF_REGISTERABLE:
            raise ValueError("Self registration is limited to DOCTOR or PATIENT.")
        return value


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    specialization: str | None = Field(default=None, max_length=100)


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def must_differ(cls, value: str, info) -> str:
        if value == (info.data or {}).get("current_password"):
            raise ValueError("New password must differ from the current password.")
        return value


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: Role
    is_active: bool
    created_at: datetime | None = None
