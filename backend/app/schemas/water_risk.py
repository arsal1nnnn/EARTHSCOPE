from pydantic import BaseModel
from typing import Optional

class WaterRiskResponse(BaseModel):
    region_id: str
    name: str
    district: str
    season: str
    kharif_rainfall_mm: float
    baseline_mean_mm: float
    rainfall_anomaly_pct: float
    rainfall_percentile: float
    rainfall_category_imd: str
    rainfall_signal: str
    rainfall_source: str
    sm_gldas_percentile: Optional[float] = None
    sm_gldas_signal: Optional[str] = None
    soil_moisture_source: str
    indicator_agreement: str
    water_risk_level: str
    water_risk_score: int
    months_with_concurrent_dry_signals: int
    interpretation_limit: str
    is_demo_data: bool = False
