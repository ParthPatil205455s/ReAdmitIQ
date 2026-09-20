"""Shared DTOs: pagination wrapper, message envelope, error envelope."""

from __future__ import annotations

from dataclasses import dataclass
from math import ceil
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


@dataclass(slots=True)
class PageParams:
    """Normalised pagination inputs produced by ``get_page_params``."""

    page: int = 1
    size: int = 20
    sort: str | None = None

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class Page(BaseModel, Generic[T]):
    """Standard server-side pagination envelope used by every list endpoint."""

    items: list[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def build(
        cls, items: Sequence[T], total: int, params: PageParams
    ) -> "Page[T]":
        return cls(
            items=list(items),
            total=total,
            page=params.page,
            size=params.size,
            pages=ceil(total / params.size) if params.size else 0,
        )


class Message(BaseModel):
    """Simple acknowledgement body."""

    detail: str = Field(..., examples=["Operation completed."])


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str


class ErrorResponse(BaseModel):
    """The single error shape returned for every 4xx and 5xx."""

    error: ErrorBody
