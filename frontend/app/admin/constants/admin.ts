export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products', roles: ['ENTERPRISE'] as const },
  { href: '/admin/warehouse', label: 'Warehouse', roles: ['ENTERPRISE', 'TRANSIT', 'AGENT'] as const },
  { href: '/admin/multisig-lock', label: 'Lock' },
  { href: '/admin/multisig-unlock', label: 'Unlock' },
  { href: '/admin/account', label: 'Account' },
] as const;
