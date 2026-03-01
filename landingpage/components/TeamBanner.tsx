'use client';

import Image from 'next/image';
import { Header } from './Header';
import { useLanguage } from '@/context/LanguageProvider';
import { MENU_ITEMS } from '@/constants/menu';

export function TeamBanner() {
  const { language } = useLanguage();
  const title = MENU_ITEMS.find((m) => m.id === 'team')?.label[language] ?? 'Team';

  return (
    <section id="team-banner" className="relative w-full min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/team.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30 z-10" aria-hidden />
      </div>

      <Header />

      <div className="relative z-20 flex-1 flex items-center justify-center px-4 pt-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg text-center">
          {title}
        </h1>
      </div>
    </section>
  );
}
