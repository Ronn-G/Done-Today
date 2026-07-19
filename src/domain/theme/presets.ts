import type {ThemeColors,ThemePreferences} from './models';
export interface ThemePreset{readonly id:string;readonly name:string;readonly description:string;readonly lightColors:ThemeColors;readonly darkColors:ThemeColors;readonly preview:readonly string[]}
const palette=(values:Partial<ThemeColors>,dark=false):ThemeColors=>({
  pageBackground:dark?'#141815':'#FAFAF7',sidebarBackground:dark?'#202923':'#E9EFEA',sidebarActiveBackground:dark?'#2D3A32':'#D7E4DA',
  cardBackground:dark?'#1D231F':'#FFFFFF',tableHeaderBackground:dark?'#252C28':'#F2F3EF',editorHoverBackground:dark?'#252E29':'#F4F7F4',
  primaryText:dark?'#F2F3F0':'#1C1C1A',secondaryText:dark?'#C4C8C4':'#5C5C58',mutedText:dark?'#989E99':'#767672',
  sidebarText:dark?'#B8C5BC':'#46564B',sidebarActiveText:dark?'#F3F7F4':'#173D31',border:dark?'#3C463F':'#E5E4DD',accent:dark?'#65B99D':'#0F6E56',
  focusRing:dark?'#92D8C0':'#0F6E56',progressTrack:dark?'#3C463F':'#E5E4DD',
  statsPanelBackground:dark?'#202B25':'#F0F6F2',statsPanelBorder:dark?'#35463C':'#D4E4D8',
  statsPanelPrimaryText:dark?'#F2F5F3':'#173D31',statsPanelSecondaryText:dark?'#B8C6BE':'#51665A',
  statsPanelProgressTrack:dark?'#3B4D42':'#D7E4DA',statsPanelProgressFill:dark?'#65B99D':'#0F6E56',
  completedBackground:dark?'#193F34':'#E1F5EE',completedText:dark?'#B8EAD8':'#085041',completedBorder:dark?'#34705D':'#9BD5C2',
  inProgressBackground:dark?'#45391F':'#FAEEDA',inProgressText:dark?'#F3D594':'#633806',inProgressBorder:dark?'#725E32':'#DFC18A',
  postponedBackground:dark?'#473126':'#F6E6DC',postponedText:dark?'#EFC0A4':'#7A3F22',postponedBorder:dark?'#74503D':'#E2BFA9',
  cancelledBackground:dark?'#343735':'#ECECEA',cancelledText:dark?'#D2D5D2':'#51514E',cancelledBorder:dark?'#565B57':'#CFCECA',...values,
});
const make=(id:string,name:string,description:string,light:Partial<ThemeColors>,dark:Partial<ThemeColors>,preview:string[]):ThemePreset=>
  Object.freeze({id,name,description,lightColors:Object.freeze(palette(light)),darkColors:Object.freeze(palette(dark,true)),preview:Object.freeze(preview)});
export const themePresets:readonly ThemePreset[]=Object.freeze([
  make('done-today','Done Today','Xanh lá ấm, cân bằng và tập trung.',{}, {},['#1F3A2E','#0F6E56','#FAFAF7','#E1F5EE']),
  make('forest','Forest','Xanh rừng sâu trên nền kem.',{pageBackground:'#F7F3E8',sidebarBackground:'#E7EBDD',sidebarActiveBackground:'#D4DEC8',sidebarText:'#4D5A47',sidebarActiveText:'#273D2B',accent:'#567A46',statsPanelBackground:'#EEF2E3',statsPanelBorder:'#D6DFC7',statsPanelPrimaryText:'#293D2D',statsPanelSecondaryText:'#566453',statsPanelProgressTrack:'#D8E1CB',statsPanelProgressFill:'#567A46'},{pageBackground:'#151B16',sidebarBackground:'#202A22',sidebarActiveBackground:'#2D3A30',accent:'#8FB77A',statsPanelBackground:'#202A22',statsPanelBorder:'#39493C',statsPanelProgressTrack:'#3A4A3D',statsPanelProgressFill:'#8FB77A'},['#E7EBDD','#567A46','#F7F3E8','#DCE8C8']),
  make('ocean','Ocean','Navy, xanh biển và nền sáng lạnh.',{pageBackground:'#F3F8FB',sidebarBackground:'#E6EFF4',sidebarActiveBackground:'#D3E4EC',sidebarText:'#435D6B',sidebarActiveText:'#173E52',accent:'#167D9A',statsPanelBackground:'#EAF4F8',statsPanelBorder:'#CEE3EB',statsPanelPrimaryText:'#153E51',statsPanelSecondaryText:'#4C6978',statsPanelProgressTrack:'#D1E6ED',statsPanelProgressFill:'#167D9A'},{pageBackground:'#101A24',sidebarBackground:'#1B2833',sidebarActiveBackground:'#263948',accent:'#55B8D2',statsPanelBackground:'#192A36',statsPanelBorder:'#304755',statsPanelProgressTrack:'#334C5B',statsPanelProgressFill:'#55B8D2'},['#E6EFF4','#167D9A','#F3F8FB','#CDEAF1']),
  make('lavender','Lavender','Tím dịu, thanh lịch và ít bão hòa.',{pageBackground:'#F8F6FB',sidebarBackground:'#EEEAF3',sidebarActiveBackground:'#E0D9EA',sidebarText:'#5F566A',sidebarActiveText:'#40344F',accent:'#75629A',statsPanelBackground:'#F0ECF6',statsPanelBorder:'#DED5E9',statsPanelPrimaryText:'#42364F',statsPanelSecondaryText:'#665A70',statsPanelProgressTrack:'#DED6E8',statsPanelProgressFill:'#75629A'},{pageBackground:'#19171F',sidebarBackground:'#27232E',sidebarActiveBackground:'#373143',accent:'#AD98D1',statsPanelBackground:'#272330',statsPanelBorder:'#443C50',statsPanelProgressTrack:'#493F57',statsPanelProgressFill:'#AD98D1'},['#EEEAF3','#75629A','#F8F6FB','#E7DFF1']),
  make('warm-sand','Warm Sand','Be, nâu ấm và olive nhẹ.',{pageBackground:'#FAF5E9',sidebarBackground:'#F0E9D9',sidebarActiveBackground:'#E2D8C2',sidebarText:'#635C4B',sidebarActiveText:'#433D2E',accent:'#77733E',statsPanelBackground:'#F3EAD7',statsPanelBorder:'#E2D4B8',statsPanelPrimaryText:'#463E2C',statsPanelSecondaryText:'#6B614D',statsPanelProgressTrack:'#E1D5BB',statsPanelProgressFill:'#77733E'},{pageBackground:'#1D1A14',sidebarBackground:'#2B271E',sidebarActiveBackground:'#3B3527',accent:'#B7AE68',statsPanelBackground:'#2D281D',statsPanelBorder:'#4B432F',statsPanelProgressTrack:'#504832',statsPanelProgressFill:'#B7AE68'},['#F0E9D9','#77733E','#FAF5E9','#E9D9B8']),
  make('monochrome','Monochrome','Xám trung tính, sạch và yên tĩnh.',{pageBackground:'#F6F6F6',sidebarBackground:'#ECEDEE',sidebarActiveBackground:'#DCDEE0',sidebarText:'#555A5E',sidebarActiveText:'#292D30',accent:'#55595D',statsPanelBackground:'#ECEEEF',statsPanelBorder:'#D6D9DB',statsPanelPrimaryText:'#292D30',statsPanelSecondaryText:'#5B6064',statsPanelProgressTrack:'#D7DADC',statsPanelProgressFill:'#55595D'},{pageBackground:'#151617',sidebarBackground:'#232526',sidebarActiveBackground:'#323536',accent:'#B8BDC1',statsPanelBackground:'#242627',statsPanelBorder:'#3C4042',statsPanelProgressTrack:'#45494B',statsPanelProgressFill:'#B8BDC1'},['#ECEDEE','#777B7F','#F6F6F6','#D8DADC']),
]);
export const defaultPreset=themePresets[0];
export function preferencesFromPreset(preset:ThemePreset,borderRadius:ThemePreferences['borderRadius']='rounded'):ThemePreferences{
  return{selectedPresetId:preset.id,lightColors:{...preset.lightColors},darkColors:{...preset.darkColors},borderRadius,updatedAt:new Date().toISOString(),schemaVersion:2};
}
export function defaultThemePreferences(){return preferencesFromPreset(defaultPreset)}
export function selectPreset(id:string){return preferencesFromPreset(themePresets.find(preset=>preset.id===id)??defaultPreset)}
export function updateThemeColor(preferences:ThemePreferences,mode:'light'|'dark',key:keyof ThemeColors,value:string):ThemePreferences{
  const paletteKey=mode==='light'?'lightColors':'darkColors';
  return{...preferences,selectedPresetId:'custom',[paletteKey]:{...preferences[paletteKey],[key]:value},updatedAt:new Date().toISOString()};
}
