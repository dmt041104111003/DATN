export const ADMIN_COMPANY_NAME = 'DICKSON INVESTMENT GROUP';
export const ADMIN_LOGO_URL = '/logo.png';

export const ADMIN_NAV_ITEMS = [
  { href: '/admin/categories', labelKey: 'navCategories' as const },
  { href: '/admin/products', labelKey: 'navProducts' as const },
] as const;

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'zh', label: '中文' },
  { id: 'fr', label: 'Français' },
] as const;

export type LangId = (typeof LANGUAGES)[number]['id'];
