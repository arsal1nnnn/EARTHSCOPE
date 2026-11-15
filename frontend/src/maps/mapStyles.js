/**
 * mapStyles.js
 * Color scales, styling functions, and geospatial metadata for Goa Talukas.
 * Project: EARTHSCOPE — NASA Space Apps Challenge
 *
 * DATA SOURCES (all real NASA datasets):
 *   - GPM IMERG Final monthly v07 (~11 km) for rainfall metrics
 *   - GLDAS-2.1 Noah root-zone soil moisture (~25 km, model assimilation) for soil moisture
 *
 * NOTE: ASI score, soil_moisture_pct (% vol), predicted_30d_prob, evidence_coverage
 * and stress_category were REMOVED — they were fabricated and have no NASA source.
 * Only fields present in goa_taluka_indicators.geojson (M4 output) are used here.
 */

// ---------------------------------------------------------------------------
// Real NASA Metric Configurations (3 confirmed real metrics from M4 output)
// ---------------------------------------------------------------------------
export const METRIC_CONFIGS = {
  rainfall_anomaly_pct: {
    id: "rainfall_anomaly_pct",
    label: "Precipitation Anomaly (GPM IMERG v07)",
    unit: "% departure from 2001–2020 baseline",
    description: "GPM IMERG Final monthly v07 (~11 km) departure from 20-year seasonal baseline",
    source: "GPM IMERG Final monthly v07 (~11 km)",
    getColor: (val) => {
      if (val <= -20) return "#b91c1c";
      if (val <= -10) return "#f97316";
      if (val < 0)   return "#fbbf24";
      if (val < 15)  return "#34d399";
      return "#06b6d4";
    },
  },
  sm_gldas_percentile: {
    id: "sm_gldas_percentile",
    label: "Soil Moisture Percentile (GLDAS-2.1 Noah)",
    unit: "percentile (0–100)",
    description: "GLDAS-2.1 Noah root-zone soil moisture percentile (~25 km, model assimilation)",
    source: "GLDAS-2.1 Noah root-zone soil moisture (~25 km, model assimilation)",
    getColor: (val) => {
      if (val <= 10) return "#dc2626";
      if (val <= 25) return "#f97316";
      if (val <= 40) return "#facc15";
      if (val <= 70) return "#38bdf8";
      return "#0284c7";
    },
  },
  rainfall_percentile: {
    id: "rainfall_percentile",
    label: "Rainfall Percentile (GPM IMERG v07)",
    unit: "percentile (0–100)",
    description: "GPM IMERG Final monthly v07 rainfall percentile relative to 2001–2020 baseline",
    source: "GPM IMERG Final monthly v07 (~11 km)",
    getColor: (val) => {
      if (val <= 10) return "#b91c1c";
      if (val <= 25) return "#f97316";
      if (val <= 40) return "#fbbf24";
      if (val <= 65) return "#34d399";
      return "#06b6d4";
    },
  },
};

// ---------------------------------------------------------------------------
// Taluka Centroids & Ecological Classifications for Goa
// ---------------------------------------------------------------------------
export const TALUKA_METADATA = {
  "GOA-N-PERNEM": {
    name: "Pernem",
    district: "North Goa",
    center: [15.6981, 73.7679],
    ecologies: ["Morod", "Kher"],
    advisory: "Upland plateau cashews and rainfed paddy require moisture monitoring during early monsoon dry spells.",
  },
  "GOA-N-BARDEZ": {
    name: "Bardez",
    district: "North Goa",
    center: [15.5469, 73.7879],
    ecologies: ["Kher", "Khazan"],
    advisory: "Coastal lowlands facing peri-urban runoff and salinity intrusion in estuarine khazan pockets.",
  },
  "GOA-N-TISWADI": {
    name: "Tiswadi",
    district: "North Goa",
    center: [15.4680, 73.8469],
    ecologies: ["Khazan", "Kher"],
    advisory: "Mandovi-Zuari tidal estuarine khazan bund maintenance vital for salinity protection.",
  },
  "GOA-N-BICHOLIM": {
    name: "Bicholim",
    district: "North Goa",
    center: [15.5844, 73.9565],
    ecologies: ["Kher", "Morod"],
    advisory: "Mining watershed transition zones exhibit laterite topsoil desiccation under high thermal load.",
  },
  "GOA-N-SATTARI": {
    name: "Sattari",
    district: "North Goa",
    center: [15.5860, 74.1499],
    ecologies: ["Morod", "Kher"],
    advisory: "Dense canopy in Western Ghats foothills maintains high moisture retention; arecanut and spices thrive.",
  },
  "GOA-S-PONDA": {
    name: "Ponda",
    district: "South Goa",
    center: [15.3810, 74.0599],
    ecologies: ["Morod", "Kher"],
    advisory: "Central spice belt with deep lateritic valleys; moderate irrigation buffer from local springs.",
  },
  "GOA-S-MORMUGAO": {
    name: "Mormugao",
    district: "South Goa",
    center: [15.3906, 73.8351],
    ecologies: ["Khazan"],
    advisory: "Peninsular coastal ecology with restricted agricultural acreage; localized salt-spray impact.",
  },
  "GOA-S-SALCETE": {
    name: "Salcete",
    district: "South Goa",
    center: [15.2378, 73.9928],
    ecologies: ["Khazan", "Kher"],
    advisory: "Major fertile rice bowl; Kushavati river basin requires supplemental sluice management during monsoon pauses.",
  },
  "GOA-S-QUEPEM": {
    name: "Quepem",
    district: "South Goa",
    center: [15.1697, 74.0544],
    ecologies: ["Morod", "Kher"],
    advisory: "Elevated water deficit observed; rainfed sugarcane and paddy show signs of delayed vegetative tillering.",
  },
  "GOA-S-SANGUEM": {
    name: "Sanguem",
    district: "South Goa",
    center: [15.2037, 74.1862],
    ecologies: ["Morod", "Kher"],
    advisory: "Salaulim reservoir catchment provides strong hydrological buffer; favorable forest canopy protection.",
  },
  "GOA-S-DHARBANDORA": {
    name: "Dharbandora",
    district: "South Goa",
    center: [15.3630, 74.1356],
    ecologies: ["Morod", "Kher"],
    advisory: "Bhagwan Mahaveer Sanctuary transition belt; soil compaction along transport corridors reduces infiltration.",
  },
  "GOA-S-CANACONA": {
    name: "Canacona",
    district: "South Goa",
    center: [15.0007, 74.0159],
    ecologies: ["Kher", "Khazan"],
    advisory: "Southern coastal and valley systems exhibit healthy soil moisture and stable micro-climate index.",
  },
};

// ---------------------------------------------------------------------------
// Kharif Season Months — display metadata only (no fabricated modifiers)
// Monthly real values come from the `monthly` nested object in goa_taluka_indicators.geojson
// ---------------------------------------------------------------------------
export const KHARIF_MONTHS = [
  { id: "all", label: "Full Season (Jun–Sep)", phase: "Kharif 2025 Aggregate (GPM IMERG)" },
  { id: "jun", label: "June", phase: "Monsoon Onset & Sowing" },
  { id: "jul", label: "July", phase: "Peak Monsoon Tillering" },
  { id: "aug", label: "August", phase: "Mid-Season Panicle Initiation" },
  { id: "sep", label: "September", phase: "Flowering & Grain Filling" },
  { id: "oct", label: "October", phase: "Monsoon Retreat & Harvest (data pending)" },
];

// ---------------------------------------------------------------------------
// getSeasonalProps
// Returns real monthly sub-data from the `monthly` nested object when a specific
// month is active, otherwise returns the full-season aggregated props unchanged.
// NO invented modifiers — all values are read directly from the GeoJSON feature.
// ---------------------------------------------------------------------------
export function getSeasonalProps(baseProps, activeMonthId = "all") {
  if (!baseProps) return {};
  if (activeMonthId === "all") return baseProps;

  const monthly = baseProps.monthly;
  if (!monthly || !monthly[activeMonthId]) return baseProps;

  const m = monthly[activeMonthId];
  return {
    ...baseProps,
    // Override seasonal aggregates with the active month's real values
    rainfall_anomaly_pct:  m.rainfall_month_anomaly_pct  ?? baseProps.rainfall_anomaly_pct,
    rainfall_signal:       m.rainfall_signal               ?? baseProps.rainfall_signal,
    sm_gldas_percentile:   m.sm_gldas_month_percentile    ?? baseProps.sm_gldas_percentile,
    sm_gldas_signal:       m.sm_gldas_signal               ?? baseProps.sm_gldas_signal,
    indicator_agreement:   m.indicator_agreement           ?? baseProps.indicator_agreement,
    kharif_rainfall_mm:    m.rainfall_mm                   ?? baseProps.kharif_rainfall_mm,
    _active_month: activeMonthId,
  };
}

// ---------------------------------------------------------------------------
// getTalukaStyle — polygon styling for the choropleth layer
// ---------------------------------------------------------------------------
export function getTalukaStyle(
  feature,
  activeMetric = "rainfall_anomaly_pct",
  isSelected = false,
  isHovered = false,
  isCompared = false,
  activeMonthId = "all"
) {
  const rawProps = feature?.properties || {};
  const props = getSeasonalProps(rawProps, activeMonthId);
  const metricCfg = METRIC_CONFIGS[activeMetric] || METRIC_CONFIGS.rainfall_anomaly_pct;
  const rawValue = props[activeMetric] ?? 0;
  const fillColor = metricCfg.getColor(rawValue);

  if (isSelected) {
    return { fillColor, fillOpacity: 0.88, color: "#ffffff", weight: 3.5, dashArray: "" };
  }
  if (isCompared) {
    return { fillColor, fillOpacity: 0.85, color: "#fbbf24", weight: 3.5, dashArray: "4, 4" };
  }
  if (isHovered) {
    return { fillColor, fillOpacity: 0.78, color: "#38bdf8", weight: 2.5, dashArray: "" };
  }
  return { fillColor, fillOpacity: 0.58, color: "#0f172a", weight: 1.5, dashArray: "" };
}

// ---------------------------------------------------------------------------
// Exact Bounding Box of all 12 Goa Talukas (WGS84 EPSG:4326)
// ---------------------------------------------------------------------------
export const GOA_BOUNDS = [
  [14.7529, 73.6756], // South-West corner (Canacona coastline)
  [15.8008, 74.3361], // North-East corner (Pernem / Sattari Western Ghats)
];

export const GOA_MAP_CONFIG = {
  center: [15.28, 73.98],
  zoom: 10,
  minZoom: 8,
  maxZoom: 15,
  maxBounds: [
    [13.8, 72.0],
    [16.8, 76.0],
  ],
};
