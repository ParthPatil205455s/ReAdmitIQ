"""Endpoint 40: liveness and readiness probe monitored by Member 4."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.notification import HealthOut
from app.services.ml_service import ml_service

router = APIRouter(tags=["Health"])
log = logging.getLogger("readmitiq.health")


@router.get("/health", response_model=HealthOut, summary="Service health")
def health(db: Session = Depends(get_db)) -> HealthOut:
    """Public. Returns model load state and database reachability."""
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = "error"
        log.error("health_db_check_failed", extra={"reason": str(exc)})
    return HealthOut(
        status="ok" if db_status == "ok" else "degraded",
        model_loaded=not ml_service.stub,
        model_version=ml_service.model_version,
        db=db_status,
    )
