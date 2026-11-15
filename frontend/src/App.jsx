import { useState, useMemo } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileText,
  Globe2,
  Layers3,
  Leaf,
  MapPinned,
  Menu,
  ShieldAlert,
  Sprout,
  Waves,
  Satellite,
  Compass,
} from "lucide-react";
import "./App.css";
import LandingHero from "./components/LandingHero";
import ProjectOverview from "./components/ProjectOverview";
import AgroEcologyShowcase from "./components/AgroEcologyShowcase";
import ThemedFooter from "./components/ThemedFooter";
import DitherIcon from "./components/DitherIcon";
import GoaMap from "./maps/GoaMap";

const DISTRICTS = ["North Goa", "South Goa"];
const ECOLOGIES = [
  { value: "morod", label: "Morod", description: "Rainfed terraced uplands" },
  { value: "kher", label: "Kher", description: "Rainfed shallow lowlands" },
  { value: "khazan", label: "Khazan", description: "Coastal saline lowlands" },
];

// Confirmed ICAR-CCARI & KVK Goa documented varieties from rice_variety_catalogue.csv
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

// All 12 Goa administrative talukas
const GOA_TALUKAS = {
  "North Goa": ["Pernem", "Bardez", "Tiswadi", "Bicholim", "Sattari"],
  "South Goa": ["Ponda", "Mormugao", "Salcete", "Quepem", "Sanguem", "Dharbandora", "Canacona"],
};

function StatCard({ icon: Icon, label, value, detail, variant = "blue" }) {
  return (
    <article className="stat-card flex flex-col justify-between">
      <div>
        <div className="mb-3">
          <DitherIcon icon={Icon} variant={variant} size="md" />
        </div>
        <span className="stat-label uppercase tracking-wider text-[10px] text-slate-400 font-mono">
          {label}
        </span>
        <strong className="text-xl font-bold font-montserrat text-white block mt-1">
          {value}
        </strong>
      </div>
      <small className="text-xs text-slate-400 font-sans block mt-3">
        {detail}
      </small>
    </article>
  );
}

function SelectField({ label, value, onChange, options, help }) {
  return (
    <label className="field">
      <span className="field-label text-xs font-mono text-slate-400 block mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0b1520] border border-[#304454] rounded-lg px-3 py-2.5 text-white text-sm"
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
      {help && <small className="field-help text-[11px] text-slate-400 mt-1 block">{help}</small>}
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
  onSubmit,
}) {
  const talukas = GOA_TALUKAS[district] || [];
  const toggleVariety = (id) => {
    setVarieties((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <form className="panel assessment-form" onSubmit={onSubmit}>
      <div className="panel-heading mb-6">
        <div>
          <p className="eyebrow text-blue-400 text-xs font-mono">ASSESSMENT SETUP / 01</p>
          <h2 className="text-xl font-bold font-montserrat text-white mt-1">Configure Rice Assessment</h2>
          <p className="text-xs text-slate-400 mt-1">Select the Goa taluka and agro-ecology context to evaluate.</p>
        </div>
        <span className="step-pill font-mono text-xs px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded">
          KHARIF 2025
        </span>
      </div>

      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="01 / DISTRICT"
          value={district}
          onChange={(v) => {
            setDistrict(v);
            setArea(GOA_TALUKAS[v][0]);
          }}
          options={DISTRICTS}
        />
        <SelectField
          label="02 / TALUKA"
          value={area}
          onChange={setArea}
          options={talukas}
          help="Goa administrative taluka boundary"
        />
        <SelectField
          label="03 / AGRICULTURAL ECOLOGY"
          value={ecology}
          onChange={setEcology}
          options={ECOLOGIES.map((e) => ({
            value: e.value,
            label: `${e.label} — ${e.description}`,
          }))}
        />
        <div className="field">
          <span className="field-label text-xs font-mono text-slate-400 block mb-1.5">04 / CROP SEASON</span>
          <div className="fixed-value flex items-center justify-between bg-[#0b1520] border border-[#304454] rounded-lg px-3 py-2.5 text-white text-sm">
            <span className="flex items-center gap-2">
              <Leaf size={16} className="text-emerald-400" /> Kharif Season
            </span>
            <span className="text-xs font-mono text-slate-400">June–Sept 2025</span>
          </div>
        </div>
      </div>

      <div className="field variety-field mt-6">
        <span className="field-label text-xs font-mono text-slate-400 block mb-2">
          05 / ICAR-CCARI DOCUMENTED RICE VARIETIES
        </span>
        <div className="variety-options flex flex-wrap gap-2">
          {VARIETIES.map((variety) => (
            <label
              className={`variety-option inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                varieties.includes(variety.id)
                  ? "bg-blue-950/60 border-blue-400 text-blue-200"
                  : "bg-[#0b1520] border-[#304454] text-slate-300 hover:border-slate-400"
              }`}
              key={variety.id}
            >
              <input
                type="checkbox"
                checked={varieties.includes(variety.id)}
                onChange={() => toggleVariety(variety.id)}
                className="hidden"
              />
              <span className="fake-check">
                <CheckCircle2
                  size={15}
                  className={varieties.includes(variety.id) ? "text-blue-400" : "text-slate-500"}
                />
              </span>
              <span>
                {variety.name}{" "}
                <small className="text-slate-400 text-[10px]">({variety.ecology})</small>
              </span>
            </label>
          ))}
        </div>
        <small className="field-help text-[11px] text-slate-400 mt-2 block">
          Documented ICAR-CCARI & KVK Goa varieties screened across local ecologies.
        </small>
      </div>

      <button
        className="primary-button hero-cta-btn inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-xl bg-[#004FF4] text-white font-montserrat font-bold text-sm cursor-pointer shadow-lg hover:shadow-blue-500/50"
        type="submit"
        disabled={varieties.length === 0}
      >
        <span>Save Assessment Config</span>
        <ChevronRight size={17} />
      </button>
    </form>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [district, setDistrict] = useState("North Goa");
  const [area, setArea] = useState(GOA_TALUKAS["North Goa"][0]);
  const [ecology, setEcology] = useState("morod");
  const [varieties, setVarieties] = useState(["goa_dhan_1", "csr_27"]);
  const [savedMessage, setSavedMessage] = useState("");

  const formProps = {
    district,
    setDistrict,
    area,
    setArea,
    ecology,
    setEcology,
    varieties,
    setVarieties,
  };

  function handleAssessmentSubmit(event) {
    event.preventDefault();
    const ecologyName = ECOLOGIES.find((item) => item.value === ecology)?.label || ecology;
    const varietyNames = VARIETIES.filter((item) => varieties.includes(item.id))
      .map((item) => item.name)
      .join(", ");
    setSavedMessage(
      `${district} · ${area} · ${ecologyName} · Kharif 2025 · Selected Varieties: ${varietyNames}. Configuration saved.`
    );
  }

  const handleOpenDashboard = () => {
    setActiveTab("map");
  };

  return (
    <div className="min-h-screen bg-[#080f18] text-[#eaf0f5] flex flex-col font-sans">
      {/* 1. HERO / LANDING PAGE (Exact Figma Design Dashboard.png) */}
      <LandingHero onOpenDashboard={handleOpenDashboard} />

      {/* 2. PROJECT OVERVIEW & SCIENCE ARCHITECTURE */}
      <ProjectOverview />

      {/* 3. AGRO-ECOLOGY SHOWCASE (Khazan, Kher, Morod) */}
      <AgroEcologyShowcase />

      {/* 4. INTERACTIVE STRESS DASHBOARD & 12-TALUKA EXPLORER */}
      <section
        id="stress-dashboard"
        className="w-full py-16 px-6 md:px-16 bg-[#080f1a] border-t border-[#1b2b40]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004FF4] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
                  Interactive Intelligence Console
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-montserrat text-white">
                Goa Agricultural Water Stress Explorer
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl font-sans">
                Explore real NASA GPM satellite precipitation anomalies, GLDAS-2.1 Noah root-zone soil moisture percentiles, and ICAR-CCARI rice varieties across all 12 Goa talukas.
              </p>
            </div>

            {/* Dashboard Sub-navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-[#0d1624] p-1.5 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab("map")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "map"
                    ? "bg-[#004FF4] text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Globe2 size={14} />
                <span>2D Geospatial Map</span>
              </button>

              <button
                onClick={() => setActiveTab("assessment")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "assessment"
                    ? "bg-[#004FF4] text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sprout size={14} />
                <span>Assessment Config</span>
              </button>

              <button
                onClick={() => setActiveTab("water")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "water"
                    ? "bg-[#004FF4] text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Waves size={14} />
                <span>Water-Deficit Monitor</span>
              </button>

              <button
                onClick={() => setActiveTab("provenance")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "provenance"
                    ? "bg-[#004FF4] text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText size={14} />
                <span>Scientific Audit</span>
              </button>
            </div>
          </div>

          {/* Key Metric Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              icon={MapPinned}
              label="GEOSPATIAL COVERAGE"
              value="12 Talukas"
              detail="Complete Goa administrative boundaries with GPM & GLDAS indexing"
              variant="blue"
            />
            <StatCard
              icon={Sprout}
              label="RICE VARIETIES"
              value="9 Documented"
              detail="ICAR-CCARI & KVK Goa verified catalogue across 3 ecologies"
              variant="green"
            />
            <StatCard
              icon={ClipboardList}
              label="AGRO-ECOLOGIES"
              value="3 Land Types"
              detail="Khazan (saline), Kher (shallow lowlands), Morod (terraced uplands)"
              variant="purple"
            />
            <StatCard
              icon={Waves}
              label="WATER-DEFICIT DATA"
              value="Connected"
              detail="NASA GPM IMERG Final v07 & GLDAS-2.1 Noah model assimilation"
              variant="cyan"
            />
          </div>

          {/* Tab 1: Interactive 2D Leaflet Geospatial Map */}
          {activeTab === "map" && (
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden border border-[#223552] bg-[#0c1626] shadow-2xl p-2">
                <GoaMap height="640px" />
              </div>
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-start gap-3 text-xs text-slate-300 font-sans">
                <CircleHelp size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Map Instructions:</strong> Click any of Goa's 12 talukas to inspect detailed monthly rainfall anomalies, root-zone soil moisture percentiles, and suitable rice varieties. Use the slider to scrub through Kharif 2025 months (June through September).
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Assessment Setup Form */}
          {activeTab === "assessment" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AssessmentForm {...formProps} onSubmit={handleAssessmentSubmit} />
                {savedMessage && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{savedMessage}</span>
                  </div>
                )}
              </div>

              <aside className="panel bg-[#0e1726] border border-[#223552] rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <p className="eyebrow text-xs font-mono text-blue-400 mb-2">DECISION SUPPORT WORKFLOW</p>
                  <h3 className="text-lg font-bold font-montserrat text-white mb-4">How Assessment Works</h3>
                  <div className="space-y-4 text-xs text-slate-300">
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-mono shrink-0">
                        01
                      </span>
                      <div>
                        <strong className="text-white block">Select Taluka & Ecology</strong>
                        <span className="text-slate-400">Match administrative boundary with agricultural terrain.</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-mono shrink-0">
                        02
                      </span>
                      <div>
                        <strong className="text-white block">Check Cultivar Tolerances</strong>
                        <span className="text-slate-400">Evaluate ICAR-CCARI recommended saline, submergence, or drought traits.</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-mono shrink-0">
                        03
                      </span>
                      <div>
                        <strong className="text-white block">Inspect Separate NASA Signals</strong>
                        <span className="text-slate-400">Evaluate GPM precipitation anomaly and GLDAS soil moisture independently.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setActiveTab("map")}
                    className="w-full py-2.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    View Taluka Map ➔
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Tab 3: Water-Deficit Monitor */}
          {activeTab === "water" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-[#0e1726] border border-[#223552]">
                  <div className="flex items-center gap-3 mb-4">
                    <DitherIcon icon={Satellite} variant="blue" size="md" />
                    <div>
                      <h4 className="text-base font-bold font-montserrat text-white">
                        NASA GPM IMERG Final v07
                      </h4>
                      <span className="text-xs font-mono text-blue-400">Satellite Precipitation</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Evaluates monthly precipitation totals against the 20-year baseline (2000–2020) for Goa. Identifies when rainfall drops more than 20% below normal during critical transplantation and panicle initiation windows.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[#0e1726] border border-[#223552]">
                  <div className="flex items-center gap-3 mb-4">
                    <DitherIcon icon={Droplets} variant="cyan" size="md" />
                    <div>
                      <h4 className="text-base font-bold font-montserrat text-white">
                        GLDAS-2.1 Noah Land Surface Model
                      </h4>
                      <span className="text-xs font-mono text-cyan-400">Root-Zone Moisture (0–100 cm)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Tracks simulated moisture stored in the crop root zone (0–100 cm). Distinguishes surface water runoff from genuine plant-available water, providing a reliable ground truth for terraced Morod soils.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#223552] bg-[#0c1626] p-2">
                <GoaMap height="560px" />
              </div>
            </div>
          )}

          {/* Tab 4: Scientific Provenance & Audit */}
          {activeTab === "provenance" && (
            <div className="p-8 rounded-2xl bg-[#0e1726] border border-[#223552] space-y-6 text-sm text-slate-300 font-sans">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <DitherIcon icon={ShieldAlert} variant="amber" size="md" />
                <div>
                  <h3 className="text-lg font-bold font-montserrat text-white">
                    Scientific Limitations & Data Grounding Policy
                  </h3>
                  <span className="text-xs font-mono text-amber-400">
                    Compliant with NASA Earth Science Division guidelines
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase font-mono text-xs text-blue-400">
                    1. Spatial Resolution Limitations
                  </h4>
                  <p className="leading-relaxed">
                    GPM IMERG pixels are ~11 km × 11 km (0.1° × 0.1°). GLDAS Noah pixels are ~25 km × 25 km (0.25° × 0.25°). Small coastal talukas (such as Mormugao or Tiswadi) intersect few grid cells; values represent area-weighted spatial aggregates.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase font-mono text-xs text-blue-400">
                    2. Two-Indicator Decision Transparency
                  </h4>
                  <p className="leading-relaxed">
                    EarthScope displays satellite rainfall and model soil moisture as separate, independent indicators. We do not conflate dryness with flood risk: Kharif 2025 had 100th percentile soil moisture and 6–7x normal May precipitation, meaning lowlands faced submergence rather than water scarcity.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
                Data sources: NASA GES DISC · NASA Earthdata Search · ICAR-CCARI Goa Bulletin No. 52/2021 · Directorate of Agriculture, Goa
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. THEMED FOOTER (Exact Figma Colorway & Dither Aesthetics) */}
      <ThemedFooter />
    </div>
  );
}
