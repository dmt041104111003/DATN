'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { LANGUAGES, LANGUAGE_NAMES } from '@/constants/language';
import { Language } from '@/types';

const FLAG_CODES: Record<Language, string> = {
  en: 'gb',
  vi: 'vn',
  zh: 'cn',
  fr: 'fr',
};

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-colors backdrop-blur-sm"
        style={{
          borderRadius: '9999px',
        }}
        aria-label="Change language"
      >
        <span className={`fi fi-${FLAG_CODES[language]} text-base md:text-lg`}></span>
        <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200">
          {LANGUAGE_NAMES[language].substring(0, 2).toUpperCase()}
        </span>
        <span className="material-icons text-gray-700 dark:text-gray-200 text-sm">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-w-[120px] z-50 backdrop-blur-sm">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                language === lang
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <span className={`fi fi-${FLAG_CODES[lang]}`}></span>
              <span>{LANGUAGE_NAMES[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
