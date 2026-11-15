from typing import List, Optional
from pydantic import BaseModel, Field


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
    region_name: str
    district: str
    season: str                                  # e.g. "Kharif 2025 (Jun-Sep)"
    baseline: str                                # e.g. "2001-2020"

    # Name alias for compatibility
    name: Optional[str] = None

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

    def model_post_init(self, __context) -> None:
        if self.name is None:
            self.name = self.region_name
