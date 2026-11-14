# EARTHSCOPE science methodology, results and limitations (M4)

Status: draft, 14 Nov 2026. Items marked **TO VERIFY** are not yet checked against a source.

## 1. Scope

- Geography: North Goa and South Goa districts.
- Season analysed: **Kharif 2025 (June-September 2025)**. This is the latest season for which the IMERG Final Run monthly product was available on the download date. The app must not call it the "current season".
- Two outputs: (A) a documentation-based rice variety screening and (B) water-condition indicators.
- Neither output predicts yield or crop failure.

## 2. Data sources

| Use | Product | Version | Grid | Period used | Units | Access |
|---|---|---|---|---|---|---|
| Rainfall | NASA GPM IMERG Final Run, monthly precipitation (`GPM_3IMERGM`) | 07 | 0.1 deg (about 11 km) | Jan 2001 - Sep 2025 | mm/hr, converted to mm/month | NASA Giovanni, area-averaged time series, downloaded 14 Nov 2026 |
| Root-zone soil moisture (cross-check) | NASA GLDAS-2.1 Noah, 3-hourly (`GLDAS_NOAH025_3H`, RootMoist_inst) | 2.1 | 0.25 deg (about 28 km) | Jan 2000 - Dec 2025 | kg m-2 | NASA Giovanni, area-averaged time series, downloaded 14 Nov 2026 |
| Root-zone soil moisture (primary, pending) | NASA SMAP L4 (`SPL4SMGP`, sm_rootzone) | 008 | 9 km | Jun-Sep, 2015-2025 | m3/m3 | NASA AppEEARS area request, submitted 14 Nov 2026, **not yet processed** |
| Variety facts | ICAR-CCARI, KVK North Goa, ICAR-CSSRI, ICAR-NRRI/CRRI, Rice Knowledge Bank Odisha | - | - | accessed 14 Nov 2026 | - | URLs are stored per variety in `rice_variety_catalogue` |

Notes:
- The project brief names SMAP L4 version 7; AppEEARS serves version 008, which is what was requested.
- GLDAS is a land-surface model driven by weather data. It does not use SMAP observations. All GLDAS outputs are named and labelled GLDAS.
- SMAP L4 is itself a model that assimilates SMAP observations, not a direct measurement.
- Quality flags: IMERG Final monthly and the Giovanni area averages carry no per-value flag that was applied here. **TO VERIFY** whether SPL4SMGP has a quality flag to apply.

## 3. Zones

- Water indicators are computed for two zones, `north_goa` and `south_goa`, using M5's district bounding boxes (West, South, East, North):
  - north_goa: 73.6756, 15.4081, 74.2824, 15.8008
  - south_goa: 73.7832, 14.7529, 74.3361, 15.5390
- The boxes are rectangles. They include sea and parts of Maharashtra and Karnataka, and they overlap between 15.41 and 15.54 N.
- The southern edge 14.7529 is **TO VERIFY** with M5 (Goa's southern tip is believed to be near 14.9 N).
- Cells actually averaged (from the Giovanni file headers):
  - IMERG north_goa: 73.75-74.25 E, 15.45-15.75 N (about 15 cells). South Goa: read from its file header.
  - GLDAS north_goa: two cells (73.875 and 74.125 E at 15.625 N). GLDAS south_goa: six cells (73.875-74.125 E, 14.875-15.375 N).
- The suitability table is per taluka (12, as defined by M5) and land type. Each taluka inherits its district's water indicators.

## 4. Methods

### 4.1 Rainfall anomaly (`rainfall_anomaly.py`)
1. Monthly rainfall (mm) = mean rate (mm/hr) x hours in the month.
2. Kharif total = June + July + August + September. A year with any of the four months missing is left missing.
3. Baseline = mean and sample standard deviation of the Kharif total over 2001-2020 (20 seasons).
4. Anomaly = Kharif total - baseline mean, also given as percent of the baseline mean and in standard deviations.
5. Percentile = percent of baseline seasons with a lower total.
6. Category = India Meteorological Department departure classes (normal within +/-19 %, deficient -20 to -59 %, excess +20 to +59 %, large deficient/excess beyond 60 %). **TO VERIFY** against an IMD document.
7. Monthly table: each month compared with the same calendar month's 2001-2020 mean. Percent anomaly is only reported where the monthly normal is at least 10 mm.

### 4.2 Root-zone soil moisture, GLDAS (`soil_moisture_gldas.py`)
1. 3-hourly values are averaged to calendar months (a month needs at least 90 % of its time steps).
2. Kharif mean = mean of the four monthly values, all four required.
3. Baseline, anomaly and percentile as for rainfall, against 2001-2020.
4. Monthly table: each month compared with the same calendar month in the baseline.
5. Values stay in kg m-2. The model layer depth needed to convert to m3/m3 is **TO VERIFY**.

### 4.3 Water-risk indicators (`water_risk.py`)
- Indicators are shown separately. There is no combined score.
- Signal labels:
  - Rainfall: dry at -20 % or below, wet at +20 % or above (IMD boundary).
  - Soil moisture: dry at the 30th percentile or below, wet at the 70th or above. This follows drought-monitor style percentile classes. **TO VERIFY** with a citation (for example the US Drought Monitor classification).
- "Indicator agreement" states whether the available indicators point the same way (concurrent dry, concurrent wet, all near normal, mixed, conflicting).
- Evidence coverage is reported as the number of indicators with data out of the number expected.

### 4.4 Variety catalogue (`variety_catalogue.py`)
- Nine candidate varieties. Every filled value has a source URL in the same row. Unverified fields are left empty.
- No sourced value was found for any variety's soil requirement, water requirement or drought tolerance.

### 4.5 Suitability screening (`suitability_engine.py`)
A documentation-based screening for each taluka x land type (Morod, Kher, Khazan) x variety.

| Factor | Rule |
|---|---|
| Ecology | 1.0 if a Goa source (ICAR-CCARI / KVK) lists the variety for that land type; 0.75 if only a non-Goa source documents the fit; 0.0 if no source recommends it |
| Salinity tolerance (Khazan only) | 1.0 if tolerance is documented; 0.5 if not |
| Rainfall, soil moisture | 1.0 if the district signal is near normal; 0.5 if dry; a wet signal counts (1.0) only for varieties with documented submergence tolerance, otherwise it is listed as not assessed |
| Soil type, drainage, field salinity | Never assessed: no sourced data |

Classes: **Highly Suitable** (documented for the land type, no limiting factor), **Moderately Suitable** (documented, with a limiting factor), **Not Recommended** (no documented recommendation; score capped at 0.25).

The numeric weights are a screening convention chosen by M4 to order results. They are not a validated agronomic model. "Not Recommended" means "no documented recommendation", not "will fail".

## 5. Results for Kharif 2025

### Seasonal
| Indicator | North Goa | South Goa |
|---|---|---|
| IMERG Kharif rainfall | 2,274 mm | 2,328 mm |
| 2001-2020 baseline | 2,181 mm | 2,176 mm |
| Departure | +4.3 % (+0.2 sd), Normal | +7.0 % (+0.4 sd), Normal |
| Rainfall percentile | 65 | 75 |
| GLDAS root-zone soil moisture, Kharif mean | 392.8 kg m-2 | 453.5 kg m-2 |
| 2001-2020 baseline | 357.8 kg m-2 | 415.2 kg m-2 |
| Departure | +9.8 % (+2.2 sd) | +9.2 % (+2.2 sd) |
| Standing | above all 20 baseline seasons | above all 20 baseline seasons |
| Indicator agreement | mixed: rainfall near normal, soil moisture wet | same |
| Months with both indicators dry | 0 | 0 |

### Monthly
| Month | N rain vs normal | N soil moisture percentile | S rain vs normal | S soil moisture percentile |
|---|---|---|---|---|
| May (outside Kharif window) | 502 mm vs 71 mm normal | - | 552 mm vs 84 mm normal | - |
| June | -2.8 % | 95 | -8.6 % | 95 |
| July | +9.6 % | 95 | +19.1 % | 95 |
| August | +20.7 % (wet) | 75 | +24.4 % (wet) | 75 |
| September | -23.6 % (dry) | 55 | -21.9 % (dry) | 50 |

Reading:
- No water-deficit signal for the season in either district.
- May 2025 rainfall was about seven times its monthly normal in both districts. This explains why soil moisture was already at the 95th percentile in June although June rainfall was slightly below normal. The two independent datasets agree.
- September rainfall was more than 20 % below its monthly normal after a wet August; soil moisture remained at or above its median. A near-normal seasonal total can hide a dry month, so the monthly view should be shown.

### Suitability screening
324 rows. Khazan: Goa Dhan 1-4, CSR-27, CSR-36 Highly Suitable. Kher: Karjat-3 and Naveen Highly Suitable. Morod: Annada Moderately Suitable (upland fit documented only by a non-Goa source). All other combinations Not Recommended. Results are identical for all talukas within a district.

## 6. Validation

Done:
- Units check: IMERG values confirmed as mm/hr on Giovanni; converted totals are in a plausible range.
- Cross-dataset consistency: the May 2025 rainfall surge (IMERG) matches the early soil wetting (GLDAS).
- Scripts were tested on synthetic files in the same layout before running on real data.

Pending (**TO VERIFY**):
- Compare the +4.3 % / +7.0 % departures with IMD's end-of-season 2025 monsoon figure for Goa or Konkan and Goa.
- IMD departure class boundaries; drought-monitor percentile classes.
- CSR-36 numeric salinity limit on the ICAR-CSSRI page.
- A current Goa recommendation for an upland (Morod) variety; Annada's Goa status.
- SMAP L4 results, and how SMAP and GLDAS compare.

## 7. Limitations

1. **Resolution.** IMERG is about 11 km, GLDAS about 28 km, SMAP 9 km. Indicators are district-scale. They cannot distinguish talukas, land types or fields. North Goa's GLDAS value rests on two model cells.
2. **Absolute rainfall is low.** The IMERG baseline (about 2,180 mm) is well below the gauge normal for Goa (around 3,000 mm, **TO VERIFY**). The boxes include sea, and satellite estimates tend to under-read heavy orographic rain. Use the percent departure, not the mm total, as the headline.
3. **Fixed June-September window.** The exceptional May 2025 rainfall falls outside it, so the seasonal rainfall anomaly understates how wet the start of the crop season was.
4. **Short or modelled soil-moisture records.** GLDAS is a model. SMAP L4 has only eleven seasons (2015-2025), so its percentiles will be coarse.
5. **"Above all 20 baseline seasons"** is a statement about this model record, not a measured record.
6. **No land-type map.** Whether Morod, Kher or Khazan land occurs in a given taluka is not verified; the screening is "for this land type, if present".
7. **No soil, drainage or field-salinity data.** These factors are not assessed. No soil pH or salinity value was invented.
8. **Catalogue gaps.** No sourced drought tolerance, soil or water requirement for any variety; no numeric salinity limit for the Goa Dhan series; only one Morod candidate.
9. **One past season.** Water indicators describe Kharif 2025. They are context for a variety choice, not a forecast.
10. **Earlier placeholder data.** Synthetic rainfall and soil-moisture files existed in the repo before 14 Nov 2026 and were replaced. Any mock values still hardcoded in frontend or GIS files are not M4 outputs.

## 8. Output tables (in `data/processed/`, each as .parquet and .csv)

| Table | One row per | Key columns |
|---|---|---|
| `rice_variety_catalogue` | variety | `variety`, `ecology`, `goa_specific`, `maturity_days_min/max`, `salinity_tolerance`, `salinity_limit_dsm`, `submergence_tolerance`, `notes`, `source_references` |
| `rainfall_anomalies` | zone (latest complete Kharif) | `zone`, `year`, `kharif_rainfall_mm`, `rainfall_anomaly_pct`, `rainfall_anomaly_mm`, `rainfall_anomaly_std`, `rainfall_percentile`, `rainfall_category_imd`, `baseline_mean_mm`, `baseline_period` |
| `rainfall_kharif_history` | zone x year | same columns, all years |
| `rainfall_monthly` | zone x month | `rainfall_mm`, `baseline_month_mean_mm`, `month_anomaly_mm`, `month_anomaly_pct` |
| `soil_moisture_gldas_kharif` | zone (latest complete Kharif) | `kharif_mean_soil_moisture`, `units`, `soil_moisture_percentile`, `soil_moisture_anomaly_pct`, `soil_moisture_anomaly_std`, `baseline_mean`, `giovanni_product_id` |
| `soil_moisture_gldas_history` | zone x year | same columns, all years |
| `soil_moisture_gldas_monthly` | zone x month | `soil_moisture`, `baseline_month_mean`, `month_anomaly`, `month_percentile` |
| `water_risk_indicators` | zone (season) | `rainfall_anomaly_pct`, `rainfall_signal`, `sm_gldas_percentile`, `sm_gldas_signal`, `indicator_agreement`, `indicators_with_data`, `indicators_expected`, `months_with_concurrent_dry_signals` |
| `water_risk_monthly` | zone x Kharif month | `rainfall_month_anomaly_pct`, `rainfall_signal`, `sm_gldas_month_percentile`, `sm_gldas_signal`, `indicator_agreement` |
| `rice_suitability_matrix` | taluka x land type x variety | `zone` (taluka name), `region_id`, `district`, `ecology`, `variety`, `suitability_class`, `suitability_score`, `supporting_factors`, `limiting_factors`, `missing_information`, `factors_assessed`, `seasonal_water_context`, `source_references` |

Conventions:
- `zone` is `north_goa` / `south_goa` in the water tables and the taluka name in the suitability table. Join talukas to water tables through `district`.
- Empty values mean "not available". They must never be displayed as zero.
- Factor columns in the suitability table are lists joined with `; `.
- Display wording: "Kharif 2025"; "GLDAS root-zone soil moisture" (not SMAP); "above all 20 baseline seasons" rather than "100th percentile".

## 9. How to reproduce

From the repository root, with the raw Giovanni files in `data/raw/imerg/` and `data/raw/gldas/`:

```
python backend/app/science/variety_catalogue.py
python backend/app/science/rainfall_anomaly.py
python backend/app/science/soil_moisture_gldas.py
python backend/app/science/water_risk.py
python backend/app/science/suitability_engine.py
```
