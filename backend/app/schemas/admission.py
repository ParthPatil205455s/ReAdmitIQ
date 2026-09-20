"""Admission DTOs."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

ADMISSION_TYPES = {"Emergency", "Urgent", "Elective"}
TEST_RESULTS = {"Normal", "Abnormal", "Inconclusive"}


class AdmissionBase(BaseModel):
    admission_date: date
    discharge_date: date | None = None
    admission_type: str
    medication: str | None = Field(default=None, max_length=120)
    test_result: str | None = None
    billing_amount: Decimal | None = Field(default=None, ge=0)
    hospital: str | None = Field(default=None, max_length=120)
    attending_doctor: str | None = Field(default=None, max_length=120)
    followup_scheduled: bool = False

    @model_validator(mode="after")
    def validate_dates_and_enums(self) -> "AdmissionBase":
        if self.admission_type not in ADMISSION_TYPES:
            raise ValueError(f"admission_type must be one of {sorted(ADMISSION_TYPES)}")
        if self.test_result is not None and self.test_result not in TEST_RESULTS:
            raise ValueError(f"test_result must be one of {sorted(TEST_RESULTS)}")
        if self.discharge_date and self.discharge_date < self.admission_date:
            raise ValueError("discharge_date must be on or after admission_date")
        return self

    @property
    def computed_length_of_stay(self) -> int:
        if not self.discharge_date:
            return 0
        return (self.discharge_date - self.admission_date).days


class AdmissionCreate(AdmissionBase):
    """Body for ``POST /patients/{id}/admissions``."""


class AdmissionUpdate(AdmissionBase):
    """Body for ``PUT /admissions/{id}``."""


class AdmissionOut(AdmissionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    patient_id: uuid.UUID
    length_of_stay: int
    created_at: datetime | None = None


class PatientHistory(BaseModel):
    """Response for ``GET /patients/{id}/history``."""

    patient_id: uuid.UUID
    admissions: list[AdmissionOut]
    total_admissions: int
    average_length_of_stay: float
    emergency_admissions: int
