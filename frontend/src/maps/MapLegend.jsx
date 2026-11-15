import React, { useState } from "react";
import { STRESS_CATEGORIES, METRIC_CONFIGS, KHARIF_MONTHS } from "./mapStyles";
import { ChevronDown, ChevronUp, Info, Layers, Calendar } from "lucide-react";

/**
 * MapLegend Component
 * Floating legend showing color scales, active metric range, seasonal phase, and NASA spatial resolution disclosures.
 */
export default function MapLegend({
  activeMetric = "asi_score",
  activeMonthId = "all",
  nasaGridMode = "none",
}) {
  const [collapsed, setCollapsed] = useState(false);
  const metric = METRIC_CONFIGS[activeMetric] || METRIC_CONFIGS.asi_score;
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
          {/* Active Metric Info */}
          <div>
            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
              Active Layer
            </div>
            <div style={{ fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>
              {metric.label}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", lineHeight: "1.3" }}>
              {metric.description}
            </div>
          </div>

          {/* Active Seasonal Month Info if selected */}
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
                  {currentMonth.label} Simulation
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{currentMonth.phase}</div>
              </div>
            </div>
          )}

          {/* Color Scale Swatches */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {Object.entries(STRESS_CATEGORIES).map(([catKey, cat]) => (
              <div key={catKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "3px",
                      backgroundColor: cat.fillColor,
                      border: "1px solid rgba(0,0,0,0.4)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "#cbd5e1" }}>{cat.label}</span>
                </div>
                <span style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "11px" }}>
                  {cat.min}–{cat.max} {metric.unit}
                </span>
              </div>
            ))}
          </div>

          {/* NASA Satellite Grid Footprint Disclosure */}
          {nasaGridMode !== "none" && (
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", fontWeight: 700, color: "#e2e8f0", textTransform: "uppercase" }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
                <span>Active Satellite Grids</span>
              </div>

              {(nasaGridMode === "smap" || nasaGridMode === "both") && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px" }}>
                  <span style={{ width: 14, height: 0, borderTop: "2px dashed #06b6d4", display: "inline-block" }} />
                  <span style={{ color: "#67e8f9" }}><strong>SMAP:</strong> 9 km EASE-Grid 2.0</span>
                </div>
              )}

              {(nasaGridMode === "gpm" || nasaGridMode === "both") && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px" }}>
                  <span style={{ width: 14, height: 0, borderTop: "2px dashed #f59e0b", display: "inline-block" }} />
                  <span style={{ color: "#fcd34d" }}><strong>GPM:</strong> 0.10° (~10 km) IMERG</span>
                </div>
              )}

              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px", lineHeight: "1.25" }}>
                Hover any cell to inspect raw satellite footprint resolution, sensor specs & simulated readings.
              </div>
            </div>
          )}

          {/* NASA Spatial Resolution Disclosure */}
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#94a3b8", fontWeight: 600, fontSize: "10px" }}>
              <Info style={{ width: 12, height: 12, color: "#38bdf8", flexShrink: 0 }} />
              <span>NASA Resolution Disclosure</span>
            </div>
            <ul style={{ fontSize: "10px", color: "#64748b", margin: "4px 0 0", paddingLeft: "16px", lineHeight: "1.3" }}>
              <li><strong style={{ color: "#94a3b8" }}>SMAP L4:</strong> ~9 km root soil moisture</li>
              <li><strong style={{ color: "#94a3b8" }}>GPM IMERG:</strong> 0.1° (~10 km) rain anomaly</li>
              <li><strong style={{ color: "#94a3b8" }}>MODIS V061:</strong> 250m–1km vegetation</li>
              <li style={{ fontStyle: "italic" }}>Downscaled to 12 Goa talukas</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
