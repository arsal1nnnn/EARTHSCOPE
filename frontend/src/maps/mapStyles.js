/**
 * mapStyles.js
 * Color scales, styling functions, seasonal simulation, and geospatial metadata for Goa Talukas.
 * Project: EARTHSCOPE — NASA Space Apps Challenge
 */

export const STRESS_CATEGORIES = {
  Severe: {
    label: "Severe Stress",
    min: 70,
    max: 100,
    color: "#dc2626",
    fillColor: "#ef4444",
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
  },
  Elevated: {
    label: "Elevated Stress",
    min: 50,
    max: 69,
    color: "#ea580c",
    fillColor: "#f97316",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  Moderate: {
    label: "Moderate Stress",
    min: 30,
    max: 49,
    color: "#d97706",
    fillColor: "#f59e0b",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  Low: {
    label: "Low Stress",
    min: 15,
    max: 29,
    color: "#65a30d",
    fillColor: "#84cc16",
    badge: "bg-lime-500/20 text-lime-400 border-lime-500/40",
  },
  Normal: {
    label: "Normal / Healthy",
    min: 0,
    max: 14,
    color: "#059669",
    fillColor: "#10b981",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
};

export const METRIC_CONFIGS = {
  asi_score: {
    id: "asi_score",
    label: "Agricultural Stress Index (ASI)",
    unit: "/ 100",
    description: "Multi-sensor index synthesized from SMAP, MODIS NDVI/LST & IMERG",
    getColor: (val) => {
      if (val >= 70) return "#ef4444";
      if (val >= 50) return "#f97316";
      if (val >= 30) return "#f59e0b";
      if (val >= 15) return "#84cc16";
      return "#10b981";
    },
  },
  soil_moisture_pct: {
    id: "soil_moisture_pct",
    label: "Soil Moisture (SMAP L4)",
    unit: "% volumetric",
    description: "Root-zone soil moisture anomaly from NASA SMAP L4 V007",
    getColor: (val) => {
      if (val < 15) return "#dc2626";
      if (val < 20) return "#f97316";
      if (val < 25) return "#facc15";
      if (val < 30) return "#38bdf8";
      return "#0284c7";
    },
  },
  rainfall_anomaly: {
    id: "rainfall_anomaly",
    label: "Precipitation Anomaly (GPM IMERG)",
    unit: "% departure",
    description: "GPM IMERG V07 departure from 10-year seasonal baseline",
    getColor: (val) => {
      if (val <= -30) return "#b91c1c";
      if (val <= -15) return "#f97316";
      if (val < 0) return "#fbbf24";
      if (val < 20) return "#34d399";
      return "#06b6d4";
    },
  },
  predicted_30d_prob: {
    id: "predicted_30d_prob",
    label: "30-Day Stress Probability",
    unit: "Probability",
    description: "Predictive model likelihood of severe water stress in next 30 days",
    getColor: (val) => {
      if (val >= 0.7) return "#dc2626";
      if (val >= 0.5) return "#f97316";
      if (val >= 0.3) return "#f59e0b";
      if (val >= 0.15) return "#84cc16";
      return "#10b981";
    },
  },
};

// Taluka Centroids & Ecological Classifications for Goa
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

// Kharif Season Months and Simulated Environmental Modifiers
export const KHARIF_MONTHS = [
  { id: "all", label: "Full Season (Aggregate)", phase: "Full Kharif Overview", rainMod: 0, smMod: 0, asiMod: 0 },
  { id: "jun", label: "June", phase: "Monsoon Onset & Sowing", rainMod: -15, smMod: -6, asiMod: +10 },
  { id: "jul", label: "July", phase: "Peak Monsoon & Vegetative Tillering", rainMod: +25, smMod: +12, asiMod: -18 },
  { id: "aug", label: "August", phase: "Mid-Season & Panicle Initiation", rainMod: +10, smMod: +6, asiMod: -8 },
  { id: "sep", label: "September", phase: "Flowering & Grain Filling", rainMod: -12, smMod: -4, asiMod: +8 },
  { id: "oct", label: "October", phase: "Monsoon Retreat & Harvest", rainMod: -30, smMod: -10, asiMod: +16 },
];

/**
 * Computes seasonal metric values for a taluka feature based on the active month.
 */
export function getSeasonalProps(baseProps, activeMonthId = "all") {
  if (!baseProps) return {};
  if (activeMonthId === "all") return baseProps;

  const month = KHARIF_MONTHS.find((m) => m.id === activeMonthId) || KHARIF_MONTHS[0];

  const baseAsi = baseProps.asi_score ?? 40;
  const baseSm = baseProps.soil_moisture_pct ?? 20;
  const baseRain = baseProps.rainfall_anomaly ?? -10;
  const baseProb = baseProps.predicted_30d_prob ?? 0.35;

  const adjustedAsi = Math.max(5, Math.min(95, Math.round(baseAsi + month.asiMod)));
  const adjustedSm = Math.max(8, Math.min(48, Math.round(baseSm + month.smMod)));
  const adjustedRain = Math.round((baseRain + month.rainMod) * 10) / 10;
  const adjustedProb = Math.max(0.05, Math.min(0.95, Math.round((baseProb + (month.asiMod / 100)) * 100) / 100));

  let category = "Normal";
  if (adjustedAsi >= 70) category = "Severe";
  else if (adjustedAsi >= 50) category = "Elevated";
  else if (adjustedAsi >= 30) category = "Moderate";
  else if (adjustedAsi >= 15) category = "Low";

  return {
    ...baseProps,
    asi_score: adjustedAsi,
    stress_category: category,
    soil_moisture_pct: adjustedSm,
    rainfall_anomaly: adjustedRain,
    predicted_30d_prob: adjustedProb,
  };
}

/**
 * Returns polygon styling options for a taluka feature.
 */
export function getTalukaStyle(
  feature,
  activeMetric = "asi_score",
  isSelected = false,
  isHovered = false,
  isCompared = false,
  activeMonthId = "all"
) {
  const rawProps = feature?.properties || {};
  const props = getSeasonalProps(rawProps, activeMonthId);
  const metricCfg = METRIC_CONFIGS[activeMetric] || METRIC_CONFIGS.asi_score;
  const rawValue = props[activeMetric] ?? props.asi_score ?? 0;
  const fillColor = metricCfg.getColor(rawValue);

  // Primary Selected Taluka
  if (isSelected) {
    return {
      fillColor: fillColor,
      fillOpacity: 0.88,
      color: "#ffffff",
      weight: 3.5,
      dashArray: "",
    };
  }

  // Compared Taluka (Secondary Pin)
  if (isCompared) {
    return {
      fillColor: fillColor,
      fillOpacity: 0.85,
      color: "#fbbf24", // Amber-gold comparison outline
      weight: 3.5,
      dashArray: "4, 4",
    };
  }

  // Hover Highlight
  if (isHovered) {
    return {
      fillColor: fillColor,
      fillOpacity: 0.78,
      color: "#38bdf8", // Sky blue highlight
      weight: 2.5,
      dashArray: "",
    };
  }

  // Default Resting State
  return {
    fillColor: fillColor,
    fillOpacity: 0.58,
    color: "#0f172a",
    weight: 1.5,
    dashArray: "",
  };
}

// Exact Bounding Box of all 12 Goa Talukas (WGS84 EPSG:4326)
export const GOA_BOUNDS = [
  [14.7529, 73.6756], // South-West corner (Canacona coastline)
  [15.8008, 74.3361], // North-East corner (Pernem / Sattari Western Ghats)
];

export const GOA_MAP_CONFIG = {
  center: [15.28, 73.98], // True geographic center of Goa
  zoom: 10,
  minZoom: 8,
  maxZoom: 15,
  maxBounds: [
    [13.8, 72.0], // Generous regional SW bounds
    [16.8, 76.0], // Generous regional NE bounds
  ],
};
