from sqlalchemy import Column, String, Integer, JSON
from app.database import Base

class DBRegion(Base):
    __tablename__ = "regions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    district = Column(String)
    available_ecologies = Column(JSON)  # Stores lists like ["Morod", "Kher"]

class DBVariety(Base):
    __tablename__ = "varieties"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    suitable_ecologies = Column(JSON)
    crop_duration_days = Column(Integer, nullable=True)
    description = Column(String)