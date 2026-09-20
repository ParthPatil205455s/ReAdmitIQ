"""API v1 router - mounts all 40 endpoints under ``/api/v1``."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admissions,
    analytics,
    audit_logs,
    auth,
    health,
    notifications,
    patients,
    predictions,
    reports,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router)                # 1-6
api_router.include_router(users.router)               # 7-9
api_router.include_router(patients.router)            # 10-17
api_router.include_router(admissions.router)          # 18-20
api_router.include_router(predictions.router)         # 21-26
api_router.include_router(predictions.model_router)   # 27-28
api_router.include_router(analytics.router)           # 29-34
api_router.include_router(reports.router)             # 35-36
api_router.include_router(notifications.router)       # 37-39
api_router.include_router(health.router)              # 40
api_router.include_router(audit_logs.router)
