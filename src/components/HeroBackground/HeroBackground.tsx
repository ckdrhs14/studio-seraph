"use client";

import { useEffect, useRef } from "react";
import { noise2D } from "./noise";
import styles from "./HeroBackground.module.css";

const COLS = 60;
const ROWS = 35;
const NOISE_SCALE = 0.025;
const NOISE_SPEED = 0.0002;
const LINE_ALPHA = 0.3;
const DOT_ALPHA = 0.12;
const DOT_RADIUS = 1;
const MOUSE_RADIUS = 150;
const MOUSE_STRENGTH = 20;

interface Point {
    baseX: number;
    baseY: number;
    x: number;
    y: number;
}

export default function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -9999, y: -9999 });
    const rafRef = useRef(0);
    const opacityRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0;
        let h = 0;
        let points: Point[][] = [];
        let dpr = 1;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Build grid
            const spacingX = w / (COLS - 1);
            const spacingY = h / (ROWS - 1);
            points = [];
            for (let row = 0; row < ROWS; row++) {
                const rowArr: Point[] = [];
                for (let col = 0; col < COLS; col++) {
                    const x = col * spacingX;
                    const y = row * spacingY;
                    rowArr.push({ baseX: x, baseY: y, x, y });
                }
                points.push(rowArr);
            }
        };

        const onMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseLeave = () => {
            mouse.current = { x: -9999, y: -9999 };
        };

        // Track color inversion progress
        const colorState = { current: 0 }; // 0 = dark bg, 1 = light bg

        const draw = (time: number) => {
            // Fade in after scrolling past hero (100vh)
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const targetOpacity = Math.min(Math.max((scrollY - vh * 0.5) / (vh * 0.5), 0), 1);
            opacityRef.current += (targetOpacity - opacityRef.current) * 0.1;
            canvas.style.opacity = String(opacityRef.current * 1);

            // Color inversion: when Capabilities section enters viewport
            const capSection = document.querySelector('[class*="intersection"]');
            const capTop = capSection ? capSection.getBoundingClientRect().top + scrollY : vh * 6;
            const invertStart = capTop - vh * 0.5;
            const invertEnd = capTop;
            const invertProgress = Math.min(Math.max((scrollY - invertStart) / (invertEnd - invertStart), 0), 1);
            colorState.current += (invertProgress - colorState.current) * 0.08;

            const inv = colorState.current;
            // Interpolate: dark(17,17,17) → white(245,245,245)
            const bgR = Math.round(17 + (245 - 17) * inv);
            const bgG = bgR;
            const bgB = bgR;
            // Lines: light(210,210,210) → dark(30,30,30)
            const lineR = Math.round(210 + (30 - 210) * inv);
            const lineG = lineR;
            const lineB = lineR;

            // Update CSS variables for text/bg/accent color inversion
            const textColor = `rgb(${lineR}, ${lineG}, ${lineB})`;
            // accent: #E1B486(225,180,134) → dark accent #1a1a1a(26,26,26)
            const accentR = Math.round(225 + (26 - 225) * inv);
            const accentG = Math.round(180 + (26 - 180) * inv);
            const accentB = Math.round(134 + (26 - 134) * inv);

            document.documentElement.style.setProperty("--text", textColor);
            document.documentElement.style.setProperty("--bg", `rgb(${bgR}, ${bgG}, ${bgB})`);
            document.documentElement.style.setProperty("--accent", `rgb(${accentR}, ${accentG}, ${accentB})`);

            // Fill background
            ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
            ctx.fillRect(0, 0, w, h);

            const t = time * NOISE_SPEED;

            // Update points with noise + mouse
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const p = points[row][col];
                    const nx = noise2D(col * NOISE_SCALE + t, row * NOISE_SCALE + t * 0.7);
                    const ny = noise2D(col * NOISE_SCALE + 100 + t * 0.8, row * NOISE_SCALE + 100 + t);

                    let offsetX = nx * 10;
                    let offsetY = ny * 10;

                    // Mouse repulsion
                    const dx = p.baseX - mouse.current.x;
                    const dy = p.baseY - mouse.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MOUSE_RADIUS) {
                        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
                        const angle = Math.atan2(dy, dx);
                        offsetX += Math.cos(angle) * force;
                        offsetY += Math.sin(angle) * force;
                    }

                    p.x = p.baseX + offsetX;
                    p.y = p.baseY + offsetY;
                }
            }

            // Draw horizontal lines
            ctx.strokeStyle = `rgba(${lineR}, ${lineG}, ${lineB}, ${LINE_ALPHA})`;
            ctx.lineWidth = 0.5;
            for (let row = 0; row < ROWS; row++) {
                ctx.beginPath();
                ctx.moveTo(points[row][0].x, points[row][0].y);
                for (let col = 1; col < COLS; col++) {
                    ctx.lineTo(points[row][col].x, points[row][col].y);
                }
                ctx.stroke();
            }

            // Draw vertical lines
            for (let col = 0; col < COLS; col++) {
                ctx.beginPath();
                ctx.moveTo(points[0][col].x, points[0][col].y);
                for (let row = 1; row < ROWS; row++) {
                    ctx.lineTo(points[row][col].x, points[row][col].y);
                }
                ctx.stroke();
            }

            // Draw dots at intersections
            ctx.fillStyle = `rgba(${lineR}, ${lineG}, ${lineB}, ${DOT_ALPHA})`;
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const p = points[row][col];

                    // Brighter dots near mouse
                    const dx = p.x - mouse.current.x;
                    const dy = p.y - mouse.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const proximity = Math.max(0, 1 - dist / MOUSE_RADIUS);

                    ctx.globalAlpha = DOT_ALPHA + proximity * 0.5;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, DOT_RADIUS + proximity * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1;

            rafRef.current = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseleave", onMouseLeave);
        rafRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseleave", onMouseLeave);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} className={styles.canvas} />;
}
