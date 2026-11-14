import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StressLayer from "./StressLayer";
import MapLegend from "./MapLegend";
import MapErrorBoundary from "./ErrorBoundary";
import {
  GOA_MAP_CONFIG,
  METRIC_CONFIGS,
  STRESS_CATEGORIES,
  TALUKA_METADATA,
  KHARIF_MONTHS,
  getSeasonalProps,
} from "./mapStyles";
import rawFallbackGeoJson from "../data/goa_mock.geojson";
import {
  Layers,
  MapPin,
  Activity,
  Droplets,
  CloudRain,
  Sparkles,
  X,
  Compass,
  Search,
  Scale,
  Calendar,
  Tag,
  Satellite,
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const fallbackGeoJson = rawFallbackGeoJson?.default || rawFallbackGeoJson;

// Helper to create clean text badge DivIcons
function createTalukaLabelIcon(name, isSelected = false, isCompared = false) {
  const bg = isSelected
    ? "rgba(59, 130, 246, 0.95)"
    : isCompared
    ? "rgba(245, 158, 11, 0.95)"
    : "rgba(15, 23, 42, 0.85)";
  const border = isSelected
    ? "#93c5fd"
    : isCompared
    ? "#fde68a"
    : "rgba(255, 255, 255, 0.2)";

  return L.divIcon({
    className: "custom-taluka-label",
    html: `
      <div style="
        background: ${bg};
        border: 1px solid ${border};
        border-radius: 6px;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.3px;
        padding: 2px 7px;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        transform: translate(-50%, -50%);
        display: inline-block;
      ">
        ${name}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Controller for programmatic camera movement & bounds
function MapCameraController({ targetCenter, targetZoom, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (map && targetCenter) {
      map.flyTo(targetCenter, targetZoom || 11, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [map, targetCenter, targetZoom]);

  useEffect(() => {
    if (map && resetTrigger > 0) {
      map.flyTo(GOA_MAP_CONFIG.center, GOA_MAP_CONFIG.zoom, {
        duration: 1.2,
      });
    }
  }, [map, resetTrigger]);

  useEffect(() => {
    if (map) {
      map.setMaxBounds(GOA_MAP_CONFIG.maxBounds);
    }
  }, [map]);

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
  const [showLabels, setShowLabels] = useState(true);
  const [activeMonth, setActiveMonth] = useState("all");

  // Comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareRegionId, setCompareRegionId] = useState(null);
  const [compareFeature, setCompareFeature] = useState(null);

  // Camera animation triggers
  const [cameraCenter, setCameraCenter] = useState(null);
  const [cameraZoom, setCameraZoom] = useState(11);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  useEffect(() => {
    if (externalGeoJson) {
      setData(externalGeoJson);
    }
  }, [externalGeoJson]);

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

  // Attempt backend fetch with graceful fallback
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

    if (comparisonMode && selectedRegionId && regionId !== selectedRegionId) {
      setCompareRegionId(regionId);
      setCompareFeature(feature);
      return;
    }

    setSelectedRegionId(regionId);
    setSelectedFeature(feature || null);

    if (regionId && TALUKA_METADATA[regionId]) {
      setCameraCenter(TALUKA_METADATA[regionId].center);
      setCameraZoom(11);
    }

    if (externalOnSelect) {
      externalOnSelect(feature);
    }
  };

  const handleClearSelection = () => {
    setSelectedRegionId(null);
    setSelectedFeature(null);
    setComparisonMode(false);
    setCompareRegionId(null);
    setCompareFeature(null);
    if (externalOnSelect) {
      externalOnSelect(null);
    }
  };

  const handleResetCamera = () => {
    setCameraCenter(null);
    setResetTrigger((prev) => prev + 1);
  };

  const handleSearchSelect = (regionId) => {
    if (!regionId) {
      handleClearSelection();
      handleResetCamera();
      return;
    }
    const found = data?.features?.find((f) => f.properties?.region_id === regionId);
    if (found) {
      handleSelectTaluka(found);
    }
  };

  // Selected feature metrics (with active month simulation)
  const selectedRawProps = selectedFeature?.properties;
  const selectedProps = selectedRawProps ? getSeasonalProps(selectedRawProps, activeMonth) : null;
  const selectedMeta = selectedProps ? TALUKA_METADATA[selectedProps.region_id] || {} : {};
  const selectedStressCat = selectedProps
    ? STRESS_CATEGORIES[selectedProps.stress_category] || STRESS_CATEGORIES.Normal
    : null;

  // Comparison feature metrics
  const compareRawProps = compareFeature?.properties;
  const compareProps = compareRawProps ? getSeasonalProps(compareRawProps, activeMonth) : null;
  const compareMeta = compareProps ? TALUKA_METADATA[compareProps.region_id] || {} : {};
  const compareStressCat = compareProps
    ? STRESS_CATEGORIES[compareProps.stress_category] || STRESS_CATEGORIES.Normal
    : null;

  return (
    <MapErrorBoundary height={height}>
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl ${className}`}
        style={{
          height,
          minHeight: "550px",
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
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            zIndex: 1000,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            pointerEvents: "none",
          }}
        >
          {/* Left Group: Metric Layer Switcher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px",
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              backdropFilter: "blur(14px)",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              pointerEvents: "auto",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
            }}
          >
            <button
              onClick={() => setActiveMetric("asi_score")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "asi_score" ? "#4f46e5" : "transparent",
                color: activeMetric === "asi_score" ? "#ffffff" : "#94a3b8",
                transition: "all 0.2s",
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
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "soil_moisture_pct" ? "#0284c7" : "transparent",
                color: activeMetric === "soil_moisture_pct" ? "#ffffff" : "#94a3b8",
                transition: "all 0.2s",
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
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "rainfall_anomaly" ? "#d97706" : "transparent",
                color: activeMetric === "rainfall_anomaly" ? "#ffffff" : "#94a3b8",
                transition: "all 0.2s",
              }}
            >
              <CloudRain style={{ width: 14, height: 14 }} />
              <span>Precipitation</span>
            </button>

            <button
              onClick={() => setActiveMetric("predicted_30d_prob")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                backgroundColor: activeMetric === "predicted_30d_prob" ? "#e11d48" : "transparent",
                color: activeMetric === "predicted_30d_prob" ? "#ffffff" : "#94a3b8",
                transition: "all 0.2s",
              }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>30d Prediction</span>
            </button>
          </div>

          {/* Right Group: Search, Labels, BaseMap & Camera Reset */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "auto",
            }}
          >
            {/* Quick Taluka Jump Dropdown */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                backdropFilter: "blur(14px)",
                border: "1px solid #1e293b",
                borderRadius: "10px",
                padding: "4px 8px",
              }}
            >
              <Search style={{ width: 13, height: 13, color: "#64748b" }} />
              <select
                value={selectedRegionId || ""}
                onChange={(e) => handleSearchSelect(e.target.value)}
                style={{
                  background: "transparent",
                  color: "#e2e8f0",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: 500,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="" style={{ background: "#0f172a", color: "#94a3b8" }}>
                  Jump to Taluka...
                </option>
                <optgroup label="North Goa" style={{ background: "#0f172a" }}>
                  {Object.entries(TALUKA_METADATA)
                    .filter(([_, t]) => t.district === "North Goa")
                    .map(([rid, t]) => (
                      <option key={rid} value={rid} style={{ background: "#0f172a" }}>
                        {t.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="South Goa" style={{ background: "#0f172a" }}>
                  {Object.entries(TALUKA_METADATA)
                    .filter(([_, t]) => t.district === "South Goa")
                    .map(([rid, t]) => (
                      <option key={rid} value={rid} style={{ background: "#0f172a" }}>
                        {t.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Labels Toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                backgroundColor: showLabels ? "rgba(99, 102, 241, 0.2)" : "rgba(15, 23, 42, 0.92)",
                border: `1px solid ${showLabels ? "#6366f1" : "#1e293b"}`,
                borderRadius: "10px",
                color: showLabels ? "#a5b4fc" : "#94a3b8",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(14px)",
              }}
              title="Toggle Taluka Map Labels"
            >
              <Tag style={{ width: 12, height: 12 }} />
              <span>Labels</span>
            </button>

            {/* Base Map Switcher */}
            <div
              style={{
                display: "flex",
                gap: "3px",
                padding: "3px",
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                backdropFilter: "blur(14px)",
                borderRadius: "10px",
                border: "1px solid #1e293b",
              }}
            >
              {Object.entries(BASE_MAPS).map(([key, bm]) => (
                <button
                  key={key}
                  onClick={() => setBaseMap(key)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 500,
                    cursor: "pointer",
                    border: baseMap === key ? "1px solid #334155" : "none",
                    backgroundColor: baseMap === key ? "#1e293b" : "transparent",
                    color: baseMap === key ? "#ffffff" : "#94a3b8",
                  }}
                >
                  {bm.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Reset View Button */}
            <button
              onClick={handleResetCamera}
              style={{
                padding: "6px 9px",
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                border: "1px solid #1e293b",
                borderRadius: "10px",
                color: "#94a3b8",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(14px)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Reset Camera to All of Goa"
            >
              <Compass style={{ width: 13, height: 13 }} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Kharif Monsoon Timeline Scrubber */}
        <div
          style={{
            position: "absolute",
            top: 68,
            left: 14,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(14px)",
            borderRadius: "10px",
            border: "1px solid #1e293b",
            padding: "3px 6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", paddingRight: "6px", borderRight: "1px solid #1e293b", fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
            <Calendar style={{ width: 12, height: 12, color: "#818cf8" }} />
            <span>Kharif Cycle</span>
          </div>
          {KHARIF_MONTHS.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMonth(m.id)}
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                border: activeMonth === m.id ? "1px solid #4f46e5" : "1px solid transparent",
                backgroundColor: activeMonth === m.id ? "#312e81" : "transparent",
                color: activeMonth === m.id ? "#c7d2fe" : "#94a3b8",
                transition: "all 0.15s",
              }}
              title={m.phase}
            >
              {m.label.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Main Leaflet Map Container */}
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
            <MapCameraController
              targetCenter={cameraCenter}
              targetZoom={cameraZoom}
              resetTrigger={resetTrigger}
            />

            <TileLayer
              url={BASE_MAPS[baseMap].url}
              attribution={BASE_MAPS[baseMap].attribution}
            />

            {data?.features?.length > 0 && (
              <StressLayer
                data={data}
                activeMetric={activeMetric}
                selectedRegionId={selectedRegionId}
                compareRegionId={compareRegionId}
                activeMonthId={activeMonth}
                onSelectTaluka={handleSelectTaluka}
              />
            )}

            {/* Permanent/Toggleable Taluka Labels */}
            {showLabels &&
              Object.entries(TALUKA_METADATA).map(([rid, meta]) => {
                const isSelected = rid === selectedRegionId;
                const isCompared = rid === compareRegionId;
                return (
                  <Marker
                    key={`label-${rid}`}
                    position={meta.center}
                    icon={createTalukaLabelIcon(meta.name, isSelected, isCompared)}
                    interactive={false}
                  />
                );
              })}
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

        {/* Primary Selected Taluka Detail Card */}
        {selectedProps && !compareProps && (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              zIndex: 1000,
              width: "340px",
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.75)",
              color: "#ffffff",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700 }}>
                    {selectedProps.district}
                  </span>
                  <span style={{ color: "#475569" }}>•</span>
                  <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}>
                    {selectedProps.region_id}
                  </span>
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: "2px 0 4px", color: "#ffffff" }}>
                  {selectedProps.name} Taluka
                </h3>
                {/* Ecology Badges */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {(selectedMeta.ecologies || []).map((eco) => (
                    <span
                      key={eco}
                      style={{
                        background: "rgba(56, 189, 248, 0.12)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.25)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontSize: "9px",
                        fontWeight: 600,
                      }}
                    >
                      {eco} Ecology
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleClearSelection}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                title="Close"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              {/* Stress Level Status Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#94a3b8" }}>Agricultural Water Stress:</span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "11px",
                    backgroundColor: `${selectedStressCat?.fillColor || "#38bdf8"}20`,
                    color: selectedStressCat?.fillColor || "#38bdf8",
                    border: `1px solid ${selectedStressCat?.fillColor || "#38bdf8"}50`,
                  }}
                >
                  {selectedProps.stress_category}
                </span>
              </div>

              {/* Composite ASI Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "#94a3b8" }}>Composite Stress Index</span>
                  <strong style={{ fontFamily: "monospace", color: "#ffffff" }}>
                    {selectedProps.asi_score} / 100
                  </strong>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#1e293b", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${selectedProps.asi_score}%`,
                      backgroundColor: selectedStressCat?.fillColor || "#4f46e5",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              {/* NASA Sensor Breakdown Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "8px", borderTop: "1px solid #1e293b" }}>
                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.55)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    SMAP L4 Moisture
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px", color: "#e2e8f0" }}>
                    {selectedProps.soil_moisture_pct}% <small style={{ fontSize: "9px", color: "#64748b" }}>vol</small>
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.55)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    GPM IMERG Rain
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      marginTop: "2px",
                      color: selectedProps.rainfall_anomaly < 0 ? "#f87171" : "#4ade80",
                    }}
                  >
                    {selectedProps.rainfall_anomaly > 0 ? "+" : ""}
                    {selectedProps.rainfall_anomaly}%
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.55)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    30d Stress Risk
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px", color: "#fb7185" }}>
                    {Math.round(selectedProps.predicted_30d_prob * 100)}%
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.55)", padding: "8px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Evidence Coverage
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px", color: "#38bdf8" }}>
                    {Math.round(selectedProps.evidence_coverage * 100)}%
                  </div>
                </div>
              </div>

              {/* Scientific Advisory Note */}
              {selectedMeta.advisory && (
                <div style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", border: "1px solid #334155", borderRadius: "8px", padding: "8px", fontSize: "11px", color: "#cbd5e1", lineHeight: 1.35 }}>
                  <strong style={{ color: "#94a3b8" }}>Advisory: </strong>
                  {selectedMeta.advisory}
                </div>
              )}

              {/* Action Toolbar */}
              <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                <button
                  onClick={() => setComparisonMode(true)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "7px 12px",
                    backgroundColor: "rgba(99, 102, 241, 0.2)",
                    border: "1px solid #6366f1",
                    borderRadius: "8px",
                    color: "#c7d2fe",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Scale style={{ width: 13, height: 13 }} />
                  <span>Compare with another Taluka</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Drawer */}
        {selectedProps && compareProps && (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              zIndex: 1000,
              width: "520px",
              maxWidth: "calc(100% - 48px)",
              backgroundColor: "rgba(15, 23, 42, 0.96)",
              backdropFilter: "blur(20px)",
              border: "1px solid #334155",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.85)",
              color: "#ffffff",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Scale style={{ width: 16, height: 16, color: "#fbbf24" }} />
                <h3 style={{ fontSize: "15px", fontWeight: "bold", margin: 0 }}>
                  Taluka Agricultural Water Stress Comparison
                </h3>
              </div>
              <button
                onClick={() => {
                  setComparisonMode(false);
                  setCompareRegionId(null);
                  setCompareFeature(null);
                }}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Split Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px", fontSize: "12px" }}>
              {/* Taluka A */}
              <div style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "10px", padding: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "14px", color: "#60a5fa" }}>{selectedProps.name}</strong>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{selectedProps.district}</span>
                </div>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Stress Index (ASI):</span>
                    <strong style={{ color: selectedStressCat?.fillColor || "#ffffff" }}>{selectedProps.asi_score} / 100</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Status:</span>
                    <span>{selectedProps.stress_category}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Soil Moisture:</span>
                    <span>{selectedProps.soil_moisture_pct}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Rainfall Anom:</span>
                    <span style={{ color: selectedProps.rainfall_anomaly < 0 ? "#f87171" : "#4ade80" }}>
                      {selectedProps.rainfall_anomaly > 0 ? "+" : ""}{selectedProps.rainfall_anomaly}%
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>30d Risk:</span>
                    <span>{Math.round(selectedProps.predicted_30d_prob * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Taluka B */}
              <div style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", padding: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "14px", color: "#fbbf24" }}>{compareProps.name}</strong>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{compareProps.district}</span>
                </div>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Stress Index (ASI):</span>
                    <strong style={{ color: compareStressCat?.fillColor || "#ffffff" }}>{compareProps.asi_score} / 100</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Status:</span>
                    <span>{compareProps.stress_category}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Soil Moisture:</span>
                    <span>{compareProps.soil_moisture_pct}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Rainfall Anom:</span>
                    <span style={{ color: compareProps.rainfall_anomaly < 0 ? "#f87171" : "#4ade80" }}>
                      {compareProps.rainfall_anomaly > 0 ? "+" : ""}{compareProps.rainfall_anomaly}%
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>30d Risk:</span>
                    <span>{Math.round(compareProps.predicted_30d_prob * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Differential Takeaway */}
            <div style={{ marginTop: "12px", backgroundColor: "rgba(15, 23, 42, 0.8)", border: "1px solid #1e293b", borderRadius: "8px", padding: "8px 10px", fontSize: "11px", color: "#cbd5e1" }}>
              <strong>Differential Analysis: </strong>
              {selectedProps.asi_score === compareProps.asi_score ? (
                `Both ${selectedProps.name} and ${compareProps.name} share matching composite stress levels (${selectedProps.asi_score} / 100).`
              ) : selectedProps.asi_score > compareProps.asi_score ? (
                <span>
                  <strong style={{ color: "#60a5fa" }}>{selectedProps.name}</strong> has a higher water stress index (+{selectedProps.asi_score - compareProps.asi_score} points) compared to <strong style={{ color: "#fbbf24" }}>{compareProps.name}</strong>, with soil moisture difference of {selectedProps.soil_moisture_pct - compareProps.soil_moisture_pct}%.
                </span>
              ) : (
                <span>
                  <strong style={{ color: "#fbbf24" }}>{compareProps.name}</strong> has a higher water stress index (+{compareProps.asi_score - selectedProps.asi_score} points) compared to <strong style={{ color: "#60a5fa" }}>{selectedProps.name}</strong>, with soil moisture difference of {compareProps.soil_moisture_pct - selectedProps.soil_moisture_pct}%.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Prompt when in Comparison Mode waiting for Taluka B */}
        {comparisonMode && selectedProps && !compareProps && (
          <div
            style={{
              position: "absolute",
              top: 105,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              backgroundColor: "rgba(245, 158, 11, 0.95)",
              color: "#0f172a",
              fontWeight: 700,
              fontSize: "12px",
              padding: "6px 16px",
              borderRadius: "999px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Click any second taluka on the map to compare with {selectedProps.name}</span>
            <button
              onClick={() => setComparisonMode(false)}
              style={{ background: "transparent", border: "none", color: "#0f172a", cursor: "pointer", fontWeight: 800 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Floating Map Legend */}
        <MapLegend activeMetric={activeMetric} activeMonthId={activeMonth} />

        {/* CSS Fixes for Leaflet */}
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
          .custom-taluka-label {
            background: transparent !important;
            border: none !important;
          }
        `}</style>
      </div>
    </MapErrorBoundary>
  );
}
