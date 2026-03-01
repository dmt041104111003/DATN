'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { FAQ_CONTENT } from '@/constants/support';
import { Header } from './Header';

export function FAQ() {
  const { language } = useLanguage();
  const content = FAQ_CONTENT[language];
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="relative w-full min-h-screen flex flex-col bg-[#F8F6F7] dark:bg-gray-900">
      <Header />
      
      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 pb-8 md:pb-12">
        <div className="text-center px-4 md:px-8 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-3 md:mb-4">
            {content.title[language]}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {content.subtitle[language]}
          </p>
        </div>

        <div className="flex-1 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {content.items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 md:px-8 py-4 md:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 pr-4">
                    {item.question[language]}
                  </h3>
                  <span className="material-icons text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {openItems.includes(item.id) ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openItems.includes(item.id) && (
                  <div className="px-6 md:px-8 pb-4 md:pb-5">
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.answer[language]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
