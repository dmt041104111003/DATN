'use client';

import { useLanguage } from '@/context/LanguageProvider';
import { TEAM_MEMBERS, TEAM_TITLE } from '@/constants/team';
import Image from 'next/image';
import Link from 'next/link';
import { Language } from '@/types';

const DETAILS_MORE: Record<Language, string> = {
  en: 'Details more',
  vi: 'Xem thêm',
  zh: '更多详情',
  fr: 'Plus de détails',
};

const PREVIEW_COUNT = 3;

export function TeamPreview() {
  const { language } = useLanguage();
  const title = TEAM_TITLE[language];
  const members = TEAM_MEMBERS.slice(0, PREVIEW_COUNT);

  return (
    <section id="team-preview" className="relative w-full flex flex-col bg-white dark:bg-gray-900 pt-12 md:pt-16 pb-12 md:pb-16">
      <div className="relative z-10 flex flex-col px-4 md:px-8 lg:px-16">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8 md:mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center text-center space-y-3"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={member.image}
                  alt={member.name[language]}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <h3 className="text-base md:text-lg font-bold text-black dark:text-gray-200">
                {member.name[language]}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {member.position[language]}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 md:mt-10">
          <Link
            href="/team"
            className="inline-flex items-center justify-center px-10 py-2.5 md:px-14 md:py-3 text-sm md:text-base font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-full transition-colors"
          >
            {DETAILS_MORE[language]}
          </Link>
        </div>
      </div>
    </section>
  );
}
