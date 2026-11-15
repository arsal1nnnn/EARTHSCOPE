from sqlalchemy.orm import Session
from pathlib import Path
import pandas as pd
from fastapi import HTTPException
import uuid

from app.models.core import DBRegion, DBVariety
from app.schemas.assessment import AssessmentRequest, AssessmentResponse, ComparisonRequest, ComparisonResponse
from app.science.suitability_engine import build_suitability_matrix

def calculate_suitability(db: Session, request: AssessmentRequest) -> AssessmentResponse:
    region = db.query(DBRegion).filter(DBRegion.id == request.region_id).first()
    variety = db.query(DBVariety).filter(DBVariety.id == request.variety_id).first()
    
    if not region or not variety:
        raise HTTPException(status_code=404, detail="Region or Variety not found in database")

    data_dir = Path(__file__).resolve().parents[3] / "data" / "processed"

    try:
        matrix_df = build_suitability_matrix(input_dir=data_dir)
    except SystemExit as e:
        raise HTTPException(status_code=500, detail=f"Science Engine Error: {str(e)}")

    match = matrix_df[
        (matrix_df["zone"] == region.name) & 
        (matrix_df["variety"] == variety.name) & 
        (matrix_df["ecology"].str.lower() == request.ecology.lower())
    ]
    
    if match.empty:
        raise HTTPException(status_code=404, detail="No suitability data found for this combination")

    row = match.iloc[0]

    return AssessmentResponse(
        region_id=request.region_id,
        variety_id=request.variety_id,
        ecology=request.ecology,
        suitability_score=float(row["suitability_score"]) if pd.notna(row["suitability_score"]) else 0.0,
        suitability_class=str(row["suitability_class"]),
        supporting_factors=[f.strip() for f in str(row["supporting_factors"]).split(";") if f.strip()],
        limiting_factors=[f.strip() for f in str(row["limiting_factors"]).split(";") if f.strip()],
        missing_information=str(row.get("missing_information")) if pd.notna(row.get("missing_information")) else None,
        seasonal_water_context=str(row.get("seasonal_water_context")) if pd.notna(row.get("seasonal_water_context")) else None,
        source_references=str(row.get("source_references")) if pd.notna(row.get("source_references")) else None,
        is_demo_data=False
    )

def compare_varieties(db: Session, request: ComparisonRequest) -> ComparisonResponse:
    results = []
    for var_id in request.variety_ids:
        sub_req = AssessmentRequest(
            region_id=request.region_id,
            ecology=request.ecology,
            variety_id=var_id
        )
        try:
            res = calculate_suitability(db, sub_req)
            results.append(res)
        except HTTPException:
            continue
    return ComparisonResponse(
        comparison_id=f"comp_{uuid.uuid4().hex[:8]}",
        results=results
    )
