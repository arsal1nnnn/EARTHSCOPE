"""
build_map_layer.py  (M4 -> M5)
==============================
Attaches M4's REAL Kharif water indicators to M5's taluka boundaries so the map
can be coloured from analysed data instead of hand-typed demo numbers.

Input   data/boundaries/goa_talukas.geojson      (M5, 12 talukas)
        data/processed/water_risk_indicators.csv  (M4, one row per district)
        data/processed/water_risk_monthly.csv     (M4, district x month)
Output  data/processed/taluka_map_layer.geojson
        frontend/src/data/goa_taluka_indicators.geojson   (same file, only if frontend/src exists)

IMPORTANT - spatial basis
    Rainfall and soil moisture are computed per DISTRICT. Every taluka carries the
    value of its district ("spatial_basis": "district value inherited"). Talukas in
    the same district therefore show identical numbers. This is deliberate and
    must be stated on the map.

Deliberately NOT written (no science behind them): asi_score, stress_category,
soil_moisture_pct, predicted_30d_prob, evidence_coverage.
Missing values are written as null, never as 0.

Run from the repo root:  python backend\\app\\science\\build_map_layer.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import pandas as pd


def _find_project_root() -> Path:
    """Repo root = nearest parent holding .git or data/processed."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


ROOT = _find_project_root()
BOUNDARIES = ROOT / "data" / "boundaries" / "goa_talukas.geojson"
PROCESSED = ROOT / "data" / "processed"
OUT_SHARED = PROCESSED / "taluka_map_layer.geojson"
OUT_FRONTEND = ROOT / "frontend" / "src" / "data" / "goa_taluka_indicators.geojson"

DISTRICT_TO_ZONE = {"North Goa": "north_goa", "South Goa": "south_goa"}
MONTH_IDS = {6: "jun", 7: "jul", 8: "aug", 9: "sep"}   # same ids as M5's month selector

# season columns copied to each taluka: (column in water_risk_indicators, decimals or None for text)
SEASON_FIELDS = [
    ("rainfall_anomaly_pct", 1), ("rainfall_percentile", 0), ("rainfall_category_imd", None),
    ("rainfall_signal", None), ("kharif_rainfall_mm", 0),
    ("sm_gldas_percentile", 0), ("sm_gldas_anomaly_pct", 1), ("sm_gldas_signal", None),
    ("sm_smap_percentile", 0), ("sm_smap_anomaly_pct", 1), ("sm_smap_signal", None),  # appear once SMAP is processed
    ("indicator_agreement", None), ("indicators_with_data", 0), ("indicators_expected", 0),
    ("months_with_concurrent_dry_signals", 0),
]
MONTH_FIELDS = [
    ("rainfall_mm", 0), ("rainfall_month_anomaly_pct", 1), ("rainfall_signal", None),
    ("sm_gldas_month_percentile", 0), ("sm_gldas_signal", None),
    ("sm_smap_month_percentile", 0), ("sm_smap_signal", None),
    ("indicator_agreement", None),
]


def _clean(value, decimals):
    """NaN/None -> None (JSON null). Numbers rounded for display; text unchanged."""
    if value is None or (isinstance(value, float) and math.isnan(value)) or pd.isna(value):
        return None
    if decimals is None:
        return str(value)
    number = round(float(value), decimals)
    return int(number) if decimals == 0 else number


def _pick(row: pd.Series, fields) -> dict:
    return {name: _clean(row[name], dec) for name, dec in fields if name in row.index}


def build_map_layer() -> dict:
    for path in (BOUNDARIES, PROCESSED / "water_risk_indicators.csv", PROCESSED / "water_risk_monthly.csv"):
        if not path.is_file():
            raise FileNotFoundError(f"Missing input: {path}")

    boundaries = json.loads(BOUNDARIES.read_text(encoding="utf-8"))
    season = pd.read_csv(PROCESSED / "water_risk_indicators.csv").set_index("zone")
    monthly = pd.read_csv(PROCESSED / "water_risk_monthly.csv")

    features = []
    for feature in boundaries["features"]:
        base = feature["properties"]
        zone = DISTRICT_TO_ZONE.get(base.get("district"))
        if zone is None or zone not in season.index:
            raise ValueError(f"No district indicators for taluka {base.get('region_id')} (district={base.get('district')!r})")
        row = season.loc[zone]

        props = {
            "region_id": base["region_id"],
            "name": base["name"],
            "district": base["district"],
            "zone": zone,
            "season": f"Kharif {int(row['season_year'])} (Jun-Sep)",
            "baseline": str(row["rainfall_baseline"]),
            "spatial_basis": "district value inherited",
            "spatial_note": (f"Value for {base['district']} district as a whole; not specific to {base['name']} taluka. "
                             "Talukas in the same district show the same value."),
            "is_demo_data": False,
        }
        props.update(_pick(row, SEASON_FIELDS))
        props["rainfall_source"] = "GPM IMERG Final monthly v07 (~11 km), district area average"
        props["soil_moisture_source"] = "GLDAS-2.1 Noah root-zone soil moisture (~25 km, model; not SMAP)"

        months = {}
        for _, m in monthly[monthly["zone"] == zone].iterrows():
            month_id = MONTH_IDS.get(int(m["month"]))
            if month_id:
                months[month_id] = _pick(m, MONTH_FIELDS)
        props["monthly"] = months
        props["interpretation_limit"] = str(row["interpretation_limit"])

        features.append({"type": "Feature", "properties": props, "geometry": feature["geometry"]})

    return {"type": "FeatureCollection", "name": "goa_taluka_water_indicators", "features": features}


def main() -> None:
    layer = build_map_layer()
    text = json.dumps(layer, ensure_ascii=False, allow_nan=False)
    OUT_SHARED.write_text(text, encoding="utf-8")
    print(f"Wrote {OUT_SHARED}  ({len(layer['features'])} talukas)")
    if (ROOT / "frontend" / "src").is_dir():
        OUT_FRONTEND.parent.mkdir(parents=True, exist_ok=True)
        OUT_FRONTEND.write_text(text, encoding="utf-8")
        print(f"Wrote {OUT_FRONTEND}")
    print("\nregion_id            rain %  rain signal   GLDAS pctl  GLDAS signal")
    for f in layer["features"]:
        p = f["properties"]
        print(f"{p['region_id']:<20} {p['rainfall_anomaly_pct']:>6}  {p['rainfall_signal']:<12}  "
              f"{p['sm_gldas_percentile']:>10}  {p['sm_gldas_signal']}")


if __name__ == "__main__":
    main()
