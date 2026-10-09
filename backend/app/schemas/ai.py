from typing import Optional, List
from pydantic import BaseModel, Field


class ChatQuery(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str
    is_fallback: bool
    model: str
    timestamp: str


class MedicineExplainQuery(BaseModel):
    medicine_name: str = Field(..., min_length=2, max_length=200)


class ReportExplainQuery(BaseModel):
    text: str = Field(..., min_length=5, max_length=10000)
    title: Optional[str] = "Medical Diagnostic Report"
