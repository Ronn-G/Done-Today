import type {CSSProperties, ReactNode} from 'react';
import type {ResolvedDayTheme} from '../../domain/day-theme/models';

type DayThemeStyle = CSSProperties & Record<`--day-${string}`, string | number>;

export function DayThemeScope({
  resolvedTheme,
  children,
}: {
  resolvedTheme: ResolvedDayTheme;
  children: ReactNode;
}) {
  const {definition} = resolvedTheme;
  const style: DayThemeStyle = {
    '--day-page-background': definition.tokens.pageBackground,
    '--day-surface': definition.tokens.daySurface,
    '--day-surface-raised': definition.tokens.daySurfaceRaised,
    '--day-text': definition.tokens.dayText,
    '--day-text-muted': definition.tokens.dayTextMuted,
    '--day-border': definition.tokens.dayBorder,
    '--day-accent': definition.tokens.accent,
    '--day-accent-hover': definition.tokens.accentHover,
    '--day-accent-soft': definition.tokens.accentSoft,
    '--day-focus-ring': definition.tokens.focusRing,
    '--day-cover-gradient': definition.cover.fallbackGradient,
    '--day-cover-overlay': definition.cover.overlay,
    '--day-calendar-indicator': definition.calendar.indicatorColor,
    '--day-heading-weight': definition.typography?.headingWeight ?? 700,
  };
  return <div
    className="day-theme-scope"
    data-day-theme-resolution={resolvedTheme.source}
    data-day-theme-mode={definition.mode}
    style={style}
  >{children}</div>;
}
