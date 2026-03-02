'use client';

import { useLanguage } from '@/context/LanguageProvider';
import { HERO_CONTENT } from '@/constants/hero';
import Link from 'next/link';
import { Header } from './Header';
import { getHeroContent } from '@/utils/hero';
import { Globe } from '@/components/globe';

export function Hero() {
  const { language } = useLanguage();
  const content = getHeroContent(HERO_CONTENT, language);

  return (
    <section id="hero" className="relative w-full h-screen flex flex-col overflow-hidden bg-[#f6f6f6] dark:bg-gray-900 service hero-section">
      <Header />

      <div className="relative flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-10 pl-4 pr-4 md:pl-0 md:pr-6 lg:pr-8 pt-20 md:pt-24 pb-6 min-h-0 overflow-hidden">
        <div className="relative z-10 flex flex-col items-start text-left w-full max-w-xl pl-4 md:pl-0 md:-ml-[28rem] lg:-ml-[32rem] xl:-ml-[36rem]">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-2 md:mb-3 tracking-wide">
            {content.tagline}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 leading-tight mb-4 md:mb-6">
            {content.titleLine1}
            <br />
            {content.titleLine2}
          </h1>
          <Link
            href="#about"
            className="text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-[#ee2c2c] dark:hover:text-red-400 transition-colors border-b-2 border-[#ee2c2c] dark:border-red-500 pb-0.5 w-fit"
          >
            {content.ctaText}
          </Link>
        </div>

        <Globe />
      </div>
    </section>
  );
}
