'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { ABOUT_CONTENT } from '@/constants/about';
import Image from 'next/image';
import { Header } from './Header';

export function About() {
  const { language } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState('/about.png');
  const content = ABOUT_CONTENT;

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
      setCurrentImage('/about.png');
    } else {
      setExpandedSection(section);
      if (section === 'strategy') {
        setCurrentImage('/about.png');
      } else if (section === 'vision') {
        setCurrentImage('/about-2.png');
      } else if (section === 'mission') {
        setCurrentImage('/about-3.png');
      }
    }
  };

  return (
    <section id="about" className="relative w-full h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <Header />

      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 overflow-hidden">
        <div className="text-center px-4 md:px-8 mb-4 md:mb-6 flex-shrink-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-2 md:mb-3">
            {content.title[language]}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {content.subtitle[language]}
          </p>
        </div>

        <div className="flex-1 px-4 md:px-8 lg:px-16 pb-4 md:pb-6 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 md:space-y-3 overflow-y-auto">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleSection('strategy')}
                  className="w-full flex items-center justify-between py-2 md:py-3 text-left"
                >
                  <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                    {content.strategyTitle?.[language]}
                  </span>
                  <span className="material-icons text-gray-600 dark:text-gray-400 transition-transform text-lg">
                    {expandedSection === 'strategy' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSection === 'strategy' && content.strategyDescription && (
                  <div className="pb-2 md:pb-3 space-y-3">
                    <div className="lg:hidden relative w-full h-[200px] rounded-lg overflow-hidden">
                      <Image
                        src={currentImage}
                        alt="Dickson Investment Group"
                        fill
                        priority
                        className="object-cover transition-opacity duration-300"
                        quality={90}
                      />
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                      {content.strategyDescription[language]}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleSection('vision')}
                  className="w-full flex items-center justify-between py-2 md:py-3 text-left"
                >
                  <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                    {content.vision?.title[language]}
                  </span>
                  <span className="material-icons text-gray-600 dark:text-gray-400 transition-transform text-lg">
                    {expandedSection === 'vision' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSection === 'vision' && content.vision && (
                  <div className="pb-2 md:pb-3 space-y-3">
                    <div className="lg:hidden relative w-full h-[200px] rounded-lg overflow-hidden">
                      <Image
                        src={currentImage}
                        alt="Dickson Investment Group"
                        fill
                        priority
                        className="object-cover transition-opacity duration-300"
                        quality={90}
                      />
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                      {content.vision.content[language]}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleSection('mission')}
                  className="w-full flex items-center justify-between py-2 md:py-3 text-left"
                >
                  <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                    {content.mission?.title[language]}
                  </span>
                  <span className="material-icons text-gray-600 dark:text-gray-400 transition-transform text-lg">
                    {expandedSection === 'mission' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSection === 'mission' && content.mission && (
                  <div className="pb-2 md:pb-3 space-y-3">
                    <div className="lg:hidden relative w-full h-[200px] rounded-lg overflow-hidden">
                      <Image
                        src={currentImage}
                        alt="Dickson Investment Group"
                        fill
                        priority
                        className="object-cover transition-opacity duration-300"
                        quality={90}
                      />
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                      {content.mission.content[language]}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block relative w-full h-full min-h-[200px] rounded-lg overflow-hidden">
              <Image
                src={currentImage}
                alt="Dickson Investment Group"
                fill
                priority
                className="object-cover transition-opacity duration-300"
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
