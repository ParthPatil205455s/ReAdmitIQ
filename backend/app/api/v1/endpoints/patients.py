"""Endpoints 10-17: patient CRUD, history, bulk import, admission creation."""

from __future__ import annotations

import csv
import io
import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, Query, Request, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import (
    get_client_ip,
    get_current_user,
    get_db,
    get_page_params,
    require_role,
)
from app.core.exceptions import AppException, ConflictError, ForbiddenError, NotFoundError
from app.models.admission import Admission
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.user import Role, User
from app.schemas.admission import AdmissionCreate, AdmissionOut, PatientHistory
from app.schemas.common import Message, Page, PageParams
from app.schemas.patient import (
    BulkImportResult,
    PatientCreate,
    PatientListItem,
    PatientOut,
    PatientUpdate,
)
from app.services import audit_service

router = APIRouter(prefix="/patients", tags=["Patients"])

SORTABLE = {
    "created_at": Patient.created_at,
    "full_name": Patient.full_name,
    "age": Patient.age,
    "mrn": Patient.mrn,
}


def generate_mrn(db: Session) -> str:
    """Allocate a readable, unique medical record number."""
    while True:
        candidate = f"MRN-{uuid.uuid4().hex[:8].upper()}"
        if not db.query(Patient.id).filter(Patient.mrn == candidate).first():
            return candidate


def get_patient_or_404(db: Session, patient_id: uuid.UUID) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise NotFoundError("No patient with that id.", code="PATIENT_NOT_FOUND")
    return patient


def assert_can_read(patient: Patient, user: User) -> None:
    """Ownership check - a PATIENT may read only their own linked record."""
    if user.role in (Role.ADMIN, Role.DOCTOR):
        return
    if patient.linked_user_id and patient.linked_user_id == user.id:
        return
    raise ForbiddenError(
        "You may only access your own patient record.", code="NOT_RECORD_OWNER"
    )


@router.post(
    "",
    response_model=PatientOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a patient",
)
def create_patient(
    payload: PatientCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Patient:
    mrn = payload.mrn or generate_mrn(db)
    if db.query(Patient.id).filter(Patient.mrn == mrn).first():
        raise ConflictError("That MRN already exists.", code="MRN_TAKEN")
    data = payload.model_dump(exclude={"mrn"})
    patient = Patient(
        mrn=mrn,
        created_by=user.id,
        **{**data, "contact_email": str(data["contact_email"]) if data.get("contact_email") else None},
    )
    db.add(patient)
    db.flush()
    audit_service.record(
        db,
        user_id=user.id,
        action="PATIENT_CREATE",
        entity_type="patient",
        entity_id=patient.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(patient)
    return patient


@router.get(
    "", response_model=Page[PatientListItem], summary="Patient worklist (paginated)"
)
def list_patients(
    search: str | None = Query(default=None, description="Name or MRN"),
    condition: str | None = Query(default=None),
    risk_band: str | None = Query(default=None, pattern="^(LOW|MEDIUM|HIGH)$"),
    params: PageParams = Depends(get_page_params),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Page[PatientListItem]:
    """Server-side pagination, search, condition filter and risk-band filter."""
    latest = (
        db.query(
            Prediction.patient_id.label("patient_id"),
            func.max(Prediction.created_at).label("latest"),
        )
        .group_by(Prediction.patient_id)
        .subquery()
    )
    newest = (
        db.query(Prediction)
        .join(
            latest,
            (Prediction.patient_id == latest.c.patient_id)
            & (Prediction.created_at == latest.c.latest),
        )
        .subquery()
    )

    query = db.query(Patient, newest.c.risk_probability, newest.c.risk_band).outerjoin(
        newest, newest.c.patient_id == Patient.id
    )
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            Patient.full_name.ilike(pattern) | Patient.mrn.ilike(pattern)
        )
    if condition:
        query = query.filter(Patient.primary_condition == condition)
    if risk_band:
        query = query.filter(newest.c.risk_band == risk_band)

    total = query.count()
    column = SORTABLE.get((params.sort or "created_at").lstrip("-"), Patient.created_at)
    ordering = column.asc() if params.sort and not params.sort.startswith("-") else column.desc()
    rows = query.order_by(ordering).offset(params.offset).limit(params.size).all()

    counts = dict(
        db.query(Admission.patient_id, func.count(Admission.id))
        .group_by(Admission.patient_id)
        .all()
    )
    items = []
    for patient, probability, band in rows:
        item = PatientListItem.model_validate(patient)
        item.latest_risk_probability = (
            round(float(probability), 4) if probability is not None else None
        )
        item.latest_risk_band = band
        item.admission_count = int(counts.get(patient.id, 0))
        items.append(item)
    return Page[PatientListItem].build(items, total, params)


@router.get("/{patient_id}", response_model=PatientOut, summary="Patient detail")
def get_patient(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Patient:
    patient = get_patient_or_404(db, patient_id)
    assert_can_read(patient, user)
    return patient


@router.put("/{patient_id}", response_model=PatientOut, summary="Update a patient")
def update_patient(
    patient_id: uuid.UUID,
    payload: PatientUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Patient:
    patient = get_patient_or_404(db, patient_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, str(value) if field == "contact_email" and value else value)
    audit_service.record(
        db,
        user_id=user.id,
        action="PATIENT_UPDATE",
        entity_type="patient",
        entity_id=patient.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", response_model=Message, summary="Delete a patient")
def delete_patient(
    patient_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(Role.ADMIN)),
) -> Message:
    """Cascades to admissions, predictions, explanations and recommendations."""
    patient = get_patient_or_404(db, patient_id)
    audit_service.record(
        db,
        user_id=admin.id,
        action="PATIENT_DELETE",
        entity_type="patient",
        entity_id=patient.id,
        meta={"mrn": patient.mrn},
        ip_address=get_client_ip(request),
    )
    db.delete(patient)
    db.commit()
    return Message(detail="Patient deleted.")


@router.get(
    "/{patient_id}/history",
    response_model=PatientHistory,
    summary="Admission history and utilisation summary",
)
def patient_history(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PatientHistory:
    patient = get_patient_or_404(db, patient_id)
    assert_can_read(patient, user)
    admissions = (
        db.query(Admission)
        .filter(Admission.patient_id == patient.id)
        .order_by(Admission.admission_date.desc())
        .all()
    )
    stays = [a.length_of_stay or 0 for a in admissions]
    return PatientHistory(
        patient_id=patient.id,
        admissions=[AdmissionOut.model_validate(a) for a in admissions],
        total_admissions=len(admissions),
        average_length_of_stay=round(sum(stays) / len(stays), 2) if stays else 0.0,
        emergency_admissions=sum(
            1 for a in admissions if a.admission_type == "Emergency"
        ),
    )


@router.post(
    "/bulk-import",
    response_model=BulkImportResult,
    summary="Bulk import patients from a dataset CSV",
)
async def bulk_import(
    request: Request,
    file: UploadFile = File(..., description="CSV matching the dataset columns"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(Role.ADMIN)),
) -> BulkImportResult:
    """Accepts the Kaggle healthcare dataset column layout.

    One row becomes one patient plus one admission. Rows that fail validation
    are skipped and reported; a bad row never aborts the whole import.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise AppException("Upload a .csv file.", code="BAD_FILE_TYPE")
    raw = (await file.read()).decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(raw))
    if not reader.fieldnames:
        raise AppException("The CSV has no header row.", code="EMPTY_CSV")

    received = created = skipped = 0
    errors: list[str] = []

    for index, row in enumerate(reader, start=2):
        received += 1
        try:
            normalised = {k.strip().lower().replace(" ", "_"): (v or "").strip() for k, v in row.items() if k}
            name = normalised.get("name") or normalised.get("full_name")
            if not name:
                raise ValueError("missing Name column")
            mrn = normalised.get("mrn") or generate_mrn(db)
            if db.query(Patient.id).filter(Patient.mrn == mrn).first():
                skipped += 1
                continue
            patient = Patient(
                mrn=mrn,
                created_by=admin.id,
                full_name=name,
                age=int(float(normalised.get("age") or 0)),
                gender=(normalised.get("gender") or "Other").title(),
                blood_type=normalised.get("blood_type") or None,
                primary_condition=(
                    normalised.get("medical_condition")
                    or normalised.get("primary_condition")
                    or "Unknown"
                ),
                insurance_provider=normalised.get("insurance_provider") or None,
                contact_email=normalised.get("contact_email") or None,
            )
            db.add(patient)
            db.flush()

            admitted = _parse_date(normalised.get("date_of_admission"))
            if admitted:
                discharged = _parse_date(normalised.get("discharge_date"))
                if discharged and discharged < admitted:
                    discharged = None
                db.add(
                    Admission(
                        patient_id=patient.id,
                        admission_date=admitted,
                        discharge_date=discharged,
                        length_of_stay=(discharged - admitted).days if discharged else 0,
                        admission_type=(normalised.get("admission_type") or "Elective").title(),
                        medication=normalised.get("medication") or None,
                        test_result=(normalised.get("test_results") or normalised.get("test_result") or "Normal").title(),
                        billing_amount=_parse_float(normalised.get("billing_amount")),
                        hospital=normalised.get("hospital") or None,
                        attending_doctor=normalised.get("doctor") or None,
                        followup_scheduled=False,
                    )
                )
            created += 1
        except Exception as exc:  # per-row isolation
            db.rollback()
            skipped += 1
            if len(errors) < 20:
                errors.append(f"row {index}: {exc}")

    audit_service.record(
        db,
        user_id=admin.id,
        action="PATIENT_BULK_IMPORT",
        entity_type="patient",
        meta={"received": received, "created": created, "skipped": skipped},
        ip_address=get_client_ip(request),
    )
    db.commit()
    return BulkImportResult(
        received=received, created=created, skipped=skipped, errors=errors
    )


@router.post(
    "/{patient_id}/admissions",
    response_model=AdmissionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Record an admission for a patient",
)
def create_admission(
    patient_id: uuid.UUID,
    payload: AdmissionCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Admission:
    patient = get_patient_or_404(db, patient_id)
    admission = Admission(
        patient_id=patient.id,
        length_of_stay=payload.computed_length_of_stay,
        **payload.model_dump(),
    )
    db.add(admission)
    db.flush()
    audit_service.record(
        db,
        user_id=user.id,
        action="ADMISSION_CREATE",
        entity_type="admission",
        entity_id=admission.id,
        meta={"patient_id": str(patient.id)},
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(admission)
    return admission


def _parse_date(value: str | None) -> date | None:
    """Parse the several date formats the public dataset ships with."""
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def _parse_float(value: str | None) -> float | None:
    try:
        return round(float(value), 2) if value else None
    except (TypeError, ValueError):
        return None
