import { ArrowUpRight } from "lucide-react";
import DitherCanvas from "./DitherCanvas";

/**
 * LandingHero — Replicates the Figma design (Dashboard.png)
 * - Typography: Pure Montserrat Bold
 * - Tagline: Exactly 4 lines, 100% white text, zero drop shadows
 * - CTA Button: Flat vibrant blue (#004FF4), zero drop shadows
 * - Background: Lowered landscape photo with seamless feathered sky & softened Bayer 16x16 dithering
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
      {/* 1. Dithered Canvas & Lowered Backdrop Engine (Zero Seams) */}
      <DitherCanvas
        size={2}
        levels={4}
        ditherStrength={0.58}
        brightness={1.0}
        contrast={1.0}
        gradientTop="#004FF4"
        gradientBottom="#86A6D9"
      />

      {/* 2. Top Header Bar (Exact Figma layout) */}
      <header className="relative z-10 w-full px-8 md:px-16 py-8 flex items-center justify-between">
        {/* Brand Left */}
        <span
          className="text-white text-xl md:text-2xl font-black tracking-wider uppercase font-montserrat select-none"
          style={{
            fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
            letterSpacing: "2.5px",
            color: "#ffffff",
          }}
        >
          EARTHSCOPE
        </span>

        {/* Provenance Tag Right */}
        <span
          className="text-white text-[11px] md:text-[13px] font-bold uppercase tracking-widest font-montserrat text-right select-none"
          style={{
            fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
            letterSpacing: "1.8px",
            color: "#ffffff",
          }}
        >
          NASA EARTH OBSERVATION <span className="text-blue-300 mx-1">•</span> GOA AGRICULTURAL INTELLIGENCE
        </span>
      </header>

      {/* 3. Hero Copy & CTA Button (Right Aligned — Exactly 4 Lines — 100% White — Zero Drop Shadows) */}
      <div className="relative z-10 w-full px-8 md:px-16 py-12 md:py-24 flex flex-col items-end my-auto">
        <div className="max-w-[840px] text-right">
          {/* Main Headline in Montserrat Bold — Exactly 4 Lines — Zero Drop Shadow */}
          <h1
            className="hero-headline font-montserrat text-right tracking-tight select-none"
            style={{
              fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
              fontSize: "clamp(2rem, 3.4vw, 3.25rem)",
              fontWeight: 800,
              lineHeight: 1.18,
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              textShadow: "none",
              filter: "none",
              hyphens: "none",
            }}
          >
            Turning NASA Earth&#8209;observation<br />
            data into explainable<br />
            agricultural water&#8209;stress<br />
            intelligence across Goa.
          </h1>

          {/* CTA Button Aligned Right — Flat Pill, Zero Drop Shadow */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleScrollToDashboard}
              className="hero-cta-btn group inline-flex items-center gap-4 px-7 py-3.5 rounded-full text-white font-montserrat font-bold text-[15px] md:text-[16px] tracking-wide transition-all duration-200 cursor-pointer"
              style={{
                fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
                backgroundColor: "#004FF4",
                boxShadow: "none",
                filter: "none",
              }}
            >
              <span>Open Stress Dashboard</span>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#004FF4] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
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
