"""Hospital analytics aggregation.

Every number here is a real database aggregate. Nothing is hardcoded - that
is an explicit line in the section 15 definition of done.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from typing import Any

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.admission import Admission
from app.models.explanation import Explanation
from app.models.patient import Patient
from app.models.prediction import Prediction

BANDS = ("LOW", "MEDIUM", "HIGH")


def _latest_prediction_subquery(db: Session):
    """One row per patient: the id of their most recent prediction."""
    return (
        db.query(
            Prediction.patient_id.label("patient_id"),
            func.max(Prediction.created_at).label("latest"),
        )
        .group_by(Prediction.patient_id)
        .subquery()
    )


def overview(db: Session) -> dict[str, Any]:
    """Headline KPIs for the doctor and admin dashboards."""
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    total_admissions = db.query(func.count(Admission.id)).scalar() or 0
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    average_risk = db.query(func.avg(Prediction.risk_probability)).scalar() or 0.0
    average_los = db.query(func.avg(Admission.length_of_stay)).scalar() or 0.0

    latest = _latest_prediction_subquery(db)
    high_risk = (
        db.query(func.count(Prediction.id))
        .join(
            latest,
            (Prediction.patient_id == latest.c.patient_id)
            & (Prediction.created_at == latest.c.latest),
        )
        .filter(Prediction.risk_band == "HIGH")
        .scalar()
        or 0
    )

    followup_total = db.query(func.count(Admission.id)).scalar() or 0
    followup_done = (
        db.query(func.count(Admission.id))
        .filter(Admission.followup_scheduled.is_(True))
        .scalar()
        or 0
    )
    repeat_patients = (
        db.query(func.count())
        .select_from(
            db.query(Admission.patient_id)
            .group_by(Admission.patient_id)
            .having(func.count(Admission.id) > 1)
            .subquery()
        )
        .scalar()
        or 0
    )

    return {
        "total_patients": int(total_patients),
        "total_admissions": int(total_admissions),
        "total_predictions": int(total_predictions),
        "high_risk_patients": int(high_risk),
        "average_risk": round(float(average_risk), 4),
        "average_length_of_stay": round(float(average_los), 2),
        "readmission_rate_estimate": round(
            repeat_patients / total_patients if total_patients else 0.0, 4
        ),
        "followup_coverage": round(
            followup_done / followup_total if followup_total else 0.0, 4
        ),
    }


def risk_distribution(db: Session) -> dict[str, Any]:
    """Band split across the most recent prediction per patient."""
    latest = _latest_prediction_subquery(db)
    rows = (
        db.query(Prediction.risk_band, func.count(Prediction.id))
        .join(
            latest,
            (Prediction.patient_id == latest.c.patient_id)
            & (Prediction.created_at == latest.c.latest),
        )
        .group_by(Prediction.risk_band)
        .all()
    )
    counts = {band: 0 for band in BANDS}
    for band, count in rows:
        counts[band] = int(count)
    total = sum(counts.values())
    return {
        "total": total,
        "bands": [
            {
                "band": band,
                "count": counts[band],
                "percentage": round(counts[band] / total * 100, 2) if total else 0.0,
            }
            for band in BANDS
        ],
    }


def by_condition(db: Session) -> dict[str, Any]:
    """Patient volume and mean risk grouped by primary chronic condition."""
    patient_counts = dict(
        db.query(Patient.primary_condition, func.count(Patient.id))
        .group_by(Patient.primary_condition)
        .all()
    )
    rows = (
        db.query(
            Patient.primary_condition,
            func.count(Prediction.id),
            func.avg(Prediction.risk_probability),
            func.sum(case((Prediction.risk_band == "HIGH", 1), else_=0)),
        )
        .join(Prediction, Prediction.patient_id == Patient.id)
        .group_by(Patient.primary_condition)
        .all()
    )
    scored = {
        condition: (int(count), float(avg or 0.0), int(high or 0))
        for condition, count, avg, high in rows
    }
    items = []
    for condition, patients in sorted(patient_counts.items()):
        count, avg, high = scored.get(condition, (0, 0.0, 0))
        items.append(
            {
                "condition": condition,
                "patients": int(patients),
                "predictions": count,
                "average_risk": round(avg, 4),
                "high_risk": high,
            }
        )
    return {"items": items}


def by_admission_type(db: Session) -> dict[str, Any]:
    """Volume, mean stay and mean risk grouped by admission route."""
    base = (
        db.query(
            Admission.admission_type,
            func.count(Admission.id),
            func.avg(Admission.length_of_stay),
        )
        .group_by(Admission.admission_type)
        .all()
    )
    risk = dict(
        db.query(Admission.admission_type, func.avg(Prediction.risk_probability))
        .join(Prediction, Prediction.admission_id == Admission.id)
        .group_by(Admission.admission_type)
        .all()
    )
    return {
        "items": [
            {
                "admission_type": admission_type,
                "admissions": int(count),
                "average_length_of_stay": round(float(avg_los or 0.0), 2),
                "average_risk": round(float(risk.get(admission_type) or 0.0), 4),
            }
            for admission_type, count, avg_los in sorted(base)
        ]
    }


def trend(db: Session, days: int = 30) -> dict[str, Any]:
    """Daily prediction volume and mean risk over the trailing window."""
    since = date.today() - timedelta(days=days)
    rows = (
        db.query(
            func.date(Prediction.created_at).label("day"),
            func.count(Prediction.id),
            func.avg(Prediction.risk_probability),
            func.sum(case((Prediction.risk_band == "HIGH", 1), else_=0)),
        )
        .filter(func.date(Prediction.created_at) >= since)
        .group_by("day")
        .order_by("day")
        .all()
    )
    return {
        "granularity": "day",
        "points": [
            {
                "period": str(day),
                "predictions": int(count),
                "average_risk": round(float(avg or 0.0), 4),
                "high_risk": int(high or 0),
            }
            for day, count, avg, high in rows
        ],
    }


def top_drivers(db: Session, limit: int = 500) -> dict[str, Any]:
    """Population-level driver frequency across stored SHAP explanations."""
    rows = (
        db.query(Explanation.top_drivers)
        .order_by(Explanation.created_at.desc())
        .limit(limit)
        .all()
    )
    totals: dict[str, float] = defaultdict(float)
    counts: dict[str, int] = defaultdict(int)
    display: dict[str, str] = {}
    for (drivers,) in rows:
        for driver in drivers or []:
            feature = driver.get("feature")
            if not feature:
                continue
            totals[feature] += abs(float(driver.get("contribution", 0.0)))
            counts[feature] += 1
            display.setdefault(feature, driver.get("display", feature))

    drivers_out = [
        {
            "feature": feature,
            "display": display.get(feature, feature),
            "occurrences": counts[feature],
            "average_contribution": round(totals[feature] / counts[feature], 4),
        }
        for feature in counts
    ]
    drivers_out.sort(key=lambda d: d["average_contribution"], reverse=True)
    return {"sample_size": len(rows), "drivers": drivers_out[:15]}
