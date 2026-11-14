import React, { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import { getTalukaStyle, getSeasonalProps, TALUKA_METADATA } from "./mapStyles";

/**
 * StressLayer Component
 * Renders the GeoJSON choropleth layer with dynamic styles, seasonal simulations,
 * hover effects, tooltips, and click selection.
 */
export default function StressLayer({
  data,
  activeMetric = "asi_score",
  selectedRegionId = null,
  compareRegionId = null,
  activeMonthId = "all",
  onSelectTaluka = () => {},
  onHoverTaluka = () => {},
}) {
  const layerKey = useMemo(() => {
    return `${activeMetric}-${selectedRegionId || "none"}-${compareRegionId || "none"}-${activeMonthId}-${data?.features?.length || 0}`;
  }, [activeMetric, selectedRegionId, compareRegionId, activeMonthId, data]);

  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  const onEachFeature = (feature, layer) => {
    const rawProps = feature.properties || {};
    const props = getSeasonalProps(rawProps, activeMonthId);
    const regionId = props.region_id || "Unknown";
    const name = props.name || "Taluka";
    const district = props.district || "Goa";
    const asi = props.asi_score ?? "N/A";
    const category = props.stress_category || "Normal";
    const moisture = props.soil_moisture_pct ?? "N/A";
    const rainfall = props.rainfall_anomaly !== undefined ? `${props.rainfall_anomaly > 0 ? "+" : ""}${props.rainfall_anomaly}%` : "N/A";
    const prob30d = props.predicted_30d_prob !== undefined ? `${Math.round(props.predicted_30d_prob * 100)}%` : "N/A";

    const meta = TALUKA_METADATA[regionId] || {};
    const ecologiesBadges = (meta.ecologies || [])
      .map(
        (eco) =>
          `<span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 1px 5px; border-radius: 4px; font-size: 9px; margin-right: 4px;">${eco}</span>`
      )
      .join("");

    const isSelected = regionId === selectedRegionId;
    const isCompared = regionId === compareRegionId;

    const tooltipContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; color: #f1f5f9; padding: 6px 8px; min-width: 180px;">
        <div style="font-weight: 700; font-size: 13px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: baseline;">
          <span>${name}</span>
          <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">${district}</span>
        </div>
        ${ecologiesBadges ? `<div style="margin-bottom: 6px;">${ecologiesBadges}</div>` : ""}
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Stress Index (ASI):</span>
          <strong style="color: #f8fafc;">${asi} / 100</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Status:</span>
          <span style="font-weight: 600; color: #38bdf8;">${category}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Soil Moisture:</span>
          <span>${moisture}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rainfall Anomaly:</span>
          <span style="color: ${props.rainfall_anomaly < 0 ? "#f87171" : "#4ade80"}; font-weight: 600;">${rainfall}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #94a3b8;">30d Risk Prob:</span>
          <span style="font-weight: 600; color: #fb7185;">${prob30d}</span>
        </div>
        <div style="font-size: 9px; color: #64748b; margin-top: 4px; text-align: right; font-style: italic;">
          ID: ${regionId} ${isSelected ? "• [Selected]" : isCompared ? "• [Compared]" : "• Click to inspect"}
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
        target.setStyle(getTalukaStyle(feature, activeMetric, isSelected, true, isCompared, activeMonthId));
        target.bringToFront();
        onHoverTaluka(feature);
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(getTalukaStyle(feature, activeMetric, isSelected, false, isCompared, activeMonthId));
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
        const rId = feature?.properties?.region_id;
        const isSelected = rId === selectedRegionId;
        const isCompared = rId === compareRegionId;
        return getTalukaStyle(feature, activeMetric, isSelected, false, isCompared, activeMonthId);
      }}
      onEachFeature={onEachFeature}
    />
  );
}
