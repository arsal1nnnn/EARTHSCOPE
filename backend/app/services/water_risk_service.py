from sqlalchemy.orm import Session
from fastapi import HTTPException
from pathlib import Path
import pandas as pd

from app.models.core import DBRegion
# Assuming WaterRiskResponse is in app.schemas.water_risk
from app.schemas.water_risk import WaterRiskResponse 

def get_water_risk_for_region(db: Session, region_id: str):
    # 1. Get the region from the database
    region = db.query(DBRegion).filter(DBRegion.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    # 2. Map your DB district (e.g., "North Goa") to M4's zone format ("north_goa")
    zone_name = region.district.lower().replace(" ", "_")
    
    # 3. Locate M4's pre-processed NASA data file
    data_path = Path(__file__).resolve().parents[3] / "data" / "processed" / "rainfall_anomalies.csv"
    
    if not data_path.exists():
        raise HTTPException(status_code=500, detail="Science data file missing from backend.")

    try:
        # 4. Read the CSV and find the matching zone
        df = pd.read_csv(data_path)
        zone_data = df[df["zone"] == zone_name]
        
        if zone_data.empty:
            raise HTTPException(status_code=404, detail=f"No water risk data for zone: {zone_name}")
            
        row = zone_data.iloc[0]
        anomaly_pct = float(row["rainfall_anomaly_pct"])
        
        # 5. Map NASA metrics to probabilities
        flood_risk = 0.8 if anomaly_pct > 20 else (0.4 if anomaly_pct > 0 else 0.1)
        drought_risk = 0.8 if anomaly_pct < -20 else (0.4 if anomaly_pct < 0 else 0.1)
        
        # 6. Return the formatted Pydantic response
        return WaterRiskResponse(
            region_id=region.id,
            rainfall_deviation_pct=anomaly_pct,
            flood_probability=flood_risk,
            drought_probability=drought_risk,
            notes=f"IMD Category: {row['rainfall_category_imd']}. Kharif rainfall: {row['kharif_rainfall_mm']:.1f}mm vs Baseline: {row['baseline_mean_mm']:.1f}mm."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing error: {str(e)}")