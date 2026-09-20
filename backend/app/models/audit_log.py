"""``audit_logs`` table - one row per prediction and per mutating request."""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, func
from app.db.custom_types import JSONB, UUID

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    action = Column(String(60), nullable=False)
    entity_type = Column(String(40), nullable=False)
    entity_id = Column(String(64))
    meta = Column(JSONB, default=dict)
    ip_address = Column(String(64))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
