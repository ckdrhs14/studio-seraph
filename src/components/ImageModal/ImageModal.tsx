"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./ImageModal.module.css";

interface ImageModalProps {
  src: string;
  title: string;
  client: string;
  onClose: () => void;
}

export default function ImageModal({ src, title, client, onClose }: ImageModalProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [handleClose]);

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.content} ${closing ? styles.contentClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} className={styles.image} />
        <div className={styles.info}>
          <span className={styles.client}>{client}</span>
          <span className={styles.title}>{title}</span>
        </div>
        <button className={styles.close} onClick={handleClose} aria-label="Close">
          <span />
          <span />
        </button>
      </div>
    </div>
  );
}
