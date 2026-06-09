"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

export default function Projects() {
    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.content}>
                {/* 컨텐츠 영역 */}
            </main>

            <Footer />
        </div>
    );
}
