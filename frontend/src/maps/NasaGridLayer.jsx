import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import { KHARIF_MONTHS } from "./mapStyles";

// Bounding box of Goa region with slight buffer for raster grids
const MIN_LON = 73.65;
const MAX_LON = 74.38;
const MIN_LAT = 14.72;
const MAX_LAT = 15.82;

/**
 * Generates NASA SMAP L4 EASE-Grid 2.0 (9 km) polygons over Goa.
 * At 15.4 deg N:
 *   1 deg lat ~ 110.6 km  => 9 km ~ 0.0814 deg
 *   1 deg lon ~ 107.3 km  => 9 km ~ 0.0839 deg
 */
function generateSmapGrid(activeMonthId = "all") {
  const dLat = 0.0814;
  const dLon = 0.0839;
  const features = [];
  const month = KHARIF_MONTHS.find((m) => m.id === activeMonthId) || KHARIF_MONTHS[0];

  let r = 0;
  for (let lat = 14.70; lat < MAX_LAT; lat += dLat) {
    let c = 0;
    for (let lon = MIN_LON; lon < MAX_LON; lon += dLon) {
      const lat1 = Number(lat.toFixed(4));
      const lat2 = Number((lat + dLat).toFixed(4));
      const lon1 = Number(lon.toFixed(4));
      const lon2 = Number((lon + dLon).toFixed(4));
      const centerLat = Number(((lat1 + lat2) / 2).toFixed(4));
      const centerLon = Number(((lon1 + lon2) / 2).toFixed(4));

      // Simulate spatial moisture gradient (higher in Western Ghats east, lower in coastal north)
      const baseSm = Math.round(20 + (centerLon - 73.7) * 18 - (centerLat - 15.0) * 8);
      const simulatedSm = Math.max(8, Math.min(46, Math.round(baseSm + (month.smMod || 0))));

      features.push({
        type: "Feature",
        properties: {
          grid_type: "smap",
          cell_id: `SMAP-EASE2-R${r}-C${c}`,
          resolution: "9 km (EASE-Grid 2.0)",
          sensor: "SMAP L-band Conical Scanning Radiometer (1.41 GHz)",
          variable: "Root-Zone (0-100cm) & Surface (0-5cm) Soil Moisture",
          observed_value: `${simulatedSm}% vol`,
          cadence: "3-hourly model assimilation / 24h daily mean",
          center: [centerLat, centerLon],
          bbox: [lon1, lat1, lon2, lat2],
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [lon1, lat1],
              [lon2, lat1],
              [lon2, lat2],
              [lon1, lat2],
              [lon1, lat1],
            ],
          ],
        },
      });
      c++;
    }
    r++;
  }

  return { type: "FeatureCollection", features };
}

/**
 * Generates NASA GPM IMERG V07 0.1 deg (~10 km) multi-satellite precipitation grid over Goa.
 */
function generateGpmGrid(activeMonthId = "all") {
  const step = 0.10;
  const features = [];
  const month = KHARIF_MONTHS.find((m) => m.id === activeMonthId) || KHARIF_MONTHS[0];

  let r = 0;
  for (let lat = Math.floor(MIN_LAT / step) * step; lat < MAX_LAT; lat += step) {
    let c = 0;
    for (let lon = Math.floor(MIN_LON / step) * step; lon < MAX_LON; lon += step) {
      const lat1 = Number(lat.toFixed(4));
      const lat2 = Number((lat + step).toFixed(4));
      const lon1 = Number(lon.toFixed(4));
      const lon2 = Number((lon + step).toFixed(4));
      const centerLat = Number(((lat1 + lat2) / 2).toFixed(4));
      const centerLon = Number(((lon1 + lon2) / 2).toFixed(4));

      // Simulate spatial rainfall anomaly (higher orographic lift in Ghats)
      const baseRain = Math.round(-12 + (centerLon - 73.8) * 22 + (centerLat - 15.2) * 5);
      const simulatedRain = Math.round((baseRain + (month.rainMod || 0)) * 10) / 10;

      features.push({
        type: "Feature",
        properties: {
          grid_type: "gpm",
          cell_id: `GPM-010D-R${r}-C${c}`,
          resolution: "0.10° x 0.10° (~10 km)",
          sensor: "GPM Core Observatory (DPR Radar + GMI Microwave Constellation)",
          variable: "Calibrated Precipitation Accumulation & Anomaly",
          observed_value: `${simulatedRain > 0 ? "+" : ""}${simulatedRain}%`,
          cadence: "30-minute latency / calibrated monthly anomaly",
          center: [centerLat, centerLon],
          bbox: [lon1, lat1, lon2, lat2],
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [lon1, lat1],
              [lon2, lat1],
              [lon2, lat2],
              [lon1, lat2],
              [lon1, lat1],
            ],
          ],
        },
      });
      c++;
    }
    r++;
  }

  return { type: "FeatureCollection", features };
}

/**
 * NasaGridLayer Component
 * Renders scientific wireframe footprint overlays for NASA SMAP L4 (9 km) and GPM IMERG (10 km).
 */
export default function NasaGridLayer({
  gridMode = "none", // "none" | "smap" | "gpm" | "both"
  activeMonthId = "all",
}) {
  const smapData = useMemo(() => generateSmapGrid(activeMonthId), [activeMonthId]);
  const gpmData = useMemo(() => generateGpmGrid(activeMonthId), [activeMonthId]);

  if (gridMode === "none") {
    return null;
  }

  const onEachFeature = (feature, layer) => {
    const p = feature.properties || {};
    const isSmap = p.grid_type === "smap";
    const titleColor = isSmap ? "#38bdf8" : "#fbbf24";
    const badgeBg = isSmap ? "rgba(56, 189, 248, 0.15)" : "rgba(245, 158, 11, 0.15)";
    const badgeBorder = isSmap ? "#38bdf8" : "#fbbf24";

    const tooltipContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; line-height: 1.4; color: #f1f5f9; padding: 6px 8px; min-width: 220px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="font-size: 12px; color: ${titleColor};">
            ${isSmap ? "NASA SMAP L4" : "NASA GPM IMERG"}
          </strong>
          <span style="font-family: monospace; font-size: 9px; background: ${badgeBg}; color: ${titleColor}; border: 1px solid ${badgeBorder}; padding: 1px 4px; border-radius: 4px;">
            ${p.cell_id}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Spatial Grid:</span>
          <strong style="color: #ffffff;">${p.resolution}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">${isSmap ? "Soil Moisture:" : "Precipitation Anomaly:"}</span>
          <strong style="color: ${titleColor};">${p.observed_value}</strong>
        </div>
        <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1);">
          <strong style="color: #94a3b8;">Sensor:</strong> ${p.sensor}
        </div>
        <div style="font-size: 9px; color: #64748b; margin-top: 4px; text-align: right;">
          Center: [${p.center[0]}°N, ${p.center[1]}°E]
        </div>
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      direction: "auto",
      className: "earthscope-map-tooltip",
      opacity: 0.95,
    });

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2.5,
          fillOpacity: 0.28,
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(
          isSmap
            ? {
                color: "#06b6d4",
                weight: 1.5,
                dashArray: "4, 4",
                fillColor: "#06b6d4",
                fillOpacity: 0.05,
              }
            : {
                color: "#f59e0b",
                weight: 1.5,
                dashArray: "5, 5",
                fillColor: "#f59e0b",
                fillOpacity: 0.05,
              }
        );
      },
    });
  };

  return (
    <>
      {/* SMAP L4 9 km Grid */}
      {(gridMode === "smap" || gridMode === "both") && (
        <GeoJSON
          key={`smap-grid-${activeMonthId}`}
          data={smapData}
          style={() => ({
            color: "#06b6d4",
            weight: 1.5,
            dashArray: "4, 4",
            fillColor: "#06b6d4",
            fillOpacity: 0.05,
          })}
          onEachFeature={onEachFeature}
        />
      )}

      {/* GPM IMERG 0.1 deg (~10 km) Grid */}
      {(gridMode === "gpm" || gridMode === "both") && (
        <GeoJSON
          key={`gpm-grid-${activeMonthId}`}
          data={gpmData}
          style={() => ({
            color: "#f59e0b",
            weight: 1.5,
            dashArray: "5, 5",
            fillColor: "#f59e0b",
            fillOpacity: 0.05,
          })}
          onEachFeature={onEachFeature}
        />
      )}
    </>
  );
}
