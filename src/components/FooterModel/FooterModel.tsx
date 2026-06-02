"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import styles from "./FooterModel.module.css";

export default function FooterModel() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const currentRot = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const dpr = Math.min(window.devicePixelRatio, 2);

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
        camera.position.set(0, 0.8, 4);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(dpr);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        container.appendChild(renderer.domElement);

        // Lighting — dramatic portrait lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
        keyLight.position.set(2, 3, 4);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x8899bb, 0.6);
        fillLight.position.set(-3, 1, 2);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight.position.set(0, 2, -3);
        scene.add(rimLight);

        const bottomLight = new THREE.DirectionalLight(0x443322, 0.3);
        bottomLight.position.set(0, -3, 1);
        scene.add(bottomLight);

        // Model
        const headGroup = new THREE.Group();
        scene.add(headGroup);

        const loader = new GLTFLoader();
        loader.load(
            "/models/proportional_low_poly_man__free_download.glb",
            (gltf) => {
                const model = gltf.scene;

                // Center and scale
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 7 / maxDim;

                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));
                // Shift down to show upper body, head not clipped
                model.position.y -= size.y * scale * 0.3;

                headGroup.add(model);
            },
            undefined,
            (error) => {
                console.error("GLB load error:", error);
            }
        );

        // Mouse tracking — relative to container
        const onMouseMove = (e: MouseEvent) => {
            const r = container.getBoundingClientRect();
            mouse.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
            mouse.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };

        const onMouseLeave = () => {
            mouse.current = { x: 0, y: 0 };
        };

        window.addEventListener("mousemove", onMouseMove);
        container.addEventListener("mouseleave", onMouseLeave);

        // Animation
        const animate = () => {
            // Target: mouse controls head rotation like looking at cursor
            const targetY = mouse.current.x * 0.4;
            const targetX = mouse.current.y * -0.2;

            currentRot.current.x += (targetX - currentRot.current.x) * 0.05;
            currentRot.current.y += (targetY - currentRot.current.y) * 0.05;

            headGroup.rotation.y = currentRot.current.y;
            headGroup.rotation.x = currentRot.current.x;

            renderer.render(scene, camera);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        // Resize
        const onResize = () => {
            const r = container.getBoundingClientRect();
            const nw = r.width;
            const nh = r.height;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMouseMove);
            container.removeEventListener("mouseleave", onMouseLeave);
            cancelAnimationFrame(rafRef.current);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className={styles.container} />;
}
