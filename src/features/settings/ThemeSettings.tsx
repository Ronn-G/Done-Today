import {useEffect,useMemo,useState} from 'react';
import {Moon,RotateCcw,Sun} from 'lucide-react';
import {ThemeSaveCoordinator,type ThemeSaveState} from '../../application/theme/themeSaveCoordinator';
import {lowContrastPairs} from '../../domain/theme/applyTheme';
import {normalizeHexColor} from '../../domain/theme/colors';
import type {PaletteMode,ThemeColors,ThemeMode,ThemePreferences} from '../../domain/theme/models';
import {defaultThemePreferences,selectPreset,themePresets,updateThemeColor} from '../../domain/theme/presets';
import type {ThemeRepository} from '../../domain/theme/repository';

const groups:readonly {title:string;fields:readonly [keyof ThemeColors,string][]}[]=[
  {title:'Nền và bề mặt',fields:[['pageBackground','Nền ứng dụng'],['sidebarBackground','Nền sidebar'],['sidebarActiveBackground','Mục sidebar đang chọn'],['cardBackground','Card và bảng'],['tableHeaderBackground','Tiêu đề bảng'],['editorHoverBackground','Editor khi hover']]},
  {title:'Chữ',fields:[['primaryText','Chữ chính'],['secondaryText','Chữ phụ'],['mutedText','Chữ gợi ý'],['sidebarText','Chữ sidebar'],['sidebarActiveText','Chữ sidebar đang chọn']]},
  {title:'Điều khiển',fields:[['accent','Màu nhấn'],['border','Màu viền'],['focusRing','Focus ring'],['progressTrack','Progress track']]},
  {title:'Thống kê trong ngày',fields:[['statsPanelBackground','Nền khối thống kê'],['statsPanelBorder','Viền khối thống kê'],['statsPanelPrimaryText','Chữ chính khối thống kê'],['statsPanelSecondaryText','Chữ phụ khối thống kê'],['statsPanelProgressTrack','Nền thanh tiến độ'],['statsPanelProgressFill','Màu thanh tiến độ']]},
  {title:'Hoàn thành',fields:[['completedBackground','Nền'],['completedText','Chữ'],['completedBorder','Viền']]},
  {title:'Đang làm',fields:[['inProgressBackground','Nền'],['inProgressText','Chữ'],['inProgressBorder','Viền']]},
  {title:'Bị hoãn',fields:[['postponedBackground','Nền'],['postponedText','Chữ'],['postponedBorder','Viền']]},
  {title:'Đã hủy',fields:[['cancelledBackground','Nền'],['cancelledText','Chữ'],['cancelledBorder','Viền']]},
];
function ColorControl({colorKey,label,value,onCommit,onFlush}:{colorKey:keyof ThemeColors;label:string;value:string;onCommit:(key:keyof ThemeColors,value:string)=>void;onFlush:()=>void}){
  const[raw,setRaw]=useState(value);const[error,setError]=useState<string|null>(null);
  const update=(next:string)=>{setRaw(next);const normalized=normalizeHexColor(next);if(normalized&&next.trim().length===7){setError(null);onCommit(colorKey,normalized)}else setError(next.trim().length>7?'Dùng #RGB hoặc #RRGGBB.':null)};
  const blur=()=>{const normalized=normalizeHexColor(raw);if(normalized){setError(null);setRaw(normalized);onCommit(colorKey,normalized)}else{setError('Dùng #RGB hoặc #RRGGBB.');setRaw(value)}onFlush()};
  return <label className="color-row"><span>{label}</span><input type="color" aria-label={`${label} - chọn màu`} value={value} onChange={event=>onCommit(colorKey,event.target.value)}/><input className={error?'invalid':''} aria-label={`${label} - mã HEX`} value={raw} onChange={event=>update(event.target.value)} onBlur={blur}/><i style={{backgroundColor:value}}/>{error&&<small>{error}</small>}</label>;
}
export function ThemeSettings({mode,setMode,preferences,setPreferences,activePalette,repository}:{mode:ThemeMode;setMode:(mode:ThemeMode)=>void;preferences:ThemePreferences;setPreferences:(value:ThemePreferences)=>void;activePalette:PaletteMode;repository:ThemeRepository}){
  const[editing,setEditing]=useState<PaletteMode>(activePalette);const[saveState,setSaveState]=useState<ThemeSaveState>('idle');
  const[error,setError]=useState<string|null>(null);
  const coordinator=useMemo(()=>new ThemeSaveCoordinator<ThemePreferences>(value=>repository.save(value),setSaveState),[repository]);
  useEffect(()=>()=>{void coordinator.flush().catch(()=>undefined);coordinator.cancel()},[coordinator]);
  useEffect(()=>{const flush=()=>void coordinator.flush().catch(()=>undefined);window.addEventListener('beforeunload',flush);return()=>window.removeEventListener('beforeunload',flush)},[coordinator]);
  const palette=editing==='light'?preferences.lightColors:preferences.darkColors;const warnings=lowContrastPairs(palette);
  const commit=(next:ThemePreferences)=>{setPreferences(next);setError(null);coordinator.schedule(next)};
  const change=(key:keyof ThemeColors,value:string)=>commit(updateThemeColor(preferences,editing,key,value));
  const reset=()=>{if(confirm('Khôi phục toàn bộ màu sáng, màu tối và độ bo góc về Done Today? Chế độ hiển thị được giữ nguyên.'))commit(defaultThemePreferences())};
  return <section className="settings-stack">
    <div className="settings-card"><h2>Chế độ hiển thị</h2><p>Chọn bảng màu sáng, tối hoặc theo hệ điều hành.</p><div className="theme-picker">{(['light','dark','system'] as const).map(value=><button key={value} className={mode===value?'selected':''} onClick={()=>setMode(value)}>{value==='light'?<Sun size={16}/>:<Moon size={16}/>} {value==='light'?'Sáng':value==='dark'?'Tối':'Theo hệ thống'}</button>)}</div></div>
    <div className="settings-card"><h2>Chủ đề có sẵn</h2><p>Chọn một nền tảng màu, sau đó tinh chỉnh nếu muốn.</p><div className="preset-grid">{themePresets.map(preset=><button key={preset.id} className={`preset-card ${preferences.selectedPresetId===preset.id?'selected':''}`} onClick={()=>commit(selectPreset(preset.id))} aria-pressed={preferences.selectedPresetId===preset.id}><strong>{preset.name}</strong><span>{preset.description}</span><i>{preset.preview.map(color=><b key={color} style={{backgroundColor:color}}/>)}</i></button>)}</div></div>
    <div className="settings-card"><div className="settings-heading"><div><h2>Tùy chỉnh màu</h2><p>Mỗi chế độ có bảng màu riêng. Thay đổi được xem trước ngay.</p></div><div className="palette-tabs">{(['light','dark'] as const).map(value=><button className={editing===value?'selected':''} key={value} onClick={()=>setEditing(value)}>Màu {value==='light'?'sáng':'tối'}</button>)}</div></div>
      {warnings.length>0&&<div className="contrast-warning">Độ tương phản thấp, nội dung có thể khó đọc. Cặp liên quan: {warnings.map(pair=>pair.join(' / ')).join(', ')}.</div>}
      <div className="color-groups">{groups.map(group=><fieldset key={group.title}><legend>{group.title}</legend><div className="color-grid">{group.fields.map(([key,label])=><ColorControl key={`${editing}-${key}-${palette[key]}`} colorKey={key} label={label} value={palette[key]} onCommit={change} onFlush={()=>void coordinator.flush().catch(()=>setError('Không thể lưu giao diện.'))}/>)}</div></fieldset>)}</div>
      <div className="radius-control"><strong>Độ bo góc</strong>{([['square','Vuông · 4px'],['subtle','Nhẹ · 8px'],['rounded','Bo tròn · 12px'],['soft','Mềm · 16px']] as const).map(([value,label])=><button key={value} className={preferences.borderRadius===value?'selected':''} onClick={()=>commit({...preferences,borderRadius:value,selectedPresetId:'custom',updatedAt:new Date().toISOString()})}>{label}</button>)}</div>
      <div className="settings-actions"><button className="reset-theme" onClick={reset}><RotateCcw size={16}/> Khôi phục giao diện mặc định</button><span className={`theme-save ${saveState}`}>{saveState==='saving'?'Đang lưu…':saveState==='saved'?'Đã lưu':saveState==='error'?'Lưu thất bại':'Mọi thay đổi tự động lưu'}</span>{saveState==='error'&&<button onClick={()=>void coordinator.flush().catch(()=>setError('Không thể lưu giao diện.'))}>Thử lại</button>}</div>{error&&<div className="page-error">{error}</div>}</div>
    <div className="settings-card version"><span>Phiên bản</span><strong>0.1.0</strong></div>
  </section>;
}
