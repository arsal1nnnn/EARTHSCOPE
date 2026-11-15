import { useState } from "react";
import { METRIC_CONFIGS, KHARIF_MONTHS } from "./mapStyles";
import { ChevronDown, ChevronUp, Info, Layers, Calendar, Sparkles } from "lucide-react";

/**
 * MapLegend Component
 * Floating legend showing color scales for the active real NASA metric,
 * active seasonal month info, and NASA spatial resolution disclosures.
 *
 * Supports both Kharif 2025 and Kharif 2026 (Preliminary).
 */

const METRIC_SCALE_ENTRIES = {
  water_risk: [
    { color: "#10b981", label: "Low Deficit",       range: "Zero Dry Signals (Healthy Buffer)" },
    { color: "#f59e0b", label: "Moderate Deficit",  range: "Single Dry Signal (Rain dry / buffer)" },
    { color: "#ef4444", label: "High Deficit",      range: "Concurrent Dry Signals (Rain + SM)" },
  ],
  rice_suitability: [
    { color: "#059669", label: "Highly Suitable (Khazan + Kher)", range: "8 Varieties (Saline + Lowlands)" },
    { color: "#0284c7", label: "Highly Suitable (Khazan)",        range: "6 Varieties (Coastal Saline)" },
    { color: "#0d9488", label: "Highly Suitable (Kher + Morod)",  range: "2–3 Varieties (Lowland + Upland)" },
  ],
  rainfall_anomaly_pct: [
    { color: "#b91c1c", label: "Severe Deficit",   range: "≤ −20%" },
    { color: "#f97316", label: "Moderate Deficit",  range: "−10% to −20%" },
    { color: "#fbbf24", label: "Slight Deficit",    range: "−10% to 0%" },
    { color: "#34d399", label: "Near Normal",        range: "0% to +15%" },
    { color: "#06b6d4", label: "Surplus",            range: "> +15%" },
  ],
  sm_gldas_percentile: [
    { color: "#dc2626", label: "Extremely Dry",     range: "≤ 10th pctl" },
    { color: "#f97316", label: "Very Dry",           range: "11–25th pctl" },
    { color: "#facc15", label: "Moderately Dry",     range: "26–40th pctl" },
    { color: "#38bdf8", label: "Moist",              range: "41–70th pctl" },
    { color: "#0284c7", label: "Very Wet",           range: "> 70th pctl" },
  ],
  rainfall_percentile: [
    { color: "#b91c1c", label: "Extremely Low",     range: "≤ 10th pctl" },
    { color: "#f97316", label: "Below Normal",       range: "11–25th pctl" },
    { color: "#fbbf24", label: "Slightly Below",     range: "26–40th pctl" },
    { color: "#34d399", label: "Near Normal",        range: "41–65th pctl" },
    { color: "#06b6d4", label: "Above Normal",       range: "> 65th pctl" },
  ],
};

const MONTHLY_2026_RAINFALL_ENTRIES = [
  { color: "#b91c1c", label: "Below Normal (Dry)", range: "IMD Deficient" },
  { color: "#34d399", label: "Near Normal",        range: "IMD Normal" },
  { color: "#06b6d4", label: "Above Normal (Wet)", range: "IMD Excess" },
];

export default function MapLegend({
  activeMetric = "water_risk",
  activeMonthId = "all",
  season = "2025",
}) {
  const [collapsed, setCollapsed] = useState(false);
  const is2026 = season === "2026";
  const isMonthView = activeMonthId !== "all";

  const metric = METRIC_CONFIGS[activeMetric] || METRIC_CONFIGS.water_risk;
  const scaleEntries = (is2026 && isMonthView && activeMetric === "rainfall_anomaly_pct")
    ? MONTHLY_2026_RAINFALL_ENTRIES
    : (METRIC_SCALE_ENTRIES[activeMetric] || METRIC_SCALE_ENTRIES.water_risk);

  const currentMonth = KHARIF_MONTHS.find((m) => m.id === activeMonthId) || KHARIF_MONTHS[0];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 999,
        width: "270px",
        maxWidth: "min(270px, calc(100% - 32px))",
        maxHeight: "calc(100% - 135px)",
        overflowY: "auto",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid #1e293b",
        borderRadius: "16px",
        padding: "14px",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
        fontSize: "12px",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Layers style={{ width: 14, height: 14, color: "#818cf8" }} />
          <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "13px" }}>
            Map Legend
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px" }}
          title={collapsed ? "Expand Legend" : "Collapse Legend"}
        >
          {collapsed ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
        </button>
      </div>

      {!collapsed && (
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Active Season Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", backgroundColor: is2026 ? "rgba(245, 158, 11, 0.15)" : "rgba(59, 130, 246, 0.15)", borderRadius: "8px", border: `1px solid ${is2026 ? "rgba(245, 158, 11, 0.3)" : "rgba(59, 130, 246, 0.3)"}` }}>
            <span style={{ fontSize: "10px", color: is2026 ? "#fde68a" : "#93c5fd", fontWeight: 700, textTransform: "uppercase" }}>
              {is2026 ? "Kharif 2026 (Preliminary)" : "Kharif 2025"}
            </span>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#94a3b8" }}>
              {is2026 ? "IMERG Late Run" : "IMERG Final v07"}
            </span>
          </div>

          {/* Active Metric Info */}
          <div>
            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
              Active Layer
            </div>
            <div style={{ fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>
              {metric.label}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", lineHeight: "1.3" }}>
              {is2026 && activeMetric === "sm_gldas_percentile"
                ? "Soil moisture available for June–July only. Full-season baseline pending research GLDAS release."
                : (is2026 && activeMetric === "rainfall_anomaly_pct" && isMonthView
                    ? "Monthly rainfall categorized as Below Normal, Near Normal, or Above Normal."
                    : metric.description)}
            </div>
          </div>

          {/* Active Seasonal Month Info */}
          {activeMonthId !== "all" && (
            <div
              style={{
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "8px",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Calendar style={{ width: 13, height: 13, color: "#818cf8", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#c7d2fe" }}>
                  {currentMonth.label}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{currentMonth.phase}</div>
              </div>
            </div>
          )}

          {/* Color Scale Swatches — real metric ranges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {scaleEntries.map((entry) => (
              <div key={entry.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "3px",
                      backgroundColor: entry.color,
                      border: "1px solid rgba(0,0,0,0.4)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "#cbd5e1" }}>{entry.label}</span>
                </div>
                <span style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "11px" }}>
                  {entry.range}
                </span>
              </div>
            ))}
          </div>

          {/* NASA Spatial Resolution Disclosure */}
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#94a3b8", fontWeight: 600, fontSize: "10px" }}>
              <Info style={{ width: 12, height: 12, color: "#38bdf8", flexShrink: 0 }} />
              <span>NASA Data Sources</span>
            </div>
            <ul style={{ fontSize: "10px", color: "#64748b", margin: "4px 0 0", paddingLeft: "16px", lineHeight: "1.4" }}>
              <li>
                <strong style={{ color: "#94a3b8" }}>
                  {is2026 ? "GPM IMERG Late Run:" : "GPM IMERG v07:"}
                </strong>{" "}
                {is2026 ? "~11 km near-real-time daily aggregation" : "~11 km monthly rainfall"}
              </li>
              <li>
                <strong style={{ color: "#94a3b8" }}>GLDAS-2.1 Noah:</strong>{" "}
                {is2026 ? "Root-zone soil moisture (June–July only)" : "~25 km root-zone soil moisture"}
              </li>
              <li style={{ fontStyle: "italic", color: "#475569" }}>
                {is2026 ? "Both districts show Moderate deficit under single dry signal rule" : "District values inherited by all talukas in that district"}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
