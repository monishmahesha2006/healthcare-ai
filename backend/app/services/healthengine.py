"""
HealthEngine Scoring Service
Pure deterministic vital-sign risk scoring engine based on established physiological threshold rules.

Disclaimer:
This score is an informational rule-based physiological indicator, NOT a medically validated
prediction or clinical diagnosis. It should never be used alone to prescribe treatment or medication.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DeductionDetail(BaseModel):
    rule_id: str
    parameter: str
    condition: str
    observed_value: float
    deduction: int
    severity: str
    explanation: str


class HealthEngineResult(BaseModel):
    score: int = Field(..., ge=0, le=100)
    risk_category: str  # "LOW", "MODERATE", "HIGH"
    deductions_total: int
    deductions: List[DeductionDetail]
    rule_version: str = "1.0.0"
    disclaimer: str = (
        "HealthEngine score is an automated rule-based physiological indicator for informational "
        "and triage-support purposes only. It is NOT a clinical diagnosis or treatment recommendation."
    )


def calculate_healthengine_score(
    heart_rate: float,
    blood_sugar: float,
    systolic_bp: float,
    diastolic_bp: float,
    temperature: float,
    spo2: float,
) -> HealthEngineResult:
    """
    Calculates the HealthEngine score and breakdown from vital sign measurements.

    Rules Matrix:
    - Heart rate < 50 or > 110 bpm: -18 pts
    - Blood sugar < 70 or > 180 mg/dL: -18 pts
    - Systolic BP >= 140 or Diastolic BP >= 90 mmHg: -18 pts
    - Temperature >= 38.0 °C: -12 pts
    - SpO2 < 94%: -22 pts

    Stratification:
    - Score >= 85: LOW
    - Score 65 to 84: MODERATE
    - Score < 65: HIGH
    """
    initial_score = 100
    deductions: List[DeductionDetail] = []
    total_deductions = 0

    # 1. Heart Rate Rule
    if heart_rate < 50:
        deductions.append(
            DeductionDetail(
                rule_id="HR_LOW",
                parameter="Heart Rate",
                condition="Heart rate < 50 bpm (Bradycardia indicator)",
                observed_value=float(heart_rate),
                deduction=18,
                severity="MODERATE",
                explanation=f"Recorded heart rate ({heart_rate} bpm) is below normal resting baseline (50 bpm)."
            )
        )
        total_deductions += 18
    elif heart_rate > 110:
        deductions.append(
            DeductionDetail(
                rule_id="HR_HIGH",
                parameter="Heart Rate",
                condition="Heart rate > 110 bpm (Tachycardia indicator)",
                observed_value=float(heart_rate),
                deduction=18,
                severity="MODERATE",
                explanation=f"Recorded heart rate ({heart_rate} bpm) exceeds upper normal resting baseline (110 bpm)."
            )
        )
        total_deductions += 18

    # 2. Blood Sugar Rule
    if blood_sugar < 70:
        deductions.append(
            DeductionDetail(
                rule_id="SUGAR_LOW",
                parameter="Blood Sugar",
                condition="Blood sugar < 70 mg/dL (Hypoglycemia indicator)",
                observed_value=float(blood_sugar),
                deduction=18,
                severity="HIGH",
                explanation=f"Blood glucose level ({blood_sugar} mg/dL) indicates potential hypoglycemia."
            )
        )
        total_deductions += 18
    elif blood_sugar > 180:
        deductions.append(
            DeductionDetail(
                rule_id="SUGAR_HIGH",
                parameter="Blood Sugar",
                condition="Blood sugar > 180 mg/dL (Hyperglycemia indicator)",
                observed_value=float(blood_sugar),
                deduction=18,
                severity="MODERATE",
                explanation=f"Blood glucose level ({blood_sugar} mg/dL) exceeds standard glycemic threshold (180 mg/dL)."
            )
        )
        total_deductions += 18

    # 3. Blood Pressure Rule (Systolic >= 140 OR Diastolic >= 90)
    if systolic_bp >= 140 or diastolic_bp >= 90:
        condition_str = []
        if systolic_bp >= 140:
            condition_str.append(f"Systolic >= 140 ({systolic_bp} mmHg)")
        if diastolic_bp >= 90:
            condition_str.append(f"Diastolic >= 90 ({diastolic_bp} mmHg)")

        deductions.append(
            DeductionDetail(
                rule_id="BP_HYPERTENSION",
                parameter="Blood Pressure",
                condition="Systolic BP >= 140 or Diastolic BP >= 90 (Hypertension indicator)",
                observed_value=float(systolic_bp),
                deduction=18,
                severity="MODERATE",
                explanation=f"Blood pressure ({systolic_bp}/{diastolic_bp} mmHg) meets hypertension threshold: {', '.join(condition_str)}."
            )
        )
        total_deductions += 18

    # 4. Temperature Rule (>= 38.0 °C)
    if temperature >= 38.0:
        deductions.append(
            DeductionDetail(
                rule_id="TEMP_FEVER",
                parameter="Body Temperature",
                condition="Temperature >= 38.0 °C (Fever/Pyrexia indicator)",
                observed_value=float(temperature),
                deduction=12,
                severity="MILD",
                explanation=f"Core body temperature ({temperature} °C) meets or exceeds clinical pyrexia cutoff (38.0 °C)."
            )
        )
        total_deductions += 12

    # 5. SpO2 Oxygen Saturation Rule (< 94%)
    if spo2 < 94:
        deductions.append(
            DeductionDetail(
                rule_id="SPO2_HYPOXIA",
                parameter="Oxygen Saturation (SpO2)",
                condition="SpO2 < 94% (Hypoxemia indicator)",
                observed_value=float(spo2),
                deduction=22,
                severity="CRITICAL",
                explanation=f"Oxygen saturation ({spo2}%) is below safe room-air saturation boundary (94%)."
            )
        )
        total_deductions += 22

    # Calculate final score with 0 floor and 100 ceiling
    calculated_score = max(0, initial_score - total_deductions)

    # Determine risk category
    if calculated_score >= 85:
        risk_category = "LOW"
    elif calculated_score >= 65:
        risk_category = "MODERATE"
    else:
        risk_category = "HIGH"

    return HealthEngineResult(
        score=calculated_score,
        risk_category=risk_category,
        deductions_total=total_deductions,
        deductions=deductions,
        rule_version="1.0.0"
    )
