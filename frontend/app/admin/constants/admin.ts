export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products', roles: ['ENTERPRISE'] as const },
  { href: '/admin/account', label: 'Account' },
] as const;
