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
 * - Complete background photograph with zero missing areas or seams
 * - Beautifully positioned landscape with open sky above and trees/water reflections below
 * - Fine 2px Bayer 16x16 dither with softened blend (0.58)
 * - Pure smooth linear gradient from #004FF4 to #86A6D9
 */
export default function DitherCanvas({
  imageSrc = defaultLandscape,
  size = 2,
  levels = 4,
  brightness = 1.0,
  contrast = 1.0,
  ditherStrength = 0.58,
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

      // In source image (800x556):
      // Row 0..110 is pure blue sky
      // Row 110..556 is the palm trees, fields, and water reflections
      // On the 1920x1080 canvas:
      // We want the trees to start at y ≈ 330px, giving tall open sky for the header & tagline
      const sySplit = 110;
      const destTreeY = 320;

      // 1. Draw sky slice: maps source sky (y: 0..110) across dest (y: 0..destTreeY)
      // This guarantees the sky starts at the very top (y = 0) with zero gaps or boxes
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        sySplit,
        0,
        0,
        targetWidth,
        destTreeY
      );

      // 2. Draw landscape slice: maps source trees/field/water (y: 110..556) across dest (y: destTreeY..1080)
      // Meets the sky slice at the exact same row (110) for 100% seamless continuity
      ctx.drawImage(
        img,
        0,
        sySplit,
        img.width,
        img.height - sySplit,
        0,
        destTreeY,
        targetWidth,
        targetHeight - destTreeY
      );

      // 3. Apply smooth linear gradient overlay from #004FF4 at top to #86A6D9 at mid-sky
      const grad = ctx.createLinearGradient(0, 0, 0, targetHeight * 0.55);
      grad.addColorStop(0, "rgba(0, 79, 244, 0.72)");        // #004FF4 at top
      grad.addColorStop(0.55, "rgba(134, 166, 217, 0.38)");   // #86A6D9 mid-sky
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
          opacity: 1,
        }}
      />
    </div>
  );
}
