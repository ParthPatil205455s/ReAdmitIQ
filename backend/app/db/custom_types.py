"""Portable column types supporting both PostgreSQL and SQLite."""

import uuid
from sqlalchemy import JSON, Uuid
from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB, UUID as PG_UUID
from sqlalchemy.types import TypeDecorator


class _PortableJSON(JSON):
    """JSON type that can be passed as a class, instance, or called as a factory."""

    def __call__(self, *args, **kwargs):
        return self


JSONB = _PortableJSON().with_variant(PG_JSONB(), "postgresql")


class _PortableUUID(TypeDecorator):
    """UUID type supporting string auto-conversion for SQLite and PostgreSQL."""

    impl = Uuid(as_uuid=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        try:
            return uuid.UUID(str(value))
        except (ValueError, TypeError):
            return value


def UUID(as_uuid=True):
    """UUID type factory supporting string auto-conversion across dialects."""
    return _PortableUUID().with_variant(PG_UUID(as_uuid=as_uuid), "postgresql")
