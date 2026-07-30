// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ThemePreferences } from '../../domain/theme/models';
import { defaultThemePreferences } from '../../domain/theme/presets';
import { initializeI18n } from '../../i18n';
import { ThemeCustomizerContent } from './ThemeSettings';
import type { ThemeCustomizerController } from './themeCustomizerController';

function controller(
  preferences: ThemePreferences,
  commit: ThemeCustomizerController['commit'],
): ThemeCustomizerController {
  return {
    mode: 'light',
    setMode: vi.fn(),
    preferences,
    setPreferences: vi.fn(),
    activePalette: 'light',
    saveState: 'idle',
    error: null,
    commit,
    flush: vi.fn(async () => undefined),
    retry: vi.fn(async () => undefined),
    reset: vi.fn(),
  };
}

afterEach(cleanup);

describe('App Theme specialized Settings controls', () => {
  it.each([
    ['accent', 'Accent', '#00FF00'],
    ['tableHeaderBackground', 'Table header', '#FF00FF'],
    ['statsPanelBackground', 'Statistics panel background', '#111111'],
    ['statsPanelBorder', 'Statistics panel border', '#FF0000'],
    ['statsPanelPrimaryText', 'Statistics panel primary text', '#FFFFFF'],
    ['statsPanelSecondaryText', 'Statistics panel secondary text', '#FFFF00'],
    ['statsPanelProgressTrack', 'Statistics progress track', '#444444'],
    ['statsPanelProgressFill', 'Statistics progress fill', '#00FFFF'],
  ] as const)(
    'updates only the %s draft key from its color input',
    async (key, label, expected) => {
      await initializeI18n('en');
      const initial = defaultThemePreferences();
      const commit = vi.fn();
      render(
        <ThemeCustomizerContent controller={controller(initial, commit)} />,
      );

      fireEvent.change(screen.getByLabelText(`Choose color: ${label}`), {
        target: { value: expected.toLowerCase() },
      });

      expect(commit).toHaveBeenCalledOnce();
      const next = commit.mock.calls[0][0] as ThemePreferences;
      expect(next.selectedPresetId).toBe('custom');
      expect(next.lightColors[key]).toBe(expected);
      expect(next.darkColors).toEqual(initial.darkColors);
      for (const otherKey of Object.keys(initial.lightColors) as Array<
        keyof ThemePreferences['lightColors']
      >)
        if (otherKey !== key)
          expect(next.lightColors[otherKey]).toBe(
            initial.lightColors[otherKey],
          );
    },
  );
});
