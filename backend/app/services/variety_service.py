MOCK_VARIETIES = [
    {
        "id": "var_jyothi",
        "name": "Jyothi",
        "suitable_ecologies": ["Morod", "Kher"],
        "crop_duration_days": 115,
        "description": "Popular high-yielding variety suitable for rainfed uplands."
    },
    {
        "id": "var_corg",
        "name": "Korgut",
        "suitable_ecologies": ["Khazan"],
        "crop_duration_days": 120,
        "description": "Traditional salt-tolerant variety for coastal saline lowlands."
    }
]

def get_all_varieties():
    return MOCK_VARIETIES

def get_variety_by_id(variety_id: str):
    for var in MOCK_VARIETIES:
        if var["id"] == variety_id:
            return var
    return None