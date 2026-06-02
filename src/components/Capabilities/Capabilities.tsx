"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PixelText from "@/components/PixelText/PixelText";
import StarIcon from "@/components/StarIcon/StarIcon";
import styles from "./Capabilities.module.css";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
    { num: "01", title: "PREGENCY" },
    { num: "02", title: "BABY" },
    { num: "03", title: "FAMILY" },
    { num: "04", title: "PET FAM" },
    { num: "05", title: "ABOUT" }
];

export default function Capabilities() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const items = gsap.utils.toArray<HTMLElement>(`.${styles.item}`);
            items.forEach((item, i) => {
                gsap.fromTo(
                    item,
                    { x: -40 },
                    {
                        x: 0,
                        duration: 0.9,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        },
                        delay: i * 0.05
                    }
                );
            });

            gsap.fromTo(
                `.${styles.cta}`,
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: `.${styles.cta}`,
                        start: "top 90%"
                    }
                }
            );
        },
        { scope: sectionRef }
    );

    return (
        <section ref={sectionRef} className={styles.capabilities}>
            <div className={styles.header}>
                <PixelText trigger="inview" duration={700} startPixel={12}>
                    <span className={styles.label}>CAPABILITIES</span>
                </PixelText>
            </div>

            <ul className={styles.list}>
                {ITEMS.map((item) => (
                    <li key={item.num} className={styles.item}>
                        <span className={styles.num}>{item.num}</span>
                        <PixelText className={styles.titleWrap} trigger="inview" duration={900} startPixel={20}>
                            <span className={styles.title}>{item.title} <StarIcon size={56} className={styles.starIcon} /></span>
                        </PixelText>
                        <span className={styles.arrow}>&#8599;</span>
                    </li>
                ))}
            </ul>

            <div className={styles.cta}>
                <a href="/contact" className={styles.ctaBtn}>
                    MORE ABOUT US
                </a>
            </div>
        </section>
    );
}
