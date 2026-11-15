import { useEffect, useRef, useState } from "react";
import defaultLandscape from "../assets/goa_landscape.jpg";

// Generate 16x16 Bayer matrix threshold values [-0.5, 0.5]
function createBayer16Thresholds() {
  const bayer2 = [
    [0, 2],
    [3, 1],
  ];

  function expand(m) {
    const size = m.length;
    const next = Array.from({ length: size * 2 }, () => new Float32Array(size * 2));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const v = m[r][c] * 4;
        next[r][c] = v;
        next[r][c + size] = v + 2;
        next[r + size][c] = v + 3;
        next[r + size][c + size] = v + 1;
      }
    }
    return next;
  }

  const bayer4 = expand(bayer2);
  const bayer8 = expand(bayer4);
  const bayer16 = expand(bayer8);

  const flat = new Float32Array(256);
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      flat[r * 16 + c] = (bayer16[r][c] + 0.5) / 256 - 0.5;
    }
  }
  return flat;
}

const BAYER_16_THRESHOLDS = createBayer16Thresholds();

/**
 * High-performance Bayer 16x16 Dither Canvas component
 * - Lowered background image so palm tree tops align at y = 355px (matching Figma Dashboard.png)
 * - Refined dither effect: fine 2px cells, softened blend (0.60 strength)
 * - Gradient overlay: #004FF4 at top to #86A6D9 at mid-sky
 */
export default function DitherCanvas({
  imageSrc = defaultLandscape,
  size = 2,
  levels = 4,
  brightness = 1.0,
  contrast = 1.0,
  ditherStrength = 0.60,
  gradientTop = "#004FF4",
  gradientBottom = "#86A6D9",
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      if (isCancelled) return;

      const targetWidth = 1920;
      const targetHeight = 1080;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // 1. Fill base with sky gradient from #004FF4 to #86A6D9
      const skyGrad = ctx.createLinearGradient(0, 0, 0, targetHeight * 0.55);
      skyGrad.addColorStop(0, "#004FF4");
      skyGrad.addColorStop(0.55, "#86A6D9");
      skyGrad.addColorStop(1, "#86A6D9");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // 2. Lower the landscape photo so palm tree tops start at y ≈ 355px (matching Figma Dashboard.png)
      // Original image is 800x556. Scaling to cover width = 1920x1334.4px
      const scale = targetWidth / img.width;
      const scaledHeight = img.height * scale;
      const offsetY = 125; // Lowers image down, giving tall clear blue sky above
      ctx.drawImage(img, 0, offsetY, targetWidth, scaledHeight);

      // 3. Apply smooth linear gradient overlay on top: #004FF4 -> #86A6D9
      const grad = ctx.createLinearGradient(0, 0, 0, targetHeight * 0.54);
      grad.addColorStop(0, "rgba(0, 79, 244, 0.74)");        // #004FF4 at top
      grad.addColorStop(0.55, "rgba(134, 166, 217, 0.44)");   // #86A6D9 mid-sky
      grad.addColorStop(1, "rgba(134, 166, 217, 0.0)");      // feather into horizon

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // 4. Extract pixel buffer for Bayer 16x16 dithering
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;
      const step = 255 / (levels - 1); // 85 for 4 levels
      const bayer = BAYER_16_THRESHOLDS;
      const ditherSize = Math.max(1, Math.round(size));
      const str = Math.min(1.0, Math.max(0.0, ditherStrength));
      const invStr = 1.0 - str;

      // Fast loop through all pixels with softened dither strength
      for (let y = 0; y < targetHeight; y++) {
        const cellY = Math.floor(y / ditherSize) & 15;
        const rowOffset = y * targetWidth;

        for (let x = 0; x < targetWidth; x++) {
          const cellX = Math.floor(x / ditherSize) & 15;
          const threshold = bayer[cellY * 16 + cellX];
          const idx = (rowOffset + x) * 4;

          // Red channel
          let r = data[idx];
          if (contrast !== 1.0) r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
          if (brightness !== 1.0) r *= brightness;
          const rQuant = Math.round((r + threshold * step) / step) * step;
          const rClamped = rQuant < 0 ? 0 : rQuant > 255 ? 255 : rQuant;
          data[idx] = Math.round(r * invStr + rClamped * str);

          // Green channel
          let g = data[idx + 1];
          if (contrast !== 1.0) g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
          if (brightness !== 1.0) g *= brightness;
          const gQuant = Math.round((g + threshold * step) / step) * step;
          const gClamped = gQuant < 0 ? 0 : gQuant > 255 ? 255 : gQuant;
          data[idx + 1] = Math.round(g * invStr + gClamped * str);

          // Blue channel
          let b = data[idx + 2];
          if (contrast !== 1.0) b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
          if (brightness !== 1.0) b *= brightness;
          const bQuant = Math.round((b + threshold * step) / step) * step;
          const bClamped = bQuant < 0 ? 0 : bQuant > 255 ? 255 : bQuant;
          data[idx + 2] = Math.round(b * invStr + bClamped * str);

          // Alpha remains 255
        }
      }

      // 5. Put dithered pixels back to canvas
      ctx.putImageData(imgData, 0, 0);
      setRendered(true);
    };

    return () => {
      isCancelled = true;
    };
  }, [imageSrc, size, levels, brightness, contrast, ditherStrength, gradientTop, gradientBottom]);

  return (
    <div
      className={`dither-canvas-wrapper ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#004FF4",
        backgroundImage: `url(${defaultLandscape})`,
        backgroundSize: "cover",
        backgroundPosition: "center 125px",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: rendered ? 1 : 0.9,
          transition: "opacity 0.25s ease-in-out",
        }}
      />
    </div>
  );
}
