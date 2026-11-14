from app.schemas.water_risk import WaterRiskResponse

def get_water_risk_for_region(region_id: str) -> WaterRiskResponse:
    """
    MOCK INTERFACE for M4's NASA water-risk models.
    """
    if region_id == "reg_sg_01": # Salcete Coastal Demo
        return WaterRiskResponse(
            region_id=region_id,
            overall_risk_level="High",
            rainfall_deviation_mm=120.5,
            flood_probability_pct=75.0,
            drought_probability_pct=10.0,
            recommendation="High flood risk. Recommend salt-tolerant and submergence-tolerant varieties.",
            is_mock_data=True
        )
        
    # Default for Pernem (reg_ng_01) and any others
    return WaterRiskResponse(
        region_id=region_id,
        overall_risk_level="Medium",
        rainfall_deviation_mm=-45.0,
        flood_probability_pct=20.0,
        drought_probability_pct=40.0,
        recommendation="Moderate drought risk. Ensure supplemental irrigation for upland ecologies.",
        is_mock_data=True
    )