from pydantic import BaseModel
from typing import List

class RegionBase(BaseModel):
    id: str
    name: str
    district: str
    available_ecologies: List[str]  # e.g., ["Morod", "Kher", "Khazan"]

class RegionResponse(RegionBase):
    pass