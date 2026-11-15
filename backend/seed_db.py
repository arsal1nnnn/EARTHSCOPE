from app.database import SessionLocal, engine, Base
from app.models.core import DBRegion, DBVariety

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # All 12 Goa Talukas with documented agro-ecologies
    regions = [
        DBRegion(id="GOA-N-PERNEM",      name="Pernem",      district="North Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="GOA-N-BARDEZ",      name="Bardez",      district="North Goa", available_ecologies=["Kher", "Khazan"]),
        DBRegion(id="GOA-N-TISWADI",     name="Tiswadi",     district="North Goa", available_ecologies=["Khazan", "Kher"]),
        DBRegion(id="GOA-N-BICHOLIM",    name="Bicholim",    district="North Goa", available_ecologies=["Kher", "Morod"]),
        DBRegion(id="GOA-N-SATTARI",     name="Sattari",     district="North Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="GOA-S-PONDA",       name="Ponda",       district="South Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="GOA-S-MORMUGAO",    name="Mormugao",    district="South Goa", available_ecologies=["Khazan"]),
        DBRegion(id="GOA-S-SALCETE",     name="Salcete",     district="South Goa", available_ecologies=["Khazan", "Kher"]),
        DBRegion(id="GOA-S-QUEPEM",      name="Quepem",      district="South Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="GOA-S-SANGUEM",     name="Sanguem",     district="South Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="GOA-S-DHARBANDORA", name="Dharbandora", district="South Goa", available_ecologies=["Morod", "Kher"]),
        DBRegion(id="GOA-S-CANACONA",    name="Canacona",    district="South Goa", available_ecologies=["Kher", "Khazan"]),
    ]
    
    # All 9 verified varieties from M4 rice_variety_catalogue.csv
    varieties = [
        DBVariety(id="var_goadhan1", name="Goa Dhan 1", suitable_ecologies=["Khazan"], crop_duration_days=132, description="ICAR-CCARI released salt-tolerant variety for coastal saline soils."),
        DBVariety(id="var_goadhan2", name="Goa Dhan 2", suitable_ecologies=["Khazan"], crop_duration_days=128, description="ICAR-CCARI released salt-tolerant variety for coastal saline soils."),
        DBVariety(id="var_goadhan3", name="Goa Dhan 3", suitable_ecologies=["Khazan"], crop_duration_days=122, description="ICAR-CCARI released salt-tolerant variety for coastal saline soils."),
        DBVariety(id="var_goadhan4", name="Goa Dhan 4", suitable_ecologies=["Khazan"], crop_duration_days=128, description="ICAR-CCARI released salt-tolerant variety for coastal saline soils."),
        DBVariety(id="var_csr27",    name="CSR-27",     suitable_ecologies=["Khazan"], crop_duration_days=122, description="Salt-tolerant variety for coastal saline lowlands."),
        DBVariety(id="var_csr36",    name="CSR-36",     suitable_ecologies=["Khazan"], crop_duration_days=138, description="Salt-tolerant variety for coastal saline lowlands."),
        DBVariety(id="var_karjat3",  name="Karjat-3",   suitable_ecologies=["Kher"],   crop_duration_days=122, description="Suitable for rainfed shallow lowlands (ICAR-CCARI recommendation)."),
        DBVariety(id="var_naveen",   name="Naveen",     suitable_ecologies=["Kher"],   crop_duration_days=122, description="Suitable for rainfed shallow lowlands and irrigated conditions."),
        DBVariety(id="var_annada",   name="Annada",     suitable_ecologies=["Morod"],  crop_duration_days=108, description="Short-duration upland variety for rainfed uplands."),
    ]

    # Re-seed database with all 12 talukas and 9 varieties
    db.query(DBRegion).delete()
    db.query(DBVariety).delete()
    db.add_all(regions)
    db.add_all(varieties)
    db.commit()
    print("Database seeded successfully with all 12 Goa talukas and 9 ICAR varieties!")
    db.close()

if __name__ == "__main__":
    seed_data()
