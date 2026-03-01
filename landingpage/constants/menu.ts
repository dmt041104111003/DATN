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
      vi: 'Trang chủ',
      zh: '首页',
      fr: 'Accueil',
    },
  },
  {
    id: 'products',
    label: {
      en: 'Products',
      vi: 'Sản phẩm',
      zh: '产品',
      fr: 'Produits',
    },
    hasDropdown: true,
    dropdownContent: PRODUCTS_DROPDOWN_CONTENT,
  },
  {
    id: 'team',
    label: {
      en: 'Team',
      vi: 'Đội ngũ',
      zh: '团队',
      fr: 'Équipe',
    },
  },
  {
    id: 'support',
    label: {
      en: 'Support',
      vi: 'Hỗ trợ',
      zh: '支持',
      fr: 'Support',
    },
  },
];

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    id: 'personal',
    label: {
      en: 'Personal',
      vi: 'Cá nhân',
      zh: '个人',
      fr: 'Personnel',
    },
    icon: 'people',
  },
  {
    id: 'household-business',
    label: {
      en: 'Household Business',
      vi: 'Hộ kinh doanh',
      zh: '家庭经营',
      fr: 'Entreprise familiale',
    },
    icon: 'home',
  },
  {
    id: 'sme',
    label: {
      en: 'SME Business',
      vi: 'Doanh nghiệp SME',
      zh: '中小企业',
      fr: 'PME',
    },
    icon: 'business',
  },
  {
    id: 'large-business',
    label: {
      en: 'Large Business',
      vi: 'Doanh nghiệp lớn',
      zh: '大型企业',
      fr: 'Grande entreprise',
    },
    icon: 'apartment',
  },
  {
    id: 'investor',
    label: {
      en: 'Investor',
      vi: 'Nhà đầu tư',
      zh: '投资者',
      fr: 'Investisseur',
    },
    icon: 'trending_up',
  },
  {
    id: 'about',
    label: {
      en: 'About Us',
      vi: 'Về chúng tôi',
      zh: '关于我们',
      fr: 'À propos',
    },
    icon: 'account_balance',
  },
];

export { PRODUCTS_DROPDOWN_CONTENT };
