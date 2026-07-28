export type DayThemeMode = 'light' | 'dark' | 'adaptive';
export type DayThemeTextTone = 'light' | 'dark';
export type DayThemeCategory = 'calm' | 'warm' | 'nature' | 'night' | 'seasonal' | 'minimal';
export type DayThemeTypographyRole = 'ui' | 'journal' | 'display';

export interface DayThemeTokens {
  readonly pageBackground: string;
  readonly daySurface: string;
  readonly daySurfaceRaised: string;
  readonly dayText: string;
  readonly dayTextMuted: string;
  readonly dayBorder: string;
  readonly accent: string;
  readonly accentHover: string;
  readonly accentSoft: string;
  readonly focusRing: string;
}

export interface DayThemeDefinition {
  readonly id: string;
  readonly version: number;
  readonly nameKey: `theme:${string}`;
  readonly descriptionKey: `theme:${string}`;
  readonly mode: DayThemeMode;
  readonly tokens: DayThemeTokens;
  readonly cover: {
    readonly assetId?: string;
    readonly fallbackGradient: string;
    readonly overlay: string;
    readonly textTone: DayThemeTextTone;
    readonly motifAssetId?: string;
  };
  readonly calendar: {
    readonly indicatorColor: string;
    readonly symbol?: string;
  };
  readonly typography?: {
    readonly journalFontRole?: DayThemeTypographyRole;
    readonly headingWeight?: number;
  };
  readonly metadata: {
    readonly category: DayThemeCategory;
    readonly builtIn: boolean;
    readonly premium?: boolean;
  };
}

export interface DayThemeReference {
  readonly id: string;
  readonly version: number;
}

export type DayThemeResolutionSource = 'exact' | 'compatible' | 'default' | 'emergency';

export interface ResolvedDayTheme {
  readonly definition: DayThemeDefinition;
  readonly source: DayThemeResolutionSource;
  readonly requested: DayThemeReference | null;
}
