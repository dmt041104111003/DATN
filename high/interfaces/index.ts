export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface LanguageContextType {
  language: 'en' | 'vi' | 'zh' | 'fr';
  setLanguage: (lang: 'en' | 'vi' | 'zh' | 'fr') => void;
}
