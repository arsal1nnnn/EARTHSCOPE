"""EARTHSCOPE - rice variety suitability screening (M4).

A documentation-based screening, not a field trial or yield prediction.
For every taluka x land type (Morod / Kher / Khazan) x catalogued variety it
checks what the cited sources say and what the district water indicators show.

Inputs (in `input_dir`, default data/processed):
    rice_variety_catalogue.{parquet,csv}   required  (variety_catalogue.py)
    water_risk_indicators.{parquet,csv}    optional  (water_risk.py); without it the
                                           water factors are listed as missing information
    ../boundaries/goa_talukas.geojson      optional  (M5); else the built-in taluka list is used

Output (also returned by build_suitability_matrix):
    rice_suitability_matrix.{parquet,csv}  one row per taluka x ecology x variety

Factors and scores:
    ecology            1.0 listed for this land type by a Goa source (ICAR-CCARI / KVK)
                       0.75 fit documented only by a non-Goa source
                       0.0 no documented recommendation for this land type
    salinity tolerance (Khazan rows only) 1.0 documented tolerance, 0.5 not documented
    rainfall           1.0 season near normal, 0.5 dry signal; a wet signal is scored (1.0) only
    soil moisture      if the variety has documented submergence tolerance, else left unassessed
    soil type, drainage, field salinity: no sourced data -> always listed as missing information

Classes:
    Highly Suitable      documented for the land type and no limiting factor
    Moderately Suitable  documented for the land type, with at least one limiting factor
    Not Recommended      no documented recommendation for the land type (score capped at 0.25)

Water indicators are district-scale (about 10-28 km grids) and describe one past
season; every taluka in a district gets the same values. Whether a land type
actually occurs in a given taluka is not verified.

Run:  python suitability_engine.py
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd


def _find_project_root() -> Path:
    """Repo root = nearest parent holding .git or data/processed (works from science/ or backend/app/science/)."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() or (parent / "data" / "processed").is_dir():
            return parent
    return here.parents[1]


PROCESSED = _find_project_root() / "data" / "processed"
OUTPUT = "rice_suitability_matrix"

ECOLOGIES = {  # local name -> description
    "Morod": "rainfed upland",
    "Kher": "rainfed shallow lowland",
    "Khazan": "coastal saline lowland",
}
# Fallback taluka list (IDs, names and districts as defined by M5).
TALUKAS = [
    ("GOA-N-PERNEM", "Pernem", "North Goa"), ("GOA-N-BARDEZ", "Bardez", "North Goa"),
    ("GOA-N-TISWADI", "Tiswadi", "North Goa"), ("GOA-N-BICHOLIM", "Bicholim", "North Goa"),
    ("GOA-N-SATTARI", "Sattari", "North Goa"), ("GOA-S-PONDA", "Ponda", "South Goa"),
    ("GOA-S-MORMUGAO", "Mormugao", "South Goa"), ("GOA-S-SALCETE", "Salcete", "South Goa"),
    ("GOA-S-QUEPEM", "Quepem", "South Goa"), ("GOA-S-SANGUEM", "Sanguem", "South Goa"),
    ("GOA-S-DHARBANDORA", "Dharbandora", "South Goa"), ("GOA-S-CANACONA", "Canacona", "South Goa"),
]
FACTORS = ("ecology", "salinity tolerance", "rainfall", "root-zone soil moisture", "soil type", "drainage")
SM_SOURCES = ("smap", "gldas")  # first one present in the water-risk table is used
ALWAYS_MISSING = ("soil type (no sourced variety requirement or zone soil data)",
                  "drainage (no sourced data)",
                  "field salinity in dS/m (no sourced zone data)")


# ---------------------------------------------------------------- inputs
def _read(directory: Path, stem: str) -> pd.DataFrame | None:
    for suffix in (".parquet", ".csv"):
        path = directory / f"{stem}{suffix}"
        if path.is_file():
            try:
                return pd.read_csv(path) if suffix == ".csv" else pd.read_parquet(path)
            except ImportError:
                continue  # no Parquet engine installed; try the CSV copy
    return None


def _talukas(input_dir: Path) -> list[tuple[str, str, str]]:
    path = input_dir.parent / "boundaries" / "goa_talukas.geojson"
    if path.is_file():
        try:
            props = [f["properties"] for f in json.loads(path.read_text(encoding="utf-8"))["features"]]
            found = [(p["region_id"], p["name"], p["district"]) for p in props]
            if found:
                return found
        except (KeyError, ValueError, TypeError):
            pass
    return TALUKAS


def _known(value: Any) -> bool:
    return value is not None and not pd.isna(value) and str(value).strip() != ""


def _clean(text: Any) -> str:
    """Factor texts are joined with '; ' so they must not contain semicolons themselves."""
    return str(text).replace(";", ",").strip()


# ---------------------------------------------------------------- rules
def _ecology(variety: pd.Series, ecology: str):
    documented = _clean(variety.get("ecology", ""))
    if ecology.lower() not in documented.lower():
        return 0.0, f"No documented recommendation for {ecology} land (documented for {documented or 'no ecology'})"
    if bool(variety.get("goa_specific", False)):
        return 1.0, f"Listed for {ecology} ({ECOLOGIES[ecology]}) land by ICAR-CCARI / KVK Goa sources"
    return 0.75, f"Fit for {ecology} ({ECOLOGIES[ecology]}) land is documented only by a non-Goa source"


def _salinity(variety: pd.Series, ecology: str):
    if ecology != "Khazan":
        return None, None
    if _known(variety.get("salinity_tolerance")) and "toler" in str(variety["salinity_tolerance"]).lower():
        limit = variety.get("salinity_limit_dsm")
        detail = f" (up to {float(limit):g} dS/m per source)" if _known(limit) else " (no numeric limit in sources)"
        return 1.0, "Documented salinity tolerance" + detail
    return 0.5, "Salinity tolerance not documented, and Khazan land is coastal saline"


def _water(kind: str, signal: Any, detail: str, submergence_tolerant: bool):
    """Return (score, message, missing_note) for one district water indicator."""
    if not _known(signal) or signal == "no data":
        return None, None, f"{kind} (no indicator data for this district)"
    if signal == "near normal":
        return 1.0, f"{kind.capitalize()} near normal: {detail}", None
    if signal == "dry":
        return 0.5, f"{kind.capitalize()} dry signal: {detail}. Drought tolerance of the variety is not documented", None
    if submergence_tolerant:
        return 1.0, f"{kind.capitalize()} wet signal: {detail}. Variety has documented submergence tolerance", None
    return None, None, f"effect of the wet {kind} signal ({detail}), as submergence tolerance is not documented"


def _district_context(row: pd.Series | None, district: str) -> dict[str, Any]:
    """Pull the district's water indicators into plain values and display strings."""
    ctx: dict[str, Any] = {"rain_signal": None, "sm_signal": None, "rain_detail": "", "sm_detail": "",
                           "summary": f"No water indicators available for {district}", "refs": [], "year": None}
    if row is None:
        return ctx
    year = int(row["season_year"])
    ctx["year"] = year
    parts = []
    if _known(row.get("rainfall_anomaly_pct")):
        ctx["rain_signal"] = row.get("rainfall_signal")
        ctx["rain_detail"] = (f"Kharif {year} rainfall {row['rainfall_anomaly_pct']:+.1f}% against "
                              f"{row.get('rainfall_baseline', 'baseline')} ({district} district, IMERG)")
        parts.append(f"rainfall {row['rainfall_anomaly_pct']:+.1f}% ({ctx['rain_signal']})")
        ctx["refs"].append("NASA GPM IMERG Final monthly v07 (rainfall_anomalies)")
    for source in SM_SOURCES:
        pct = row.get(f"sm_{source}_percentile")
        if _known(pct):
            seasons = row.get(f"sm_{source}_baseline_seasons")
            n = int(seasons) if _known(seasons) else None
            if float(pct) >= 100 and n:
                standing = f"above all {n} baseline seasons"
            elif float(pct) <= 0 and n:
                standing = f"below all {n} baseline seasons"
            else:
                standing = f"wetter than {float(pct):.0f}% of baseline seasons"
            ctx["sm_signal"] = row.get(f"sm_{source}_signal")
            ctx["sm_detail"] = f"Kharif {year} root-zone soil moisture {standing} ({district} district, {source.upper()})"
            parts.append(f"{source.upper()} root-zone soil moisture {standing} ({ctx['sm_signal']})")
            ctx["refs"].append(f"{source.upper()} root-zone soil moisture (soil_moisture_{source}_kharif)")
            break
    if parts:
        ctx["summary"] = (f"Kharif {year}, {district} district: " + ", ".join(parts) +
                          ". District-scale indicators applied to every taluka in the district")
    return ctx


# ---------------------------------------------------------------- engine
def build_suitability_matrix(input_dir: Path | str = PROCESSED, **_ignored: Any) -> pd.DataFrame:
    """Build the taluka x ecology x variety screening table.

    Raises SystemExit with a readable message if the variety catalogue is missing
    (the backend service catches SystemExit and returns it as an API error).
    """
    input_dir = Path(input_dir)
    catalogue = _read(input_dir, "rice_variety_catalogue")
    if catalogue is None:
        raise SystemExit(f"rice_variety_catalogue not found in {input_dir}. Run variety_catalogue.py first.")
    if "variety" not in catalogue.columns or "ecology" not in catalogue.columns:
        raise SystemExit("rice_variety_catalogue must have 'variety' and 'ecology' columns.")

    water = _read(input_dir, "water_risk_indicators")
    by_district: dict[str, pd.Series] = {}
    if water is not None:
        by_district = {str(r["zone"]): r for _, r in water.iterrows()}

    rows: list[dict[str, Any]] = []
    for region_id, taluka, district in _talukas(input_dir):
        ctx = _district_context(by_district.get(district.lower().replace(" ", "_")), district)
        for ecology in ECOLOGIES:
            for _, variety in catalogue.iterrows():
                submergence = _known(variety.get("submergence_tolerance")) and \
                    "toler" in str(variety["submergence_tolerance"]).lower()
                scores, supporting, limiting, missing = [], [], [], []

                eco_score, eco_msg = _ecology(variety, ecology)
                scores.append(eco_score)
                (supporting if eco_score >= 1.0 else limiting).append(eco_msg)

                sal_score, sal_msg = _salinity(variety, ecology)
                if sal_score is not None:
                    scores.append(sal_score)
                    (supporting if sal_score >= 1.0 else limiting).append(sal_msg)

                for kind, sig, detail in (("rainfall", ctx["rain_signal"], ctx["rain_detail"]),
                                          ("root-zone soil moisture", ctx["sm_signal"], ctx["sm_detail"])):
                    score, msg, gap = _water(kind, sig, detail, submergence)
                    if score is None:
                        missing.append(gap)
                    else:
                        scores.append(score)
                        (supporting if score >= 1.0 else limiting).append(msg)
                missing.extend(ALWAYS_MISSING)

                mean = sum(scores) / len(scores)
                if eco_score == 0.0:
                    label, mean = "Not Recommended", min(mean, 0.25)
                elif limiting:
                    label = "Moderately Suitable"
                else:
                    label = "Highly Suitable"

                refs = [_clean(variety["source_references"])] if _known(variety.get("source_references")) else []
                rows.append({
                    "zone": taluka, "region_id": region_id, "district": district,
                    "ecology": ecology, "ecology_description": ECOLOGIES[ecology],
                    "variety": variety["variety"],
                    "suitability_class": label, "suitability_score": round(mean, 3),
                    "supporting_factors": "; ".join(_clean(m) for m in supporting) or "None identified",
                    "limiting_factors": "; ".join(_clean(m) for m in limiting) or "None identified",
                    "missing_information": "; ".join(_clean(m) for m in missing),
                    "factors_assessed": f"{len(scores)}/{len(FACTORS)}",
                    "seasonal_water_context": ctx["summary"],
                    "season_year": ctx["year"],
                    "maturity_days": (f"{int(variety['maturity_days_min'])}-{int(variety['maturity_days_max'])}"
                                      if _known(variety.get("maturity_days_min")) and
                                      _known(variety.get("maturity_days_max")) else None),
                    "source_references": " | ".join(refs + ctx["refs"]) or "None",
                    "ecology_presence_in_taluka": "not verified",
                    "method": "documentation-based screening, not a field trial or yield prediction",
                    "is_demo_data": False,
                })

    result = pd.DataFrame(rows)
    return result.sort_values(["district", "zone", "ecology", "suitability_score", "variety"],
                              ascending=[True, True, True, False, True]).reset_index(drop=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="EARTHSCOPE rice variety suitability screening")
    parser.add_argument("--input-dir", type=Path, default=PROCESSED)
    args = parser.parse_args()

    result = build_suitability_matrix(args.input_dir)
    args.input_dir.mkdir(parents=True, exist_ok=True)
    result.to_csv(args.input_dir / f"{OUTPUT}.csv", index=False)
    result.to_parquet(args.input_dir / f"{OUTPUT}.parquet", index=False)

    print(f"Wrote {len(result):,} rows (taluka x ecology x variety) to {args.input_dir}")
    print(pd.crosstab(result["ecology"], result["suitability_class"]).to_string())
    sample = result[result["zone"] == result["zone"].iloc[0]]
    pd.set_option("display.width", 200)
    print(f"\nExample: {sample['zone'].iloc[0]}")
    print(sample[["ecology", "variety", "suitability_class", "suitability_score", "factors_assessed"]]
          .to_string(index=False))
    print("\n" + sample["seasonal_water_context"].iloc[0])


if __name__ == "__main__":
    main()
