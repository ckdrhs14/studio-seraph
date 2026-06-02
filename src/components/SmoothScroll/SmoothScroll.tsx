"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function SmoothScroll({
  children,
  enabled = true,
}: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    // Start stopped if not enabled
    if (!enabled) lenis.stop();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (enabled) {
      // Reset scroll to top when enabling
      lenis.scrollTo(0, { immediate: true });
      lenis.start();
    } else {
      lenis.stop();
    }
  }, [enabled]);

  return <>{children}</>;
}
