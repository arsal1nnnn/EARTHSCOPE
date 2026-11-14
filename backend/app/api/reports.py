from fastapi import APIRouter
from app.schemas.report import ReportResponse
from app.services import report_service

router = APIRouter()

@router.get("/reports/{assessment_id}", response_model=ReportResponse, tags=["Reports"])
def get_assessment_report(assessment_id: str):
    return report_service.generate_report(assessment_id)