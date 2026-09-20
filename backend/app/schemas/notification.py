"""Notification DTOs for endpoints 37-39."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmailAlertRequest(BaseModel):
    """Body for ``POST /notifications/email``."""

    to: EmailStr
    subject: str = Field(..., min_length=3, max_length=150)
    body: str = Field(..., min_length=3)
    prediction_id: uuid.UUID | None = None
    notify_user_id: uuid.UUID | None = Field(
        default=None,
        description="Also create an in-app notification for this user.",
    )


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime | None = None


class HealthOut(BaseModel):
    """``GET /health`` - Member 4 monitors this exact shape."""

    model_config = ConfigDict(protected_namespaces=())

    status: str
    model_loaded: bool
    model_version: str
    db: str
