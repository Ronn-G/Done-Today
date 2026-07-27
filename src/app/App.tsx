/* eslint-disable react-hooks/set-state-in-effect -- async route loads intentionally initialize screen state */
import {useCallback,useEffect,useId,useMemo,useRef,useState} from 'react';
import{createPortal}from'react-dom';
import {useTranslation} from 'react-i18next';
import {CalendarDays,Check,CheckCircle2,ChevronDown,ChevronLeft,ChevronRight,ChevronUp,History,LoaderCircle,MoreHorizontal,Palette,Settings,Trash2} from 'lucide-react';
import {JournalService} from '../application/journal/journalService';
import {JOURNAL_AUTOSAVE_DELAY_MS,SaveCoordinator,type SaveState} from '../application/journal/saveCoordinator';
import {ThemeSaveCoordinator,type ThemeSaveState} from '../application/theme/themeSaveCoordinator';
import{normalizeAppError}from'../application/errors/errorNormalizer';
import type{NormalizedAppError}from'../domain/errors/appError';
import {workStatusSchema,type DailyLog,type DailyLogSummary,type UpdateWorkItem,type WorkItem,type WorkStatus} from '../domain/journal/models';
import{groupDailyItems,parseCollapsedCategoryState,type CategoryGroup,type WorkCategory}from'../domain/journal/categories';
import {calculateStatistics} from '../domain/journal/statistics';
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
import{LanguageSettings}from'../features/settings/LanguageSettings';
import{getRowActionDestinations,moveItemAfterFlush,positionRowActionMenu}from'../features/daily-log/rowActionMenu';
import {compatibilityLocale,normalizeLocale} from '../domain/localization/locale';
import {formatCount,formatPercent} from '../i18n/formatters';
import{localizeAppError,toErrorTranslator}from'../i18n/errorPresentation';
import {addLocalDays,formatLongLocalDate,formatShortLocalDate,formatWeekdayLocalDate,isValidLocalDate,localDateKey} from '../shared/date';

type Route={page:'day';date:string}|{page:'history'}|{page:'settings'};
type AppPage=Route['page'];
const service=new JournalService(new TauriJournalRepository());
const themeRepository=new TauriThemeRepository();
const today=()=>localDateKey();
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
export function App(){
  const{t:tTheme}=useTranslation('theme');
  const[route,setRoute]=useState<Route>(parseRoute);
  const[theme,setTheme]=useState<ThemeMode>(initialTheme);
  const[themePreferences,setThemePreferences]=useState<ThemePreferences>(defaultThemePreferences);
  const[themeSaveState,setThemeSaveState]=useState<ThemeSaveState>('idle');
  const[themeSaveError,setThemeSaveError]=useState<NormalizedAppError|null>(null);
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
  const commitTheme=useCallback((next:ThemePreferences)=>{setThemePreferences(next);setThemeSaveError(null);themeCoordinator.schedule(next)},[themeCoordinator]);
  const flushTheme=useCallback(async()=>{try{await themeCoordinator.flush();setThemeSaveError(null)}catch(reason){const error=normalizeAppError(reason);setThemeSaveError(error);throw error}},[themeCoordinator]);
  const resetTheme=useCallback(()=>{if(confirm(tTheme('actions.resetConfirmation')))commitTheme(defaultThemePreferences())},[commitTheme,tTheme]);
  const themeController:ThemeCustomizerController={mode:theme,setMode:setTheme,preferences:themePreferences,setPreferences:setThemePreferences,activePalette,saveState:themeSaveState,error:themeSaveError,commit:commitTheme,flush:flushTheme,retry:flushTheme,reset:resetTheme};
  const openThemePanel=()=>setFloatingThemePanel(current=>{const next={...current,open:true};localStorage.setItem('done-today-floating-theme-panel',JSON.stringify(next));return next});
  return <div className="app-shell"><aside className="sidebar">
    <div className="brand"><span className="brand-mark"><CheckCircle2 size={20}/></span><span>Done Today</span></div>
    <AppNavigation activePage={route.page} onNavigate={page=>page==='day'?navigate({page,date:today()}):navigate({page})}/>
  </aside><main>
    {route.page==='day'&&<DayEditor key={`${route.date}-${dataRevision}`} date={route.date} onOpenTheme={openThemePanel}/>}
    {route.page==='history'&&<HistoryPage key={dataRevision}/>}
    {route.page==='settings'&&<SettingsPage controller={themeController} onImported={()=>{setDataRevision(value=>value+1);void themeRepository.load().then(value=>setThemePreferences(value??defaultThemePreferences()));navigate({page:'day',date:today()})}}/>}
  </main>{route.page==='day'&&<FloatingThemeCustomizer controller={themeController} state={floatingThemePanel} setState={setFloatingThemePanel}/>}</div>;
}
export function AppNavigation({activePage,onNavigate}:{activePage:AppPage;onNavigate:(page:AppPage)=>void}){
  const {t}=useTranslation('nav');
  return <><nav><Nav active={activePage==='day'} onClick={()=>onNavigate('day')} icon={<CalendarDays size={18}/>}>{t('today')}</Nav>
    <Nav active={activePage==='history'} onClick={()=>onNavigate('history')} icon={<History size={18}/>}>{t('history')}</Nav></nav>
    <Nav active={activePage==='settings'} onClick={()=>onNavigate('settings')} icon={<Settings size={18}/>}>{t('settings')}</Nav></>;
}
function Nav({active,onClick,icon,children}:{active:boolean;onClick:()=>void;icon:React.ReactNode;children:React.ReactNode}){
  return <button className={`nav-item ${active?'active':''}`} onClick={onClick}>{icon}<span>{children}</span></button>;
}

function DayEditor({date,onOpenTheme}:{date:string;onOpenTheme:()=>void}){
  const {t}=useTranslation('today');
  const{t:tErrors}=useTranslation('errors');
  const[log,setLog]=useState<DailyLog|null>(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<NormalizedAppError|null>(null);
  const[creating,setCreating]=useState(false);
  const[focusId,setFocusId]=useState<string|null>(null);
  const[categories,setCategories]=useState<WorkCategory[]>([]);
  const[collapsed,setCollapsed]=useState<string[]>([]);
  const[currentStreak,setCurrentStreak]=useState(0);
  const refreshStreak=useCallback(async()=>setCurrentStreak(await service.getCurrentStreak(today())),[]);
  const load=useCallback(async()=>{
    setLoading(true);setError(null);
    try{await service.initialize();const[nextLog,nextCategories,nextStreak]=await Promise.all([service.getDailyLog(date),service.listCategories(true),service.getCurrentStreak(today())]);setLog(nextLog);setCategories(nextCategories);setCurrentStreak(nextStreak);setCollapsed(parseCollapsedCategoryState(localStorage.getItem('done-today-collapsed-categories'),nextCategories.map(category=>category.id)).collapsedCategoryIds)}
    catch(reason){setError(normalizeAppError(reason))}
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
    }catch(reason){setError(normalizeAppError(reason))}
    finally{setCreating(false)}
  },[creating,date]);
  useEffect(()=>{
    const handler=(event:KeyboardEvent)=>{if(event.ctrlKey&&event.key==='Enter'){event.preventDefault();void addItem()}};
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
  },[addItem]);
  const updateLocal=useCallback((item:WorkItem)=>setLog(previous=>previous?{...previous,items:previous.items.map(entry=>entry.id===item.id?item:entry)}:previous),[]);
  const remove=async(item:WorkItem)=>{
    try{await service.deleteWorkItem(item.id);setLog(previous=>previous?{...previous,items:previous.items.filter(entry=>entry.id!==item.id)}:previous)}
    catch(reason){setError(normalizeAppError(reason));return}
    if(item.task.trim())void refreshStreak().catch(reason=>setError(normalizeAppError(reason)));
  };
  const move=async(bucket:WorkItem[],index:number,direction:-1|1)=>{
    if(!log)return;const target=index+direction;if(target<0||target>=bucket.length)return;
    const ordered=[...bucket];[ordered[index],ordered[target]]=[ordered[target],ordered[index]];
    try{const saved=await service.reorderWorkItems(log.id,ordered.map(item=>item.id));setLog(current=>current?{...current,items:current.items.map(item=>saved.find(value=>value.id===item.id)??item)}:current)}
    catch(reason){const failure=normalizeAppError(reason);void load().finally(()=>setError(failure))}
  };
  const toggleGroup=(id:string|null)=>{const key=id??'__other__';setCollapsed(current=>{const next=current.includes(key)?current.filter(value=>value!==key):[...current,key];localStorage.setItem('done-today-collapsed-categories',JSON.stringify({schemaVersion:1,collapsedCategoryIds:next}));return next})};
  const changeCategory=async(item:WorkItem,categoryId:string|null)=>{try{const saved=await service.moveWorkItemToCategory(item.id,categoryId);updateLocal(saved)}catch(reason){setError(normalizeAppError(reason));throw reason}};
  const go=(next:string)=>navigate({page:'day',date:next});
  return <div className="content">
    <TodayOverview date={date} stats={stats} currentStreak={currentStreak} onGo={go} onOpenTheme={onOpenTheme}/>
    {error&&<div className="page-error">{localizeAppError(error,toErrorTranslator(tErrors))}<button onClick={()=>void load()}>{t('common:actions.retry')}</button></div>}
    <section className="table-card">{loading?<div className="message"><LoaderCircle className="spin" size={20}/> {t('status.loading')}</div>:
      <div className="table-scroll"><table><TodayTableHeader/>
      <tbody>{groups.flatMap(group=>{const key=group.id??'__other__';const hidden=collapsed.includes(key);return[<TodayCategoryHeader key={`header-${key}`} group={group} hidden={hidden} onAddItem={addItem} onToggle={toggleGroup}/>,...(hidden?[]:group.items.map((item,index)=>{const bucket=group.items.filter(value=>(value.status==='completed')===(item.status==='completed'));const bucketIndex=bucket.findIndex(value=>value.id===item.id);return <WorkRow key={item.id} item={item} categories={categories.filter(value=>value.isActive)} autoFocus={focusId===item.id} onFocused={()=>setFocusId(null)}
        dataIndex={index} onChange={updateLocal} onJournalActivityChanged={refreshStreak} onCategoryChange={categoryId=>changeCategory(item,categoryId)} onDelete={()=>void remove(item)} onMoveUp={()=>void move(bucket,bucketIndex,-1)} onMoveDown={()=>void move(bucket,bucketIndex,1)}
        canMoveUp={bucketIndex>0} canMoveDown={bucketIndex<bucket.length-1}/>}))]})}
      {!items.length&&<TodayEmptyState/>}</tbody></table></div>}
      <AddRowFooter categories={categories} onAddItem={addItem}/>
    </section>
  </div>;
}

export function TodayOverview({date,stats,currentStreak,onGo,onOpenTheme}:{
  date:string;stats:ReturnType<typeof calculateStatistics>;currentStreak:number;onGo:(date:string)=>void;onOpenTheme:()=>void;
}){
  const {t,i18n}=useTranslation('today');
  const {t:tTheme}=useTranslation('theme');
  const locale=normalizeLocale(i18n.resolvedLanguage??i18n.language)??compatibilityLocale;
  const current=date===today();
  const formattedDate=formatLongLocalDate(date,locale);
  return <><header className="day-header"><div><p className="eyebrow">{current?t('eyebrow.today'):t('eyebrow.archive')}</p>
    <h1>{current?t('heading.prompt'):formattedDate}</h1>
    <p className="subtitle">{current?t('subtitle.today'):t('subtitle.past')}</p></div>
    <div className="date-nav">
      <button aria-label={t('dateControls.previous')} title={t('dateControls.previous')} onClick={()=>onGo(addLocalDays(date,-1))}><ChevronLeft size={18}/></button>
      <label className="date-picker"><span>{formattedDate}</span><input aria-label={t('dateControls.choose')} type="date" value={date} onChange={event=>isValidLocalDate(event.target.value)&&onGo(event.target.value)}/></label>
      <button aria-label={t('dateControls.next')} title={t('dateControls.next')} onClick={()=>onGo(addLocalDays(date,1))}><ChevronRight size={18}/></button>
      {!current&&<button className="today-button" onClick={()=>onGo(today())}>{t('dateControls.today')}</button>}
      <button aria-label={tTheme('customizer.open')} title={tTheme('customizer.open')} onClick={onOpenTheme}><Palette size={18}/></button>
    </div></header>
    <section className="stats" aria-label={t('stats.label')}><Stat label={t('stats.total')} value={formatCount(stats.total,locale).value}/><Stat label={t('stats.completed')} value={formatCount(stats.completed,locale).value}/>
      <div className="stat progress-stat"><span>{t('stats.completionRate')}</span><strong>{formatPercent(stats.percentage/100,locale)}</strong><div className="progress" role="progressbar" aria-label={t('stats.completionRate')} aria-valuenow={stats.percentage} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${stats.percentage}%`}}/></div></div>
      <Stat className="streak-stat" label={t('stats.streak')} value={t('stats.streakValue',{count:currentStreak})}/></section></>;
}

export function TodayTableHeader(){
  const {t}=useTranslation('today');
  return <><caption className="sr-only">{t('table.label')}</caption><thead><tr>
    <th className="order-col">{t('table.columns.order')}</th><th>{t('table.columns.task')}</th><th>{t('table.columns.result')}</th>
    <th>{t('table.columns.nextAction')}</th><th>{t('table.columns.status')}</th>
    <th className="action-col"><span className="sr-only">{t('table.columns.actions')}</span></th>
  </tr></thead></>;
}

export function TodayCategoryHeader({group,hidden,onAddItem,onToggle}:{
  group:CategoryGroup;hidden:boolean;onAddItem:(categoryId:string|null)=>void|Promise<void>;onToggle:(categoryId:string|null)=>void;
}){
  const {t}=useTranslation('today');
  const displayName=group.name??t('categories.other');
  return <tr className="category-row"><th colSpan={6}><div className="category-header">
    <i style={group.color?{backgroundColor:group.color}:undefined}/><h2>{displayName}{!group.isActive&&<small> · {t('categories.hidden')}</small>}</h2>
    <span>{t('categories.completedCount',{completed:group.completedItems,count:group.totalItems})}</span>
    <button aria-label={t('categories.addItem',{category:displayName})} onClick={()=>void onAddItem(group.id)}>+</button>
    <button aria-label={hidden?t('categories.expand',{category:displayName}):t('categories.collapse',{category:displayName})} aria-expanded={!hidden} onClick={()=>onToggle(group.id)}>{hidden?<ChevronDown size={16}/>:<ChevronUp size={16}/>}</button>
  </div></th></tr>;
}

export function TodayEmptyState(){
  const {t}=useTranslation('today');
  return <tr><td colSpan={6} className="empty-cell"><strong>{t('emptyState.title')}</strong><span>{t('emptyState.body')}</span></td></tr>;
}

function resolveAddRowCategorySelection(value:string):string|null|undefined{
  if(value==='')return undefined;
  return value==='__other__'?null:value;
}

export function submitAddRowCategorySelection(value:string,onAddItem:(categoryId:string|null)=>void|Promise<void>){
  const categoryId=resolveAddRowCategorySelection(value);
  if(categoryId===undefined)return false;
  void onAddItem(categoryId);return true;
}

export function AddRowFooter({categories,onAddItem}:{categories:WorkCategory[];onAddItem:(categoryId:string|null)=>void|Promise<void>}){
  const {t}=useTranslation('today');
  return <footer className="table-footer"><label className="add-row-select"><span>{t('addItem.label')}</span>
    <select aria-label={t('addItem.accessibility.chooseCategory')} onChange={event=>{submitAddRowCategorySelection(event.target.value,onAddItem);event.target.value=''}} defaultValue="">
      <option value="" disabled>{t('addItem.chooseCategory')}</option>
      {categories.filter(category=>category.isActive).map(category=><option key={category.id} value={category.id}>{category.name}</option>)}
      <option value="__other__">{t('categories.other')}</option>
    </select></label>
    <p className="shortcut-hint">{t('autosave.hint')}</p>
  </footer>;
}

export function submitWorkStatusSelection(value:string,onSelect:(status:WorkStatus)=>void){
  const parsed=workStatusSchema.safeParse(value);
  if(!parsed.success)return false;
  onSelect(parsed.data);return true;
}
export function journalEligibilityChanged(previousTask:string,nextTask:string){
  return Boolean(previousTask.trim())!==Boolean(nextTask.trim());
}
export function createJournalEligibilityTracker(initialTask:string){
  let persistedTask=initialTask;
  return(nextTask:string)=>{
    const changed=journalEligibilityChanged(persistedTask,nextTask);
    persistedTask=nextTask;return changed;
  };
}

export function WorkRow({item,categories,dataIndex,autoFocus,onFocused,onChange,onJournalActivityChanged,onCategoryChange,onDelete,onMoveUp,onMoveDown,canMoveUp,canMoveDown}:{
  item:WorkItem;categories:WorkCategory[];dataIndex:number;autoFocus:boolean;onFocused:()=>void;onChange:(item:WorkItem)=>void;onCategoryChange:(id:string|null)=>Promise<void>;onDelete:()=>void;
  onJournalActivityChanged:()=>void|Promise<void>;onMoveUp:()=>void;onMoveDown:()=>void;canMoveUp:boolean;canMoveDown:boolean;
}){
  const {t}=useTranslation('today');
  const[state,setState]=useState<SaveState>('idle');
  const latest=useRef(item);
  const composing=useRef(false);
  const[initialPersistedTask]=useState(()=>item.task);
  useEffect(()=>{latest.current=item},[item]);
  const trackEligibility=useMemo(()=>createJournalEligibilityTracker(initialPersistedTask),[initialPersistedTask]);
  const coordinator=useMemo(()=>{
    return new SaveCoordinator<UpdateWorkItem,WorkItem>(
      input=>service.updateWorkItem(input),
      (saved,draft)=>{
        const reconciled={...saved,task:draft.task,result:draft.result,nextAction:draft.nextAction,status:draft.status};
        const eligibilityChanged=trackEligibility(saved.task);onChange(reconciled);
        if(eligibilityChanged)void onJournalActivityChanged();
      },
      setState,
      JOURNAL_AUTOSAVE_DELAY_MS,
    );
  },[onChange,onJournalActivityChanged,trackEligibility]);
  useEffect(()=>()=>{void coordinator.flush().catch(()=>undefined);coordinator.cancel()},[coordinator]);
  useEffect(()=>{
    const before=()=>{void coordinator.flush().catch(()=>undefined)};
    window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);
  },[coordinator]);
  const schedule=(next:WorkItem,immediate=false)=>{
    latest.current=next;onChange(next);
    const input={id:next.id,task:next.task,result:next.result,nextAction:next.nextAction,status:next.status};
    coordinator.schedule(input);
    if(immediate)void coordinator.flush().catch(()=>undefined);
  };
  const changeText=(field:'task'|'result'|'nextAction',value:string)=>{
    const next={...latest.current,[field]:value};
    latest.current=next;onChange(next);
    if(!composing.current){
      const input={id:next.id,task:next.task,result:next.result,nextAction:next.nextAction,status:next.status};
      coordinator.schedule(input);
    }
  };
  const compositionStart=()=>{composing.current=true;coordinator.suspend()};
  const compositionEnd=(field:'task'|'result'|'nextAction',event:React.CompositionEvent<HTMLTextAreaElement>)=>{
    composing.current=false;changeText(field,event.currentTarget.value);
  };
  const flush=()=>void coordinator.flush().catch(()=>undefined);
  const flushBeforeAction=()=>coordinator.flush();
  const escape=(event:React.KeyboardEvent)=>{if(event.key==='Escape')(event.currentTarget as HTMLElement).blur()};
  const statusLabels:Record<WorkStatus,string>={
    completed:t('status.options.completed'),
    in_progress:t('status.options.inProgress'),
    postponed:t('status.options.postponed'),
    cancelled:t('status.options.cancelled'),
  };
  return <tr className="editable-row" data-group-index={dataIndex}>
    <td className="reorder-cell"><button aria-label={t('common:actions.moveUp')} title={t('common:actions.moveUp')} disabled={!canMoveUp} onClick={onMoveUp}><ChevronUp size={14}/></button><button aria-label={t('common:actions.moveDown')} title={t('common:actions.moveDown')} disabled={!canMoveDown} onClick={onMoveDown}><ChevronDown size={14}/></button></td>
    <td><textarea className="work-item-editor task-editor" aria-label={t('fields.task.label')} placeholder={t('fields.task.placeholder')} value={item.task} maxLength={500} rows={2} autoFocus={autoFocus} onFocus={onFocused} onChange={e=>changeText('task',e.target.value)} onCompositionStart={compositionStart} onCompositionEnd={e=>compositionEnd('task',e)} onBlur={flush} onKeyDown={escape}/></td>
    <td><textarea className="work-item-editor result-editor" aria-label={t('fields.result.label')} placeholder={t('fields.result.placeholder')} value={item.result} maxLength={2000} rows={2} onChange={e=>changeText('result',e.target.value)} onCompositionStart={compositionStart} onCompositionEnd={e=>compositionEnd('result',e)} onBlur={flush} onKeyDown={escape}/></td>
    <td><textarea className="work-item-editor next-action-editor" aria-label={t('fields.nextAction.label')} placeholder={t('fields.nextAction.placeholder')} value={item.nextAction} maxLength={1000} rows={2} onChange={e=>changeText('nextAction',e.target.value)} onCompositionStart={compositionStart} onCompositionEnd={e=>compositionEnd('nextAction',e)} onBlur={flush} onKeyDown={escape}/></td>
    <td><select aria-label={t('fields.status.label')} className={`status-select ${item.status}`} value={item.status} onChange={e=>submitWorkStatusSelection(e.target.value,status=>schedule({...latest.current,status},true))}>
      {workStatusSchema.options.map(value=><option key={value} value={value}>{statusLabels[value]}</option>)}</select>
      <SaveIndicator state={state} retry={flush}/></td>
    <td className="row-actions"><RowActionMenu item={item} categories={categories} flush={flushBeforeAction} onMove={onCategoryChange} onDelete={onDelete}/></td>
  </tr>;
}
export function requiresDeleteConfirmation(item:Pick<WorkItem,'task'|'result'|'nextAction'>){
  return Boolean(item.task.trim()||item.result.trim()||item.nextAction.trim());
}
export function completeDeleteConfirmation(confirmed:boolean,onDelete:()=>void){
  if(confirmed)onDelete();
  return confirmed;
}
export function DeleteConfirmationDialog({onCancel,onConfirm}:{onCancel:()=>void;onConfirm:()=>void}){
  const {t}=useTranslation('today');const dialog=useRef<HTMLDialogElement>(null);const id=useId();
  useEffect(()=>{const current=dialog.current;if(current&&!current.open)current.showModal();return()=>{if(current?.open)current.close()}},[]);
  const cancel=()=>{dialog.current?.close();onCancel()};
  return <dialog ref={dialog} className="delete-confirmation-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-body`}
    onCancel={event=>{event.preventDefault();cancel()}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();cancel()}}}>
    <div className="delete-confirmation-content"><h2 id={`${id}-title`}>{t('item.confirmDelete.title')}</h2><p id={`${id}-body`}>{t('item.confirmDelete.body')}</p>
      <div className="delete-confirmation-actions"><button type="button" autoFocus onClick={cancel}>{t('common:actions.cancel')}</button>
        <button type="button" className="danger" onClick={()=>{dialog.current?.close();onConfirm()}}>{t('item.confirmDelete.confirm')}</button></div>
    </div>
  </dialog>;
}
export function RowActionMenuContent({item,categories,position,onMove,onDelete,menuRef}:{
  item:WorkItem;categories:WorkCategory[];position:{left:number;top:number};onMove:(id:string|null)=>void;onDelete:()=>void;menuRef?:React.RefObject<HTMLDivElement|null>;
}){
  const {t}=useTranslation('today');const label=item.task.trim()||t('item.untitled');const actionsLabel=t('item.accessibility.actionsForTask',{task:label});
  return <div ref={menuRef} className="row-action-menu" role="menu" aria-label={actionsLabel} style={position}><strong>{t('categories.moveTo')}</strong>
    {getRowActionDestinations(categories).map(category=><button role="menuitem" key={category.id} onClick={()=>onMove(category.id)}>{item.categoryId===category.id?<Check size={15}/>:<span/>}{category.name}</button>)}
    <button role="menuitem" onClick={()=>onMove(null)}>{item.categoryId===null?<Check size={15}/>:<span/>}{t('categories.other')}</button><hr/>
    <button className="danger" role="menuitem" onClick={onDelete}><Trash2 size={15}/> {t('item.delete')}</button>
  </div>;
}
export function RowActionMenu({item,categories,flush,onMove,onDelete}:{item:WorkItem;categories:WorkCategory[];flush:()=>Promise<void>;onMove:(id:string|null)=>Promise<void>;onDelete:()=>void}){
  const {t}=useTranslation('today');
  const[open,setOpen]=useState(false);const[confirmingDelete,setConfirmingDelete]=useState(false);const[position,setPosition]=useState({left:0,top:0});const trigger=useRef<HTMLButtonElement>(null);const menu=useRef<HTMLDivElement>(null);
  const close=useCallback(()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.focus())},[]);
  useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!menu.current?.contains(event.target as Node)&&!trigger.current?.contains(event.target as Node))close()};const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();close()}};window.addEventListener('pointerdown',outside);window.addEventListener('keydown',key);return()=>{window.removeEventListener('pointerdown',outside);window.removeEventListener('keydown',key)}},[open,close]);
  const toggle=()=>{if(!open&&trigger.current){setPosition(positionRowActionMenu(trigger.current.getBoundingClientRect(),{width:innerWidth,height:innerHeight}))}setOpen(value=>!value)};
  const move=async(categoryId:string|null)=>{try{await moveItemAfterFlush(categoryId,flush,onMove);close()}catch{return}};
  const requestDelete=()=>{setOpen(false);if(requiresDeleteConfirmation(item))setConfirmingDelete(true);else onDelete()};
  const finishDelete=(confirmed:boolean)=>{setConfirmingDelete(false);if(!completeDeleteConfirmation(confirmed,onDelete))requestAnimationFrame(()=>trigger.current?.focus())};
  const label=item.task.trim()||t('item.untitled');const actionsLabel=t('item.accessibility.actionsForTask',{task:label});
  return <><button ref={trigger} className="row-action-trigger" aria-label={actionsLabel} title={actionsLabel} aria-haspopup="menu" aria-expanded={open} onClick={toggle}><MoreHorizontal size={19}/></button>
    {open&&createPortal(<RowActionMenuContent item={item} categories={categories} position={position} onMove={categoryId=>void move(categoryId)} onDelete={requestDelete} menuRef={menu}/>,document.body)}
    {confirmingDelete&&createPortal(<DeleteConfirmationDialog onCancel={()=>finishDelete(false)} onConfirm={()=>finishDelete(true)}/>,document.body)}</>;
}
export function SaveIndicator({state,retry}:{state:SaveState;retry:()=>void}){
  const {t}=useTranslation('today');
  if(state==='idle')return null;
  if(state==='saving')return <span className="save-state saving" role="status" aria-live="polite" aria-atomic="true">{t('autosave.saving')}</span>;
  if(state==='saved')return <span className="save-state saved" role="status" aria-live="polite" aria-atomic="true">{t('autosave.saved')}</span>;
  const retryLabel=t('autosave.accessibility.retry');
  return <span className="save-state failed" role="status" aria-live="polite" aria-atomic="true">{t('autosave.failed')} <button type="button" aria-label={retryLabel} title={retryLabel} onClick={retry}>{t('common:actions.retry')}</button></span>;
}
function Stat({label,value,className=''}:{label:string;value:string;className?:string}){return <div className={`stat ${className}`.trim()}><span>{label}</span><strong>{value}</strong></div>}

export function mergeHistorySummaries(previous:DailyLogSummary[],next:DailyLogSummary[],append:boolean){
  return append?[...previous.filter(existing=>!next.some(entry=>entry.id===existing.id)),...next]:next;
}

function HistoryPage(){
  const[items,setItems]=useState<DailyLogSummary[]>([]);
  const[page,setPage]=useState(1);const[hasMore,setHasMore]=useState(false);
  const[loading,setLoading]=useState(true);const[loadingMore,setLoadingMore]=useState(false);const[error,setError]=useState<NormalizedAppError|null>(null);
  const load=useCallback(async(targetPage:number,append:boolean)=>{
    if(append)setLoadingMore(true);else setLoading(true);
    setError(null);
    try{
      const result=await service.listHistory(targetPage,20);
      setItems(previous=>mergeHistorySummaries(previous,result.items,append));
      setPage(result.page);setHasMore(result.hasMore);
    }catch(reason){setError(normalizeAppError(reason))}
    finally{setLoading(false);setLoadingMore(false)}
  },[]);
  useEffect(()=>{void load(1,false)},[load]);
  return <HistoryView items={items} loading={loading} loadingMore={loadingMore} error={error} hasMore={hasMore}
    onRetry={()=>void load(1,false)} onLoadMore={()=>void load(page+1,true)}
    onOpenDay={date=>navigate({page:'day',date})} onGoToday={()=>navigate({page:'day',date:today()})}/>;
}

export function HistoryView({items,loading,loadingMore,error,hasMore,onRetry,onLoadMore,onOpenDay,onGoToday}:{
  items:DailyLogSummary[];loading:boolean;loadingMore:boolean;error:boolean|NormalizedAppError|null;hasMore:boolean;
  onRetry:()=>void;onLoadMore:()=>void;onOpenDay:(date:string)=>void;onGoToday:()=>void;
}){
  const {t,i18n}=useTranslation('history');
  const{t:tErrors}=useTranslation('errors');
  const locale=normalizeLocale(i18n.resolvedLanguage??i18n.language)??compatibilityLocale;
  return <div className="content"><header><p className="eyebrow">{t('heading.eyebrow')}</p><h1>{t('heading.title')}</h1><p className="subtitle">{t('heading.subtitle')}</p></header>
    {loading?<div className="history-loading" role="status" aria-live="polite" aria-atomic="true"><LoaderCircle className="spin"/> {t('status.loading')}</div>:
    error?<div className="page-error" role="alert">{typeof error==='object'?localizeAppError(error,toErrorTranslator(tErrors)):t('errors.load')}<button type="button" onClick={onRetry}>{t('common:actions.retry')}</button></div>:
    items.length===0?<div className="empty-state"><History size={28}/><h2>{t('emptyState.title')}</h2><p>{t('emptyState.body')}</p><button type="button" onClick={onGoToday}>{t('actions.goToToday')}</button></div>:
    <section className="history-list" aria-label={t('accessibility.list')}>{items.map(summary=>{
      const date=formatLongLocalDate(summary.logDate,locale);
      const percentage=formatPercent(summary.percentage/100,locale);
      const dailySummary=t('summary.daily',{count:summary.totalItems,completed:summary.completedItems,percentage});
      const accessibleName=t('accessibility.openDay',{date,summary:dailySummary});
      return <button className="history-card" key={summary.id} type="button" aria-label={accessibleName} title={accessibleName} onClick={()=>onOpenDay(summary.logDate)}>
        <div className="history-date"><strong>{formatShortLocalDate(summary.logDate,locale)}</strong><span>{formatWeekdayLocalDate(summary.logDate,locale)}</span></div>
        <div className="history-summary"><strong>{dailySummary}</strong>
          {summary.previewTasks.length>0&&<ul>{summary.previewTasks.map((task,index)=><li key={`${summary.id}-${index}`}>{task}</li>)}</ul>}</div>
        <div className="history-progress" role="progressbar" aria-label={t('accessibility.completionRateForDay',{date})} aria-valuenow={summary.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${summary.percentage}%`}}/></div><ChevronRight size={18}/></button>;
    })}
      {hasMore&&<button className="load-more" type="button" disabled={loadingMore} aria-busy={loadingMore} onClick={onLoadMore}>{loadingMore?t('status.loadingMore'):t('actions.loadMore')}</button>}
    </section>}</div>;
}
export function SettingsPageView({children}:{children:React.ReactNode}){
  const{t}=useTranslation('settings');
  return <div className="content" role="region" aria-labelledby="settings-page-title"><header>
    <p className="eyebrow">{t('heading.eyebrow')}</p><h1 id="settings-page-title">{t('heading.title')}</h1><p className="subtitle">{t('heading.subtitle')}</p>
  </header>{children}</div>;
}
function SettingsPage({controller,onImported}:{controller:ThemeCustomizerController;onImported:()=>void}){
  return <SettingsPageView><LanguageSettings/><BackupSettings flushTheme={controller.flush} onImported={onImported}/><CategorySettings service={service}/><ThemeSettings controller={controller}/></SettingsPageView>;
}
