import uuid
from datetime import datetime
from app.schemas.report import ReportResponse

def generate_report(assessment_id: str) -> ReportResponse:
    """
    MOCK INTERFACE for report generation.
    """
    # Generate a dummy report ID and timestamp
    report_id = f"rep_{uuid.uuid4().hex[:8]}"
    timestamp = datetime.utcnow().isoformat()
    
    return ReportResponse(
        report_id=report_id,
        assessment_id=assessment_id,
        summary_text=f"Demonstration Report for Assessment {assessment_id}: Suitability and Water Risk integrated analysis.",
        recommended_actions=[
            "Review NASA water risk projections for the upcoming Kharif season.",
            "Verify field-level soil salinity before recommending Korgut."
        ],
        generated_at=timestamp
    )