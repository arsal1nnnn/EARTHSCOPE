import { Satellite, ShieldCheck, ExternalLink, ArrowUp } from "lucide-react";
import DitherIcon from "./DitherIcon";

export default function ThemedFooter({ onScrollToTop }) {
  const scrollToTop = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#07080d] text-[#eef0f5] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <DitherIcon icon={Satellite} size="md" />
              <div>
                <span className="text-lg font-semibold font-montserrat tracking-wider uppercase text-[#eef0f5]">
                  EARTHSCOPE
                </span>
                <span className="block text-[11px] font-mono text-[#a3a9b8]">
                  NASA Earth observation • Goa agricultural intelligence
                </span>
              </div>
            </div>

            <p className="text-xs text-[#a3a9b8] leading-relaxed max-w-md">
              A scientific decision-support system transforming NASA GPM IMERG satellite precipitation and GLDAS-2.1 Noah land surface root-zone moisture into explainable, taluka-level water-stress evidence for Goa's agrarian ecosystem.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#7a8296]">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} />
                Strict data provenance
              </span>
              <span>•</span>
              <span>12 talukas indexed</span>
              <span>•</span>
              <span>9 documented varieties</span>
            </div>
          </div>

          {/* NASA Data Provenance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold font-montserrat uppercase tracking-wider text-[#a3a9b8]">
              NASA telemetry products
            </h4>
            <ul className="space-y-2 text-xs text-[#7a8296]">
              <li className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors">
                <ExternalLink size={12} className="text-[#a3a9b8]" />
                <span>GPM IMERG Final monthly v07 (~11 km)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors">
                <ExternalLink size={12} className="text-[#a3a9b8]" />
                <span>GLDAS-2.1 Noah Land Surface (~25 km)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors">
                <ExternalLink size={12} className="text-[#a3a9b8]" />
                <span>20-Year Baseline Anomaly (2000–2020)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors">
                <ExternalLink size={12} className="text-[#a3a9b8]" />
                <span>Two-Indicator Dryness Rule Matrix</span>
              </li>
            </ul>
          </div>

          {/* Institutional Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold font-montserrat uppercase tracking-wider text-[#a3a9b8]">
              Agronomic research
            </h4>
            <ul className="space-y-2 text-xs text-[#7a8296]">
              <li className="hover:text-[#eef0f5] transition-colors">
                ICAR-CCARI, Ela, Old Goa
              </li>
              <li className="hover:text-[#eef0f5] transition-colors">
                Krishi Vigyan Kendra (KVK) North & South Goa
              </li>
              <li className="hover:text-[#eef0f5] transition-colors">
                Goa Directorate of Agriculture
              </li>
              <li className="hover:text-[#eef0f5] transition-colors">
                India Meteorological Department (IMD) Panaji
              </li>
            </ul>
          </div>
        </div>

        {/* Scientific Limitations & Disclaimer Card */}
        <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08] mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <p className="text-xs text-[#a3a9b8] leading-relaxed">
                <strong className="text-[#eef0f5] font-medium">Scientific transparency notice:</strong> Satellite products have inherent spatial (~11–25 km) and temporal resolutions. Kharif 2025 had exceptional soil moisture (100th percentile baseline) and May rains 6–7x normal; hence indicators rigorously evaluate <span className="text-[#eef0f5] font-medium">water-deficit signals</span> rather than generic "low risk" to avoid misrepresenting flood-prone Kher and Khazan lowlands.
              </p>
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1e28] hover:bg-[#232836] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] font-mono text-xs cursor-pointer transition-colors shrink-0"
              title="Return to top"
            >
              <span>TOP</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#7a8296]">
          <div>
            © {new Date().getFullYear()} EarthScope • Prototype stage • NASA Space Apps Challenge
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>GPM IMERG v07 & GLDAS-2.1 Noah</span>
            <span>•</span>
            <span>ICAR-CCARI Varietal Records</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
