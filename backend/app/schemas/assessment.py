from pydantic import BaseModel
from typing import List, Optional

class AssessmentRequest(BaseModel):
    region_id: str
    ecology: str
    variety_id: str

class AssessmentResponse(BaseModel):
    assessment_id: str
    region_id: str
    ecology: str
    variety_id: str
    is_suitable: bool
    suitability_score: float
    water_risk_level: str
    scientific_notes: List[str]
    is_mock_data: bool = True

# --- NEW COMPARISON SCHEMAS ---

class ComparisonRequest(BaseModel):
    region_id: str
    ecology: str
    variety_ids: List[str]

class ComparisonResponse(BaseModel):
    comparison_id: str
    results: List[AssessmentResponse]