"""Declarative base shared by every ORM model.

The mappers themselves are registered by ``app.models`` (see
``app/models/__init__.py``), which the application imports before calling
``Base.metadata.create_all()`` in the lifespan handler.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for every ORM model."""
