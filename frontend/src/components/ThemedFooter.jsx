import { Globe, Satellite, Sprout, ShieldCheck, ExternalLink, ArrowUp } from "lucide-react";
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
    <footer className="w-full bg-[#050a12] text-white border-t border-[#16253a] relative overflow-hidden">
      {/* Authentic Bayer Matrix Dither Top Border Strip */}
      <div
        className="w-full h-2 opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(#004FF4 1.5px, transparent 1.5px),
            radial-gradient(#86A6D9 1.5px, transparent 1.5px)
          `,
          backgroundSize: "6px 6px, 12px 12px",
          backgroundPosition: "0 0, 3px 3px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <DitherIcon icon={Satellite} variant="blue" size="md" />
              <div>
                <span className="text-xl font-black font-montserrat tracking-wider uppercase text-white">
                  EARTHSCOPE
                </span>
                <span className="block text-[10px] font-mono tracking-widest text-blue-400 uppercase">
                  NASA Earth Observation • Goa Agricultural Intelligence
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-md">
              A scientific decision-support system transforming NASA GPM IMERG satellite precipitation and GLDAS-2.1 Noah land surface root-zone moisture into explainable, taluka-level water-stress evidence for Goa's agrarian ecosystem.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} />
                Strict Data Provenance
              </span>
              <span>•</span>
              <span>12 Talukas Indexed</span>
              <span>•</span>
              <span>9 Documented Varieties</span>
            </div>
          </div>

          {/* NASA Data Provenance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-montserrat uppercase tracking-wider text-slate-300">
              NASA Telemetry Products
            </h4>
            <ul className="space-y-2 text-xs font-sans text-slate-400">
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink size={12} className="text-blue-400" />
                <span>GPM IMERG Final monthly v07 (~11 km)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink size={12} className="text-cyan-400" />
                <span>GLDAS-2.1 Noah Land Surface (~25 km)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink size={12} className="text-indigo-400" />
                <span>20-Year Baseline Anomaly (2000–2020)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink size={12} className="text-amber-400" />
                <span>Two-Indicator Dryness Rule Matrix</span>
              </li>
            </ul>
          </div>

          {/* Institutional Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-montserrat uppercase tracking-wider text-slate-300">
              Agronomic Research
            </h4>
            <ul className="space-y-2 text-xs font-sans text-slate-400">
              <li className="hover:text-white transition-colors">
                ICAR-CCARI, Ela, Old Goa
              </li>
              <li className="hover:text-white transition-colors">
                Krishi Vigyan Kendra (KVK) North & South Goa
              </li>
              <li className="hover:text-white transition-colors">
                Goa Directorate of Agriculture
              </li>
              <li className="hover:text-white transition-colors">
                India Meteorological Department (IMD) Panaji
              </li>
            </ul>
          </div>
        </div>

        {/* Scientific Limitations & Disclaimer Card */}
        <div className="p-5 rounded-xl bg-[#09111e] border border-[#1b2b40] mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                <strong className="text-slate-200">Scientific Transparency Notice:</strong> Satellite products have inherent spatial (~11–25 km) and temporal resolutions. Kharif 2025 had exceptional soil moisture (100th percentile baseline) and May rains 6–7x normal; hence indicators rigorously evaluate <span className="text-blue-300 font-semibold">water-deficit signals</span> rather than generic "low risk" to avoid misrepresenting flood-prone Kher and Khazan lowlands.
              </p>
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs cursor-pointer transition-colors shrink-0"
              title="Return to top"
            >
              <span>TOP</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#16253a] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} EARTHSCOPE • PROTOTYPE STAGE • NASA SPACE APPS CHALLENGE
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">STYLE: BAYER 16×16 • SIZE 3 • LEVELS 4</span>
            <span className="text-blue-400">GRADIENT: #004FF4 → #86A6D9</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
