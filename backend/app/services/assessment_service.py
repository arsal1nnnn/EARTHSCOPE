from sqlalchemy.orm import Session
from pathlib import Path
import pandas as pd
from fastapi import HTTPException

from app.models.core import DBRegion, DBVariety
from app.schemas.assessment import AssessmentResponse
from app.science.suitability_engine import build_suitability_matrix

def calculate_suitability(db: Session, request):
    # 1. Fetch names from SQLite to match against M4's CSV data
    region = db.query(DBRegion).filter(DBRegion.id == request.region_id).first()
    variety = db.query(DBVariety).filter(DBVariety.id == request.variety_id).first()
    
    if not region or not variety:
        raise HTTPException(status_code=404, detail="Region or Variety not found in database")

    # 2. Fix the file path. 
    # __file__ is backend/app/services/assessment_service.py
    # parents[3] points exactly to the EARTHSCOPE root folder
    data_dir = Path(__file__).resolve().parents[3] / "data" / "processed"

    try:
        # 3. Run M4's engine
        matrix_df = build_suitability_matrix(input_dir=data_dir)
    except SystemExit as e:
        raise HTTPException(status_code=500, detail=f"Science Engine Error: {str(e)}")

    # 4. Filter the matrix for our specific region, variety, AND ecology
    match = matrix_df[
        (matrix_df["zone"] == region.name) & 
        (matrix_df["variety"] == variety.name) & 
        (matrix_df["ecology"].str.lower() == request.ecology.lower())
    ]
    
    if match.empty:
        raise HTTPException(status_code=404, detail="No suitability data found for this combination")

    row = match.iloc[0]

    # 5. Map M4's DataFrame row to your Pydantic response schema
    return AssessmentResponse(
        region_id=request.region_id,
        variety_id=request.variety_id,
        suitability_score=float(row["suitability_score"]) if pd.notna(row["suitability_score"]) else 0.0,
        suitability_class=str(row["suitability_class"]),
        supporting_factors=[f.strip() for f in str(row["supporting_factors"]).split(";") if f.strip()],
        limiting_factors=[f.strip() for f in str(row["limiting_factors"]).split(";") if f.strip()],
        # Added M5's required gap and context fields
        notes=f"Missing Info: {row.get('missing_information', 'None')}. Context: {row.get('seasonal_water_context', 'N/A')}."
    )