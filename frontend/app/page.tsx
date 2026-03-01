'use client';

import { LanguageProvider } from '@/context/LanguageProvider';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { CoreValues } from '@/components/CoreValues';
import { History } from '@/components/History';
import { Network } from '@/components/Network';
import { Contact } from '@/components/Contact';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <LanguageProvider>
      <main>
        <Hero />
        <About />
        <CoreValues />
        <History />
        <Network />
        <Contact />
        <FAQ />
        <Footer />
      </main>
    </LanguageProvider>
  );
}
