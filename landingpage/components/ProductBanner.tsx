'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Header } from './Header';
import { useLanguage } from '@/context/LanguageProvider';
import { MENU_ITEMS } from '@/constants/menu';
import type { Language } from '@/types';

type CategoryBanner = {
  labelEn: string;
  labelVi: string;
  labelZh: string;
  labelFr: string;
  descriptionEn: string | null;
  descriptionVi: string | null;
  descriptionZh: string | null;
  descriptionFr: string | null;
  imageUrl: string | null;
};

const labelByLang: Record<Language, keyof Pick<CategoryBanner, 'labelEn' | 'labelVi' | 'labelZh' | 'labelFr'>> = {
  en: 'labelEn',
  vi: 'labelVi',
  zh: 'labelZh',
  fr: 'labelFr',
};
const descByLang: Record<Language, keyof Pick<CategoryBanner, 'descriptionEn' | 'descriptionVi' | 'descriptionZh' | 'descriptionFr'>> = {
  en: 'descriptionEn',
  vi: 'descriptionVi',
  zh: 'descriptionZh',
  fr: 'descriptionFr',
};

export function ProductBanner() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const [category, setCategory] = useState<CategoryBanner | null>(null);

  useEffect(() => {
    if (!type) {
      setCategory(null);
      return;
    }
    fetch(`/api/categories/${encodeURIComponent(type)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CategoryBanner | null) => setCategory(data))
      .catch(() => setCategory(null));
  }, [type]);

  const fallbackTitle = MENU_ITEMS.find((m) => m.id === 'products')?.label[language] ?? 'Products';
  const title = category ? category[labelByLang[language]] : fallbackTitle;
  const description = category ? (category[descByLang[language]] ?? category.descriptionVi ?? category.descriptionEn) : null;
  const bannerImage = category?.imageUrl?.trim() ? category.imageUrl : '/logo.png';

  return (
    <section id="product-banner" className="relative w-full min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerImage}
          alt=""
          fill
          priority
          unoptimized={bannerImage.startsWith('http')}
          className="object-cover"
          sizes="100vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
        <div className="absolute inset-0 bg-black/30 z-10" aria-hidden />
      </div>

      <Header />

      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 pt-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-3xl text-3xl md:text-4xl text-white/95 drop-shadow-md">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
