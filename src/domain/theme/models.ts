import {z} from 'zod';

export const themeModeSchema=z.enum(['light','dark','system']);
export type ThemeMode=z.infer<typeof themeModeSchema>;
export const paletteModeSchema=z.enum(['light','dark']);
export type PaletteMode=z.infer<typeof paletteModeSchema>;
export const borderRadiusSchema=z.enum(['square','subtle','rounded','soft']);
export type BorderRadius=z.infer<typeof borderRadiusSchema>;
export const hexColorSchema=z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const themeColorsSchema=z.object({
  pageBackground:hexColorSchema,sidebarBackground:hexColorSchema,sidebarActiveBackground:hexColorSchema,
  cardBackground:hexColorSchema,tableHeaderBackground:hexColorSchema,editorHoverBackground:hexColorSchema,
  primaryText:hexColorSchema,secondaryText:hexColorSchema,mutedText:hexColorSchema,
  sidebarText:hexColorSchema,sidebarActiveText:hexColorSchema,border:hexColorSchema,accent:hexColorSchema,
  focusRing:hexColorSchema,progressTrack:hexColorSchema,
  statsPanelBackground:hexColorSchema,statsPanelBorder:hexColorSchema,
  statsPanelPrimaryText:hexColorSchema,statsPanelSecondaryText:hexColorSchema,
  statsPanelProgressTrack:hexColorSchema,statsPanelProgressFill:hexColorSchema,
  completedBackground:hexColorSchema,completedText:hexColorSchema,completedBorder:hexColorSchema,
  inProgressBackground:hexColorSchema,inProgressText:hexColorSchema,inProgressBorder:hexColorSchema,
  postponedBackground:hexColorSchema,postponedText:hexColorSchema,postponedBorder:hexColorSchema,
  cancelledBackground:hexColorSchema,cancelledText:hexColorSchema,cancelledBorder:hexColorSchema,
}).strict();
export type ThemeColors=z.infer<typeof themeColorsSchema>;

export const themePreferencesSchema=z.object({
  selectedPresetId:z.string().max(40),lightColors:themeColorsSchema,darkColors:themeColorsSchema,
  borderRadius:borderRadiusSchema,updatedAt:z.string().datetime(),schemaVersion:z.literal(2),
}).strict();
export type ThemePreferences=z.infer<typeof themePreferencesSchema>;

const legacyThemeColorsSchema=themeColorsSchema.omit({
  statsPanelBackground:true,statsPanelBorder:true,statsPanelPrimaryText:true,
  statsPanelSecondaryText:true,statsPanelProgressTrack:true,statsPanelProgressFill:true,
});
const legacyThemePreferencesSchema=z.object({
  selectedPresetId:z.string().max(40),lightColors:legacyThemeColorsSchema,darkColors:legacyThemeColorsSchema,
  borderRadius:borderRadiusSchema,updatedAt:z.string().datetime(),schemaVersion:z.literal(1),
}).strict();
function upgradeColors(colors:z.infer<typeof legacyThemeColorsSchema>):ThemeColors{
  return{...colors,statsPanelBackground:colors.cardBackground,statsPanelBorder:colors.border,
    statsPanelPrimaryText:colors.primaryText,statsPanelSecondaryText:colors.secondaryText,
    statsPanelProgressTrack:colors.progressTrack,statsPanelProgressFill:colors.accent};
}
export function parseThemePreferences(value:unknown):ThemePreferences{
  const current=themePreferencesSchema.safeParse(value);if(current.success)return current.data;
  const legacy=legacyThemePreferencesSchema.parse(value);
  return{...legacy,lightColors:upgradeColors(legacy.lightColors),darkColors:upgradeColors(legacy.darkColors),schemaVersion:2};
}

export const radiusValues:Readonly<Record<BorderRadius,string>>={
  square:'4px',subtle:'8px',rounded:'12px',soft:'16px',
};
