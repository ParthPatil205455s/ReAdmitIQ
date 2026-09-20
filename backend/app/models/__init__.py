"""ORM model registry - importing this package registers all eight tables."""

from app.models.admission import Admission
from app.models.audit_log import AuditLog
from app.models.explanation import Explanation
from app.models.notification import Notification
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.user import Role, User

__all__ = [
    "Admission",
    "AuditLog",
    "Explanation",
    "Notification",
    "Patient",
    "Prediction",
    "Recommendation",
    "Role",
    "User",
]
