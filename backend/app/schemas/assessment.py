from pydantic import BaseModel
from typing import List, Optional

class AssessmentRequest(BaseModel):
    region_id: str
    ecology: str
    variety_id: str

class AssessmentResponse(BaseModel):
    region_id: str
    variety_id: str
    ecology: str
    suitability_class: str
    suitability_score: float
    supporting_factors: List[str]
    limiting_factors: List[str]
    missing_information: Optional[str] = None
    seasonal_water_context: Optional[str] = None
    source_references: Optional[str] = None
    is_demo_data: bool = False

class ComparisonRequest(BaseModel):
    region_id: str
    ecology: str
    variety_ids: List[str]

class ComparisonResponse(BaseModel):
    comparison_id: str
    results: List[AssessmentResponse]
