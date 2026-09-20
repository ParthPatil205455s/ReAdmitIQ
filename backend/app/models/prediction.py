"""``predictions`` table."""

import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from app.db.custom_types import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    admission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("admissions.id", ondelete="CASCADE"),
        nullable=True,
    )
    created_by = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    risk_probability = Column(Float, nullable=False)
    risk_band = Column(String(10), nullable=False)
    window_days = Column(Integer, default=30, nullable=False)
    model_version = Column(String(60), nullable=False)
    decision_threshold = Column(Float, default=0.5, nullable=False)
    input_features = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="predictions")
    admission = relationship("Admission", back_populates="predictions")
    explanation = relationship(
        "Explanation",
        back_populates="prediction",
        cascade="all, delete-orphan",
        uselist=False,
    )
    recommendations = relationship(
        "Recommendation", back_populates="prediction", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_predictions_patient", "patient_id", created_at.desc()),
        Index("idx_predictions_band", "risk_band", created_at.desc()),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Prediction {self.id} {self.risk_band}>"
