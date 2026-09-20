"""Patient DTOs."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

GENDERS = {"Male", "Female", "Other"}
BLOOD_TYPES = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
CONDITIONS = {
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Cancer",
    "Obesity",
    "Arthritis",
}


class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    age: int = Field(..., ge=0, le=120)
    gender: str
    blood_type: str | None = None
    primary_condition: str = Field(..., max_length=80)
    insurance_provider: str | None = Field(default=None, max_length=80)
    contact_email: EmailStr | None = None

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: str) -> str:
        if value not in GENDERS:
            raise ValueError(f"gender must be one of {sorted(GENDERS)}")
        return value

    @field_validator("blood_type")
    @classmethod
    def validate_blood_type(cls, value: str | None) -> str | None:
        if value is not None and value not in BLOOD_TYPES:
            raise ValueError(f"blood_type must be one of {sorted(BLOOD_TYPES)}")
        return value


class PatientCreate(PatientBase):
    mrn: str | None = Field(
        default=None,
        max_length=32,
        description="Medical record number. Generated when omitted.",
    )
    linked_user_id: uuid.UUID | None = None


class PatientUpdate(PatientBase):
    linked_user_id: uuid.UUID | None = None


class PatientOut(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    mrn: str
    created_by: uuid.UUID | None = None
    linked_user_id: uuid.UUID | None = None
    created_at: datetime | None = None


class PatientListItem(PatientOut):
    """Worklist row - carries the latest risk assessment when one exists."""

    latest_risk_probability: float | None = None
    latest_risk_band: str | None = None
    admission_count: int = 0


class BulkImportResult(BaseModel):
    received: int
    created: int
    skipped: int
    errors: list[str] = Field(default_factory=list)
