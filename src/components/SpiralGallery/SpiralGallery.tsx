"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PixelText from "@/components/PixelText/PixelText";
import ImageModal from "@/components/ImageModal/ImageModal";

import styles from "./SpiralGallery.module.css";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
    { title: "Blobs", client: "Steven Batty", img: "/projects/14.webp" },
    { title: "Impressionism", client: "Djovan", img: "/projects/09.webp" },
    { title: "Madonna", client: "MrsBrown", img: "/projects/13.webp" },
    { title: "Generated", client: "GodsFavoriteArts", img: "/projects/10.webp" },
    { title: "Student", client: "Saydung", img: "/projects/05.webp" },
    { title: "Woman", client: "Wangphan", img: "/projects/11.webp" },
    { title: "Portrait", client: "BiancaVanDijk", img: "/projects/07.webp" },
    { title: "Art", client: "6897004", img: "/projects/08.webp" },
    { title: "Flower", client: "Pfefferminza", img: "/projects/02.webp" },
    { title: "Boots", client: "TiemCuaLa", img: "/projects/04.webp" },
    { title: "City Street", client: "Humpty22", img: "/projects/06.webp" },
    { title: "Generated", client: "MissyWhimsyArt", img: "/projects/12.webp" }
];

const TOTAL = PROJECTS.length;
const ANGLE_STEP = 360 / TOTAL;

export default function SpiralGallery() {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<HTMLDivElement>(null);
    const cylinderRef = useRef<HTMLDivElement>(null);
    const tiltRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);
    const [radius, setRadius] = useState(400);
    const [selectedProject, setSelectedProject] = useState<(typeof PROJECTS)[number] | null>(null);

    const closeModal = useCallback(() => setSelectedProject(null), []);

    useEffect(() => {
        const updateRadius = () => {
            const vw = window.innerWidth;
            setRadius(vw < 768 ? 280 : vw * 0.286);
        };
        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    // Title pin + fade out, then gallery pin + rotate
    useEffect(() => {
        const cylinder = cylinderRef.current;
        const section = sectionRef.current;
        const title = titleRef.current;
        const gallery = galleryRef.current;
        if (!cylinder || !section || !title || !gallery) return;

        const ctx = gsap.context(() => {
            // Pin title, hold, then fade as gallery approaches
            ScrollTrigger.create({
                trigger: title,
                start: "top top",
                end: "+=100%",
                pin: true,
                pinSpacing: true,
                scrub: true,
                animation: gsap
                    .timeline()
                    .to(title, { opacity: 1, scale: 1, duration: 0.6, ease: "none" })
                    .to(title, { opacity: 0, scale: 0.92, duration: 0.4, ease: "none" })
            });

            // Gallery pin + rotate
            ScrollTrigger.create({
                trigger: gallery,
                start: "top top",
                end: "+=200%",
                pin: true,
                scrub: 1,
                animation: gsap.fromTo(cylinder, { rotateY: 0 }, { rotateY: 360, ease: "none" })
            });
        }, section);

        return () => ctx.revert();
    }, [radius]);

    // Mouse-driven tilt
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const onMove = (e: MouseEvent) => {
            const rect = scene.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            tiltRef.current = { x: nx, y: ny };
        };

        const onLeave = () => {
            tiltRef.current = { x: 0, y: 0 };
        };

        scene.addEventListener("mousemove", onMove);
        scene.addEventListener("mouseleave", onLeave);

        let currentX = 0;
        let currentY = 0;

        const tick = () => {
            const cylinder = cylinderRef.current;
            if (!cylinder) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            currentX += (tiltRef.current.x - currentX) * 0.06;
            currentY += (tiltRef.current.y - currentY) * 0.06;

            const tiltX = currentY * -4;
            const tiltZ = currentX * 2;
            const shiftX = currentX * 10;
            const shiftY = currentY * 6;

            scene.style.transform = `
                rotateX(${tiltX}deg)
                rotateZ(${tiltZ}deg)
                translateX(${shiftX}px)
                translateY(${shiftY}px)
            `;

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            scene.removeEventListener("mousemove", onMove);
            scene.removeEventListener("mouseleave", onLeave);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <>
            <section ref={sectionRef} className={styles.section}>
                {/* Title screen — pins and fades out */}
                <div ref={titleRef} className={styles.titleScreen}>
                    <PixelText trigger="inview" duration={1400} startPixel={45}>
                        <h2 className={styles.bigTitle}>MEET OUR PROJECTS</h2>
                    </PixelText>
                </div>

                {/* Gallery — pins after title fades */}
                <div ref={galleryRef} className={styles.inner}>
                    <div className={styles.perspective}>
                        <div ref={sceneRef} className={styles.scene}>
                            <div
                                ref={cylinderRef}
                                className={styles.cylinder}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {PROJECTS.map((project, i) => {
                                    const angle = ANGLE_STEP * i;
                                    return (
                                        <div
                                            key={i}
                                            className={styles.card}
                                            style={{
                                                transform: `rotateY(${angle}deg) translateZ(${radius}px)`
                                            }}
                                        >
                                            <div className={styles.thumb} onClick={() => setSelectedProject(project)}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={project.img}
                                                    alt={project.title}
                                                    className={styles.thumbImg}
                                                    loading="lazy"
                                                />
                                                <div className={styles.thumbOverlay}>
                                                    <span className={styles.thumbClient}>{project.client}</span>
                                                    <span className={styles.thumbTitle}>{project.title}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {selectedProject && (
                <ImageModal
                    src={selectedProject.img}
                    title={selectedProject.title}
                    client={selectedProject.client}
                    onClose={closeModal}
                />
            )}
        </>
    );
}
