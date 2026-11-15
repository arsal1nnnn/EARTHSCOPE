"""EARTHSCOPE - sourced rice variety catalogue for Goa (M4).

Every non-empty value below is taken from the source listed in that row's
`sources` column. Fields that could not be verified are left empty (None)
on purpose: the suitability engine reports them as "unassessed" instead of
guessing. Do not fill a blank without adding its source.

Outputs:
    data/processed/rice_variety_catalogue.parquet
    data/processed/rice_variety_catalogue.csv

Run:  python science/variety_catalogue.py
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


PROJECT_ROOT = _find_project_root()
PROCESSED = PROJECT_ROOT / "data" / "processed"
ACCESSED = "2026-11-14"

SOURCES = {
    "CCARI_DSS": "ICAR-CCARI rice decision support page, https://ccari.icar.gov.in/dss/rice.html",
    "CCARI_AGNI": "ICAR-CCARI technologies (crop science), https://ccari.icar.gov.in/agni/crop-science.html",
    "KVK_NGOA_2021": "KVK North Goa (ICAR-CCARI) newsletter 2021 Q2, "
                     "https://punecms.kvk8.in/assets/uploads/1724664883.Newsletter%202021%20Q2.pdf",
    "CSSRI": "ICAR-CSSRI varieties developed, https://cssri.res.in/varieties-developed/",
    "NRRI": "ICAR-NRRI popular varieties, https://icar-crri.in/popular-nrri-varieties/",
    "CRRI_SEED": "CRRI variety list, http://www.crri.nic.in/Farmerscorner/seedchain_ricevariety.htm",
    "RKB_ODISHA": "Rice Knowledge Bank Odisha, https://rkbodisha.in/rice-varieties-of-odisha",
}

MOROD = "Morod (rainfed upland)"
KHER = "Kher (rainfed shallow lowland)"
KHAZAN = "Khazan (coastal saline)"

# `ecology` = ecology the cited source recommends the variety for.
# `goa_specific` = True when a Goa institution (ICAR-CCARI / KVK) lists it for that ecology.
VARIETIES = [
    dict(variety="Goa Dhan 1", ecology=KHAZAN, goa_specific=True, maturity_days_min=130, maturity_days_max=135,
         salinity_tolerance="tolerant", salinity_limit_dsm=None, submergence_tolerance="tolerant",
         release_year=2017, yield_stress_t_ha="2.7-2.9", yield_normal_t_ha="up to 5.0",
         notes="Released for coastal saline soils of Goa; tolerant to salinity and submergence. "
               "No numeric salinity limit found in sources.",
         sources="CCARI_AGNI; KVK_NGOA_2021"),
    dict(variety="Goa Dhan 2", ecology=KHAZAN, goa_specific=True, maturity_days_min=125, maturity_days_max=130,
         salinity_tolerance="tolerant", salinity_limit_dsm=None, submergence_tolerance=None,
         release_year=None, yield_stress_t_ha="2.8-3.0", yield_normal_t_ha="4.0-4.5",
         notes="Red-kernelled pure-line selection from salt-tolerant landrace Korgut. "
               "Release year (2017) seen only in press reports; verify with CCARI.",
         sources="CCARI_AGNI; KVK_NGOA_2021"),
    dict(variety="Goa Dhan 3", ecology=KHAZAN, goa_specific=True, maturity_days_min=120, maturity_days_max=125,
         salinity_tolerance="tolerant", salinity_limit_dsm=None, submergence_tolerance="tolerant",
         release_year=2019, yield_stress_t_ha="3.0-3.5", yield_normal_t_ha="up to 6.0",
         notes="Released for coastal saline soils of Goa; tolerant to salinity and submergence.",
         sources="CCARI_AGNI; KVK_NGOA_2021"),
    dict(variety="Goa Dhan 4", ecology=KHAZAN, goa_specific=True, maturity_days_min=125, maturity_days_max=130,
         salinity_tolerance="tolerant", salinity_limit_dsm=None, submergence_tolerance=None,
         release_year=None, yield_stress_t_ha="3.0-3.5", yield_normal_t_ha="5.0-5.5",
         notes="Salinity-tolerant variety for coastal saline soils. Parentage (Jyoti x Korgut) and "
               "release year seen only in press reports; verify with CCARI.",
         sources="KVK_NGOA_2021"),
    dict(variety="CSR-27", ecology=KHAZAN, goa_specific=True, maturity_days_min=120, maturity_days_max=125,
         salinity_tolerance="tolerant", salinity_limit_dsm=10.0, submergence_tolerance=None,
         release_year=None, yield_stress_t_ha=None, yield_normal_t_ha=None,
         notes="CCARI lists it for coastal saline soils (120 days, 3.5-4.0 t/ha). CSSRI: 125 days, "
               "tolerates salinity up to 10 dS/m, suitable for sodic and coastal saline areas.",
         sources="CCARI_DSS; CSSRI"),
    dict(variety="CSR-36", ecology=KHAZAN, goa_specific=True, maturity_days_min=135, maturity_days_max=140,
         salinity_tolerance="tolerant", salinity_limit_dsm=None, submergence_tolerance=None,
         release_year=None, yield_stress_t_ha=None, yield_normal_t_ha=None,
         notes="CCARI lists it for coastal saline soils (135 days, 4.0-4.5 t/ha). CSSRI gives 140 days; "
               "its numeric salinity limit must be read off the CSSRI page before use (not yet verified).",
         sources="CCARI_DSS; CSSRI"),
    dict(variety="Karjat-3", ecology=KHER, goa_specific=True, maturity_days_min=120, maturity_days_max=125,
         salinity_tolerance=None, salinity_limit_dsm=None, submergence_tolerance=None,
         release_year=None, yield_stress_t_ha=None, yield_normal_t_ha="6.0-6.5",
         notes="Medium duration variety listed for rainfed shallow lowland ecology.",
         sources="CCARI_DSS"),
    dict(variety="Naveen", ecology=f"{KHER}; irrigated", goa_specific=True, maturity_days_min=120,
         maturity_days_max=125, salinity_tolerance=None, salinity_limit_dsm=None, submergence_tolerance=None,
         release_year=2005, yield_stress_t_ha=None, yield_normal_t_ha="6.0-6.5",
         notes="CCARI lists it for rainfed shallow lowland and irrigated ecology. NRRI describes it as "
               "115-120 days, suitable for upland and irrigated ecosystems (not a Goa-specific statement).",
         sources="CCARI_DSS; NRRI"),
    dict(variety="Annada", ecology=MOROD, goa_specific=False, maturity_days_min=105, maturity_days_max=110,
         salinity_tolerance=None, salinity_limit_dsm=None, submergence_tolerance=None,
         release_year=1987, yield_stress_t_ha=None, yield_normal_t_ha="5.0",
         notes="Release listed as CVRC/Goa/Orissa (1987); ecology 'rainfed and irrigated uplands' is from "
               "the Odisha knowledge bank. No current Goa (CCARI) upland recommendation found yet.",
         sources="CRRI_SEED; RKB_ODISHA"),
]

# Fields with no verified source for any variety yet. Kept as empty columns so
# the gap is visible to M3/M1 and the engine reports them as unassessed.
UNVERIFIED_FIELDS = ("soil_type", "drought_tolerance", "water_requirement")


def build_catalogue() -> pd.DataFrame:
    frame = pd.DataFrame(VARIETIES)
    for field in UNVERIFIED_FIELDS:
        frame[field] = None
    frame["season"] = "Kharif"  # scope of this catalogue; all cited Goa listings are for the kharif crop
    frame["source_references"] = frame["sources"].map(
        lambda keys: " | ".join(SOURCES[k.strip()] for k in keys.split(";")))
    frame["accessed"] = ACCESSED
    unknown = [k for keys in frame["sources"] for k in keys.split(";") if k.strip() not in SOURCES]
    assert not unknown, f"unknown source keys: {unknown}"
    assert frame["variety"].is_unique
    return frame.drop(columns="sources")


def main() -> None:
    catalogue = build_catalogue()
    PROCESSED.mkdir(parents=True, exist_ok=True)
    catalogue.to_csv(PROCESSED / "rice_variety_catalogue.csv", index=False)
    catalogue.to_parquet(PROCESSED / "rice_variety_catalogue.parquet", index=False)
    print(f"Wrote {len(catalogue)} varieties to {PROCESSED}")
    print(catalogue[["variety", "ecology", "maturity_days_min", "maturity_days_max", "salinity_tolerance"]]
          .to_string(index=False))


if __name__ == "__main__":
    main()
