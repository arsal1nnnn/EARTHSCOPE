/**
 * DitherIcon — Icon badge styled with authentic Bayer dither matrix aesthetics
 * Matching the Figma colorway (#004FF4 -> #86A6D9) and retro-modern telemetry vibe.
 */
export default function DitherIcon({
  icon: Icon,
  children,
  size = "md",
  variant = "blue",
  className = "",
  title = "",
}) {
  const sizeMap = {
    sm: { box: 32, icon: 16, radius: 8 },
    md: { box: 44, icon: 22, radius: 10 },
    lg: { box: 56, icon: 28, radius: 12 },
    xl: { box: 72, icon: 36, radius: 16 },
  };

  const dim = sizeMap[size] || sizeMap.md;

  // Variant color palettes
  const variants = {
    blue: {
      bg: "linear-gradient(135deg, rgba(0, 79, 244, 0.22) 0%, rgba(134, 166, 217, 0.15) 100%)",
      border: "rgba(0, 79, 244, 0.45)",
      glow: "rgba(0, 79, 244, 0.25)",
      color: "#60a5fa",
      dot: "#004FF4",
    },
    cyan: {
      bg: "linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(134, 166, 217, 0.15) 100%)",
      border: "rgba(6, 182, 212, 0.45)",
      glow: "rgba(6, 182, 212, 0.25)",
      color: "#38bdf8",
      dot: "#06b6d4",
    },
    green: {
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(52, 211, 153, 0.12) 100%)",
      border: "rgba(16, 185, 129, 0.45)",
      glow: "rgba(16, 185, 129, 0.25)",
      color: "#34d399",
      dot: "#10b981",
    },
    amber: {
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(251, 191, 36, 0.12) 100%)",
      border: "rgba(245, 158, 11, 0.45)",
      glow: "rgba(245, 158, 11, 0.25)",
      color: "#fbbf24",
      dot: "#f59e0b",
    },
    purple: {
      bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(192, 132, 252, 0.12) 100%)",
      border: "rgba(139, 92, 246, 0.45)",
      glow: "rgba(139, 92, 246, 0.25)",
      color: "#c084fc",
      dot: "#8b5cf6",
    },
  };

  const current = variants[variant] || variants.blue;

  return (
    <div
      className={`dither-icon-box ${className}`}
      title={title}
      style={{
        position: "relative",
        width: `${dim.box}px`,
        height: `${dim.box}px`,
        borderRadius: `${dim.radius}px`,
        background: current.bg,
        border: `1px solid ${current.border}`,
        boxShadow: `0 4px 16px ${current.glow}, inset 0 0 12px ${current.glow}`,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Authentic Bayer 3px Dither Matrix Texture Overlay */}
      <div
        className="dither-pattern-layer"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          backgroundImage: `
            radial-gradient(${current.dot} 1px, transparent 1px),
            radial-gradient(#86A6D9 1px, transparent 1px)
          `,
          backgroundSize: "6px 6px, 12px 12px",
          backgroundPosition: "0 0, 3px 3px",
          pointerEvents: "none",
        }}
      />

      {/* Decorative Corner Pixel Nodes */}
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: "2px",
          width: "3px",
          height: "3px",
          background: current.dot,
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: "2px",
          right: "2px",
          width: "3px",
          height: "3px",
          background: "#86A6D9",
        }}
      />

      {/* Foreground Icon */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          color: current.color,
          display: "grid",
          placeItems: "center",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
        }}
      >
        {Icon ? <Icon size={dim.icon} strokeWidth={2.2} /> : children}
      </div>
    </div>
  );
}
