"""Outbound email.

SMTP credentials are optional. When they are absent the service degrades to
logging the message instead of raising - a missing mail password must never
break a demo.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings

log = logging.getLogger("readmitiq.email")

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
_jinja = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


class EmailService:
    """Thin wrapper over fastapi-mail with a safe no-credentials fallback."""

    def __init__(self) -> None:
        self.enabled = bool(settings.SMTP_USER and settings.SMTP_PASSWORD)
        self._client: FastMail | None = None
        if self.enabled:
            self._client = FastMail(
                ConnectionConfig(
                    MAIL_USERNAME=settings.SMTP_USER,
                    MAIL_PASSWORD=settings.SMTP_PASSWORD,
                    MAIL_FROM=settings.SMTP_FROM,
                    MAIL_FROM_NAME=settings.SMTP_FROM_NAME,
                    MAIL_PORT=settings.SMTP_PORT,
                    MAIL_SERVER=settings.SMTP_HOST,
                    MAIL_STARTTLS=True,
                    MAIL_SSL_TLS=False,
                    USE_CREDENTIALS=True,
                    VALIDATE_CERTS=True,
                )
            )

    async def send(self, to: str, subject: str, html: str) -> bool:
        """Send one HTML email. Returns ``False`` when SMTP is not configured."""
        if not self.enabled or self._client is None:
            log.warning(
                "email_skipped_no_smtp", extra={"to": to, "subject": subject}
            )
            return False
        message = MessageSchema(
            subject=subject,
            recipients=[to],
            body=html,
            subtype=MessageType.html,
        )
        try:
            await self._client.send_message(message)
            log.info("email_sent", extra={"to": to, "subject": subject})
            return True
        except Exception as exc:  # network/SMTP failures must not 500 the API
            log.error("email_failed", extra={"to": to, "reason": str(exc)})
            return False

    @staticmethod
    def render_risk_alert(context: dict[str, Any]) -> str:
        """Render the clinical alert template."""
        return _jinja.get_template("report.html").render(**context)


email_service = EmailService()
