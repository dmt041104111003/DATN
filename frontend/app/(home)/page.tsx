"use client";

import { HeroNew } from "@/components/HeroNew";
import { AboutSection } from "@/components/AboutSection";
import { FeatureSection } from "@/components/FeatureSection";
import { AudienceSection } from "@/components/AudienceSection";

export default function Page() {
  return (
    <main className="">
      <HeroNew />
      <AboutSection />
      <FeatureSection />
      <AudienceSection />
    </main>
  );
}