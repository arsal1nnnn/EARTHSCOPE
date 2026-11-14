import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import StressLayer from "./StressLayer";
import MapLegend from "./MapLegend";
import MapErrorBoundary from "./ErrorBoundary";
import { GOA_MAP_CONFIG, METRIC_CONFIGS, STRESS_CATEGORIES } from "./mapStyles";
import rawFallbackGeoJson from "../data/goa_mock.geojson";
import { Layers, MapPin, Activity, Droplets, CloudRain, Sparkles, X } from "lucide-react";

// Robust normalization for default export across bundler environments
const fallbackGeoJson = rawFallbackGeoJson?.default || rawFallbackGeoJson;

// Enforces map boundary limits
function MapBoundsEnforcer({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && map) {
      map.setMaxBounds(bounds);
    }
  }, [map, bounds]);
  return null;
}

const BASE_MAPS = {
  dark: {
    name: "Dark Matter (NASA)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> & NASA Earth Science',
  },
  satellite: {
    name: "Satellite Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> & Earthstar Geographics',
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

/**
 * GoaMap Component
 * Interactive 2D Leaflet geospatial map focused on Goa's 12 talukas.
 */
export default function GoaMap({
  selectedRegionId: externalSelectedRegionId = null,
  onSelectTaluka: externalOnSelect = null,
  geojsonData: externalGeoJson = null,
  className = "",
  height = "650px",
}) {
  const [clientMounted, setClientMounted] = useState(false);
  const [data, setData] = useState(externalGeoJson || fallbackGeoJson);
  const [selectedRegionId, setSelectedRegionId] = useState(externalSelectedRegionId);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeMetric, setActiveMetric] = useState("asi_score");
  const [baseMap, setBaseMap] = useState("dark");

  // Client-side DOM mount guard (prevents Leaflet container duplication in React 19 StrictMode)
  useEffect(() => {
    setClientMounted(true);
  }, []);

  // Sync external GeoJSON if passed
  useEffect(() => {
    if (externalGeoJson) {
      setData(externalGeoJson);
    }
  }, [externalGeoJson]);

  // Sync selection
  useEffect(() => {
    if (externalSelectedRegionId !== undefined) {
      setSelectedRegionId(externalSelectedRegionId);
      if (data?.features) {
        const found = data.features.find(
          (f) => f.properties?.region_id === externalSelectedRegionId
        );
        setSelectedFeature(found || null);
      }
    }
  }, [externalSelectedRegionId, data]);

  // Attempt to fetch from backend /api/map/stress with graceful silent fallback
  useEffect(() => {
    if (externalGeoJson) return;

    let isMounted = true;
    const fetchLiveData = async () => {
      try {
        const res = await fetch("/api/map/stress");
        if (!res.ok) return;
        const liveGeoJson = await res.json();
        if (isMounted && liveGeoJson?.features?.length) {
          setData(liveGeoJson);
        }
      } catch (err) {
        // Fallback silently to mock GeoJSON on backend absence
        if (isMounted && !data) {
          setData(fallbackGeoJson);
        }
      }
    };

    fetchLiveData();
    return () => {
      isMounted = false;
    };
  }, [externalGeoJson]);

  const handleSelectTaluka = (feature) => {
    const regionId = feature?.properties?.region_id || null;
    setSelectedRegionId(regionId);
    setSelectedFeature(feature || null);
    if (externalOnSelect) {
      externalOnSelect(feature);
    }
  };

  const handleClearSelection = () => {
    setSelectedRegionId(null);
    setSelectedFeature(null);
    if (externalOnSelect) {
      externalOnSelect(null);
    }
  };

  const selectedProps = selectedFeature?.properties;
  const stressCat = selectedProps ? STRESS_CATEGORIES[selectedProps.stress_category] || STRESS_CATEGORIES.Normal : null;

  return (
    <MapErrorBoundary height={height}>
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl ${className}`}
        style={{
          height,
          minHeight: "500px",
          position: "relative",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #1e293b",
          backgroundColor: "#090d16",
        }}
      >
        {/* Top Header Controls Bar */}
        <div
          className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none"
          style={{ position: "absolute", top: 16, left: 16, right: 16, zIndex: 1000, display: "flex", justifyContent: "space-between", pointerEvents: "none" }}
        >
          {/* Metric Layer Switcher */}
          <div
            className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg pointer-events-auto"
            style={{ display: "flex", gap: "6px", padding: "6px", backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #1e293b", pointerEvents: "auto" }}
          >
            <button
              onClick={() => setActiveMetric("asi_score")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "asi_score" ? "#4f46e5" : "transparent",
                color: activeMetric === "asi_score" ? "#ffffff" : "#94a3b8",
              }}
            >
              <Activity style={{ width: 14, height: 14 }} />
              <span>Stress Index (ASI)</span>
            </button>

            <button
              onClick={() => setActiveMetric("soil_moisture_pct")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "soil_moisture_pct" ? "#0284c7" : "transparent",
                color: activeMetric === "soil_moisture_pct" ? "#ffffff" : "#94a3b8",
              }}
            >
              <Droplets style={{ width: 14, height: 14 }} />
              <span>Soil Moisture</span>
            </button>

            <button
              onClick={() => setActiveMetric("rainfall_anomaly")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "rainfall_anomaly" ? "#d97706" : "transparent",
                color: activeMetric === "rainfall_anomaly" ? "#ffffff" : "#94a3b8",
              }}
            >
              <CloudRain style={{ width: 14, height: 14 }} />
              <span>Precipitation Anomaly</span>
            </button>

            <button
              onClick={() => setActiveMetric("predicted_30d_prob")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "predicted_30d_prob" ? "#e11d48" : "transparent",
                color: activeMetric === "predicted_30d_prob" ? "#ffffff" : "#94a3b8",
              }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>30d Prediction</span>
            </button>
          </div>

          {/* Base Map Switcher */}
          <div
            style={{ display: "flex", gap: "4px", padding: "4px", backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(12px)", borderRadius: "10px", border: "1px solid #1e293b", pointerEvents: "auto" }}
          >
            {Object.entries(BASE_MAPS).map(([key, bm]) => (
              <button
                key={key}
                onClick={() => setBaseMap(key)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: baseMap === key ? "1px solid #334155" : "none",
                  backgroundColor: baseMap === key ? "#1e293b" : "transparent",
                  color: baseMap === key ? "#ffffff" : "#94a3b8",
                }}
              >
                {bm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Leaflet Map (Mounted only on client) */}
        {clientMounted ? (
          <MapContainer
            key="goa-leaflet-map"
            center={GOA_MAP_CONFIG.center}
            zoom={GOA_MAP_CONFIG.zoom}
            minZoom={GOA_MAP_CONFIG.minZoom}
            maxZoom={GOA_MAP_CONFIG.maxZoom}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ height: "100%", width: "100%", background: "#0b0f19" }}
          >
            <MapBoundsEnforcer bounds={GOA_MAP_CONFIG.maxBounds} />

            <TileLayer
              url={BASE_MAPS[baseMap].url}
              attribution={BASE_MAPS[baseMap].attribution}
            />

            {data?.features?.length > 0 && (
              <StressLayer
                data={data}
                activeMetric={activeMetric}
                selectedRegionId={selectedRegionId}
                onSelectTaluka={handleSelectTaluka}
              />
            )}
          </MapContainer>
        ) : (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0b0f19",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Initializing Goa Geospatial Map...
          </div>
        )}

        {/* Floating Selected Taluka Detail Card */}
        {selectedProps && (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              zIndex: 1000,
              width: "320px",
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
              color: "#ffffff",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#38bdf8", fontWeight: 600 }}>
                  <MapPin style={{ width: 13, height: 13 }} />
                  <span>{selectedProps.district}</span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: "bold", margin: "3px 0 0" }}>
                  {selectedProps.name} Taluka
                </h3>
                <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}>
                  {selectedProps.region_id}
                </span>
              </div>
              <button
                onClick={handleClearSelection}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                title="Close"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#94a3b8" }}>Water Stress Status:</span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "11px",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: stressCat?.fillColor || "#38bdf8",
                    border: `1px solid ${stressCat?.fillColor || "#38bdf8"}40`,
                  }}
                >
                  {selectedProps.stress_category}
                </span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "#94a3b8" }}>Agricultural Stress Index</span>
                  <strong style={{ fontFamily: "monospace" }}>{selectedProps.asi_score} / 100</strong>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#1e293b", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${selectedProps.asi_score}%`,
                      backgroundColor: stressCat?.fillColor || "#4f46e5",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "8px", borderTop: "1px solid #1e293b" }}>
                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.5)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Soil Moisture</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px" }}>{selectedProps.soil_moisture_pct}%</div>
                </div>
                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.5)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Rainfall Anom.</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px", color: selectedProps.rainfall_anomaly < 0 ? "#f87171" : "#4ade80" }}>
                    {selectedProps.rainfall_anomaly > 0 ? "+" : ""}{selectedProps.rainfall_anomaly}%
                  </div>
                </div>
                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.5)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>30d Risk Prob.</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px", color: "#fb7185" }}>
                    {Math.round(selectedProps.predicted_30d_prob * 100)}%
                  </div>
                </div>
                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.5)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Evidence Cov.</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px", color: "#38bdf8" }}>
                    {Math.round(selectedProps.evidence_coverage * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Map Legend */}
        <MapLegend activeMetric={activeMetric} />

        {/* Leaflet CSS Fixes */}
        <style>{`
          .leaflet-container {
            background-color: #090d16 !important;
            font-family: inherit;
            height: 100% !important;
            width: 100% !important;
          }
          .earthscope-map-tooltip {
            background: rgba(15, 23, 42, 0.95) !important;
            border: 1px solid rgba(51, 65, 85, 0.8) !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(8px) !important;
          }
          .earthscope-map-tooltip::before {
            border-top-color: rgba(15, 23, 42, 0.95) !important;
          }
        `}</style>
      </div>
    </MapErrorBoundary>
  );
}
