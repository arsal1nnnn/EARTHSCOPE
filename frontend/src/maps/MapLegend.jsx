import { useState } from "react";
import { METRIC_CONFIGS, KHARIF_MONTHS } from "./mapStyles";
import { ChevronDown, ChevronUp, Layers, Calendar, Info } from "lucide-react";

/**
 * MapLegend Component
 * Floating legend showing color scales for the active real NASA metric,
 * active seasonal month info, and NASA spatial resolution disclosures.
 *
 * Adheres to unslopped UI standards: quiet chrome, calm neutral palette,
 * sentence-case typography, and precise scientific provenance.
 */

const METRIC_SCALE_ENTRIES = {
  water_risk: [
    { color: "#10b981", label: "Low deficit",       range: "No dry signal" },
    { color: "#f59e0b", label: "Moderate deficit",  range: "Single dry signal (rainfall)" },
    { color: "#ef4444", label: "High deficit",      range: "Concurrent dry signals (rain + SM)" },
  ],
  rice_suitability: [
    { color: "#059669", label: "High (Khazan + Kher)", range: "8 documented varieties" },
    { color: "#0284c7", label: "High (Khazan saline)", range: "6 documented varieties" },
    { color: "#0d9488", label: "High (Kher + Morod)",  range: "2–3 documented varieties" },
  ],
  rainfall_anomaly_pct: [
    { color: "#b91c1c", label: "Severe deficit",    range: "≤ −20%" },
    { color: "#f97316", label: "Moderate deficit",  range: "−10% to −20%" },
    { color: "#fbbf24", label: "Slight deficit",    range: "−10% to 0%" },
    { color: "#34d399", label: "Near normal",       range: "0% to +15%" },
    { color: "#06b6d4", label: "Surplus",           range: "> +15%" },
  ],
  sm_gldas_percentile: [
    { color: "#dc2626", label: "Extremely dry",     range: "≤ 10th pctl" },
    { color: "#f97316", label: "Very dry",          range: "11–25th pctl" },
    { color: "#facc15", label: "Moderately dry",    range: "26–40th pctl" },
    { color: "#38bdf8", label: "Moist",             range: "41–70th pctl" },
    { color: "#0284c7", label: "Very wet",          range: "> 70th pctl" },
  ],
  rainfall_percentile: [
    { color: "#b91c1c", label: "Extremely low",     range: "≤ 10th pctl" },
    { color: "#f97316", label: "Below normal",      range: "11–25th pctl" },
    { color: "#fbbf24", label: "Slightly below",    range: "26–40th pctl" },
    { color: "#34d399", label: "Near normal",       range: "41–65th pctl" },
    { color: "#06b6d4", label: "Above normal",      range: "> 65th pctl" },
  ],
};

const MONTHLY_2026_RAINFALL_ENTRIES = [
  { color: "#b91c1c", label: "Below normal (dry)", range: "IMD Deficient" },
  { color: "#34d399", label: "Near normal",        range: "IMD Normal" },
  { color: "#06b6d4", label: "Above normal (wet)", range: "IMD Excess" },
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
  const scaleEntries =
    is2026 && isMonthView && activeMetric === "rainfall_anomaly_pct"
      ? MONTHLY_2026_RAINFALL_ENTRIES
      : METRIC_SCALE_ENTRIES[activeMetric] || METRIC_SCALE_ENTRIES.water_risk;

  const currentMonth = KHARIF_MONTHS.find((m) => m.id === activeMonthId) || KHARIF_MONTHS[0];

  return (
    <div className="absolute bottom-4 right-4 z-[999] w-[260px] max-w-[calc(100%-2rem)] max-h-[calc(100%-7.5rem)] overflow-y-auto bg-[#0b0d14]/95 backdrop-blur-md border border-white/[0.08] rounded-xl p-3.5 shadow-xl text-xs text-[#eef0f5] flex flex-col gap-2.5">
      {/* Legend Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-[#f8fafc]">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Map legend</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-[#8b93a7] hover:text-[#f8fafc] hover:bg-white/[0.06] transition cursor-pointer"
          title={collapsed ? "Expand legend" : "Collapse legend"}
        >
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-2.5">
          {/* Active Season Badge */}
          <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <span className="text-[10px] font-semibold text-[#cbd5e1]">
              {is2026 ? "Kharif 2026 (preliminary)" : "Kharif 2025"}
            </span>
            <span className="text-[9px] font-mono text-[#8b93a7]">
              {is2026 ? "IMERG Late Run" : "IMERG Final v07"}
            </span>
          </div>

          {/* Active Layer Details */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#5a6275] font-semibold">
              Active layer
            </div>
            <div className="font-semibold text-[#f8fafc] mt-0.5">
              {metric.label}
            </div>
            <div className="text-[11px] text-[#8b93a7] mt-0.5 leading-relaxed">
              {is2026 && activeMetric === "sm_gldas_percentile"
                ? "Soil moisture available for June–July only; August–September not yet released. Season value is null; full-season baseline pending research GLDAS release."
                : is2026 && activeMetric === "rainfall_anomaly_pct" && isMonthView
                ? "Monthly rainfall categorized as below normal, near normal, or above normal."
                : metric.description}
            </div>
          </div>

          {/* Active Seasonal Month Info */}
          {activeMonthId !== "all" && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#c7d2fe]">
                  {currentMonth.label}
                </div>
                <div className="text-[10px] text-[#8b93a7] leading-tight">
                  {currentMonth.phase}
                </div>
              </div>
            </div>
          )}

          {/* Color Scale Swatches */}
          <div className="flex flex-col gap-1.5">
            {scaleEntries.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] shrink-0 border border-black/30"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-[#cbd5e1]">{entry.label}</span>
                </div>
                <span className="font-mono tabular-nums text-[#8b93a7] text-[10px]">
                  {entry.range}
                </span>
              </div>
            ))}
          </div>

          {/* NASA Spatial Resolution Disclosure */}
          <div className="border-t border-white/[0.08] pt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#8b93a7]">
              <Info className="w-3 h-3 text-sky-400 shrink-0" />
              <span>NASA data sources</span>
            </div>
            <ul className="text-[10px] text-[#5a6275] mt-1 pl-3.5 list-disc space-y-0.5 leading-normal">
              <li>
                <span className="text-[#8b93a7]">
                  {is2026 ? "GPM IMERG Late Run:" : "GPM IMERG v07:"}
                </span>{" "}
                {is2026 ? "~11 km daily near-real-time aggregation" : "~11 km monthly precipitation"}
              </li>
              <li>
                <span className="text-[#8b93a7]">GLDAS-2.1 Noah:</span>{" "}
                {is2026 ? "Root-zone soil moisture model (June–July only)" : "~25 km root-zone soil moisture model"}
              </li>
              <li className="italic text-[#5a6275]">
                {is2026
                  ? "Both districts show Moderate deficit under single dry signal rule"
                  : "District values inherited by all talukas in that district"}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
