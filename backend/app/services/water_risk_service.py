"""
Water-risk service: returns M4's computed indicators for a taluka or district.

Reads only M4's processed tables in data/processed/. It does NOT invent anything:
no flood/drought probabilities, no forecast. Missing values are returned as null.

    water_risk_indicators.csv      district, season      (rainfall + GLDAS soil moisture)
    water_risk_monthly.csv         district x month
    rainfall_anomalies_taluka.csv  taluka, season        (optional; IMERG taluka estimate)
    rainfall_monthly_taluka.csv    taluka x month        (optional)
"""
import json
import math
from pathlib import Path

import pandas as pd
from fastapi import HTTPException

from app.schemas.water_risk import WaterRiskMonth, WaterRiskResponse, RainfallHistoryYear, WaterRiskHistoryResponse

ROOT = Path(__file__).resolve().parents[3]
PROCESSED = ROOT / "data" / "processed"
TALUKAS = ROOT / "data" / "boundaries" / "goa_talukas.geojson"

DISTRICTS = {"north_goa": "North Goa", "south_goa": "South Goa"}
MONTH_IDS = {6: "jun", 7: "jul", 8: "aug", 9: "sep"}
SOURCES = [
    "Rainfall: NASA GPM IMERG Final Run monthly v07 (~11 km)",
    "Soil moisture: NASA GLDAS-2.1 Noah root-zone soil moisture (~25 km, model; not SMAP)",
    "Method and limitations: docs/science_methodology.md",
]
LIMIT = ("Kharif 2025 conditions, not the current season and not a forecast. Rainfall is a taluka-box estimate "
         "where available; soil moisture is a district value. Not field-level; not a crop-loss or yield estimate.")


def _num(value, digits=1):
    """NaN / missing -> None (never 0)."""
    if value is None or pd.isna(value):
        return None
    return round(float(value), digits)


def _text(value):
    return None if value is None or pd.isna(value) else str(value)


def _read(name: str, required: bool = True):
    path = PROCESSED / name
    if not path.is_file():
        if required:
            raise HTTPException(status_code=500, detail=f"Science table missing: data/processed/{name}")
        return None
    return pd.read_csv(path)


def _agreement(signals):                      # same rule as backend/app/science/water_risk.py
    seen = [s for s in signals if s and s != "no data"]
    if not seen:
        return "no data"
    if len(seen) == 1:
        return f"single indicator only ({seen[0]})"
    if all(s == "dry" for s in seen):
        return "concurrent dry signals"
    if all(s == "wet" for s in seen):
        return "concurrent wet signals"
    if all(s == "near normal" for s in seen):
        return "all near normal"
    if "dry" in seen and "wet" in seen:
        return "conflicting signals"
    return "mixed: " + ", ".join(sorted(set(seen)))


def _resolve(region_id: str):
    """-> (region_id, name, zone, is_taluka). Accepts GOA-N-PERNEM, pernem, reg_pernem, north_goa, 'North Goa'."""
    key = region_id.strip().lower().replace(" ", "_").replace("reg_", "")
    if key in DISTRICTS:
        return key, DISTRICTS[key], key, False
    if TALUKAS.is_file():
        for feature in json.loads(TALUKAS.read_text(encoding="utf-8"))["features"]:
            p = feature["properties"]
            if key in (p["region_id"].lower(), p["name"].lower()):
                return p["region_id"], p["name"], p["district"].lower().replace(" ", "_"), True
    raise HTTPException(status_code=404, detail=f"Unknown region: {region_id}")


def get_water_risk_for_region(region_id: str = None, db=None) -> WaterRiskResponse:   # db kept optional for older callers
    # Handle if called with (db, region_id) positionally
    if not isinstance(region_id, str) and isinstance(db, str):
        actual_rid = db
    else:
        actual_rid = region_id

    rid, name, zone, is_taluka = _resolve(actual_rid)

    season = _read("water_risk_indicators.csv")
    monthly = _read("water_risk_monthly.csv")
    rows = season[season["zone"] == zone]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No water indicators for district: {zone}")
    d = rows.iloc[0]

    rain_pct, rain_cat, rain_sig = d["rainfall_anomaly_pct"], d["rainfall_category_imd"], d["rainfall_signal"]
    basis, t_month = "district value", None
    if is_taluka:
        t_season = _read("rainfall_anomalies_taluka.csv", required=False)
        t_month = _read("rainfall_monthly_taluka.csv", required=False)
        if t_season is not None and (t_season["region_id"] == rid).any():
            t = t_season[t_season["region_id"] == rid].iloc[0]
            rain_pct, rain_cat, rain_sig = t["rainfall_anomaly_pct"], t["rainfall_category_imd"], t["rainfall_signal"]
            basis = "taluka bounding-box estimate"
        else:
            basis = "district value (inherited by taluka)"

    months, dry_months = [], 0
    for _, m in monthly[monthly["zone"] == zone].sort_values("month").iterrows():
        m_pct, m_sig = m["rainfall_month_anomaly_pct"], m["rainfall_signal"]
        if basis == "taluka bounding-box estimate" and t_month is not None:
            hit = t_month[(t_month["region_id"] == rid) & (t_month["month"] == m["month"])]
            if not hit.empty:
                m_pct, m_sig = hit.iloc[0]["month_anomaly_pct"], hit.iloc[0]["rainfall_signal"]
        agree = _agreement([_text(m_sig), _text(m.get("sm_gldas_signal"))])
        dry_months += agree == "concurrent dry signals"
        months.append(WaterRiskMonth(
            month=MONTH_IDS.get(int(m["month"]), str(m["month"])),
            rainfall_anomaly_pct=_num(m_pct), rainfall_signal=_text(m_sig),
            sm_gldas_percentile=_num(m.get("sm_gldas_month_percentile"), 0),
            sm_gldas_signal=_text(m.get("sm_gldas_signal")), indicator_agreement=agree))

    n_data = _num(d.get("indicators_with_data"), 0)
    n_expected = _num(d.get("indicators_expected"), 0)
    return WaterRiskResponse(
        region_id=rid, region_name=name, district=DISTRICTS.get(zone, zone),
        season=f"Kharif {int(d['season_year'])} (Jun-Sep)", baseline=str(d["rainfall_baseline"]),
        rainfall_anomaly_pct=_num(rain_pct), rainfall_category_imd=_text(rain_cat), rainfall_signal=_text(rain_sig),
        rainfall_basis=basis, district_rainfall_anomaly_pct=_num(d["rainfall_anomaly_pct"]),
        sm_gldas_percentile=_num(d.get("sm_gldas_percentile"), 0), sm_gldas_signal=_text(d.get("sm_gldas_signal")),
        indicator_agreement=_agreement([_text(rain_sig), _text(d.get("sm_gldas_signal"))]),
        indicators_with_data=None if n_data is None else int(n_data),
        indicators_expected=None if n_expected is None else int(n_expected),
        months_with_concurrent_dry_signals=int(dry_months),
        monthly=months, sources=SOURCES, interpretation_limit=LIMIT, is_mock_data=False)


def get_water_risk_history_for_region(region_id: str) -> WaterRiskHistoryResponse:
    """Returns 25-year (2001-2025) historical Kharif rainfall anomalies and raw measurements."""
    rid, name, zone, is_taluka = _resolve(region_id)
    history_df = _read("rainfall_kharif_history.csv")
    zone_rows = history_df[history_df["zone"] == zone].sort_values("year")
    if zone_rows.empty:
        raise HTTPException(status_code=404, detail=f"No rainfall history for district: {zone}")

    items = []
    for _, r in zone_rows.iterrows():
        items.append(
            RainfallHistoryYear(
                year=int(r["year"]),
                kharif_rainfall_mm=_num(r["kharif_rainfall_mm"], 1),
                rainfall_anomaly_pct=_num(r["rainfall_anomaly_pct"], 1),
                rainfall_category_imd=_text(r["rainfall_category_imd"]) or "Normal",
                rainfall_percentile=_num(r.get("rainfall_percentile"), 0),
                rainfall_anomaly_mm=_num(r.get("rainfall_anomaly_mm"), 1),
                baseline_mean_mm=_num(r.get("baseline_mean_mm"), 1),
            )
        )

    return WaterRiskHistoryResponse(
        region_id=rid,
        region_name=name,
        district=DISTRICTS.get(zone, zone),
        baseline_period=str(zone_rows.iloc[0].get("baseline_period", "2001-2020")),
        source="NASA GPM IMERG Final Run monthly v07 (~11 km)",
        history=items,
    )

