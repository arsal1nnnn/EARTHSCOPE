from app.database import SessionLocal
from app.models.core import DBRegion, DBVariety

def seed_data():
    db = SessionLocal()
    
    # 1. Seed Regions (Updated to exact Taluka names for M5)
    regions = [
        DBRegion(id="reg_pernem", name="Pernem", district="North Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="reg_salcete", name="Salcete", district="South Goa", available_ecologies=["Khazan", "Kher", "Morod"])
    ]
    
    # 2. Seed Varieties (Updated to exact M4 catalogue names)
    varieties = [
        DBVariety(
            id="var_goadhan1", 
            name="Goa Dhan 1", 
            suitable_ecologies=["Kher", "Morod"], 
            crop_duration_days=115, 
            description="High-yielding variety suitable for Goa ecologies."
        ),
        DBVariety(
            id="var_csr27", 
            name="CSR-27", 
            suitable_ecologies=["Khazan"], 
            crop_duration_days=120, 
            description="Salt-tolerant variety for coastal saline lowlands."
        ),
        DBVariety(
            id="var_karjat3", 
            name="Karjat-3", 
            suitable_ecologies=["Morod", "Kher"], 
            crop_duration_days=110, 
            description="Suitable for rainfed shallow lowlands."
        )
    ]

    # Check if data already exists to prevent duplicates
    if not db.query(DBRegion).first():
        db.add_all(regions)
        db.add_all(varieties)
        db.commit()
        print("Database seeded successfully with exact team parameters!")
    else:
        print("Data already exists. Skipping seed.")
        
    db.close()

if __name__ == "__main__":
    seed_data()