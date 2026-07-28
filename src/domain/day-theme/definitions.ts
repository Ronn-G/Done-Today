import type {DayThemeDefinition} from './models';
import {defineDayTheme} from './defineDayTheme';
import {firstDayThemes} from './firstThemes';

export const DEFAULT_DAY_THEME_ID = 'done-today-default';
export const DEFAULT_DAY_THEME_VERSION = 1;

export const doneTodayDefaultDayTheme: DayThemeDefinition = defineDayTheme({
  id: DEFAULT_DAY_THEME_ID,
  version: DEFAULT_DAY_THEME_VERSION,
  nameKey: 'theme:dayTheme.doneTodayDefault.name',
  descriptionKey: 'theme:dayTheme.doneTodayDefault.description',
  mode: 'adaptive',
  tokens: {
    pageBackground: 'var(--app-page-background)',
    daySurface: 'var(--app-day-surface)',
    daySurfaceRaised: 'var(--app-day-surface-raised)',
    dayText: 'var(--app-day-text)',
    dayTextMuted: 'var(--app-day-text-muted)',
    dayBorder: 'var(--app-day-border)',
    accent: 'var(--app-day-accent)',
    accentHover: 'var(--app-day-accent-hover)',
    accentSoft: 'var(--app-day-accent-soft)',
    focusRing: 'var(--app-day-focus-ring)',
  },
  cover: {
    fallbackGradient: 'linear-gradient(135deg, var(--app-day-surface) 0%, var(--app-page-background) 100%)',
    overlay: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--app-day-surface) 18%, transparent) 100%)',
    textTone: 'dark',
  },
  calendar: {
    indicatorColor: 'var(--app-day-accent)',
  },
  typography: {
    journalFontRole: 'journal',
    headingWeight: 700,
  },
  metadata: {
    category: 'minimal',
    builtIn: true,
  },
});

export const builtInDayThemes: readonly DayThemeDefinition[] = Object.freeze([
  doneTodayDefaultDayTheme,
  ...firstDayThemes,
]);
