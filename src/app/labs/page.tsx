"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

const LabsEquipment = dynamic(
    () => import("@/components/LabsEquipment/LabsEquipment"),
    { ssr: false }
);

export default function Labs() {
    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.content}>
                <LabsEquipment />
            </main>

            <Footer />
        </div>
    );
}
