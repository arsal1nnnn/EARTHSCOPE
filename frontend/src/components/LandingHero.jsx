import { ArrowUpRight } from "lucide-react";
import DitherCanvas from "./DitherCanvas";

/**
 * LandingHero — Replicates the Figma design (Dashboard.png)
 * Clean, uncluttered, and precise:
 * - Top-left: EARTHSCOPE
 * - Top-right: NASA EARTH OBSERVATION • GOA AGRICULTURAL INTELLIGENCE
 * - Upper-right: 4-line tagline in Montserrat Bold, right-aligned
 * - Pill CTA: Open Stress Dashboard ➔
 * - Softened Bayer 16x16 dithering on landscape background
 */
export default function LandingHero({ onOpenDashboard }) {
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
      {/* 1. Dithered Canvas & Backdrop Engine (Softened Bayer 16x16) */}
      <DitherCanvas
        size={2}
        levels={4}
        ditherStrength={0.62}
        brightness={1.0}
        contrast={1.0}
        gradientTop="#004FF4"
        gradientBottom="#86A6D9"
      />

      {/* Subtle Gradient Shadow for Crisp Typography Contrast */}
      <div
        className="pointer-events-none absolute inset-0 z-1"
        style={{
          background:
            "radial-gradient(ellipse at 85% 35%, rgba(0, 0, 0, 0.15) 20%, rgba(6, 12, 26, 0.35) 100%)",
        }}
      />

      {/* 2. Top Header Bar (Exact Figma layout) */}
      <header className="relative z-10 w-full px-8 md:px-16 py-8 flex items-center justify-between">
        {/* Brand Left */}
        <span
          className="text-white text-xl md:text-2xl font-black tracking-wider uppercase font-montserrat"
          style={{ letterSpacing: "2.5px" }}
        >
          EARTHSCOPE
        </span>

        {/* Provenance Tag Right */}
        <span
          className="text-white text-[11px] md:text-[13px] font-bold uppercase tracking-widest font-montserrat text-right"
          style={{ letterSpacing: "1.8px" }}
        >
          NASA EARTH OBSERVATION <span className="text-blue-300 mx-1">•</span> GOA AGRICULTURAL INTELLIGENCE
        </span>
      </header>

      {/* 3. Hero Copy & CTA Button (Right Aligned — Exactly 4 Lines) */}
      <div className="relative z-10 w-full px-8 md:px-16 py-12 md:py-24 flex flex-col items-end my-auto">
        <div className="max-w-[840px] text-right">
          {/* Main Headline in Montserrat Bold — Exactly 4 Lines */}
          <h1
            className="hero-headline text-white font-extrabold font-montserrat text-right tracking-tight select-none"
            style={{
              fontSize: "clamp(2rem, 3.4vw, 3.25rem)",
              lineHeight: 1.18,
              textShadow: "0 3px 20px rgba(0, 0, 0, 0.45)",
              hyphens: "none",
            }}
          >
            Turning NASA <span className="whitespace-nowrap">Earth-observation</span><br />
            data into explainable<br />
            agricultural <span className="whitespace-nowrap">water-stress</span><br />
            intelligence across Goa.
          </h1>

          {/* CTA Button Aligned Right */}
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
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#004FF4] shadow-sm transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight size={19} strokeWidth={2.8} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Space (Clean and uncluttered to showcase water reflection) */}
      <div className="relative z-10 w-full px-8 md:px-16 pb-6 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-1 rounded-full bg-white/20" />
      </div>
    </section>
  );
}
