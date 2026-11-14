from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.region import RegionResponse
from app.services import region_service
from app.database import get_db

router = APIRouter()

@router.get("/regions", response_model=List[RegionResponse], tags=["Regions"])
def list_regions(db: Session = Depends(get_db)):
    return region_service.get_all_regions(db)

@router.get("/regions/{region_id}", response_model=RegionResponse, tags=["Regions"])
def get_region(region_id: str, db: Session = Depends(get_db)):
    region = region_service.get_region_by_id(db, region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region