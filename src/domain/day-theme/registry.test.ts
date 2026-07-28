import {describe, expect, it} from 'vitest';
import {resources} from '../../i18n/resources';
import {flattenResource} from '../../i18n/resourceValidation';
import {doneTodayDefaultDayTheme, DEFAULT_DAY_THEME_ID, DEFAULT_DAY_THEME_VERSION} from './definitions';
import {DayThemeRegistry, dayThemeRegistry} from './registry';
import {DayThemeValidationError} from './validation';

const definition = (overrides: Record<string, unknown> = {}) => ({
  ...structuredClone(doneTodayDefaultDayTheme),
  id: 'test-theme',
  metadata: {...doneTodayDefaultDayTheme.metadata, builtIn: false},
  ...overrides,
});

describe('DayThemeRegistry', () => {
  it('registers a valid contract and exposes the four production built-ins in curated order', () => {
    const registry = new DayThemeRegistry([]);
    expect(registry.register(definition())).toMatchObject({id: 'test-theme', version: 1});
    expect(dayThemeRegistry.list().map(theme => theme.id)).toEqual([
      'done-today-default', 'sakura', 'coffee', 'rainy',
    ]);
    expect(dayThemeRegistry.list()[0]).toMatchObject({
      id: DEFAULT_DAY_THEME_ID,
      version: DEFAULT_DAY_THEME_VERSION,
      mode: 'adaptive',
      metadata: {builtIn: true},
    });
  });

  it.each([
    ['id', {id: 'Bad ID'}],
    ['version', {version: 0}],
    ['token', {tokens: {...doneTodayDefaultDayTheme.tokens, accent: 'url(https://invalid)'}}],
    ['gradient', {cover: {...doneTodayDefaultDayTheme.cover, fallbackGradient: '#fff'}}],
  ])('rejects an invalid %s', (_name, overrides) => {
    const registry = new DayThemeRegistry([]);
    expect(() => registry.register(definition(overrides))).toThrow(DayThemeValidationError);
  });

  it('resolves exact and latest compatible versions', () => {
    const registry = new DayThemeRegistry([
      definition(),
      definition({version: 2}),
      doneTodayDefaultDayTheme,
    ]);
    expect(registry.resolve('test-theme', 1)).toMatchObject({
      source: 'exact',
      definition: {id: 'test-theme', version: 1},
    });
    expect(registry.resolve('test-theme', 99)).toMatchObject({
      source: 'compatible',
      definition: {id: 'test-theme', version: 2},
      requested: {id: 'test-theme', version: 99},
    });
  });

  it('falls back from unknown metadata without changing the requested reference', () => {
    expect(dayThemeRegistry.resolve('future-theme', 7)).toMatchObject({
      source: 'default',
      definition: {id: DEFAULT_DAY_THEME_ID, version: 1},
      requested: {id: 'future-theme', version: 7},
    });
  });

  it('uses an immutable emergency fallback if the registry has no default', () => {
    const resolved = new DayThemeRegistry([]).resolve('missing', 1);
    expect(resolved.source).toBe('emergency');
    expect(Object.isFrozen(resolved.definition.tokens)).toBe(true);
  });

  it('stores immutable copies and accepts missing optional assets', () => {
    const source = structuredClone(definition());
    const mutableCover = source.cover as {assetId?: string; motifAssetId?: string};
    delete mutableCover.assetId;
    delete mutableCover.motifAssetId;
    const registry = new DayThemeRegistry([source]);
    (source.tokens as {accent: string}).accent = '#000000';
    const stored = registry.resolve('test-theme', 1).definition;
    expect(stored.tokens.accent).toBe(doneTodayDefaultDayTheme.tokens.accent);
    expect(Object.isFrozen(stored)).toBe(true);
  });

  it('has name and description resources in Vietnamese and English', () => {
    for (const locale of ['vi', 'en'] as const) {
      const theme = flattenResource(resources[locale].theme);
      for (const definition of dayThemeRegistry.list()) {
        expect(theme[definition.nameKey.replace('theme:', '')]).toBeTruthy();
        expect(theme[definition.descriptionKey.replace('theme:', '')]).toBeTruthy();
      }
    }
  });
});
