from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.assessment import AssessmentRequest, AssessmentResponse, ComparisonRequest, ComparisonResponse
from app.services import assessment_service

router = APIRouter()

@router.post("/assessments/rice", response_model=AssessmentResponse, tags=["Assessments"])
def run_rice_assessment(payload: AssessmentRequest, db: Session = Depends(get_db)):
    return assessment_service.calculate_suitability(db, payload)

@router.post("/assessments/compare", response_model=ComparisonResponse, tags=["Assessments"])
def run_comparison(payload: ComparisonRequest, db: Session = Depends(get_db)):
    return assessment_service.compare_varieties(db, payload)
