import type { Language, NetworkContent } from '@/types';

export function getNetworkContent(
  contentMap: Record<Language, NetworkContent>,
  language: Language
): NetworkContent {
  return contentMap[language];
}
