import {useState}from'react';
import{Moon,RotateCcw,Sun}from'lucide-react';
import{lowContrastPairs}from'../../domain/theme/applyTheme';
import{normalizeHexColor}from'../../domain/theme/colors';
import type{PaletteMode,ThemeColors}from'../../domain/theme/models';
import{selectPreset,themePresets,updateThemeColor}from'../../domain/theme/presets';
import type{ThemeCustomizerController}from'./themeCustomizerController';

const groups:readonly{title:string;open?:boolean;fields:readonly[keyof ThemeColors,string][]}[]=[
  {title:'Nền và bề mặt',open:true,fields:[['pageBackground','Nền ứng dụng'],['sidebarBackground','Nền sidebar'],['sidebarActiveBackground','Mục sidebar đang chọn'],['cardBackground','Card và bảng'],['tableHeaderBackground','Tiêu đề bảng'],['editorHoverBackground','Editor khi hover']]},
  {title:'Chữ',fields:[['primaryText','Chữ chính'],['secondaryText','Chữ phụ'],['mutedText','Chữ gợi ý'],['sidebarText','Chữ sidebar'],['sidebarActiveText','Chữ sidebar đang chọn']]},
  {title:'Điều khiển',fields:[['accent','Màu nhấn'],['border','Màu viền'],['focusRing','Focus ring'],['progressTrack','Progress track']]},
  {title:'Thống kê trong ngày',open:true,fields:[['statsPanelBackground','Nền khối thống kê'],['statsPanelBorder','Viền khối thống kê'],['statsPanelPrimaryText','Chữ chính khối thống kê'],['statsPanelSecondaryText','Chữ phụ khối thống kê'],['statsPanelProgressTrack','Nền thanh tiến độ'],['statsPanelProgressFill','Màu thanh tiến độ']]},
  {title:'Trạng thái',fields:[['completedBackground','Hoàn thành · nền'],['completedText','Hoàn thành · chữ'],['completedBorder','Hoàn thành · viền'],['inProgressBackground','Đang làm · nền'],['inProgressText','Đang làm · chữ'],['inProgressBorder','Đang làm · viền'],['postponedBackground','Bị hoãn · nền'],['postponedText','Bị hoãn · chữ'],['postponedBorder','Bị hoãn · viền'],['cancelledBackground','Đã hủy · nền'],['cancelledText','Đã hủy · chữ'],['cancelledBorder','Đã hủy · viền']]},
];

function ColorControl({colorKey,label,value,onCommit,onFlush}:{colorKey:keyof ThemeColors;label:string;value:string;onCommit:(key:keyof ThemeColors,value:string)=>void;onFlush:()=>void}){
  const[raw,setRaw]=useState(value);const[error,setError]=useState<string|null>(null);
  const update=(next:string)=>{setRaw(next);const normalized=normalizeHexColor(next);if(normalized&&next.trim().length===7){setError(null);onCommit(colorKey,normalized)}else setError(next.trim().length>7?'Dùng #RGB hoặc #RRGGBB.':null)};
  const blur=()=>{const normalized=normalizeHexColor(raw);if(normalized){setError(null);setRaw(normalized);onCommit(colorKey,normalized)}else{setError('Dùng #RGB hoặc #RRGGBB.');setRaw(value)}onFlush()};
  return <label className="color-row"><span>{label}</span><input type="color" aria-label={`${label} - chọn màu`} value={value} onChange={event=>onCommit(colorKey,event.target.value)}/><input className={error?'invalid':''} aria-label={`${label} - mã HEX`} value={raw} onChange={event=>update(event.target.value)} onBlur={blur}/><i style={{backgroundColor:value}}/>{error&&<small>{error}</small>}</label>;
}

export function ThemeCustomizerContent({controller,compact=false}:{controller:ThemeCustomizerController;compact?:boolean}){
  const{mode,setMode,preferences,activePalette,saveState,error,commit,flush,retry,reset}=controller;
  const[editing,setEditing]=useState<PaletteMode>(activePalette);
  const palette=editing==='light'?preferences.lightColors:preferences.darkColors;const warnings=lowContrastPairs(palette);
  const change=(key:keyof ThemeColors,value:string)=>commit(updateThemeColor(preferences,editing,key,value));
  return <div className={`theme-customizer-content ${compact?'compact':''}`}>
    <section className="settings-card"><h2>Chế độ hiển thị</h2><p>Chọn bảng màu sáng, tối hoặc theo hệ điều hành.</p><div className="theme-picker">{(['light','dark','system']as const).map(value=><button key={value} className={mode===value?'selected':''} onClick={()=>setMode(value)}>{value==='light'?<Sun size={16}/>:<Moon size={16}/>} {value==='light'?'Sáng':value==='dark'?'Tối':'Theo hệ thống'}</button>)}</div></section>
    <section className="settings-card"><h2>Chủ đề có sẵn</h2><p>Chọn nền tảng màu rồi tinh chỉnh nếu muốn.</p><div className="preset-grid">{themePresets.map(preset=><button key={preset.id} className={`preset-card ${preferences.selectedPresetId===preset.id?'selected':''}`} onClick={()=>commit(selectPreset(preset.id))} aria-pressed={preferences.selectedPresetId===preset.id}><strong>{preset.name}</strong><span>{preset.description}</span><i>{preset.preview.map(color=><b key={color} style={{backgroundColor:color}}/>)}</i></button>)}</div></section>
    <section className="settings-card color-settings"><div className="settings-heading"><div><h2>Tùy chỉnh màu</h2><p>Mỗi chế độ có bảng màu riêng và được xem trước ngay.</p></div><div className="palette-tabs">{(['light','dark']as const).map(value=><button className={editing===value?'selected':''} key={value} onClick={()=>setEditing(value)}>Màu {value==='light'?'sáng':'tối'}</button>)}</div></div>
      {warnings.length>0&&<div className="contrast-warning">Độ tương phản thấp, nội dung có thể khó đọc. Cặp liên quan: {warnings.map(pair=>pair.join(' / ')).join(', ')}.</div>}
      <div className="color-groups">{groups.map(group=><details key={group.title} open={group.open}><summary>{group.title}</summary><div className="color-grid">{group.fields.map(([key,label])=><ColorControl key={`${editing}-${key}`} colorKey={key} label={label} value={palette[key]} onCommit={change} onFlush={()=>void flush()}/>)}</div></details>)}</div>
      <div className="radius-control"><strong>Độ bo góc</strong>{([['square','Vuông · 4px'],['subtle','Nhẹ · 8px'],['rounded','Bo tròn · 12px'],['soft','Mềm · 16px']]as const).map(([value,label])=><button key={value} className={preferences.borderRadius===value?'selected':''} onClick={()=>commit({...preferences,borderRadius:value,selectedPresetId:'custom',updatedAt:new Date().toISOString()})}>{label}</button>)}</div>
      <div className="settings-actions"><button className="reset-theme" onClick={reset}><RotateCcw size={16}/> Khôi phục giao diện mặc định</button><span className={`theme-save ${saveState}`}>{saveState==='saving'?'Đang lưu…':saveState==='saved'?'Đã lưu':saveState==='error'?'Lưu thất bại':'Mọi thay đổi tự động lưu'}</span>{saveState==='error'&&<button onClick={()=>void retry()}>Thử lại</button>}</div>{error&&<div className="page-error">{error}</div>}
    </section>
  </div>;
}

export function ThemeSettings({controller}:{controller:ThemeCustomizerController}){
  return <section className="settings-stack"><p className="settings-tip">Bạn cũng có thể tùy chỉnh trực tiếp trên màn hình Hôm nay.</p><ThemeCustomizerContent controller={controller}/><div className="settings-card version"><span>Phiên bản</span><strong>0.1.0</strong></div></section>;
}
