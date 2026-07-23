/* eslint-disable react-hooks/set-state-in-effect -- async route loads intentionally initialize screen state */
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import{createPortal}from'react-dom';
import {CalendarDays,Check,CheckCircle2,ChevronDown,ChevronLeft,ChevronRight,ChevronUp,History,LoaderCircle,MoreHorizontal,Palette,Settings,Trash2} from 'lucide-react';
import {JournalService} from '../application/journal/journalService';
import {SaveCoordinator,type SaveState} from '../application/journal/saveCoordinator';
import {ThemeSaveCoordinator,type ThemeSaveState} from '../application/theme/themeSaveCoordinator';
import type {DailyLog,DailyLogSummary,UpdateWorkItem,WorkItem,WorkStatus} from '../domain/journal/models';
import{groupDailyItems,parseCollapsedCategoryState,type WorkCategory}from'../domain/journal/categories';
import {calculateStatistics,statusLabels} from '../domain/journal/statistics';
import {TauriJournalRepository} from '../infrastructure/database/tauriJournalRepository';
import {TauriThemeRepository} from '../infrastructure/database/tauriThemeRepository';
import {applyThemePreferences,resolvePalette} from '../domain/theme/applyTheme';
import type {ThemeMode,ThemePreferences} from '../domain/theme/models';
import {defaultThemePreferences} from '../domain/theme/presets';
import {ThemeSettings} from '../features/settings/ThemeSettings';
import {FloatingThemeCustomizer,initialFloatingThemePanelState} from '../features/settings/FloatingThemeCustomizer';
import type {ThemeCustomizerController} from '../features/settings/themeCustomizerController';
import{CategorySettings}from'../features/settings/CategorySettings';
import{BackupSettings}from'../features/backup/BackupSettings';
import{getRowActionDestinations,moveItemAfterFlush,positionRowActionMenu}from'../features/daily-log/rowActionMenu';
import {addLocalDays,isValidLocalDate,localDateKey,shortVietnameseDate,vietnameseDate} from '../shared/date';

type Route={page:'day';date:string}|{page:'history'}|{page:'settings'};
const service=new JournalService(new TauriJournalRepository());
const themeRepository=new TauriThemeRepository();
const today=()=>localDateKey();
const statusOptions=Object.entries(statusLabels) as Array<[WorkStatus,string]>;
function parseRoute():Route{
  const hash=location.hash.slice(1);
  if(hash==='/history')return{page:'history'};
  if(hash==='/settings')return{page:'settings'};
  const match=/^\/day\/(.+)$/.exec(hash);
  if(match&&isValidLocalDate(match[1]))return{page:'day',date:match[1]};
  return{page:'day',date:today()};
}
function navigate(route:Route){
  const hash=route.page==='day'?`#/day/${route.date}`:`#/${route.page}`;
  if(location.hash===hash)window.dispatchEvent(new HashChangeEvent('hashchange'));else location.hash=hash;
}
function initialTheme():ThemeMode{
  const saved=localStorage.getItem('done-today-theme');
  return saved==='light'||saved==='dark'||saved==='system'?saved:'system';
}
function friendlyError(error:unknown){
  if(typeof error==='object'&&error&&'message' in error&&typeof error.message==='string')return error.message;
  return'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export function App(){
  const[route,setRoute]=useState<Route>(parseRoute);
  const[theme,setTheme]=useState<ThemeMode>(initialTheme);
  const[themePreferences,setThemePreferences]=useState<ThemePreferences>(defaultThemePreferences);
  const[themeSaveState,setThemeSaveState]=useState<ThemeSaveState>('idle');
  const[themeError,setThemeError]=useState<string|null>(null);
  const[floatingThemePanel,setFloatingThemePanel]=useState(initialFloatingThemePanelState);
  const[dataRevision,setDataRevision]=useState(0);
  const[systemDark,setSystemDark]=useState(()=>matchMedia('(prefers-color-scheme: dark)').matches);
  const themeCoordinator=useMemo(()=>new ThemeSaveCoordinator<ThemePreferences>(value=>themeRepository.save(value),setThemeSaveState),[]);
  useEffect(()=>{
    if(!location.hash)navigate({page:'day',date:today()});
    const onHash=()=>setRoute(parseRoute());window.addEventListener('hashchange',onHash);
    return()=>window.removeEventListener('hashchange',onHash);
  },[]);
  useEffect(()=>{
    const media=matchMedia('(prefers-color-scheme: dark)');
    const apply=()=>setSystemDark(media.matches);
    apply();localStorage.setItem('done-today-theme',theme);media.addEventListener('change',apply);
    return()=>media.removeEventListener('change',apply);
  },[theme]);
  const activePalette=resolvePalette(theme,systemDark);
  useEffect(()=>{document.documentElement.classList.toggle('dark',activePalette==='dark');applyThemePreferences(themePreferences,activePalette)},[activePalette,themePreferences]);
  useEffect(()=>{void themeRepository.load().then(saved=>{if(saved)setThemePreferences(saved)}).catch(()=>setThemePreferences(defaultThemePreferences()))},[]);
  useEffect(()=>()=>{void themeCoordinator.flush().catch(()=>undefined);themeCoordinator.cancel()},[themeCoordinator]);
  useEffect(()=>{const flush=()=>void themeCoordinator.flush().catch(()=>undefined);window.addEventListener('beforeunload',flush);return()=>window.removeEventListener('beforeunload',flush)},[themeCoordinator]);
  const commitTheme=useCallback((next:ThemePreferences)=>{setThemePreferences(next);setThemeError(null);themeCoordinator.schedule(next)},[themeCoordinator]);
  const flushTheme=useCallback(async()=>{try{await themeCoordinator.flush();setThemeError(null)}catch{setThemeError('Không thể lưu giao diện.');throw new Error('Không thể lưu giao diện.')}},[themeCoordinator]);
  const resetTheme=useCallback(()=>{if(confirm('Khôi phục toàn bộ màu sáng, màu tối và độ bo góc về Done Today? Chế độ hiển thị được giữ nguyên.'))commitTheme(defaultThemePreferences())},[commitTheme]);
  const themeController:ThemeCustomizerController={mode:theme,setMode:setTheme,preferences:themePreferences,setPreferences:setThemePreferences,activePalette,saveState:themeSaveState,error:themeError,commit:commitTheme,flush:flushTheme,retry:flushTheme,reset:resetTheme};
  const openThemePanel=()=>setFloatingThemePanel(current=>{const next={...current,open:true};localStorage.setItem('done-today-floating-theme-panel',JSON.stringify(next));return next});
  return <div className="app-shell"><aside className="sidebar">
    <div className="brand"><span className="brand-mark"><CheckCircle2 size={20}/></span><span>Done Today</span></div>
    <nav><Nav active={route.page==='day'} onClick={()=>navigate({page:'day',date:today()})} icon={<CalendarDays size={18}/>}>Hôm nay</Nav>
      <Nav active={route.page==='history'} onClick={()=>navigate({page:'history'})} icon={<History size={18}/>}>Lịch sử</Nav></nav>
    <Nav active={route.page==='settings'} onClick={()=>navigate({page:'settings'})} icon={<Settings size={18}/>}>Cài đặt</Nav>
  </aside><main>
    {route.page==='day'&&<DayEditor key={`${route.date}-${dataRevision}`} date={route.date} onOpenTheme={openThemePanel}/>}
    {route.page==='history'&&<HistoryPage key={dataRevision}/>}
    {route.page==='settings'&&<SettingsPage controller={themeController} onImported={()=>{setDataRevision(value=>value+1);void themeRepository.load().then(value=>setThemePreferences(value??defaultThemePreferences()));navigate({page:'day',date:today()})}}/>}
  </main>{route.page==='day'&&<FloatingThemeCustomizer controller={themeController} state={floatingThemePanel} setState={setFloatingThemePanel}/>}</div>;
}
function Nav({active,onClick,icon,children}:{active:boolean;onClick:()=>void;icon:React.ReactNode;children:React.ReactNode}){
  return <button className={`nav-item ${active?'active':''}`} onClick={onClick}>{icon}<span>{children}</span></button>;
}

function DayEditor({date,onOpenTheme}:{date:string;onOpenTheme:()=>void}){
  const[log,setLog]=useState<DailyLog|null>(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const[creating,setCreating]=useState(false);
  const[focusId,setFocusId]=useState<string|null>(null);
  const[categories,setCategories]=useState<WorkCategory[]>([]);
  const[collapsed,setCollapsed]=useState<string[]>([]);
  const load=useCallback(async()=>{
    setLoading(true);setError(null);
    try{await service.initialize();const[nextLog,nextCategories]=await Promise.all([service.getDailyLog(date),service.listCategories(true)]);setLog(nextLog);setCategories(nextCategories);setCollapsed(parseCollapsedCategoryState(localStorage.getItem('done-today-collapsed-categories'),nextCategories.map(category=>category.id)).collapsedCategoryIds)}
    catch(reason){setError(friendlyError(reason))}
    finally{setLoading(false)}
  },[date]);
  useEffect(()=>{void load()},[load]);
  const items=useMemo(()=>log?.items??[],[log]);
  const stats=useMemo(()=>calculateStatistics(items),[items]);
  const groups=useMemo(()=>groupDailyItems(items,categories),[items,categories]);
  const addItem=useCallback(async(categoryId:string|null=null)=>{
    if(creating)return;setCreating(true);setError(null);
    try{
      const item=await service.createWorkItem(date,categoryId);
      setLog(previous=>previous?{...previous,items:[...previous.items,item]}:{
        id:item.dailyLogId,logDate:date,createdAt:item.createdAt,updatedAt:item.updatedAt,items:[item],
      });
      setFocusId(item.id);
    }catch(reason){setError(friendlyError(reason))}
    finally{setCreating(false)}
  },[creating,date]);
  useEffect(()=>{
    const handler=(event:KeyboardEvent)=>{if(event.ctrlKey&&event.key==='Enter'){event.preventDefault();void addItem()}};
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
  },[addItem]);
  const updateLocal=useCallback((item:WorkItem)=>setLog(previous=>previous?{...previous,items:previous.items.map(entry=>entry.id===item.id?item:entry)}:previous),[]);
  const remove=async(item:WorkItem)=>{
    const hasContent=Boolean(item.task.trim()||item.result.trim()||item.nextAction.trim());
    if(hasContent&&!confirm('Xóa dòng này? Nội dung đã nhập sẽ không thể khôi phục.'))return;
    try{await service.deleteWorkItem(item.id);setLog(previous=>previous?{...previous,items:previous.items.filter(entry=>entry.id!==item.id)}:previous)}
    catch(reason){setError(friendlyError(reason))}
  };
  const move=async(bucket:WorkItem[],index:number,direction:-1|1)=>{
    if(!log)return;const target=index+direction;if(target<0||target>=bucket.length)return;
    const ordered=[...bucket];[ordered[index],ordered[target]]=[ordered[target],ordered[index]];
    try{const saved=await service.reorderWorkItems(log.id,ordered.map(item=>item.id));setLog(current=>current?{...current,items:current.items.map(item=>saved.find(value=>value.id===item.id)??item)}:current)}
    catch(reason){setError(friendlyError(reason));void load()}
  };
  const toggleGroup=(id:string|null)=>{const key=id??'__other__';setCollapsed(current=>{const next=current.includes(key)?current.filter(value=>value!==key):[...current,key];localStorage.setItem('done-today-collapsed-categories',JSON.stringify({schemaVersion:1,collapsedCategoryIds:next}));return next})};
  const changeCategory=async(item:WorkItem,categoryId:string|null)=>{try{const saved=await service.moveWorkItemToCategory(item.id,categoryId);updateLocal(saved)}catch(reason){setError(friendlyError(reason));throw reason}};
  const go=(next:string)=>navigate({page:'day',date:next});
  return <div className="content">
    <header className="day-header"><div><p className="eyebrow">{date===today()?'Hôm nay':'Nhật ký theo ngày'}</p>
      <h1>{date===today()?'Hôm nay bạn đã tạo ra điều gì?':vietnameseDate(date)}</h1>
      <p className="subtitle">{date===today()?'Ghi lại một ngày bình thường — vì đó là cách tiến bộ được tạo nên.':'Bạn có thể xem và chỉnh sửa ngày cũ bằng cùng một bảng.'}</p></div>
      <div className="date-nav">
        <button aria-label="Ngày trước" title="Ngày trước" onClick={()=>go(addLocalDays(date,-1))}><ChevronLeft size={18}/></button>
        <label className="date-picker"><span>{vietnameseDate(date)}</span><input aria-label="Chọn ngày" type="date" value={date} onChange={event=>isValidLocalDate(event.target.value)&&go(event.target.value)}/></label>
        <button aria-label="Ngày sau" title="Ngày sau" onClick={()=>go(addLocalDays(date,1))}><ChevronRight size={18}/></button>
        {date!==today()&&<button className="today-button" onClick={()=>go(today())}>Hôm nay</button>}
        <button aria-label="Tùy chỉnh giao diện" title="Tùy chỉnh giao diện" onClick={onOpenTheme}><Palette size={18}/></button>
      </div></header>
    <section className="stats" aria-label="Thống kê trong ngày"><Stat label="Tổng số việc" value={stats.total}/><Stat label="Hoàn thành" value={stats.completed}/>
      <div className="stat progress-stat"><span>Tỷ lệ hoàn thành</span><strong>{stats.percentage}%</strong><div className="progress" role="progressbar" aria-label="Tỷ lệ hoàn thành" aria-valuenow={stats.percentage} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${stats.percentage}%`}}/></div></div></section>
    {error&&<div className="page-error">{error}<button onClick={()=>void load()}>Thử lại</button></div>}
    <section className="table-card">{loading?<div className="message"><LoaderCircle className="spin" size={20}/> Đang đọc dữ liệu…</div>:
      <div className="table-scroll"><table><thead><tr><th className="order-col">Thứ tự</th><th>Việc đã làm</th><th>Kết quả</th><th>Bước tiếp theo</th><th>Trạng thái</th><th className="action-col"><span className="sr-only">Hành động</span></th></tr></thead>
      <tbody>{groups.flatMap(group=>{const key=group.id??'__other__';const hidden=collapsed.includes(key);return[<tr className="category-row" key={`header-${key}`}><th colSpan={6}><div className="category-header"><i style={group.color?{backgroundColor:group.color}:undefined}/><h2>{group.name}{!group.isActive&&<small> · Đã ẩn</small>}</h2><span>{group.completedItems}/{group.totalItems} hoàn thành</span><button aria-label={`Thêm việc vào ${group.name}`} onClick={()=>void addItem(group.id)}>+</button><button aria-label={`${hidden?'Mở rộng':'Thu gọn'} ${group.name}`} aria-expanded={!hidden} onClick={()=>toggleGroup(group.id)}>{hidden?<ChevronDown size={16}/>:<ChevronUp size={16}/>}</button></div></th></tr>,...(hidden?[]:group.items.map((item,index)=>{const bucket=group.items.filter(value=>(value.status==='completed')===(item.status==='completed'));const bucketIndex=bucket.findIndex(value=>value.id===item.id);return <WorkRow key={item.id} item={item} categories={categories.filter(value=>value.isActive)} autoFocus={focusId===item.id} onFocused={()=>setFocusId(null)}
        dataIndex={index} onChange={updateLocal} onCategoryChange={categoryId=>changeCategory(item,categoryId)} onDelete={()=>void remove(item)} onMoveUp={()=>void move(bucket,bucketIndex,-1)} onMoveDown={()=>void move(bucket,bucketIndex,1)}
        canMoveUp={bucketIndex>0} canMoveDown={bucketIndex<bucket.length-1}/>}))]})}
      {!items.length&&<tr><td colSpan={6} className="empty-cell"><strong>Chưa có việc nào.</strong><span>Chọn một nhóm bên dưới để bắt đầu ghi lại ngày hôm nay.</span></td></tr>}</tbody></table></div>}
      <footer className="table-footer"><label className="add-row-select"><span>Thêm dòng vào</span><select aria-label="Chọn nhóm cho dòng mới" onChange={event=>{if(event.target.value!=='')void addItem(event.target.value==='__other__'?null:event.target.value);event.target.value=''}} defaultValue=""><option value="" disabled>Chọn nhóm…</option>{categories.filter(category=>category.isActive).map(category=><option key={category.id} value={category.id}>{category.name}</option>)}<option value="__other__">Việc khác</option></select></label>
      <p className="shortcut-hint">Ctrl + Enter để thêm dòng · Thay đổi được tự động lưu</p></footer>
    </section>
  </div>;
}

function WorkRow({item,categories,dataIndex,autoFocus,onFocused,onChange,onCategoryChange,onDelete,onMoveUp,onMoveDown,canMoveUp,canMoveDown}:{
  item:WorkItem;categories:WorkCategory[];dataIndex:number;autoFocus:boolean;onFocused:()=>void;onChange:(item:WorkItem)=>void;onCategoryChange:(id:string|null)=>Promise<void>;onDelete:()=>void;
  onMoveUp:()=>void;onMoveDown:()=>void;canMoveUp:boolean;canMoveDown:boolean;
}){
  const[state,setState]=useState<SaveState>('idle');
  const[error,setError]=useState<string|null>(null);
  const latest=useRef(item);
  useEffect(()=>{latest.current=item},[item]);
  const coordinator=useMemo(()=>new SaveCoordinator<UpdateWorkItem,WorkItem>(
    input=>service.updateWorkItem(input),
    saved=>onChange(saved),
    setState,
    600,
  ),[onChange]);
  useEffect(()=>()=>{void coordinator.flush().catch(()=>undefined);coordinator.cancel()},[coordinator]);
  useEffect(()=>{
    const before=()=>{void coordinator.flush().catch(()=>undefined)};
    window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);
  },[coordinator]);
  const schedule=(next:WorkItem,immediate=false)=>{
    latest.current=next;onChange(next);setError(null);
    const input={id:next.id,task:next.task,result:next.result,nextAction:next.nextAction,status:next.status};
    coordinator.schedule(input);
    if(immediate)void coordinator.flush().catch(reason=>setError(friendlyError(reason)));
  };
  const changeText=(field:'task'|'result'|'nextAction',value:string)=>schedule({...latest.current,[field]:value});
  const flush=()=>void coordinator.flush().catch(reason=>setError(friendlyError(reason)));
  const flushBeforeAction=async()=>{try{await coordinator.flush()}catch(reason){setError(friendlyError(reason));throw reason}};
  const escape=(event:React.KeyboardEvent)=>{if(event.key==='Escape')(event.currentTarget as HTMLElement).blur()};
  return <tr className="editable-row" data-group-index={dataIndex}>
    <td className="reorder-cell"><button aria-label="Di chuyển lên" title="Di chuyển lên" disabled={!canMoveUp} onClick={onMoveUp}><ChevronUp size={14}/></button><button aria-label="Di chuyển xuống" title="Di chuyển xuống" disabled={!canMoveDown} onClick={onMoveDown}><ChevronDown size={14}/></button></td>
    <td><textarea className="work-item-editor task-editor" aria-label="Việc đã làm" placeholder="Bạn đã làm gì?" value={item.task} maxLength={500} rows={2} autoFocus={autoFocus} onFocus={onFocused} onChange={e=>changeText('task',e.target.value)} onBlur={flush} onKeyDown={escape}/></td>
    <td><textarea className="work-item-editor result-editor" aria-label="Kết quả" placeholder="Kết quả ra sao?" value={item.result} maxLength={2000} rows={2} onChange={e=>changeText('result',e.target.value)} onBlur={flush} onKeyDown={escape}/></td>
    <td><textarea className="work-item-editor next-action-editor" aria-label="Bước tiếp theo" placeholder="Tiếp theo cần làm gì?" value={item.nextAction} maxLength={1000} rows={2} onChange={e=>changeText('nextAction',e.target.value)} onBlur={flush} onKeyDown={escape}/></td>
    <td><select aria-label="Trạng thái" className={`status-select ${item.status}`} value={item.status} onChange={e=>schedule({...latest.current,status:e.target.value as WorkStatus},true)}>
      {statusOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
      <SaveIndicator state={state} error={error} retry={flush}/></td>
    <td className="row-actions"><RowActionMenu item={item} categories={categories} flush={flushBeforeAction} onMove={onCategoryChange} onDelete={onDelete}/></td>
  </tr>;
}
function RowActionMenu({item,categories,flush,onMove,onDelete}:{item:WorkItem;categories:WorkCategory[];flush:()=>Promise<void>;onMove:(id:string|null)=>Promise<void>;onDelete:()=>void}){
  const[open,setOpen]=useState(false);const[position,setPosition]=useState({left:0,top:0});const trigger=useRef<HTMLButtonElement>(null);const menu=useRef<HTMLDivElement>(null);
  const close=useCallback(()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.focus())},[]);
  useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!menu.current?.contains(event.target as Node)&&!trigger.current?.contains(event.target as Node))close()};const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();close()}};window.addEventListener('pointerdown',outside);window.addEventListener('keydown',key);return()=>{window.removeEventListener('pointerdown',outside);window.removeEventListener('keydown',key)}},[open,close]);
  const toggle=()=>{if(!open&&trigger.current){setPosition(positionRowActionMenu(trigger.current.getBoundingClientRect(),{width:innerWidth,height:innerHeight}))}setOpen(value=>!value)};
  const move=async(categoryId:string|null)=>{try{await moveItemAfterFlush(categoryId,flush,onMove);close()}catch{return}};
  const label=item.task.trim()||'chưa có tên';
  return <><button ref={trigger} className="row-action-trigger" aria-label={`Hành động cho công việc ${label}`} title={`Hành động cho công việc ${label}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}><MoreHorizontal size={19}/></button>{open&&createPortal(<div ref={menu} className="row-action-menu" role="menu" aria-label={`Hành động cho công việc ${label}`} style={position}><strong>Chuyển sang nhóm</strong>{getRowActionDestinations(categories).map(category=><button role="menuitem" key={category.id} onClick={()=>void move(category.id)}>{item.categoryId===category.id?<Check size={15}/>:<span/>}{category.name}</button>)}<button role="menuitem" onClick={()=>void move(null)}>{item.categoryId===null?<Check size={15}/>:<span/>}Việc khác</button><hr/><button className="danger" role="menuitem" onClick={()=>{close();onDelete()}}><Trash2 size={15}/> Xóa công việc</button></div>,document.body)}</>;
}
function SaveIndicator({state,error,retry}:{state:SaveState;error:string|null;retry:()=>void}){
  if(state==='idle')return null;
  if(state==='saving')return <span className="save-state saving">Đang lưu…</span>;
  if(state==='saved')return <span className="save-state saved">Đã lưu</span>;
  return <span className="save-state failed" title={error??undefined}>Lưu thất bại <button onClick={retry}>Thử lại</button></span>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="stat"><span>{label}</span><strong>{value}</strong></div>}

function HistoryPage(){
  const[items,setItems]=useState<DailyLogSummary[]>([]);
  const[page,setPage]=useState(1);const[hasMore,setHasMore]=useState(false);
  const[loading,setLoading]=useState(true);const[loadingMore,setLoadingMore]=useState(false);const[error,setError]=useState<string|null>(null);
  const load=useCallback(async(targetPage:number,append:boolean)=>{
    if(append)setLoadingMore(true);else setLoading(true);
    setError(null);
    try{
      const result=await service.listHistory(targetPage,20);
      setItems(previous=>append?[...previous.filter(existing=>!result.items.some(next=>next.id===existing.id)),...result.items]:result.items);
      setPage(result.page);setHasMore(result.hasMore);
    }catch(reason){setError(friendlyError(reason))}
    finally{setLoading(false);setLoadingMore(false)}
  },[]);
  useEffect(()=>{void load(1,false)},[load]);
  return <div className="content"><header><p className="eyebrow">Nhìn lại hành trình</p><h1>Lịch sử</h1><p className="subtitle">Mỗi ngày đã ghi lại là một dấu mốc nhỏ.</p></header>
    {loading?<div className="history-loading"><LoaderCircle className="spin"/> Đang tải lịch sử…</div>:
    error?<div className="page-error">{error}<button onClick={()=>void load(1,false)}>Thử lại</button></div>:
    items.length===0?<div className="empty-state"><History size={28}/><h2>Chưa có ngày nào được ghi lại</h2><p>Hãy bắt đầu từ hôm nay.</p><button onClick={()=>navigate({page:'day',date:today()})}>Đi đến Hôm nay</button></div>:
    <div className="history-list">{items.map(summary=><button className="history-card" key={summary.id} onClick={()=>navigate({page:'day',date:summary.logDate})}>
      <div className="history-date"><strong>{shortVietnameseDate(summary.logDate)}</strong><span>{vietnameseDate(summary.logDate).split(',')[0]}</span></div>
      <div className="history-summary"><strong>{summary.totalItems} việc · {summary.completedItems} hoàn thành · {summary.percentage}%</strong>
        {summary.previewTasks.length>0&&<ul>{summary.previewTasks.map((task,index)=><li key={`${task}-${index}`}>{task}</li>)}</ul>}</div>
      <div className="history-progress"><span style={{width:`${summary.percentage}%`}}/></div><ChevronRight size={18}/></button>)}
      {hasMore&&<button className="load-more" disabled={loadingMore} onClick={()=>void load(page+1,true)}>{loadingMore?'Đang tải…':'Tải thêm'}</button>}
    </div>}</div>;
}
function SettingsPage({controller,onImported}:{controller:ThemeCustomizerController;onImported:()=>void}){
  return <div className="content"><header><p className="eyebrow">Tùy chỉnh trải nghiệm</p><h1>Cài đặt</h1></header>
    <BackupSettings flushTheme={controller.flush} onImported={onImported}/><CategorySettings service={service}/><ThemeSettings controller={controller}/></div>;
}
