from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.variety import VarietyResponse
from app.services import variety_service
from app.database import get_db

router = APIRouter()

@router.get("/rice-varieties", response_model=List[VarietyResponse], tags=["Rice Varieties"])
def list_varieties(db: Session = Depends(get_db)):
    return variety_service.get_all_varieties(db)

@router.get("/rice-varieties/{variety_id}", response_model=VarietyResponse, tags=["Rice Varieties"])
def get_variety(variety_id: str, db: Session = Depends(get_db)):
    variety = variety_service.get_variety_by_id(db, variety_id)
    if not variety:
        raise HTTPException(status_code=404, detail="Rice variety not found")
    return variety