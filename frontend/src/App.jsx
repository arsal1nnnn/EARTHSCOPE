import { useMemo, useState } from "react";
import {
  Activity, BarChart3, CheckCircle2, ChevronRight, CircleHelp,
  ClipboardList, FileText, Globe2, Layers3, Leaf, MapPinned, Menu,
  ShieldAlert, Sprout, Waves
} from "lucide-react";
import "./App.css";
import GoaMap from "./maps/GoaMap";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "regions", label: "Region Explorer", icon: MapPinned },
  { id: "suitability", label: "Rice Suitability", icon: Sprout },
  { id: "comparison", label: "Variety Comparison", icon: BarChart3 },
  { id: "water", label: "Water-Deficit Monitor", icon: Waves },
  { id: "reports", label: "Reports", icon: FileText },
];

const DISTRICTS = ["North Goa", "South Goa"];
const ECOLOGIES = [
  { value: "morod", label: "Morod", description: "Rainfed uplands" },
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

function Sidebar({ activePage, onNavigate, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><Globe2 size={21} /></span>
          <span>EARTH<span className="brand-light">SCOPE</span></span>
        </div>
        <p className="nav-heading">WORKSPACE</p>
        <nav className="nav-list" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activePage === id ? "active" : ""}`}
              onClick={() => { onNavigate(id); onClose(); }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {activePage === id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="status-dot" />
          <span>EARTHSCOPE prototype</span>
          <small>Goa · Kharif · Rice</small>
        </div>
      </aside>
    </>
  );
}

function Topbar({ pageTitle, onMenu }) {
  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button>
      <div className="topbar-crumb">GOA AGRICULTURE <span>/</span> {pageTitle.toUpperCase()}</div>
      <div className="system-status"><span className="status-dot" /> PROTOTYPE MODE</div>
    </header>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone = "green" }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function PageIntro({ eyebrow, title, description, action }) {
  return (
    <section className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {action}
    </section>
  );
}

function SelectField({ label, value, onChange, options, help }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return <option key={item.value} value={item.value}>{item.label}</option>;
        })}
      </select>
      {help && <small className="field-help">{help}</small>}
    </label>
  );
}

function AssessmentForm({ district, setDistrict, area, setArea, ecology, setEcology, varieties, setVarieties, onSubmit }) {
  const talukas = GOA_TALUKAS[district] || [];
  const toggleVariety = (id) => {
    setVarieties((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <form className="panel assessment-form" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ASSESSMENT SETUP / 01</p>
          <h2>Configure rice assessment</h2>
          <p>Select the area and crop context you want to examine.</p>
        </div>
        <span className="step-pill">KHARIF</span>
      </div>
      <div className="form-grid">
        <SelectField label="01 / DISTRICT" value={district} onChange={(v) => { setDistrict(v); setArea(GOA_TALUKAS[v][0]); }} options={DISTRICTS} />
        <SelectField label="02 / TALUKA" value={area} onChange={setArea} options={talukas} help="Goa administrative taluka boundary." />
        <SelectField label="03 / AGRICULTURAL ECOLOGY" value={ecology} onChange={setEcology} options={ECOLOGIES.map((e) => ({ value: e.value, label: `${e.label} — ${e.description}` }))} />
        <div className="field">
          <span className="field-label">04 / SEASON</span>
          <div className="fixed-value"><Leaf size={16} /> Kharif <span>June–September 2025</span></div>
        </div>
      </div>
      <div className="field variety-field">
        <span className="field-label">05 / RICE VARIETIES</span>
        <div className="variety-options">
          {VARIETIES.map((variety) => (
            <label className={`variety-option ${varieties.includes(variety.id) ? "selected" : ""}`} key={variety.id}>
              <input type="checkbox" checked={varieties.includes(variety.id)} onChange={() => toggleVariety(variety.id)} />
              <span className="fake-check"><CheckCircle2 size={15} /></span>
              <span>{variety.name} <small style={{ color: "#94a3b8", fontSize: "10px" }}>({variety.ecology})</small></span>
            </label>
          ))}
        </div>
        <small className="field-help">ICAR-CCARI & KVK Goa documented rice varieties screened across local ecologies.</small>
      </div>
      <button className="primary-button" type="submit" disabled={varieties.length === 0}>
        Configure assessment <ChevronRight size={17} />
      </button>
    </form>
  );
}

function Dashboard({ onNavigate, formProps, message, onSubmit }) {
  return (
    <>
      <PageIntro eyebrow="YOUR REGION. YOUR AGRICULTURAL DECISIONS." title={<>Understand Goa's rice-growing <span>landscape.</span></>} description="Explore rice variety suitability and environmental water-deficit evidence to support district-level agricultural planning." />
      <div className="stats-grid">
        <StatCard icon={MapPinned} label="GEOSPATIAL COVERAGE" value="12 Talukas" detail="Goa administrative boundaries" />
        <StatCard icon={Sprout} label="RICE VARIETIES" value="9 Varieties" detail="ICAR-CCARI & KVK documented catalogue" tone="blue" />
        <StatCard icon={ClipboardList} label="AGRO-ECOLOGIES" value="3 Ecologies" detail="Khazan, Kher, Morod" tone="violet" />
        <StatCard icon={Waves} label="WATER-DEFICIT DATA" value="Connected" detail="GPM IMERG Final v07 & GLDAS-2.1" tone="amber" />
      </div>

      {/* Interactive 2D Geospatial Map */}
      <section style={{ margin: "24px 0" }}>
        <div style={{ marginBottom: "12px" }}>
          <p className="eyebrow" style={{ fontSize: "11px", letterSpacing: "1.5px", color: "#818cf8", marginBottom: "4px" }}>
            NASA EARTH OBSERVATION / 2D GEOSPATIAL MAP
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Goa Agricultural Water Stress Explorer
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
            Interactive 12-taluka choropleth synthesized from NASA GPM IMERG & GLDAS-2.1 Earth-observation data.
          </p>
        </div>
        <GoaMap height="600px" />
      </section>

      <div className="dashboard-grid">
        <AssessmentForm {...formProps} onSubmit={onSubmit} />
        <aside className="panel workflow-panel">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>Decision-support workflow</h2>
          <div className="workflow-step"><span>01</span><div><strong>Select an area</strong><small>Choose district and administrative taluka.</small></div></div>
          <div className="workflow-step"><span>02</span><div><strong>Assess rice suitability</strong><small>Compare documented variety needs with local ecologies.</small></div></div>
          <div className="workflow-step"><span>03</span><div><strong>Review water-deficit evidence</strong><small>Inspect rainfall and soil-moisture indicators separately.</small></div></div>
          <button className="text-button" onClick={() => onNavigate("water")}>Explore water-deficit monitor <ChevronRight size={15} /></button>
        </aside>
      </div>
      {message && <div className="notice success-notice"><CheckCircle2 size={18} /><div><strong>Assessment configuration saved</strong><p>{message}</p></div></div>}
      <div className="notice info-notice"><CircleHelp size={18} /><p><strong>NASA Earth Observation Data:</strong> Rainfall metrics from NASA GPM IMERG Final monthly v07 (~11 km) and root-zone soil moisture from GLDAS-2.1 Noah (~25 km model assimilation). Rice suitability derived from ICAR-CCARI and KVK Goa documentation across Khazan, Kher, and Morod land types.</p></div>
    </>
  );
}

function RegionExplorer({ district, setDistrict, area, setArea, ecology, setEcology }) {
  return (
    <>
      <PageIntro eyebrow="GEOGRAPHIC CONTEXT" title="Region Explorer" description="Choose a Goa district and inspect the agricultural ecology assigned to a verified taluka." />
      <div className="panel">
        <div className="form-grid">
          <SelectField label="DISTRICT" value={district} onChange={(v) => { setDistrict(v); setArea(GOA_TALUKAS[v][0]); }} options={DISTRICTS} />
          <SelectField label="TALUKA" value={area} onChange={setArea} options={GOA_TALUKAS[district]} />
          <SelectField label="ECOLOGY" value={ecology} onChange={setEcology} options={ECOLOGIES.map((e) => ({ value: e.value, label: `${e.label} — ${e.description}` }))} />
        </div>
        
        {/* Render Interactive Goa Map here in Region Explorer */}
        <div style={{ marginTop: "20px" }}>
          <GoaMap height="580px" />
        </div>
        
        <p className="muted-note" style={{ marginTop: "14px" }}>
          Interactive Goa administrative boundaries covering all 12 talukas across North Goa and South Goa.
        </p>
      </div>
    </>
  );
}

function RiceSuitability({ formProps, message, onSubmit }) {
  return (
    <>
      <PageIntro eyebrow="CROP–ECOLOGY MATCHING" title="Rice Suitability" description="Configure an ecology-aware assessment using documented rice variety requirements and available area information." />
      <AssessmentForm {...formProps} onSubmit={onSubmit} />
      {message && <div className="notice success-notice"><CheckCircle2 size={18} /><p>{message}</p></div>}
      <div className="notice info-notice"><ShieldAlert size={18} /><p>Suitability categories will be supplied by the scientific engine. The frontend does not calculate or invent suitability scores.</p></div>
    </>
  );
}

function VarietyComparison({ varieties }) {
  return (
    <>
      <PageIntro eyebrow="SIDE-BY-SIDE REVIEW" title="Variety Comparison" description="Compare selected rice varieties after the scientific assessment service is connected." />
      <div className="panel">
        <div className="empty-state"><BarChart3 size={34} /><h2>Comparison data not connected</h2><p>{varieties.length ? `${varieties.length} variety option(s) currently selected.` : "Choose varieties in the Rice Suitability assessment form."} Actual suitability factors and classifications will appear here when returned by the backend.</p></div>
      </div>
    </>
  );
}

function WaterRisk() {
  return (
    <>
      <PageIntro eyebrow="NASA EARTH OBSERVATION EVIDENCE" title="Water-Deficit Monitor" description="Review environmental indicators (rainfall anomaly and model root-zone moisture) that characterize dryness across selected areas." />
      <div className="stats-grid two-stats">
        <StatCard icon={Waves} label="RAINFALL INDICATOR" value="Connected" detail="GPM IMERG Final monthly v07 (~11 km)" tone="blue" />
        <StatCard icon={Layers3} label="ROOT-ZONE SOIL MOISTURE" value="Connected" detail="GLDAS-2.1 Noah (~25 km, model assimilation)" tone="amber" />
      </div>
      <div className="panel">
        <div style={{ marginBottom: "16px" }}>
          <GoaMap height="560px" />
        </div>
      </div>
      <div className="notice info-notice"><CircleHelp size={18} /><p>Water-deficit indicators evaluate dryness only and do not represent an official drought declaration or flood assessment.</p></div>
    </>
  );
}

function Reports() {
  return (
    <>
      <PageIntro eyebrow="PLANNING OUTPUTS" title="Reports" description="Generate a traceable summary of an assessment once live scientific results are available." />
      <div className="panel empty-state"><FileText size={34} /><h2>No reports generated yet</h2><p>Assessment reports will include the selected area, ecology, season, variety results, water-risk evidence, data quality and scientific limitations.</p></div>
    </>
  );
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [district, setDistrict] = useState("North Goa");
  const [area, setArea] = useState(GOA_TALUKAS["North Goa"][0]);
  const [ecology, setEcology] = useState("morod");
  const [varieties, setVarieties] = useState(["goa_dhan_1", "csr_27"]);
  const [message, setMessage] = useState("");

  const pageTitle = useMemo(() => NAV_ITEMS.find((item) => item.id === activePage)?.label || "Dashboard", [activePage]);
  const formProps = { district, setDistrict, area, setArea, ecology, setEcology, varieties, setVarieties };

  function handleAssessmentSubmit(event) {
    event.preventDefault();
    const ecologyName = ECOLOGIES.find((item) => item.value === ecology)?.label || ecology;
    const varietyNames = VARIETIES.filter((item) => varieties.includes(item.id)).map((item) => item.name).join(", ");
    setMessage(`${district} · ${area} · ${ecologyName} · Kharif · ${varietyNames}. This is a saved UI configuration only; no scientific assessment has been run.`);
  }

  const pageContent = {
    dashboard: <Dashboard onNavigate={setActivePage} formProps={formProps} message={message} onSubmit={handleAssessmentSubmit} />,
    regions: <RegionExplorer {...formProps} />,
    suitability: <RiceSuitability formProps={formProps} message={message} onSubmit={handleAssessmentSubmit} />,
    comparison: <VarietyComparison varieties={varieties} />,
    water: <WaterRisk />,
    reports: <Reports />,
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-content">
        <Topbar pageTitle={pageTitle} onMenu={() => setMobileOpen(true)} />
        <div className="content-wrap">
          {pageContent[activePage]}
          <footer className="app-footer">
            <span>EARTHSCOPE · GOA AGRICULTURAL INTELLIGENCE</span>
            <span>NASA DATA · SCIENTIFIC METHODS · TRANSPARENT LIMITATIONS</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
