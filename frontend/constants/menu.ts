import { MenuItem, DropdownContent, BottomNavItem } from '@/types';

const PRODUCTS_DROPDOWN_CONTENT: DropdownContent = {
  leftColumn: [],
  rightColumn: [],
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    label: {
      en: 'Home',
    },
  },

  {
    id: 'trace',
    label: {
      en: 'Trace',
    },
  },
    {
    id: 'how-to-use',
    label: {
      en: 'How to Use',
    },
  },
  {
    id: 'admin',
    label: {
      en: 'Admin',
    },
    labelGuest: {
      en: 'Connect wallet',
    },
  },
];

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    id: 'personal',
    label: { en: 'Personal' },
    icon: 'people',
  },
  {
    id: 'household-business',
    label: { en: 'Household Business' },
    icon: 'home',
  },
  {
    id: 'sme',
    label: { en: 'SME Business' },
    icon: 'business',
  },
  {
    id: 'large-business',
    label: { en: 'Large Business' },
    icon: 'apartment',
  },
  {
    id: 'investor',
    label: { en: 'Investor' },
    icon: 'trending_up',
  },
  {
    id: 'about',
    label: { en: 'About Us' },
    icon: 'account_balance',
  },
];

export { PRODUCTS_DROPDOWN_CONTENT };
