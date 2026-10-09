"""
Database Seed Script
Initializes synthetic demonstration users, vitals, medicines, appointments, and diagnostic reports.
Safe to run idempotently: checks existing emails before insertion.
"""

from datetime import datetime, timedelta, timezone
import json
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.vitals import VitalsRecord, HealthScoreLog
from app.models.medicine import Medicine
from app.models.appointment import Appointment
from app.models.report import MedicalReport
from app.services.healthengine import calculate_healthengine_score


def seed_database(db: Session):
    # Check if already seeded
    existing_patient = db.query(User).filter(User.email == "patient@healthcare.ai").first()
    if existing_patient:
        return

    print("Seeding initial demonstration healthcare accounts and synthetic clinical data...")

    # 1. Create Demo Doctor
    doctor = User(
        email="doctor@healthcare.ai",
        hashed_password=get_password_hash("Doctor@123"),
        full_name="Dr. Eleanor Vance, MD",
        role="doctor",
        specialty="Internal Medicine & Cardiology",
        phone="+1 (555) 789-0123",
        is_active=True
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    # 2. Create Demo Patient 1 (Stable / Low Risk)
    patient1 = User(
        email="patient@healthcare.ai",
        hashed_password=get_password_hash("Patient@123"),
        full_name="Monish Gowda",
        role="patient",
        phone="+1 (555) 987-6543",
        date_of_birth="1998-05-14",
        blood_group="O+",
        is_active=True
    )
    db.add(patient1)

    # 3. Create Demo Patient 2 (Acute / High Risk for Doctor Triage verification)
    patient2 = User(
        email="sarah.p@healthcare.ai",
        hashed_password=get_password_hash("Patient@123"),
        full_name="Sarah Jenkins",
        role="patient",
        phone="+1 (555) 321-7654",
        date_of_birth="1975-11-20",
        blood_group="A-",
        is_active=True
    )
    db.add(patient2)

    # 4. Create Demo Patient 3 (Moderate Risk)
    patient3 = User(
        email="david.k@healthcare.ai",
        hashed_password=get_password_hash("Patient@123"),
        full_name="David Kim",
        role="patient",
        phone="+1 (555) 432-8765",
        date_of_birth="1982-03-09",
        blood_group="B+",
        is_active=True
    )
    db.add(patient3)

    db.commit()
    db.refresh(patient1)
    db.refresh(patient2)
    db.refresh(patient3)

    now = datetime.now(timezone.utc)

    # --- Seed Patient 1 Vitals (Low Risk: Score 100) ---
    v1_normal = VitalsRecord(
        patient_id=patient1.id,
        heart_rate=72.0,
        blood_sugar=95.0,
        systolic_bp=118.0,
        diastolic_bp=78.0,
        temperature=36.7,
        spo2=99.0,
        notes="Routine morning baseline reading. Feeling energetic.",
        recorded_at=now - timedelta(hours=2)
    )
    db.add(v1_normal)
    db.commit()
    db.refresh(v1_normal)

    score_res1 = calculate_healthengine_score(72.0, 95.0, 118.0, 78.0, 36.7, 99.0)
    db.add(HealthScoreLog(
        patient_id=patient1.id,
        vitals_record_id=v1_normal.id,
        score=score_res1.score,
        risk_category=score_res1.risk_category,
        deductions_summary=json.dumps([d.dict() for d in score_res1.deductions]),
        rule_version=score_res1.rule_version,
        calculated_at=v1_normal.recorded_at
    ))

    # Past vital for trend chart
    v1_past = VitalsRecord(
        patient_id=patient1.id,
        heart_rate=76.0,
        blood_sugar=102.0,
        systolic_bp=122.0,
        diastolic_bp=80.0,
        temperature=36.8,
        spo2=98.0,
        notes="Post-lunch walk recording.",
        recorded_at=now - timedelta(days=2)
    )
    db.add(v1_past)
    db.commit()
    db.refresh(v1_past)
    score_res_past = calculate_healthengine_score(76.0, 102.0, 122.0, 80.0, 36.8, 98.0)
    db.add(HealthScoreLog(
        patient_id=patient1.id,
        vitals_record_id=v1_past.id,
        score=score_res_past.score,
        risk_category=score_res_past.risk_category,
        deductions_summary=json.dumps([d.dict() for d in score_res_past.deductions]),
        rule_version=score_res_past.rule_version,
        calculated_at=v1_past.recorded_at
    ))

    # --- Seed Patient 2 Vitals (High Risk: Hypoxemia + Hypertension + High Sugar) ---
    v2_high = VitalsRecord(
        patient_id=patient2.id,
        heart_rate=118.0,       # Tachycardia (-18)
        blood_sugar=210.0,      # Hyperglycemia (-18)
        systolic_bp=155.0,      # Hypertension (-18)
        diastolic_bp=96.0,
        temperature=38.4,       # Pyrexia (-12)
        spo2=91.0,              # Hypoxemia (-22)
        notes="Patient reports dyspnea, chills, and headache.",
        recorded_at=now - timedelta(minutes=45)
    )
    db.add(v2_high)
    db.commit()
    db.refresh(v2_high)
    score_res2 = calculate_healthengine_score(118.0, 210.0, 155.0, 96.0, 38.4, 91.0)
    db.add(HealthScoreLog(
        patient_id=patient2.id,
        vitals_record_id=v2_high.id,
        score=score_res2.score,
        risk_category=score_res2.risk_category,
        deductions_summary=json.dumps([d.dict() for d in score_res2.deductions]),
        rule_version=score_res2.rule_version,
        calculated_at=v2_high.recorded_at
    ))

    # --- Seed Patient 3 Vitals (Moderate Risk: Fever) ---
    v3_mod = VitalsRecord(
        patient_id=patient3.id,
        heart_rate=82.0,
        blood_sugar=110.0,
        systolic_bp=128.0,
        diastolic_bp=82.0,
        temperature=38.2,       # Pyrexia (-12 -> Score 88? wait, fever is -12, so 88 is LOW. Let's add HR > 110: 100 - 18 - 12 = 70 => MODERATE)
        spo2=96.0,
        notes="Mild fever following seasonal exposure.",
        recorded_at=now - timedelta(hours=5)
    )
    db.add(v3_mod)
    db.commit()
    db.refresh(v3_mod)
    # Give David HR 112 so 100 - 18 (HR) - 12 (Temp) = 70 => MODERATE
    v3_mod.heart_rate = 112.0
    db.commit()
    score_res3 = calculate_healthengine_score(112.0, 110.0, 128.0, 82.0, 38.2, 96.0)
    db.add(HealthScoreLog(
        patient_id=patient3.id,
        vitals_record_id=v3_mod.id,
        score=score_res3.score,
        risk_category=score_res3.risk_category,
        deductions_summary=json.dumps([d.dict() for d in score_res3.deductions]),
        rule_version=score_res3.rule_version,
        calculated_at=v3_mod.recorded_at
    ))

    # --- Seed Medicines for Patient 1 ---
    db.add(Medicine(
        patient_id=patient1.id,
        name="Metformin Hydrochloride",
        dosage="500 mg",
        frequency="Twice daily with meals",
        route="Oral",
        instructions="Maintain consistent meal times.",
        prescribed_by="Dr. Eleanor Vance",
        start_date="2026-01-15",
        is_active=True
    ))
    db.add(Medicine(
        patient_id=patient1.id,
        name="Vitamin D3 (Cholecalciferol)",
        dosage="2000 IU",
        frequency="Once daily in the morning",
        route="Oral",
        instructions="Take with healthy dietary fats for absorption.",
        prescribed_by="Self-Reported",
        start_date="2026-02-01",
        is_active=True
    ))

    # --- Seed Appointments ---
    db.add(Appointment(
        patient_id=patient1.id,
        doctor_id=doctor.id,
        appointment_date=now + timedelta(days=2, hours=3),
        reason="Quarterly Comprehensive Health Assessment & Metabolic Review",
        status="confirmed",
        doctor_notes="Review recent fasting glucose and lipid profile records."
    ))
    db.add(Appointment(
        patient_id=patient2.id,
        doctor_id=doctor.id,
        appointment_date=now + timedelta(hours=4),
        reason="Urgent consultation for respiratory distress and elevated vitals",
        status="scheduled"
    ))

    # --- Seed Medical Report ---
    report_text = (
        "METABOLIC & LIPID PANEL DIAGNOSTIC REPORT\n"
        "Laboratory: Quest Health Diagnostics\n"
        "Patient: Monish Gowda | Age: 28 | Gender: Male\n\n"
        "TEST RESULTS:\n"
        "- Fasting Blood Glucose: 92 mg/dL (Reference: 70 - 99 mg/dL) [NORMAL]\n"
        "- Total Cholesterol: 185 mg/dL (Reference: < 200 mg/dL) [OPTIMAL]\n"
        "- HDL Cholesterol: 54 mg/dL (Reference: > 40 mg/dL) [NORMAL]\n"
        "- LDL Cholesterol: 110 mg/dL (Reference: < 100 mg/dL) [BORDERLINE ELEVATED]\n"
        "- Triglycerides: 105 mg/dL (Reference: < 150 mg/dL) [NORMAL]\n"
        "- HbA1c: 5.4% (Reference: < 5.7%) [NORMAL]\n\n"
        "CLINICAL INTERPRETATION:\n"
        "Glycemic control is well-maintained within reference thresholds. "
        "Mild borderline elevation noted in LDL cholesterol. Dietary lifestyle modifications advised."
    )

    db.add(MedicalReport(
        patient_id=patient1.id,
        title="Comprehensive Metabolic & Lipid Panel",
        report_type="Blood Chemistry",
        original_filename="metabolic_lipid_panel_2026.pdf",
        extracted_text=report_text,
        ai_summary="All glycemic metrics (glucose 92 mg/dL, HbA1c 5.4%) are within normal limits. LDL cholesterol is mildly borderline at 110 mg/dL.",
        ai_explanation=(
            "Key Findings:\n"
            "1. Glucose & HbA1c: Your blood sugar controls are in optimal healthy ranges, indicating stable metabolism.\n"
            "2. Lipid Profile: Your HDL ('good') cholesterol and triglycerides are healthy. LDL ('bad') cholesterol is slightly above the strict 100 mg/dL target.\n"
            "3. Actionable Advice: Incorporate fiber-rich foods, reduce saturated fat intake, and review lifestyle adjustments with your doctor at your next appointment.\n\n"
            "*Educational Disclaimer: This report breakdown is for educational purposes and is not a clinical diagnosis.*"
        ),
        uploaded_at=now - timedelta(days=5)
    ))

    db.commit()
    print("Database seeding completed successfully.")
