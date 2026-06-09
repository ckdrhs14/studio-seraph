"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import PixelText from "@/components/PixelText/PixelText";

const HeroModel = dynamic(() => import("@/components/HeroModel/HeroModel"), {
  ssr: false,
});

import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  loaded?: boolean;
}

export default function Hero({ loaded = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 1.2 });

    tl.fromTo(
      descRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    ).fromTo(
      scrollRef.current,
      { opacity: 0 },
      { opacity: 0.4, duration: 0.8 },
      "-=0.3"
    );
  }, [loaded]);

  // Parallax: scale down + fade as user scrolls past hero
  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    const ctx = gsap.context(() => {
      gsap.to(inner, {
        scale: 0.92,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero} data-hero-section>
      <HeroModel />
      <div ref={innerRef} className={styles.inner}>
        {loaded && (
          <PixelText
            className={styles.titleWrap}
            delay={200}
            duration={2000}
            startPixel={50}
          >
            <h1 className={styles.title}>
              EXPERT DIGITAL              <br />
              PRODUCTION
            </h1>
          </PixelText>
        )}

        {!loaded && (
          <div className={styles.titleWrap}>
            <h1 className={styles.title} style={{ opacity: 0 }}>
              EXPERT DIGITAL              <br />
              PRODUCTION
            </h1>
          </div>
        )}

        <p ref={descRef} className={styles.desc}>
          Award-winning motion, design and interactive experiences that connect
          culture, technology, and contemporary aesthetics.
        </p>

        <div ref={scrollRef} className={styles.scrollIndicator}>
          <div className={styles.scrollLine} />
          <span className={styles.scrollLabel}>SCROLL</span>
        </div>
      </div>
    </section>
  );
}
