# Hardcoded demonstration data agreed upon with M5 (GIS)
MOCK_REGIONS = [
    {
        "id": "reg_ng_01",
        "name": "Pernem Demo Area",
        "district": "North Goa",
        "available_ecologies": ["Morod", "Kher"]
    },
    {
        "id": "reg_sg_01",
        "name": "Salcete Coastal Demo",
        "district": "South Goa",
        "available_ecologies": ["Khazan", "Kher"]
    }
]

def get_all_regions():
    return MOCK_REGIONS

def get_region_by_id(region_id: str):
    for region in MOCK_REGIONS:
        if region["id"] == region_id:
            return region
    return None