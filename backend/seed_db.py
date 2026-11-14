from app.database import SessionLocal
from app.models.core import DBRegion, DBVariety

def seed_data():
    db = SessionLocal()
    
    # 1. Seed Regions
    regions = [
        DBRegion(id="reg_ng_01", name="Pernem Demo Area", district="North Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="reg_sg_01", name="Salcete Coastal Demo", district="South Goa", available_ecologies=["Khazan", "Kher"])
    ]
    
    # 2. Seed Varieties
    varieties = [
        DBVariety(
            id="var_jyothi", 
            name="Jyothi", 
            suitable_ecologies=["Morod", "Kher"], 
            crop_duration_days=115, 
            description="Popular high-yielding variety suitable for rainfed uplands."
        ),
        DBVariety(
            id="var_corg", 
            name="Korgut", 
            suitable_ecologies=["Khazan"], 
            crop_duration_days=120, 
            description="Traditional salt-tolerant variety for coastal saline lowlands."
        )
    ]

    # Check if data already exists to prevent duplicates
    if not db.query(DBRegion).first():
        db.add_all(regions)
        db.add_all(varieties)
        db.commit()
        print("Database seeded successfully!")
    else:
        print("Data already exists. Skipping seed.")
        
    db.close()

if __name__ == "__main__":
    seed_data()