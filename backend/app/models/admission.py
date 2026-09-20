"""``admissions`` table."""

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    func,
)
from app.db.custom_types import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    admission_date = Column(Date, nullable=False)
    discharge_date = Column(Date)
    length_of_stay = Column(Integer, default=0, nullable=False)
    admission_type = Column(String(20), nullable=False)
    medication = Column(String(120))
    test_result = Column(String(20))
    billing_amount = Column(Numeric(12, 2))
    hospital = Column(String(120))
    attending_doctor = Column(String(120))
    followup_scheduled = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="admissions")
    predictions = relationship(
        "Prediction", back_populates="admission", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_admissions_patient", "patient_id", admission_date.desc()),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Admission {self.id} {self.admission_type}>"
