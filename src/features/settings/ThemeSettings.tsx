import {useState}from'react';
import{Moon,RotateCcw,Sun}from'lucide-react';
import{useTranslation}from'react-i18next';
import{lowContrastPairs}from'../../domain/theme/applyTheme';
import{normalizeHexColor}from'../../domain/theme/colors';
import type{PaletteMode,ThemeColorKey,ThemeMode,ThemePreferences}from'../../domain/theme/models';
import{selectPreset,themePresets,updateThemeColor}from'../../domain/theme/presets';
import type{ThemePresetId}from'../../domain/theme/presets';
import{translateThemeColorLabel}from'./themeColorTranslations';
import type{ThemeCustomizerController}from'./themeCustomizerController';
import{localizeAppError,toErrorTranslator}from'../../i18n/errorPresentation';

const groups:readonly{id:'surfaces'|'text'|'controls'|'todayStats'|'statuses';open?:boolean;fields:readonly ThemeColorKey[]}[]=[
  {id:'surfaces',open:true,fields:['pageBackground','sidebarBackground','sidebarActiveBackground','cardBackground','tableHeaderBackground','editorHoverBackground']},
  {id:'text',fields:['primaryText','secondaryText','mutedText','sidebarText','sidebarActiveText']},
  {id:'controls',fields:['accent','border','focusRing','progressTrack']},
  {id:'todayStats',open:true,fields:['statsPanelBackground','statsPanelBorder','statsPanelPrimaryText','statsPanelSecondaryText','statsPanelProgressTrack','statsPanelProgressFill']},
  {id:'statuses',fields:['completedBackground','completedText','completedBorder','inProgressBackground','inProgressText','inProgressBorder','postponedBackground','postponedText','postponedBorder','cancelledBackground','cancelledText','cancelledBorder']},
];

export function resolveColorControlInput(value:string,finalize=false){
  const trimmed=value.trim();const normalized=normalizeHexColor(trimmed);
  if(normalized&&(finalize||trimmed.length===7))return{draft:null,normalized,invalid:false}as const;
  return{draft:finalize?null:value,normalized:null,invalid:finalize||trimmed.length>7}as const;
}

function ColorControl({colorKey,label,value,onCommit,onFlush}:{colorKey:ThemeColorKey;label:string;value:string;onCommit:(key:ThemeColorKey,value:string)=>void;onFlush:()=>void}){
  const{t}=useTranslation('theme');
  const[draft,setDraft]=useState<string|null>(null);const[error,setError]=useState<string|null>(null);const raw=draft??value;
  const update=(next:string,finalize=false)=>{
    const resolution=resolveColorControlInput(next,finalize);
    setDraft(resolution.draft);setError(resolution.invalid?t('validation.colorHex'):null);
    if(resolution.normalized)onCommit(colorKey,resolution.normalized);
  };
  const blur=()=>{update(raw,true);onFlush()};
  return <label className="color-row"><span>{label}</span><input type="color" aria-label={t('colorPicker.choose',{fieldLabel:label})} value={value} onChange={event=>update(event.target.value,true)}/><input className={error?'invalid':''} aria-label={t('colorPicker.hexCode',{fieldLabel:label})} value={raw} onChange={event=>update(event.target.value)} onBlur={blur}/><i aria-hidden="true" style={{backgroundColor:value}}/>{error&&<small>{error}</small>}</label>;
}

export function ThemeModeSettings({mode,onSelect}:{mode:ThemeMode;onSelect:(mode:ThemeMode)=>void}){
  const{t}=useTranslation('theme');
  const labels:Record<ThemeMode,string>={light:t('mode.light'),dark:t('mode.dark'),system:t('mode.system')};
  return <section className="settings-card"><h2>{t('mode.heading')}</h2><p>{t('mode.description')}</p>
    <div className="theme-picker" role="group" aria-label={t('mode.optionsLabel')}>{(['light','dark','system']as const).map(value=><button type="button" key={value} className={mode===value?'selected':''} aria-pressed={mode===value} onClick={()=>onSelect(value)}>{value==='light'?<Sun size={16}/>:<Moon size={16}/>} {labels[value]}</button>)}</div>
  </section>;
}

export function ThemePresetSettings({preferences,onSelect}:{preferences:ThemePreferences;onSelect:(preferences:ThemePreferences)=>void}){
  const{t}=useTranslation('theme');
  const metadata={
    'done-today':{name:t('preset.doneToday.name'),description:t('preset.doneToday.description')},
    forest:{name:t('preset.forest.name'),description:t('preset.forest.description')},
    ocean:{name:t('preset.ocean.name'),description:t('preset.ocean.description')},
    lavender:{name:t('preset.lavender.name'),description:t('preset.lavender.description')},
    'warm-sand':{name:t('preset.warmSand.name'),description:t('preset.warmSand.description')},
    monochrome:{name:t('preset.monochrome.name'),description:t('preset.monochrome.description')},
  }satisfies Record<ThemePresetId,{name:string;description:string}>;
  return <section className="settings-card"><h2>{t('preset.heading')}</h2><p>{t('preset.description')}</p>
    <div className="preset-grid" role="group" aria-label={t('preset.optionsLabel')}>{themePresets.map(preset=>{const presentation=metadata[preset.id];return <button type="button" key={preset.id} className={`preset-card ${preferences.selectedPresetId===preset.id?'selected':''}`} onClick={()=>onSelect(selectPreset(preset.id))} aria-pressed={preferences.selectedPresetId===preset.id}><strong>{presentation.name}</strong><span>{presentation.description}</span><i aria-hidden="true">{preset.preview.map(color=><b key={color} style={{backgroundColor:color}}/>)}</i></button>})}</div>
    {preferences.selectedPresetId==='custom'&&<div className="custom-preset-status" role="status"><strong>{t('preset.custom.name')}</strong><span>{t('preset.custom.description')}</span></div>}
  </section>;
}

export function ThemeCustomizerContent({controller,compact=false}:{controller:ThemeCustomizerController;compact?:boolean}){
  const{t}=useTranslation('theme');
  const{t:tErrors}=useTranslation('errors');
  const{mode,setMode,preferences,activePalette,saveState,error,commit,flush,retry,reset}=controller;
  const[editing,setEditing]=useState<PaletteMode>(activePalette);
  const palette=editing==='light'?preferences.lightColors:preferences.darkColors;const warnings=lowContrastPairs(palette);
  const colorLabel=(key:ThemeColorKey)=>translateThemeColorLabel(t,key);
  const groupLabels={
    surfaces:t('groups.surfaces'),text:t('groups.text'),controls:t('groups.controls'),
    todayStats:t('groups.todayStats'),statuses:t('groups.statuses'),
  }satisfies Record<(typeof groups)[number]['id'],string>;
  const radiusLabels={
    square:t('radius.square'),subtle:t('radius.subtle'),rounded:t('radius.rounded'),soft:t('radius.soft'),
  }satisfies Record<ThemePreferences['borderRadius'],string>;
  const change=(key:ThemeColorKey,value:string)=>commit(updateThemeColor(preferences,editing,key,value));
  const warningPairs=warnings.map(([text,background])=>`${colorLabel(text)} / ${colorLabel(background)}`).join(', ');
  return <div className={`theme-customizer-content ${compact?'compact':''}`}>
    <ThemeModeSettings mode={mode} onSelect={setMode}/>
    <ThemePresetSettings preferences={preferences} onSelect={commit}/>
    <section className="settings-card color-settings"><div className="settings-heading"><div><h2>{t('customize.heading')}</h2><p>{t('customize.description')}</p></div><div className="palette-tabs" role="group" aria-label={t('customize.paletteOptionsLabel')}>{(['light','dark']as const).map(value=><button type="button" className={editing===value?'selected':''} aria-pressed={editing===value} key={value} onClick={()=>setEditing(value)}>{value==='light'?t('customize.paletteLight'):t('customize.paletteDark')}</button>)}</div></div>
      {warnings.length>0&&<div className="contrast-warning" role="alert">{t('warnings.contrast',{pairs:warningPairs})}</div>}
      <div className="color-groups">{groups.map(group=><details key={group.id} open={group.open}><summary>{groupLabels[group.id]}</summary><div className="color-grid">{group.fields.map(key=><ColorControl key={`${editing}-${key}`} colorKey={key} label={colorLabel(key)} value={palette[key]} onCommit={change} onFlush={()=>void flush()}/>)}</div></details>)}</div>
      <div className="radius-control" role="group" aria-label={t('radius.heading')}><strong>{t('radius.heading')}</strong>{(['square','subtle','rounded','soft']as const).map(value=><button type="button" key={value} className={preferences.borderRadius===value?'selected':''} aria-pressed={preferences.borderRadius===value} onClick={()=>commit({...preferences,borderRadius:value,selectedPresetId:'custom',updatedAt:new Date().toISOString()})}>{radiusLabels[value]}</button>)}</div>
      <div className="settings-actions"><button type="button" className="reset-theme" onClick={reset}><RotateCcw aria-hidden="true" size={16}/> {t('actions.reset')}</button><span className={`theme-save ${saveState}`} role="status" aria-live="polite">{saveState==='saving'?t('status.saving'):saveState==='saved'?t('status.saved'):saveState==='error'?t('status.error'):t('status.idle')}</span>{saveState==='error'&&<button type="button" onClick={()=>void retry()}>{t('common:actions.retry')}</button>}</div>{error&&<div className="page-error" role="alert">{localizeAppError(error,toErrorTranslator(tErrors))}</div>}
    </section>
  </div>;
}

export function ThemeSettings({controller}:{controller:ThemeCustomizerController}){
  const{t}=useTranslation('theme');const{t:tSettings}=useTranslation('settings');
  return <section className="settings-stack"><p className="settings-tip">{t('settings.tip')}</p><ThemeCustomizerContent controller={controller}/><div className="settings-card version"><span>{tSettings('about.version')}</span><strong>0.1.0</strong></div></section>;
}
