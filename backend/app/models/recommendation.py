"""``recommendations`` table - output of the deterministic rule engine."""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from app.db.custom_types import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("predictions.id", ondelete="CASCADE"),
        nullable=False,
    )
    driver_code = Column(String(40), nullable=False)
    title = Column(String(150), nullable=False)
    detail = Column(Text, nullable=False)
    priority = Column(String(10), nullable=False, default="MEDIUM")
    category = Column(String(20), nullable=False, default="FOLLOWUP")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", back_populates="recommendations")
