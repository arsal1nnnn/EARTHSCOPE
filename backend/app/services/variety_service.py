from sqlalchemy.orm import Session
from app.models.core import DBVariety

def get_all_varieties(db: Session):
    return db.query(DBVariety).all()

def get_variety_by_id(db: Session, variety_id: str):
    return db.query(DBVariety).filter(DBVariety.id == variety_id).first()