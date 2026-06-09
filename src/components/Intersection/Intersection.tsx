"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PixelText from "@/components/PixelText/PixelText";
import styles from "./Intersection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Intersection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            gsap.fromTo(
                `.${styles.imageInner}`,
                { y: 100, scale: 1.15 },
                {
                    y: -100,
                    scale: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: `.${styles.imageWrap}`,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }
                }
            );

            gsap.fromTo(
                `.${styles.body}`,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 0.8,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: `.${styles.body}`,
                        start: "top 80%"
                    }
                }
            );

            gsap.fromTo(
                `.${styles.subBody}`,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 0.7,
                    duration: 1,
                    scrollTrigger: {
                        trigger: `.${styles.subBody}`,
                        start: "top 85%"
                    }
                }
            );

            gsap.fromTo(
                `.${styles.link}`,
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: `.${styles.link}`,
                        start: "top 90%"
                    }
                }
            );
        },
        { scope: sectionRef }
    );

    return (
        <section ref={sectionRef} className={styles.intersection} data-theme-trigger>
            <PixelText className={styles.headingWrap} trigger="inview" duration={1400} delay={100} startPixel={45}>
                <h2 className={styles.heading}>
                    PHOTO, TECHNOLOGY,
                    <br />
                    EXPERIENCE.
                </h2>
            </PixelText>

            <div className={styles.content}>
                <div className={styles.imageWrap}>
                    <div className={styles.imageInner}>
                        <video className={styles.video} src="/mp4/main-video2.mp4" autoPlay loop muted playsInline preload="metadata" />
                    </div>
                </div>

                <div className={styles.textBlock}>
                    <p className={styles.body}>
                        Our approach sits where creativity and technical imagination meet. We explore emerging
                        technologies with a practical, artistic eye, shaping them into experiences that feel human and
                        memorable.
                    </p>
                </div>
            </div>

            <div className={styles.subSection}>
                <PixelText trigger="inview" duration={1000} startPixel={30}>
                    <h3 className={styles.subHeading}>
                        INTERSECTING CULTURE
                        <br />
                        &amp; TECHNOLOGY
                    </h3>
                </PixelText>
                <div>
                    <p className={styles.subBody}>
                        Studio Seraph explores how technology can shape the way people move, feel and interact. From
                        websites to installations, we design experiences that sit comfortably at the edge of what&apos;s
                        possible.
                    </p>
                    <a href="/projects" className={styles.link}>
                        ALL PROJECTS &#8599;
                    </a>
                </div>
            </div>
        </section>
    );
}
