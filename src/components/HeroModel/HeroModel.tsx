"use client";

import { useEffect, useRef } from "react";
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Box3, Vector3, Group, ACESFilmicToneMapping } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import styles from "./HeroModel.module.css";

export default function HeroModel() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const targetRot = useRef({ x: 0, y: 0 });
    const currentRot = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio, 2);

        // Scene
        const scene = new Scene();

        // Camera — tight FOV to fill the frame with the model
        const camera = new PerspectiveCamera(35, w / h, 0.1, 1000);

        // Renderer
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(dpr);
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.9;
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const dirLight = new DirectionalLight(0xf5eadf, 1.5);
        dirLight.position.set(5, 8, 5);
        scene.add(dirLight);

        const fillLight = new DirectionalLight(0x8899aa, 0.5);
        fillLight.position.set(-5, 2, -5);
        scene.add(fillLight);

        const rimLight = new DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, 5, -8);
        scene.add(rimLight);

        // Model group for rotation
        const modelGroup = new Group();
        scene.add(modelGroup);

        // Load GLB
        const loader = new GLTFLoader();
        loader.load(
            "/models/studio_apartment.glb",
            (gltf) => {
                const model = gltf.scene;

                // Center model
                const box = new Box3().setFromObject(model);
                const center = box.getCenter(new Vector3());
                const size = box.getSize(new Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);

                // Scale to fill view
                const scale = 8 / maxDim;
                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));

                modelGroup.add(model);

                // Position camera looking at center, close enough to fill frame
                camera.position.set(0, 2, 8);
                camera.lookAt(0, 0, 0);
            },
            undefined,
            (error) => {
                console.error("GLB load error:", error);
            }
        );

        // Mouse tracking
        const onMouseMove = (e: MouseEvent) => {
            // Normalize to -1 ~ 1
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        window.addEventListener("mousemove", onMouseMove);

        // Animation loop
        const animate = () => {
            // Target rotation based on mouse
            targetRot.current.y = mouse.current.x * 0.15;
            targetRot.current.x = mouse.current.y * -0.08;

            // Smooth lerp
            currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.04;
            currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.04;

            modelGroup.rotation.y = currentRot.current.y;
            modelGroup.rotation.x = currentRot.current.x;

            renderer.render(scene, camera);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        // Resize
        const onResize = () => {
            const nw = window.innerWidth;
            const nh = window.innerHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(rafRef.current);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className={styles.container} />;
}
