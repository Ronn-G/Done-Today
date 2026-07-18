import { useEffect,useMemo,useState } from 'react';
import { CalendarDays,CheckCircle2,History,Moon,Settings,Sun } from 'lucide-react';
import { JournalService } from '../application/journal/getDailyLog';
import type { DailyLog,WorkStatus } from '../domain/journal/models';
import { calculateStatistics,statusLabels } from '../domain/journal/statistics';
import { TauriJournalRepository } from '../infrastructure/database/tauriJournalRepository';
import { localDateKey,vietnameseDate } from '../shared/date';
type Page='today'|'history'|'settings';
type Theme='light'|'dark'|'system';
const service=new JournalService(new TauriJournalRepository());
function initialTheme():Theme {
  const saved=localStorage.getItem('done-today-theme');
  return saved==='light'||saved==='dark'||saved==='system'?saved:'system';
}
export function App() {
  const [page,setPage]=useState<Page>('today');
  const [theme,setTheme]=useState<Theme>(initialTheme);
  const [log,setLog]=useState<DailyLog|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    const media=matchMedia('(prefers-color-scheme: dark)');
    const apply=()=>document.documentElement.classList.toggle('dark',theme==='dark'||(theme==='system'&&media.matches));
    apply(); localStorage.setItem('done-today-theme',theme);
    media.addEventListener('change',apply); return ()=>media.removeEventListener('change',apply);
  },[theme]);
  useEffect(()=>{ service.getDailyLog(localDateKey()).then(setLog).catch((reason:unknown)=>{
    setError(reason instanceof Error?reason.message:String(reason));
  }).finally(()=>setLoading(false)); },[]);
  return <div className="app-shell"><aside className="sidebar">
    <div className="brand"><span className="brand-mark"><CheckCircle2 size={20}/></span><span>Done Today</span></div>
    <nav><Nav active={page==='today'} onClick={()=>setPage('today')} icon={<CalendarDays size={18}/>}>Hôm nay</Nav>
    <Nav active={page==='history'} onClick={()=>setPage('history')} icon={<History size={18}/>}>Lịch sử</Nav></nav>
    <Nav active={page==='settings'} onClick={()=>setPage('settings')} icon={<Settings size={18}/>}>Cài đặt</Nav>
  </aside><main>
    {page==='today'&&<Today log={log} loading={loading} error={error}/>}
    {page==='history'&&<EmptyPage title="Lịch sử" text="Những ngày bạn đã ghi lại sẽ xuất hiện tại đây."/>}
    {page==='settings'&&<SettingsPage theme={theme} setTheme={setTheme}/>}
  </main></div>;
}
function Nav({active,onClick,icon,children}:{active:boolean;onClick:()=>void;icon:React.ReactNode;children:React.ReactNode}) {
  return <button className={`nav-item ${active?'active':''}`} onClick={onClick}>{icon}<span>{children}</span></button>;
}
function Today({log,loading,error}:{log:DailyLog|null;loading:boolean;error:string|null}) {
  const stats=useMemo(()=>calculateStatistics(log?.items??[]),[log]);
  return <div className="content"><header><p className="eyebrow">{vietnameseDate()}</p>
    <h1>Hôm nay bạn đã tạo ra điều gì?</h1><p className="subtitle">Ghi lại một ngày bình thường — vì đó là cách tiến bộ được tạo nên.</p></header>
    <section className="stats"><Stat label="Tổng số việc" value={stats.total}/><Stat label="Hoàn thành" value={stats.completed}/>
      <div className="stat progress-stat"><span>Tỷ lệ hoàn thành</span><strong>{stats.percentage}%</strong><div className="progress"><i style={{width:`${stats.percentage}%`}}/></div></div></section>
    <section className="table-card">{loading&&<div className="message">Đang đọc dữ liệu từ SQLite…</div>}
      {error&&<div className="message error">Không thể đọc dữ liệu: {error}</div>}
      {!loading&&!error&&<div className="table-scroll"><table><thead><tr><th>Việc đã làm</th><th>Kết quả</th><th>Bước tiếp theo</th><th>Trạng thái</th></tr></thead>
      <tbody>{log?.items.map((item)=><tr key={item.id}><td className="task">{item.task}</td><td>{item.result}</td><td>{item.nextAction}</td><td><StatusBadge status={item.status}/></td></tr>)}
      {!log?.items.length&&<tr><td colSpan={4} className="empty-cell">Chưa có việc nào cho hôm nay.</td></tr>}</tbody></table></div>}</section>
    <button className="add-row" disabled title="Chỉnh sửa bảng sẽ được triển khai ở sprint sau">+ Thêm dòng</button></div>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="stat"><span>{label}</span><strong>{value}</strong></div>; }
function StatusBadge({status}:{status:WorkStatus}) { return <span className={`badge ${status}`}>{statusLabels[status]}</span>; }
function EmptyPage({title,text}:{title:string;text:string}) {
  return <div className="content"><header><p className="eyebrow">Done Today</p><h1>{title}</h1></header><div className="empty-state"><History size={28}/><h2>Chưa có dữ liệu</h2><p>{text}</p></div></div>;
}
function SettingsPage({theme,setTheme}:{theme:Theme;setTheme:(theme:Theme)=>void}) {
  return <div className="content"><header><p className="eyebrow">Tùy chỉnh trải nghiệm</p><h1>Cài đặt</h1></header><section className="settings-card">
    <div><h2>Giao diện</h2><p>Chọn cách Done Today hiển thị trên máy của bạn.</p></div><div className="theme-picker">
    {(['light','dark','system'] as const).map((value)=><button key={value} className={theme===value?'selected':''} onClick={()=>setTheme(value)}>
      {value==='light'?<Sun size={16}/>:<Moon size={16}/>} {value==='light'?'Sáng':value==='dark'?'Tối':'Hệ thống'}</button>)}</div>
    <div className="version"><span>Phiên bản</span><strong>0.1.0</strong></div></section></div>;
}
