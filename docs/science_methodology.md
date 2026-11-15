# EARTHSCOPE science methodology, results and limitations (M4)

Status: draft, updated 15 Nov 2026 (taluka rainfall estimates and preliminary Kharif 2026 added). Look-ups were checked against sources on 15 Nov 2026 (section 10). Items still marked **TO VERIFY** or **OPEN** are not confirmed.

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
- Quality flags: IMERG Final monthly and the Giovanni area averages carry no per-value flag that was applied here. For SPL4SMGP, quality control is applied inside the assimilation system (user guide, section 2.6.3) and a validation study reports that no per-value quality flag is available for the product [S8, S9]; none will be applied, and this will be re-checked against the file contents when the AppEEARS request completes.

## 3. Zones

- Water indicators are computed for two zones, `north_goa` and `south_goa`, using M5's district bounding boxes (West, South, East, North):
  - north_goa: 73.6756, 15.4081, 74.2824, 15.8008
  - south_goa: 73.7832, 14.7529, 74.3361, 15.5390
- The boxes are rectangles. They include sea and parts of Maharashtra and Karnataka, and they overlap between 15.41 and 15.54 N.
- The southern edge 14.7529 is correct for M5's boundary file: it comes from the detached island polygon of Canacona at 14.75–14.76 N, 74.11 E (**Confirmed by M5: Anjediva Island**, which is administratively part of Canacona taluka, South Goa). The mainland coastline ends at 14.9002 N. As a result, the South Goa box and the Canacona box include one row of IMERG cells (centre 14.85 N) to ensure full administrative coverage of Goa's territory.
- Cells actually averaged (from the Giovanni file headers):
  - IMERG north_goa: cell centres 73.75-74.25 E, 15.45-15.75 N (6 x 4 = 24 cells). IMERG south_goa: 73.85-74.25 E, 14.85-15.45 N (5 x 7 = 35 cells).
  - GLDAS north_goa: two cells (73.875 and 74.125 E at 15.625 N). GLDAS south_goa: six cells (73.875-74.125 E, 14.875-15.375 N).
- The suitability table is per taluka (12, as defined by M5) and land type. Each taluka inherits its district's water indicators.
- **What is taluka-level and what is not:**
  - Rainfall on the map: taluka estimate (section 4.4), from the IMERG cells inside each taluka's bounding box.
  - Soil moisture: district value, inherited by every taluka in the district.
  - Suitability: decided by land type and variety; listed per taluka but not different between talukas.

## 4. Methods

### 4.1 Rainfall anomaly (`rainfall_anomaly.py`)
1. Monthly rainfall (mm) = mean rate (mm/hr) x hours in the month.
2. Kharif total = June + July + August + September. A year with any of the four months missing is left missing.
3. Baseline = mean and sample standard deviation of the Kharif total over 2001-2020 (20 seasons).
4. Anomaly = Kharif total - baseline mean, also given as percent of the baseline mean and in standard deviations.
5. Percentile = percent of baseline seasons with a lower total.
6. Category = India Meteorological Department departure classes: Large excess +60 % or more, Excess +20 to +59 %, Normal -19 to +19 %, Deficient -20 to -59 %, Large deficient -60 to -99 % [S1]. IMD applies them to whole-number percentages; this script applies them to unrounded values, so a value between -19.5 and -20.0 is labelled Normal here where IMD would round to Deficient. No Kharif 2025 seasonal value is near a boundary.
7. Monthly table: each month compared with the same calendar month's 2001-2020 mean. Percent anomaly is only reported where the monthly normal is at least 10 mm.

### 4.2 Root-zone soil moisture, GLDAS (`soil_moisture_gldas.py`)
1. 3-hourly values are averaged to calendar months (a month needs at least 90 % of its time steps).
2. Kharif mean = mean of the four monthly values, all four required.
3. Baseline, anomaly and percentile as for rainfall, against 2001-2020.
4. Monthly table: each month compared with the same calendar month in the baseline.
5. Values stay in kg m-2. Noah has four soil layers (0-10, 10-40, 40-100, 100-200 cm) [S7]; the README does not state a single root-zone depth for Noah, so no conversion to m3/m3 is made (**OPEN**). The percentile and percent anomaly do not need it.

### 4.3 Water-risk indicators (`water_risk.py`)
- Indicators are shown separately. There is no combined score.
- Signal labels:
  - Rainfall: dry at -20 % or below, wet at +20 % or above (IMD boundary).
  - Soil moisture: dry at the 30th percentile or below, wet at the 70th or above. The dry side is the US Drought Monitor "D0 abnormally dry" guideline (21st-30th percentile) [S5]; the wet side is its mirror image across the median, the convention used by the NC ECONet soil-moisture climatology ("abnormally wet" above the 70th) [S6]. These are US conventions applied here for screening, not an Indian standard.
- "Indicator agreement" states whether the available indicators point the same way (concurrent dry, concurrent wet, all near normal, mixed, conflicting).
- Evidence coverage is reported as the number of indicators with data out of the number expected.

### 4.4 Taluka rainfall estimate and map layer (`rainfall_taluka.py`, `build_map_layer.py`)
- Same dataset, season, baseline (2001-2020), categories and signal rule as 4.1, applied to one Giovanni area-average series per taluka.
- Area: M5's taluka bounding box (`data/boundaries/goa_bounding_boxes.json`, `bbox_exact`), not the taluka outline. Giovanni averages the 0.1 degree cells whose centres fall inside the box; the count is stored as `imerg_cells` (2 for Mormugao up to 12 for Sattari and Canacona).
- The script refuses to run if a file is missing, is not the monthly Final Run variable, or carries a box that does not match the taluka.
- `build_map_layer.py` attaches the district indicators to M5's taluka shapes. `rainfall_taluka.py` then replaces only the rainfall fields in the map file (`frontend/src/data/goa_taluka_indicators.geojson`) and keeps the district figure as `district_rainfall_anomaly_pct`. Soil-moisture fields stay district values.
- "Indicator agreement" on the map is recomputed per taluka from the taluka rainfall signal and the district soil-moisture signal.

### 4.5 Variety catalogue (`variety_catalogue.py`)
- Nine candidate varieties. Every filled value has a source URL in the same row. Unverified fields are left empty.
- No sourced value was found for any variety's soil requirement, water requirement or drought tolerance.

### 4.6 Suitability screening (`suitability_engine.py`)
A documentation-based screening for each taluka x land type (Morod, Kher, Khazan) x variety.

| Factor | Rule |
|---|---|
| Ecology | 1.0 if a Goa source (ICAR-CCARI / KVK) lists the variety for that land type; 0.75 if only a non-Goa source documents the fit; 0.0 if no source recommends it |
| Salinity tolerance (Khazan only) | 1.0 if tolerance is documented; 0.5 if not |
| Rainfall, soil moisture | 1.0 if the district signal is near normal; 0.5 if dry; a wet signal counts (1.0) only for varieties with documented submergence tolerance, otherwise it is listed as not assessed |
| Soil type, drainage, field salinity | Never assessed: no sourced data |

Classes: **Highly Suitable** (documented for the land type, no limiting factor), **Moderately Suitable** (documented, with a limiting factor), **Not Recommended** (no documented recommendation; score capped at 0.25).

The numeric weights are a screening convention chosen by M4 to order results. They are not a validated agronomic model. "Not Recommended" means "no documented recommendation", not "will fail".

### 4.7 M5 Geospatial map presentation rules (`mapStyles.js`, `rainfall_taluka.py`)

To satisfy the project brief requirement that any combined presentation rule must be explicitly documented:

1. **Water-Deficit Signal Classification (`water_risk_level`)**:
   Derived deterministically from M4's two indicators (`indicator_agreement` between IMERG rainfall and GLDAS root-zone soil moisture):
   - **High Deficit (Level 3)**: Concurrent dry signals (`indicator_agreement == "concurrent dry signals"`). Both IMERG rainfall departure <= -20 % and GLDAS root-zone soil moisture <= 30th percentile simultaneously.
   - **Moderate Deficit (Level 2)**: Single dry signal with normal buffer (`"dry" in indicator_agreement`, e.g. `mixed: dry, near normal` or conflicting signals). One indicator indicates a moisture deficit while the other remains at or above normal.
   - **Low Deficit (Level 1)**: Zero dry signals (`all near normal`, `concurrent wet signals`, or `mixed: near normal, wet`).
   *Naming*: Named "Water-deficit signal: Low / Moderate / High" because the rule evaluates dryness only. Kharif 2025 had root-zone soil moisture above all 20 baseline seasons and May rainfall about six to seven times normal; calling this "low water risk" would be misleading for flood-prone Kher and Khazan lands.
   *Dynamic re-derivation*: Applied consistently to both the Kharif seasonal aggregate and individual monthly views (Jun-Sep). When IMERG taluka-level estimates are computed, Canacona's September rainfall departure is -19.3 % (near normal) with 50th percentile soil moisture, resulting in `all near normal` and **Low Deficit**, while the other 11 talukas have rainfall departure <= -20 % and are classified as **Moderate Deficit**.

2. **Rice Variety Suitability Presentation**:
   - The map displays M4's qualitative documentation-based screening classes from `rice_suitability_matrix.csv` (**Highly Suitable**, **Moderately Suitable**, **Not Recommended**) and candidate varieties per ecology (Khazan, Kher, Morod).
   - Any undocumented scalar percentage (such as the legacy demo "96%") has been removed from all layers, tooltips, and data structures. The UI groups recommended varieties by documented agro-ecology:
     - Khazan (coastal saline lowlands): Goa Dhan 1-4, CSR-27, CSR-36 (documented salinity tolerance).
     - Kher (rainfed shallow lowlands): Karjat-3, Naveen (documented Goa recommendation).
     - Morod (rainfed uplands): Annada (documented upland variety).
   - The choropleth layer colors talukas by their documented agro-ecological suitability coverage (Multi-ecology Khazan + Kher lowlands in deep emerald, Khazan coastal saline in cyan, Kher lowlands + Morod uplands in teal).

3. **Separate Indicators Access**:
   The interactive map directly provides individual layer toggles and inspector cards for the uncombined NASA products:
   - Precipitation Anomaly % (GPM IMERG Final monthly v07, ~11 km)
   - Root-Zone Soil Moisture Percentile (GLDAS-2.1 Noah model, ~25 km)
   - Rainfall Percentile (GPM IMERG Final v07)
   - Two-Indicator Agreement (Categorical cross-indicator agreement between IMERG rainfall and GLDAS model root-zone moisture)

### 4.8 Preliminary Kharif 2026 (`rainfall_late.py`, `water_risk_2026.py`)

The research-quality IMERG Final Run ends on 30 Sep 2025, so 2026 cannot be analysed with the product used for 2025. A separate, clearly labelled preliminary path is used. It never writes to the 2025 tables.

1. **Rainfall:** IMERG **Late Run** daily (`GPM_3IMERGDL` v07, near-real-time, no monthly rain-gauge adjustment), Giovanni area average over the two district boxes, 2001-01-01 to 2026-10-31.
2. Daily values (mm/day) become monthly totals: mean of valid days x days in month; a month needs at least 90 % of its days.
3. **Like with like:** the 2026 season is compared with the Late Run's own 2001-2020 baseline, not with the Final Run baseline. Formulas, IMD classes and the +/-20 % signal rule are those of section 4.1.
4. **Soil moisture:** the same GLDAS-2.1 Noah variable as section 4.2. The product was released only to 31 Jul 2026 when this was run, so June and July 2026 are each compared with the same calendar month in 2001-2020. August, September and the full-season value are empty.
5. **Season agreement** uses rainfall alone and is labelled "single indicator only". Monthly agreement uses both indicators where both exist.
6. The map file receives a separate `kharif_2026` block per taluka with the district values ("district value (inherited by taluka)"); the 2025 fields are unchanged.

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

### Taluka rainfall estimates (IMERG, Kharif 2025 vs 2001-2020)
| Taluka | IMERG cells | Season vs normal | June | July | August | September |
|---|---|---|---|---|---|---|
| Pernem | 6 | +2.7 % | -5.0 % | +4.7 % | +22.3 % | -20.3 % |
| Bardez | 4 | +1.9 % | -7.9 % | +6.1 % | +22.9 % | -23.3 % |
| Tiswadi | 4 | +2.9 % | -7.7 % | +9.0 % | +23.8 % | -26.3 % |
| Bicholim | 6 | +4.3 % | -3.7 % | +10.2 % | +21.7 % | -25.2 % |
| Sattari | 12 | +5.2 % | -1.0 % | +11.9 % | +19.0 % | -24.7 % |
| Ponda | 4 | +5.1 % | -5.9 % | +13.4 % | +23.6 % | -26.0 % |
| Mormugao | 2 | +5.0 % | -8.7 % | +13.6 % | +26.8 % | -26.2 % |
| Salcete | 6 | +6.6 % | -7.4 % | +18.4 % | +22.9 % | -23.9 % |
| Quepem | 9 | +7.6 % | -6.5 % | +21.5 % | +19.8 % | -21.8 % |
| Sanguem | 6 | +9.0 % | -1.7 % | +23.0 % | +16.3 % | -21.1 % |
| Dharbandora | 4 | +6.6 % | 0.0 % | +15.9 % | +16.9 % | -24.1 % |
| Canacona | 12 | +8.6 % | -9.3 % | +24.1 % | +23.1 % | -19.3 % |

Reading:
- Every taluka is "near normal" for the season (IMD category Normal). The range is +1.9 % to +9.0 %.
- Talukas in the south are slightly further above normal than those in the north, consistent with the district figures (+4.3 % and +7.0 %).
- The monthly pattern is the same everywhere: June slightly below normal, July and August above, September about 20-26 % below.
- Differences of a few percentage points between neighbouring talukas should not be read as a ranking (see limitations 11 and 12).

### Suitability screening
324 rows. Khazan: Goa Dhan 1-4, CSR-27, CSR-36 Highly Suitable. Kher: Karjat-3 and Naveen Highly Suitable. Morod: Annada Moderately Suitable (upland fit documented only by a non-Goa source). All other combinations Not Recommended. Results are identical for all talukas within a district.

## 5b. Preliminary results for Kharif 2026

**Status: preliminary.** Near-real-time rainfall; soil moisture for June-July only; district values.

| | North Goa | South Goa |
|---|---|---|
| Kharif rainfall vs Late Run 2001-2020 normal | -26.0 % | -32.2 % |
| IMD class | Deficient | Deficient |
| Rank among 26 Late Run seasons (1 = driest) | 5 | 1 |
| Root-zone soil moisture, June (percentile of 2001-2020 Junes) | 55 | 55 |
| Root-zone soil moisture, July (percentile of 2001-2020 Julys) | 25 (dry) | 30 (dry) |
| Soil moisture, August-September | not yet released | not yet released |

Monthly rainfall direction (Late Run; direction only, see limitation 16): below normal in all four months in both districts (June and September most strongly). May 2026 was about +21 %, with no pre-monsoon surge like May 2025.

Reading:
- Both districts had a clearly deficient Kharif 2026 in satellite rainfall.
- Root-zone soil moisture was near its median in June and had fallen into the dry class by July in both districts, consistent with a deficit building up through the season. What happened in August and September is not known from this dataset.
- South Goa July is the only month with two dry signals. Both sit on their thresholds (rainfall -21.2 % against -20 %; soil moisture at the 30th percentile against 30) and the rainfall value is a low-confidence monthly Late Run figure, so this "concurrent dry" flag is weak evidence on its own.

Checks:

| Check | Result |
|---|---|
| Late Run 2026 vs IMD gauges (press report [S3]) | North -26.0 % vs -36.8 %; South -32.2 % vs -26.9 %; both sources: Deficient. Mean of the two districts about -29 % vs IMD state figure -31.7 %. |
| Late Run 2025 vs Final Run 2025 | North -4.7 % vs +4.3 %; South +0.8 % vs +7.0 %; both products: Normal. The Late Run season figure reads 6-9 points lower. |
| Late Run vs Final Run, single months of 2025 | Large differences (North Goa June -34 % vs -3 %, August +60 % vs +21 %). |

The two sources disagree on which district was drier in 2026; no claim is made about that.

## 6. Validation

Done:
- Units check: IMERG values confirmed as mm/hr on Giovanni; converted totals are in a plausible range.
- Cross-dataset consistency: the May 2025 rainfall surge (IMERG) matches the early soil wetting (GLDAS).
- Scripts were tested on synthetic files in the same layout before running on real data.

- **Independent check against IMD rain gauges (15 Nov 2026).** IMD's end-of-season report for 2025, as reported in the press, gives Goa 104 % of the long-period average (3,135 mm), North Goa 100 % and South Goa 108 % [S2, S3]. This analysis gives +4.3 % (North) and +7.0 % (South) from satellite data. Both sources agree on a normal season with the south slightly wetter. Caveats: the IMD figures are taken from news reports of the IMD statement, not the IMD document itself, and IMD's reference period differs from the 2001-2020 baseline used here.
- IMD class boundaries and the percentile convention were confirmed (sections 4.1 and 4.3).
- Gauge normals confirm limitations 2 and 13: IMD's June-September normal is 3,007.8 mm for Goa (North 3,085.5, South 2,939.2) [S3], against an IMERG baseline of about 2,180 mm; station climatology shows the hill stations wettest (Valpoi 4,150 mm, Quepem 3,751, Sanguem 3,700, Ponda 3,400) and the coast driest (Panaji 2,892, Mormugao 2,732) [S4], the reverse of the IMERG taluka pattern.

Still open:
- CSR-36 numeric salinity limit. The ICAR-CSSRI page lists both 11 and 7 dS/m in adjacent entries and it is not clear which belongs to CSR-36 [S11]; IRRI reports trials at 6-10 dS/m [S12]. The catalogue therefore keeps "tolerant, no numeric limit".
- Upland (Morod) candidate. No Goa source for Annada was found. Press reports state that ICAR-CCARI demonstrates and promotes **Sahbhagi Dhan** for Morod / rainfed upland conditions in Goa [S13, S14]. It is not in the catalogue because the project rule requires an institutional source, not press; it is the first variety to add if ICAR-CCARI or KVK documentation is located.
- Context for readers: IMD reports the 2026 monsoon over Goa as 31.7 % below normal (Deficient) [S3]. The main analysis covers Kharif 2025 and must not be presented as the current season. Kharif 2026 is covered separately and only as a preliminary result (sections 4.8 and 5b).
- SMAP L4 results, and how SMAP and GLDAS compare.

## 7. Limitations

1. **Resolution.** IMERG is about 11 km, GLDAS about 28 km, SMAP 9 km. Soil-moisture indicators are district-scale; rainfall is also given as a coarse taluka estimate (limitations 11-13). Nothing here distinguishes land types or fields. North Goa's GLDAS value rests on two model cells.
2. **Absolute rainfall is low.** The IMERG baseline (about 2,180 mm) is well below the gauge normal for Goa (3,007.8 mm, IMD [S3]). The boxes include sea, and satellite estimates tend to under-read heavy orographic rain. Use the percent departure, not the mm total, as the headline.
3. **Fixed June-September window.** The exceptional May 2025 rainfall falls outside it, so the seasonal rainfall anomaly understates how wet the start of the crop season was.
4. **Short or modelled soil-moisture records.** GLDAS is a model. SMAP L4 has only eleven seasons (2015-2025), so its percentiles will be coarse.
5. **"Above all 20 baseline seasons"** is a statement about this model record, not a measured record.
6. **No land-type map.** Whether Morod, Kher or Khazan land occurs in a given taluka is not verified; the screening is "for this land type, if present".
7. **No soil, drainage or field-salinity data.** These factors are not assessed. No soil pH or salinity value was invented.
8. **Catalogue gaps.** No sourced drought tolerance, soil or water requirement for any variety; no numeric salinity limit for the Goa Dhan series; only one Morod candidate.
9. **One past season.** Water indicators describe Kharif 2025. They are context for a variety choice, not a forecast.
10. **Earlier placeholder data.** Synthetic rainfall and soil-moisture files existed in the repo before 14 Nov 2026 and were replaced. Any mock values still hardcoded in frontend or GIS files are not M4 outputs.
11. **Taluka rainfall is a box estimate.** It uses the taluka's bounding rectangle, not its outline, and only 2 to 12 IMERG cells. Rectangles of neighbouring talukas overlap and share cells, so the values are not independent and small differences are not meaningful.
12. **Signal labels flip near the threshold.** Monthly values sit close to the +/-20 % boundaries (for example Canacona September -19.3 % "near normal" beside Quepem -21.8 % "dry"). A colour difference on the monthly map can reflect a difference of two or three percentage points.
13. **Taluka mm totals should not be quoted.** The IMERG baselines are higher for coastal talukas (Bardez 2,441 mm) than for the hill talukas (Sattari 2,100 mm, Dharbandora 2,063 mm). Station normals show the opposite pattern [S4], and published evaluations report that IMERG underestimates rainfall over the Western Ghats relative to gauges [S10]. Percent departure compares each taluka with its own record and is less affected.
<<<<<<< HEAD
14. **Map-only combined values and M5 rules.** The "water risk level / score" is deterministically derived from M4's multi-sensor indicator agreement (see section 4.7). The legacy per-taluka scalar "rice suitability 96%" has been removed in favor of displaying the qualitative screening classes and recommended varieties per ecology from M4's matrix. Separate uncombined NASA indicators are directly accessible on the map.
15. **2026 is preliminary.** The Late Run has no monthly gauge adjustment. On the 2025 season it differed from the Final Run by 6-9 percentage points, so a Late Run seasonal figure should be read as accurate to roughly +/-10 points. The 2026 deficits (26-32 %) are outside that margin; their exact size and the north/south ordering are not.
16. **Late Run monthly values are low confidence.** Single months of 2025 differed from the Final Run by up to about 40 points. For 2026, show whether a month was below or above normal, not the percentage, and treat monthly dry/wet labels as indicative.
17. **2026 soil moisture is incomplete.** June and July only. There is no full-season soil-moisture indicator, the season-level agreement rests on rainfall alone, and the "months with concurrent dry signals" count can only see June and July.
18. **2026 has no taluka estimates.** Every taluka shows its district's value.
=======
14. **Map-only combined values and M5 rules.** The "water-deficit signal (Low / Moderate / High)" is deterministically derived from M4's two indicators (rainfall and soil moisture) agreement (see section 4.7). It is named "water-deficit signal" because the rule evaluates dryness only and does not assess flood risk. The legacy per-taluka scalar "rice suitability 96%" has been removed in favor of displaying the qualitative screening classes and recommended varieties per ecology from M4's matrix. Separate uncombined NASA indicators are directly accessible on the map.
>>>>>>> origin/feat/goa-geospatial-map

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
| `rainfall_anomalies_taluka` | taluka (`region_id`, Kharif 2025) | same rainfall columns as `rainfall_anomalies`, plus `rainfall_signal`, `imerg_cells`, `user_bbox_wsen`, `data_bbox_wsen`, `spatial_basis` |
| `rainfall_monthly_taluka` | taluka x Kharif month | `rainfall_mm`, `baseline_month_mean_mm`, `month_anomaly_pct`, `rainfall_signal` |
| `taluka_map_layer.geojson` | taluka polygon | `rainfall_anomaly_pct` (taluka estimate), `district_rainfall_anomaly_pct`, `rainfall_basis`, `rainfall_imerg_cells`, `sm_gldas_percentile` (district), `indicator_agreement`, `monthly.{jun,jul,aug,sep}`, `spatial_note` |
| `rainfall_late_anomalies` | zone x season (2025, 2026), Late Run | rainfall columns as in `rainfall_anomalies`, plus `rainfall_signal`, `data_quality` |
| `rainfall_late_monthly` | zone x month (May-Sep of 2025, 2026) | `rainfall_mm`, `baseline_month_mean_mm`, `month_anomaly_pct`, `rainfall_signal`, `days_valid` |
| `rainfall_late_kharif_history` | zone x year, Late Run | all seasons 2001-2026 |
| `water_risk_indicators_2026` | zone (preliminary) | `rainfall_anomaly_pct`, `rainfall_category_imd`, `rainfall_signal`, `sm_gldas_months_available`, `sm_gldas_partial_percentile`, `indicator_agreement`, `data_quality` |
| `water_risk_monthly_2026` | zone x Kharif month | `rainfall_month_anomaly_pct`, `rainfall_signal`, `sm_gldas_month_percentile`, `sm_gldas_signal`, `indicator_agreement` |
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
python backend/app/science/rainfall_taluka.py      # needs data/raw/imerg_taluka/ (12 files)
python backend/app/science/rainfall_late.py        # needs data/raw/imerg_late/ (daily Late Run, 4 files)
python backend/app/science/water_risk_2026.py      # needs data/raw/gldas_2026/ (2 files); run after the two above
```

`build_map_layer.py` is run once to create the map file from the taluka shapes. Do not re-run it after `rainfall_taluka.py`: it resets `data/processed/taluka_map_layer.geojson` to district rainfall values (it never overwrites the frontend copy).

## 10. Sources for the look-ups (accessed 15 Nov 2026)

| Ref | Source | Used for |
|---|---|---|
| S1 | IMD iRAINS, departure map legend: https://irainshydro.imd.gov.in/ | IMD departure classes |
| S2 | Prudent Media, 14 Oct 2025, reporting IMD's end-of-season statement: https://www.prudentmedia.in/general/imd-announces-withdrawal-of-monsoon-ahead-of-goa-schedule/34619.html | Goa 2025: 104 % of LPA, North 100 %, South 108 % |
| S3 | O Heraldo, 1 Oct 2026, reporting IMD data: https://www.heraldgoa.in/goa/goas-worst-monsoon-in-almost-five-decades/490573/ | June-September normals; 2025 and 2026 seasonal totals |
| S4 | "Study of rainfall features over Goa state during southwest monsoon season", Mausam (IMD journal): https://mausamjournal.imd.gov.in/index.php/MAUSAM/article/download/796/680/2837 | Station rainfall, coast versus hills |
| S5 | USDA Climate Hubs, "The United States Drought Monitor Process": https://www.climatehubs.usda.gov/sites/default/files/Fuchs%20USDM%20Phx%20March%202019.pdf | D0 = 21st-30th percentile |
| S6 | NC State ECONet soil moisture climatology: https://econet.climate.ncsu.edu/soil_moisture/ | Mirrored wet classes (70th percentile) |
| S7 | NASA GES DISC, README for GLDAS Version 2 data: https://hydro1.gesdisc.eosdis.nasa.gov/data/GLDAS/GLDAS_NOAH025_3H.2.1/doc/README_GLDAS2.pdf | RootMoist_inst units, Noah layers |
| S8 | NSIDC, SMAP L4 user guide (Version 7): https://nsidc.org/sites/default/files/documents/user-guide/multi_spl4smau-v007-userguide_1_0.pdf | Root zone = 0-100 cm; quality control |
| S9 | "Validation of Satellite Soil Moisture Products by Sparsification of Ground Observations": https://www.researchgate.net/publication/378019216 | No quality flag for SPL4SMGP |
| S10 | Weather and Climate Dynamics 6, 981 (2025): https://wcd.copernicus.org/articles/6/981/2025/ | IMERG underestimation over the Western Ghats |
| S11 | ICAR-CSSRI, varieties developed: https://cssri.res.in/varieties-developed/ | CSR-36 (ambiguous salinity figure) |
| S12 | IRRI news, 10 Jun 2024: https://www.irri.org/news-and-events/news/salinity-tolerant-rice-variety-set-boost-rice-yield-stress-prone-areas-kenya | CSR-36 trial conditions |
| S13 | Times of India, 9 Nov 2026: https://timesofindia.indiatimes.com/city/goa/agri-body-advises-moisture-stress-management-for-rabi-crops/articleshow/135692094.cms | Sahbhagi Dhan for Morod (press) |
| S14 | Times of India, 16 Sep 2018: https://timesofindia.indiatimes.com/city/goa/scientists-developing-new-rice-variety-to-replace-jyoti/articleshow/65834921.cms | Sahbhagi Dhan in Goa uplands (press) |

S2, S3, S13 and S14 are news reports. S1-S14 were read as search-result extracts, not as full documents.
