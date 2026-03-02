export type Theme = 'light' | 'dark';

export type Language = 'en';

export interface HeroContent {
  greeting: string;
  question: string;
  searchPlaceholder: string;
  tagline: string;
  titleLine1: string;
  titleLine2: string;
  ctaText: string;
  categories: Category[];
}

export interface Category {
  id: string;
  label: Record<Language, string>;
  icon: string;
}

export interface MenuItem {
  id: string;
  label: Record<Language, string>;
  labelGuest?: Record<Language, string>;
  hasDropdown?: boolean;
  dropdownContent?: DropdownContent;
}

export interface DropdownContent {
  leftColumn: DropdownTextItem[];
  rightColumn: DropdownIconItem[];
}

export interface DropdownTextItem {
  id: string;
  label: Record<Language, string>;
}

export interface DropdownIconItem {
  id: string;
  label: Record<Language, string>;
  icon: string;
}

export interface BottomNavItem {
  id: string;
  label: Record<Language, string>;
  icon: string;
}

export interface AboutContent {
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  cta?: Record<Language, string>;
  strategyTitle?: Record<Language, string>;
  strategyDescription?: Record<Language, string>;
  vision?: {
    title: Record<Language, string>;
    content: Record<Language, string>;
  };
  mission?: {
    title: Record<Language, string>;
    content: Record<Language, string>;
  };
}

export interface CoreValue {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
}

export interface HistoryItem {
  year: string;
  title: Record<Language, string>;
  milestones: Record<Language, string[]>;
  image: string;
}

export interface NetworkContent {
  title: string;
  items?: Record<Language, string[]>;
}

export interface TeamMember {
  id: string;
  name: Record<Language, string>;
  position: Record<Language, string>;
  image: string;
  bio?: Record<Language, string>;
  experience?: Record<Language, string[]>;
  education?: Record<Language, string>;
}

export interface FooterContent {
  logo: {
    name: string;
    slogan: string;
  };
  contact: {
    address: string;
    hotline: string;
    hotlineBackup: string;
    email: string;
  };
  social: {
    title: string;
  };
  apps: {
    title: string;
    appStore: string;
    googlePlay: string;
  };
}

export interface ContactContent {
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  form: {
    topic?: Record<Language, string>;
    topicPlaceholder?: Record<Language, string>;
    topics?: {
      general?: Record<Language, string>;
      support?: Record<Language, string>;
      feedback?: Record<Language, string>;
    };
    name: Record<Language, string>;
    namePlaceholder: Record<Language, string>;
    email: Record<Language, string>;
    emailPlaceholder: Record<Language, string>;
    phone: Record<Language, string>;
    phonePlaceholder: Record<Language, string>;
    subject: Record<Language, string>;
    subjectPlaceholder: Record<Language, string>;
    message: Record<Language, string>;
    messageLabel?: Record<Language, string>;
    messagePlaceholder: Record<Language, string>;
    submit: Record<Language, string>;
  };
  info: {
    title?: Record<Language, string>;
    description?: Record<Language, string>;
    address: Record<Language, string>;
    phone: Record<Language, string>;
    fax?: Record<Language, string>;
    hotline?: Record<Language, string>;
    email?: Record<Language, string>;
    workingHours?: Record<Language, string>;
  };
}

export interface FAQItem {
  id: string;
  question: Record<Language, string>;
  answer: Record<Language, string>;
}

export interface FAQContent {
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  items: FAQItem[];
}

export interface SupportContent {
  greeting: string;
  question: string;
  searchPlaceholder: string;
}

export interface ProductCategoryItem {
  id: string;
  label: Record<Language, string>;
  icon: string;
}

export type ProductType = string;

export interface ProductSpecRow {
  label: Record<Language, string>;
  value: Record<Language, string>;
}

export interface ProductItem {
  id: string;
  name: Record<Language, string>;
  image: string;
  categoryId: string;
  categorySlug?: string;
  slug: string;
  description?: Record<Language, string>;
  descriptionBlocks?: Array<{ title?: Record<Language, string>; text: Record<Language, string>; image?: string | null; youtubeUrl?: string | null }>;
  specs?: ProductSpecRow[];
  categoryLabel?: Record<Language, string>;
  useLogoPlaceholder?: boolean;
  youtubeUrl?: string | null;
}
