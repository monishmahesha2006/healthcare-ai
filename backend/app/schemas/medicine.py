from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MedicineCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: str = Field(..., min_length=1, max_length=100)
    route: Optional[str] = "Oral"
    instructions: Optional[str] = None
    prescribed_by: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    instructions: Optional[str] = None
    is_active: Optional[bool] = None


class MedicineOut(BaseModel):
    id: int
    patient_id: int
    name: str
    dosage: str
    frequency: str
    route: str
    instructions: Optional[str] = None
    prescribed_by: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
