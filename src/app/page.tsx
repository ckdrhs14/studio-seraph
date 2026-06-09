"use client";

import { useState } from "react";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import Loader from "@/components/Loader/Loader";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Capabilities from "@/components/Capabilities/Capabilities";
import Intersection from "@/components/Intersection/Intersection";
import SpiralGallery from "@/components/SpiralGallery/SpiralGallery";
import LogoRail from "@/components/LogoRail/LogoRail";
import Footer from "@/components/Footer/Footer";
import Cursor from "@/components/Cursor/Cursor";
import HeroBackground from "@/components/HeroBackground/HeroBackground";
import ChatBot from "@/components/ChatBot/ChatBot";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <HeroBackground />
      <Cursor />
      <ChatBot />
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      <SmoothScroll enabled={loaded}>
        <Header />
        <main>
          <Hero loaded={loaded} />
          <div className="content-above-hero">
            <SpiralGallery />
            <Capabilities />
            <Intersection />
            <LogoRail />
          </div>
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
