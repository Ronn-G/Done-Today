import { describe, expect, it } from 'vitest';
import {
  applyThemeVariables,
  lowContrastPairs,
  resolvePalette,
} from './applyTheme';
import {
  calculateContrastRatio,
  calculateRelativeLuminance,
  isValidHexColor,
  normalizeHexColor,
} from './colors';
import {
  defaultThemePreferences,
  selectPreset,
  themePresetIds,
  themePresets,
  updateThemeColor,
} from './presets';
import {
  parseThemePreferences,
  themePreferencesSchema,
  type ThemeColors,
} from './models';
describe('theme colors', () => {
  it('validates supported HEX', () => {
    expect(isValidHexColor('#abc')).toBe(true);
    expect(isValidHexColor('#A1b2C3')).toBe(true);
  });
  it('rejects unsafe CSS', () => {
    for (const value of ['red', 'var(--x)', 'url(x)', '#12', 'rgba(0,0,0,1)'])
      expect(isValidHexColor(value)).toBe(false);
  });
  it('normalizes short HEX', () =>
    expect(normalizeHexColor('#a3F')).toBe('#AA33FF'));
  it('calculates luminance', () => {
    expect(calculateRelativeLuminance('#000000')).toBe(0);
    expect(calculateRelativeLuminance('#FFFFFF')).toBe(1);
  });
  it('calculates contrast', () =>
    expect(calculateContrastRatio('#000', '#fff')).toBeCloseTo(21));
  it('detects low contrast', () =>
    expect(
      lowContrastPairs({
        ...defaultThemePreferences().lightColors,
        primaryText: '#FFFFFF',
        pageBackground: '#FFFFFF',
      }).some((pair) => pair[1] === 'pageBackground'),
    ).toBe(true));
  it('applies only whitelisted variables including table header and stats', () => {
    const values = new Map<string, string>();
    const root = {
      style: {
        setProperty: (key: string, value: string) => values.set(key, value),
      },
    } as unknown as HTMLElement;
    applyThemeVariables(defaultThemePreferences().lightColors, root);
    expect(values.get('--bg-page')).toBe('#FAFAF7');
    expect(values.get('--bg-table-header')).toBe('#F2F3EF');
    expect(values.get('--stats-bg')).toBe('#F0F6F2');
    expect(values.get('--stats-progress-fill')).toBe('#0F6E56');
    expect(values.has('--evil')).toBe(false);
  });
  it('selects every immutable preset with complete stats tokens', () => {
    for (const preset of themePresets) {
      const selected = selectPreset(preset.id);
      expect(selected.selectedPresetId).toBe(preset.id);
      expect(
        themePreferencesSchema.parse(selected).lightColors.statsPanelBackground,
      ).toMatch(/^#/);
    }
  });
  it('keeps stable preset IDs ordered and presentation copy out of the domain registry', () => {
    expect(themePresets.map((preset) => preset.id)).toEqual(themePresetIds);
    for (const preset of themePresets) {
      expect(preset).not.toHaveProperty('name');
      expect(preset).not.toHaveProperty('description');
    }
    expect(JSON.stringify(selectPreset('forest'))).not.toMatch(
      /Forest|Rừng xanh/,
    );
  });
  it('editing creates custom without mutating preset', () => {
    const preset = themePresets[0];
    const original = preset.lightColors.accent;
    const next = updateThemeColor(
      selectPreset(preset.id),
      'light',
      'accent',
      '#123456',
    );
    expect(next.selectedPresetId).toBe('custom');
    expect(preset.lightColors.accent).toBe(original);
  });
  it('keeps light and dark table-header colors independent through serialization', () => {
    const initial = defaultThemePreferences();
    const light = updateThemeColor(
      initial,
      'light',
      'tableHeaderBackground',
      '#123456',
    );
    const both = updateThemeColor(
      light,
      'dark',
      'tableHeaderBackground',
      '#654321',
    );
    const parsed = parseThemePreferences(JSON.parse(JSON.stringify(both)));
    expect(parsed.selectedPresetId).toBe('custom');
    expect(parsed.lightColors.tableHeaderBackground).toBe('#123456');
    expect(parsed.darkColors.tableHeaderBackground).toBe('#654321');
    expect(initial.lightColors.tableHeaderBackground).toBe('#F2F3EF');
  });
  it('resets to default', () =>
    expect(defaultThemePreferences().selectedPresetId).toBe('done-today'));
  it('resolves light, dark and system palettes', () => {
    expect(resolvePalette('light', true)).toBe('light');
    expect(resolvePalette('dark', false)).toBe('dark');
    expect(resolvePalette('system', true)).toBe('dark');
  });
  it('detects low stats panel contrast', () => {
    const colors = {
      ...defaultThemePreferences().lightColors,
      statsPanelPrimaryText: '#FFFFFF',
      statsPanelBackground: '#FFFFFF',
    };
    expect(lowContrastPairs(colors)).toContainEqual([
      'statsPanelPrimaryText',
      'statsPanelBackground',
    ]);
  });
  it('keeps default sidebar and stats text readable', () => {
    for (const colors of [
      defaultThemePreferences().lightColors,
      defaultThemePreferences().darkColors,
    ]) {
      expect(
        calculateContrastRatio(colors.sidebarText, colors.sidebarBackground),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        calculateContrastRatio(
          colors.sidebarActiveText,
          colors.sidebarActiveBackground,
        ),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        calculateContrastRatio(
          colors.statsPanelPrimaryText,
          colors.statsPanelBackground,
        ),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        calculateContrastRatio(
          colors.statsPanelSecondaryText,
          colors.statsPanelBackground,
        ),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('upgrades schema v1 while preserving existing colors', () => {
    const current = defaultThemePreferences();
    const removeStats = (colors: ThemeColors) => {
      const legacy: Partial<ThemeColors> = { ...colors };
      for (const key of [
        'statsPanelBackground',
        'statsPanelBorder',
        'statsPanelPrimaryText',
        'statsPanelSecondaryText',
        'statsPanelProgressTrack',
        'statsPanelProgressFill',
      ] as const)
        delete legacy[key];
      return legacy;
    };
    const upgraded = parseThemePreferences({
      ...current,
      lightColors: removeStats(current.lightColors),
      darkColors: removeStats(current.darkColors),
      schemaVersion: 1,
    });
    expect(upgraded.schemaVersion).toBe(2);
    expect(upgraded.lightColors.accent).toBe(current.lightColors.accent);
    expect(upgraded.lightColors.statsPanelBackground).toBe(
      current.lightColors.cardBackground,
    );
    expect(upgraded.lightColors.statsPanelProgressFill).toBe(
      current.lightColors.accent,
    );
  });
  it('falls back safely when schema is corrupt', () => {
    const parsed = themePreferencesSchema.safeParse({ schemaVersion: 0 });
    expect(
      parsed.success ? parsed.data : defaultThemePreferences(),
    ).toMatchObject({ selectedPresetId: 'done-today' });
  });
});
