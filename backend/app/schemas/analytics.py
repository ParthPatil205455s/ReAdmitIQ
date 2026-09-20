"""Analytics DTOs for endpoints 29-34."""

from __future__ import annotations

from pydantic import BaseModel, Field


class Overview(BaseModel):
    total_patients: int
    total_admissions: int
    total_predictions: int
    high_risk_patients: int
    average_risk: float
    average_length_of_stay: float
    readmission_rate_estimate: float
    followup_coverage: float


class BandCount(BaseModel):
    band: str
    count: int
    percentage: float


class RiskDistribution(BaseModel):
    total: int
    bands: list[BandCount]


class ConditionStat(BaseModel):
    condition: str
    patients: int
    predictions: int
    average_risk: float
    high_risk: int


class ByCondition(BaseModel):
    items: list[ConditionStat]


class AdmissionTypeStat(BaseModel):
    admission_type: str
    admissions: int
    average_length_of_stay: float
    average_risk: float


class ByAdmissionType(BaseModel):
    items: list[AdmissionTypeStat]


class TrendPoint(BaseModel):
    period: str
    predictions: int
    average_risk: float
    high_risk: int


class Trend(BaseModel):
    granularity: str
    points: list[TrendPoint]


class TopDriver(BaseModel):
    feature: str
    display: str
    occurrences: int
    average_contribution: float


class TopDrivers(BaseModel):
    sample_size: int
    drivers: list[TopDriver] = Field(default_factory=list)
