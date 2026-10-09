from typing import List
from pydantic import BaseModel
from app.services.prescription_service import ParsedMedication, PrescriptionParseResult


class SaveVerifiedPrescriptionRequest(BaseModel):
    medications: List[ParsedMedication]
    source_notes: str = "Verified from prescription upload"
