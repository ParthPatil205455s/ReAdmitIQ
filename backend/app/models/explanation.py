"""``explanations`` table - SHAP output plus the generated narrative."""

import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text, func
from app.db.custom_types import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("predictions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    base_value = Column(Float, nullable=False, default=0.0)
    shap_values = Column(JSONB, nullable=False, default=dict)
    top_drivers = Column(JSONB, nullable=False, default=list)
    narrative = Column(Text, nullable=False)
    method = Column(String(40), nullable=False, default="TreeSHAP")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", back_populates="explanation")
