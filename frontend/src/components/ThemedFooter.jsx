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
            <ul className="space-y-2.5 text-xs text-[#7a8296]">
              <li>
                <a
                  href="https://gpm.nasa.gov/data/imerg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors group cursor-pointer"
                  title="NASA GPM IMERG Data Portal"
                >
                  <ExternalLink size={12} className="text-[#a3a9b8] group-hover:text-[#eef0f5] transition-colors shrink-0" />
                  <span>GPM IMERG Final monthly v07 (~11 km)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ldas.gsfc.nasa.gov/gldas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors group cursor-pointer"
                  title="NASA GLDAS Land Surface Model"
                >
                  <ExternalLink size={12} className="text-[#a3a9b8] group-hover:text-[#eef0f5] transition-colors shrink-0" />
                  <span>GLDAS-2.1 Noah Land Surface (~25 km)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://giovanni.gsfc.nasa.gov/giovanni/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors group cursor-pointer"
                  title="NASA GES DISC Giovanni Data Portal"
                >
                  <ExternalLink size={12} className="text-[#a3a9b8] group-hover:text-[#eef0f5] transition-colors shrink-0" />
                  <span>20-Year Baseline Anomaly (2000–2020)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://droughtmonitor.unl.edu/About/AbouttheData/DroughtClassification.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#eef0f5] transition-colors group cursor-pointer"
                  title="USDM / ECONet Two-Indicator Dryness Classification Matrix"
                >
                  <ExternalLink size={12} className="text-[#a3a9b8] group-hover:text-[#eef0f5] transition-colors shrink-0" />
                  <span>Two-Indicator Dryness Rule Matrix</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Institutional Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold font-montserrat uppercase tracking-wider text-[#a3a9b8]">
              Agronomic research
            </h4>
            <ul className="space-y-2.5 text-xs text-[#7a8296]">
              <li>
                <a
                  href="https://ccari.icar.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#eef0f5] hover:underline underline-offset-2 transition-colors cursor-pointer block"
                  title="ICAR Central Coastal Agricultural Research Institute"
                >
                  ICAR-CCARI, Ela, Old Goa
                </a>
              </li>
              <li>
                <a
                  href="https://kvknorthgoa.icar.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#eef0f5] hover:underline underline-offset-2 transition-colors cursor-pointer block"
                  title="Krishi Vigyan Kendra Goa"
                >
                  Krishi Vigyan Kendra (KVK) North &amp; South Goa
                </a>
              </li>
              <li>
                <a
                  href="https://agri.goa.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#eef0f5] hover:underline underline-offset-2 transition-colors cursor-pointer block"
                  title="Directorate of Agriculture, Government of Goa"
                >
                  Goa Directorate of Agriculture
                </a>
              </li>
              <li>
                <a
                  href="https://mausam.imd.gov.in/panaji/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#eef0f5] hover:underline underline-offset-2 transition-colors cursor-pointer block"
                  title="India Meteorological Department Panaji Observatory"
                >
                  India Meteorological Department (IMD) Panaji
                </a>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1e28] hover:bg-[#232836] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] font-mono text-xs cursor-pointer transition-colors shrink-0 active:scale-95"
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
            <a
              href="https://gpm.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#eef0f5] hover:underline underline-offset-2 transition-colors cursor-pointer"
            >
              GPM IMERG v07 &amp; GLDAS-2.1 Noah
            </a>
            <span>•</span>
            <a
              href="https://ccari.icar.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#eef0f5] hover:underline underline-offset-2 transition-colors cursor-pointer"
            >
              ICAR-CCARI Varietal Records
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
