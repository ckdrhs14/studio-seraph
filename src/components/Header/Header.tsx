"use client";

import { useState, useEffect, useRef } from "react";
import PixelText from "@/components/PixelText/PixelText";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { label: "home", href: "/" },
  { label: "about us", href: "/studio" },
  { label: "projects", href: "/projects" },
  { label: "labs", href: "/research" },
  { label: "contact", href: "/contact" },
];

const STAGGER = 150;

export default function Header() {
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const openCount = useRef(0);
  const [mountKey, setMountKey] = useState(0);

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      setIsOpen(h >= 9 && h < 18);
      setTime(
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      openCount.current++;
      setMountKey(openCount.current);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          STUDIO SERAPH
        </a>

        <div className={styles.right}>
          <span className={styles.status}>
            <span className={`${styles.dot} ${!isOpen ? styles.dotClosed : ""}`} />
            {isOpen ? "open" : "close"}
          </span>
          <span className={styles.time}>{time}</span>
          <button
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
        <button
          className={styles.close}
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <span />
          <span />
        </button>
        <ul>
          {NAV_ITEMS.map((item, i) => (
            <li
              key={item.href}
              className={styles.navItem}
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(2vw)",
                transition: `opacity 0.4s ease ${200 + i * STAGGER}ms, transform 0.4s ease ${200 + i * STAGGER}ms`,
              }}
            >
              {menuOpen ? (
                <PixelText
                  key={`${mountKey}-${i}`}
                  delay={200 + i * STAGGER}
                  duration={1000}
                  startPixel={25}
                >
                  <a href={item.href} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </a>
                </PixelText>
              ) : (
                <a href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
        <div
          className={styles.navFooter}
          style={{
            opacity: menuOpen ? 1 : 0,
            transition: `opacity 0.4s ease ${200 + NAV_ITEMS.length * STAGGER}ms`,
          }}
        >
          <span>STUDIO SERAPH</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </nav>
    </>
  );
}
