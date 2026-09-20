"""``users`` table."""

import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func
from app.db.custom_types import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Role(str, enum.Enum):
    """Role-based access control roles."""

    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(Enum(Role), nullable=False, default=Role.DOCTOR)
    specialization = Column(String(100))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patients_created = relationship(
        "Patient",
        back_populates="creator",
        foreign_keys="Patient.created_by",
    )
    linked_patient = relationship(
        "Patient",
        back_populates="linked_user",
        foreign_keys="Patient.linked_user_id",
        uselist=False,
    )
    notifications = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<User {self.email} {self.role.value}>"
