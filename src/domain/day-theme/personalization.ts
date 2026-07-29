import { z } from 'zod';

export const coverVariantSchema = z.enum(['minimal']);
export const daySymbolSchema = z.enum([
  'none',
  'sparkle',
  'focus',
  'growth',
  'calm',
  'celebrate',
]);
export const journalFontRoleSchema = z.enum(['ui', 'journal']);

export type CoverVariant = z.infer<typeof coverVariantSchema>;
export type DaySymbol = z.infer<typeof daySymbolSchema>;
export type JournalFontRole = z.infer<typeof journalFontRoleSchema>;

export const dayPersonalizationSchema = z.object({
  coverVariant: coverVariantSchema.nullable(),
  daySymbol: daySymbolSchema.nullable(),
  journalFontRole: journalFontRoleSchema.nullable(),
});
export type DayPersonalization = z.infer<typeof dayPersonalizationSchema>;

export type StoredDayPersonalization = {
  coverVariant: string | null;
  daySymbol: string | null;
  journalFontRole: string | null;
};

export const defaultDayPersonalization: DayPersonalization = Object.freeze({
  coverVariant: null,
  daySymbol: null,
  journalFontRole: null,
});

export const coverVariantOptions = Object.freeze([
  { id: null, labelKey: 'personalization.cover.default' },
  { id: 'minimal', labelKey: 'personalization.cover.minimal' },
] as const);

export const daySymbolOptions = Object.freeze([
  { id: null, labelKey: 'personalization.symbol.default' },
  { id: 'none', labelKey: 'personalization.symbol.none' },
  { id: 'sparkle', labelKey: 'personalization.symbol.sparkle' },
  { id: 'focus', labelKey: 'personalization.symbol.focus' },
  { id: 'growth', labelKey: 'personalization.symbol.growth' },
  { id: 'calm', labelKey: 'personalization.symbol.calm' },
  { id: 'celebrate', labelKey: 'personalization.symbol.celebrate' },
] as const);

export const journalFontRoleOptions = Object.freeze([
  { id: null, labelKey: 'personalization.font.default' },
  { id: 'ui', labelKey: 'personalization.font.ui' },
  { id: 'journal', labelKey: 'personalization.font.journal' },
] as const);

export function resolveDayPersonalization(
  stored: StoredDayPersonalization,
): DayPersonalization {
  return {
    coverVariant: coverVariantSchema.safeParse(stored.coverVariant).success
      ? (stored.coverVariant as CoverVariant)
      : null,
    daySymbol: daySymbolSchema.safeParse(stored.daySymbol).success
      ? (stored.daySymbol as DaySymbol)
      : null,
    journalFontRole: journalFontRoleSchema.safeParse(stored.journalFontRole)
      .success
      ? (stored.journalFontRole as JournalFontRole)
      : null,
  };
}

export function hasNonDefaultPersonalization(
  value: DayPersonalization,
): boolean {
  return Object.values(value).some((entry) => entry !== null);
}
