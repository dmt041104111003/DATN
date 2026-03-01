'use client';

import { useLanguage } from '@/context/LanguageProvider';
import { CONTACT_CONTENT } from '@/constants/support';
import Link from 'next/link';
import { Language } from '@/types';

const DETAILS_MORE: Record<Language, string> = {
  en: 'Details more',
  vi: 'Xem thêm',
  zh: '更多详情',
  fr: 'Plus de détails',
};

const SUPPORT_TITLE: Record<Language, string> = {
  en: 'Support',
  vi: 'Hỗ trợ',
  zh: '支持',
  fr: 'Support',
};

export function SupportPreview() {
  const { language } = useLanguage();
  const content = CONTACT_CONTENT[language];

  return (
    <section id="support-preview" className="relative w-full flex flex-col bg-[#F8F6F7] dark:bg-gray-800 pt-12 md:pt-16 pb-12 md:pb-16">
      <div className="relative z-10 flex flex-col px-4 md:px-8 lg:px-16">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8 md:mb-10">
          {SUPPORT_TITLE[language]}
        </h2>

        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {content.info.description?.[language] ?? 'We always value and appreciate customer feedback. Our customer care system operates 24/7.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center text-sm md:text-base">
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-200">Hotline: </span>
              <a
                href={`tel:${content.info.hotline?.[language]?.replace(/\s/g, '') || content.info.phone[language].replace(/\s/g, '')}`}
                className="font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                {content.info.hotline?.[language] || content.info.phone[language]}
              </a>
            </div>
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-200">Phone: </span>
              <a
                href={`tel:${content.info.phone[language].replace(/\s/g, '')}`}
                className="font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                {content.info.phone[language]}
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 md:mt-10">
          <Link
            href="/support"
            className="inline-flex items-center justify-center px-10 py-2.5 md:px-14 md:py-3 text-sm md:text-base font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-full transition-colors"
          >
            {DETAILS_MORE[language]}
          </Link>
        </div>
      </div>
    </section>
  );
}
