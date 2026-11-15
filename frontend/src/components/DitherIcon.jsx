/**
 * Quiet, craft-focused icon container for EarthScope.
 * Follows unslop guidelines:
 * - 16-18px icons with 1.5-1.75 stroke
 * - Muted/secondary text tones instead of neon glows
 * - Subtle surface step with quiet hairline border
 * - Zero artificial shadows or noisy dither patterns
 */
export default function DitherIcon({
  icon: Icon,
  children,
  size = "md",
  className = "",
  title = "",
}) {
  const sizeMap = {
    sm: { box: "w-8 h-8", icon: 16, radius: "rounded-lg" },
    md: { box: "w-10 h-10", icon: 18, radius: "rounded-lg" },
    lg: { box: "w-12 h-12", icon: 20, radius: "rounded-xl" },
    xl: { box: "w-14 h-14", icon: 24, radius: "rounded-xl" },
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${dim.box} ${dim.radius} bg-[#1a1e28] border border-white/[0.08] text-[#a3a9b8] ${className}`}
      title={title}
    >
      {Icon ? <Icon size={dim.icon} strokeWidth={1.75} /> : children}
    </div>
  );
}
