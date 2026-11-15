"""
rainfall_taluka.py  (M4)
========================
Taluka-level Kharif rainfall estimate from GPM IMERG, and update of the map layer.

Input   data/raw/imerg_taluka/imerg_monthly_<REGION_ID>.csv      (Giovanni area-average, one per taluka;
                                                                  optional ..._part1.csv / ..._part2.csv)
        data/boundaries/goa_bounding_boxes.json                  (M5's taluka boxes, used to check each file)
        data/processed/water_risk_indicators.csv / water_risk_monthly.csv   (district soil moisture)
Output  data/processed/rainfall_anomalies_taluka.{csv,parquet}   one row per taluka, Kharif 2025
        data/processed/rainfall_monthly_taluka.{csv,parquet}     taluka x month, Jun-Sep of the season
        Updates IN PLACE (rainfall fields only, every other property is kept):
            data/processed/taluka_map_layer.geojson
            frontend/src/data/goa_taluka_indicators.geojson

Method  Same as rainfall_anomaly.py (same season, baseline 2001-2020, same IMD labels and +/-20% signals),
        applied to the IMERG cells whose centres fall inside each taluka's bounding box.

Read before quoting
    * Box, not boundary: each value is the mean of the 0.1 deg (~11 km) IMERG cells inside M5's taluka
      RECTANGLE. Rectangles overlap, so neighbouring talukas share cells and are not independent.
    * A taluka rests on very few cells (see imerg_cells); this is an estimate, not a gauge measurement.
    * Soil moisture stays DISTRICT level (GLDAS ~25 km cannot separate talukas).

Run from the repo root:  python backend\\app\\science\\rainfall_taluka.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import pandas as pd

try:
    from .rainfall_anomaly import (BASELINE_YEARS, KHARIF_MONTHS, kharif_history, monthly_with_normals,
                                   read_giovanni_csv, to_monthly_mm)
except ImportError:
    from rainfall_anomaly import (BASELINE_YEARS, KHARIF_MONTHS, kharif_history, monthly_with_normals,
                                  read_giovanni_csv, to_monthly_mm)


def _find_project_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


ROOT = _find_project_root()
RAW = ROOT / "data" / "raw" / "imerg_taluka"
PROCESSED = ROOT / "data" / "processed"
BOXES = ROOT / "data" / "boundaries" / "goa_bounding_boxes.json"
MAP_FILES = [PROCESSED / "taluka_map_layer.geojson",
             ROOT / "frontend" / "src" / "data" / "goa_taluka_indicators.geojson"]

RAIN_DRY_PCT, RAIN_WET_PCT = -20.0, 20.0          # same rule as water_risk.py
MONTH_IDS = {6: "jun", 7: "jul", 8: "aug", 9: "sep"}
CELL_DEG = 0.1
SOURCE = "GPM IMERG Final monthly v07 (~11 km), mean of cells inside the taluka bounding box"


def rain_signal(pct) -> str:
    if pd.isna(pct):
        return "no data"
    return "dry" if pct <= RAIN_DRY_PCT else "wet" if pct >= RAIN_WET_PCT else "near normal"


def agreement(signals: list[str]) -> str:           # identical to water_risk.agreement
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


def water_risk_from_agreement(agr: str) -> tuple[str, int]:
    """Derives transparent water risk classification from multi-sensor indicator agreement:
    - High (score 3): concurrent dry signals (both rain & root-zone moisture in deficit)
    - Moderate (score 2): single dry signal (deficit buffered by normal soil moisture)
    - Low (score 1): zero dry signals (all near normal, concurrent wet, or mixed wet/normal)
    """
    if agr == "concurrent dry signals":
        return "High", 3
    if "dry" in agr:
        return "Moderate", 2
    return "Low", 1


def _bbox(text) -> list[float] | None:
    try:
        return [float(x) for x in str(text).split(",")]
    except ValueError:
        return None


def _cell_count(data_bbox) -> int | None:
    """Giovanni's 'Data Bounding Box' spans the centres of the cells it averaged."""
    b = _bbox(data_bbox)
    if not b or len(b) != 4:
        return None
    return (round((b[2] - b[0]) / CELL_DEG) + 1) * (round((b[3] - b[1]) / CELL_DEG) + 1)


def load_taluka_series() -> dict[str, tuple[pd.DataFrame, dict]]:
    files = sorted(RAW.glob("imerg_monthly_*.csv"))
    if not files:
        raise SystemExit(f"No files in {RAW} (expected imerg_monthly_<REGION_ID>.csv)")
    grouped: dict[str, list[Path]] = {}
    for path in files:
        region = re.sub(r"_part\d+$", "", path.stem.replace("imerg_monthly_", "")).upper()
        grouped.setdefault(region, []).append(path)

    expected = json.loads(BOXES.read_text(encoding="utf-8"))["talukas"] if BOXES.is_file() else {}
    out, problems = {}, []
    for region, paths in grouped.items():
        frames, meta = [], {}
        for path in paths:
            raw, meta = read_giovanni_csv(path)
            if "final run" not in meta.get("Title", "").lower() or "monthly" not in meta.get("Title", "").lower():
                problems.append(f"{path.name}: not the IMERG Final Run MONTHLY variable -> {meta.get('Title')}")
            frames.append(raw)
            got, want = _bbox(meta.get("User Bounding Box")), (expected.get(region) or {}).get("bbox_exact")
            if want and (not got or any(abs(g - w) > 0.002 for g, w in zip(got, want))):
                problems.append(f"{path.name}: box in file {got} does not match {region} {[round(w, 4) for w in want]} "
                                "(old box left in Giovanni?) -> download again")
        raw = pd.concat(frames).drop_duplicates("time").sort_values("time").reset_index(drop=True)
        out[region] = (raw, meta)
    if expected:
        missing = sorted(set(expected) - set(out))
        extra = sorted(set(out) - set(expected))
        if missing:
            problems.append(f"No file for: {', '.join(missing)}")
        if extra:
            problems.append(f"Unknown region id in file name: {', '.join(extra)}")
    if problems:
        raise SystemExit("STOPPED - fix these files first:\n  - " + "\n  - ".join(problems))
    return out


def compute() -> tuple[pd.DataFrame, pd.DataFrame]:
    seasons, months = [], []
    for region, (raw, meta) in load_taluka_series().items():
        monthly = to_monthly_mm(raw)
        hist = kharif_history(monthly)
        complete = hist.dropna(subset=["kharif_rainfall_mm"])
        latest = complete[complete["year"] == complete["year"].max()].copy()
        latest.insert(0, "region_id", region)
        latest["rainfall_signal"] = latest["rainfall_anomaly_pct"].map(rain_signal)
        latest["imerg_cells"] = _cell_count(meta.get("Data Bounding Box"))
        latest["user_bbox_wsen"] = meta.get("User Bounding Box")
        latest["data_bbox_wsen"] = meta.get("Data Bounding Box")
        latest["spatial_basis"] = "taluka bounding-box estimate"
        latest["dataset"] = SOURCE
        latest["is_demo_data"] = False
        seasons.append(latest)

        year = int(latest["year"].iloc[0])
        m = monthly_with_normals(monthly)
        m = m[(m["year"] == year) & (m["month"].isin(KHARIF_MONTHS))].copy()
        m.insert(0, "region_id", region)
        m["rainfall_signal"] = m["month_anomaly_pct"].map(rain_signal)
        months.append(m)

    season = pd.concat(seasons, ignore_index=True).rename(columns={"year": "season_year"})
    month = pd.concat(months, ignore_index=True)
    if season["season_year"].nunique() != 1:
        raise SystemExit(f"Talukas end in different seasons: {season[['region_id', 'season_year']].to_dict('records')}")
    return season.sort_values("region_id").reset_index(drop=True), month


def update_map(path: Path, season: pd.DataFrame, month: pd.DataFrame) -> bool:
    """Replace rainfall fields per taluka; keep geometry and every other property untouched."""
    if not path.is_file():
        return False
    layer = json.loads(path.read_text(encoding="utf-8"))
    s_idx = season.set_index("region_id")
    changed = []
    for feature in layer["features"]:
        p = feature["properties"]
        rid = p["region_id"]
        if rid not in s_idx.index:
            raise SystemExit(f"{path.name}: no taluka rainfall for {rid}")
        row = s_idx.loc[rid]
        if p.get("rainfall_basis") != "taluka bounding-box estimate":       # first run: keep the district figure
            p["district_rainfall_anomaly_pct"] = p.get("rainfall_anomaly_pct")
            p["district_rainfall_signal"] = p.get("rainfall_signal")
        p["rainfall_anomaly_pct"] = round(float(row["rainfall_anomaly_pct"]), 1)
        p["rainfall_percentile"] = int(round(float(row["rainfall_percentile"])))
        p["rainfall_category_imd"] = row["rainfall_category_imd"]
        p["rainfall_signal"] = row["rainfall_signal"]
        p["kharif_rainfall_mm"] = int(round(float(row["kharif_rainfall_mm"])))
        p["rainfall_basis"] = "taluka bounding-box estimate"
        p["rainfall_imerg_cells"] = None if pd.isna(row["imerg_cells"]) else int(row["imerg_cells"])
        p["rainfall_source"] = SOURCE
        p["spatial_basis"] = "rainfall: taluka bounding-box estimate; soil moisture: district value inherited"
        p["spatial_note"] = (f"Rainfall is an estimate for {p['name']} from the IMERG cells (~11 km) inside the taluka's "
                             f"bounding box; neighbouring talukas share cells. Soil moisture is the {p['district']} "
                             "district value, not specific to this taluka.")
        p["indicator_agreement"] = agreement([p["rainfall_signal"], p.get("sm_gldas_signal"), p.get("sm_smap_signal")])

        dry_months = 0
        for _, m in month[month["region_id"] == rid].iterrows():
            slot = p.setdefault("monthly", {}).setdefault(MONTH_IDS[int(m["month"])], {})
            slot["rainfall_mm"] = None if pd.isna(m["rainfall_mm"]) else int(round(float(m["rainfall_mm"])))
            slot["rainfall_month_anomaly_pct"] = (None if pd.isna(m["month_anomaly_pct"])
                                                  else round(float(m["month_anomaly_pct"]), 1))
            if slot.get("rainfall_signal") not in (None, m["rainfall_signal"]):
                changed.append(f"{rid} {MONTH_IDS[int(m['month'])]}: {slot['rainfall_signal']} -> {m['rainfall_signal']}")
            slot["rainfall_signal"] = m["rainfall_signal"]
            slot["indicator_agreement"] = agreement([slot["rainfall_signal"], slot.get("sm_gldas_signal"),
                                                     slot.get("sm_smap_signal")])
            m_lvl, m_score = water_risk_from_agreement(slot["indicator_agreement"])
            slot["water_risk_level"] = m_lvl
            slot["water_risk_score"] = m_score
            dry_months += slot["indicator_agreement"] == "concurrent dry signals"
        p["months_with_concurrent_dry_signals"] = int(dry_months)

        s_lvl, s_score = water_risk_from_agreement(p["indicator_agreement"])
        p["water_risk_level"] = s_lvl
        p["water_risk_score"] = s_score

        wr = p.get("water_risk")                     # M5's summary block: refresh level/score, refresh the mirrored facts
        if isinstance(wr, dict):
            wr["level"] = s_lvl
            wr["score"] = s_score
            wr["label"] = f"{s_lvl} Water Risk"
            wr["rainfall_signal"] = p["rainfall_signal"]
            wr["agreement"] = p["indicator_agreement"]
            wr["concurrent_dry_months"] = p["months_with_concurrent_dry_signals"]
            if isinstance(wr.get("summary"), str):
                wr["summary"] = re.sub(r"(recorded )[-+]?\d+(?:\.\d+)?(% rainfall anomaly)(?: \(estimate for [^)]*\))*",
                                       lambda k: f"{k.group(1)}{p['rainfall_anomaly_pct']:+.1f}{k.group(2)} "
                                                 f"(estimate for {p['name']})", wr["summary"])

        # Strip legacy undocumented scalar percentage scores from rice_suitability
        if "rice_suitability" in p and isinstance(p["rice_suitability"], dict):
            p["rice_suitability"].pop("score", None)
            p["rice_suitability"].pop("score_pct", None)
        p.pop("rice_suitability_score", None)
    path.write_text(json.dumps(layer, ensure_ascii=False, allow_nan=False), encoding="utf-8")
    if changed:
        print(f"  monthly rainfall signals that changed in {path.name} (water-risk levels automatically re-derived):")
        for line in changed:
            print("    " + line)
    return True


def main() -> None:
    season, month = compute()
    PROCESSED.mkdir(parents=True, exist_ok=True)
    for frame, stem in ((season, "rainfall_anomalies_taluka"), (month, "rainfall_monthly_taluka")):
        frame.to_csv(PROCESSED / f"{stem}.csv", index=False)
        try:
            frame.to_parquet(PROCESSED / f"{stem}.parquet", index=False)
        except ImportError:
            print(f"(pyarrow not installed: {stem}.parquet skipped, CSV written)")

    pd.set_option("display.width", 220)
    wide = month.pivot(index="region_id", columns="month", values="month_anomaly_pct").round(1)
    wide.columns = [f"{MONTH_IDS[c]}_%" for c in wide.columns]
    show = season.set_index("region_id")[["season_year", "imerg_cells", "kharif_rainfall_mm", "baseline_mean_mm",
                                          "rainfall_anomaly_pct", "rainfall_percentile", "rainfall_signal"]].join(wide)
    print(f"Taluka Kharif rainfall, baseline {BASELINE_YEARS[0]}-{BASELINE_YEARS[1]} (IMERG box estimates)\n")
    print(show.round(1).to_string())

    dup = season[season.duplicated("kharif_rainfall_mm", keep=False)]
    if len(dup):
        print("\nNOTE identical totals (same IMERG cells, or the same box downloaded twice - check): "
              + ", ".join(dup["region_id"]))
    print()
    for path in MAP_FILES:
        print(("Updated  " if update_map(path, season, month) else "Not found, skipped  ") + str(path))


if __name__ == "__main__":
    main()
