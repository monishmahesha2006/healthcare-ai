from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.services.healthengine import DeductionDetail


class VitalsCreate(BaseModel):
    heart_rate: float = Field(..., ge=20, le=250, description="Beats per minute")
    blood_sugar: float = Field(..., ge=20, le=700, description="mg/dL")
    systolic_bp: float = Field(..., ge=40, le=300, description="mmHg")
    diastolic_bp: float = Field(..., ge=30, le=200, description="mmHg")
    temperature: float = Field(..., ge=30.0, le=45.0, description="°C")
    spo2: float = Field(..., ge=50.0, le=100.0, description="%")
    notes: Optional[str] = None


class HealthScoreOut(BaseModel):
    score: int
    risk_category: str
    deductions_total: int
    deductions: List[DeductionDetail]
    rule_version: str
    disclaimer: str

    class Config:
        from_attributes = True


class VitalsOut(BaseModel):
    id: int
    patient_id: int
    heart_rate: float
    blood_sugar: float
    systolic_bp: float
    diastolic_bp: float
    temperature: float
    spo2: float
    notes: Optional[str] = None
    recorded_at: datetime
    score: Optional[int] = None
    risk_category: Optional[str] = None

    class Config:
        from_attributes = True


class VitalsWithScoreOut(BaseModel):
    vital: VitalsOut
    health_engine: HealthScoreOut
