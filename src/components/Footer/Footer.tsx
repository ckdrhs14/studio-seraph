"use client";

import PixelText from "@/components/PixelText/PixelText";
import FooterModel from "@/components/FooterModel/FooterModel";
import styles from "./Footer.module.css";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/studio" },
    { label: "Projects", href: "/projects" },
    { label: "Labs", href: "/research" },
    { label: "Contact", href: "/contact" }
];

const SOCIAL = [
    { label: "Instagram", href: "https://instagram.com/studio_seraph" },
    { label: "Facebook", href: "/" }
];

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <FooterModel />

            <div className={styles.content}>
                {/* Left side */}
                <div className={styles.left}>
                    <div className={styles.group}>
                        <span className={styles.groupLabel}>FIND US</span>
                        <p className={styles.groupText}>
                            KOREA,
                            <br />
                            ILSAN,
                            <br />
                            WECITY 24 5F,6F
                        </p>
                    </div>

                    <div className={styles.group}>
                        <span className={styles.groupLabel}>INTERNAL</span>
                        <ul className={styles.linkList}>
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href}>{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.group}>
                        <span className={styles.groupLabel}>EXTERNAL</span>
                        <ul className={styles.linkList}>
                            {SOCIAL.map((s) => (
                                <li key={s.label}>
                                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                                        {s.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right side */}
                <div className={styles.right}>
                    <PixelText trigger="inview" duration={1200} startPixel={35}>
                        <h3 className={styles.heading}>
                            CONTACT
                            <br /> US
                        </h3>
                    </PixelText>
                    <a href="mailto:ilsanmiga5788@naver.com" className={styles.email}>
                        ilsanmiga5788@naver.com
                    </a>
                </div>
            </div>

            <div className={styles.bottom}>
                <span className={styles.brand}>STUDIO SERAPH</span>
                <span className={styles.copy}>&copy; {new Date().getFullYear()} All rights reserved</span>
            </div>
        </footer>
    );
}
