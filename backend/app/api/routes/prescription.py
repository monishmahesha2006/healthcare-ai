from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.models.user import User
from app.models.medicine import Medicine
from app.schemas.prescription import SaveVerifiedPrescriptionRequest
from app.services.prescription_service import process_prescription_upload, PrescriptionParseResult

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "pdf", "webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=PrescriptionParseResult)
async def upload_prescription(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["patient"])),
):
    """
    Uploads a prescription document, performs OCR text extraction,
    and extracts candidate medications.

    Safeguard:
    The candidate medications are returned with requires_human_verification=True
    and are NOT automatically committed to active prescriptions until reviewed.
    """
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum upload limit of 10 MB."
        )

    result = process_prescription_upload(content, file.filename)
    return result


@router.post("/verify-save")
def save_verified_prescription(
    request: SaveVerifiedPrescriptionRequest,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """
    Commits human-verified medications to the patient's active medicine profile.
    Requires user verification before saving.
    """
    saved_meds = []
    for m in request.medications:
        new_med = Medicine(
            patient_id=current_user.id,
            name=m.name.strip(),
            dosage=m.dosage.strip(),
            frequency=m.frequency.strip(),
            route="Oral",
            instructions=m.instructions,
            prescribed_by="Prescription AI (Human Verified)",
            is_active=True
        )
        db.add(new_med)
        saved_meds.append(new_med)

    db.commit()
    return {
        "message": f"Successfully confirmed and saved {len(saved_meds)} medication(s) to active regimen.",
        "count": len(saved_meds)
    }
