"""EARTHSCOPE - Kharif root-zone soil moisture anomaly from NASA GLDAS (M4).

This is the GLDAS cross-check / fallback, NOT SMAP. GLDAS-2.1 Noah is a land
surface model driven by weather data; it does not use SMAP observations.

Input : data/raw/gldas/gldas_rootzone_monthly_<zone_id>[_partN].csv
        NASA Giovanni "Time Series, Area-Averaged" exports of
        GLDAS-2.1 Noah root zone soil moisture (0.25 deg, kg m-2), either the
        monthly product or the 3-hourly product (averaged to months here).
        Files split into _part1, _part2 ... are joined automatically.
Output: data/processed/soil_moisture_gldas_kharif.{parquet,csv}   one row per zone, latest complete Kharif
        data/processed/soil_moisture_gldas_history.{parquet,csv}  one row per zone per year
        data/processed/soil_moisture_gldas_monthly.{parquet,csv}  one row per zone per month

Method (same-season comparison):
    kharif_mean   = mean of June..September monthly values (all 4 required)
    baseline      = mean and sample std of kharif_mean over BASELINE_YEARS
    anomaly       = kharif_mean - baseline_mean   (also as % and in std units)
    percentile    = % of baseline seasons drier than this season
    monthly table = each month compared with the same calendar month in the baseline

Missing values stay missing; they are never set to zero.
Run:  python science/soil_moisture_gldas.py
"""

from __future__ import annotations

import re
from pathlib import Path

import numpy as np
import pandas as pd

try:  # works both as a package module (backend) and as a standalone script
    from .rainfall_anomaly import read_giovanni_csv
except ImportError:
    from rainfall_anomaly import read_giovanni_csv

def _find_project_root() -> Path:
    """Repo root = nearest parent holding .git or data/processed (works from science/ or backend/app/science/)."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


PROJECT_ROOT = _find_project_root()
RAW = PROJECT_ROOT / "data" / "raw" / "gldas"
PROCESSED = PROJECT_ROOT / "data" / "processed"

KHARIF_MONTHS = (6, 7, 8, 9)
BASELINE_YEARS = (2001, 2020)   # same baseline as the rainfall indicator
UNITS = "kg m-2"                # mm of water held in the model root-zone layer
DATASET = "NASA GLDAS-2.1 Noah root zone soil moisture, 0.25 deg (via NASA Giovanni area average)"


def load_zone(paths: list[Path]) -> tuple[pd.DataFrame, dict[str, str]]:
    """Read one zone's file(s) and return one row per month.

    Giovanni exports may be monthly or sub-monthly (e.g. 3-hourly). Sub-monthly
    values are averaged to calendar months; a month with under 90% of its
    expected time steps is left missing.
    """
    frames, meta = [], {}
    for path in sorted(paths):
        frame, meta = read_giovanni_csv(path)
        frames.append(frame)
    data = (pd.concat(frames).dropna(subset=["time"]).sort_values("time")
            .drop_duplicates("time", keep="last").reset_index(drop=True))
    step_hours = data["time"].diff().median() / pd.Timedelta(hours=1)
    data["year"], data["month"] = data["time"].dt.year, data["time"].dt.month
    if step_hours < 24 * 27:  # sub-monthly input
        expected = data["time"].dt.days_in_month * 24 / step_hours
        grouped = data.assign(expected=expected).groupby(["year", "month"])
        out = grouped.agg(soil_moisture=("value", "mean"), steps=("value", "count"),
                          expected=("expected", "first")).reset_index()
        out.loc[out["steps"] < 0.9 * out["expected"], "soil_moisture"] = np.nan
        out = out[["year", "month", "soil_moisture"]]
        meta["cadence"] = f"{step_hours:g}-hourly values averaged to calendar months"
    else:
        out = data[["year", "month"]].assign(soil_moisture=data["value"])
        meta["cadence"] = "monthly values as downloaded"
    product = re.search(r"data=([^&]+)", meta.get("URL to Reproduce Results", ""))
    meta["product"] = product.group(1) if product else "unknown (no product id in file header)"
    return out, meta


def percentile_of(value: float, reference: pd.Series) -> float:
    reference = reference.dropna()
    if pd.isna(value) or reference.empty:
        return np.nan
    return 100 * float((reference < value).mean())


def kharif_history(monthly: pd.DataFrame) -> pd.DataFrame:
    grouped = monthly[monthly["month"].isin(KHARIF_MONTHS)].groupby("year")["soil_moisture"]
    hist = pd.DataFrame({"kharif_mean_soil_moisture": grouped.mean(),
                         "months_available": grouped.count()}).reset_index()
    hist.loc[hist["months_available"] < len(KHARIF_MONTHS), "kharif_mean_soil_moisture"] = np.nan

    first, last = BASELINE_YEARS
    base = hist.loc[hist["year"].between(first, last), "kharif_mean_soil_moisture"].dropna()
    if len(base) < 15:
        raise ValueError(f"Only {len(base)} complete baseline seasons in {first}-{last}; need at least 15.")
    mean, std = float(base.mean()), float(base.std(ddof=1))
    hist["baseline_mean"] = mean
    hist["baseline_std"] = std
    hist["baseline_period"] = f"{first}-{last}"
    hist["baseline_seasons"] = len(base)
    hist["soil_moisture_anomaly"] = hist["kharif_mean_soil_moisture"] - mean
    hist["soil_moisture_anomaly_pct"] = 100 * hist["soil_moisture_anomaly"] / mean
    hist["soil_moisture_anomaly_std"] = hist["soil_moisture_anomaly"] / std
    hist["soil_moisture_percentile"] = hist["kharif_mean_soil_moisture"].map(lambda v: percentile_of(v, base))
    return hist


def monthly_table(monthly: pd.DataFrame) -> pd.DataFrame:
    first, last = BASELINE_YEARS
    base = monthly[monthly["year"].between(first, last)]
    by_month = {m: g["soil_moisture"] for m, g in base.groupby("month")}
    out = monthly.copy()
    out["baseline_month_mean"] = out["month"].map(lambda m: by_month[m].mean() if m in by_month else np.nan)
    out["month_anomaly"] = out["soil_moisture"] - out["baseline_month_mean"]
    out["month_percentile"] = [percentile_of(v, by_month.get(m, pd.Series(dtype=float)))
                               for v, m in zip(out["soil_moisture"], out["month"])]
    return out


def _save(frame: pd.DataFrame, stem: str) -> None:
    frame.to_csv(PROCESSED / f"{stem}.csv", index=False)
    frame.to_parquet(PROCESSED / f"{stem}.parquet", index=False)


def main() -> None:
    groups: dict[str, list[Path]] = {}
    for path in RAW.glob("gldas_rootzone_monthly_*.csv"):
        zone = re.sub(r"_part\d+$", "", path.stem.replace("gldas_rootzone_monthly_", ""))
        groups.setdefault(zone, []).append(path)
    if not groups:
        raise SystemExit(f"No Giovanni files found in {RAW}")

    histories, monthlies = [], []
    for zone, paths in sorted(groups.items()):
        monthly, meta = load_zone(paths)
        present = monthly.dropna(subset=["soil_moisture"])
        print(f"{zone}: product {meta['product']}; {meta['cadence']}")
        print(f"{zone}: {len(paths)} file(s), {len(present)} months "
              f"({present['year'].min()}-{present['year'].max()}), "
              f"data bbox {meta.get('Data Bounding Box')}, "
              f"range {present['soil_moisture'].min():.1f}-{present['soil_moisture'].max():.1f} {UNITS}")
        if not 50 <= present["soil_moisture"].median() <= 700:
            print(f"WARNING {zone}: values look implausible for root-zone storage in {UNITS}; check the variable.")
        extra = {"zone": zone, "units": UNITS, "data_bbox_wsen": meta.get("Data Bounding Box"),
                 "dataset": DATASET, "giovanni_product_id": meta["product"],
                 "input_cadence": meta["cadence"], "is_demo_data": False}
        histories.append(kharif_history(monthly).assign(**extra))
        monthlies.append(monthly_table(monthly).assign(zone=zone))

    history = pd.concat(histories, ignore_index=True)
    lead = ["zone", "year", "kharif_mean_soil_moisture", "soil_moisture_percentile", "soil_moisture_anomaly",
            "soil_moisture_anomaly_pct", "soil_moisture_anomaly_std"]
    history = history[lead + [c for c in history.columns if c not in lead]]
    history.insert(2, "season", "Kharif (Jun-Sep)")
    complete = history.dropna(subset=["kharif_mean_soil_moisture"])
    latest = complete[complete["year"] == complete.groupby("zone")["year"].transform("max")]
    monthly_all = pd.concat(monthlies, ignore_index=True)
    monthly_all = monthly_all[["zone", "year", "month", "soil_moisture", "baseline_month_mean",
                               "month_anomaly", "month_percentile"]]

    PROCESSED.mkdir(parents=True, exist_ok=True)
    _save(latest.reset_index(drop=True), "soil_moisture_gldas_kharif")
    _save(history, "soil_moisture_gldas_history")
    _save(monthly_all, "soil_moisture_gldas_monthly")

    pd.set_option("display.width", 200)
    print("\nLatest complete Kharif per zone:")
    print(latest[["zone", "year", "kharif_mean_soil_moisture", "baseline_mean", "soil_moisture_anomaly_pct",
                  "soil_moisture_anomaly_std", "soil_moisture_percentile"]].round(1).to_string(index=False))
    season = monthly_all[(monthly_all["year"] == latest["year"].max()) & monthly_all["month"].isin(KHARIF_MONTHS)]
    print("\nMonth by month in that season:")
    print(season.round(1).to_string(index=False))
    print(f"\nWrote soil_moisture_gldas_kharif, _history, _monthly to {PROCESSED}")


if __name__ == "__main__":
    main()
