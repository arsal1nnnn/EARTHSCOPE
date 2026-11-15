import { Waves, Mountain, LandPlot, Sprout, Check } from "lucide-react";
import DitherIcon from "./DitherIcon";

export default function AgroEcologyShowcase() {
  const ecologies = [
    {
      id: "khazan",
      name: "Khazan lands",
      tagline: "Coastal saline lowlands",
      area: "~18,000 ha",
      topography: "Estuarine lowlands below high-tide level",
      threat: "Tidal inundation & saline water intrusion through sluice gates",
      icon: Waves,
      keyVarieties: [
        { name: "Goa Dhan 1 & 2", desc: "ICAR saline-tolerant selections" },
        { name: "Goa Dhan 3 & 4", desc: "Submergence & high salinity tolerance" },
        { name: "CSR-27 & CSR-36", desc: "National salt-tolerant cultivars" },
      ],
      nasaRelevance:
        "Heavy early monsoon rains flush accumulated salts; mid-season dry spells allow saline intrusion. GPM rainfall anomalies track freshening cycles.",
    },
    {
      id: "kher",
      name: "Kher lands",
      tagline: "Rainfed shallow lowlands",
      area: "Major paddy acreage",
      topography: "Mid-elevation flat riverine plains and valleys",
      threat: "Waterlogging during peak monsoons; moisture deficit during flowering",
      icon: LandPlot,
      keyVarieties: [
        { name: "Karjat-3", desc: "Medium duration, high tillering" },
        { name: "Naveen", desc: "Widely adapted medium-slender grain" },
      ],
      nasaRelevance:
        "High soil moisture baseline requires distinguishing true root-zone water deficit from surface water ponding using GLDAS-2.1 Noah model data.",
    },
    {
      id: "morod",
      name: "Morod lands",
      tagline: "Rainfed terraced uplands",
      area: "Upper slopes & plateaus",
      topography: "Undulating lateritic terrain with rapid drainage",
      threat: "Acute drought sensitivity during dry spells exceeding 7 days",
      icon: Mountain,
      keyVarieties: [
        { name: "Annada", desc: "105-day short duration, drought hardy" },
      ],
      nasaRelevance:
        "Porous laterite soils retain minimal moisture. GLDAS-2.1 root-zone moisture drops trigger early warning for upland farmers.",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-16 bg-[#07080d] text-[#eef0f5] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#11141c] border border-white/[0.08] text-[#a3a9b8] text-xs font-mono mb-3">
            <Sprout size={13} className="text-[#a3a9b8]" />
            <span>Goa agricultural topography</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold font-montserrat text-[#eef0f5] tracking-tight">
            Tailoring Satellite Insights to Goa's Three Agro-Ecologies
          </h2>
          <p className="mt-2 text-sm text-[#a3a9b8] leading-relaxed">
            A single rain gauge or uniform drought metric cannot capture Goa's complex coastal-estuarine landscape. EarthScope categorizes every taluka across its real agronomic land types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ecologies.map((eco) => (
            <div
              key={eco.id}
              className="rounded-xl bg-[#11141c] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.18] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <DitherIcon icon={eco.icon} size="md" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1a1e28] text-[#a3a9b8] border border-white/[0.06]">
                    {eco.area}
                  </span>
                </div>

                <h3 className="text-lg font-semibold font-montserrat text-[#eef0f5]">
                  {eco.name}
                </h3>
                <p className="text-xs text-[#a3a9b8] mt-0.5 mb-4">
                  {eco.tagline}
                </p>

                <div className="space-y-3 py-3 border-y border-white/[0.06] text-xs text-[#a3a9b8]">
                  <div>
                    <span className="text-[11px] text-[#7a8296] block">
                      Topography & hydrology
                    </span>
                    <p className="mt-0.5 text-[#eef0f5]">{eco.topography}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#7a8296] block">
                      Primary risk factor
                    </span>
                    <p className="mt-0.5 text-amber-300/90">{eco.threat}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] text-[#7a8296] block mb-2">
                    Documented ICAR varieties
                  </span>
                  <div className="space-y-1.5">
                    {eco.keyVarieties.map((v) => (
                      <div
                        key={v.name}
                        className="flex items-center gap-2 text-xs text-[#eef0f5]"
                      >
                        <Check size={13} className="text-emerald-400 shrink-0" />
                        <span className="font-medium">{v.name}</span>
                        <span className="text-[#7a8296] text-[11px]">({v.desc})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <span className="text-[11px] font-mono text-[#a3a9b8] block mb-1">
                  NASA telemetry focus
                </span>
                <p className="text-xs text-[#7a8296] leading-relaxed">
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
