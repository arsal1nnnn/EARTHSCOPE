import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import { getTalukaStyle, getSeasonalProps } from "./mapStyles";

/**
 * StressLayer Component
 * Renders the GeoJSON choropleth layer with dynamic styles, real NASA monthly data,
 * hover tooltips, and click selection.
 *
 * Supports both Kharif 2025 and Kharif 2026 (Preliminary via properties.kharif_2026).
 */
export default function StressLayer({
  data,
  activeMetric = "rainfall_anomaly_pct",
  selectedRegionId = null,
  compareRegionId = null,
  activeMonthId = "all",
  season = "2025",
  onSelectTaluka = () => {},
  onHoverTaluka = () => {},
}) {
  const layerKey = useMemo(() => {
    return `${activeMetric}-${selectedRegionId || "none"}-${compareRegionId || "none"}-${activeMonthId}-${season}-${data?.features?.length || 0}`;
  }, [activeMetric, selectedRegionId, compareRegionId, activeMonthId, season, data]);

  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  const is2026 = season === "2026";

  const onEachFeature = (feature, layer) => {
    const rawProps = feature.properties || {};
    const props = getSeasonalProps(rawProps, activeMonthId, season);
    const regionId = props.region_id || "Unknown";
    const name = props.name || "Taluka";
    const district = props.district || "Goa";
    const isMonthView = activeMonthId !== "all";

    // ── Real NASA values only ────────────────────────────────────────────────
    // In 2026, monthly rainfall is displayed as below/above/near normal, not percentages
    let rainfallAnom = "N/A";
    if (is2026 && isMonthView) {
      rainfallAnom = props.rainfall_display || (props.rainfall_signal === "dry" ? "Below normal" : props.rainfall_signal === "wet" ? "Above normal" : "Near normal");
    } else if (props.rainfall_anomaly_pct !== undefined && props.rainfall_anomaly_pct !== null) {
      rainfallAnom = `${props.rainfall_anomaly_pct > 0 ? "+" : ""}${props.rainfall_anomaly_pct}%`;
    }

    const rainfallSignal   = props.rainfall_signal      || "—";
    const rainfallPctile   = props.rainfall_percentile  !== undefined && props.rainfall_percentile !== null ? `${props.rainfall_percentile}th pctl` : "N/A";
    const imdCat           = props.rainfall_category_imd || "—";
    const smDisplay        = is2026 ? "June–July only" : (props.sm_gldas_percentile !== undefined && props.sm_gldas_percentile !== null ? `${props.sm_gldas_percentile}th pctl` : "N/A");
    const smSignal         = is2026 ? "June–July only" : (props.sm_gldas_signal || "—");
    const agreement        = props.indicator_agreement   || "—";
    const deficitSignal    = props.water_risk_level      || (is2026 ? "Moderate" : "Low");
    const riceClass        = props.rice_suitability_class || (props.rice_suitability?.class || "Highly Suitable");
    const topVarieties     = (props.rice_suitability?.recommended_varieties || []).slice(0, 3).join(", ");

    const isSelected = regionId === selectedRegionId;
    const isCompared = regionId === compareRegionId;
    const rainfallColor = props.rainfall_signal === "dry" || props.rainfall_anomaly_pct < 0 ? "#f87171" : "#4ade80";

    const tooltipContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; color: #f1f5f9; padding: 6px 8px; min-width: 210px;">
        <div style="font-weight: 700; font-size: 13px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: baseline;">
          <span>${name}</span>
          <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">${district}</span>
        </div>

        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; margin-bottom: 4px;">
          ${isMonthView ? `${activeMonthId.charAt(0).toUpperCase() + activeMonthId.slice(1)} · ` : ""}${is2026 ? "Kharif 2026 (Preliminary)" : "Kharif 2025"} · NASA Earth Observation
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Water-Deficit Signal:</span>
          <strong style="color: ${deficitSignal === 'High' ? '#f87171' : deficitSignal === 'Moderate' ? '#fbbf24' : '#34d399'};">${deficitSignal}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rice Suitability:</span>
          <strong style="color: #38bdf8;">${riceClass}</strong>
        </div>
        ${topVarieties ? `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">Top: ${topVarieties}</div>` : ""}

        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 3px;">
          <span style="color: #94a3b8;">${is2026 && isMonthView ? "Monthly Rainfall:" : "Rainfall Anomaly:"}</span>
          <strong style="color: ${rainfallColor};">${rainfallAnom}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rainfall Signal:</span>
          <span style="color: #f8fafc;">${rainfallSignal}</span>
        </div>
        ${!is2026 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">Rainfall Percentile:</span>
          <span style="color: #f8fafc;">${rainfallPctile}</span>
        </div>
        ` : ""}
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">IMD Category:</span>
          <span style="color: #f8fafc;">${imdCat}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #94a3b8;">GLDAS Soil Moisture:</span>
          <span style="color: #38bdf8;">${is2026 ? "June–July only" : `${smDisplay} · ${smSignal}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #94a3b8;">Agreement:</span>
          <span style="color: #f8fafc;">${agreement}</span>
        </div>

        <div style="font-size: 9px; color: #64748b; margin-top: 5px; font-style: italic; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px; line-height: 1.3;">
          ${is2026 ? "Preliminary IMERG Late Run district estimate · Soil moisture June–July only" : "District-level values — same for all talukas in this district"}
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
        target.setStyle(getTalukaStyle(feature, activeMetric, isSelected, true, isCompared, activeMonthId, season));
        target.bringToFront();
        onHoverTaluka(feature);
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(getTalukaStyle(feature, activeMetric, isSelected, false, isCompared, activeMonthId, season));
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
        return getTalukaStyle(feature, activeMetric, isSelected, false, isCompared, activeMonthId, season);
      }}
      onEachFeature={onEachFeature}
    />
  );
}
