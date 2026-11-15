/**
 * mapStyles.js
 * Color scales, styling functions, and geospatial metadata for Goa Talukas.
 * Project: EARTHSCOPE — NASA Space Apps Challenge
 *
 * DATA SOURCES:
 *   - Water Risk: NASA GPM IMERG v07 + GLDAS-2.1 Noah indicator agreement & concurrent dry signals
 *   - Rice Suitability: ICAR-CCARI & KVK Goa documented variety recommendations across ecologies
 *   - GPM IMERG Final monthly v07 (~11 km) for rainfall metrics
 *   - GLDAS-2.1 Noah root-zone soil moisture (~25 km, model assimilation)
 */

// ---------------------------------------------------------------------------
// Confirmed Real Scientific Metric Configurations
// ---------------------------------------------------------------------------
export const METRIC_CONFIGS = {
  water_risk: {
    id: "water_risk",
    label: "Agricultural Water Risk",
    unit: "Risk Class",
    description: "Multi-indicator water stress based on concurrent NASA GPM rain & GLDAS moisture signals",
    source: "NASA GPM IMERG + GLDAS-2.1 Noah indicator agreement",
    getColor: (val) => {
      // 1: Low Risk (Healthy Water Buffer), 2: Moderate Risk (Deficit / Transition), 3: High Risk
      if (val >= 3) return "#ef4444"; // Red
      if (val >= 2) return "#f59e0b"; // Amber
      return "#10b981"; // Emerald
    },
  },
  rice_suitability: {
    id: "rice_suitability",
    label: "Rice Variety Suitability",
    unit: "% Suitability",
    description: "ICAR-CCARI & KVK Goa documented suitability across local land ecologies (Khazan, Kher, Morod)",
    source: "ICAR-CCARI & KVK Goa documented recommendations with NASA water context",
    getColor: (val) => {
      // 100%: Deep Emerald (Khazan & Kher lowlands with 6-8 varieties)
      // 96%: Teal (Kher lowlands & Morod uplands)
      // < 90%: Blue / Amber
      if (val >= 98) return "#059669";
      if (val >= 90) return "#0d9488";
      if (val >= 75) return "#3b82f6";
      return "#f59e0b";
    },
  },
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
// Taluka Centroids & Administrative Metadata for Goa (EPSG:4326)
// ---------------------------------------------------------------------------
export const TALUKA_METADATA = {
  "GOA-N-PERNEM":      { name: "Pernem",      district: "North Goa", center: [15.6981, 73.7679] },
  "GOA-N-BARDEZ":      { name: "Bardez",      district: "North Goa", center: [15.5469, 73.7879] },
  "GOA-N-TISWADI":     { name: "Tiswadi",     district: "North Goa", center: [15.4680, 73.8469] },
  "GOA-N-BICHOLIM":    { name: "Bicholim",    district: "North Goa", center: [15.5844, 73.9565] },
  "GOA-N-SATTARI":     { name: "Sattari",     district: "North Goa", center: [15.5860, 74.1499] },
  "GOA-S-PONDA":       { name: "Ponda",       district: "South Goa", center: [15.3810, 74.0599] },
  "GOA-S-MORMUGAO":    { name: "Mormugao",    district: "South Goa", center: [15.3906, 73.8351] },
  "GOA-S-SALCETE":     { name: "Salcete",     district: "South Goa", center: [15.2378, 73.9928] },
  "GOA-S-QUEPEM":      { name: "Quepem",      district: "South Goa", center: [15.1697, 74.0544] },
  "GOA-S-SANGUEM":     { name: "Sanguem",     district: "South Goa", center: [15.2037, 74.1862] },
  "GOA-S-DHARBANDORA": { name: "Dharbandora", district: "South Goa", center: [15.3630, 74.1356] },
  "GOA-S-CANACONA":    { name: "Canacona",    district: "South Goa", center: [15.0007, 74.0159] },
};

// ---------------------------------------------------------------------------
// Kharif Season Months — display metadata only
// ---------------------------------------------------------------------------
export const KHARIF_MONTHS = [
  { id: "all", label: "Full Season (Jun–Sep)", phase: "Kharif 2025 Aggregate (GPM IMERG + GLDAS-2.1)" },
  { id: "jun", label: "June", phase: "Monsoon Onset & Sowing" },
  { id: "jul", label: "July", phase: "Peak Monsoon Tillering" },
  { id: "aug", label: "August", phase: "Mid-Season Panicle Initiation" },
  { id: "sep", label: "September", phase: "Flowering & Grain Filling" },
  { id: "oct", label: "October", phase: "Monsoon Retreat & Harvest (data pending)" },
];

// ---------------------------------------------------------------------------
// getSeasonalProps
// Returns real monthly sub-data from the `monthly` nested object when a specific
// month is active, otherwise returns the full-season aggregated props.
// ---------------------------------------------------------------------------
export function getSeasonalProps(baseProps, activeMonthId = "all") {
  if (!baseProps) return {};
  
  const baseWaterRisk = baseProps.water_risk_score ?? (baseProps.water_risk?.score ?? 1);
  const baseSuitability = baseProps.rice_suitability_score ?? (baseProps.rice_suitability?.score_pct ?? 96);

  if (activeMonthId === "all") {
    return {
      ...baseProps,
      water_risk: baseWaterRisk,
      rice_suitability: baseSuitability,
    };
  }

  const monthly = baseProps.monthly;
  if (!monthly || !monthly[activeMonthId]) {
    return {
      ...baseProps,
      water_risk: baseWaterRisk,
      rice_suitability: baseSuitability,
    };
  }

  const m = monthly[activeMonthId];
  return {
    ...baseProps,
    rainfall_anomaly_pct:  m.rainfall_month_anomaly_pct  ?? baseProps.rainfall_anomaly_pct,
    rainfall_signal:       m.rainfall_signal               ?? baseProps.rainfall_signal,
    sm_gldas_percentile:   m.sm_gldas_month_percentile    ?? baseProps.sm_gldas_percentile,
    sm_gldas_signal:       m.sm_gldas_signal               ?? baseProps.sm_gldas_signal,
    indicator_agreement:   m.indicator_agreement           ?? baseProps.indicator_agreement,
    kharif_rainfall_mm:    m.rainfall_mm                   ?? baseProps.kharif_rainfall_mm,
    water_risk:            m.water_risk_score              ?? baseWaterRisk,
    water_risk_score:      m.water_risk_score              ?? baseWaterRisk,
    water_risk_level:      m.water_risk_level              ?? (baseProps.water_risk?.level ?? "Low"),
    rice_suitability:      baseSuitability,
    _active_month:         activeMonthId,
  };
}

// ---------------------------------------------------------------------------
// getTalukaStyle — polygon styling for the choropleth layer
// ---------------------------------------------------------------------------
export function getTalukaStyle(
  feature,
  activeMetric = "water_risk",
  isSelected = false,
  isHovered = false,
  isCompared = false,
  activeMonthId = "all"
) {
  const rawProps = feature?.properties || {};
  const props = getSeasonalProps(rawProps, activeMonthId);
  const metricCfg = METRIC_CONFIGS[activeMetric] || METRIC_CONFIGS.water_risk;
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
