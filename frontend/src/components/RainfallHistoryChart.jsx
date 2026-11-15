import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from "recharts";
import { CloudRain, Info, X } from "lucide-react";
import rawHistoryData from "../data/rainfall_history.json";

const fallbackHistory = rawHistoryData?.default || rawHistoryData || {};

function getBarColor(category = "") {
  const cat = category.toLowerCase();
  if (cat.includes("excess")) return "#06b6d4";     // Cyan for Excess
  if (cat.includes("deficient")) return "#f43f5e";  // Rose/Red for Deficient
  return "#10b981";                                 // Emerald for Normal
}

function CustomBarTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isDeficient = data.rainfall_anomaly_pct < -19;
  const isExcess = data.rainfall_anomaly_pct > 19;

  return (
    <div className="bg-[#0b0d14]/98 backdrop-blur-md border border-white/[0.12] rounded-xl p-3 shadow-2xl text-xs text-[#eef0f5] min-w-[210px] font-sans">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2">
        <span className="font-bold text-sm text-[#f8fafc]">Kharif {data.year}</span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            isDeficient
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : isExcess
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {data.rainfall_category_imd || "Normal"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 font-mono text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-[#8b93a7]">Rainfall anomaly:</span>
          <strong
            className={`font-semibold ${
              data.rainfall_anomaly_pct < 0 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {data.rainfall_anomaly_pct > 0 ? "+" : ""}
            {data.rainfall_anomaly_pct}%
          </strong>
        </div>

        <div className="flex justify-between items-center border-t border-white/[0.06] pt-1">
          <span className="text-[#8b93a7]">Raw NASA measurement:</span>
          <strong className="text-white">
            {data.kharif_rainfall_mm} <span className="text-[10px] text-[#8b93a7]">mm</span>
          </strong>
        </div>

        {data.baseline_mean_mm && (
          <div className="flex justify-between items-center text-[10px] text-[#5a6275]">
            <span>20-yr baseline mean:</span>
            <span>{data.baseline_mean_mm} mm</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-[9px] text-[#5a6275] border-t border-white/[0.06] pt-1.5 italic">
        NASA GPM IMERG Final Run v07 (~11 km)
      </div>
    </div>
  );
}

/**
 * RainfallHistoryChart
 * 25-Year (2001-2025) Time-Series Bar Chart of Kharif Rainfall Anomaly Percentage.
 * Features 0-baseline reference line, IMD category color coding, and NASA telemetry tooltips.
 */
export default function RainfallHistoryChart({
  regionId = "GOA-N-PERNEM",
  regionName = "Pernem",
  district = "North Goa",
  height = 240,
  onClose = null,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const zone = (district || "").toLowerCase().includes("south")
    ? "south_goa"
    : "north_goa";

  useEffect(() => {
    let isMounted = true;

    async function fetchHistory() {
      try {
        const res = await fetch(`/api/water-risk/${regionId}/history`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.history?.length) {
            setData(json.history);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // Fall back to bundled 25-year telemetry
      }

      if (isMounted) {
        setData(fallbackHistory[zone] || fallbackHistory.north_goa || []);
        setLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [regionId, zone]);

  return (
    <div className="bg-[#0b0d14]/95 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 shadow-xl text-[#eef0f5] flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-sky-400" />
          <div>
            <h4 className="text-xs font-semibold text-[#f8fafc]">
              25-Year Rainfall Anomaly History (2001–2025)
            </h4>
            <span className="text-[10px] text-[#8b93a7]">
              {regionName} ({district}) • NASA GPM IMERG Final Run
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8b93a7] hover:text-[#f8fafc] hover:bg-white/[0.06] transition cursor-pointer"
            title="Close history chart"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Legend & Guide */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8b93a7]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#06b6d4]" />
            <span>Excess (&gt; +19%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#10b981]" />
            <span>Normal (−19% to +19%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f43f5e]" />
            <span>Deficient (≤ −20%)</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#5a6275]">
          <Info className="w-3 h-3 text-[#8b93a7]" />
          <span>0% line = 2001–2020 normal baseline</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#8b93a7]">
            Loading 25-year telemetry history...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{ fill: "#8b93a7", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                interval={1}
              />
              <YAxis
                unit="%"
                tick={{ fill: "#8b93a7", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <ReferenceLine
                y={0}
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: "Baseline 0%",
                  fill: "#64748b",
                  fontSize: 9,
                  position: "insideTopLeft",
                }}
              />
              <Bar dataKey="rainfall_anomaly_pct" radius={[2, 2, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.year}`}
                    fill={getBarColor(entry.rainfall_category_imd)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
