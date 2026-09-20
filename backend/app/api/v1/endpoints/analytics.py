"""Endpoints 29-34: hospital analytics aggregates."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.user import Role, User
from app.schemas.analytics import (
    ByAdmissionType,
    ByCondition,
    Overview,
    RiskDistribution,
    TopDrivers,
    Trend,
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=Overview, summary="Headline KPIs")
def overview(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Overview:
    return Overview(**analytics_service.overview(db))


@router.get(
    "/risk-distribution",
    response_model=RiskDistribution,
    summary="LOW / MEDIUM / HIGH split",
)
def risk_distribution(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> RiskDistribution:
    return RiskDistribution(**analytics_service.risk_distribution(db))


@router.get("/by-condition", response_model=ByCondition, summary="Risk by condition")
def by_condition(
    db: Session = Depends(get_db), _: User = Depends(require_role(Role.ADMIN))
) -> ByCondition:
    return ByCondition(**analytics_service.by_condition(db))


@router.get(
    "/by-admission-type",
    response_model=ByAdmissionType,
    summary="Risk by admission route",
)
def by_admission_type(
    db: Session = Depends(get_db), _: User = Depends(require_role(Role.ADMIN))
) -> ByAdmissionType:
    return ByAdmissionType(**analytics_service.by_admission_type(db))


@router.get("/trend", response_model=Trend, summary="Prediction volume and mean risk")
def trend(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.ADMIN)),
) -> Trend:
    return Trend(**analytics_service.trend(db, days=days))


@router.get(
    "/top-drivers", response_model=TopDrivers, summary="Population-level risk drivers"
)
def top_drivers(
    db: Session = Depends(get_db), _: User = Depends(require_role(Role.ADMIN))
) -> TopDrivers:
    return TopDrivers(**analytics_service.top_drivers(db))
