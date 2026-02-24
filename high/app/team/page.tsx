'use client';

import { Suspense } from 'react';
import { TeamBanner } from '@/components/TeamBanner';
import { Team } from '@/components/Team';
import { Footer } from '@/components/Footer';

function TeamPageContent() {
  return (
    <main className="min-h-screen m-0 p-0">
      <TeamBanner />
      <Team />
      <Footer />
    </main>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<main className="min-h-screen m-0 p-0 bg-white dark:bg-gray-900" />}>
      <TeamPageContent />
    </Suspense>
  );
}
