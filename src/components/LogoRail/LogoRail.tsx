"use client";

import PixelText from "@/components/PixelText/PixelText";
import styles from "./LogoRail.module.css";

const CLIENTS = [
    "APPLE",
    "ORANGE",
    "BANANA",
    "PEAR",
    "MANGO",
    "KIWI",
    "PINEAPPLE",
    "RASPBERRY",
    "STRAWBERRY",
    "BLUEBERRY",
    "BLACKBERRY",
    "CRANBERRY"
];

export default function LogoRail() {
    const doubled = [...CLIENTS, ...CLIENTS];

    return (
        <section className={styles.section}>
            <PixelText trigger="inview" duration={800} startPixel={15}>
                <div className={styles.label}>CLIENTS BY</div>
            </PixelText>
            <div className={styles.rail}>
                <div className={styles.track}>
                    {doubled.map((name, i) => (
                        <span key={i} className={styles.logo}>
                            {name}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
