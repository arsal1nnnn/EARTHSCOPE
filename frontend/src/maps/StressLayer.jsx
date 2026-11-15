import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import { getTalukaStyle, getSeasonalProps, TALUKA_METADATA } from "./mapStyles";

/**
 * StressLayer Component
 * Renders the GeoJSON choropleth layer with dynamic styles, real NASA monthly data,
 * hover tooltips, and click selection.
 *
 * All values displayed here come directly from goa_taluka_indicators.geojson (M4 output).
 * No fabricated fields (ASI, soil_moisture_pct %, predicted_30d_prob, evidence_coverage).
 *
 * Data sources:
 *   - rainfall_anomaly_pct / rainfall_percentile / rainfall_signal: GPM IMERG Final v07
 *   - sm_gldas_percentile / sm_gldas_signal: GLDAS-2.1 Noah root-zone (~25 km)
 *   - indicator_agreement: computed from above two real sources
 */
export default function StressLayer({
  data,
  activeMetric = "rainfall_anomaly_pct",
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

    // ── Real NASA values only ────────────────────────────────────────────────
    const rainfallAnom =
      props.rainfall_anomaly_pct !== undefined
        ? `${props.rainfall_anomaly_pct > 0 ? "+" : ""}${props.rainfall_anomaly_pct}%`
        : "N/A";
    const rainfallSignal   = props.rainfall_signal      || "—";
    const rainfallPctile   = props.rainfall_percentile  !== undefined ? `${props.rainfall_percentile}th pctl`  : "N/A";
    const imdCat           = props.rainfall_category_imd || "—";
    const smPctile         = props.sm_gldas_percentile  !== undefined ? `${props.sm_gldas_percentile}th pctl` : "N/A";
    const smSignal         = props.sm_gldas_signal       || "—";
    const agreement        = props.indicator_agreement   || "—";
    const isMonthView      = activeMonthId !== "all";

    const meta = TALUKA_METADATA[regionId] || {};
    const ecologiesBadges = (meta.ecologies || [])
      .map(
        (eco) =>
          `<span style="background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 1px 5px; border-radius: 4px; font-size: 9px; margin-right: 4px;">${eco}</span>`
      )
      .join("");

    const isSelected = regionId === selectedRegionId;
    const isCompared = regionId === compareRegionId;
    const rainfallColor = props.rainfall_anomaly_pct < 0 ? "#f87171" : "#4ade80";

    const tooltipContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; color: #f1f5f9; padding: 6px 8px; min-width: 200px;">
        <div style="font-weight: 700; font-size: 13px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: baseline;">
          <span>${name}</span>
          <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">${district}</span>
        </div>
        ${ecologiesBadges ? `<div style="margin-bottom: 6px;">${ecologiesBadges}</div>` : ""}

        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; margin-bottom: 4px;">
          ${isMonthView ? `${activeMonthId.charAt(0).toUpperCase() + activeMonthId.slice(1)} · ` : ""}GPM IMERG v07 · GLDAS-2.1 Noah
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rainfall Anomaly:</span>
          <strong style="color: ${rainfallColor};">${rainfallAnom}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rainfall Signal:</span>
          <span style="color: #f8fafc;">${rainfallSignal}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rainfall Percentile:</span>
          <span style="color: #f8fafc;">${rainfallPctile}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">IMD Category:</span>
          <span style="color: #f8fafc;">${imdCat}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">GLDAS Soil Moisture:</span>
          <span style="color: #38bdf8;">${smPctile} · ${smSignal}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #94a3b8;">Agreement:</span>
          <span style="color: #f8fafc;">${agreement}</span>
        </div>

        <div style="font-size: 9px; color: #64748b; margin-top: 5px; font-style: italic; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px; line-height: 1.3;">
          District-level values — same for all talukas in this district
        </div>
        <div style="font-size: 9px; color: #475569; margin-top: 2px; text-align: right; font-style: italic;">
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
