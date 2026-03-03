import { Language, CoreValue } from '@/types';

export const CORE_VALUES: CoreValue[] = [
  {
    id: 'care',
    title: { en: 'Care' },
    description: {
      en: 'We care about transparency and trust. We listen to producers and consumers alike, and we design our traceability solutions to honor every step of the supply chain and the people behind it.',
    },
    icon: '/khatvong.svg',
  },
  {
    id: 'creativity',
    title: { en: 'Creativity' },
    description: {
      en: 'We constantly innovate to make origin traceability simple and accessible — from QR codes and blockchain to clear, readable journey data — so that trust is easy to verify.',
    },
    icon: '/sangtao.svg',
  },
  {
    id: 'aspiration',
    title: { en: 'Aspiration' },
    description: {
      en: 'We aim to set the standard for transparent supply chains in the region, helping break through limits and build a future where every product can be traced back to its origin.',
    },
    icon: '/khatvong.svg',
  },
  {
    id: 'integrity',
    title: { en: 'Integrity' },
    description: {
      en: 'We uphold integrity in all we do: our data is accurate, our systems are reliable, and we prioritize what is right for consumers and partners.',
    },
    icon: '/chinhtruc.svg',
  },
  {
    id: 'efficiency',
    title: { en: 'Efficiency' },
    description: {
      en: 'We deliver traceability that works at scale — for small producers and large supply chains — with optimal use of technology and clear, actionable information.',
    },
    icon: '/hieuqua.svg',
  },
];

export const CORE_VALUES_TITLE: Record<Language, string> = {
  en: 'CORE VALUES',
};
