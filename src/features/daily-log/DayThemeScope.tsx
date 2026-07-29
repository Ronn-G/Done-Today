import type { CSSProperties, ReactNode } from 'react';
import type {
  DayThemeCoverStyle,
  DayThemeTokens,
  ResolvedDayTheme,
} from '../../domain/day-theme/models';

type DayThemeStyle = CSSProperties & Record<`--day-${string}`, string | number>;

function coverText(cover: DayThemeCoverStyle, tokens: DayThemeTokens): string {
  return cover.textTone === 'light' ? '#ffffff' : tokens.dayText;
}

function applyVariant(
  style: DayThemeStyle,
  variant: 'light' | 'dark',
  tokens: DayThemeTokens,
  cover: DayThemeCoverStyle,
) {
  style[`--day-${variant}-page-background`] = tokens.pageBackground;
  style[`--day-${variant}-surface`] = tokens.daySurface;
  style[`--day-${variant}-surface-raised`] = tokens.daySurfaceRaised;
  style[`--day-${variant}-text`] = tokens.dayText;
  style[`--day-${variant}-text-muted`] = tokens.dayTextMuted;
  style[`--day-${variant}-border`] = tokens.dayBorder;
  style[`--day-${variant}-accent`] = tokens.accent;
  style[`--day-${variant}-accent-hover`] = tokens.accentHover;
  style[`--day-${variant}-accent-soft`] = tokens.accentSoft;
  style[`--day-${variant}-focus-ring`] = tokens.focusRing;
  style[`--day-${variant}-cover-gradient`] = cover.fallbackGradient;
  style[`--day-${variant}-cover-overlay`] = cover.overlay;
  style[`--day-${variant}-cover-text`] = coverText(cover, tokens);
}

export function DayThemeScope({
  resolvedTheme,
  children,
}: {
  resolvedTheme: ResolvedDayTheme;
  children: ReactNode;
}) {
  const { definition } = resolvedTheme;
  const light = definition.variants?.light ?? {
    tokens: definition.tokens,
    cover: definition.cover,
  };
  const dark = definition.variants?.dark ?? {
    tokens: definition.tokens,
    cover: definition.cover,
  };
  const style: DayThemeStyle = {
    '--day-calendar-indicator': definition.calendar.indicatorColor,
    '--day-heading-weight': definition.typography?.headingWeight ?? 700,
  };
  applyVariant(style, 'light', light.tokens, light.cover);
  applyVariant(style, 'dark', dark.tokens, dark.cover);
  return (
    <div
      className="day-theme-scope"
      data-day-theme-id={definition.id}
      data-day-theme-resolution={resolvedTheme.source}
      data-day-theme-mode={definition.mode}
      style={style}
    >
      {children}
    </div>
  );
}
