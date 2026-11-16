import { useState, useEffect } from "react";
import {
  Globe2,
  MapPinned,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  CircleHelp,
  ChevronRight,
  FileText,
} from "lucide-react";
import "./App.css";
import LandingHero from "./components/LandingHero";
import ProjectOverview from "./components/ProjectOverview";
import AgroEcologyShowcase from "./components/AgroEcologyShowcase";
import ThemedFooter from "./components/ThemedFooter";
import DitherIcon from "./components/DitherIcon";
import GoaMap from "./maps/GoaMap";
import AssessmentResults from "./components/AssessmentResults";
import riceSuitabilityMatrix from "./data/rice_suitability_matrix.json";
import API_BASE_URL from './services/apiBase';

const DISTRICTS = ["North Goa", "South Goa"];
const ECOLOGIES = [
  { value: "morod", label: "Morod", description: "Rainfed terraced uplands" },
  { value: "kher", label: "Kher", description: "Rainfed shallow lowlands" },
  { value: "khazan", label: "Khazan", description: "Coastal saline lowlands" },
];

const VARIETIES = [
  { id: "goa_dhan_1", name: "Goa Dhan 1", ecology: "Khazan (coastal saline)" },
  { id: "goa_dhan_2", name: "Goa Dhan 2", ecology: "Khazan (coastal saline)" },
  { id: "goa_dhan_3", name: "Goa Dhan 3", ecology: "Khazan (coastal saline)" },
  { id: "goa_dhan_4", name: "Goa Dhan 4", ecology: "Khazan (coastal saline)" },
  { id: "csr_27",     name: "CSR-27",     ecology: "Khazan (coastal saline)" },
  { id: "csr_36",     name: "CSR-36",     ecology: "Khazan (coastal saline)" },
  { id: "karjat_3",   name: "Karjat-3",   ecology: "Kher (rainfed shallow lowland)" },
  { id: "naveen",     name: "Naveen",     ecology: "Kher (rainfed shallow lowland)" },
  { id: "annada",     name: "Annada",     ecology: "Morod (rainfed upland)" },
];

const GOA_TALUKAS = {
  "North Goa": ["Pernem", "Bardez", "Tiswadi", "Bicholim", "Sattari"],
  "South Goa": ["Ponda", "Mormugao", "Salcete", "Quepem", "Sanguem", "Dharbandora", "Canacona"],
};

function StatCard({ label, value, detail }) {
  return (
    <article className="p-5 rounded-xl bg-[#11141c] border border-white/[0.08] flex flex-col justify-between">
      <div>
        <span className="text-xs text-[#a3a9b8] block">
          {label}
        </span>
        <strong className="text-2xl font-semibold font-montserrat text-[#eef0f5] block mt-1 tabular-nums">
          {value}
        </strong>
      </div>
      <small className="text-xs text-[#7a8296] block mt-3">
        {detail}
      </small>
    </article>
  );
}

function SelectField({ label, value, onChange, options, help }) {
  return (
    <label className="field block">
      <span className="text-xs text-[#a3a9b8] block mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1e28] border border-white/[0.1] rounded-lg px-3 py-2 text-[#eef0f5] text-xs outline-none focus:border-white/30"
      >
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
      {help && <small className="text-[11px] text-[#7a8296] mt-1 block">{help}</small>}
    </label>
  );
}

function AssessmentForm({
  district,
  setDistrict,
  area,
  setArea,
  ecology,
  setEcology,
  varieties,
  setVarieties,
  season,
  setSeason,
  onSubmit,
}) {
  const talukas = GOA_TALUKAS[district] || [];
  const toggleVariety = (id) => {
    setVarieties((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAll = () => {
    setVarieties(VARIETIES.map((v) => v.id));
  };

  const selectEcologyMatch = () => {
    const matched = VARIETIES.filter((v) =>
      v.ecology.toLowerCase().includes(ecology.toLowerCase())
    ).map((v) => v.id);
    setVarieties(matched.length > 0 ? matched : [VARIETIES[0].id]);
  };

  const clearVarieties = () => {
    setVarieties([]);
  };

  return (
    <form className="p-6 rounded-xl bg-[#11141c] border border-white/[0.08]" onSubmit={onSubmit}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] mb-6 gap-2">
        <div>
          <h3 className="text-base font-semibold font-montserrat text-[#eef0f5]">
            Configure rice assessment
          </h3>
          <p className="text-xs text-[#a3a9b8] mt-0.5">
            Select the Goa taluka and agro-ecology context to evaluate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1a1e28] border border-white/[0.08] text-[#a3a9b8]">
            {season === "2026" ? "Kharif 2026 (Preliminary)" : "Kharif 2025"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="District"
          value={district}
          onChange={(v) => {
            setDistrict(v);
            setArea(GOA_TALUKAS[v][0]);
          }}
          options={DISTRICTS}
        />
        <SelectField
          label="Taluka"
          value={area}
          onChange={setArea}
          options={talukas}
          help="Goa administrative boundary"
        />
        <SelectField
          label="Agricultural ecology"
          value={ecology}
          onChange={setEcology}
          options={ECOLOGIES.map((e) => ({
            value: e.value,
            label: `${e.label} — ${e.description}`,
          }))}
        />
        <div className="field">
          <span className="text-xs text-[#a3a9b8] block mb-1.5">Crop season</span>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full bg-[#1a1e28] border border-white/[0.1] rounded-lg px-3 py-2 text-[#eef0f5] text-xs outline-none focus:border-white/30"
          >
            <option value="2025">Kharif 2025 (June–Sept 2025)</option>
            <option value="2026">Kharif 2026 (Preliminary near-real-time)</option>
          </select>
          <small className="text-[11px] text-[#7a8296] mt-1 block">
            {season === "2026"
              ? "Preliminary: GPM daily + GLDAS June–July only"
              : "Final Run: 20-year baseline anomaly & GLDAS soil moisture"}
          </small>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#a3a9b8]">
            Documented rice varieties ({varieties.length} selected)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-mono text-[#004FF4] hover:underline cursor-pointer"
            >
              Select all 9
            </button>
            <span className="text-[#7a8296] text-[10px]">•</span>
            <button
              type="button"
              onClick={selectEcologyMatch}
              className="text-[11px] font-mono text-[#a3a9b8] hover:text-[#eef0f5] cursor-pointer"
            >
              Match {ecology}
            </button>
            <span className="text-[#7a8296] text-[10px]">•</span>
            <button
              type="button"
              onClick={clearVarieties}
              className="text-[11px] font-mono text-[#7a8296] hover:text-[#eef0f5] cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {VARIETIES.map((variety) => (
            <label
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                varieties.includes(variety.id)
                  ? "bg-[#1a1e28] border-white/30 text-[#eef0f5]"
                  : "bg-[#11141c] border-white/[0.08] text-[#a3a9b8] hover:border-white/20"
              }`}
              key={variety.id}
            >
              <input
                type="checkbox"
                checked={varieties.includes(variety.id)}
                onChange={() => toggleVariety(variety.id)}
                className="hidden"
              />
              <CheckCircle2
                size={14}
                className={varieties.includes(variety.id) ? "text-[#004FF4]" : "text-[#7a8296]"}
              />
              <span>
                {variety.name}{" "}
                <small className="text-[#7a8296] text-[10px]">({variety.ecology})</small>
              </span>
            </label>
          ))}
        </div>
        <small className="text-[11px] text-[#7a8296] mt-2 block">
          Documented ICAR-CCARI & KVK Goa varieties screened across local ecologies.
        </small>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-white/[0.06]">
        <button
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#004FF4] hover:bg-[#0042db] text-white font-montserrat font-medium text-xs cursor-pointer transition-colors disabled:opacity-40"
          type="submit"
          disabled={varieties.length === 0}
        >
          <Sprout size={14} />
          <span>Run suitability assessment</span>
          <ChevronRight size={14} />
        </button>
        <span className="text-[11px] font-mono text-[#7a8296]">
          Qualitative screening based on documented tolerances & NASA signals
        </span>
      </div>
    </form>
  );
}

function HistoricalRainfallChart({ records }) {
  // Plot every valid year returned by the 25-year history endpoint.
  const data = [...(Array.isArray(records) ? records : [])]
    .filter((item) =>
      Number.isFinite(Number(item.year)) &&
      Number.isFinite(Number(item.rainfall_anomaly_pct))
    )
    .sort((a, b) => Number(a.year) - Number(b.year));

  if (!data.length) {
    return <p className="text-[11px] text-[#7a8296]">Historical rainfall anomaly data unavailable.</p>;
  }

  // Match the compact right-side panel so labels remain legible without horizontal scrolling.
  const width = 420;
  const height = 330;
  const left = 60;
  const right = 14;
  const top = 24;
  const bottom = 48;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const anomalies = data.map((item) => Number(item.rainfall_anomaly_pct));
  const rawMin = Math.min(0, ...anomalies);
  const rawMax = Math.max(0, ...anomalies);
  const spread = rawMax - rawMin || 1;
  const padding = spread * 0.12;
  const minValue = rawMin < 0 ? rawMin - padding : 0;
  const maxValue = rawMax > 0 ? rawMax + padding : 0;
  const range = maxValue - minValue || 1;
  const yFor = (value) => top + ((maxValue - value) / range) * plotHeight;
  const zeroY = yFor(0);
  const slotWidth = plotWidth / data.length;
  const barWidth = Math.max(4, Math.min(20, slotWidth * 0.72));
  const ticks = Array.from({ length: 5 }, (_, index) => minValue + (range * index) / 4);

  const categoryColor = (category) => {
    const value = String(category || '').toLowerCase();
    if (value.includes('excess')) return '#38a8ff';
    if (value.includes('deficient') || value.includes('deficit') || value.includes('drought')) return '#ef4444';
    if (value.includes('normal')) return '#16c79a';
    return '#94a3b8';
  };

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#1a1e28]/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-sm font-semibold text-[#e3e7ef]">Rainfall anomaly over time</span>
        <span className="text-xs text-[#a3a9b8]">Anomaly (%) · hover bars for raw rainfall</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Kharif rainfall anomaly percentage by year. Hover each bar for exact rainfall in millimetres and IMD category."
        className="block w-full overflow-visible"
      >
        {ticks.map((tick, index) => {
          const y = yFor(tick);
          return (
            <g key={index}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke={Math.abs(tick) < range * 0.001 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.09)'}
                strokeDasharray={Math.abs(tick) < range * 0.001 ? undefined : '3 4'}
                strokeWidth={Math.abs(tick) < range * 0.001 ? 1.4 : 1}
              />
              <text x={left - 7} y={y + 3} textAnchor="end" fill="#b8bfcd" fontSize="13">
                {`${tick > 0 ? '+' : ''}${tick.toFixed(0)}%`}
              </text>
            </g>
          );
        })}
        {data.map((item, index) => {
          const anomaly = Number(item.rainfall_anomaly_pct);
          const x = left + index * slotWidth + (slotWidth - barWidth) / 2;
          const valueY = yFor(anomaly);
          const y = Math.min(zeroY, valueY);
          const barHeight = Math.max(1.5, Math.abs(zeroY - valueY));
          const category = item.rainfall_category_imd || 'Unclassified';
          const rainfall = Number(item.kharif_rainfall_mm);
          const rainfallText = Number.isFinite(rainfall) ? `${rainfall.toFixed(1)} mm` : 'Unavailable';
          const tooltip = `${item.year}\nRainfall anomaly: ${anomaly > 0 ? '+' : ''}${anomaly.toFixed(1)}%\nKharif rainfall: ${rainfallText}\nIMD category: ${category}`;
          const showYear = data.length <= 12 || index % Math.ceil(data.length / 8) === 0 || index === data.length - 1;
          return (
            <g key={`${item.year}-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="2"
                fill={categoryColor(category)}
                opacity="0.9"
                tabIndex="0"
                aria-label={tooltip.replaceAll('\n', ', ')}
              >
                <title>{tooltip}</title>
              </rect>
              {showYear && (
                <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fill="#d0d5df" fontSize="12">
                  {item.year}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 px-1">
        {[
          { label: 'Normal', color: '#16c79a' },
          { label: 'Deficient', color: '#ef4444' },
          { label: 'Excess', color: '#38a8ff' },
        ].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2 text-sm text-[#d0d5df]">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto text-xs text-[#a3a9b8]">{data.length} years available</span>
      </div>
    </div>
  );
}

function WaterRiskPanel({ selectedRegionId, waterRisk, rainfallHistory, loading, error }) {
  if (!selectedRegionId) {
    return (
      <aside className="rounded-xl border border-white/[0.08] bg-[#11141c] p-5 min-h-[260px]">
        <h3 className="text-sm font-semibold font-montserrat text-[#eef0f5] mb-2">Water Risk Intelligence</h3>
        <p className="text-xs leading-relaxed text-[#7a8296]">
          Select a taluka on the map to inspect its rainfall and soil-moisture indicators.
        </p>
        <div className="mt-6 flex items-center justify-center rounded-lg border border-dashed border-white/[0.1] min-h-[150px]">
          <div className="text-center">
            <MapPinned size={25} className="mx-auto mb-2 text-[#7a8296]" />
            <p className="text-xs text-[#7a8296]">Awaiting taluka selection</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-white/[0.08] bg-[#11141c] p-5 min-h-[260px] max-h-[640px] overflow-y-auto">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] font-mono text-[#7a8296]">Selected region</p>
          <h3 className="text-lg font-semibold font-montserrat text-[#eef0f5] mt-1">
            {waterRisk?.region_name || selectedRegionId}
          </h3>
          {waterRisk?.district && (
            <p className="text-xs text-[#7a8296] mt-1">{waterRisk.district} · {waterRisk.season}</p>
          )}
        </div>
        <span className="shrink-0 rounded-md border border-white/[0.08] bg-[#1a1e28] px-2 py-1 text-[10px] font-mono text-[#a3a9b8]">
          NASA DATA
        </span>
      </div>

      {loading && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-[#004FF4]" />
          <p className="text-xs text-[#a3a9b8]">Retrieving water-risk indicators…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3">
          <p className="text-xs font-medium text-red-300">Unable to load water-risk data</p>
          <p className="mt-1 text-xs text-red-200/70">{error}</p>
        </div>
      )}

      {!loading && !error && waterRisk && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#1a1e28] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[#7a8296]">Rainfall anomaly</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#eef0f5]">
                {waterRisk.rainfall_anomaly_pct != null
                  ? `${Number(waterRisk.rainfall_anomaly_pct).toFixed(1)}%`
                  : "N/A"}
              </p>
              <p className="mt-1 text-[11px] capitalize text-[#a3a9b8]">
                {waterRisk.rainfall_signal || waterRisk.rainfall_category_imd || "No signal"}
              </p>
            </div>
            <div className="rounded-lg bg-[#1a1e28] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[#7a8296]">Soil moisture</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#eef0f5]">
                {waterRisk.sm_gldas_percentile != null
                  ? Number(waterRisk.sm_gldas_percentile).toFixed(1)
                  : "N/A"}
              </p>
              <p className="mt-1 text-[11px] capitalize text-[#a3a9b8]">
                {waterRisk.sm_gldas_signal || "No signal"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wide text-[#7a8296]">Indicator agreement</p>
            <p className="mt-1 text-sm text-[#eef0f5]">{waterRisk.indicator_agreement || "Not available"}</p>
            <p className="mt-1 text-[11px] text-[#7a8296]">
              {waterRisk.indicators_with_data ?? "—"} of {waterRisk.indicators_expected ?? "—"} indicators available
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#eef0f5]">Monthly indicators</h4>
              <span className="text-[10px] font-mono text-[#7a8296]">{waterRisk.monthly?.length || 0} MONTHS</span>
            </div>
            {waterRisk.monthly?.length ? (
              <div className="space-y-1">
                {waterRisk.monthly.map((month) => (
                  <div key={month.month} className="flex items-center justify-between gap-3 rounded-md bg-[#1a1e28]/70 px-3 py-2">
                    <span className="text-[11px] uppercase text-[#a3a9b8]">{month.month}</span>
                    <div className="text-right">
                      <span className="text-[11px] text-[#eef0f5]">{month.rainfall_signal || "Rainfall n/a"}</span>
                      <span className="ml-2 text-[10px] text-[#7a8296]">{month.sm_gldas_signal || ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#7a8296]">Monthly breakdown unavailable.</p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#eef0f5]">Historical rainfall</h4>
              <span className="text-[10px] font-mono text-[#7a8296]">KHARIF</span>
            </div>
            <HistoricalRainfallChart records={rainfallHistory} />
          </div>

          <div className="border-t border-white/[0.06] pt-3 space-y-1">
            <p className="text-[10px] text-[#7a8296]">Baseline: {waterRisk.baseline || "Not specified"}</p>
            {waterRisk.rainfall_basis && (
              <p className="text-[10px] text-[#7a8296]">Rainfall basis: {waterRisk.rainfall_basis}</p>
            )}
            {waterRisk.interpretation_limit && (
              <p className="text-[10px] leading-relaxed text-[#7a8296]">{waterRisk.interpretation_limit}</p>
            )}
            {waterRisk.sources?.length > 0 && (
              <p className="text-[10px] leading-relaxed text-[#7a8296]">Sources: {waterRisk.sources.join(" · ")}</p>
            )}
            {waterRisk.is_mock_data && (
              <p className="pt-1 text-[10px] font-medium text-amber-300">Demonstration data — not verified observations.</p>
            )}
          </div>
        </div>
      )}

      {!loading && !error && !waterRisk && (
        <p className="text-xs text-[#7a8296]">No water-risk record was returned for this taluka.</p>
      )}
    </aside>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [season, setSeason] = useState("2025");
  const [district, setDistrict] = useState("North Goa");
  const [area, setArea] = useState(GOA_TALUKAS["North Goa"][0]);
  const [ecology, setEcology] = useState("khazan");
  const [varieties, setVarieties] = useState(["goa_dhan_1", "csr_27", "karjat_3"]);
  const [savedMessage, setSavedMessage] = useState("");
  const [assessmentResults, setAssessmentResults] = useState([]);

  // Water-risk API state for the currently selected taluka on the map.
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [waterRisk, setWaterRisk] = useState(null);
  const [rainfallHistory, setRainfallHistory] = useState([]);
  const [waterRiskLoading, setWaterRiskLoading] = useState(false);
  const [waterRiskError, setWaterRiskError] = useState("");
  const selectedRegionId = selectedTaluka?.properties?.region_id || null;

  const evaluateVarieties = (
    currentArea = area,
    currentDistrict = district,
    currentEcology = ecology,
    currentVarieties = varieties,
    currentSeason = season
  ) => {
    if (!currentVarieties || currentVarieties.length === 0) {
      setAssessmentResults([]);
      return;
    }
    const results = currentVarieties.map((varId) => {
      const varietyObj = VARIETIES.find((v) => v.id === varId);
      const varName = varietyObj?.name || varId;
      const key = `${currentArea}__${currentEcology}__${varName}`.toLowerCase();
      const entry = riceSuitabilityMatrix[key];
      if (entry) {
        return entry;
      }
      return {
        taluka: currentArea,
        district: currentDistrict,
        ecology: currentEcology,
        variety: varName,
        suitability_class: "Information Pending",
        suitability_score: 0.0,
        supporting_factors: [],
        limiting_factors: ["Catalogue record pending scientific verification"],
        seasonal_water_context: "Baseline data being indexed",
        maturity_days: "N/A",
        source_references: "ICAR-CCARI / NASA",
      };
    });
    setAssessmentResults(results);
  };

  // Re-run evaluation whenever area, district, ecology, varieties, or season change
  useEffect(() => {
    evaluateVarieties(area, district, ecology, varieties, season);
  }, [area, district, ecology, varieties, season]);


  // Load water-risk indicators when a map feature is selected.
  useEffect(() => {
    if (!selectedRegionId) {
      setWaterRisk(null);
      setRainfallHistory([]);
      setWaterRiskError("");
      setWaterRiskLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadWaterRisk() {
      setWaterRiskLoading(true);
      setWaterRiskError("");
      setWaterRisk(null);
      setRainfallHistory([]);

      try {
        const regionId = encodeURIComponent(selectedRegionId);
        const response = await fetch(`${API_BASE_URL}/water-risk/${regionId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Water-risk API returned HTTP ${response.status}`);
        }

        const data = await response.json();
        setWaterRisk(data);

        // Historical rainfall is supplementary; current indicators remain visible if it fails.
        try {
          const historyResponse = await fetch(`${API_BASE_URL}/water-risk/${regionId}/history`, {
            signal: controller.signal,
          });
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setRainfallHistory(Array.isArray(historyData.history) ? historyData.history : []);
          }
        } catch (historyError) {
          if (historyError.name === "AbortError") throw historyError;
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setWaterRiskError(error.message || "An unexpected error occurred.");
          setWaterRisk(null);
        }
      } finally {
        if (!controller.signal.aborted) setWaterRiskLoading(false);
      }
    }

    loadWaterRisk();
    return () => controller.abort();
  }, [selectedRegionId]);

  const formProps = {
    district,
    setDistrict,
    area,
    setArea,
    ecology,
    setEcology,
    varieties,
    setVarieties,
    season,
    setSeason,
  };

  function handleAssessmentSubmit(event) {
    if (event) event.preventDefault();
    evaluateVarieties(area, district, ecology, varieties, season);
    const ecologyName = ECOLOGIES.find((item) => item.value === ecology)?.label || ecology;
    setSavedMessage(
      `Assessment evaluated: ${district} · ${area} · ${ecologyName} · ${season === "2026" ? "Kharif 2026 (Preliminary)" : "Kharif 2025"} · ${varieties.length} varieties screened.`
    );
  }

  const applyPreset = (presetDistrict, presetTaluka, presetEcology, presetVarieties) => {
    setDistrict(presetDistrict);
    setArea(presetTaluka);
    setEcology(presetEcology);
    setVarieties(presetVarieties);
    evaluateVarieties(presetTaluka, presetDistrict, presetEcology, presetVarieties, season);
    const ecologyName = ECOLOGIES.find((item) => item.value === presetEcology)?.label || presetEcology;
    setSavedMessage(
      `Loaded preset: ${presetTaluka} (${presetDistrict}) · ${ecologyName} · ${presetVarieties.length} varieties screened.`
    );
  };

  const handleOpenDashboard = () => {
    setActiveTab("map");
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-[#eef0f5] flex flex-col font-sans">
      {/* 1. Hero landing section */}
      <LandingHero onOpenDashboard={handleOpenDashboard} />

      {/* 2. Project overview */}
      <ProjectOverview />

      {/* 3. Agro-ecology showcase */}
      <AgroEcologyShowcase />

      {/* 4. Interactive stress dashboard */}
      <section
        id="stress-dashboard"
        className="w-full py-16 px-6 md:px-16 bg-[#0b0d14] border-t border-white/[0.08]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#004FF4]" />
                <span className="text-xs font-mono text-[#a3a9b8]">
                  Interactive intelligence console
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold font-montserrat text-[#eef0f5] tracking-tight">
                Goa Agricultural Water Stress Explorer
              </h2>
              <p className="text-xs text-[#a3a9b8] mt-1 max-w-2xl leading-relaxed">
                Explore NASA GPM satellite rainfall anomalies, GLDAS-2.1 Noah root-zone soil moisture percentiles, and ICAR-CCARI rice varieties across all 12 Goa talukas.
              </p>
            </div>

            {/* Dashboard Sub-navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#11141c] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTab("map")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "map"
                    ? "bg-[#1a1e28] text-[#eef0f5] border border-white/[0.16]"
                    : "text-[#a3a9b8] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                }`}
              >
                <Globe2 size={13} className="text-[#a3a9b8]" />
                <span>2D geospatial map</span>
              </button>

              <button
                onClick={() => setActiveTab("assessment")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "assessment"
                    ? "bg-[#1a1e28] text-[#eef0f5] border border-white/[0.16]"
                    : "text-[#a3a9b8] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                }`}
              >
                <Sprout size={13} className="text-[#a3a9b8]" />
                <span>Assessment configuration</span>
              </button>

              <button
                onClick={() => setActiveTab("provenance")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "provenance"
                    ? "bg-[#1a1e28] text-[#eef0f5] border border-white/[0.16]"
                    : "text-[#a3a9b8] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                }`}
              >
                <FileText size={13} className="text-[#a3a9b8]" />
                <span>Scientific audit</span>
              </button>
            </div>
          </div>

          {/* Key Metric Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Geospatial coverage"
              value="12 Talukas"
              detail="Complete Goa administrative boundaries with GPM & GLDAS indexing"
            />
            <StatCard
              label="Rice varieties"
              value="9 Documented"
              detail="ICAR-CCARI & KVK Goa verified catalogue across 3 ecologies"
            />
            <StatCard
              label="Agro-ecologies"
              value="3 Land types"
              detail="Indicative: Khazan (saline), Kher (shallow lowlands), Morod (terraced uplands)"
            />
            <StatCard
              label="Water-deficit telemetry"
              value={season === "2026" ? "2026 Preliminary" : "Connected (2025)"}
              detail={
                season === "2026"
                  ? "NASA GPM IMERG Late Run daily & GLDAS-2.1 (June–July only)"
                  : "NASA GPM IMERG Final v07 & GLDAS-2.1 Noah land surface model"
              }
            />
          </div>

          {/* Tab 1: Interactive 2D Leaflet Geospatial Map */}
          {activeTab === "map" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#11141c] p-2">
                  <GoaMap
                    height="640px"
                    season={season}
                    onSeasonChange={setSeason}
                    onSelectTaluka={setSelectedTaluka}
                  />
                </div>
                <WaterRiskPanel
                  selectedRegionId={selectedRegionId}
                  waterRisk={waterRisk}
                  rainfallHistory={rainfallHistory}
                  loading={waterRiskLoading}
                  error={waterRiskError}
                />
              </div>
              <div className="p-3.5 rounded-lg bg-[#11141c] border border-white/[0.08] flex items-start gap-2.5 text-xs text-[#a3a9b8]">
                <CircleHelp size={16} className="text-[#a3a9b8] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#eef0f5] font-medium">Map instructions:</strong> Click any of Goa's 12 talukas to inspect monthly rainfall {season === "2026" ? "signals (below/near/above normal)" : "anomalies"}, root-zone soil moisture {season === "2026" ? "(June–July only)" : "percentiles"}, and suitable rice varieties. Use the season switch on the map to toggle between 2025 and 2026 (preliminary).
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Assessment Setup Form & Live Results */}
          {activeTab === "assessment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AssessmentForm {...formProps} onSubmit={handleAssessmentSubmit} />
                  {savedMessage && (
                    <div className="mt-3 p-3 rounded-lg bg-[#11141c] border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} />
                        <span>{savedMessage}</span>
                      </div>
                      <span className="text-[11px] text-[#7a8296] shrink-0 font-mono">Evaluated</span>
                    </div>
                  )}
                </div>

                <aside className="p-6 rounded-xl bg-[#11141c] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold font-montserrat text-[#eef0f5] mb-3">
                      Decision-support workflow
                    </h4>
                    <div className="space-y-3.5 text-xs text-[#a3a9b8]">
                      <div className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1a1e28] text-[#eef0f5] flex items-center justify-center font-mono text-[10px] shrink-0 border border-white/[0.08]">
                          1
                        </span>
                        <div>
                          <strong className="text-[#eef0f5] block">Select taluka &amp; ecology</strong>
                          <span className="text-[#7a8296]">Match administrative boundary with agricultural terrain.</span>
                        </div>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1a1e28] text-[#eef0f5] flex items-center justify-center font-mono text-[10px] shrink-0 border border-white/[0.08]">
                          2
                        </span>
                        <div>
                          <strong className="text-[#eef0f5] block">Check cultivar tolerances</strong>
                          <span className="text-[#7a8296]">Review ICAR-CCARI recommended saline, submergence, or drought traits.</span>
                        </div>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1a1e28] text-[#eef0f5] flex items-center justify-center font-mono text-[10px] shrink-0 border border-white/[0.08]">
                          3
                        </span>
                        <div>
                          <strong className="text-[#eef0f5] block">Inspect separate NASA signals</strong>
                          <span className="text-[#7a8296]">Evaluate GPM precipitation anomaly and GLDAS soil moisture independently.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
                    <span className="text-[11px] font-mono text-[#7a8296] block">Quick test presets:</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyPreset("North Goa", "Tiswadi", "khazan", ["goa_dhan_1", "csr_27", "karjat_3"])}
                        className="w-full py-2 px-3 rounded-lg bg-[#1a1e28] hover:bg-[#232836] border border-white/[0.08] text-[#eef0f5] text-[11px] font-mono transition-colors text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>🌊 Khazan saline (Goa Dhan vs Karjat)</span>
                        <ChevronRight size={12} className="text-[#7a8296]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("South Goa", "Ponda", "kher", ["karjat_3", "naveen", "annada"])}
                        className="w-full py-2 px-3 rounded-lg bg-[#1a1e28] hover:bg-[#232836] border border-white/[0.08] text-[#eef0f5] text-[11px] font-mono transition-colors text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>🌾 Kher lowlands (Karjat-3 &amp; Naveen)</span>
                        <ChevronRight size={12} className="text-[#7a8296]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("North Goa", "Sattari", "morod", ["annada", "goa_dhan_1"])}
                        className="w-full py-2 px-3 rounded-lg bg-[#1a1e28] hover:bg-[#232836] border border-white/[0.08] text-[#eef0f5] text-[11px] font-mono transition-colors text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>⛰️ Morod uplands (Annada drought-hardy)</span>
                        <ChevronRight size={12} className="text-[#7a8296]" />
                      </button>
                    </div>
                  </div>
                </aside>
              </div>

              {/* Live Assessment Results Card Deck */}
              <AssessmentResults
                results={assessmentResults}
                taluka={area}
                district={district}
                ecology={ecology}
                season={season}
              />
            </div>
          )}

          {/* Tab 3: Scientific Provenance & Audit */}
          {activeTab === "provenance" && (
            <div className="p-6 rounded-xl bg-[#11141c] border border-white/[0.08] space-y-6 text-xs text-[#a3a9b8]">
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                <DitherIcon icon={ShieldCheck} size="md" />
                <div>
                  <h3 className="text-base font-semibold font-montserrat text-[#eef0f5]">
                    Scientific limitations & data grounding policy
                  </h3>
                  <span className="text-xs font-mono text-[#7a8296]">
                    Compliant with NASA Earth Science Division guidelines
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#eef0f5] text-xs font-montserrat">
                    1. Spatial resolution limitations
                  </h4>
                  <p className="leading-relaxed">
                    GPM IMERG pixels are ~11 km × 11 km (0.1° × 0.1°). GLDAS Noah pixels are ~25 km × 25 km (0.25° × 0.25°). Small coastal talukas (such as Mormugao or Tiswadi) intersect few grid cells; values represent area-weighted spatial aggregates.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-[#eef0f5] text-xs font-montserrat">
                    2. Two-indicator decision transparency
                  </h4>
                  <p className="leading-relaxed">
                    EarthScope displays satellite rainfall and model soil moisture as separate, independent indicators. We do not conflate dryness with flood risk: Kharif 2025 had 100th percentile soil moisture and 6–7x normal May precipitation, meaning lowlands faced submergence rather than water scarcity.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#7a8296]">
                Data sources: NASA GES DISC · NASA Earthdata Search · ICAR-CCARI Goa Bulletin No. 52/2021 · Directorate of Agriculture, Goa
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Themed footer */}
      <ThemedFooter onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </div>
  );
}
