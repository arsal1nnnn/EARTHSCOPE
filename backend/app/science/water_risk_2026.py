"""
water_risk_2026.py  (M4)
========================
PRELIMINARY water-condition indicators for Kharif 2026, kept completely separate from the 2025 tables.

Input   data/processed/rainfall_late_anomalies.csv, rainfall_late_monthly.csv   (rainfall_late.py, IMERG Late Run)
        data/raw/gldas_2026/gldas_rootzone_3h_<zone>_2026.csv                   (Giovanni, GLDAS-2.1 Noah, 2026 only)
        data/processed/soil_moisture_gldas_monthly.csv                          (2001-2020 monthly baseline, same product)
Output  data/processed/water_risk_indicators_2026.{csv,parquet}   one row per district
        data/processed/water_risk_monthly_2026.{csv,parquet}      district x month (Jun-Sep)
        Adds a "kharif_2026" block to every taluka in the map files (nothing else in them is changed):
            data/processed/taluka_map_layer.geojson
            frontend/src/data/goa_taluka_indicators.geojson

Method  Rainfall: Late Run season vs the Late Run's own 2001-2020 baseline (rainfall_late.py).
        Soil moisture: each 2026 month vs the same calendar month in 2001-2020 (percentile = share of
        baseline years that were drier). Same signal rules as 2025: rain -/+20 %, soil moisture 30th/70th.

Read before quoting
    * Everything here is PRELIMINARY: near-real-time rainfall without gauge adjustment.
    * GLDAS-2.1 was released only to 31 Jul 2026 when this was run: soil moisture exists for June and July
      only. There is NO full-season soil-moisture value; August and September are null (not zero).
    * Late Run MONTHLY rainfall is low confidence (in 2025 it differed from the Final Run by up to ~40 points
      in single months). Show the monthly direction, not the percentage.
    * District values. Talukas inherit their district's value for 2026.

Run from the repo root, after rainfall_late.py:  python backend\\app\\science\\water_risk_2026.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

try:
    from .soil_moisture_gldas import BASELINE_YEARS, load_zone, percentile_of
    from .rainfall_taluka import agreement, water_risk_from_agreement
except ImportError:
    from soil_moisture_gldas import BASELINE_YEARS, load_zone, percentile_of
    from rainfall_taluka import agreement, water_risk_from_agreement


def _find_project_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


ROOT = _find_project_root()
RAW_SM = ROOT / "data" / "raw" / "gldas_2026"
PROCESSED = ROOT / "data" / "processed"
MAP_FILES = [PROCESSED / "taluka_map_layer.geojson",
             ROOT / "frontend" / "src" / "data" / "goa_taluka_indicators.geojson"]

YEAR = 2026
KHARIF = (6, 7, 8, 9)
MONTH_IDS = {6: "jun", 7: "jul", 8: "aug", 9: "sep"}
SM_DRY_PCTL, SM_WET_PCTL = 30.0, 70.0
DISTRICT_TO_ZONE = {"North Goa": "north_goa", "South Goa": "south_goa"}
QUALITY = "preliminary"
RAIN_SOURCE = "GPM IMERG Late Run daily v07 (near-real-time, no gauge adjustment), district area average"
SM_SOURCE = "GLDAS-2.1 Noah root-zone soil moisture (~25 km, model; not SMAP), district area average"
MONTHLY_RAIN_NOTE = ("Late Run monthly rainfall is low confidence: show whether a month was below or above normal, "
                     "not the percentage.")


def sm_signal(pctl) -> str:
    if pd.isna(pctl):
        return "no data"
    return "dry" if pctl <= SM_DRY_PCTL else "wet" if pctl >= SM_WET_PCTL else "near normal"


def _nz(value, digits=1):
    """NaN -> None so JSON gets null, never 0."""
    if value is None or pd.isna(value):
        return None
    number = round(float(value), digits)
    return int(number) if digits == 0 else number


def soil_moisture_2026(zone: str, baseline: pd.DataFrame) -> pd.DataFrame:
    """One row per Kharif month of 2026: value, percentile vs same month 2001-2020, signal."""
    paths = sorted(RAW_SM.glob(f"gldas_rootzone_3h_{zone}_{YEAR}*.csv"))
    rows = {m: np.nan for m in KHARIF}
    if paths:
        monthly, meta = load_zone(paths)
        if "RootMoist" not in meta.get("product", ""):
            raise SystemExit(f"{paths[0].name}: not the GLDAS root-zone variable -> {meta.get('product')}")
        for _, r in monthly[(monthly["year"] == YEAR) & monthly["month"].isin(KHARIF)].iterrows():
            rows[int(r["month"])] = r["soil_moisture"]
    first, last = BASELINE_YEARS
    base = baseline[(baseline["zone"] == zone) & baseline["year"].between(first, last)]
    out = []
    for month, value in rows.items():
        ref = base.loc[base["month"] == month, "soil_moisture"]
        pctl = percentile_of(value, ref)
        out.append({"zone": zone, "month": month, "sm_gldas_value": value,
                    "sm_gldas_baseline_month_mean": ref.mean() if len(ref) else np.nan,
                    "sm_gldas_month_percentile": pctl, "sm_gldas_signal": sm_signal(pctl),
                    "sm_baseline_years": int(ref.notna().sum())})
    table = pd.DataFrame(out)

    # Partial-season summary: mean of the months that exist, ranked against the same months in each baseline year.
    have = [m for m in KHARIF if not pd.isna(rows[m])]
    table.attrs["months_available"] = have
    if have:
        per_year = base[base["month"].isin(have)].groupby("year")["soil_moisture"].agg(["mean", "count"])
        ref = per_year.loc[per_year["count"] == len(have), "mean"]
        table.attrs["partial_percentile"] = percentile_of(float(np.mean([rows[m] for m in have])), ref)
    else:
        table.attrs["partial_percentile"] = np.nan
    return table


def compute() -> tuple[pd.DataFrame, pd.DataFrame]:
    for name in ("rainfall_late_anomalies.csv", "rainfall_late_monthly.csv", "soil_moisture_gldas_monthly.csv"):
        if not (PROCESSED / name).is_file():
            raise SystemExit(f"Missing data/processed/{name} (run rainfall_late.py / soil_moisture_gldas.py first)")
    rain = pd.read_csv(PROCESSED / "rainfall_late_anomalies.csv")
    rain_m = pd.read_csv(PROCESSED / "rainfall_late_monthly.csv")
    baseline = pd.read_csv(PROCESSED / "soil_moisture_gldas_monthly.csv")
    rain = rain[rain["year"] == YEAR]
    if rain.empty or rain["kharif_rainfall_mm"].isna().any():
        raise SystemExit(f"No complete Kharif {YEAR} rainfall in rainfall_late_anomalies.csv")

    seasons, months = [], []
    for _, r in rain.iterrows():
        zone = r["zone"]
        sm = soil_moisture_2026(zone, baseline)
        have = sm.attrs["months_available"]
        label = "-".join(MONTH_IDS[m].title() for m in (have[0], have[-1])) if have else None
        partial = sm.attrs["partial_percentile"]

        m = rain_m[(rain_m["zone"] == zone) & (rain_m["year"] == YEAR) & rain_m["month"].isin(KHARIF)]
        m = m[["month", "rainfall_mm", "month_anomaly_pct", "rainfall_signal"]].rename(
            columns={"month_anomaly_pct": "rainfall_month_anomaly_pct"})
        mt = sm.merge(m, on="month", how="left")
        mt["rainfall_signal"] = mt["rainfall_signal"].fillna("no data")
        mt["indicator_agreement"] = [agreement([a, b]) for a, b in zip(mt["rainfall_signal"], mt["sm_gldas_signal"])]
        mt["indicators_with_data"] = (mt["rainfall_signal"].ne("no data").astype(int)
                                      + mt["sm_gldas_signal"].ne("no data").astype(int))
        mt["indicators_expected"] = 2
        mt.insert(1, "season_year", YEAR)
        months.append(mt)

        # Season: rainfall covers Jun-Sep; soil moisture does not, so the season agreement uses rainfall only.
        season_agreement = agreement([r["rainfall_signal"]])
        seasons.append({
            "zone": zone, "season_year": YEAR, "season": "Kharif (Jun-Sep)", "data_quality": QUALITY,
            "kharif_rainfall_mm": r["kharif_rainfall_mm"], "rainfall_anomaly_pct": r["rainfall_anomaly_pct"],
            "rainfall_anomaly_std": r["rainfall_anomaly_std"], "rainfall_percentile": r["rainfall_percentile"],
            "rainfall_category_imd": r["rainfall_category_imd"], "rainfall_signal": r["rainfall_signal"],
            "rainfall_baseline": r.get("baseline_period", f"{BASELINE_YEARS[0]}-{BASELINE_YEARS[1]}"),
            "rainfall_source": RAIN_SOURCE,
            "sm_gldas_percentile": np.nan,                      # no full-season value exists
            "sm_gldas_months_available": label,
            "sm_gldas_partial_percentile": partial,
            "sm_gldas_partial_signal": sm_signal(partial),
            "sm_gldas_source": SM_SOURCE,
            "indicator_agreement": season_agreement,
            "indicators_with_data": 1, "indicators_expected": 2,
            "months_with_concurrent_dry_signals": int((mt["indicator_agreement"] == "concurrent dry signals").sum()),
            "interpretation_limit": (f"PRELIMINARY Kharif {YEAR}: near-real-time rainfall (IMERG Late Run); soil moisture "
                                     f"available for {label or 'no months'} only. District-scale, not field-level, "
                                     "not a forecast, not a crop-loss or yield estimate."),
        })
    monthly = pd.concat(months, ignore_index=True)
    lead = ["zone", "season_year", "month", "rainfall_mm", "rainfall_month_anomaly_pct", "rainfall_signal",
            "sm_gldas_value", "sm_gldas_baseline_month_mean", "sm_gldas_month_percentile", "sm_gldas_signal",
            "indicator_agreement", "indicators_with_data", "indicators_expected", "sm_baseline_years"]
    return pd.DataFrame(seasons), monthly[lead]


def update_map(path: Path, season: pd.DataFrame, monthly: pd.DataFrame) -> bool:
    if not path.is_file():
        return False
    layer = json.loads(path.read_text(encoding="utf-8"))
    s_idx = season.set_index("zone")
    for feature in layer["features"]:
        p = feature["properties"]
        zone = p.get("zone") or DISTRICT_TO_ZONE.get(p.get("district"))
        if zone not in s_idx.index:
            raise SystemExit(f"{path.name}: no {YEAR} indicators for district of {p.get('region_id')}")
        s = s_idx.loc[zone]
        level, score = water_risk_from_agreement(s["indicator_agreement"])
        block = {
            "season": f"Kharif {YEAR} (Jun-Sep)", "data_quality": QUALITY, "baseline": str(s["rainfall_baseline"]),
            "rainfall_anomaly_pct": _nz(s["rainfall_anomaly_pct"]), "rainfall_percentile": _nz(s["rainfall_percentile"], 0),
            "rainfall_category_imd": s["rainfall_category_imd"], "rainfall_signal": s["rainfall_signal"],
            "kharif_rainfall_mm": _nz(s["kharif_rainfall_mm"], 0),
            "rainfall_basis": "district value (inherited by taluka)", "rainfall_source": RAIN_SOURCE,
            "sm_gldas_percentile": None, "sm_gldas_signal": "no data",
            "sm_gldas_months_available": s["sm_gldas_months_available"],
            "sm_gldas_partial_percentile": _nz(s["sm_gldas_partial_percentile"], 0),
            "sm_gldas_partial_signal": s["sm_gldas_partial_signal"], "soil_moisture_source": SM_SOURCE,
            "indicator_agreement": s["indicator_agreement"],
            "indicators_with_data": int(s["indicators_with_data"]), "indicators_expected": int(s["indicators_expected"]),
            "months_with_concurrent_dry_signals": int(s["months_with_concurrent_dry_signals"]),
            "water_risk_level": level, "water_risk_score": score,
            "monthly_rainfall_note": MONTHLY_RAIN_NOTE,
            "spatial_note": (f"{p.get('district')} district value for {YEAR} (preliminary), not specific to "
                             f"{p.get('name')} taluka."),
            "interpretation_limit": s["interpretation_limit"], "is_demo_data": False, "monthly": {},
        }
        for _, m in monthly[monthly["zone"] == zone].iterrows():
            m_level, m_score = water_risk_from_agreement(m["indicator_agreement"])
            block["monthly"][MONTH_IDS[int(m["month"])]] = {
                "rainfall_mm": _nz(m["rainfall_mm"], 0),
                "rainfall_month_anomaly_pct": _nz(m["rainfall_month_anomaly_pct"]),
                "rainfall_signal": m["rainfall_signal"],
                "sm_gldas_month_percentile": _nz(m["sm_gldas_month_percentile"], 0),
                "sm_gldas_signal": m["sm_gldas_signal"],
                "indicator_agreement": m["indicator_agreement"],
                "water_risk_level": m_level, "water_risk_score": m_score,
            }
        p[f"kharif_{YEAR}"] = block
    path.write_text(json.dumps(layer, ensure_ascii=False, allow_nan=False), encoding="utf-8")
    return True


def main() -> None:
    season, monthly = compute()
    for frame, stem in ((season, f"water_risk_indicators_{YEAR}"), (monthly, f"water_risk_monthly_{YEAR}")):
        frame.to_csv(PROCESSED / f"{stem}.csv", index=False)
        try:
            frame.to_parquet(PROCESSED / f"{stem}.parquet", index=False)
        except ImportError:
            print(f"(pyarrow not installed: {stem}.parquet skipped, CSV written)")

    pd.set_option("display.width", 220)
    print(f"PRELIMINARY Kharif {YEAR} - season\n")
    print(season[["zone", "rainfall_anomaly_pct", "rainfall_category_imd", "rainfall_signal", "sm_gldas_months_available",
                  "sm_gldas_partial_percentile", "sm_gldas_partial_signal", "indicator_agreement",
                  "months_with_concurrent_dry_signals"]].round(1).to_string(index=False))
    print(f"\nPRELIMINARY Kharif {YEAR} - monthly\n")
    print(monthly[["zone", "month", "rainfall_month_anomaly_pct", "rainfall_signal", "sm_gldas_value",
                   "sm_gldas_baseline_month_mean", "sm_gldas_month_percentile", "sm_gldas_signal",
                   "indicator_agreement"]].round(1).to_string(index=False))
    print()
    for path in MAP_FILES:
        print(("Added kharif_2026 block to  " if update_map(path, season, monthly) else "Not found, skipped  ") + str(path))


if __name__ == "__main__":
    main()
