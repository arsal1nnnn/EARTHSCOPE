"""Rule-based rice variety suitability engine for EARTHSCOPE.

Inputs (data/processed/, Parquet preferred, same-named CSV accepted):
    rice_variety_catalogue   one row per variety: name, ecology, soil type,
                             salinity / drought / submergence tolerance
    rainfall_anomalies       zone-level rainfall anomaly records
    smap_soil_moisture       zone-level SMAP soil moisture records
    zone_profiles (optional) zone-level ecology, soil type and salinity

Zone ecology / soil / salinity may live in any of the zone tables. A factor
whose data is missing on either side is reported as "unassessed" and left out
of the score rather than being counted for or against a variety.

Outputs:
    data/processed/rice_suitability_matrix.parquet
    data/processed/rice_suitability_matrix.csv

Usage:
    python science/suitability_engine.py
    python science/suitability_engine.py --make-sample-inputs   # synthetic test data -> data/sample
    python science/suitability_engine.py --input-dir data/sample
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PROCESSED = PROJECT_ROOT / "data" / "processed"
SAMPLE_DIR = PROJECT_ROOT / "data" / "sample"

CATALOGUE = "rice_variety_catalogue"
RAINFALL = "rainfall_anomalies"
MOISTURE = "smap_soil_moisture"
ZONE_PROFILE_NAMES = ("zone_profiles", "zone_attributes", "zones")
OUTPUT = "rice_suitability_matrix"

# --------------------------------------------------------------------------
# Rule thresholds (edit here to tune the engine)
# --------------------------------------------------------------------------
RAIN_THRESHOLDS = {
    # units: (moderate, severe) departure from normal, applied to both signs
    "percent": (20.0, 40.0),
    "standardized": (1.0, 1.5),
}
SM_VERY_DRY = 0.10   # m3/m3
SM_DRY = 0.20
SM_SATURATED = 0.45
EC_MODERATE = 3.0    # dS/m; rice yield starts declining around here
EC_HIGH = 6.0

HIGHLY_SUITABLE_MIN = 0.80
MODERATELY_SUITABLE_MIN = 0.50
MIN_FACTORS_FOR_HIGH = 3  # fewer assessed factors caps the class at Moderately

# Stress score by variety tolerance level (2 high, 1 moderate, 0 low, None unknown)
STRESS_SCORE = {
    "moderate": {2: 1.0, 1: 0.5, 0: 0.25, None: 0.5},
    "severe": {2: 0.5, 1: 0.25, 0: 0.0, None: 0.25},
}
LEVEL_NAME = {0: "low", 1: "moderate", 2: "high"}
FACTORS = ("ecology", "soil type", "salinity", "rainfall risk", "soil moisture risk")


# --------------------------------------------------------------------------
# I/O
# --------------------------------------------------------------------------
def _find_table(directory: Path, stem: str) -> Path | None:
    for suffix in (".parquet", ".csv"):
        path = directory / f"{stem}{suffix}"
        if path.is_file():
            return path
    return None


def _read(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    try:
        return pd.read_parquet(path)
    except ImportError as exc:
        raise SystemExit(f"Reading {path.name} needs a Parquet engine: pip install pyarrow") from exc


def load_inputs(directory: Path) -> dict[str, tuple[pd.DataFrame, str]]:
    """Load required tables, reporting *all* missing ones at once."""
    found = {stem: _find_table(directory, stem) for stem in (CATALOGUE, RAINFALL, MOISTURE)}
    missing = [stem for stem, path in found.items() if path is None]
    if missing:
        lines = "\n".join(f"  - {directory / stem}.parquet (or .csv)" for stem in missing)
        raise SystemExit(
            f"Missing input table(s):\n{lines}\n"
            "Run the data processing step that produces them, or copy them into that folder.\n"
            "To try the engine on synthetic data: --make-sample-inputs, then --input-dir data/sample"
        )
    tables = {stem: (_read(path), path.name) for stem, path in found.items()}
    for stem in ZONE_PROFILE_NAMES:
        path = _find_table(directory, stem)
        if path:
            tables["profiles"] = (_read(path), path.name)
            break
    return tables


# --------------------------------------------------------------------------
# Schema discovery
# --------------------------------------------------------------------------
def _norm(name: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def _col(frame: pd.DataFrame, exact: tuple[str, ...] = (), contains: tuple[str, ...] = (),
         exclude: tuple[str, ...] = ()) -> str | None:
    """First column matching an exact normalized name, else containing a fragment."""
    names = {_norm(c): c for c in frame.columns}
    for key in exact:
        if _norm(key) in names:
            return names[_norm(key)]
    for fragment in contains:
        for key, original in names.items():
            if fragment in key and not any(x in key for x in exclude):
                return original
    return None


ZONE_NAMES = ("zone", "zone_id", "zone_name", "agro_ecological_zone", "aez", "region",
              "district", "state", "province", "admin_area", "location")


def _zone_col(frame: pd.DataFrame) -> str | None:
    return _col(frame, exact=ZONE_NAMES, contains=("zone",))


def _zone_fields(frame: pd.DataFrame, role: str) -> dict[str, str]:
    """Map engine fields to columns of a zone-level table."""
    fields = {
        "ecology": _col(frame, contains=("ecology", "ecosystem", "ecotype")),
        "soil": _col(frame, contains=("soiltype", "soiltexture", "soilclass", "texture")),
        "salinity": _col(frame, contains=("salin", "ecdsm", "soilec")),
    }
    if role in (RAINFALL, "profiles"):
        strict = ("rainfallanomal", "rainanomal", "precipanomal", "precipitationanomal", "spi")
        loose = ("anomal", "departure", "deviation") if role == RAINFALL else ()
        fields["rain"] = _col(frame, contains=strict + loose, exclude=("moist",))
    if role in (MOISTURE, "profiles"):
        fields["moisture"] = _col(frame, contains=("soilmoisture", "smap", "moisture", "vwc"),
                                  exclude=("anomal", "flag", "qual", "err", "std"))
    return {k: v for k, v in fields.items() if v}


# --------------------------------------------------------------------------
# Value interpretation
# --------------------------------------------------------------------------
def _blank(value: Any) -> bool:
    if value is None:
        return True
    try:
        if pd.isna(value):
            return True
    except (TypeError, ValueError):
        pass
    return str(value).strip().lower() in {"", "nan", "none", "unknown", "na", "n/a", "-", "nd"}


def _level(value: Any) -> int | None:
    """Parse a tolerance / severity description into 0 (low), 1 (moderate), 2 (high)."""
    if _blank(value):
        return None
    if isinstance(value, bool):
        return 2 if value else 0
    try:
        number = float(value)
        return {0.0: 0, 1.0: 2}.get(number)  # only 0/1 flags; other numeric scales are ambiguous
    except (TypeError, ValueError):
        pass
    s = str(value).lower()
    if re.search(r"intoleran|suscept|sensitiv", s):
        return 0
    if re.search(r"moderat|medium|intermediate|\bmid\b|partial|fair", s):
        return 1
    if re.search(r"\bnon|\bnot\b|\bpoor|\blow\b|\bno\b|\bweak|\bfalse\b|\bnil\b|slight|normal", s):
        return 0
    if re.search(r"toleran|high|strong|resist|\byes\b|\btrue\b|severe|very|saline|good", s):
        return 2
    return None


ECOLOGY_RULES = (  # order matters
    ("upland", r"upland|aerobic|dryland|hill"),
    ("deepwater", r"deep|float|flood[- ]?prone"),
    ("coastal", r"coastal|saline|tidal|mangrove|khazan"),
    ("irrigated", r"irrigat"),
    ("rainfed lowland", r"lowland|rainfed|rain-fed|shallow"),
)
ANY = "__any__"


def _parts(value: Any) -> list[str]:
    return [] if _blank(value) else [p.strip().lower() for p in re.split(r"[,;/|]+", str(value)) if p.strip()]


def _ecologies(value: Any) -> set[str]:
    out: set[str] = set()
    for part in _parts(value):
        if re.search(r"\b(all|any|wide)\b", part):
            out.add(ANY)
            continue
        out.add(next((name for name, pattern in ECOLOGY_RULES if re.search(pattern, part)), part))
    return out


SOIL_ALIASES = {"sandy": "sand", "silty": "silt", "clayey": "clay", "loamy": "loam", "peaty": "peat",
                "clays": "clay", "loams": "loam", "sands": "sand", "lateritic": "laterite"}
SOIL_STOP = {"soil", "soils", "and", "to", "or", "heavy", "light", "medium", "fine", "coarse", "textured", "type"}


def _soils(value: Any) -> set[str]:
    out: set[str] = set()
    for part in _parts(value):
        for word in re.findall(r"[a-z]+", part):
            if word in {"all", "any", "wide"}:
                out.add(ANY)
            elif word not in SOIL_STOP:
                out.add(SOIL_ALIASES.get(word, word))
    return out


def _zone_salinity_level(value: Any) -> tuple[int | None, str]:
    if _blank(value):
        return None, ""
    try:
        ec = float(value)
        level = 0 if ec < EC_MODERATE else 1 if ec < EC_HIGH else 2
        return level, f"{ec:.1f} dS/m"
    except (TypeError, ValueError):
        levels = [lv for lv in (_level(p) for p in _parts(value)) if lv is not None]
        return (max(levels) if levels else None), str(value)


# --------------------------------------------------------------------------
# Zone profiles
# --------------------------------------------------------------------------
def _rain_units(frame: pd.DataFrame, column: str, override: str) -> str:
    if override != "auto":
        return override
    name = _norm(column)
    if any(x in name for x in ("pct", "percent", "perc")):
        return "percent"
    if any(x in name for x in ("zscore", "std", "spi", "sigma", "standard")):
        return "standardized"
    if name.endswith("mm"):
        return "mm"
    peak = pd.to_numeric(frame[column], errors="coerce").abs().max()
    return "standardized" if pd.notna(peak) and peak <= 5 else "percent"


def build_zone_profiles(tables: dict[str, tuple[pd.DataFrame, str]], rain_units: str = "auto"):
    """Return {zone_key: {"name": ..., field: (value, "file[column]")}} and the rain units."""
    zones: dict[str, dict[str, Any]] = {}
    units = "percent"
    for role in (RAINFALL, MOISTURE, "profiles"):
        if role not in tables:
            continue
        frame, filename = tables[role]
        zone_col = _zone_col(frame)
        labels = frame[zone_col].astype("string").str.strip().fillna("Unknown zone") if zone_col \
            else pd.Series("All zones", index=frame.index, dtype="string")
        if zone_col is None:
            print(f"warning: no zone column in {filename}; treating it as one zone 'All zones'", file=sys.stderr)
        keys = labels.str.casefold()
        fields = _zone_fields(frame, role)
        if role == RAINFALL and "rain" not in fields:
            print(f"warning: no rainfall anomaly column found in {filename}", file=sys.stderr)
        if role == MOISTURE and "moisture" not in fields:
            print(f"warning: no soil moisture column found in {filename}", file=sys.stderr)
        if "rain" in fields:
            units = _rain_units(frame, fields["rain"], rain_units)

        for key, index in keys.groupby(keys).groups.items():
            subset = frame.loc[index]
            profile = zones.setdefault(key, {"name": str(labels.loc[index[0]])})
            for field, column in fields.items():
                if field in profile:
                    continue  # first table providing a field wins
                values = subset[column].dropna()
                numeric = pd.to_numeric(values, errors="coerce")
                if field in ("rain", "moisture") or (field == "salinity" and len(values) and numeric.notna().all()):
                    if numeric.notna().any():
                        profile[field] = (float(numeric.mean()), f"{filename}[{column}]")
                else:
                    unique = [v for v in dict.fromkeys(values.astype(str).str.strip()) if not _blank(v)]
                    if unique:
                        profile[field] = ("; ".join(unique), f"{filename}[{column}]")
    return zones, units


# --------------------------------------------------------------------------
# Rules. Each returns (score | None, message); None means "unassessed".
# --------------------------------------------------------------------------
def rule_ecology(variety_value: Any, zone_value: Any):
    wanted, present = _ecologies(variety_value), _ecologies(zone_value)
    if not wanted or not present:
        return None, "ecology data missing for " + ("variety" if not wanted else "zone")
    if ANY in wanted or wanted & present:
        return 1.0, f"Bred for the zone's ecology ({zone_value})"
    return 0.0, f"Ecology mismatch: variety is for {variety_value}, zone is {zone_value}"


def rule_soil(variety_value: Any, zone_value: Any):
    wanted, present = _soils(variety_value), _soils(zone_value)
    if not wanted or not present:
        return None, "soil type data missing for " + ("variety" if not wanted else "zone")
    if ANY in wanted or wanted & present:
        return 1.0, f"Suited to the zone's soil ({zone_value})"
    return 0.25, f"Soil mismatch: variety prefers {variety_value}, zone has {zone_value}"


def rule_salinity(variety_value: Any, zone_value: Any):
    zone_level, shown = _zone_salinity_level(zone_value)
    if zone_level is None:
        return None, "zone salinity data missing"
    tolerance = _level(variety_value)
    if zone_level == 0:
        return 1.0, f"Low zone salinity ({shown})"
    if tolerance is None:
        return 0.5, f"{LEVEL_NAME[zone_level].capitalize()} zone salinity ({shown}) but variety tolerance is unknown"
    gap = zone_level - tolerance
    if gap <= 0:
        return 1.0, f"{LEVEL_NAME[tolerance].capitalize()} salinity tolerance covers zone salinity ({shown})"
    text = f"Zone salinity is {LEVEL_NAME[zone_level]} ({shown}) but variety tolerance is {LEVEL_NAME[tolerance]}"
    return (0.0 if gap >= 2 else 0.25), text


def _stress(severity: str, tolerance: int | None, stress: str, trait: str, detail: str):
    score = STRESS_SCORE[severity][tolerance]
    known = f"{LEVEL_NAME[tolerance]} {trait} tolerance" if tolerance is not None else f"unknown {trait} tolerance"
    if score >= 1.0:
        return score, f"{known.capitalize()} offsets {severity} {stress} ({detail})"
    return score, f"{severity.capitalize()} {stress} ({detail}) with {known}"


def rule_rainfall(anomaly: float | None, units: str, drought_tol, submergence_tol):
    if anomaly is None:
        return None, "rainfall anomaly missing"
    if units not in RAIN_THRESHOLDS:
        return None, f"rainfall anomaly units '{units}' not supported (use percent or standardized)"
    moderate, severe = RAIN_THRESHOLDS[units]
    detail = f"{anomaly:+.1f}%" if units == "percent" else f"{anomaly:+.2f} sigma"
    if abs(anomaly) < moderate:
        return 1.0, f"Rainfall near normal ({detail})"
    severity = "severe" if abs(anomaly) >= severe else "moderate"
    if anomaly < 0:
        return _stress(severity, drought_tol, "rainfall deficit", "drought", detail)
    return _stress(severity, submergence_tol, "rainfall excess", "submergence", detail)


def rule_moisture(moisture: float | None, drought_tol, variety_ecologies: set[str]):
    if moisture is None:
        return None, "soil moisture missing"
    detail = f"{moisture:.3f} m3/m3"
    if moisture < SM_DRY:
        severity = "severe" if moisture < SM_VERY_DRY else "moderate"
        if "upland" in variety_ecologies and severity == "moderate" and drought_tol is None:
            drought_tol = 1  # upland types are bred for aerobic soils
        return _stress(severity, drought_tol, "soil moisture deficit", "drought", detail)
    if moisture > SM_SATURATED and variety_ecologies == {"upland"}:
        return 0.5, f"Saturated soil ({detail}) is a poor fit for an upland variety"
    return 1.0, f"Adequate soil moisture ({detail})"


def classify(scores: list[float]) -> tuple[str, float | None]:
    if not scores:
        return "Insufficient Data", None
    mean = sum(scores) / len(scores)
    if min(scores) == 0.0 or mean < MODERATELY_SUITABLE_MIN:
        return "Unsuitable", mean
    if mean >= HIGHLY_SUITABLE_MIN and len(scores) >= MIN_FACTORS_FOR_HIGH:
        return "Highly Suitable", mean
    return "Moderately Suitable", mean


# --------------------------------------------------------------------------
# Engine
# --------------------------------------------------------------------------
def build_suitability_matrix(input_dir: Path = PROCESSED, rain_units: str = "auto") -> pd.DataFrame:
    tables = load_inputs(input_dir)
    catalogue, cat_file = tables[CATALOGUE]

    name_col = _col(catalogue, exact=("variety", "variety_name", "cultivar", "name"), contains=("variet", "cultivar"))
    if name_col is None:
        raise SystemExit(f"{cat_file} needs a variety name column; found: {list(catalogue.columns)}")
    cat_cols = {
        "ecology": _col(catalogue, contains=("ecology", "ecosystem", "ecotype")),
        "soil": _col(catalogue, contains=("soil",), exclude=("moist",)),
        "salinity": _col(catalogue, contains=("salin", "salt")),
        "drought": _col(catalogue, contains=("drought",)),
        "submergence": _col(catalogue, contains=("submerg", "flood")),
    }
    for field, column in cat_cols.items():
        if column is None:
            print(f"warning: no {field} column found in {cat_file}", file=sys.stderr)

    zones, units = build_zone_profiles(tables, rain_units)

    def cat_ref(field: str) -> list[str]:
        return [f"{cat_file}[{cat_cols[field]}]"] if cat_cols[field] else []

    rows: list[dict[str, Any]] = []
    for key in sorted(zones):
        zone = zones[key]

        def env(field: str):
            return zone.get(field, (None, None))

        for _, variety in catalogue.iterrows():
            def trait(field: str):
                return variety[cat_cols[field]] if cat_cols[field] else None

            drought, submergence = _level(trait("drought")), _level(trait("submergence"))
            ecologies = _ecologies(trait("ecology"))
            if "deepwater" in ecologies and submergence is None:
                submergence = 2

            results = {
                "ecology": (rule_ecology(trait("ecology"), env("ecology")[0]),
                            cat_ref("ecology") + [env("ecology")[1]]),
                "soil type": (rule_soil(trait("soil"), env("soil")[0]),
                              cat_ref("soil") + [env("soil")[1]]),
                "salinity": (rule_salinity(trait("salinity"), env("salinity")[0]),
                             cat_ref("salinity") + [env("salinity")[1]]),
                "rainfall risk": (rule_rainfall(env("rain")[0], units, drought, submergence),
                                  [env("rain")[1]] + cat_ref("drought") + cat_ref("submergence")),
                "soil moisture risk": (rule_moisture(env("moisture")[0], drought, ecologies),
                                       [env("moisture")[1]] + cat_ref("drought")),
            }

            scores, supporting, limiting, unassessed, refs = [], [], [], [], []
            for factor in FACTORS:
                (score, message), sources = results[factor]
                if score is None:
                    unassessed.append(f"{factor} ({message})")
                    continue
                scores.append(score)
                (supporting if score >= 1.0 else limiting).append(message)
                refs.extend(s for s in sources if s and s not in refs)

            label, mean = classify(scores)
            rows.append({
                "zone": zone["name"],
                "variety": variety[name_col],
                "suitability_class": label,
                "suitability_score": None if mean is None else round(mean, 3),
                "supporting_factors": "; ".join(supporting) or "None identified",
                "limiting_factors": "; ".join(limiting) or "None identified",
                "unassessed_factors": "; ".join(unassessed) or "None",
                "factors_assessed": f"{len(scores)}/{len(FACTORS)}",
                "source_references": "; ".join(refs) or "None",
            })

    result = pd.DataFrame(rows)
    if not result.empty:
        result = result.sort_values(["zone", "suitability_score", "variety"],
                                    ascending=[True, False, True], na_position="last").reset_index(drop=True)
    return result


# --------------------------------------------------------------------------
# Synthetic sample inputs (for testing the pipeline only)
# --------------------------------------------------------------------------
def make_sample_inputs(directory: Path = SAMPLE_DIR) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    pd.DataFrame({
        "variety": ["SAMPLE-Irrigated-1", "SAMPLE-Coastal-1", "SAMPLE-Upland-1", "SAMPLE-Deepwater-1"],
        "ecology": ["irrigated; rainfed lowland", "coastal saline; rainfed lowland", "upland", "deepwater"],
        "soil_type": ["clay; clay loam", "clay; silty clay", "sandy loam; laterite", "clay"],
        "salinity_tolerance": ["susceptible", "tolerant", "susceptible", "moderately tolerant"],
        "drought_tolerance": ["low", "moderate", "high", "low"],
        "submergence_tolerance": ["low", "moderate", "low", "high"],
    }).to_csv(directory / f"{CATALOGUE}.csv", index=False)
    pd.DataFrame({
        "zone": ["Sample Zone A"] * 2 + ["Sample Zone B"] * 2 + ["Sample Zone C"] * 2,
        "month": ["2025-07", "2025-08"] * 3,
        "rainfall_anomaly_pct": [-5.0, 8.0, 30.0, 55.0, -35.0, -50.0],
    }).to_csv(directory / f"{RAINFALL}.csv", index=False)
    pd.DataFrame({
        "zone": ["Sample Zone A"] * 2 + ["Sample Zone B"] * 2 + ["Sample Zone C"] * 2,
        "month": ["2025-07", "2025-08"] * 3,
        "soil_moisture": [0.31, 0.35, 0.44, 0.50, 0.14, 0.11],
    }).to_csv(directory / f"{MOISTURE}.csv", index=False)
    pd.DataFrame({
        "zone": ["Sample Zone A", "Sample Zone B", "Sample Zone C"],
        "ecology": ["irrigated", "coastal saline", "upland"],
        "soil_type": ["clay loam", "silty clay", "sandy loam"],
        "salinity_ec_dsm": [1.2, 7.5, 0.8],
    }).to_csv(directory / "zone_profiles.csv", index=False)
    print(f"Wrote SYNTHETIC sample inputs to {directory} (not real data).")
    print(f"Run: python science/suitability_engine.py --input-dir {directory}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--input-dir", type=Path, default=PROCESSED)
    parser.add_argument("--output-dir", type=Path, default=None, help="defaults to --input-dir")
    parser.add_argument("--rain-units", choices=("auto", "percent", "standardized"), default="auto")
    parser.add_argument("--make-sample-inputs", action="store_true",
                        help="write synthetic test inputs to data/sample and exit")
    args = parser.parse_args()

    if args.make_sample_inputs:
        make_sample_inputs()
        return

    result = build_suitability_matrix(args.input_dir, args.rain_units)
    output_dir = args.output_dir or args.input_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    csv_path, parquet_path = output_dir / f"{OUTPUT}.csv", output_dir / f"{OUTPUT}.parquet"
    result.to_csv(csv_path, index=False)
    try:
        result.to_parquet(parquet_path, index=False)
    except ImportError as exc:
        raise SystemExit(f"Wrote {csv_path}, but Parquet export needs: pip install pyarrow") from exc

    print(f"Wrote {len(result):,} zone x variety records to:\n  {parquet_path}\n  {csv_path}")
    if not result.empty:
        print(result["suitability_class"].value_counts().to_string())


if __name__ == "__main__":
    main()
