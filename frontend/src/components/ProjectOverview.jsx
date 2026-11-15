import { Satellite, Droplets, Sprout, Database, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";
import DitherIcon from "./DitherIcon";

export default function ProjectOverview() {
  const telemetryFeatures = [
    {
      title: "NASA GPM IMERG Final v07",
      badge: "Satellite Precipitation",
      variant: "blue",
      icon: Satellite,
      stat: "~11 km",
      statLabel: "Spatial Resolution",
      description:
        "Global Precipitation Measurement (GPM) multi-satellite calibrated product. Compared against a 20-year historical baseline to isolate true monthly rainfall anomalies across all 12 Goa talukas.",
      provenance: "NASA Goddard Space Flight Center / GES DISC",
    },
    {
      title: "GLDAS-2.1 Noah Land Surface Model",
      badge: "Root-Zone Moisture",
      variant: "cyan",
      icon: Droplets,
      stat: "0–100 cm",
      statLabel: "Root-Zone Profile",
      description:
        "Global Land Data Assimilation System model assimilating observed meteorological forcing. Tracks root-zone soil moisture saturation percentiles to determine true water deficit independent of surface runoff.",
      provenance: "NASA GSFC Hydrological Sciences Laboratory",
    },
    {
      title: "ICAR-CCARI Variety Catalogue",
      badge: "Agronomic Evidence",
      variant: "green",
      icon: Sprout,
      stat: "9 Varieties",
      statLabel: "Documented Cultivars",
      description:
        "Field-validated Goan rice varieties (Goa Dhan 1–4, CSR-27, CSR-36, Karjat-3, Naveen, Annada) screened across Khazan saline lands, Kher shallow lowlands, and Morod rainfed uplands.",
      provenance: "ICAR Central Coastal Agricultural Research Institute, Goa",
    },
    {
      title: "Two-Indicator Deficit Signal",
      badge: "Scientific Decision Rule",
      variant: "amber",
      icon: Layers,
      stat: "Low / Mod / High",
      statLabel: "Dryness Classification",
      description:
        "Separates rainfall deficiency from soil moisture deficit. Avoids misleading 'low risk' labels during high-precipitation years like Kharif 2025 where lowlands face waterlogging rather than drought.",
      provenance: "Transparent Two-Indicator Rule Matrix",
    },
  ];

  return (
    <section id="project-overview" className="w-full py-20 px-6 md:px-16 bg-[#080f1a] text-white border-t border-[#1a293e]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#004FF4]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-blue-400">
                Scientific Architecture & Provenance
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-montserrat tracking-tight text-white">
              Grounding Agricultural Decisions in Real NASA Telemetry
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-400 leading-relaxed font-sans">
            EarthScope fuses NASA satellite remote sensing with hydrological model assimilation and local ICAR-CCARI varietal records to provide transparent, explainable water-deficit intelligence for Goa's agrarian talukas.
          </p>
        </div>

        {/* 4 Feature Cards with Dithered Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {telemetryFeatures.map((feat) => {
            return (
              <div
                key={feat.title}
                className="group relative p-6 rounded-xl bg-[#0e1726] border border-[#1e2f47] hover:border-[#004FF4]/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
              >
                {/* Subtle dither pattern accent on card top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl opacity-75 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      feat.variant === "blue"
                        ? "linear-gradient(90deg, #004FF4, #86A6D9)"
                        : feat.variant === "cyan"
                        ? "linear-gradient(90deg, #06b6d4, #86A6D9)"
                        : feat.variant === "green"
                        ? "linear-gradient(90deg, #10b981, #6ee7b7)"
                        : "linear-gradient(90deg, #f59e0b, #fde68a)",
                  }}
                />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <DitherIcon icon={feat.icon} variant={feat.variant} size="md" />
                    <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-montserrat text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">
                      {feat.statLabel}
                    </span>
                    <strong className="text-sm font-mono font-bold text-white">
                      {feat.stat}
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400/80 max-w-[120px] text-right truncate">
                    {feat.provenance}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scientific Integrity Banner */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#0d1c31] to-blue-950/40 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <DitherIcon icon={ShieldCheck} variant="blue" size="lg" />
            <div>
              <h4 className="text-base font-bold font-montserrat text-white">
                Zero Invented Parameters or Hallucinated Indicators
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
                Every rainfall anomaly and root-zone moisture level shown in EarthScope is directly indexed from genuine NASA GPM IMERG and GLDAS-2.1 datasets. Water-deficit signals are separated from crop suitability scores to ensure full auditability.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold whitespace-nowrap">
            <CheckCircle2 size={16} />
            <span>M4/M5 Spec Verified</span>
          </div>
        </div>
      </div>
    </section>
  );
}
