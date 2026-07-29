import type { ThemeColorKey } from '../../domain/theme/models';

export type ThemeColorTranslationKey = `colors.${ThemeColorKey}`;

export const themeColorTranslationKeys = {
  pageBackground: 'colors.pageBackground',
  sidebarBackground: 'colors.sidebarBackground',
  sidebarActiveBackground: 'colors.sidebarActiveBackground',
  cardBackground: 'colors.cardBackground',
  tableHeaderBackground: 'colors.tableHeaderBackground',
  editorHoverBackground: 'colors.editorHoverBackground',
  primaryText: 'colors.primaryText',
  secondaryText: 'colors.secondaryText',
  mutedText: 'colors.mutedText',
  sidebarText: 'colors.sidebarText',
  sidebarActiveText: 'colors.sidebarActiveText',
  border: 'colors.border',
  accent: 'colors.accent',
  focusRing: 'colors.focusRing',
  progressTrack: 'colors.progressTrack',
  statsPanelBackground: 'colors.statsPanelBackground',
  statsPanelBorder: 'colors.statsPanelBorder',
  statsPanelPrimaryText: 'colors.statsPanelPrimaryText',
  statsPanelSecondaryText: 'colors.statsPanelSecondaryText',
  statsPanelProgressTrack: 'colors.statsPanelProgressTrack',
  statsPanelProgressFill: 'colors.statsPanelProgressFill',
  completedBackground: 'colors.completedBackground',
  completedText: 'colors.completedText',
  completedBorder: 'colors.completedBorder',
  inProgressBackground: 'colors.inProgressBackground',
  inProgressText: 'colors.inProgressText',
  inProgressBorder: 'colors.inProgressBorder',
  postponedBackground: 'colors.postponedBackground',
  postponedText: 'colors.postponedText',
  postponedBorder: 'colors.postponedBorder',
  cancelledBackground: 'colors.cancelledBackground',
  cancelledText: 'colors.cancelledText',
  cancelledBorder: 'colors.cancelledBorder',
} as const satisfies Readonly<Record<ThemeColorKey, ThemeColorTranslationKey>>;

export function translateThemeColorLabel(
  translate: (key: ThemeColorTranslationKey) => string,
  colorKey: ThemeColorKey,
) {
  return translate(themeColorTranslationKeys[colorKey]);
}
