export const ADMIN_NAV_ITEMS = [
  { href: '/admin/categories', label: 'Quản lý loại' },
  { href: '/admin/products', label: 'Quản lý sản phẩm' },
] as const;

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'zh', label: '中文' },
  { id: 'fr', label: 'Français' },
] as const;

export type LangId = (typeof LANGUAGES)[number]['id'];
