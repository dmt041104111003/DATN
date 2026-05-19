"use client";

import "@/features/public/shared/home-gov.css";
import { HeroNew } from "@/components/HeroNew";
import { AboutSection } from "@/components/AboutSection";
import { FeatureSection } from "@/components/FeatureSection";
import { AudienceSection } from "@/components/AudienceSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <div className="gov-bg gov-home">
      <Header />
      <main className="min-h-screen pt-[68px] md:pt-[76px]">
        <HeroNew />
        <AboutSection />
        <FeatureSection />
        <AudienceSection />
      </main>
      <Footer />
    </div>
  );
}
