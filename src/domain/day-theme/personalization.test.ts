import { describe, expect, it } from 'vitest';
import {
  dayPersonalizationSchema,
  defaultDayPersonalization,
  hasNonDefaultPersonalization,
  resolveDayPersonalization,
} from './personalization';

describe('day personalization registry', () => {
  it('accepts only the three curated option families', () => {
    expect(
      dayPersonalizationSchema.parse({
        coverVariant: 'minimal',
        daySymbol: 'growth',
        journalFontRole: 'journal',
      }),
    ).toEqual({
      coverVariant: 'minimal',
      daySymbol: 'growth',
      journalFontRole: 'journal',
    });
    expect(() =>
      dayPersonalizationSchema.parse({
        coverVariant: 'photo',
        daySymbol: 'custom',
        journalFontRole: 'display',
      }),
    ).toThrow();
  });

  it('falls unknown stored IDs back to theme defaults without rewriting them', () => {
    const stored = {
      coverVariant: 'future-cover',
      daySymbol: 'future-symbol',
      journalFontRole: 'future-font',
    };
    expect(resolveDayPersonalization(stored)).toEqual(
      defaultDayPersonalization,
    );
    expect(stored).toEqual({
      coverVariant: 'future-cover',
      daySymbol: 'future-symbol',
      journalFontRole: 'future-font',
    });
  });

  it('distinguishes an all-default draft from a personalized empty day', () => {
    expect(hasNonDefaultPersonalization(defaultDayPersonalization)).toBe(false);
    expect(
      hasNonDefaultPersonalization({
        ...defaultDayPersonalization,
        daySymbol: 'none',
      }),
    ).toBe(true);
  });
});
