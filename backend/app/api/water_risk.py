from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.water_risk import WaterRiskResponse
from app.services import water_risk_service
from app.database import get_db

router = APIRouter()

@router.get("/water-risk/{region_id}", response_model=WaterRiskResponse, tags=["Water Risk"])
def get_region_water_risk(region_id: str, db: Session = Depends(get_db)):
    return water_risk_service.get_water_risk_for_region(db, region_id)
