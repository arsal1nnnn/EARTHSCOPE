import { useEffect, useRef, useState } from "react";
import defaultLandscape from "../assets/goa_landscape.jpg";
import fallbackDashboard from "../assets/dashboard_reference.png";

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
 * Faithfully reproduces the Figma Dither plugin settings:
 * - Style: Bayer 16x16
 * - Size: 3 (3px dither cell)
 * - Levels: 4 (4 quantization levels per color channel: 0, 85, 170, 255)
 * - Brightness: 100%
 * - Contrast: 1
 * - Mono: off (full color channels)
 * - Gradient overlay: #004FF4 at top to #86A6D9 at bottom
 */
export default function DitherCanvas({
  imageSrc = defaultLandscape,
  size = 3,
  levels = 4,
  brightness = 1.0,
  contrast = 1.0,
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

      // Use standard 1920x1080 artboard coordinate space matching Figma
      const targetWidth = 1920;
      const targetHeight = 1080;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // 1. Draw source landscape scaled to cover the 1920x1080 canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 2. Apply smooth linear gradient overlay on top: #004FF4 -> #86A6D9
      // In Figma, the gradient overlays the sky and blends into the horizon
      const grad = ctx.createLinearGradient(0, 0, 0, targetHeight * 0.58);
      grad.addColorStop(0, "rgba(0, 79, 244, 0.78)");      // #004FF4 at top
      grad.addColorStop(0.55, "rgba(134, 166, 217, 0.52)"); // #86A6D9 mid-sky
      grad.addColorStop(1, "rgba(134, 166, 217, 0.0)");    // feather into field

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // 3. Extract pixel buffer for Bayer 16x16 dithering
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;
      const step = 255 / (levels - 1); // 85 for 4 levels
      const bayer = BAYER_16_THRESHOLDS;
      const ditherSize = Math.max(1, Math.round(size));

      // Fast integer loop through all pixels
      for (let y = 0; y < targetHeight; y++) {
        const cellY = Math.floor(y / ditherSize) & 15;
        const rowOffset = y * targetWidth;

        for (let x = 0; x < targetWidth; x++) {
          const cellX = Math.floor(x / ditherSize) & 15;
          const threshold = bayer[cellY * 16 + cellX];
          const idx = (rowOffset + x) * 4;

          // Process Red channel
          let r = data[idx];
          if (contrast !== 1.0) r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
          if (brightness !== 1.0) r *= brightness;
          const rQuant = Math.round((r + threshold * step) / step) * step;
          data[idx] = rQuant < 0 ? 0 : rQuant > 255 ? 255 : rQuant;

          // Process Green channel
          let g = data[idx + 1];
          if (contrast !== 1.0) g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
          if (brightness !== 1.0) g *= brightness;
          const gQuant = Math.round((g + threshold * step) / step) * step;
          data[idx + 1] = gQuant < 0 ? 0 : gQuant > 255 ? 255 : gQuant;

          // Process Blue channel
          let b = data[idx + 2];
          if (contrast !== 1.0) b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
          if (brightness !== 1.0) b *= brightness;
          const bQuant = Math.round((b + threshold * step) / step) * step;
          data[idx + 2] = bQuant < 0 ? 0 : bQuant > 255 ? 255 : bQuant;

          // Alpha remains 255
        }
      }

      // 4. Put dithered pixels back to canvas
      ctx.putImageData(imgData, 0, 0);
      setRendered(true);
    };

    return () => {
      isCancelled = true;
    };
  }, [imageSrc, size, levels, brightness, contrast, gradientTop, gradientBottom]);

  return (
    <div
      className={`dither-canvas-wrapper ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#004FF4",
        backgroundImage: `url(${fallbackDashboard})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
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
          opacity: rendered ? 1 : 0.85,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </div>
  );
}
