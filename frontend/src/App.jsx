import { useState } from "react";
import {
  Globe2,
  Layers3,
  Leaf,
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
  onSubmit,
}) {
  const talukas = GOA_TALUKAS[district] || [];
  const toggleVariety = (id) => {
    setVarieties((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <form className="p-6 rounded-xl bg-[#11141c] border border-white/[0.08]" onSubmit={onSubmit}>
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
        <div>
          <h3 className="text-base font-semibold font-montserrat text-[#eef0f5]">
            Configure rice assessment
          </h3>
          <p className="text-xs text-[#a3a9b8] mt-0.5">
            Select the Goa taluka and agro-ecology context to evaluate
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1a1e28] border border-white/[0.08] text-[#a3a9b8]">
          Kharif 2025
        </span>
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
          <div className="flex items-center justify-between bg-[#1a1e28] border border-white/[0.1] rounded-lg px-3 py-2 text-[#eef0f5] text-xs">
            <span className="flex items-center gap-2">
              <Leaf size={14} className="text-emerald-400" />
              <span>Kharif</span>
            </span>
            <span className="text-xs font-mono text-[#7a8296]">June–Sept 2025</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <span className="text-xs text-[#a3a9b8] block mb-2">
          Documented rice varieties
        </span>
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

      <button
        className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-[#004FF4] hover:bg-[#0042db] text-white font-montserrat font-medium text-xs cursor-pointer transition-colors disabled:opacity-40"
        type="submit"
        disabled={varieties.length === 0}
      >
        <span>Save assessment configuration</span>
        <ChevronRight size={14} />
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
      `${district} · ${area} · ${ecologyName} · Kharif 2025 · Varieties: ${varietyNames}. Saved.`
    );
  }

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
              detail="Khazan (saline), Kher (shallow lowlands), Morod (terraced uplands)"
            />
            <StatCard
              label="Water-deficit telemetry"
              value="Connected"
              detail="NASA GPM IMERG Final v07 & GLDAS-2.1 Noah model assimilation"
            />
          </div>

          {/* Tab 1: Interactive 2D Leaflet Geospatial Map */}
          {activeTab === "map" && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#11141c] p-2">
                <GoaMap height="640px" />
              </div>
              <div className="p-3.5 rounded-lg bg-[#11141c] border border-white/[0.08] flex items-start gap-2.5 text-xs text-[#a3a9b8]">
                <CircleHelp size={16} className="text-[#a3a9b8] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#eef0f5] font-medium">Map instructions:</strong> Click any of Goa's 12 talukas to inspect monthly rainfall anomalies, root-zone soil moisture percentiles, and suitable rice varieties. Use the slider to scrub through Kharif 2025 months (June through September).
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Assessment Setup Form */}
          {activeTab === "assessment" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AssessmentForm {...formProps} onSubmit={handleAssessmentSubmit} />
                {savedMessage && (
                  <div className="mt-3 p-3 rounded-lg bg-[#11141c] border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    <span>{savedMessage}</span>
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
                        <strong className="text-[#eef0f5] block">Select taluka & ecology</strong>
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

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => setActiveTab("map")}
                    className="w-full py-2 rounded-lg bg-[#1a1e28] hover:bg-[#232836] border border-white/[0.08] text-[#eef0f5] text-xs font-mono transition-colors cursor-pointer"
                  >
                    View taluka map ➔
                  </button>
                </div>
              </aside>
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
