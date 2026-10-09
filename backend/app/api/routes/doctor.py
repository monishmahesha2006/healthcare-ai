import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.models.user import User
from app.models.vitals import VitalsRecord, HealthScoreLog
from app.models.appointment import Appointment
from app.models.medicine import Medicine
from app.models.report import MedicalReport
from app.schemas.appointment import AppointmentUpdate, AppointmentOut
from app.schemas.vitals import VitalsOut

router = APIRouter()


@router.get("/patients")
def list_patients(
    search: Optional[str] = None,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """
    Returns list of patients with their latest HealthEngine risk score.
    """
    query = db.query(User).filter(User.role == "patient", User.is_active == True)
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter((User.full_name.ilike(s)) | (User.email.ilike(s)))

    patients = query.order_by(User.full_name.asc()).all()
    results = []

    for p in patients:
        latest_vital = (
            db.query(VitalsRecord)
            .filter(VitalsRecord.patient_id == p.id)
            .order_by(VitalsRecord.recorded_at.desc())
            .first()
        )
        score_val = latest_vital.score_log.score if latest_vital and latest_vital.score_log else None
        risk_cat = latest_vital.score_log.risk_category if latest_vital and latest_vital.score_log else "UNASSESSED"

        results.append({
            "id": p.id,
            "full_name": p.full_name,
            "email": p.email,
            "phone": p.phone,
            "date_of_birth": p.date_of_birth,
            "blood_group": p.blood_group,
            "latest_score": score_val,
            "risk_category": risk_cat,
            "last_recorded": latest_vital.recorded_at if latest_vital else None
        })

    return results


@router.get("/triage-queue")
def get_triage_queue(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """
    Priority Triage Queue: Ranks patients by physiological risk severity
    (HIGH Risk -> MODERATE Risk -> LOW Risk -> Unassessed).
    Assists clinicians in prioritizing acute patient interventions.
    """
    patients = db.query(User).filter(User.role == "patient", User.is_active == True).all()
    triage_list = []

    risk_rank = {"HIGH": 1, "MODERATE": 2, "LOW": 3, "UNASSESSED": 4}

    for p in patients:
        latest_vital = (
            db.query(VitalsRecord)
            .filter(VitalsRecord.patient_id == p.id)
            .order_by(VitalsRecord.recorded_at.desc())
            .first()
        )

        score_log = latest_vital.score_log if latest_vital else None
        risk_category = score_log.risk_category if score_log else "UNASSESSED"
        score_value = score_log.score if score_log else 100

        deductions_list = []
        if score_log and score_log.deductions_summary:
            try:
                deductions_list = json.loads(score_log.deductions_summary)
            except Exception:
                deductions_list = []

        triage_list.append({
            "patient_id": p.id,
            "full_name": p.full_name,
            "email": p.email,
            "phone": p.phone,
            "score": score_value,
            "risk_category": risk_category,
            "rank_order": risk_rank.get(risk_category, 4),
            "latest_vital": {
                "heart_rate": latest_vital.heart_rate,
                "blood_sugar": latest_vital.blood_sugar,
                "systolic_bp": latest_vital.systolic_bp,
                "diastolic_bp": latest_vital.diastolic_bp,
                "temperature": latest_vital.temperature,
                "spo2": latest_vital.spo2,
                "recorded_at": latest_vital.recorded_at,
            } if latest_vital else None,
            "deductions": deductions_list
        })

    # Sort primarily by severity rank (1=HIGH first), secondarily by lowest score
    triage_list.sort(key=lambda x: (x["rank_order"], x["score"]))
    return triage_list


@router.get("/patients/{patient_id}")
def get_patient_details(
    patient_id: int,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """Returns comprehensive clinical profile of an authorized patient."""
    patient = db.query(User).filter(User.id == patient_id, User.role == "patient").first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    vitals = (
        db.query(VitalsRecord)
        .filter(VitalsRecord.patient_id == patient_id)
        .order_by(VitalsRecord.recorded_at.desc())
        .limit(20)
        .all()
    )

    medicines = (
        db.query(Medicine)
        .filter(Medicine.patient_id == patient_id)
        .order_by(Medicine.created_at.desc())
        .all()
    )

    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .order_by(Appointment.appointment_date.desc())
        .all()
    )

    reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.patient_id == patient_id)
        .order_by(MedicalReport.uploaded_at.desc())
        .all()
    )

    v_out_list = []
    for v in vitals:
        vo = VitalsOut.from_orm(v)
        if v.score_log:
            vo.score = v.score_log.score
            vo.risk_category = v.score_log.risk_category
        v_out_list.append(vo)

    return {
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
            "email": patient.email,
            "phone": patient.phone,
            "date_of_birth": patient.date_of_birth,
            "blood_group": patient.blood_group,
            "created_at": patient.created_at
        },
        "vitals_history": v_out_list,
        "medicines": medicines,
        "appointments": [
            {
                "id": a.id,
                "appointment_date": a.appointment_date,
                "reason": a.reason,
                "status": a.status,
                "doctor_notes": a.doctor_notes
            }
            for a in appointments
        ],
        "reports": reports
    }


@router.get("/appointments", response_model=List[AppointmentOut])
def list_doctor_appointments(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """Lists appointments assigned to the logged-in doctor."""
    appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == current_user.id)
        .order_by(Appointment.appointment_date.asc())
        .all()
    )
    results = []
    for a in appointments:
        a_out = AppointmentOut.from_orm(a)
        a_out.doctor_name = current_user.full_name
        a_out.patient_name = a.patient.full_name if a.patient else "Registered Patient"
        results.append(a_out)
    return results


@router.put("/appointments/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    update_in: AppointmentUpdate,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """Updates clinical status and notes for an appointment."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if update_in.status:
        appointment.status = update_in.status
    if update_in.doctor_notes:
        appointment.doctor_notes = update_in.doctor_notes

    db.commit()
    db.refresh(appointment)

    a_out = AppointmentOut.from_orm(appointment)
    a_out.doctor_name = current_user.full_name
    a_out.patient_name = appointment.patient.full_name if appointment.patient else "Registered Patient"
    return a_out
