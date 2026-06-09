"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

const BiplanScene = dynamic(
    () => import("@/components/BiplanScene/BiplanScene"),
    { ssr: false }
);

const STATS = [
    { num: "26", label: "Years", desc: "전통과 경험" },
    { num: "5F", label: "Baby Studio", desc: "아기 전용 촬영 공간" },
    { num: "6F", label: "Family Studio", desc: "가족·만삭·반려동물" },
    { num: "9+", label: "Concepts", desc: "다양한 촬영 컨셉" },
];

const SERVICES = [
    {
        title: "PREGNANCY",
        subtitle: "만삭 촬영",
        desc: "28주 전후, 가장 아름다운 순간을 기록합니다. 9가지 컨셉으로 엄마와 아이의 특별한 이야기를 담아드립니다.",
    },
    {
        title: "BABY",
        subtitle: "아기 촬영",
        desc: "신생아부터 돌까지, 아이의 성장 과정을 섬세하게 포착합니다. 50일, 100일, 돌 — 각 시기에 맞는 최적의 촬영을 제공합니다.",
    },
    {
        title: "FAMILY",
        subtitle: "가족 촬영",
        desc: "닮은 듯 다른 우리 가족, 가장 행복한 순간을 남깁니다. 대가족 촬영도 가능하며, 심플하고 단정한 스타일을 지향합니다.",
    },
    {
        title: "PET FAMILY",
        subtitle: "반려동물 촬영",
        desc: "소중한 가족인 반려동물의 사랑스러운 모습을 따뜻한 사진으로 기록합니다.",
    },
];

export default function About() {
    // Set light theme immediately on mount (before BiplanScene loads)
    useEffect(() => {
        document.documentElement.style.setProperty("--text", "rgb(30, 30, 30)");
        document.documentElement.style.setProperty("--bg", "rgb(245, 245, 245)");
        document.documentElement.style.setProperty("--accent", "rgb(26, 26, 26)");
        return () => {
            document.documentElement.style.setProperty("--text", "rgb(210, 210, 210)");
            document.documentElement.style.setProperty("--bg", "rgb(17, 17, 17)");
            document.documentElement.style.setProperty("--accent", "rgb(225, 180, 134)");
        };
    }, []);

    return (
        <div className={styles.page}>
            <Header />

            <BiplanScene />

            <div className={styles.below}>
                <svg className={styles.wave} viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,0 C180,50 360,40 540,20 C720,0 900,10 1080,30 C1200,45 1350,55 1440,40 L1440,60 L0,60Z" fill="var(--bg)" />
                </svg>
                <div className={styles.belowBg} />

                {/* Section 1 — Intro (light theme) */}
                <section className={styles.intro}>
                    <div className={styles.introInner}>
                        <span className={styles.label}>ABOUT US</span>
                        <h2 className={styles.introTitle}>
                            아름다움을 더하다,
                            <br />
                            잊혀지지 않는 추억을 서랍에 담다
                        </h2>
                        <p className={styles.introDesc}>
                            스튜디오 서랍은 26주년 전통의 부띠끄 베이비 전문 스튜디오입니다.
                            모던하고 깔끔한 사진을 추구하며, 심플함과 디테일을 최우선으로 합니다.
                            힘들 때마다 꺼내보며 순간을 기억하고, 영원히 잊지 않을 추억을 만듭니다.
                        </p>
                        <div className={styles.stats}>
                            {STATS.map((s) => (
                                <div key={s.label} className={styles.stat}>
                                    <span className={styles.statNum}>{s.num}</span>
                                    <span className={styles.statLabel}>{s.label}</span>
                                    <span className={styles.statDesc}>{s.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 2 — Services (dark theme) */}
                <section className={styles.services}>
                    <div className={styles.servicesInner}>
                        <div className={styles.servicesHeader}>
                            <span className={styles.label}>WHAT WE DO</span>
                            <h2 className={styles.servicesTitle}>OUR SERVICES</h2>
                        </div>
                        <div className={styles.servicesList}>
                            {SERVICES.map((s, i) => (
                                <div key={s.title} className={styles.serviceItem}>
                                    <div className={styles.serviceNum}>
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                    <div className={styles.serviceContent}>
                                        <h3 className={styles.serviceTitle}>{s.title}</h3>
                                        <span className={styles.serviceSubtitle}>{s.subtitle}</span>
                                        <p className={styles.serviceDesc}>{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 3 — Process & Contact (dark theme) */}
                <section className={styles.process}>
                    <div className={styles.processInner}>
                        <div className={styles.processGrid}>
                            <div className={styles.processLeft}>
                                <span className={styles.label}>HOW IT WORKS</span>
                                <h2 className={styles.processTitle}>
                                    SHOOTING
                                    <br />
                                    PROCESS
                                </h2>
                            </div>
                            <div className={styles.processRight}>
                                <div className={styles.step}>
                                    <span className={styles.stepNum}>01</span>
                                    <div>
                                        <h4 className={styles.stepTitle}>예약</h4>
                                        <p className={styles.stepDesc}>평일은 2주 전, 주말은 3주 전까지 전화 또는 카카오톡으로 예약합니다. 예약금 10만원을 입금하면 확정됩니다.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <span className={styles.stepNum}>02</span>
                                    <div>
                                        <h4 className={styles.stepTitle}>촬영</h4>
                                        <p className={styles.stepDesc}>1시간 기준으로 진행되며, 대부분 30분 내에 완료됩니다. 스튜디오 의상과 소품을 자유롭게 이용할 수 있습니다.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <span className={styles.stepNum}>03</span>
                                    <div>
                                        <h4 className={styles.stepTitle}>셀렉</h4>
                                        <p className={styles.stepDesc}>촬영 후 2주 이내에 앨범과 액자에 들어갈 사진을 직접 선택합니다.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <span className={styles.stepNum}>04</span>
                                    <div>
                                        <h4 className={styles.stepTitle}>앨범 제작</h4>
                                        <p className={styles.stepDesc}>셀렉 후 약 6주가 소요됩니다. 완성된 앨범은 방문 수령 또는 택배로 받으실 수 있습니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.contact}>
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>PHONE</span>
                                <a href="tel:0319635789" className={styles.contactValue}>031-963-5789</a>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>EMAIL</span>
                                <a href="mailto:ilsanmiga5788@naver.com" className={styles.contactValue}>ilsanmiga5788@naver.com</a>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>ADDRESS</span>
                                <span className={styles.contactValue}>경기도 고양시 일산동구 위시티로 24, 5F/6F</span>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>HOURS</span>
                                <span className={styles.contactValue}>수~금 09:30–18:30 / 토·일 09:30–19:00 (월·화 휴무)</span>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
}
