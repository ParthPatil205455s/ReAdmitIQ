"""Audit log viewer for administrators."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_page_params, require_role
from app.models.audit_log import AuditLog
from app.models.user import Role, User
from app.schemas.common import Page, PageParams

from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid
from typing import Any

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    action: str
    entity_type: str | None = None
    entity_id: uuid.UUID | None = None
    meta: dict[str, Any] | None = None
    ip_address: str | None = None
    created_at: datetime | None = None

router = APIRouter(prefix="/audit-logs", tags=["Audit"])

@router.get("", response_model=Page[AuditLogOut], summary="Audit log feed")
def list_audit_logs(
    action: str | None = Query(default=None),
    params: PageParams = Depends(get_page_params),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.ADMIN)),
) -> Page[AuditLogOut]:
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    total = query.count()
    rows = (
        query.order_by(AuditLog.created_at.desc())
        .offset(params.offset)
        .limit(params.size)
        .all()
    )
    return Page[AuditLogOut].build(
        [AuditLogOut.model_validate(r) for r in rows], total, params
    )
