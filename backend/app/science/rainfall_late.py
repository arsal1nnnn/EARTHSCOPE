"""
rainfall_late.py  (M4)
======================
Kharif rainfall anomaly from the IMERG LATE RUN (near-real-time), so that a season newer than the
research-quality Final Run (which ends Sep 2025) can be shown. Used for Kharif 2026, PRELIMINARY.

Input   data/raw/imerg_late/imerg_late_daily_<zone>_part<N>.csv   (Giovanni area-average, daily, GPM_3IMERGDL v07)
Output  data/processed/rainfall_late_kharif_history.{csv,parquet}  zone x year, all years
        data/processed/rainfall_late_anomalies.{csv,parquet}       zone x season for SEASONS_TO_REPORT
        data/processed/rainfall_late_monthly.{csv,parquet}         zone x month for those seasons (May-Sep)

Method
    1. Daily area-mean rain (mm/day) -> monthly total = mean of valid days x days in month.
       A month needs >= 90 % of its days; otherwise it is missing (never zero).
    2. Same season, same formulas as rainfall_anomaly.py (Kharif = Jun-Sep, baseline 2001-2020,
       IMD classes, dry/wet signal at -/+20 %).
    3. LIKE WITH LIKE: the Late Run season is compared with the LATE RUN's own 2001-2020 baseline,
       never with the Final Run baseline (the Late Run has no monthly rain-gauge adjustment).
    4. Cross-check printed at the end: Late Run 2025 against the Final Run 2025 result.

Limits  Late Run is a near-real-time product without gauge adjustment: label every 2026 figure
        "preliminary (IMERG Late Run)". District boxes, ~11 km cells, not field-level, not a forecast.

Run from the repo root:  python backend\\app\\science\\rainfall_late.py
"""
from __future__ import annotations

import calendar
import re
from pathlib import Path

import numpy as np
import pandas as pd

try:
    from .rainfall_anomaly import BASELINE_YEARS, KHARIF_MONTHS, kharif_history, monthly_with_normals, read_giovanni_csv
except ImportError:
    from rainfall_anomaly import BASELINE_YEARS, KHARIF_MONTHS, kharif_history, monthly_with_normals, read_giovanni_csv


def _find_project_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


ROOT = _find_project_root()
RAW = ROOT / "data" / "raw" / "imerg_late"
PROCESSED = ROOT / "data" / "processed"

SEASONS_TO_REPORT = (2025, 2026)
MIN_DAY_FRACTION = 0.90
RAIN_DRY_PCT, RAIN_WET_PCT = -20.0, 20.0
DATASET = "NASA GPM IMERG Late Run daily, GPM_3IMERGDL v07, 0.1 deg (via NASA Giovanni area average)"
QUALITY = "preliminary: near-real-time Late Run, no monthly gauge adjustment"
# IMD seasonal departures as reported in the press (O Heraldo, 1 Oct 2026) - printed for comparison only.
IMD_REPORTED_2026 = {"north_goa": -36.8, "south_goa": -26.9}


def rain_signal(pct) -> str:
    if pd.isna(pct):
        return "no data"
    return "dry" if pct <= RAIN_DRY_PCT else "wet" if pct >= RAIN_WET_PCT else "near normal"


def load_daily() -> dict[str, tuple[pd.DataFrame, dict]]:
    files = sorted(RAW.glob("imerg_late_daily_*.csv"))
    if not files:
        raise SystemExit(f"No files in {RAW} (expected imerg_late_daily_<zone>_part<N>.csv)")
    grouped: dict[str, list[Path]] = {}
    for path in files:
        zone = re.sub(r"_part\d+$", "", path.stem.replace("imerg_late_daily_", ""))
        grouped.setdefault(zone, []).append(path)

    out, problems = {}, []
    for zone, paths in grouped.items():
        frames, boxes, meta = [], set(), {}
        for path in paths:
            frame, meta = read_giovanni_csv(path)
            title = meta.get("Title", "").lower()
            if "late run" not in title or "daily" not in title:
                problems.append(f"{path.name}: not the DAILY LATE RUN variable -> {meta.get('Title')}")
            boxes.add(meta.get("User Bounding Box"))
            frames.append(frame)
        if len(boxes) > 1:
            problems.append(f"{zone}: parts were downloaded with different boxes {sorted(map(str, boxes))}")
        daily = pd.concat(frames).drop_duplicates("time").sort_values("time").reset_index(drop=True)
        gaps = daily["time"].diff().dt.days.dropna()
        if (gaps > 1).any():
            hole = daily.loc[gaps[gaps > 1].index[0], "time"].date()
            problems.append(f"{zone}: days are missing between the parts (gap ends {hole}); a date range was skipped")
        if daily["time"].min() > pd.Timestamp(BASELINE_YEARS[0], 6, 1):
            problems.append(f"{zone}: data start {daily['time'].min().date()}, but the baseline needs "
                            f"{BASELINE_YEARS[0]} onwards (is part1 missing?)")
        out[zone] = (daily, meta)
    if problems:
        raise SystemExit("STOPPED - fix these files first:\n  - " + "\n  - ".join(problems))
    return out


def daily_to_monthly(daily: pd.DataFrame) -> tuple[pd.DataFrame, str]:
    """-> (year, month, rainfall_mm, days_valid, days_in_month), units label used."""
    d = daily.assign(year=daily["time"].dt.year, month=daily["time"].dt.month)
    g = d.groupby(["year", "month"])["value"]
    m = pd.DataFrame({"mean_rate": g.mean(), "days_valid": g.count()}).reset_index()
    m["days_in_month"] = [calendar.monthrange(y, mo)[1] for y, mo in zip(m["year"], m["month"])]
    m["rainfall_mm"] = m["mean_rate"] * m["days_in_month"]
    m.loc[m["days_valid"] < MIN_DAY_FRACTION * m["days_in_month"], "rainfall_mm"] = np.nan

    # Units check. GPM_3IMERGDL v07 'precipitation' is mm/day; confirm with the size of the seasonal total.
    first, last = BASELINE_YEARS
    base = m[m["year"].between(first, last) & m["month"].isin(KHARIF_MONTHS)]
    typical = base.groupby("year")["rainfall_mm"].sum(min_count=len(KHARIF_MONTHS)).mean()
    units = "mm/day"
    if not 800 <= typical <= 7000:
        if 800 <= typical * 24 <= 7000:
            m["rainfall_mm"] *= 24
            units = "mm/hr (converted x24)"
        else:
            raise SystemExit(f"Baseline Kharif total is {typical:.0f} mm as mm/day and {typical * 24:.0f} mm as mm/hr: "
                             "neither is plausible for Goa. Check the variable and box.")
    return m[["year", "month", "rainfall_mm", "days_valid", "days_in_month"]], units


def _save(frame: pd.DataFrame, stem: str) -> None:
    frame.to_csv(PROCESSED / f"{stem}.csv", index=False)
    try:
        frame.to_parquet(PROCESSED / f"{stem}.parquet", index=False)
    except ImportError:
        print(f"(pyarrow not installed: {stem}.parquet skipped, CSV written)")


def main() -> None:
    histories, monthlies = [], []
    for zone, (daily, meta) in load_daily().items():
        monthly, units = daily_to_monthly(daily)
        hist = kharif_history(monthly[["year", "month", "rainfall_mm"]])
        hist["rainfall_signal"] = hist["rainfall_anomaly_pct"].map(rain_signal)
        hist = hist.assign(zone=zone, season="Kharif (Jun-Sep)", input_units=units,
                           user_bbox_wsen=meta.get("User Bounding Box"), data_bbox_wsen=meta.get("Data Bounding Box"),
                           dataset=DATASET, data_quality=QUALITY, is_demo_data=False)
        histories.append(hist)
        mm = monthly_with_normals(monthly[["year", "month", "rainfall_mm"]]).merge(
            monthly[["year", "month", "days_valid", "days_in_month"]], on=["year", "month"])
        mm["rainfall_signal"] = mm["month_anomaly_pct"].map(rain_signal)
        monthlies.append(mm.assign(zone=zone))

    history = pd.concat(histories, ignore_index=True)
    lead = ["zone", "year", "season", "kharif_rainfall_mm", "rainfall_anomaly_pct", "rainfall_anomaly_std",
            "rainfall_percentile", "rainfall_category_imd", "rainfall_signal"]
    history = history[lead + [c for c in history.columns if c not in lead]]
    report = history[history["year"].isin(SEASONS_TO_REPORT)].reset_index(drop=True)

    monthly_all = pd.concat(monthlies, ignore_index=True)
    monthly_rep = monthly_all[monthly_all["year"].isin(SEASONS_TO_REPORT) & monthly_all["month"].between(5, 9)]
    monthly_rep = monthly_rep[["zone", "year", "month", "rainfall_mm", "baseline_month_mean_mm", "month_anomaly_pct",
                               "rainfall_signal", "days_valid", "days_in_month"]].reset_index(drop=True)

    PROCESSED.mkdir(parents=True, exist_ok=True)
    _save(history, "rainfall_late_kharif_history")
    _save(report, "rainfall_late_anomalies")
    _save(monthly_rep, "rainfall_late_monthly")

    pd.set_option("display.width", 220)
    print(f"IMERG LATE RUN, Kharif vs Late Run baseline {BASELINE_YEARS[0]}-{BASELINE_YEARS[1]}  "
          f"(units read as {history['input_units'].iloc[0]})\n")
    print(report[["zone", "year", "kharif_rainfall_mm", "baseline_mean_mm", "rainfall_anomaly_pct", "rainfall_anomaly_std",
                  "rainfall_percentile", "rainfall_category_imd", "rainfall_signal"]].round(1).to_string(index=False))

    missing = report[report["kharif_rainfall_mm"].isna()]
    for _, r in missing.iterrows():
        print(f"\nWARNING {r['zone']} {int(r['year'])}: season incomplete ({int(r['months_available'])} of 4 months) - no seasonal value.")

    print("\nMonthly departure from the Late Run monthly normal (%):")
    wide = monthly_rep.pivot_table(index=["zone", "year"], columns="month", values="month_anomaly_pct").round(1)
    wide.columns = [calendar.month_abbr[c] for c in wide.columns]
    print(wide.to_string())

    print("\nRank of each reported season among all complete seasons (1 = driest):")
    for zone, grp in history.dropna(subset=["kharif_rainfall_mm"]).groupby("zone"):
        ranked = grp.sort_values("kharif_rainfall_mm").reset_index(drop=True)
        for year in SEASONS_TO_REPORT:
            pos = ranked.index[ranked["year"] == year]
            if len(pos):
                print(f"  {zone} {year}: {pos[0] + 1} of {len(ranked)}   (driest season on record here: {int(ranked['year'].iloc[0])})")

    print("\nCross-checks")
    final_path = PROCESSED / "rainfall_anomalies.csv"
    final = pd.read_csv(final_path).set_index("zone") if final_path.is_file() else None
    for _, r in report.iterrows():
        zone, year = r["zone"], int(r["year"])
        if final is not None and zone in final.index and int(final.loc[zone, "year"]) == year:
            f = float(final.loc[zone, "rainfall_anomaly_pct"])
            print(f"  {zone} {year}: Late Run {r['rainfall_anomaly_pct']:+.1f} %  vs Final Run {f:+.1f} %  "
                  f"(difference {r['rainfall_anomaly_pct'] - f:+.1f} points)")
        if year == 2026 and zone in IMD_REPORTED_2026 and not pd.isna(r["rainfall_anomaly_pct"]):
            print(f"  {zone} 2026: Late Run {r['rainfall_anomaly_pct']:+.1f} %  vs IMD gauges (press report) "
                  f"{IMD_REPORTED_2026[zone]:+.1f} %")


if __name__ == "__main__":
    main()
