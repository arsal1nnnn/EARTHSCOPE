"""EARTHSCOPE - Kharif rainfall anomaly from NASA GPM IMERG (M4).

Input : data/raw/imerg/imerg_monthly_<zone_id>.csv
        NASA Giovanni "Time Series, Area-Averaged" CSV exports of
        GPM_3IMERGM v07 (monthly, 0.1 degree, Final Run) "precipitation".
Output: data/processed/rainfall_anomalies.{parquet,csv}       one row per zone, latest complete Kharif
        data/processed/rainfall_kharif_history.{parquet,csv}  one row per zone per year
        data/processed/rainfall_monthly.{parquet,csv}         one row per zone per month

Method (same-season comparison):
    monthly_mm      = mean rate (mm/hr) x hours in that month
    kharif_mm       = sum of June..September (all 4 months required, else missing)
    baseline        = mean and sample std of kharif_mm over BASELINE_YEARS
    anomaly_mm      = kharif_mm - baseline_mean
    anomaly_pct     = 100 x anomaly_mm / baseline_mean
    anomaly_std     = anomaly_mm / baseline_std
    percentile      = % of baseline seasons drier than this season

Missing values (Giovanni fill value) stay missing; they are never set to zero.
This is a regional rainfall indicator, not a crop-loss or yield estimate.

Run:  python science/rainfall_anomaly.py
"""

from __future__ import annotations

import io
from pathlib import Path

import numpy as np
import pandas as pd

def _find_project_root() -> Path:
    """Repo root = nearest parent holding .git or data/processed (works from science/ or backend/app/science/)."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


PROJECT_ROOT = _find_project_root()
RAW = PROJECT_ROOT / "data" / "raw" / "imerg"
PROCESSED = PROJECT_ROOT / "data" / "processed"

INPUT_UNITS = "mm/hr"            # units chosen on Giovanni: "mm/hr" or "mm/month"
KHARIF_MONTHS = (6, 7, 8, 9)     # June-September
BASELINE_YEARS = (2001, 2020)    # inclusive, 20 seasons
DATASET = "NASA GPM IMERG Final Run monthly, GPM_3IMERGM v07, 0.1 deg (via NASA Giovanni area average)"

# Seasonal rainfall departure categories used by the India Meteorological Department.
IMD_CATEGORIES = ((60.0, "Large excess"), (20.0, "Excess"), (-20.0, "Normal"),
                  (-60.0, "Deficient"), (-100.0, "Large deficient"))


def read_giovanni_csv(path: Path) -> tuple[pd.DataFrame, dict[str, str]]:
    """Return (time, value) rows and the header metadata of a Giovanni time-series CSV."""
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    start = next((i for i, line in enumerate(lines) if line.lower().startswith("time,")), None)
    if start is None:
        raise ValueError(f"{path.name}: no 'time,' header row found; is this a Giovanni time-series CSV?")
    meta: dict[str, str] = {}
    for line in lines[:start]:
        if ":," in line:
            key, value = line.split(":,", 1)
            meta[key.strip()] = value.strip().strip('"')
    frame = pd.read_csv(io.StringIO("\n".join(lines[start:])), skipinitialspace=True)
    frame.columns = ["time", "value"]
    frame["time"] = pd.to_datetime(frame["time"])
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    fill = next((float(v) for k, v in meta.items() if k.lower().startswith("fill value")), -9999.9)
    frame.loc[np.isclose(frame["value"], fill) | (frame["value"] < 0), "value"] = np.nan
    return frame, meta


def to_monthly_mm(frame: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame({"year": frame["time"].dt.year, "month": frame["time"].dt.month})
    if INPUT_UNITS == "mm/hr":
        out["rainfall_mm"] = frame["value"] * frame["time"].dt.days_in_month * 24
    elif INPUT_UNITS == "mm/month":
        out["rainfall_mm"] = frame["value"]
    else:
        raise ValueError(f"Unsupported INPUT_UNITS: {INPUT_UNITS}")
    return out


def imd_category(pct: float) -> str | None:
    if pd.isna(pct):
        return None
    for lower, label in IMD_CATEGORIES:
        if pct >= lower:
            return label
    return IMD_CATEGORIES[-1][1]


def kharif_history(monthly: pd.DataFrame) -> pd.DataFrame:
    season = monthly[monthly["month"].isin(KHARIF_MONTHS)]
    grouped = season.groupby("year")["rainfall_mm"]
    hist = pd.DataFrame({
        "kharif_rainfall_mm": grouped.sum(min_count=len(KHARIF_MONTHS)),
        "months_available": grouped.count(),
    }).reset_index()
    hist.loc[hist["months_available"] < len(KHARIF_MONTHS), "kharif_rainfall_mm"] = np.nan

    first, last = BASELINE_YEARS
    base = hist.loc[hist["year"].between(first, last), "kharif_rainfall_mm"].dropna()
    if len(base) < 15:
        raise ValueError(f"Only {len(base)} complete baseline seasons in {first}-{last}; need at least 15.")
    mean, std = float(base.mean()), float(base.std(ddof=1))

    hist["baseline_mean_mm"] = mean
    hist["baseline_std_mm"] = std
    hist["baseline_period"] = f"{first}-{last}"
    hist["baseline_seasons"] = len(base)
    hist["rainfall_anomaly_mm"] = hist["kharif_rainfall_mm"] - mean
    hist["rainfall_anomaly_pct"] = 100 * hist["rainfall_anomaly_mm"] / mean
    hist["rainfall_anomaly_std"] = hist["rainfall_anomaly_mm"] / std
    hist["rainfall_percentile"] = hist["kharif_rainfall_mm"].map(
        lambda v: np.nan if pd.isna(v) else 100 * float((base < v).mean()))
    hist["rainfall_category_imd"] = hist["rainfall_anomaly_pct"].map(imd_category)
    return hist


def monthly_with_normals(monthly: pd.DataFrame) -> pd.DataFrame:
    first, last = BASELINE_YEARS
    normals = (monthly[monthly["year"].between(first, last)]
               .groupby("month")["rainfall_mm"].mean().rename("baseline_month_mean_mm"))
    out = monthly.join(normals, on="month")
    out["month_anomaly_mm"] = out["rainfall_mm"] - out["baseline_month_mean_mm"]
    # Percent anomaly is unstable in near-dry months, so only report it where the normal is >= 10 mm.
    out["month_anomaly_pct"] = np.where(out["baseline_month_mean_mm"] >= 10,
                                        100 * out["month_anomaly_mm"] / out["baseline_month_mean_mm"], np.nan)
    return out


def _save(frame: pd.DataFrame, stem: str) -> None:
    frame.to_csv(PROCESSED / f"{stem}.csv", index=False)
    frame.to_parquet(PROCESSED / f"{stem}.parquet", index=False)


def main() -> None:
    files = sorted(RAW.glob("imerg_monthly_*.csv"))
    if not files:
        raise SystemExit(f"No Giovanni files found in {RAW} (expected imerg_monthly_<zone_id>.csv)")

    histories, monthlies = [], []
    for path in files:
        zone = path.stem.replace("imerg_monthly_", "")
        raw, meta = read_giovanni_csv(path)
        monthly = to_monthly_mm(raw)
        hist = kharif_history(monthly)
        normal = hist["baseline_mean_mm"].iloc[0]
        if not 1000 <= normal <= 6000:
            print(f"WARNING {zone}: baseline Kharif rainfall is {normal:.0f} mm, implausible for Goa. "
                  f"Check INPUT_UNITS (currently '{INPUT_UNITS}').")
        extra = {"zone": zone, "user_bbox_wsen": meta.get("User Bounding Box"),
                 "data_bbox_wsen": meta.get("Data Bounding Box"), "dataset": DATASET, "is_demo_data": False}
        histories.append(hist.assign(**extra))
        monthlies.append(monthly_with_normals(monthly).assign(zone=zone))

    history = pd.concat(histories, ignore_index=True)
    lead = ["zone", "year", "kharif_rainfall_mm", "rainfall_anomaly_pct", "rainfall_anomaly_mm",
            "rainfall_anomaly_std", "rainfall_percentile", "rainfall_category_imd"]
    history = history[lead + [c for c in history.columns if c not in lead]]
    history.insert(2, "season", "Kharif (Jun-Sep)")

    complete = history.dropna(subset=["kharif_rainfall_mm"])
    latest = complete[complete["year"] == complete.groupby("zone")["year"].transform("max")]

    monthly_all = pd.concat(monthlies, ignore_index=True)
    monthly_all = monthly_all[["zone", "year", "month", "rainfall_mm", "baseline_month_mean_mm",
                               "month_anomaly_mm", "month_anomaly_pct"]]

    PROCESSED.mkdir(parents=True, exist_ok=True)
    _save(latest.reset_index(drop=True), "rainfall_anomalies")
    _save(history, "rainfall_kharif_history")
    _save(monthly_all, "rainfall_monthly")

    pd.set_option("display.width", 200)
    print("Latest complete Kharif per zone:")
    print(latest[["zone", "year", "kharif_rainfall_mm", "baseline_mean_mm", "rainfall_anomaly_pct",
                  "rainfall_anomaly_std", "rainfall_percentile", "rainfall_category_imd"]]
          .round(1).to_string(index=False))
    print(f"\nWrote rainfall_anomalies, rainfall_kharif_history, rainfall_monthly to {PROCESSED}")


if __name__ == "__main__":
    main()
