/**
 * mapStyles.js
 * Color scales, styling functions, and visual configurations for Goa Taluka Choropleth.
 * Project: EARTHSCOPE — NASA Space Apps Challenge
 */

export const STRESS_CATEGORIES = {
  Severe: {
    label: "Severe Stress",
    min: 70,
    max: 100,
    color: "#dc2626", // Red 600
    fillColor: "#ef4444", // Red 500
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
  },
  Elevated: {
    label: "Elevated Stress",
    min: 50,
    max: 69,
    color: "#ea580c", // Orange 600
    fillColor: "#f97316", // Orange 500
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  Moderate: {
    label: "Moderate Stress",
    min: 30,
    max: 49,
    color: "#d97706", // Amber 600
    fillColor: "#f59e0b", // Amber 500
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  Low: {
    label: "Low Stress",
    min: 15,
    max: 29,
    color: "#65a30d", // Lime 600
    fillColor: "#84cc16", // Lime 500
    badge: "bg-lime-500/20 text-lime-400 border-lime-500/40",
  },
  Normal: {
    label: "Normal / Healthy",
    min: 0,
    max: 14,
    color: "#059669", // Emerald 600
    fillColor: "#10b981", // Emerald 500
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
      // Lower moisture = higher stress (brown/red to blue)
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
      // Negative = deficit (red/orange), Positive = surplus (teal/blue)
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

/**
 * Returns polygon styling options for a taluka feature.
 */
export function getTalukaStyle(feature, activeMetric = "asi_score", isSelected = false, isHovered = false) {
  const props = feature?.properties || {};
  const metricCfg = METRIC_CONFIGS[activeMetric] || METRIC_CONFIGS.asi_score;
  const rawValue = props[activeMetric] ?? props.asi_score ?? 0;
  const fillColor = metricCfg.getColor(rawValue);

  if (isSelected) {
    return {
      fillColor: fillColor,
      fillOpacity: 0.85,
      color: "#ffffff",
      weight: 3.5,
      dashArray: "",
      shadowColor: "#00ffff",
    };
  }

  if (isHovered) {
    return {
      fillColor: fillColor,
      fillOpacity: 0.75,
      color: "#38bdf8", // Sky blue highlight on hover
      weight: 2.5,
      dashArray: "",
    };
  }

  return {
    fillColor: fillColor,
    fillOpacity: 0.55,
    color: "#0f172a", // Dark navy boundary
    weight: 1.5,
    dashArray: "",
  };
}

export const GOA_MAP_CONFIG = {
  center: [15.38, 74.02], // Geographic center of Goa
  zoom: 10,
  minZoom: 9,
  maxZoom: 14,
  maxBounds: [
    [14.7, 73.5], // Southwest corner buffer
    [16.0, 74.5], // Northeast corner buffer
  ],
};
