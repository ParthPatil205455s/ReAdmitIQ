"""``patients`` table."""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, func
from app.db.custom_types import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mrn = Column(String(32), unique=True, nullable=False, index=True)
    created_by = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    linked_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    full_name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    blood_type = Column(String(8))
    primary_condition = Column(String(80), nullable=False)
    insurance_provider = Column(String(80))
    contact_email = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship(
        "User", back_populates="patients_created", foreign_keys=[created_by]
    )
    linked_user = relationship(
        "User", back_populates="linked_patient", foreign_keys=[linked_user_id]
    )
    admissions = relationship(
        "Admission",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="Admission.admission_date.desc()",
    )
    predictions = relationship(
        "Prediction", back_populates="patient", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("idx_patients_condition", "primary_condition"),)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Patient {self.mrn} {self.full_name}>"
