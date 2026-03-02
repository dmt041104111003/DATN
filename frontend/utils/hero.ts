import type { Language, HeroContent } from '@/types';

export function getHeroContent(
  contentMap: Record<Language, HeroContent>,
  language: Language
): HeroContent {
  return contentMap[language];
}
