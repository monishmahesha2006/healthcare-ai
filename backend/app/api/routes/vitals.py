from fastapi import APIRouter
from app.schemas.vitals import VitalsCreate, HealthScoreOut
from app.services.healthengine import calculate_healthengine_score

router = APIRouter()


@router.post("/calculate", response_model=HealthScoreOut)
def calculate_score(vitals: VitalsCreate):
    """
    Direct calculation endpoint for testing HealthEngine scoring logic
    without requiring persistent database commits.
    """
    res = calculate_healthengine_score(
        heart_rate=vitals.heart_rate,
        blood_sugar=vitals.blood_sugar,
        systolic_bp=vitals.systolic_bp,
        diastolic_bp=vitals.diastolic_bp,
        temperature=vitals.temperature,
        spo2=vitals.spo2
    )
    return HealthScoreOut.from_orm(res)
