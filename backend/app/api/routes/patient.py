from datetime import datetime, timezone
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.models.vitals import VitalsRecord, HealthScoreLog
from app.models.medicine import Medicine
from app.models.appointment import Appointment
from app.models.report import MedicalReport
from app.schemas.vitals import VitalsCreate, VitalsOut, VitalsWithScoreOut, HealthScoreOut
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineOut
from app.schemas.appointment import AppointmentCreate, AppointmentOut
from app.schemas.report import ReportCreate, ReportOut
from app.services.healthengine import calculate_healthengine_score
from app.services.ai_service import explain_medical_report

router = APIRouter()


@router.get("/summary")
def get_patient_summary(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Aggregated clinical summary for the authenticated patient."""
    latest_vital = (
        db.query(VitalsRecord)
        .filter(VitalsRecord.patient_id == current_user.id)
        .order_by(VitalsRecord.recorded_at.desc())
        .first()
    )

    latest_score = None
    if latest_vital and latest_vital.score_log:
        latest_score = {
            "score": latest_vital.score_log.score,
            "risk_category": latest_vital.score_log.risk_category,
            "rule_version": latest_vital.score_log.rule_version,
            "deductions_summary": latest_vital.score_log.deductions_summary
        }

    active_medicines_count = (
        db.query(Medicine)
        .filter(Medicine.patient_id == current_user.id, Medicine.is_active == True)
        .count()
    )

    upcoming_appointments = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == current_user.id,
            Appointment.status.in_(["scheduled", "confirmed"])
        )
        .order_by(Appointment.appointment_date.asc())
        .limit(3)
        .all()
    )

    reports_count = db.query(MedicalReport).filter(MedicalReport.patient_id == current_user.id).count()

    return {
        "patient": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "blood_group": current_user.blood_group,
            "date_of_birth": current_user.date_of_birth,
        },
        "latest_vitals": latest_vital,
        "health_score": latest_score,
        "active_medicines_count": active_medicines_count,
        "reports_count": reports_count,
        "upcoming_appointments": [
            {
                "id": a.id,
                "appointment_date": a.appointment_date,
                "reason": a.reason,
                "status": a.status,
                "doctor_name": a.doctor.full_name if a.doctor else "Assigned Physician"
            }
            for a in upcoming_appointments
        ]
    }


# --- VITALS ---
@router.get("/vitals", response_model=List[VitalsOut])
def get_patient_vitals(
    limit: int = 50,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Retrieves authenticated patient's historical vital sign logs."""
    vitals = (
        db.query(VitalsRecord)
        .filter(VitalsRecord.patient_id == current_user.id)
        .order_by(VitalsRecord.recorded_at.desc())
        .limit(limit)
        .all()
    )
    results = []
    for v in vitals:
        v_dict = VitalsOut.from_orm(v)
        if v.score_log:
            v_dict.score = v.score_log.score
            v_dict.risk_category = v.score_log.risk_category
        results.append(v_dict)
    return results


@router.post("/vitals", response_model=VitalsWithScoreOut, status_code=status.HTTP_201_CREATED)
def record_patient_vitals(
    vital_in: VitalsCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """
    Records vital signs and executes the deterministic HealthEngine calculation.
    """
    # 1. Save vital record
    vital_record = VitalsRecord(
        patient_id=current_user.id,
        heart_rate=vital_in.heart_rate,
        blood_sugar=vital_in.blood_sugar,
        systolic_bp=vital_in.systolic_bp,
        diastolic_bp=vital_in.diastolic_bp,
        temperature=vital_in.temperature,
        spo2=vital_in.spo2,
        notes=vital_in.notes,
        recorded_at=datetime.now(timezone.utc)
    )
    db.add(vital_record)
    db.commit()
    db.refresh(vital_record)

    # 2. Run deterministic HealthEngine scoring
    score_result = calculate_healthengine_score(
        heart_rate=vital_in.heart_rate,
        blood_sugar=vital_in.blood_sugar,
        systolic_bp=vital_in.systolic_bp,
        diastolic_bp=vital_in.diastolic_bp,
        temperature=vital_in.temperature,
        spo2=vital_in.spo2
    )

    # 3. Persist score log
    deductions_json = json.dumps([d.dict() for d in score_result.deductions])
    score_log = HealthScoreLog(
        patient_id=current_user.id,
        vitals_record_id=vital_record.id,
        score=score_result.score,
        risk_category=score_result.risk_category,
        deductions_summary=deductions_json,
        rule_version=score_result.rule_version,
        calculated_at=datetime.now(timezone.utc)
    )
    db.add(score_log)
    db.commit()
    db.refresh(score_log)

    v_out = VitalsOut.from_orm(vital_record)
    v_out.score = score_result.score
    v_out.risk_category = score_result.risk_category

    return VitalsWithScoreOut(
        vital=v_out,
        health_engine=HealthScoreOut.from_orm(score_result)
    )


# --- MEDICINES ---
@router.get("/medicines", response_model=List[MedicineOut])
def get_patient_medicines(
    active_only: bool = True,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Retrieves patient's current medications."""
    query = db.query(Medicine).filter(Medicine.patient_id == current_user.id)
    if active_only:
        query = query.filter(Medicine.is_active == True)
    return query.order_by(Medicine.created_at.desc()).all()


@router.post("/medicines", response_model=MedicineOut, status_code=status.HTTP_201_CREATED)
def add_patient_medicine(
    medicine_in: MedicineCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Adds a new medication entry."""
    med = Medicine(
        patient_id=current_user.id,
        name=medicine_in.name.strip(),
        dosage=medicine_in.dosage.strip(),
        frequency=medicine_in.frequency.strip(),
        route=medicine_in.route or "Oral",
        instructions=medicine_in.instructions,
        prescribed_by=medicine_in.prescribed_by or "Self-Reported",
        start_date=medicine_in.start_date,
        end_date=medicine_in.end_date,
        is_active=medicine_in.is_active
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.put("/medicines/{medicine_id}", response_model=MedicineOut)
def update_patient_medicine(
    medicine_id: int,
    med_update: MedicineUpdate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Updates or toggles status of a medication."""
    med = db.query(Medicine).filter(Medicine.id == medicine_id, Medicine.patient_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine record not found")

    if med_update.name is not None:
        med.name = med_update.name
    if med_update.dosage is not None:
        med.dosage = med_update.dosage
    if med_update.frequency is not None:
        med.frequency = med_update.frequency
    if med_update.instructions is not None:
        med.instructions = med_update.instructions
    if med_update.is_active is not None:
        med.is_active = med_update.is_active

    db.commit()
    db.refresh(med)
    return med


# --- APPOINTMENTS ---
@router.get("/appointments", response_model=List[AppointmentOut])
def get_patient_appointments(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Lists appointments for the authenticated patient."""
    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == current_user.id)
        .order_by(Appointment.appointment_date.asc())
        .all()
    )
    results = []
    for a in appointments:
        a_out = AppointmentOut.from_orm(a)
        a_out.doctor_name = a.doctor.full_name if a.doctor else "Assigned Physician"
        a_out.patient_name = current_user.full_name
        results.append(a_out)
    return results


@router.post("/appointments", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book_appointment(
    app_in: AppointmentCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Schedules a new appointment with a doctor."""
    doctor_id = app_in.doctor_id
    if not doctor_id:
        # Default to first available active doctor
        doc = db.query(User).filter(User.role == "doctor", User.is_active == True).first()
        doctor_id = doc.id if doc else None

    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=doctor_id,
        appointment_date=app_in.appointment_date,
        reason=app_in.reason,
        status="scheduled"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    a_out = AppointmentOut.from_orm(appointment)
    a_out.patient_name = current_user.full_name
    a_out.doctor_name = appointment.doctor.full_name if appointment.doctor else "Assigned Physician"
    return a_out


# --- REPORTS ---
@router.get("/reports", response_model=List[ReportOut])
def get_patient_reports(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Lists medical diagnostic reports."""
    return (
        db.query(MedicalReport)
        .filter(MedicalReport.patient_id == current_user.id)
        .order_by(MedicalReport.uploaded_at.desc())
        .all()
    )


@router.post("/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_patient_report(
    report_in: ReportCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Saves report and triggers AI plain-language explanation if extracted text is provided."""
    ai_explanation = report_in.ai_explanation
    if not ai_explanation and report_in.extracted_text:
        ai_res = explain_medical_report(report_in.extracted_text)
        ai_explanation = ai_res.get("text")

    report = MedicalReport(
        patient_id=current_user.id,
        title=report_in.title,
        report_type=report_in.report_type,
        extracted_text=report_in.extracted_text,
        ai_summary=report_in.ai_summary or "Educational summary generated.",
        ai_explanation=ai_explanation
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
