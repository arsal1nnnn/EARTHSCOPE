from pydantic import BaseModel
from typing import List

class ReportResponse(BaseModel):
    report_id: str
    assessment_id: str
    summary_text: str
    recommended_actions: List[str]
    generated_at: str