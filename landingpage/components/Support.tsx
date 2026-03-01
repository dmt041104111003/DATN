'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from './Header';
import { useLanguage } from '@/context/LanguageProvider';
import { MENU_ITEMS } from '@/constants/menu';

const SLIDE_IMAGES = ['/slide1.jpg', '/slide2.jpg', '/slide3.jpg', '/slide4.jpg'];
const SLIDE_INTERVAL_MS = 5000;

export function Support() {
  const { language } = useLanguage();
  const [slideIndex, setSlideIndex] = useState(0);
  const title = MENU_ITEMS.find((m) => m.id === 'support')?.label[language] ?? 'Support';

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="support" className="relative w-full min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        {SLIDE_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === slideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/30 z-20" aria-hidden />
      </div>

      <Header />

      <div className="relative z-30 flex-1 flex items-center justify-center px-4 pt-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg text-center">
          {title}
        </h1>
      </div>
    </section>
  );
}
