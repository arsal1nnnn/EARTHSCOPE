from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.variety import VarietyResponse
from app.services import variety_service

router = APIRouter()

@router.get("/rice-varieties", response_model=List[VarietyResponse], tags=["Rice Varieties"])
def list_varieties():
    return variety_service.get_all_varieties()

@router.get("/rice-varieties/{variety_id}", response_model=VarietyResponse, tags=["Rice Varieties"])
def get_variety(variety_id: str):
    variety = variety_service.get_variety_by_id(variety_id)
    if not variety:
        raise HTTPException(status_code=404, detail="Rice variety not found")
    return variety