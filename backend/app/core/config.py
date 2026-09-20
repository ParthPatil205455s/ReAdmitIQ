"""Application configuration.

Every value is read from the environment (or a local .env file). There are no
hardcoded secrets anywhere in this repository - see the security checklist in
section 12 of the work order.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Typed application settings loaded from the environment."""

    PROJECT_NAME: str = "ReAdmitIQ API"
    API_V1: str = "/api/v1"
    APP_ENV: str = "development"

    DATABASE_URL: str = "sqlite:///./readmitiq.db"
    SECRET_KEY: str = "readmitiq-dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: str = "http://localhost:5173"

    MODEL_DIR: str = "app/artifacts"
    RISK_LOW_MAX: float = 0.30
    RISK_MED_MAX: float = 0.60

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@readmitiq.io"
    SMTP_FROM_NAME: str = "ReAdmitIQ"

    LOGIN_RATE_LIMIT: str = "5/minute"
    SEED_ON_STARTUP: bool = True

    @property
    def cors_list(self) -> list[str]:
        """CORS_ORIGINS as a clean list. Never returns ["*"]."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() in {"production", "prod"}

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Cached settings factory - the env is parsed exactly once per process."""
    return Settings()


settings = get_settings()
