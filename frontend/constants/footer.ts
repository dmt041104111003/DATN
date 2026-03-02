import { Language, FooterContent } from '@/types';

export const FOOTER_CONTENT: Record<Language, FooterContent> = {
  en: {
    logo: {
      name: 'Origin Traceability',
      slogan: 'Transparent supply chains — Trusted products',
    },
    contact: {
      address: 'Hanoi, Vietnam',
      hotline: 'Hotline: (84) 24 xxxx xxxx',
      hotlineBackup: 'Backup: (84) 24 xxxx xxxx',
      email: 'contact@traceability.vn',
    },
    social: {
      title: 'Connect with us',
    },
    apps: {
      title: 'Download our app',
      appStore: 'Download on App Store',
      googlePlay: 'Download on Google Play',
    },
  },
};
