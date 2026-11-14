"""EARTHSCOPE - agricultural water-risk indicators (M4).

Puts the rainfall and root-zone soil-moisture indicators side by side for each
zone. Each indicator stays separately visible; there is NO combined score.
The only derived fields are plain signal labels and a note on whether the
available indicators agree.

Inputs (data/processed, written by the other science scripts):
    rainfall_anomalies, rainfall_monthly                       (GPM IMERG)
    soil_moisture_<source>_kharif, soil_moisture_<source>_monthly
        for each source in SOIL_MOISTURE_SOURCES that exists (gldas now, smap later)
Outputs:
    water_risk_indicators.{parquet,csv}   one row per zone (seasonal)
    water_risk_monthly.{parquet,csv}      one row per zone per Kharif month

Signal rules (conventions, not crop-specific thresholds):
    rainfall      dry if seasonal departure <= -20 %, wet if >= +20 %   (IMD "deficient"/"excess" boundary)
    soil moisture dry if percentile <= 30, wet if >= 70                 (drought-monitor style percentile classes)
These describe water conditions only. They are not crop-loss or yield estimates.

Run:  python science/water_risk.py
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd


def _find_project_root() -> Path:
    """Repo root = nearest parent holding .git or data/processed (works from science/ or backend/app/science/)."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


PROCESSED = _find_project_root() / "data" / "processed"

SOIL_MOISTURE_SOURCES = ("smap", "gldas")   # every source found is reported, each in its own columns
KHARIF_MONTHS = (6, 7, 8, 9)
RAIN_DRY_PCT, RAIN_WET_PCT = -20.0, 20.0
SM_DRY_PCTL, SM_WET_PCTL = 30.0, 70.0


def _read(stem: str) -> pd.DataFrame | None:
    for suffix, reader in ((".parquet", pd.read_parquet), (".csv", pd.read_csv)):
        path = PROCESSED / f"{stem}{suffix}"
        if path.is_file():
            return reader(path)
    return None


def signal(value, dry_at: float, wet_at: float) -> str:
    if pd.isna(value):
        return "no data"
    if value <= dry_at:
        return "dry"
    if value >= wet_at:
        return "wet"
    return "near normal"


def agreement(signals: list[str]) -> str:
    seen = [s for s in signals if s != "no data"]
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


def main() -> None:
    rain = _read("rainfall_anomalies")
    rain_monthly = _read("rainfall_monthly")
    if rain is None or rain_monthly is None:
        raise SystemExit("Run rainfall_anomaly.py first (rainfall tables not found).")

    seasonal = rain[["zone", "year", "kharif_rainfall_mm", "rainfall_anomaly_pct", "rainfall_anomaly_std",
                     "rainfall_percentile", "rainfall_category_imd", "baseline_period"]].rename(
        columns={"baseline_period": "rainfall_baseline", "year": "season_year"})
    seasonal["rainfall_source"] = "GPM IMERG Final monthly v07"
    seasonal["rainfall_signal"] = seasonal["rainfall_anomaly_pct"].map(lambda v: signal(v, RAIN_DRY_PCT, RAIN_WET_PCT))

    monthly = rain_monthly[rain_monthly["month"].isin(KHARIF_MONTHS)].rename(
        columns={"year": "season_year", "month_anomaly_pct": "rainfall_month_anomaly_pct"})
    monthly = monthly.merge(seasonal[["zone", "season_year"]], on=["zone", "season_year"])
    monthly = monthly[["zone", "season_year", "month", "rainfall_mm", "rainfall_month_anomaly_pct"]]
    monthly["rainfall_signal"] = monthly["rainfall_month_anomaly_pct"].map(
        lambda v: signal(v, RAIN_DRY_PCT, RAIN_WET_PCT))

    signal_cols, used = ["rainfall_signal"], ["rainfall (IMERG)"]
    for source in SOIL_MOISTURE_SOURCES:
        sm, sm_monthly = _read(f"soil_moisture_{source}_kharif"), _read(f"soil_moisture_{source}_monthly")
        if sm is None or sm_monthly is None:
            print(f"note: no soil_moisture_{source} tables found; {source.upper()} columns omitted")
            continue
        p = f"sm_{source}"
        part = sm[["zone", "year", "kharif_mean_soil_moisture", "units", "soil_moisture_percentile",
                   "soil_moisture_anomaly_pct", "soil_moisture_anomaly_std", "baseline_period", "baseline_seasons"]]
        part.columns = ["zone", f"{p}_season_year", f"{p}_kharif_mean", f"{p}_units", f"{p}_percentile",
                        f"{p}_anomaly_pct", f"{p}_anomaly_std", f"{p}_baseline", f"{p}_baseline_seasons"]
        seasonal = seasonal.merge(part, on="zone", how="left")
        same_year = seasonal[f"{p}_season_year"] == seasonal["season_year"]
        if not same_year.all():
            print(f"WARNING: {source.upper()} season year differs from rainfall season year for some zones; "
                  "its signal is set to 'no data' there.")
        seasonal[f"{p}_signal"] = [signal(v, SM_DRY_PCTL, SM_WET_PCTL) if ok else "no data"
                                   for v, ok in zip(seasonal[f"{p}_percentile"], same_year)]
        mpart = sm_monthly.rename(columns={"year": "season_year", "soil_moisture": f"{p}_value",
                                           "month_percentile": f"{p}_month_percentile"})
        monthly = monthly.merge(mpart[["zone", "season_year", "month", f"{p}_value", f"{p}_month_percentile"]],
                                on=["zone", "season_year", "month"], how="left")
        monthly[f"{p}_signal"] = monthly[f"{p}_month_percentile"].map(lambda v: signal(v, SM_DRY_PCTL, SM_WET_PCTL))
        signal_cols.append(f"{p}_signal")
        used.append(f"root-zone soil moisture ({source.upper()})")

    for table in (seasonal, monthly):
        table["indicator_agreement"] = [agreement(list(row)) for row in table[signal_cols].itertuples(index=False)]
        table["indicators_with_data"] = (table[signal_cols] != "no data").sum(axis=1)
        table["indicators_expected"] = len(signal_cols)
    seasonal["indicators_used"] = "; ".join(used)
    seasonal["season"] = "Kharif (Jun-Sep)"
    dry_months = (monthly.assign(d=monthly["indicator_agreement"].eq("concurrent dry signals"))
                  .groupby("zone")["d"].sum().rename("months_with_concurrent_dry_signals"))
    seasonal = seasonal.merge(dry_months, on="zone", how="left")
    seasonal["interpretation_limit"] = ("District-scale water-condition indicators from ~10-28 km gridded "
                                        "products; not field-level, not a crop-loss or yield estimate.")

    for frame, stem in ((seasonal, "water_risk_indicators"), (monthly, "water_risk_monthly")):
        frame.to_csv(PROCESSED / f"{stem}.csv", index=False)
        frame.to_parquet(PROCESSED / f"{stem}.parquet", index=False)

    pd.set_option("display.width", 220)
    show = ["zone", "season_year", "rainfall_anomaly_pct"] + \
           [c for c in seasonal.columns if c.endswith("_percentile") and c.startswith("sm_")] + \
           signal_cols + ["indicator_agreement"]
    print(seasonal[show].round(1).to_string(index=False))
    print()
    print(monthly.drop(columns=["indicators_expected"]).round(1).to_string(index=False))
    print(f"\nWrote water_risk_indicators and water_risk_monthly to {PROCESSED}")


if __name__ == "__main__":
    main()
