'use client';

import { useLanguage } from '@/context/LanguageProvider';
import { Header } from './Header';
import { NETWORK_CONTENT } from '@/constants/network';
import { getNetworkContent } from '@/utils/network';
import { Globe } from '@/components/globe';

export function Network() {
  const { language } = useLanguage();
  const content = getNetworkContent(NETWORK_CONTENT, language);

  return (
    <section id="network" className="relative w-full min-h-screen flex flex-col bg-[#f2f2f2] service network-section">
      <Header />

      <Globe />

      <div className="relative z-10 flex-1 flex flex-col pt-24 md:pt-32 pb-8 md:pb-16">
        <div className="text-center px-4 md:px-8 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200">
            {content.title}
          </h1>
        </div>

        <div className="flex-1 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl relative z-20">
              {content.items && (
                <ul className="space-y-3 md:space-y-4">
                  {content.items[language].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#c41e3a] mt-1 text-lg md:text-xl">•</span>
                      <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed flex-1">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
