'use client';

import { LanguageProvider } from '@/context/LanguageProvider';
import { Trace } from '@/components/Trace';

export default function TracePage() {
  return (
    <LanguageProvider>
      <main className="h-screen overflow-hidden">
        <Trace />
      </main>
    </LanguageProvider>
  );
}
