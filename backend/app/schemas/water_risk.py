from pydantic import BaseModel

class WaterRiskResponse(BaseModel):
    region_id: str
    overall_risk_level: str
    rainfall_deviation_mm: float
    flood_probability_pct: float
    drought_probability_pct: float
    recommendation: str
    is_mock_data: bool = True