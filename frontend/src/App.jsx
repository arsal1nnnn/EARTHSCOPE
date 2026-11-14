
import { useState } from "react";
import "./App.css";
import GoaMap from "./maps/GoaMap";

function App() {
  const [variable, setVariable] = useState("Surface Temperature");
  const [region, setRegion] = useState("Goa, India");
  const [startYear, setStartYear] = useState("2000");
  const [endYear, setEndYear] = useState("2025");
  const [message, setMessage] = useState("");
  const [selectedTaluka, setSelectedTaluka] = useState(null);

  function handleInvestigation(e) {
    e.preventDefault();

    setMessage(
      `Investigation configured: ${variable} in ${region}, from ${startYear} to ${endYear}. NASA data integration is our next step.`
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🌍</span>
          <span>EARTH<span className="brand-light">DETECTIVE</span></span>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <div className="nav-item active">◈ &nbsp; Overview</div>
        <div className="nav-item">◎ &nbsp; Investigations</div>
        <div className="nav-item">⌖ &nbsp; Explore Earth</div>

        <div className="sidebar-bottom">
          <div className="status-dot"></div>
          <span>Earth intelligence lab</span>
          <small>Prototype v1.0</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>EARTH SCIENCE / INVESTIGATION LAB</span>
          <span className="live-label">● SYSTEM ONLINE</span>
        </header>

        <section className="welcome">
          <p className="eyebrow">YOUR PLANET. YOUR INVESTIGATION.</p>
          <h1>Every change leaves a <span>clue.</span></h1>
          <p className="subtitle">
            Investigate Earth's environmental trends using NASA
            Earth science data. Find the patterns hidden in time.
          </p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>DATA SOURCE</span>
            <strong>NASA</strong>
            <small>Earth observation data</small>
          </div>
          <div className="stat-card">
            <span>INVESTIGATION MODE</span>
            <strong>Time Series</strong>
            <small>Historical trend analysis</small>
          </div>
          <div className="stat-card">
            <span>DATA CONNECTION</span>
            <strong className="pending">Pending</strong>
            <small>Integration coming next</small>
          </div>
        </section>

        <section className="map-section" style={{ margin: "45px 0" }}>
          <div className="section-title">
            <div>
              <p className="eyebrow">GEOSPATIAL INTELLIGENCE / 2D MAP</p>
              <h2>Goa Agricultural Water Stress Explorer</h2>
              <p>
                Interactive 12-taluka choropleth powered by NASA SMAP L4, GPM IMERG & MODIS Earth-observation data.
              </p>
            </div>
            <span className="step-count">12 TALUKAS</span>
          </div>

          <div style={{ marginTop: "20px" }}>
            <GoaMap
              height="650px"
              onSelectTaluka={(feat) => setSelectedTaluka(feat)}
            />
          </div>
        </section>

        <section className="investigation">
          <div className="section-title">
            <div>
              <p className="eyebrow">START HERE / 01</p>
              <h2>Start an investigation</h2>
              <p>Define what you want to discover about Earth.</p>
            </div>
            <span className="step-count">01 — 05</span>
          </div>

          <form onSubmit={handleInvestigation}>
            <div className="form-grid">
              <label>
                <span>01 / DATA VARIABLE</span>
                <select
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                >
                  <option>Surface Temperature</option>
                  <option>Precipitation / Rainfall</option>
                  <option>Soil Moisture</option>
                  <option>Vegetation</option>
                  <option>Ocean Temperature</option>
                </select>
              </label>

              <label>
                <span>02 / GEOGRAPHICAL REGION</span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Enter a location..."
                  required
                />
              </label>

              <label>
                <span>03 / START YEAR</span>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                >
                  {Array.from({ length: 26 }, (_, i) => 2000 + i).map(year => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>04 / END YEAR</span>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                >
                  {Array.from({ length: 26 }, (_, i) => 2000 + i).map(year => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </label>
            </div>

            <button className="investigate-btn" type="submit">
              Configure Investigation <span>→</span>
            </button>
          </form>

          {message && (
            <div className="result-message">
              <strong>Investigation setup saved</strong>
              <p>{message}</p>
            </div>
          )}
        </section>

        <footer>
          AN EXPERIMENT IN UNDERSTANDING OUR PLANET.
          <span>BUILT FOR EARTH SCIENCE EXPLORATION</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
