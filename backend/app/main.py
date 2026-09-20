"""ReAdmitIQ API - application factory.

The model and its SHAP explainer are warm-loaded once in the lifespan handler,
never inside a request handler. That is the difference between a 4-second
prediction and a sub-second one.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import (
    RequestContextMiddleware,
    SecurityHeadersMiddleware,
    configure_logging,
)
from app.core.security import limiter
from app.db.base import Base
from app.db.session import engine
from app.services.ml_service import ml_service

import app.models  # noqa: F401  registers all eight mappers before create_all

configure_logging()
log = logging.getLogger("readmitiq.app")

DESCRIPTION = """
Predictive Hospital Readmission Risk Platform - DSSA 24-Hour Hackathon 2026,
Domain 01 (MEDITECH), PS 01.

Clinical decision support: patient-level readmission risk with SHAP-based
explanations, a deterministic recommendation engine, hospital analytics and
downloadable clinical reports. Predictions are statistical estimates and are
never a medical diagnosis.
"""


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Create tables and warm-load the model exactly once per process."""
    Base.metadata.create_all(bind=engine)
    ml_service.load()
    if settings.SEED_ON_STARTUP:
        from app.db.seed import seed
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            seed(db)
        except Exception as exc:
            log.warning("seed_failed", extra={"reason": str(exc)})
        finally:
            db.close()
    log.info(
        "startup_complete",
        extra={"stub_mode": ml_service.stub, "model_version": ml_service.model_version},
    )
    yield
    log.info("shutdown")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "Content-Disposition"],
)

register_exception_handlers(app)


@app.exception_handler(RateLimitExceeded)
async def _rate_limited(request, exc):  # type: ignore[no-untyped-def]
    """Rate-limit rejections use the same error envelope as everything else."""
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": "RATE_LIMITED",
                "message": "Too many requests. Please slow down and try again.",
                "request_id": getattr(request.state, "request_id", "req_unknown"),
            }
        },
    )


app.include_router(api_router, prefix=settings.API_V1)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    """Convenience pointer to the interactive documentation."""
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": f"{settings.API_V1}/health",
    }
