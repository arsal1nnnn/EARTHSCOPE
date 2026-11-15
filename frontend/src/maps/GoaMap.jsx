import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StressLayer from "./StressLayer";
import MapLegend from "./MapLegend";
import MapErrorBoundary from "./ErrorBoundary";
import {
  GOA_BOUNDS,
  GOA_MAP_CONFIG,
  TALUKA_METADATA,
  KHARIF_MONTHS,
  getSeasonalProps,
} from "./mapStyles";
import rawFallbackGeoJson from "../data/goa_taluka_indicators.geojson";
import {
  Droplets,
  CloudRain,
  ShieldAlert,
  Sprout,
  X,
  Compass,
  Search,
  Scale,
  Calendar,
  Tag,
  Info,
} from "lucide-react";

const fallbackGeoJson = rawFallbackGeoJson?.default || rawFallbackGeoJson;

// OpenStreetMap as the single clean base layer
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Metric navigation definitions
const METRIC_TABS = [
  {
    id: "water_risk",
    label: "Water-deficit signal",
    icon: ShieldAlert,
    activeCls: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  },
  {
    id: "rice_suitability",
    label: "Rice suitability",
    icon: Sprout,
    activeCls: "bg-sky-500/15 border-sky-500/30 text-sky-300",
  },
  {
    id: "rainfall_anomaly_pct",
    label: "Precipitation",
    icon: CloudRain,
    activeCls: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  },
  {
    id: "sm_gldas_percentile",
    label: "Soil moisture",
    icon: Droplets,
    activeCls: "bg-teal-500/15 border-teal-500/30 text-teal-300",
  },
];

// Helper to create clean text badge DivIcons
function createTalukaLabelIcon(name, isSelected = false, isCompared = false) {
  const bg = isSelected
    ? "rgba(37, 99, 235, 0.92)"
    : isCompared
    ? "rgba(217, 119, 6, 0.92)"
    : "rgba(11, 13, 20, 0.88)";
  const border = isSelected
    ? "rgba(147, 197, 253, 0.8)"
    : isCompared
    ? "rgba(253, 230, 138, 0.8)"
    : "rgba(255, 255, 255, 0.12)";

  return L.divIcon({
    className: "custom-taluka-label",
    html: `
      <div style="
        background: ${bg};
        border: 1px solid ${border};
        border-radius: 6px;
        color: #f1f5f9;
        font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.2px;
        padding: 2px 7px;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
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

// Controller for programmatic camera movement, auto-centering & bounds
function MapCameraController({ targetCenter, targetZoom, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    const goaLatLngBounds = L.latLngBounds(GOA_BOUNDS[0], GOA_BOUNDS[1]);

    const timer1 = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(goaLatLngBounds, {
        padding: [24, 24],
        maxZoom: 10,
        animate: false,
      });
    }, 60);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(goaLatLngBounds, {
        padding: [24, 24],
        maxZoom: 10,
        animate: false,
      });
    }, 280);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);

  useEffect(() => {
    if (map && targetCenter) {
      map.flyTo(targetCenter, targetZoom || 11, {
        duration: 1.0,
        easeLinearity: 0.25,
      });
    }
  }, [map, targetCenter, targetZoom]);

  useEffect(() => {
    if (map && resetTrigger > 0) {
      const goaLatLngBounds = L.latLngBounds(GOA_BOUNDS[0], GOA_BOUNDS[1]);
      map.fitBounds(goaLatLngBounds, {
        padding: [24, 24],
        maxZoom: 10,
        animate: true,
        duration: 1.0,
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

// Helper component to capture map instance for external zoom buttons
function MapInstanceCapture({ setMap }) {
  const map = useMap();
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);
  return null;
}

/**
 * GoaMap Component
 * Interactive 2D Leaflet geospatial map focused on Goa's 12 talukas.
 * Visualizes verified NASA GPM IMERG and GLDAS-2.1 indicator datasets.
 * Features OpenStreetMap basemap, quiet chrome, and responsive controls.
 */
export default function GoaMap({
  selectedRegionId: externalSelectedRegionId = null,
  onSelectTaluka: externalOnSelect = null,
  geojsonData: externalGeoJson = null,
  season: externalSeason = "2025",
  onSeasonChange: externalOnSeasonChange = null,
  className = "",
  height = "640px",
}) {
  const [clientMounted, setClientMounted] = useState(false);
  const [data, setData] = useState(externalGeoJson || fallbackGeoJson);
  const [selectedRegionId, setSelectedRegionId] = useState(externalSelectedRegionId);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeMetric, setActiveMetric] = useState("water_risk");
  const [showLabels, setShowLabels] = useState(true);
  const [activeMonth, setActiveMonth] = useState("all");
  const [season, setSeason] = useState(externalSeason || "2025");

  useEffect(() => {
    if (externalSeason !== undefined && externalSeason !== season) {
      setSeason(externalSeason);
    }
  }, [externalSeason]);

  const handleSeasonChange = (newSeason) => {
    setSeason(newSeason);
    if (externalOnSeasonChange) {
      externalOnSeasonChange(newSeason);
    }
  };

  // Comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareRegionId, setCompareRegionId] = useState(null);
  const [compareFeature, setCompareFeature] = useState(null);

  // Camera animation triggers
  const [cameraCenter, setCameraCenter] = useState(null);
  const [cameraZoom, setCameraZoom] = useState(11);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [mapInstance, setMapInstance] = useState(null);

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

  const is2026 = season === "2026";

  // Selected feature metrics (with active month and season)
  const selectedRawProps = selectedFeature?.properties;
  const selectedProps = selectedRawProps ? getSeasonalProps(selectedRawProps, activeMonth, season) : null;

  // Comparison feature metrics
  const compareRawProps = compareFeature?.properties;
  const compareProps = compareRawProps ? getSeasonalProps(compareRawProps, activeMonth, season) : null;

  return (
    <MapErrorBoundary height={height}>
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07080d] shadow-xl ${className}`}
        style={{ height, minHeight: "550px" }}
      >
        {/* Unified Top Controls Header */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
          {/* Row 1: Layer Switcher (Left) & Map Utilities (Right) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left: Metric Layer Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#0b0d14]/92 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-lg pointer-events-auto">
              {METRIC_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeMetric === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMetric(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                      isActive
                        ? tab.activeCls
                        : "border-transparent text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Taluka Jump, Labels Toggle, Reset View */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Quick Taluka Jump Dropdown */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0d14]/92 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-lg">
                <Search className="w-3.5 h-3.5 text-[#8b93a7] shrink-0" />
                <select
                  value={selectedRegionId || ""}
                  onChange={(e) => handleSearchSelect(e.target.value)}
                  className="bg-transparent text-xs text-[#eef0f5] font-medium outline-none cursor-pointer pr-1"
                >
                  <option value="" className="bg-[#0b0d14] text-[#8b93a7]">
                    Jump to taluka...
                  </option>
                  <optgroup label="North Goa" className="bg-[#0b0d14] text-[#eef0f5]">
                    {Object.entries(TALUKA_METADATA)
                      .filter(([, t]) => t.district === "North Goa")
                      .map(([rid, t]) => (
                        <option key={rid} value={rid} className="bg-[#0b0d14] text-[#eef0f5]">
                          {t.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="South Goa" className="bg-[#0b0d14] text-[#eef0f5]">
                    {Object.entries(TALUKA_METADATA)
                      .filter(([, t]) => t.district === "South Goa")
                      .map(([rid, t]) => (
                        <option key={rid} value={rid} className="bg-[#0b0d14] text-[#eef0f5]">
                          {t.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Labels Toggle */}
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border backdrop-blur-md shadow-lg ${
                  showLabels
                    ? "bg-white/[0.08] border-white/20 text-[#eef0f5]"
                    : "bg-[#0b0d14]/92 border-white/[0.08] text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                }`}
                title="Toggle taluka map labels"
              >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span>Labels</span>
              </button>

              {/* Reset View Button */}
              <button
                onClick={handleResetCamera}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border border-white/[0.08] bg-[#0b0d14]/92 text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04] backdrop-blur-md shadow-lg"
                title="Reset view to entire state of Goa"
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Row 2: Season Switcher & Kharif Scrubber (Left) + Zoom (Right) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
              {/* Season Switcher: 2025 vs 2026 preliminary */}
              <div className="flex items-center gap-1 p-1 bg-[#0b0d14]/92 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-lg">
                <span className="text-[10px] text-[#5a6275] font-semibold px-1.5 border-r border-white/[0.08] uppercase tracking-wider">
                  Season
                </span>
                <button
                  onClick={() => handleSeasonChange("2025")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    season === "2025"
                      ? "bg-blue-600/20 border-blue-500/30 text-blue-300"
                      : "border-transparent text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                  }`}
                >
                  2025
                </button>
                <button
                  onClick={() => handleSeasonChange("2026")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    season === "2026"
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                      : "border-transparent text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                  }`}
                  title="Kharif 2026 Preliminary (NASA IMERG Late Run)"
                >
                  <span>2026</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono">
                    preliminary
                  </span>
                </button>
              </div>

              {/* Kharif Monsoon Timeline Scrubber */}
              <div className="flex items-center gap-1 p-1 bg-[#0b0d14]/92 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-lg">
                <div className="flex items-center gap-1 px-1.5 border-r border-white/[0.08] text-[10px] text-[#5a6275] font-semibold uppercase tracking-wider">
                  <Calendar className="w-3 h-3 text-[#8b93a7]" />
                  <span>Kharif</span>
                </div>
                {KHARIF_MONTHS.map((m) => {
                  const isCurrent = activeMonth === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMonth(m.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                        isCurrent
                          ? "bg-white/[0.1] border-white/20 text-[#f8fafc]"
                          : "border-transparent text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04]"
                      }`}
                      title={m.phase}
                    >
                      {m.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Map Zoom Controls */}
            <div className="flex items-center bg-[#0b0d14]/92 backdrop-blur-md border border-white/[0.08] rounded-lg overflow-hidden shadow-lg pointer-events-auto">
              <button
                onClick={() => mapInstance?.zoomIn()}
                className="px-2.5 py-1 text-xs font-semibold text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04] transition border-r border-white/[0.08] cursor-pointer"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => mapInstance?.zoomOut()}
                className="px-2.5 py-1 text-xs font-semibold text-[#8b93a7] hover:text-[#eef0f5] hover:bg-white/[0.04] transition cursor-pointer"
                title="Zoom out"
              >
                −
              </button>
            </div>
          </div>

          {/* Row 3: Active Comparison Prompt Banner */}
          {comparisonMode && selectedProps && !compareProps && (
            <div className="self-center flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b0d14]/95 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs shadow-lg pointer-events-auto mt-0.5">
              <span>
                Click a second taluka on the map to compare with <strong>{selectedProps.name}</strong>
              </span>
              <button
                onClick={() => setComparisonMode(false)}
                className="text-amber-200 hover:text-white transition cursor-pointer ml-1 font-bold"
                title="Cancel comparison"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Main Leaflet Map Container */}
        {clientMounted ? (
          <MapContainer
            key="goa-leaflet-map"
            center={GOA_MAP_CONFIG.center}
            zoom={GOA_MAP_CONFIG.zoom}
            bounds={GOA_BOUNDS}
            boundsOptions={{ padding: [24, 24] }}
            minZoom={GOA_MAP_CONFIG.minZoom}
            maxZoom={GOA_MAP_CONFIG.maxZoom}
            zoomControl={false}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ height: "100%", width: "100%", background: "#0b0d14" }}
          >
            <MapInstanceCapture setMap={setMapInstance} />
            <MapCameraController
              targetCenter={cameraCenter}
              targetZoom={cameraZoom}
              resetTrigger={resetTrigger}
            />

            {/* Standard OpenStreetMap TileLayer as sole basemap */}
            <TileLayer
              url={OSM_TILE_URL}
              attribution={OSM_ATTRIBUTION}
            />

            {data?.features?.length > 0 && (
              <StressLayer
                data={data}
                activeMetric={activeMetric}
                selectedRegionId={selectedRegionId}
                compareRegionId={compareRegionId}
                activeMonthId={activeMonth}
                season={season}
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
          <div className="w-full h-full flex items-center justify-center bg-[#07080d] text-[#8b93a7] text-xs">
            Initializing Goa geospatial map...
          </div>
        )}

        {/* Primary Selected Taluka Detail Drawer */}
        {selectedProps && !compareProps && (
          <div className="absolute bottom-4 left-4 z-[1000] w-[350px] max-w-[calc(100%-2rem)] max-h-[calc(100%-7.5rem)] overflow-y-auto bg-[#0b0d14]/95 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 shadow-xl text-[#eef0f5] flex flex-col gap-3">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-sky-400">
                    {selectedProps.district}
                  </span>
                  <span className="text-[#5a6275]">•</span>
                  <span className="text-[10px] font-mono text-[#8b93a7]">
                    {selectedProps.region_id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#f8fafc] mt-0.5 mb-1">
                  {selectedProps.name} Taluka
                </h3>
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] text-[#a3a9b8]">
                  {is2026 ? "Kharif 2026 (Preliminary)" : (selectedProps.season || "Kharif 2025 Domain")}
                </span>
              </div>
              <button
                onClick={handleClearSelection}
                className="p-1 rounded-md text-[#8b93a7] hover:text-[#f8fafc] hover:bg-white/[0.06] transition cursor-pointer"
                title="Close taluka details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Water-Deficit Status Banner */}
            <div
              className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                selectedProps.water_risk_level === "High"
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-200"
                  : selectedProps.water_risk_level === "Moderate"
                  ? "bg-amber-500/10 border-amber-500/25 text-amber-200"
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Water-deficit signal: {selectedProps.water_risk_level || (is2026 ? "Moderate" : "Low")}</span>
                </span>
                <span className="text-[10px] opacity-75">
                  {selectedProps.rainfall_signal || "near normal"}
                </span>
              </div>
              <div className="text-[11px] text-[#cbd5e1] leading-relaxed">
                {is2026
                  ? `Water-deficit signal Moderate: ${selectedProps.district} recorded ${selectedProps.rainfall_anomaly_pct > 0 ? "+" : ""}${selectedProps.rainfall_anomaly_pct}% rainfall anomaly (preliminary IMERG Late Run) with soil moisture available for June–July only.`
                  : (selectedProps.water_risk?.summary ||
                      `${selectedProps.district} recorded ${selectedProps.rainfall_anomaly_pct > 0 ? "+" : ""}${selectedProps.rainfall_anomaly_pct}% rainfall anomaly with ${selectedProps.sm_gldas_percentile}th percentile root-zone moisture.`)}
              </div>
            </div>

            {/* Rice Variety Suitability Card */}
            <div className="bg-[#11141c] border border-white/[0.06] rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Rice variety suitability</span>
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                  {selectedProps.rice_suitability_class || "Highly Suitable"}
                </span>
              </div>
              <div className="text-[11px] text-[#8b93a7] mb-1.5">
                Recommended for {selectedProps.name} ecologies:
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {(selectedProps.rice_suitability?.recommended_varieties || ["Karjat-3", "Naveen"]).map((v) => (
                  <span
                    key={v}
                    className="bg-white/[0.04] border border-white/[0.08] text-[#c7d2fe] text-[10px] font-medium px-2 py-0.5 rounded"
                  >
                    {v}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-[#5a6275]">
                Documented screening (ICAR-CCARI & KVK Goa)
              </div>
            </div>

            {/* NASA Observation 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-2.5">
              <div className="bg-[#11141c] border border-white/[0.06] rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-[#8b93a7] font-medium">
                  {is2026 && activeMonth !== "all" ? "Monthly rain" : "Precip anomaly"}
                </div>
                <div
                  className={`text-sm font-semibold font-mono tabular-nums mt-0.5 ${
                    selectedProps.rainfall_signal === "dry" || selectedProps.rainfall_anomaly_pct < 0
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {is2026 && activeMonth !== "all"
                    ? (selectedProps.rainfall_display || (selectedProps.rainfall_signal === "dry" ? "Below normal" : "Near normal"))
                    : `${selectedProps.rainfall_anomaly_pct > 0 ? "+" : ""}${selectedProps.rainfall_anomaly_pct}%`}
                </div>
                <div className="text-[10px] text-[#5a6275] mt-0.5">
                  {is2026 && activeMonth !== "all" ? "IMD departure category" : `Signal: ${selectedProps.rainfall_signal || "—"}`}
                </div>
              </div>

              <div className="bg-[#11141c] border border-white/[0.06] rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-[#8b93a7] font-medium">
                  Kharif rainfall
                </div>
                <div className="text-sm font-semibold font-mono tabular-nums text-[#eef0f5] mt-0.5">
                  {selectedProps.kharif_rainfall_mm ?? "—"} <span className="text-[10px] text-[#5a6275] font-normal">mm</span>
                </div>
                <div className="text-[10px] text-[#5a6275] mt-0.5">
                  {selectedProps.rainfall_category_imd || "Normal"} (IMD)
                </div>
              </div>

              <div className="bg-[#11141c] border border-white/[0.06] rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-[#8b93a7] font-medium">
                  GLDAS soil moisture
                </div>
                <div className="text-sm font-semibold font-mono tabular-nums text-sky-400 mt-0.5">
                  {is2026 ? "June–July only" : (selectedProps.sm_gldas_percentile !== null && selectedProps.sm_gldas_percentile !== undefined ? `${selectedProps.sm_gldas_percentile}th pctl` : "—")}
                </div>
                <div className="text-[10px] text-[#5a6275] mt-0.5">
                  Signal: {is2026 ? "June–July only" : (selectedProps.sm_gldas_signal || "—")}
                </div>
              </div>

              <div className="bg-[#11141c] border border-white/[0.06] rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-[#8b93a7] font-medium">
                  Dry months
                </div>
                <div className="text-sm font-semibold font-mono tabular-nums text-rose-300 mt-0.5">
                  {selectedProps.months_with_concurrent_dry_signals ?? 0} mo
                </div>
                <div className="text-[10px] text-[#5a6275] mt-0.5">
                  {selectedProps.indicators_with_data ?? 2} active sources
                </div>
              </div>
            </div>

            {/* Spatial Basis Disclosure */}
            <div className="bg-[#11141c]/60 border border-white/[0.06] rounded-lg p-2 flex items-start gap-2 text-[11px] text-[#8b93a7] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#cbd5e1]">District aggregation: </strong>
                {selectedProps.spatial_note || "Talukas inherit district-level values from NASA GPM IMERG and GLDAS-2.1."}
              </span>
            </div>

            {/* Scientific Interpretation Limits */}
            {selectedProps.interpretation_limit && (
              <div className="bg-[#11141c]/60 border border-white/[0.06] rounded-lg p-2 text-[11px] text-[#8b93a7] leading-relaxed">
                <strong className="text-[#cbd5e1]">Scientific limitation: </strong>
                {selectedProps.interpretation_limit}
              </div>
            )}

            {/* Action Button: Compare */}
            <button
              onClick={() => setComparisonMode(true)}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium border border-white/[0.08] bg-white/[0.04] text-[#eef0f5] hover:bg-white/[0.08] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span>Compare with another taluka</span>
            </button>
          </div>
        )}

        {/* Side-by-Side Comparison Drawer */}
        {selectedProps && compareProps && (
          <div className="absolute bottom-4 left-4 z-[1000] w-[520px] max-w-[calc(100%-2rem)] max-h-[calc(100%-7.5rem)] overflow-y-auto bg-[#0b0d14]/95 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 shadow-xl text-[#eef0f5] flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-semibold text-[#f8fafc]">
                  Taluka NASA Earth observation comparison
                </h3>
              </div>
              <button
                onClick={() => {
                  setComparisonMode(false);
                  setCompareRegionId(null);
                  setCompareFeature(null);
                }}
                className="p-1 rounded-md text-[#8b93a7] hover:text-[#f8fafc] hover:bg-white/[0.06] transition cursor-pointer"
                title="Close comparison"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Taluka A */}
              <div className="bg-[#11141c] border border-sky-500/20 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <strong className="text-sm font-bold text-sky-400">{selectedProps.name}</strong>
                  <span className="text-[10px] text-[#8b93a7]">{selectedProps.district}</span>
                </div>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Water-deficit signal:</span>
                    <strong className={selectedProps.water_risk_level === "High" ? "text-rose-400" : selectedProps.water_risk_level === "Moderate" ? "text-amber-300" : "text-emerald-400"}>
                      {selectedProps.water_risk_level || "Low"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Rice suitability:</span>
                    <strong className="text-sky-300">
                      {selectedProps.rice_suitability_class || "Highly Suitable"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Top varieties:</span>
                    <span className="text-[#c7d2fe] text-[10px] max-w-[120px] text-right truncate">
                      {(selectedProps.rice_suitability?.recommended_varieties || []).slice(0, 3).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">{is2026 && activeMonth !== "all" ? "Monthly rain:" : "Rainfall anom:"}</span>
                    <strong className={`font-mono tabular-nums ${selectedProps.rainfall_signal === "dry" || selectedProps.rainfall_anomaly_pct < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {is2026 && activeMonth !== "all"
                        ? (selectedProps.rainfall_display || (selectedProps.rainfall_signal === "dry" ? "Below normal" : "Near normal"))
                        : `${selectedProps.rainfall_anomaly_pct > 0 ? "+" : ""}${selectedProps.rainfall_anomaly_pct}%`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">GLDAS SM:</span>
                    <span className="text-sky-400 font-mono tabular-nums">
                      {is2026 ? "June–July only" : `${selectedProps.sm_gldas_percentile}th pctl`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Kharif rain:</span>
                    <span className="font-mono tabular-nums">{selectedProps.kharif_rainfall_mm ?? "—"} mm</span>
                  </div>
                </div>
              </div>

              {/* Taluka B */}
              <div className="bg-[#11141c] border border-amber-500/20 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <strong className="text-sm font-bold text-amber-300">{compareProps.name}</strong>
                  <span className="text-[10px] text-[#8b93a7]">{compareProps.district}</span>
                </div>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Water-deficit signal:</span>
                    <strong className={compareProps.water_risk_level === "High" ? "text-rose-400" : compareProps.water_risk_level === "Moderate" ? "text-amber-300" : "text-emerald-400"}>
                      {compareProps.water_risk_level || (is2026 ? "Moderate" : "Low")}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Rice suitability:</span>
                    <strong className="text-amber-300">
                      {compareProps.rice_suitability_class || "Highly Suitable"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Top varieties:</span>
                    <span className="text-[#fef08a] text-[10px] max-w-[120px] text-right truncate">
                      {(compareProps.rice_suitability?.recommended_varieties || []).slice(0, 3).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">{is2026 && activeMonth !== "all" ? "Monthly rain:" : "Rainfall anom:"}</span>
                    <strong className={`font-mono tabular-nums ${compareProps.rainfall_signal === "dry" || compareProps.rainfall_anomaly_pct < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {is2026 && activeMonth !== "all"
                        ? (compareProps.rainfall_display || (compareProps.rainfall_signal === "dry" ? "Below normal" : "Near normal"))
                        : `${compareProps.rainfall_anomaly_pct > 0 ? "+" : ""}${compareProps.rainfall_anomaly_pct}%`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">GLDAS SM:</span>
                    <span className="text-sky-400 font-mono tabular-nums">
                      {is2026 ? "June–July only" : `${compareProps.sm_gldas_percentile}th pctl`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b93a7]">Kharif rain:</span>
                    <span className="font-mono tabular-nums">{compareProps.kharif_rainfall_mm ?? "—"} mm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Differential Takeaway */}
            <div className="bg-[#11141c] border border-white/[0.06] rounded-lg p-2.5 text-xs text-[#a3a9b8] leading-relaxed">
              <strong className="text-[#eef0f5]">Differential analysis: </strong>
              {is2026 ? (
                <span>
                  Both <strong>{selectedProps.name}</strong> ({selectedProps.district}) and <strong>{compareProps.name}</strong> ({compareProps.district}) reflect Kharif 2026 preliminary IMERG Late Run conditions with water-deficit signal <strong>Moderate</strong>. Soil moisture is available for June–July only.
                </span>
              ) : selectedProps.district === compareProps.district ? (
                <span>
                  Both <strong>{selectedProps.name}</strong> and <strong>{compareProps.name}</strong> are in <strong>{selectedProps.district}</strong> and share the same district-level NASA indicator values ({selectedProps.rainfall_anomaly_pct > 0 ? "+" : ""}{selectedProps.rainfall_anomaly_pct}% rainfall anomaly, {selectedProps.sm_gldas_percentile}th percentile soil moisture).
                </span>
              ) : (
                <span>
                  <strong>{selectedProps.name}</strong> ({selectedProps.district}) recorded {selectedProps.rainfall_anomaly_pct > 0 ? "+" : ""}{selectedProps.rainfall_anomaly_pct}% rainfall anomaly ({selectedProps.kharif_rainfall_mm} mm) vs <strong>{compareProps.name}</strong> ({compareProps.district}) with {compareProps.rainfall_anomaly_pct > 0 ? "+" : ""}{compareProps.rainfall_anomaly_pct}% anomaly ({compareProps.kharif_rainfall_mm} mm). Both districts maintain high soil moisture ({selectedProps.sm_gldas_percentile}th percentile, {selectedProps.sm_gldas_signal}).
                </span>
              )}
            </div>
          </div>
        )}

        {/* Floating Map Legend */}
        <MapLegend
          activeMetric={activeMetric}
          activeMonthId={activeMonth}
          season={season}
        />

        {/* Clean CSS rules for Leaflet and custom overlays */}
        <style>{`
          .leaflet-container {
            background-color: #0b0d14 !important;
            font-family: 'Montserrat', system-ui, -apple-system, sans-serif !important;
            height: 100% !important;
            width: 100% !important;
          }
          .leaflet-control-attribution {
            background: rgba(11, 13, 20, 0.75) !important;
            color: #8b93a7 !important;
            font-size: 10px !important;
            padding: 2px 6px !important;
            border-top-left-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.06) !important;
            border-bottom: none !important;
            border-right: none !important;
          }
          .leaflet-control-attribution a {
            color: #8b93a7 !important;
            text-decoration: underline;
          }
          .earthscope-map-tooltip {
            background: rgba(11, 13, 20, 0.95) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(12px) !important;
            padding: 0 !important;
          }
          .earthscope-map-tooltip::before {
            border-top-color: rgba(11, 13, 20, 0.95) !important;
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
