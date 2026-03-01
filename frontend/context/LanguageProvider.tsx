'use client';

import { createContext, useContext, type ReactNode } from 'react';

type Language = 'en';

const LanguageContext = createContext<{ language: Language }>({ language: 'en' });

export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageContext.Provider value={{ language: 'en' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en' as Language };
  }
  return context;
}
