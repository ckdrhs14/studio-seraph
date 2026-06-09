"use client";

import { useEffect, useRef, useCallback } from "react";
import { toCanvas } from "html-to-image";
import styles from "./PixelText.module.css";

interface PixelTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  trigger?: "mount" | "inview";
  startPixel?: number;
}

export default function PixelText({
  children,
  className = "",
  delay = 0,
  duration = 1500,
  trigger = "mount",
  startPixel = 40,
}: PixelTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasAnimated = useRef(false);
  const rafRef = useRef(0);

  const animate = useCallback(async () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!content || !canvas) return;

    await document.fonts.ready;
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const rect = content.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);

    if (w === 0 || h === 0) {
      content.classList.add(styles.visible);
      return;
    }

    // Capture the DOM element pixel-perfectly
    // Content is opacity:0 in DOM, but we override to 1 on the CLONE
    // → no flash, but capture sees the fully rendered text
    let srcCanvas: HTMLCanvasElement;
    try {
      srcCanvas = await toCanvas(content, {
        backgroundColor: "transparent",
        pixelRatio: dpr,
        style: { opacity: "1" },
      });
    } catch {
      content.classList.add(styles.visible);
      return;
    }

    // Verify capture has content
    const testCtx = srcCanvas.getContext("2d");
    if (testCtx) {
      const data = testCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;
      let hasPixels = false;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] > 0) { hasPixels = true; break; }
      }
      if (!hasPixels) {
        content.classList.add(styles.visible);
        return;
      }
    }

    // Setup display canvas
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      content.classList.add(styles.visible);
      return;
    }

    // Reusable tiny canvas
    const tinyCanvas = document.createElement("canvas");
    const tinyCtx = tinyCanvas.getContext("2d");
    if (!tinyCtx) {
      content.classList.add(styles.visible);
      return;
    }

    // Show canvas (pixelated), content stays hidden
    canvas.classList.add(styles.canvasVisible);

    const totalFrames = Math.floor(duration / 16);
    let frame = 0;

    const step = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const px = Math.max(1, Math.round(startPixel * (1 - eased)));

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (px <= 2) {
        // Show real DOM text behind, then instantly remove canvas
        content.classList.add(styles.visible);
        canvas.style.display = "none";
        wrapperRef.current?.classList.add(styles.wrapperDone);
        return;
      }

      // Pixelate: downscale source → upscale without smoothing
      const tW = Math.max(1, Math.ceil((w * dpr) / px));
      const tH = Math.max(1, Math.ceil((h * dpr) / px));
      tinyCanvas.width = tW;
      tinyCanvas.height = tH;
      tinyCtx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 0, 0, tW, tH);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tinyCanvas, 0, 0, tW, tH, 0, 0, canvas.width, canvas.height);

      // Glitch: horizontal slice displacement
      if (px > 4 && Math.random() > 0.5) {
        const sliceCount = 1 + Math.floor(Math.random() * 2);
        for (let s = 0; s < sliceCount; s++) {
          const sy = Math.floor(Math.random() * canvas.height);
          const sh = Math.max(1, Math.floor(px * dpr * (0.3 + Math.random() * 0.8)));
          const safeH = Math.min(sh, canvas.height - sy);
          if (safeH <= 0) continue;
          const ox = Math.round((Math.random() - 0.5) * px * dpr * 0.5);
          const slice = ctx.getImageData(0, sy, canvas.width, safeH);
          ctx.putImageData(slice, ox, sy);
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [duration, startPixel]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (trigger === "mount") {
      timeout = setTimeout(animate, delay);
      return () => {
        clearTimeout(timeout);
        cancelAnimationFrame(rafRef.current);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeout = setTimeout(animate, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const el = wrapperRef.current;
    if (el) observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, delay, trigger]);

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
