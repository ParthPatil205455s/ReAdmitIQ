"""Audit trail.

One row for every prediction and every mutating request, as required by the
section 12 security checklist.
"""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record(
    db: Session,
    *,
    user_id: uuid.UUID | None,
    action: str,
    entity_type: str,
    entity_id: Any | None = None,
    meta: dict[str, Any] | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """Append an audit row. The caller owns the commit."""
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        meta=meta or {},
        ip_address=ip_address,
    )
    db.add(entry)
    return entry
