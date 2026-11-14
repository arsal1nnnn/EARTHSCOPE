from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.region import RegionResponse
from app.services import region_service

router = APIRouter()

@router.get("/regions", response_model=List[RegionResponse], tags=["Regions"])
def list_regions():
    return region_service.get_all_regions()

@router.get("/regions/{region_id}", response_model=RegionResponse, tags=["Regions"])
def get_region(region_id: str):
    region = region_service.get_region_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region