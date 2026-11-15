import { Satellite, Droplets, Sprout, Layers } from "lucide-react";
import DitherIcon from "./DitherIcon";

export default function ProjectOverview() {
  const telemetryFeatures = [
    {
      title: "NASA GPM IMERG Final v07",
      badge: "Precipitation",
      icon: Satellite,
      stat: "~11 km",
      statLabel: "Spatial resolution",
      description:
        "Global Precipitation Measurement calibrated multi-satellite product. Evaluated against a 20-year baseline (2000–2020) to detect monthly rainfall deficits across all 12 Goa talukas.",
      provenance: "NASA GSFC / GES DISC",
    },
    {
      title: "GLDAS-2.1 Noah Land Surface",
      badge: "Root-zone moisture",
      icon: Droplets,
      stat: "0–100 cm",
      statLabel: "Root-zone profile",
      description:
        "Land surface model driven by observed meteorological forcing. Measures simulated moisture stored in the crop root zone, separating true soil deficit from surface runoff.",
      provenance: "NASA Hydrological Sciences",
    },
    {
      title: "ICAR-CCARI Variety Catalogue",
      badge: "Agronomic catalogue",
      icon: Sprout,
      stat: "9 varieties",
      statLabel: "Verified cultivars",
      description:
        "Documented Goan rice cultivars (Goa Dhan 1–4, CSR-27, CSR-36, Karjat-3, Naveen, Annada) screened across coastal saline, rainfed lowland, and upland laterite soils.",
      provenance: "ICAR-CCARI Old Goa",
    },
    {
      title: "Two-Indicator Deficit Signal",
      badge: "Decision rule",
      icon: Layers,
      stat: "Low / Mod / High",
      statLabel: "Dryness signal",
      description:
        "Evaluates rainfall and soil moisture independently. Avoids misleading 'low risk' labels during high-rainfall seasons like Kharif 2025 where lowlands face waterlogging rather than drought.",
      provenance: "Transparent rule matrix",
    },
  ];

  return (
    <section id="project-overview" className="w-full py-20 px-6 md:px-16 bg-[#0b0d14] text-[#eef0f5] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#004FF4]" />
              <span className="text-xs font-mono text-[#a3a9b8]">
                Scientific architecture & provenance
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold font-montserrat tracking-tight text-[#eef0f5]">
              Grounding Agricultural Decisions in Real NASA Telemetry
            </h2>
          </div>
          <p className="max-w-xl text-sm text-[#a3a9b8] leading-relaxed">
            EarthScope couples NASA satellite remote sensing with the GLDAS land-surface model and ICAR-CCARI varietal records to provide explainable water-deficit intelligence across Goa.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {telemetryFeatures.map((feat) => (
            <div
              key={feat.title}
              className="p-6 rounded-xl bg-[#11141c] border border-white/[0.08] hover:border-white/[0.18] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <DitherIcon icon={feat.icon} size="md" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1a1e28] text-[#a3a9b8] border border-white/[0.06]">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base font-semibold font-montserrat text-[#eef0f5] mb-2">
                  {feat.title}
                </h3>

                <p className="text-xs text-[#a3a9b8] leading-relaxed mb-6">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="block text-[11px] text-[#7a8296]">
                    {feat.statLabel}
                  </span>
                  <span className="font-mono font-medium text-[#eef0f5] tabular-nums">
                    {feat.stat}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#7a8296] text-right truncate max-w-[120px]">
                  {feat.provenance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
