'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { FAQ_CONTENT } from '@/constants/support';
import { Header } from './Header';

export function FAQ() {
  const { language } = useLanguage();
  const content = FAQ_CONTENT[language];
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
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
          <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
            {content.items.map((item) => {
              const isOpen = openItem === item.id;
              return (
                <div key={item.id} className="transition-colors">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full py-3 md:py-3.5 flex items-start justify-between text-left"
                  >
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 pr-4">
                      {item.question[language]}
                    </h3>
                    <span className="material-icons text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-1 md:mt-1.5 pl-0 md:pl-0">
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.answer[language]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
