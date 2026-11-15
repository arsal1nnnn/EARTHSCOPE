from fastapi import APIRouter

from app.schemas.water_risk import WaterRiskResponse
from app.services import water_risk_service

router = APIRouter()


@router.get("/water-risk/{region_id}", response_model=WaterRiskResponse, tags=["Water Risk"])
def get_region_water_risk(region_id: str):
    """region_id: a taluka id (GOA-N-PERNEM), a taluka name (pernem) or a district (north_goa)."""
    return water_risk_service.get_water_risk_for_region(region_id)
