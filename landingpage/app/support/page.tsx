'use client';

import { Suspense } from 'react';
import { Support } from '@/components/Support';
import { Contact } from '@/components/Contact';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

function SupportPageContent() {
  return (
    <main className="min-h-screen m-0 p-0">
      <Support />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<main className="min-h-screen m-0 p-0 bg-white dark:bg-gray-900" />}>
      <SupportPageContent />
    </Suspense>
  );
}
