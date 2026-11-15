<<<<<<< HEAD
from fastapi import APIRouter

=======
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
>>>>>>> origin/feat/goa-geospatial-map
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from pathlib import Path
from app.schemas.water_risk import WaterRiskResponse
from app.services import water_risk_service
from app.database import get_db
from app.database import get_db
from app.models.core import DBRegion
from app.science.rainfall_anomaly import read_giovanni_csv, to_monthly_mm, kharif_history

router = APIRouter()

# 1. Teammate's Fixed Endpoint (DO NOT DELETE)
@router.get("/water-risk/{region_id}", response_model=WaterRiskResponse, tags=["Water Risk"])
<<<<<<< HEAD
def get_region_water_risk(region_id: str):
    """region_id: a taluka id (GOA-N-PERNEM), a taluka name (pernem) or a district (north_goa)"""
    return water_risk_service.get_water_risk_for_region(region_id)
=======
def get_region_water_risk(region_id: str, db: Session = Depends(get_db)):
    return water_risk_service.get_water_risk_for_region(db, region_id)
>>>>>>> origin/feat/goa-geospatial-map

# 2. Your New 25-Year History Endpoint
@router.get("/water-risk/{region_id}/history", tags=["Water Risk"])
def get_region_rainfall_history(region_id: str):
    # 1. Clean the incoming ID (e.g. "GOA-S-CANACONA" -> "canacona")
    clean_id = region_id.lower().replace("goa-n-", "").replace("goa-s-", "").replace("reg_", "")
    
    # 2. Point directly to M4's raw taluka folder
    raw_dir = Path(__file__).resolve().parents[3] / "data" / "raw" / "imerg_taluka"
    
    # 3. Find the specific CSV for this taluka (e.g., "*CANACONA.csv")
    matched_files = list(raw_dir.glob(f"*{clean_id.upper()}.csv"))
    
    if not matched_files:
        raise HTTPException(status_code=404, detail=f"No raw NASA data found for taluka: {clean_id}")
        
    raw_path = matched_files[0]

    try:
        # 4. Execute M4's science functions on the fly!
        raw_df, meta = read_giovanni_csv(raw_path)
        monthly_df = to_monthly_mm(raw_df)
        hist_df = kharif_history(monthly_df)
        
        # 5. Clean and return the results
        clean_history = hist_df.dropna(subset=["kharif_rainfall_mm"])
        
        return {
            "region_id": region_id,
            "taluka_matched": clean_id, 
            "history": clean_history[["year", "kharif_rainfall_mm", "rainfall_anomaly_pct", "rainfall_category_imd"]].to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process taluka history: {str(e)}")