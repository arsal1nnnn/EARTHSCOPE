import { Waves, Mountain, LandPlot, Sprout, Check } from "lucide-react";
import DitherIcon from "./DitherIcon";

export default function AgroEcologyShowcase() {
  const ecologies = [
    {
      id: "khazan",
      name: "Khazan Lands",
      tagline: "Coastal Saline Lowlands",
      area: "~18,000 ha",
      topography: "Estuarine lowlands below high-tide level",
      threat: "Tidal inundation & saline water intrusion through sluice gates",
      icon: Waves,
      variant: "blue",
      keyVarieties: [
        { name: "Goa Dhan 1 & 2", desc: "ICAR saline-tolerant selections" },
        { name: "Goa Dhan 3 & 4", desc: "Submergence + high salinity tolerance" },
        { name: "CSR-27 & CSR-36", desc: "National salt-tolerant cultivars" },
      ],
      nasaRelevance:
        "Excessive early rainfall flushes salt; mid-season dry spells allow saline intrusion. GPM rainfall anomalies track freshening cycles.",
    },
    {
      id: "kher",
      name: "Kher Lands",
      tagline: "Rainfed Shallow Lowlands",
      area: "Major paddy acreage",
      topography: "Mid-elevation flat riverine plains and valleys",
      threat: "Prolonged waterlogging during monsoons; dry spells at anthesis",
      icon: LandPlot,
      variant: "green",
      keyVarieties: [
        { name: "Karjat-3", desc: "Medium duration, high tillering" },
        { name: "Naveen", desc: "Widely adapted medium-slender grain" },
      ],
      nasaRelevance:
        "High soil moisture baseline requires distinguishing true agricultural water deficit from surface ponding using GLDAS-2.1 root-zone data.",
    },
    {
      id: "morod",
      name: "Morod Lands",
      tagline: "Rainfed Terraced Uplands",
      area: "Upper slopes & plateaus",
      topography: "Steep or undulating lateritic terrain with rapid drainage",
      threat: "Acute drought sensitivity during dry spells > 7 consecutive days",
      icon: Mountain,
      variant: "amber",
      keyVarieties: [
        { name: "Annada", desc: "105-day short duration, drought hardy" },
      ],
      nasaRelevance:
        "Porous laterite soils retain minimal moisture. GLDAS-2.1 Noah 0-100cm moisture drops trigger early warning for Morod farmers.",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-16 bg-[#0a1322] text-white border-t border-[#1b2b40]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono uppercase mb-4">
            <Sprout size={14} />
            Goa Agricultural Topography
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-montserrat text-white tracking-tight">
            Tailoring Satellite Insights to Goa's Three Agro-Ecologies
          </h2>
          <p className="mt-4 text-sm text-slate-300 font-sans leading-relaxed">
            A single rain gauge or uniform drought metric cannot capture Goa's complex coastal-estuarine landscape. EarthScope categorizes every taluka across its real agronomic land types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ecologies.map((eco) => (
            <div
              key={eco.id}
              className="relative rounded-2xl bg-[#0f1b2e] border border-[#223552] p-7 flex flex-col justify-between hover:border-blue-400/50 transition-all duration-300 group"
            >
              {/* Dither pattern background hint */}
              <div
                className="absolute inset-0 rounded-2xl opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#004FF4 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />

              <div className="relative z-1">
                <div className="flex items-center justify-between mb-5">
                  <DitherIcon icon={eco.icon} variant={eco.variant} size="lg" />
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {eco.area}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-montserrat text-white group-hover:text-blue-300 transition-colors">
                  {eco.name}
                </h3>
                <p className="text-xs font-mono text-blue-400 mt-1 mb-4 uppercase">
                  {eco.tagline}
                </p>

                <div className="space-y-3 py-3 border-y border-white/10 text-xs text-slate-300 font-sans">
                  <div>
                    <span className="text-slate-400 font-mono block text-[10px] uppercase">
                      Topography & Hydrology
                    </span>
                    <p className="mt-0.5">{eco.topography}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block text-[10px] uppercase">
                      Primary Risk Factor
                    </span>
                    <p className="mt-0.5 text-amber-200/90">{eco.threat}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
                    Documented ICAR Varieties
                  </span>
                  <div className="space-y-1.5">
                    {eco.keyVarieties.map((v) => (
                      <div
                        key={v.name}
                        className="flex items-center gap-2 text-xs text-slate-200"
                      >
                        <Check size={13} className="text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white">{v.name}</span>
                        <span className="text-slate-400 text-[11px]">({v.desc})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-1 mt-6 pt-4 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase text-blue-300 block mb-1">
                  NASA Telemetry Focus
                </span>
                <p className="text-[11px] text-slate-400 italic font-sans leading-relaxed">
                  {eco.nasaRelevance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
