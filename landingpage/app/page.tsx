'use client';

import { Suspense } from 'react';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { CoreValues } from '@/components/CoreValues';
import { History } from '@/components/History';
import { Network } from '@/components/Network';
import { DoanhSo } from '@/components/DoanhSo';
import { TeamPreview } from '@/components/TeamPreview';
import { SupportPreview } from '@/components/SupportPreview';
import { Footer } from '@/components/Footer';
import { useScrollHash } from '@/hooks/useScrollHash';

function HomeContent() {
  useScrollHash();
  return (
    <main className="min-h-screen m-0 p-0">
      <Hero />
      <About />
      <CoreValues />
      <History />
      <Network />
      <DoanhSo />
      <TeamPreview />
      <SupportPreview />
      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen m-0 p-0 bg-white dark:bg-gray-900" />}>
      <HomeContent />
    </Suspense>
  );
}
