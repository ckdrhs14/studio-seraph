"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PixelText from "@/components/PixelText/PixelText";
import styles from "./Loader.module.css";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);
  const frameRef = useRef<number>(0);

  // Lock body scroll while loading
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const finish = useCallback(() => {
    setHiding(true);
    document.body.style.overflow = "";
    setTimeout(onComplete, 800);
  }, [onComplete]);

  useEffect(() => {
    let start: number | null = null;
    const duration = 2000;

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (elapsed < duration) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setTimeout(finish, 400);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [finish]);

  return (
    <div className={`${styles.loader} ${hiding ? styles.hiding : ""}`}>
      <div className={styles.content}>
        <PixelText delay={300} duration={1200} startPixel={30}>
          <p className={styles.title}>STUDIO SERAPH</p>
        </PixelText>

        <div className={styles.barWrap}>
          <div className={styles.bar}>
            <div className={styles.barFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.pct}>
            LOADING &middot;&middot;&middot; {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
