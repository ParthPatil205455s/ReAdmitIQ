"""Idempotent demo seeding.

Safe to run repeatedly against production: the whole routine is guarded by a
user count, so a second run is a no-op rather than a wall of duplicate-key
errors mid-demo.

    python -m app.db.seed
"""

from __future__ import annotations

import logging
import random
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.admission import Admission
from app.models.patient import Patient
from app.models.user import Role, User
from app.services import prediction_service
from app.services.ml_service import ml_service

log = logging.getLogger("readmitiq.seed")

DEMO_USERS: list[tuple[str, str, str, str]] = [
    ("admin@readmitiq.io", "Admin@123", "Dr. Priya Nair", "ADMIN"),
    ("doctor@readmitiq.io", "Doctor@123", "Dr. Rohan Mehta", "DOCTOR"),
    ("patient@readmitiq.io", "Patient@123", "Anil Sharma", "PATIENT"),
]

CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Cancer", "Obesity", "Arthritis"]
ADMISSION_TYPES = ["Emergency", "Urgent", "Elective"]
TEST_RESULTS = ["Normal", "Abnormal", "Inconclusive"]
BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
GENDERS = ["Male", "Female"]
INSURERS = ["Star Health", "HDFC Ergo", "Niva Bupa", "ICICI Lombard", "Aditya Birla"]
HOSPITALS = ["Apollo General", "Fortis Central", "KIMS City", "Ruby Hall", "Manipal East"]
MEDICATIONS = ["Metformin", "Lisinopril", "Aspirin", "Ibuprofen", "Paracetamol", "Insulin"]
DOCTORS = ["Dr. R. Mehta", "Dr. S. Iyer", "Dr. K. Bose", "Dr. A. Kulkarni", "Dr. M. Fernandes"]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Diya", "Saanvi", "Ananya", "Kabir", "Ishaan",
    "Meera", "Rhea", "Arjun", "Neha", "Rohit", "Kavya", "Sameer", "Tara",
    "Nikhil", "Pooja", "Varun", "Lakshmi",
]
LAST_NAMES = [
    "Sharma", "Patil", "Nair", "Reddy", "Bose", "Desai", "Kulkarni", "Iyer",
    "Fernandes", "Joshi", "Menon", "Gupta",
]

HIGH_RISK_TARGET = 12
PATIENT_TARGET = 60


def seed(db: Session, *, force: bool = False) -> None:
    """Populate demo users, patients, admissions and baseline predictions."""
    if not force and db.query(User).count() > 0:
        log.info("seed_skipped_existing_data")
        print("[seed] database already populated - nothing to do")
        return

    random.seed(20260920)  # reproducible demo data

    users = _seed_users(db)
    doctor = users["DOCTOR"]
    patient_user = users["PATIENT"]

    patients = _seed_patients(db, doctor, patient_user)
    _seed_baseline_predictions(db, patients, doctor)

    db.commit()
    print(
        f"[seed] {len(users)} users, {len(patients)} patients seeded "
        f"(model={ml_service.model_version})"
    )


def _seed_users(db: Session) -> dict[str, User]:
    created: dict[str, User] = {}
    for email, password, full_name, role in DEMO_USERS:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            created[role] = existing
            continue
        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            role=Role(role),
            specialization="Internal Medicine" if role == "DOCTOR" else None,
            is_active=True,
        )
        db.add(user)
        created[role] = user
    db.flush()
    return created


def _seed_patients(db: Session, doctor: User, patient_user: User) -> list[Patient]:
    """60 patients across six chronic conditions, 1-4 admissions each.

    The first ``HIGH_RISK_TARGET`` patients are deliberately built with the
    risk profile the model keys on - repeat emergency utilisation, long stays,
    abnormal results, no follow-up - so the doctor worklist looks alive during
    the demo instead of showing three rows.
    """
    patients: list[Patient] = []
    today = date.today()

    for index in range(PATIENT_TARGET):
        high_risk = index < HIGH_RISK_TARGET
        condition = CONDITIONS[index % len(CONDITIONS)]
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        patient = Patient(
            mrn=f"MRN-{20260000 + index}",
            created_by=doctor.id,
            linked_user_id=patient_user.id if index == 0 else None,
            full_name=patient_user.full_name if index == 0 else name,
            age=random.randint(68, 88) if high_risk else random.randint(21, 74),
            gender=random.choice(GENDERS),
            blood_type=random.choice(BLOOD_TYPES),
            primary_condition=condition,
            insurance_provider=random.choice(INSURERS),
            contact_email=f"patient{index:02d}@readmitiq.io",
        )
        db.add(patient)
        db.flush()

        count = random.randint(3, 4) if high_risk else random.randint(1, 3)
        cursor = today - timedelta(days=random.randint(400, 540))
        for _ in range(count):
            stay = random.randint(11, 24) if high_risk else random.randint(1, 9)
            admitted = cursor
            discharged = admitted + timedelta(days=stay)
            db.add(
                Admission(
                    patient_id=patient.id,
                    admission_date=admitted,
                    discharge_date=discharged if discharged <= today else None,
                    length_of_stay=stay if discharged <= today else 0,
                    admission_type="Emergency"
                    if high_risk
                    else random.choice(ADMISSION_TYPES),
                    medication=random.choice(MEDICATIONS),
                    test_result="Abnormal" if high_risk else random.choice(TEST_RESULTS),
                    billing_amount=round(random.uniform(18000, 480000), 2),
                    hospital=random.choice(HOSPITALS),
                    attending_doctor=random.choice(DOCTORS),
                    followup_scheduled=False if high_risk else random.random() < 0.55,
                )
            )
            gap = random.randint(20, 40) if high_risk else random.randint(90, 200)
            cursor = discharged + timedelta(days=gap)
            if cursor > today:
                break

        patients.append(patient)

    db.flush()
    return patients


def _seed_baseline_predictions(
    db: Session, patients: list[Patient], doctor: User
) -> None:
    """Score every seeded patient once so dashboards and analytics are populated."""
    for patient in patients:
        admission = prediction_service.resolve_admission(db, patient, None)
        features = prediction_service.features_for(db, patient, admission)
        probability, band, explanation, recommendations = prediction_service.score(
            features
        )
        prediction_service.persist(
            db,
            patient=patient,
            admission=admission,
            features=features,
            probability=probability,
            band=band,
            explanation=explanation,
            recommendations=recommendations,
            created_by=doctor.id,
        )


def main() -> None:
    """Entry point for ``python -m app.db.seed``."""
    Base.metadata.create_all(bind=engine)
    ml_service.load()
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
