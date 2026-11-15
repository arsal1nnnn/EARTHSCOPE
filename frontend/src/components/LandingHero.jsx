import { useState } from "react";
import { ArrowUpRight, Sliders, ChevronDown, CheckCircle2, ShieldCheck, Waves } from "lucide-react";
import DitherCanvas from "./DitherCanvas";
import ditherSettingsImg from "../assets/dither_settings.png";

/**
 * LandingHero — Replicates the Figma design (Dashboard.png)
 * - Typography: Montserrat Bold
 * - Colors: #004FF4 at top to #86A6D9 at bottom
 * - Dither: Bayer 16x16, Size 3, Levels 4, Brightness 100%, Contrast 1, Mono off
 * - Right-aligned copy & pill CTA button
 */
export default function LandingHero({ onOpenDashboard }) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleScrollToDashboard = () => {
    if (onOpenDashboard) {
      onOpenDashboard();
    }
    const target = document.getElementById("stress-dashboard");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-landing-section relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
      {/* 1. Dithered Canvas & Backdrop Engine */}
      <DitherCanvas
        size={3}
        levels={4}
        brightness={1.0}
        contrast={1.0}
        gradientTop="#004FF4"
        gradientBottom="#86A6D9"
      />

      {/* Subtle Vignette & Grain Overlay for cinematic contrast */}
      <div
        className="pointer-events-none absolute inset-0 z-1"
        style={{
          background:
            "radial-gradient(ellipse at 80% 30%, rgba(0, 0, 0, 0) 35%, rgba(6, 12, 26, 0.45) 100%)",
        }}
      />

      {/* 2. Top Header Bar (Figma replica) */}
      <header className="relative z-10 w-full px-8 md:px-16 py-8 flex items-center justify-between">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <span
            className="text-white text-xl md:text-2xl font-black tracking-wider uppercase font-montserrat"
            style={{ letterSpacing: "2.5px" }}
          >
            EARTHSCOPE
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-blue-200 bg-blue-900/60 border border-blue-400/30 rounded">
            Kharif 2025
          </span>
        </div>

        {/* Provenance Tag Right */}
        <div className="flex items-center gap-4">
          <span
            className="text-white/95 text-[11px] md:text-[13px] font-bold uppercase tracking-widest font-montserrat text-right"
            style={{ letterSpacing: "1.8px" }}
          >
            NASA EARTH OBSERVATION <span className="text-blue-300 mx-1">•</span> GOA AGRICULTURAL INTELLIGENCE
          </span>

          {/* Dither Settings Inspection Toggle */}
          <button
            onClick={() => setShowSettingsModal(true)}
            title="Inspect Bayer 16x16 Dither Parameters"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono text-white/90 bg-black/40 hover:bg-black/60 border border-white/25 hover:border-white/50 rounded-full transition-all duration-200 backdrop-blur-sm cursor-pointer"
          >
            <Sliders size={13} className="text-blue-300" />
            <span>Dither: Bayer 16x16</span>
          </button>
        </div>
      </header>

      {/* 3. Hero Copy & CTA Button (Right Aligned per Figma design) */}
      <div className="relative z-10 w-full px-8 md:px-16 py-12 md:py-20 flex flex-col items-end my-auto">
        <div className="max-w-[840px] text-right">
          {/* Main Headline in Montserrat Bold */}
          <h1
            className="hero-headline text-white font-extrabold font-montserrat text-right leading-[1.14] tracking-[-0.015em]"
            style={{
              fontSize: "clamp(2rem, 3.8vw, 3.35rem)",
              textShadow: "0 4px 24px rgba(0, 0, 0, 0.45)",
            }}
          >
            Turning NASA Earth-observation data into<br className="hidden sm:inline" />
            explainable agricultural water-stress<br className="hidden sm:inline" />
            intelligence across Goa.
          </h1>

          {/* CTA Button Aligned Right with Icon */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleScrollToDashboard}
              className="hero-cta-btn group inline-flex items-center gap-4 px-7 py-3.5 rounded-full text-white font-montserrat font-bold text-[15px] md:text-[16px] tracking-wide transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/50"
              style={{
                backgroundColor: "#004FF4",
                boxShadow: "0 8px 30px rgba(0, 79, 244, 0.48), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
              }}
            >
              <span>Open Stress Dashboard</span>
              <span
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#004FF4] shadow-sm transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
              >
                <ArrowUpRight size={19} strokeWidth={2.8} />
              </span>
            </button>
          </div>

          {/* Real Telemetry Micro-Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 text-[11px] font-mono text-white/80">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/15">
              <ShieldCheck size={13} className="text-emerald-400" />
              12 Talukas Analyzed
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/15">
              <Waves size={13} className="text-blue-300" />
              GPM IMERG v07 & GLDAS-2.1
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/15">
              <CheckCircle2 size={13} className="text-amber-300" />
              Zero Invented Values
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Scroll Indicator */}
      <div className="relative z-10 w-full px-8 pb-8 flex items-center justify-between text-white/70 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Kharif 2025 Seasonal Telemetry Grounded</span>
        </div>

        <button
          onClick={handleScrollToDashboard}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-[10px] tracking-widest uppercase">Explore Evidence</span>
          <ChevronDown size={16} className="animate-bounce" />
        </button>

        <div className="text-right hidden md:block">
          <span>Goa Administrative Boundary Model</span>
        </div>
      </div>

      {/* Modal: Figma Dither Plugin Parameters Spec Sheet */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-[#121c2c] border border-blue-500/40 rounded-xl p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#004FF4]" />
                <h3 className="font-montserrat font-bold text-lg">Figma Dither Spec</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-white/60 hover:text-white px-2 py-1 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Style:</span>
                <span className="font-bold text-emerald-400">Bayer 16×16</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Size:</span>
                <span className="font-bold text-blue-300">3 (3px dither cell)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Levels:</span>
                <span className="font-bold text-blue-300">4 (0, 85, 170, 255)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Brightness:</span>
                <span className="font-bold">100%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Contrast:</span>
                <span className="font-bold">1.0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Mono:</span>
                <span className="font-bold text-amber-300">Off (Full Color Channels)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Gradient Top:</span>
                <span className="font-bold text-[#004FF4]">#004FF4</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Gradient Bottom:</span>
                <span className="font-bold text-[#86A6D9]">#86A6D9</span>
              </div>
            </div>

            {/* Plugin screenshot preview */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
              <img
                src={ditherSettingsImg}
                alt="Figma Settings Reference"
                className="w-16 h-16 object-cover rounded border border-white/20"
              />
              <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                Rendered with an algorithmic Bayer 16×16 threshold shader running in real-time HTML5 Canvas.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
