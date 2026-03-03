'use client';

import { useLanguage } from '@/context/LanguageProvider';
import { CORE_VALUES, CORE_VALUES_TITLE } from '@/constants/coreValues';
import { Header } from './Header';

export function CoreValues() {
  const { language } = useLanguage();

  return (
    <section id="core-values" className="relative w-full h-screen flex flex-col bg-[#f2f2f2] overflow-hidden">
      <Header />
      
      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 pb-4 md:pb-6">
        <div className="text-center px-4 md:px-8 mb-4 md:mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200">
            {CORE_VALUES_TITLE[language]}
          </h1>
        </div>

        <div className="flex-1 px-4 md:px-8 lg:px-16 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-6 lg:mb-8">
              {CORE_VALUES.slice(0, 3).map((value, index) => (
                <div
                  key={value.id}
                  className="flex flex-col text-left space-y-2"
                >
                  <div className="text-5xl md:text-6xl lg:text-7xl font-light text-[#c41e3a]/30 leading-none">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1">
                    {value.title[language]}
                  </h3>
                  
                  <div className="w-full h-0.5 bg-[#c41e3a]/40 my-2"></div>
                  
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed text-justify">
                    {value.description[language]}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 w-full max-w-4xl">
                {CORE_VALUES.slice(3, 5).map((value, index) => (
                  <div
                    key={value.id}
                    className="flex flex-col text-left space-y-2"
                  >
                    <div className="text-5xl md:text-6xl lg:text-7xl font-light text-[#c41e3a]/30 leading-none">
                      {String(index + 4).padStart(2, '0')}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1">
                      {value.title[language]}
                    </h3>
                    
                    <div className="w-full h-0.5 bg-[#c41e3a]/40 my-2"></div>
                    
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed text-justify">
                      {value.description[language]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
