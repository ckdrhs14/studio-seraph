"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Cursor.module.css";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const prevPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const currentStretch = useRef({ sx: 1, sy: 1, angle: 0 });
  const rafRef = useRef(0);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onEnter = () => setHidden(false);
    const onLeave = () => setHidden(true);

    const onOverInteractive = () => setHovering(true);
    const onOutInteractive = () => setHovering(false);

    const addHoverListeners = () => {
      const targets = document.querySelectorAll(
        "a, button, [role='button'], input, textarea, .cursor-hover"
      );
      targets.forEach((el) => {
        el.addEventListener("mouseenter", onOverInteractive);
        el.addEventListener("mouseleave", onOutInteractive);
      });
      return targets;
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    let targets = addHoverListeners();
    const rescan = setInterval(() => {
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onOverInteractive);
        el.removeEventListener("mouseleave", onOutInteractive);
      });
      targets = addHoverListeners();
    }, 2000);

    const tick = () => {
      const ring = ringRef.current;
      if (!ring) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Lerp ring position
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;

      // Calculate velocity (smoothed)
      const dx = pos.current.x - prevPos.current.x;
      const dy = pos.current.y - prevPos.current.y;
      velocity.current.x += (dx - velocity.current.x) * 0.3;
      velocity.current.y += (dy - velocity.current.y) * 0.3;
      prevPos.current = { ...pos.current };

      // Speed & direction
      const speed = Math.sqrt(
        velocity.current.x ** 2 + velocity.current.y ** 2
      );
      const angle =
        speed > 0.5
          ? Math.atan2(velocity.current.y, velocity.current.x)
          : currentStretch.current.angle;

      // Stretch: scale along movement direction, squish perpendicular
      const maxStretch = 0.4;
      const stretchAmount = Math.min(speed / 60, maxStretch);
      const targetSx = 1 + stretchAmount;
      const targetSy = 1 - stretchAmount * 0.5;

      // Lerp stretch values for smooth transition
      currentStretch.current.sx +=
        (targetSx - currentStretch.current.sx) * 0.2;
      currentStretch.current.sy +=
        (targetSy - currentStretch.current.sy) * 0.2;
      currentStretch.current.angle +=
        shortAngleDist(currentStretch.current.angle, angle) * 0.2;

      const { sx, sy, angle: a } = currentStretch.current;
      const deg = (a * 180) / Math.PI;

      ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) rotate(${deg}deg) scale(${sx}, ${sy})`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onOverInteractive);
        el.removeEventListener("mouseleave", onOutInteractive);
      });
      clearInterval(rescan);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`${styles.dot} ${hidden ? styles.hidden : ""} ${hovering ? styles.dotHover : ""}`}
      />
      <div
        ref={ringRef}
        className={`${styles.ring} ${hidden ? styles.hidden : ""} ${hovering ? styles.ringHover : ""}`}
      />
    </>
  );
}

/** Shortest rotation path between two angles (radians) */
function shortAngleDist(from: number, to: number): number {
  const max = Math.PI * 2;
  const diff = ((to - from + Math.PI) % max) - Math.PI;
  return diff < -Math.PI ? diff + max : diff;
}
