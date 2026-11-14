from fastapi import APIRouter
from app.schemas.assessment import AssessmentRequest, AssessmentResponse, ComparisonRequest, ComparisonResponse
from app.services import assessment_service

router = APIRouter()

@router.post("/assessments/rice", response_model=AssessmentResponse, tags=["Assessments"])
def run_rice_assessment(payload: AssessmentRequest):
    return assessment_service.calculate_suitability(payload)

@router.post("/assessments/compare", response_model=ComparisonResponse, tags=["Assessments"])
def run_comparison(payload: ComparisonRequest):
    return assessment_service.compare_varieties(payload)