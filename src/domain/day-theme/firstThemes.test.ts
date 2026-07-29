import { describe, expect, it } from 'vitest';
import { resources } from '../../i18n/resources';
import { flattenResource } from '../../i18n/resourceValidation';
import {
  dayThemeAssetIds,
  isKnownDayThemeAssetId,
  loadDayThemeAsset,
} from './assets';
import { firstDayThemes } from './firstThemes';
import { validateDayThemeDefinition } from './validation';

function luminance(hex: string): number {
  const channels =
    hex
      .slice(1)
      .match(/.{2}/g)
      ?.map((value) => Number.parseInt(value, 16) / 255) ?? [];
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function gradientStops(gradient: string): string[] {
  return gradient.match(/#[0-9a-f]{6}/gi) ?? [];
}

describe('first Day Theme definitions', () => {
  it('defines exactly Sakura, Coffee and Rainy at version 1 as immutable adaptive themes', () => {
    expect(
      firstDayThemes.map((theme) => [theme.id, theme.version, theme.mode]),
    ).toEqual([
      ['sakura', 1, 'adaptive'],
      ['coffee', 1, 'adaptive'],
      ['rainy', 1, 'adaptive'],
    ]);
    for (const theme of firstDayThemes) {
      expect(validateDayThemeDefinition(theme)).toEqual([]);
      expect(Object.isFrozen(theme)).toBe(true);
      expect(Object.isFrozen(theme.tokens)).toBe(true);
      expect(Object.isFrozen(theme.variants?.dark.tokens)).toBe(true);
    }
  });

  it('keeps body, muted text, focus and cover text contrast at accessible levels', () => {
    for (const theme of firstDayThemes) {
      for (const variant of [theme.variants?.light, theme.variants?.dark]) {
        expect(variant).toBeDefined();
        if (!variant) continue;
        expect(
          contrast(variant.tokens.dayText, variant.tokens.daySurface),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrast(variant.tokens.dayText, variant.tokens.pageBackground),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrast(variant.tokens.dayTextMuted, variant.tokens.daySurface),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrast(variant.tokens.focusRing, variant.tokens.daySurface),
        ).toBeGreaterThanOrEqual(3);
        const coverText =
          variant.cover.textTone === 'light'
            ? '#ffffff'
            : variant.tokens.dayText;
        for (const stop of gradientStops(variant.cover.fallbackGradient)) {
          expect(contrast(coverText, stop)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('uses known logical motif IDs without paths or network URLs', async () => {
    expect(dayThemeAssetIds).toHaveLength(3);
    for (const theme of firstDayThemes) {
      const assetId = theme.cover.motifAssetId;
      expect(assetId).toBeDefined();
      expect(assetId && isKnownDayThemeAssetId(assetId)).toBe(true);
      expect(JSON.stringify(theme)).not.toMatch(
        /https?:|[A-Za-z]:\\|(?:^|["'])\//,
      );
    }
    await expect(
      loadDayThemeAsset('theme.missing.cover.motif'),
    ).resolves.toBeNull();
  });

  it('provides natural Vietnamese and English names and descriptions', () => {
    for (const locale of ['vi', 'en'] as const) {
      const catalog = flattenResource(resources[locale].theme);
      for (const theme of firstDayThemes) {
        expect(
          catalog[theme.nameKey.replace('theme:', '')]?.trim(),
        ).toBeTruthy();
        expect(
          catalog[theme.descriptionKey.replace('theme:', '')]?.trim(),
        ).toBeTruthy();
      }
    }
  });
});
