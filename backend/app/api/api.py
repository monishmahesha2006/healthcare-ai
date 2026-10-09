from fastapi import APIRouter
from app.api.routes import (
    auth,
    patient,
    doctor,
    vitals,
    ai,
    prescription,
    care_finder,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(patient.router, prefix="/patient", tags=["Patient Portal"])
api_router.include_router(doctor.router, prefix="/doctor", tags=["Doctor Clinical Portal"])
api_router.include_router(vitals.router, prefix="/vitals", tags=["HealthEngine & Vitals"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Health Services"])
api_router.include_router(prescription.router, prefix="/prescription", tags=["Prescription AI & OCR"])
api_router.include_router(care_finder.router, prefix="/care-finder", tags=["Google Care Finder"])
