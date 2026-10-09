from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    doctor_id: Optional[int] = None
    appointment_date: datetime
    reason: str = Field(..., min_length=3, max_length=255)


class AppointmentUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(scheduled|confirmed|completed|cancelled)$")
    doctor_notes: Optional[str] = None


class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    appointment_date: datetime
    reason: str
    status: str
    doctor_notes: Optional[str] = None
    created_at: datetime
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True
