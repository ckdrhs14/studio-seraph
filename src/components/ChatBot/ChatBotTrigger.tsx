"use client";

import { useEffect, useRef, useState } from "react";
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    Box3,
    Vector3,
    ACESFilmicToneMapping,
    Clock
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import styles from "./ChatBot.module.css";

interface ChatBotTriggerProps {
    onClick: () => void;
    hidden?: boolean;
}

export default function ChatBotTrigger({ onClick, hidden }: ChatBotTriggerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0 });
    const smoothRot = useRef({ x: 0, y: 0 });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const size = 240;
        const dpr = Math.min(window.devicePixelRatio, 2);

        const scene = new Scene();
        const camera = new PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0.5, 6);

        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(size, size);
        renderer.setPixelRatio(dpr);
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        // Hide canvas until first render with model
        const canvas = renderer.domElement;
        canvas.style.visibility = "hidden";
        container.appendChild(canvas);

        scene.add(new AmbientLight(0xffffff, 0.8));
        const key = new DirectionalLight(0xffeedd, 1.5);
        key.position.set(2, 3, 4);
        scene.add(key);
        const fill = new DirectionalLight(0x8899bb, 0.4);
        fill.position.set(-2, 1, -2);
        scene.add(fill);

        let model: { rotation: { x: number; y: number }; position: { y: number } } | null = null;
        let baseY = 0;
        let modelReady = false;

        const loader = new GLTFLoader();
        loader.load("/models/late_-_cuterobotchallenge.glb", (gltf) => {
            const m = gltf.scene;
            const box = new Box3().setFromObject(m);
            const center = box.getCenter(new Vector3());
            const bsize = box.getSize(new Vector3());
            const maxDim = Math.max(bsize.x, bsize.y, bsize.z);
            const scale = 1.8 / maxDim;

            m.scale.setScalar(scale);
            m.position.sub(center.multiplyScalar(scale));
            baseY = m.position.y;
            scene.add(m);
            model = m;
            modelReady = true;
        });

        // Mouse tracking
        const onMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            mouseRef.current.x = (e.clientX - cx) / window.innerWidth;
            mouseRef.current.y = (e.clientY - cy) / window.innerHeight;
        };
        window.addEventListener("mousemove", onMove);

        const clock = new Clock();

        const animate = () => {
            const t = clock.getElapsedTime();

            smoothRot.current.x += (mouseRef.current.y * -0.4 - smoothRot.current.x) * 0.05;
            smoothRot.current.y += (mouseRef.current.x * 0.6 - smoothRot.current.y) * 0.05;

            if (model) {
                model.rotation.y = smoothRot.current.y + Math.sin(t * 0.5) * 0.1;
                model.rotation.x = smoothRot.current.x;
                model.position.y = baseY + Math.sin(t * 1.2) * 0.05;
            }

            renderer.render(scene, camera);

            // Show canvas after first render with model loaded
            if (modelReady && canvas.style.visibility === "hidden") {
                canvas.style.visibility = "visible";
                setLoaded(true);
            }

            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(rafRef.current);
            renderer.dispose();
            if (container.contains(canvas)) {
                container.removeChild(canvas);
            }
        };
    }, []);

    return (
        <div className={`${styles.trigger3d} ${hidden || !loaded ? styles.trigger3dHidden : ""}`} onClick={onClick}>
            <div className={styles.speechBubble}>Ask me!</div>
            <div ref={containerRef} className={styles.triggerCanvas} />
        </div>
    );
}
