import {isValidHexColor,calculateContrastRatio} from './colors';
import {radiusValues,type PaletteMode,type ThemeColors,type ThemeMode,type ThemePreferences} from './models';
const variables:Readonly<Record<keyof ThemeColors,string>>={
  pageBackground:'--bg-page',sidebarBackground:'--bg-sidebar',sidebarActiveBackground:'--bg-sidebar-active',
  cardBackground:'--bg-card',tableHeaderBackground:'--bg-table-header',editorHoverBackground:'--bg-editor-hover',
  primaryText:'--text-primary',secondaryText:'--text-secondary',mutedText:'--text-muted',sidebarText:'--text-on-sidebar',
  sidebarActiveText:'--text-on-sidebar-active',border:'--border',accent:'--accent',focusRing:'--focus-ring',progressTrack:'--progress-track',
  statsPanelBackground:'--stats-bg',statsPanelBorder:'--stats-border',statsPanelPrimaryText:'--stats-text-primary',
  statsPanelSecondaryText:'--stats-text-secondary',statsPanelProgressTrack:'--stats-progress-track',statsPanelProgressFill:'--stats-progress-fill',
  completedBackground:'--badge-done-bg',completedText:'--badge-done-text',completedBorder:'--badge-done-border',
  inProgressBackground:'--badge-inprogress-bg',inProgressText:'--badge-inprogress-text',inProgressBorder:'--badge-inprogress-border',
  postponedBackground:'--badge-postponed-bg',postponedText:'--badge-postponed-text',postponedBorder:'--badge-postponed-border',
  cancelledBackground:'--badge-cancelled-bg',cancelledText:'--badge-cancelled-text',cancelledBorder:'--badge-cancelled-border',
};
export function applyThemeVariables(colors:ThemeColors,root:HTMLElement=document.documentElement){
  (Object.keys(variables) as Array<keyof ThemeColors>).forEach(key=>{if(isValidHexColor(colors[key]))root.style.setProperty(variables[key],colors[key])});
}
export function applyThemePreferences(preferences:ThemePreferences,palette:PaletteMode,root:HTMLElement=document.documentElement){
  applyThemeVariables(palette==='dark'?preferences.darkColors:preferences.lightColors,root);
  root.style.setProperty('--radius-card',radiusValues[preferences.borderRadius]);root.style.setProperty('--radius-control',radiusValues[preferences.borderRadius]);
}
export function resolvePalette(mode:ThemeMode,systemDark:boolean):PaletteMode{return mode==='system'?(systemDark?'dark':'light'):mode}
export const contrastPairs=[
  ['primaryText','pageBackground'],['primaryText','cardBackground'],['secondaryText','cardBackground'],
  ['statsPanelPrimaryText','statsPanelBackground'],['statsPanelSecondaryText','statsPanelBackground'],
  ['sidebarText','sidebarBackground'],['sidebarActiveText','sidebarActiveBackground'],['completedText','completedBackground'],
  ['inProgressText','inProgressBackground'],['postponedText','postponedBackground'],['cancelledText','cancelledBackground'],
] as const satisfies readonly (readonly [keyof ThemeColors,keyof ThemeColors])[];
export function lowContrastPairs(colors:ThemeColors){return contrastPairs.filter(([text,background])=>calculateContrastRatio(colors[text],colors[background])<4.5)}
