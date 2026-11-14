import React, { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import { getTalukaStyle } from "./mapStyles";

/**
 * StressLayer Component
 * Renders the GeoJSON choropleth layer with dynamic styles, hover effects, tooltips, and click selection.
 */
export default function StressLayer({
  data,
  activeMetric = "asi_score",
  selectedRegionId = null,
  onSelectTaluka = () => {},
  onHoverTaluka = () => {},
}) {
  // Generate unique key whenever style dependencies change so Leaflet re-renders properly
  const layerKey = useMemo(() => {
    return `${activeMetric}-${selectedRegionId || "none"}-${data?.features?.length || 0}`;
  }, [activeMetric, selectedRegionId, data]);

  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const regionId = props.region_id || "Unknown";
    const name = props.name || "Taluka";
    const district = props.district || "Goa";
    const asi = props.asi_score ?? "N/A";
    const category = props.stress_category || "Normal";
    const moisture = props.soil_moisture_pct ?? "N/A";
    const rainfall = props.rainfall_anomaly !== undefined ? `${props.rainfall_anomaly > 0 ? "+" : ""}${props.rainfall_anomaly}%` : "N/A";
    const prob30d = props.predicted_30d_prob !== undefined ? `${Math.round(props.predicted_30d_prob * 100)}%` : "N/A";

    // Tooltip HTML content
    const tooltipContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; color: #f1f5f9; padding: 6px 8px; min-width: 170px;">
        <div style="font-weight: 700; font-size: 13px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 5px; display: flex; justify-content: space-between;">
          <span>${name}</span>
          <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">${district}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Stress Index (ASI):</span>
          <strong style="color: #f8fafc;">${asi} / 100</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Category:</span>
          <span style="font-weight: 600; color: #38bdf8;">${category}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Soil Moisture:</span>
          <span>${moisture}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rainfall Anomaly:</span>
          <span style="color: ${props.rainfall_anomaly < 0 ? '#f87171' : '#4ade80'}">${rainfall}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">30d Stress Risk:</span>
          <span style="font-weight: 600;">${prob30d}</span>
        </div>
        <div style="font-size: 9px; color: #64748b; margin-top: 5px; text-align: right; font-style: italic;">
          ID: ${regionId}
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
        const isSelected = regionId === selectedRegionId;
        target.setStyle(getTalukaStyle(feature, activeMetric, isSelected, true));
        target.bringToFront();
        onHoverTaluka(feature);
      },
      mouseout: (e) => {
        const target = e.target;
        const isSelected = regionId === selectedRegionId;
        target.setStyle(getTalukaStyle(feature, activeMetric, isSelected, false));
        onHoverTaluka(null);
      },
      click: () => {
        onSelectTaluka(feature);
      },
    });
  };

  return (
    <GeoJSON
      key={layerKey}
      data={data}
      style={(feature) => {
        const isSelected = feature?.properties?.region_id === selectedRegionId;
        return getTalukaStyle(feature, activeMetric, isSelected, false);
      }}
      onEachFeature={onEachFeature}
    />
  );
}
