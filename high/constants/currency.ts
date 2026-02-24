import { Language } from '@/types';

export const VND_PER_UNIT: Record<Exclude<Language, 'vi'>, number> = {
  en: 25_000,   // 1 USD ≈ 25,000 VND
  zh: 3_500,    // 1 CNY ≈ 3,500 VND
  fr: 27_000,   // 1 EUR ≈ 27,000 VND
};

export const CURRENCY_BY_LANGUAGE: Record<Language, string> = {
  vi: 'VND',
  en: 'USD',
  zh: 'CNY',
  fr: 'EUR',
};

export const PRICE_LOCALE: Record<Language, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  zh: 'zh-CN',
  fr: 'fr-FR',
};

export function convertPriceByLanguage(priceVnd: number, language: Language): number {
  if (language === 'vi') return priceVnd;
  const rate = VND_PER_UNIT[language];
  return Math.round((priceVnd / rate) * 100) / 100;
}
