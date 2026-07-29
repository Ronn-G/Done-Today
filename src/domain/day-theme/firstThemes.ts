import { defineDayTheme } from './defineDayTheme';
import type {
  DayThemeCoverStyle,
  DayThemeDefinition,
  DayThemeTokens,
} from './models';

const sakuraLight: DayThemeTokens = {
  pageBackground: '#fffafc',
  daySurface: '#fffefe',
  daySurfaceRaised: '#fff3f7',
  dayText: '#352a30',
  dayTextMuted: '#6e5a64',
  dayBorder: '#e6cfd8',
  accent: '#a74368',
  accentHover: '#863451',
  accentSoft: '#f8e4eb',
  focusRing: '#8c3455',
};

const sakuraDark: DayThemeTokens = {
  pageBackground: '#1a1518',
  daySurface: '#241c20',
  daySurfaceRaised: '#30242a',
  dayText: '#f6edf1',
  dayTextMuted: '#c8b2bc',
  dayBorder: '#55404a',
  accent: '#e59ab5',
  accentHover: '#f0b0c5',
  accentSoft: '#3c2931',
  focusRing: '#f3b6ca',
};

const sakuraLightCover: DayThemeCoverStyle = {
  fallbackGradient: 'linear-gradient(135deg, #fff7fa 0%, #f3d9e2 100%)',
  overlay:
    'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.32) 100%)',
  textTone: 'dark',
};

const sakuraDarkCover: DayThemeCoverStyle = {
  fallbackGradient: 'linear-gradient(135deg, #4b2c39 0%, #2c2027 100%)',
  overlay:
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(16,8,12,0.18) 100%)',
  textTone: 'light',
};

const coffeeLight: DayThemeTokens = {
  pageBackground: '#fbf7ef',
  daySurface: '#fffdf8',
  daySurfaceRaised: '#f4eadb',
  dayText: '#332820',
  dayTextMuted: '#6b594b',
  dayBorder: '#d9c5aa',
  accent: '#8a4f2d',
  accentHover: '#6e3d24',
  accentSoft: '#efe0cf',
  focusRing: '#7a4529',
};

const coffeeDark: DayThemeTokens = {
  pageBackground: '#191511',
  daySurface: '#241e19',
  daySurfaceRaised: '#312820',
  dayText: '#f5ede3',
  dayTextMuted: '#c8b8a5',
  dayBorder: '#56483b',
  accent: '#d69a6d',
  accentHover: '#e5ad82',
  accentSoft: '#3b2d23',
  focusRing: '#efb98e',
};

const coffeeLightCover: DayThemeCoverStyle = {
  fallbackGradient: 'linear-gradient(135deg, #fbf0dd 0%, #dcc3a0 100%)',
  overlay:
    'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,250,240,0.26) 100%)',
  textTone: 'dark',
};

const coffeeDarkCover: DayThemeCoverStyle = {
  fallbackGradient: 'linear-gradient(135deg, #4a3425 0%, #282018 100%)',
  overlay:
    'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(16,10,6,0.18) 100%)',
  textTone: 'light',
};

const rainyLight: DayThemeTokens = {
  pageBackground: '#f4f8fa',
  daySurface: '#fbfdfe',
  daySurfaceRaised: '#e8f0f4',
  dayText: '#24343d',
  dayTextMuted: '#566b76',
  dayBorder: '#c4d3da',
  accent: '#3d728c',
  accentHover: '#2f5c72',
  accentSoft: '#dceaf0',
  focusRing: '#2f6a85',
};

const rainyDark: DayThemeTokens = {
  pageBackground: '#12191d',
  daySurface: '#1b252a',
  daySurfaceRaised: '#243239',
  dayText: '#edf4f7',
  dayTextMuted: '#b5c6ce',
  dayBorder: '#42545d',
  accent: '#7db4cc',
  accentHover: '#9cc9db',
  accentSoft: '#283b44',
  focusRing: '#9acbe0',
};

const rainyLightCover: DayThemeCoverStyle = {
  fallbackGradient: 'linear-gradient(135deg, #35566b 0%, #536f80 100%)',
  overlay:
    'linear-gradient(180deg, rgba(12,31,42,0.04) 0%, rgba(12,31,42,0.22) 100%)',
  textTone: 'light',
};

const rainyDarkCover: DayThemeCoverStyle = {
  fallbackGradient: 'linear-gradient(135deg, #223843 0%, #15252d 100%)',
  overlay:
    'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(5,16,22,0.20) 100%)',
  textTone: 'light',
};

export const sakuraDayTheme: DayThemeDefinition = defineDayTheme({
  id: 'sakura',
  version: 1,
  nameKey: 'theme:dayTheme.sakura.name',
  descriptionKey: 'theme:dayTheme.sakura.description',
  mode: 'adaptive',
  tokens: sakuraLight,
  cover: { ...sakuraLightCover, motifAssetId: 'theme.sakura.cover.motif' },
  variants: {
    light: { tokens: sakuraLight, cover: sakuraLightCover },
    dark: { tokens: sakuraDark, cover: sakuraDarkCover },
  },
  calendar: { indicatorColor: '#b85d7d', symbol: '✿' },
  typography: { journalFontRole: 'journal', headingWeight: 700 },
  metadata: { category: 'seasonal', builtIn: true },
});

export const coffeeDayTheme: DayThemeDefinition = defineDayTheme({
  id: 'coffee',
  version: 1,
  nameKey: 'theme:dayTheme.coffee.name',
  descriptionKey: 'theme:dayTheme.coffee.description',
  mode: 'adaptive',
  tokens: coffeeLight,
  cover: { ...coffeeLightCover, motifAssetId: 'theme.coffee.cover.motif' },
  variants: {
    light: { tokens: coffeeLight, cover: coffeeLightCover },
    dark: { tokens: coffeeDark, cover: coffeeDarkCover },
  },
  calendar: { indicatorColor: '#98623f', symbol: '◌' },
  typography: { journalFontRole: 'journal', headingWeight: 700 },
  metadata: { category: 'warm', builtIn: true },
});

export const rainyDayTheme: DayThemeDefinition = defineDayTheme({
  id: 'rainy',
  version: 1,
  nameKey: 'theme:dayTheme.rainy.name',
  descriptionKey: 'theme:dayTheme.rainy.description',
  mode: 'adaptive',
  tokens: rainyLight,
  cover: { ...rainyLightCover, motifAssetId: 'theme.rainy.cover.motif' },
  variants: {
    light: { tokens: rainyLight, cover: rainyLightCover },
    dark: { tokens: rainyDark, cover: rainyDarkCover },
  },
  calendar: { indicatorColor: '#527f96', symbol: '⋮' },
  typography: { journalFontRole: 'journal', headingWeight: 700 },
  metadata: { category: 'calm', builtIn: true },
});

export const firstDayThemes: readonly DayThemeDefinition[] = Object.freeze([
  sakuraDayTheme,
  coffeeDayTheme,
  rainyDayTheme,
]);
