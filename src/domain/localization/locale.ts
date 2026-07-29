export const supportedLocales = ['vi', 'en'] as const;
export type AppLocale = (typeof supportedLocales)[number];
export const compatibilityLocale: AppLocale = 'vi';
export const resourceFallbackLocale: AppLocale = 'en';
const compatibleLocaleTags: Readonly<Record<string, AppLocale>> = {
  vi: 'vi',
  'vi-vn': 'vi',
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
};

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === 'string' && supportedLocales.includes(value as AppLocale)
  );
}

export function normalizeLocale(value: unknown): AppLocale | null {
  if (typeof value !== 'string') return null;
  return compatibleLocaleTags[value.trim().toLowerCase()] ?? null;
}

export function resolveLocale(persistedLocale: unknown): AppLocale {
  return isAppLocale(persistedLocale) ? persistedLocale : compatibilityLocale;
}
