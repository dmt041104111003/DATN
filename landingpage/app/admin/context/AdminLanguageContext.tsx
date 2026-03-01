'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LangId } from '../constants/admin';

type AdminLanguageContextValue = {
  adminLang: LangId;
  setAdminLang: (lang: LangId) => void;
};

const AdminLanguageContext = createContext<AdminLanguageContextValue | null>(null);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [adminLang, setAdminLangState] = useState<LangId>('vi');
  const setAdminLang = useCallback((lang: LangId) => setAdminLangState(lang), []);
  return (
    <AdminLanguageContext.Provider value={{ adminLang, setAdminLang }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage(): AdminLanguageContextValue {
  const ctx = useContext(AdminLanguageContext);
  if (!ctx) throw new Error('useAdminLanguage must be used within AdminLanguageProvider');
  return ctx;
}
