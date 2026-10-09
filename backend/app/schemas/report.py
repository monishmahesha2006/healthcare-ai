from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    report_type: str = Field("General Diagnostic", max_length=100)
    extracted_text: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_explanation: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    patient_id: int
    title: str
    report_type: str
    file_path: Optional[str] = None
    original_filename: Optional[str] = None
    extracted_text: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_explanation: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
