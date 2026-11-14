from sqlalchemy.orm import Session
from app.models.core import DBRegion

def get_all_regions(db: Session):
    return db.query(DBRegion).all()

def get_region_by_id(db: Session, region_id: str):
    return db.query(DBRegion).filter(DBRegion.id == region_id).first()