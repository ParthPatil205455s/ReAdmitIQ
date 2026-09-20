"""In-app notification creation."""

from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.models.notification import Notification


def create(
    db: Session,
    *,
    user_id: uuid.UUID,
    title: str,
    message: str,
    type_: str = "INFO",
) -> Notification:
    """Create one in-app notification. The caller owns the commit."""
    notification = Notification(
        user_id=user_id, title=title, message=message, type=type_
    )
    db.add(notification)
    return notification
