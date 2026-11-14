import uuid
from app.schemas.assessment import AssessmentRequest, AssessmentResponse, ComparisonRequest, ComparisonResponse

def calculate_suitability(request: AssessmentRequest) -> AssessmentResponse:
    run_id = f"evt_{uuid.uuid4().hex[:8]}"
    
    if request.variety_id == "var_corg" and request.ecology == "Morod":
        is_suitable = False
        score = 12.5
        risk = "High"
        notes = ["Korgut requires saline lowlands (Khazan). Uplands lack necessary moisture and soil salinity."]
    else:
        is_suitable = True
        score = 87.2
        risk = "Low"
        notes = ["Optimal matching of variety duration to ecology water retention.", "Demonstration data only."]

    return AssessmentResponse(
        assessment_id=run_id,
        region_id=request.region_id,
        ecology=request.ecology,
        variety_id=request.variety_id,
        is_suitable=is_suitable,
        suitability_score=score,
        water_risk_level=risk,
        scientific_notes=notes,
        is_mock_data=True
    )

def compare_varieties(request: ComparisonRequest) -> ComparisonResponse:
    comp_id = f"cmp_{uuid.uuid4().hex[:8]}"
    results = []
    
    for var_id in request.variety_ids:
        single_request = AssessmentRequest(
            region_id=request.region_id,
            ecology=request.ecology,
            variety_id=var_id
        )
        # Reuse the existing logic for each variety
        assessment = calculate_suitability(single_request)
        results.append(assessment)
        
    return ComparisonResponse(
        comparison_id=comp_id,
        results=results
    )