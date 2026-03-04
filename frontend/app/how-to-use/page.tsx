'use client';

import { LanguageProvider } from '@/context/LanguageProvider';
import { Header } from '@/components/Header';
import { HowToUse } from '../../components/HowToUse';
import { Footer } from '@/components/Footer';
import { FAQ } from '@/components/FAQ';
import { Contact } from '@/components/Contact';

export default function HowToUsePage() {
  return (
    <LanguageProvider>
      <>
       
        <Header />
          <HowToUse />
        <FAQ />
        <Contact />
        <Footer />
      </>
    </LanguageProvider>
  );
}

