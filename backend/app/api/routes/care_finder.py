from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.services.places_service import search_facilities

router = APIRouter()


@router.get("/search")
def find_care_facilities(
    query: Optional[str] = Query(None, description="Search term, e.g. Cardiology, Urgent Care, Hospital"),
    lat: Optional[float] = Query(None, description="Latitude for proximity search"),
    lng: Optional[float] = Query(None, description="Longitude for proximity search"),
    facility_type: Optional[str] = Query("all", description="Facility filter (Hospital, Clinic, Pharmacy, Urgent Care)")
):
    """
    Care Finder: Searches nearby clinics, hospitals, pharmacies, and urgent care centers.
    """
    return search_facilities(query=query, lat=lat, lng=lng, facility_type=facility_type)
