from pydantic import BaseModel
from typing import List, Optional

class VarietyBase(BaseModel):
    id: str
    name: str
    suitable_ecologies: List[str]
    crop_duration_days: Optional[int] = None
    description: str

class VarietyResponse(VarietyBase):
    pass