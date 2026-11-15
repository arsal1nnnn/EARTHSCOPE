from sqlalchemy.orm import Session
from fastapi import HTTPException
from pathlib import Path
import json

from app.models.core import DBRegion
from app.schemas.water_risk import WaterRiskResponse

def get_water_risk_for_region(db: Session, region_id: str) -> WaterRiskResponse:
    # 1. Look up region
    region = db.query(DBRegion).filter(DBRegion.id == region_id).first()
    target_name = region.name if region else region_id.replace("GOA-N-", "").replace("GOA-S-", "").capitalize()

    # 2. Locate M4's verified map layer geojson
    geojson_path = Path(__file__).resolve().parents[3] / "data" / "processed" / "taluka_map_layer.geojson"
    if not geojson_path.exists():
        raise HTTPException(status_code=500, detail="NASA science data file missing from backend.")

    try:
        with open(geojson_path, "r", encoding="utf-8") as f:
            layer = json.load(f)

        found_props = None
        for feat in layer.get("features", []):
            p = feat.get("properties", {})
            if (p.get("region_id") == region_id or 
                p.get("name", "").lower() == target_name.lower() or 
                p.get("region_id", "").lower().endswith(target_name.lower())):
                found_props = p
                break

        if not found_props:
            raise HTTPException(status_code=404, detail=f"No NASA water risk data found for region: {region_id}")

        return WaterRiskResponse(
            region_id=found_props.get("region_id", region_id),
            name=found_props.get("name", target_name),
            district=found_props.get("district", ""),
            season=found_props.get("season", "Kharif 2025 (Jun-Sep)"),
            kharif_rainfall_mm=float(found_props.get("kharif_rainfall_mm", 0.0)),
            baseline_mean_mm=float(found_props.get("baseline_mean_mm", 2181.0 if "North" in found_props.get("district", "") else 2176.0)),
            rainfall_anomaly_pct=float(found_props.get("rainfall_anomaly_pct", 0.0)),
            rainfall_percentile=float(found_props.get("rainfall_percentile", 50.0)),
            rainfall_category_imd=found_props.get("rainfall_category_imd", "Normal"),
            rainfall_signal=found_props.get("rainfall_signal", "near normal"),
            rainfall_source=found_props.get("rainfall_source", "GPM IMERG Final monthly v07 (~11 km)"),
            sm_gldas_percentile=found_props.get("sm_gldas_percentile"),
            sm_gldas_signal=found_props.get("sm_gldas_signal"),
            soil_moisture_source=found_props.get("soil_moisture_source", "GLDAS-2.1 Noah root-zone soil moisture (~25 km, model assimilation)"),
            indicator_agreement=found_props.get("indicator_agreement", "all near normal"),
            water_risk_level=found_props.get("water_risk_level", "Low"),
            water_risk_score=int(found_props.get("water_risk_score", 1)),
            months_with_concurrent_dry_signals=int(found_props.get("months_with_concurrent_dry_signals", 0)),
            interpretation_limit=found_props.get("interpretation_limit", "District-scale water-condition indicators from ~10-28 km gridded products; not field-level, not a crop-loss or yield estimate."),
            is_demo_data=False
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing error: {str(e)}")
