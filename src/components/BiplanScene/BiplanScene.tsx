"use client";

import { useEffect, useRef, useState } from "react";
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
    Box3,
    Vector3,
    ACESFilmicToneMapping,
    Clock,
    AnimationMixer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import styles from "./BiplanScene.module.css";

// Light theme values (matching HeroBackground inversion)
const LIGHT_TEXT = "rgb(30, 30, 30)";
const LIGHT_BG = "rgb(245, 245, 245)";
const LIGHT_ACCENT = "rgb(26, 26, 26)";
// Dark theme values (default)
const DARK_TEXT = "rgb(210, 210, 210)";
const DARK_BG = "rgb(17, 17, 17)";
const DARK_ACCENT = "rgb(225, 180, 134)";

export default function BiplanScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const smoothMouse = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);
    const [loaded, setLoaded] = useState(false);

    // Set light theme on mount, restore dark on unmount
    useEffect(() => {
        document.documentElement.style.setProperty("--text", LIGHT_TEXT);
        document.documentElement.style.setProperty("--bg", LIGHT_BG);
        document.documentElement.style.setProperty("--accent", LIGHT_ACCENT);

        return () => {
            document.documentElement.style.setProperty("--text", DARK_TEXT);
            document.documentElement.style.setProperty("--bg", DARK_BG);
            document.documentElement.style.setProperty("--accent", DARK_ACCENT);
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const w = container.offsetWidth;
        const h = container.offsetHeight;
        const dpr = Math.min(window.devicePixelRatio, 1.5);

        const scene = new Scene();
        const camera = new PerspectiveCamera(45, w / h, 0.1, 500);
        camera.position.set(0, 1, 5);

        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x87ceeb, 1);
        renderer.setSize(w, h);
        renderer.setPixelRatio(dpr);
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        const canvas = renderer.domElement;
        canvas.style.visibility = "hidden";
        container.appendChild(canvas);

        // Lighting
        const hemi = new HemisphereLight(0x87ceeb, 0xffffff, 0.6);
        scene.add(hemi);
        scene.add(new AmbientLight(0xffffff, 0.5));

        const sun = new DirectionalLight(0xfff5e0, 1.5);
        sun.position.set(5, 10, 5);
        scene.add(sun);

        const fill = new DirectionalLight(0x8899cc, 0.4);
        fill.position.set(-5, 3, -3);
        scene.add(fill);

        const clock = new Clock();
        let mixer: AnimationMixer | null = null;

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(
            "/models/red_biplane.glb",
            (gltf) => {
                const model = gltf.scene;
                const box = new Box3().setFromObject(model);
                const center = box.getCenter(new Vector3());
                const size = box.getSize(new Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 6 / maxDim;

                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));
                model.position.x -= 0.2;
                model.rotation.y = -Math.PI / 2 + Math.PI / 6;
                scene.add(model);

                if (gltf.animations.length > 0) {
                    mixer = new AnimationMixer(model);
                    gltf.animations.forEach((clip) => {
                        mixer!.clipAction(clip).play();
                    });
                }

                canvas.style.visibility = "visible";
                setLoaded(true);
            },
            undefined,
            (err) => console.error("GLTF load error:", err)
        );

        // Mouse tracking
        const onMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMove);

        // Scroll — transition CSS vars from light → dark when 3rd section enters
        const onScroll = () => {
            const vh = window.innerHeight;
            const scrollY = window.scrollY;
            // Find the services/2nd section as anchor for color transition
            const processSection = document.querySelector('[class*="services"]');
            const triggerTop = processSection
                ? processSection.getBoundingClientRect().top + scrollY
                : vh * 4;
            const start = triggerTop - vh;
            const end = triggerTop - vh * 0.3;
            const t = Math.max(0, Math.min((scrollY - start) / (end - start), 1));

            // Interpolate light → dark
            const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
            const textR = lerp(30, 210);
            const bgR = lerp(245, 17);
            const accentR = lerp(26, 225);
            const accentG = lerp(26, 180);
            const accentB = lerp(26, 134);

            document.documentElement.style.setProperty("--text", `rgb(${textR},${textR},${textR})`);
            document.documentElement.style.setProperty("--bg", `rgb(${bgR},${bgR},${bgR})`);
            document.documentElement.style.setProperty("--accent", `rgb(${accentR},${accentG},${accentB})`);
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        // Animate
        const animate = () => {
            const delta = clock.getDelta();
            if (mixer) mixer.update(delta);

            smoothMouse.current.x += (mouseRef.current.x - smoothMouse.current.x) * 0.03;
            smoothMouse.current.y += (mouseRef.current.y - smoothMouse.current.y) * 0.03;

            camera.position.x = smoothMouse.current.x * 1.5;
            camera.position.y = 1 - smoothMouse.current.y * 0.8;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        const onResize = () => {
            const nw = container.offsetWidth;
            const nh = container.offsetHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(rafRef.current);
            renderer.dispose();
            if (container.contains(canvas)) {
                container.removeChild(canvas);
            }
        };
    }, []);

    return (
        <section className={styles.section}>
            <div ref={containerRef} className={styles.canvas} />
        </section>
    );
}
