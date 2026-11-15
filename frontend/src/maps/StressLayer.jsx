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

    // In 2026, monthly rainfall is displayed as below/above/near normal, not percentages
    let rainfallAnom = "—";
    if (is2026 && isMonthView) {
      rainfallAnom = props.rainfall_display || (props.rainfall_signal === "dry" ? "Below normal" : props.rainfall_signal === "wet" ? "Above normal" : "Near normal");
    } else if (props.rainfall_anomaly_pct !== undefined && props.rainfall_anomaly_pct !== null) {
      rainfallAnom = `${props.rainfall_anomaly_pct > 0 ? "+" : ""}${props.rainfall_anomaly_pct}%`;
    }

    const rainfallSignal = props.rainfall_signal || "—";
    const rainfallPctile = props.rainfall_percentile !== undefined && props.rainfall_percentile !== null ? `${props.rainfall_percentile}th pctl` : "—";
    const imdCat         = props.rainfall_category_imd || "—";
    const smDisplay      = is2026 ? "June–July only" : (props.sm_gldas_percentile !== undefined && props.sm_gldas_percentile !== null ? `${props.sm_gldas_percentile}th pctl` : "—");
    const smSignal       = is2026 ? "June–July only" : (props.sm_gldas_signal || "—");
    const deficitSignal  = props.water_risk_level || (is2026 ? "Moderate" : "Low");
    const riceClass      = props.rice_suitability_class || (props.rice_suitability?.class || "Highly Suitable");
    const topVarieties   = (props.rice_suitability?.recommended_varieties || []).slice(0, 3).join(", ");

    const isSelected = regionId === selectedRegionId;
    const isCompared = regionId === compareRegionId;
    const rainfallColor = props.rainfall_signal === "dry" || props.rainfall_anomaly_pct < 0 ? "#f87171" : "#34d399";
    const deficitColor  = deficitSignal === "High" ? "#f87171" : deficitSignal === "Moderate" ? "#fbbf24" : "#34d399";

    const tooltipContent = `
      <div style="font-family: 'Montserrat', system-ui, -apple-system, sans-serif; font-size: 11px; line-height: 1.4; color: #f1f5f9; padding: 8px 10px; min-width: 220px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px; margin-bottom: 6px;">
          <div>
            <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">${name}</span>
            <span style="font-size: 10px; color: #8b93a7; margin-left: 4px;">${district}</span>
          </div>
          <span style="font-size: 9px; font-family: monospace; color: #8b93a7;">${regionId}</span>
        </div>

        <div style="font-size: 9px; color: #5a6275; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 6px;">
          ${isMonthView ? `${activeMonthId.charAt(0).toUpperCase() + activeMonthId.slice(1)} · ` : ""}${is2026 ? "Kharif 2026 (preliminary)" : "Kharif 2025"} · NASA Earth observation
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #8b93a7;">Water-deficit signal:</span>
          <strong style="color: ${deficitColor}; font-weight: 600;">${deficitSignal}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #8b93a7;">Rice suitability:</span>
          <strong style="color: #38bdf8; font-weight: 600;">${riceClass}</strong>
        </div>
        ${topVarieties ? `<div style="font-size: 10px; color: #8b93a7; margin-bottom: 4px;">Top: ${topVarieties}</div>` : ""}

        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 4px;">
          <span style="color: #8b93a7;">${is2026 && isMonthView ? "Monthly rainfall:" : "Rainfall anomaly:"}</span>
          <strong style="color: ${rainfallColor}; font-family: monospace; font-variant-numeric: tabular-nums;">${rainfallAnom}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #8b93a7;">Rainfall signal:</span>
          <span style="color: #cbd5e1;">${rainfallSignal}</span>
        </div>
        ${!is2026 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #8b93a7;">Rainfall percentile:</span>
          <span style="color: #cbd5e1; font-family: monospace; font-variant-numeric: tabular-nums;">${rainfallPctile}</span>
        </div>
        ` : ""}
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #8b93a7;">IMD category:</span>
          <span style="color: #cbd5e1;">${imdCat}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #8b93a7;">GLDAS soil moisture:</span>
          <span style="color: #38bdf8; font-family: monospace; font-variant-numeric: tabular-nums;">${is2026 ? "June–July only" : `${smDisplay} (${smSignal})`}</span>
        </div>

        <div style="font-size: 9px; color: #5a6275; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 4px; line-height: 1.3;">
          ${is2026 ? "Preliminary IMERG Late Run district estimate · Soil moisture June–July only" : "District-level NASA indicators inherited by all talukas in district"}
        </div>
        <div style="font-size: 9px; color: #5a6275; margin-top: 2px; text-align: right;">
          ${isSelected ? "Selected" : isCompared ? "Compared" : "Click to inspect"}
        </div>
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      direction: "auto",
      className: "earthscope-map-tooltip",
      opacity: 0.98,
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
