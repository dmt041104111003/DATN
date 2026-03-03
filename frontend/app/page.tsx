'use client';

import { LanguageProvider } from '@/context/LanguageProvider';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { CoreValues } from '@/components/CoreValues';
import { History } from '@/components/History';
import { Network } from '@/components/Network';
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

       
        <Footer />
      </main>
    </LanguageProvider>
  );
}
