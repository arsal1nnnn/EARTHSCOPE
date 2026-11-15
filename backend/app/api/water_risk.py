from fastapi import APIRouter
from app.schemas.water_risk import WaterRiskResponse, WaterRiskHistoryResponse
from app.services import water_risk_service

router = APIRouter()


@router.get("/water-risk/{region_id}", response_model=WaterRiskResponse, tags=["Water Risk"])
def get_region_water_risk(region_id: str):
    """region_id: a taluka id (GOA-N-PERNEM), a taluka name (pernem) or a district (north_goa)."""
    return water_risk_service.get_water_risk_for_region(region_id)


@router.get("/water-risk/{region_id}/history", response_model=WaterRiskHistoryResponse, tags=["Water Risk"])
def get_region_water_risk_history(region_id: str):
    """Returns 25-year (2001-2025) historical Kharif rainfall anomalies and raw NASA mm measurements."""
    return water_risk_service.get_water_risk_history_for_region(region_id)
