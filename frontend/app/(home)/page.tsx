"use client";

import { HeroNew } from "@/components/HeroNew";
import { AboutSection } from "@/components/AboutSection";
import { FeatureSection } from "@/components/FeatureSection";
import { AudienceSection } from "@/components/AudienceSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-[72px] md:pt-[88px] md:bg-[url('/a.png')] md:bg-contain md:bg-top md:bg-no-repeat">
        <HeroNew />
        <AboutSection />
        <FeatureSection />
        <AudienceSection />
      </main>
      <Footer />
    </>
  );
}