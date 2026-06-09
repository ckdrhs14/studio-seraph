"use client";

import { useEffect, useRef } from "react";
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    Box3,
    Vector3,
    ACESFilmicToneMapping,
    Clock,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import styles from "./LabsEquipment.module.css";

const EQUIPMENT: { model: string; title: string; desc: string; initRot: { x: number; y: number }; scale: number; camZ?: number }[] = [
    {
        model: "/models/studio_softbox_light.glb",
        title: "Softbox Light",
        desc: "부드럽고 균일한 조명을 만들어주는 소프트박스. 인물의 피부톤을 자연스럽게 표현하는 핵심 장비입니다.",
        initRot: { x: 0, y: Math.PI + Math.PI / 3 },
        scale: 2.2,
    },
    {
        model: "/models/large_studio_light.glb",
        title: "Large Studio Light",
        desc: "넓은 범위를 커버하는 대형 스튜디오 조명. 가족 촬영이나 대가족 촬영 시 전체적인 빛을 잡아줍니다.",
        initRot: { x: 0, y: Math.PI },
        scale: 2.0,
    },
    {
        model: "/models/studio_umbrella_light.glb",
        title: "Umbrella Light",
        desc: "엄브렐라 반사를 이용한 확산 조명. 부드러운 그림자와 자연스러운 빛 번짐을 연출합니다.",
        initRot: { x: 0, y: Math.PI },
        scale: 1.6,
        camZ: 5,
    },
    {
        model: "/models/simple_studio_light.glb",
        title: "Simple Studio Light",
        desc: "컴팩트한 보조 조명. 림라이트나 헤어라이트로 활용하여 피사체에 입체감을 더합니다.",
        initRot: { x: 0, y: Math.PI },
        scale: 2.2,
    },
];

function ModelViewer({ src, initRot, modelScale = 2.8, camZ = 3.5 }: { src: string; initRot: { x: number; y: number }; modelScale?: number; camZ?: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const prevMouse = useRef({ x: 0, y: 0 });
    const rotRef = useRef({ x: initRot.x, y: initRot.y });
    const momentumRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const dpr = Math.min(window.devicePixelRatio, 2);

        const scene = new Scene();
        const camera = new PerspectiveCamera(35, w / h, 0.1, 100);
        camera.position.set(0, 0.3, camZ);

        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(dpr);
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        container.appendChild(renderer.domElement);

        scene.add(new AmbientLight(0xffffff, 0.6));
        const key = new DirectionalLight(0xffeedd, 1.5);
        key.position.set(3, 5, 5);
        scene.add(key);
        const fill = new DirectionalLight(0x8899bb, 0.5);
        fill.position.set(-3, 2, -3);
        scene.add(fill);

        const loader = new GLTFLoader();
        let modelGroup: { rotation: { x: number; y: number } } | null = null;

        loader.load(src, (gltf) => {
            const model = gltf.scene;
            const box = new Box3().setFromObject(model);
            const center = box.getCenter(new Vector3());
            const size = box.getSize(new Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = modelScale / maxDim;

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            scene.add(model);
            modelGroup = model;
        });

        // Drag to rotate
        const onDown = (e: MouseEvent) => {
            dragging.current = true;
            prevMouse.current = { x: e.clientX, y: e.clientY };
            momentumRef.current = { x: 0, y: 0 };
            container.style.cursor = "grabbing";
        };
        const onMove = (e: MouseEvent) => {
            if (!dragging.current) return;
            const dx = e.clientX - prevMouse.current.x;
            const dy = e.clientY - prevMouse.current.y;
            rotRef.current.y += dx * 0.004;
            momentumRef.current = { x: dx * 0.004, y: 0 };
            prevMouse.current = { x: e.clientX, y: e.clientY };
        };
        const onUp = () => {
            dragging.current = false;
            container.style.cursor = "grab";
        };

        container.style.cursor = "grab";
        container.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);

        // Touch support
        const onTouchStart = (e: TouchEvent) => {
            dragging.current = true;
            prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            momentumRef.current = { x: 0, y: 0 };
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!dragging.current) return;
            const dx = e.touches[0].clientX - prevMouse.current.x;
            const dy = e.touches[0].clientY - prevMouse.current.y;
            rotRef.current.y += dx * 0.004;
            momentumRef.current = { x: dx * 0.004, y: 0 };
            prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };
        const onTouchEnd = () => { dragging.current = false; };

        container.addEventListener("touchstart", onTouchStart, { passive: true });
        container.addEventListener("touchmove", onTouchMove, { passive: true });
        container.addEventListener("touchend", onTouchEnd);

        const clock = new Clock();

        const animate = () => {
            const delta = clock.getDelta();

            // Auto-rotate slowly when not dragging
            if (!dragging.current) {
                momentumRef.current.x *= 0.9;
                rotRef.current.y += momentumRef.current.x + delta * 0.15;
            }

            if (modelGroup) {
                modelGroup.rotation.y = rotRef.current.y;
                modelGroup.rotation.x = rotRef.current.x;
            }

            renderer.render(scene, camera);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        const onResize = () => {
            const r = container.getBoundingClientRect();
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
            renderer.setSize(r.width, r.height);
        };
        window.addEventListener("resize", onResize);

        return () => {
            container.removeEventListener("mousedown", onDown);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            container.removeEventListener("touchstart", onTouchStart);
            container.removeEventListener("touchmove", onTouchMove);
            container.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(rafRef.current);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [src]);

    return <div ref={containerRef} className={styles.viewer} />;
}

export default function LabsEquipment() {
    return (
        <div className={styles.grid}>
            {EQUIPMENT.map((item, i) => (
                <div
                    key={item.model}
                    className={`${styles.row} ${i % 2 === 1 ? styles.rowReverse : ""}`}
                >
                    <div className={styles.modelCol}>
                        <ModelViewer src={item.model} initRot={item.initRot} modelScale={item.scale} camZ={item.camZ} />
                    </div>
                    <div className={styles.textCol}>
                        <span className={styles.index}>
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className={styles.title}>{item.title}</h3>
                        <p className={styles.desc}>{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
