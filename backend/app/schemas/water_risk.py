from typing import List, Optional

from pydantic import BaseModel
from typing import Optional


class WaterRiskMonth(BaseModel):
    month: str                                   # "jun", "jul", "aug", "sep"
    rainfall_anomaly_pct: Optional[float] = None
    rainfall_signal: Optional[str] = None        # dry / near normal / wet
    sm_gldas_percentile: Optional[float] = None  # district value
    sm_gldas_signal: Optional[str] = None
    indicator_agreement: Optional[str] = None


class WaterRiskResponse(BaseModel):
    """Separate water-condition indicators computed by M4. No probabilities, no forecast."""
    region_id: str
<<<<<<< HEAD
    region_name: str
    district: str
    season: str                                  # e.g. "Kharif 2025 (Jun-Sep)"
    baseline: str                                # e.g. "2001-2020"

    # Rainfall (GPM IMERG)
    rainfall_anomaly_pct: Optional[float] = None
    rainfall_category_imd: Optional[str] = None
    rainfall_signal: Optional[str] = None
    rainfall_basis: str                          # "taluka bounding-box estimate" or "district value"
    district_rainfall_anomaly_pct: Optional[float] = None

    # Root-zone soil moisture (GLDAS model, always the district value)
    sm_gldas_percentile: Optional[float] = None
    sm_gldas_signal: Optional[str] = None
    soil_moisture_basis: str = "district value"

    indicator_agreement: Optional[str] = None
    indicators_with_data: Optional[int] = None
    indicators_expected: Optional[int] = None
    months_with_concurrent_dry_signals: Optional[int] = None
    monthly: List[WaterRiskMonth] = []

    sources: List[str] = []
    interpretation_limit: str
    is_mock_data: bool = False
=======
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
>>>>>>> origin/feat/goa-geospatial-map
