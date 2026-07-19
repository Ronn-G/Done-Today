import{useCallback,useEffect,useLayoutEffect,useRef}from'react';
import{ChevronsDownUp,ChevronsUpDown,GripHorizontal,LocateFixed,X}from'lucide-react';
import type{ThemeCustomizerController}from'./themeCustomizerController';
import{ThemeCustomizerContent}from'./ThemeSettings';
import{clampPanelPosition,closeFloatingThemePanel,defaultPanelState,FLOATING_THEME_PANEL_HEADER_HEIGHT,FLOATING_THEME_PANEL_STORAGE_KEY,FLOATING_THEME_PANEL_WIDTH,isInteractiveDragTarget,parsePanelState,resetPanelPosition,type FloatingThemePanelState}from'./floatingThemePanelState';

const viewport=()=>({width:window.innerWidth,height:window.innerHeight});
const panelSize=(element:HTMLElement|null)=>({width:element?.offsetWidth??FLOATING_THEME_PANEL_WIDTH,height:element?.offsetHeight??FLOATING_THEME_PANEL_HEADER_HEIGHT});

export function loadFloatingThemePanelState(){
  return parsePanelState(localStorage.getItem(FLOATING_THEME_PANEL_STORAGE_KEY),viewport(),{width:FLOATING_THEME_PANEL_WIDTH,height:520});
}

export function FloatingThemeCustomizer({controller,state,setState}:{controller:ThemeCustomizerController;state:FloatingThemePanelState;setState:React.Dispatch<React.SetStateAction<FloatingThemePanelState>>}){
  const panelRef=useRef<HTMLElement>(null);const bodyRef=useRef<HTMLDivElement>(null);
  const dragRef=useRef<{pointerId:number;clientX:number;clientY:number;x:number;y:number}|null>(null);
  const persist=useCallback((next:FloatingThemePanelState)=>localStorage.setItem(FLOATING_THEME_PANEL_STORAGE_KEY,JSON.stringify(next)),[]);
  const update=useCallback((change:(current:FloatingThemePanelState)=>FloatingThemePanelState)=>setState(current=>{const next=change(current);persist(next);return next}),[persist,setState]);
  const clamp=useCallback(()=>update(current=>({...current,...clampPanelPosition(current,viewport(),panelSize(panelRef.current))})),[update]);
  useLayoutEffect(()=>{if(state.open)clamp()},[state.open,state.collapsed,clamp]);
  useEffect(()=>{const resize=()=>clamp();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[clamp]);
  const close=useCallback(()=>closeFloatingThemePanel(controller.flush,()=>update(current=>({...current,open:false}))).catch(()=>undefined),[controller.flush,update]);
  useEffect(()=>{if(!state.open)return;const keydown=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!(event.target instanceof HTMLInputElement)&&!(event.target instanceof HTMLTextAreaElement)&&!(event.target instanceof HTMLSelectElement))void close()};window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown)},[state.open,close]);
  if(!state.open)return null;
  const pointerDown=(event:React.PointerEvent<HTMLElement>)=>{if(event.button!==0||isInteractiveDragTarget(event.target))return;dragRef.current={pointerId:event.pointerId,clientX:event.clientX,clientY:event.clientY,x:state.x,y:state.y};event.currentTarget.setPointerCapture(event.pointerId);document.body.classList.add('dragging-theme-panel')};
  const pointerMove=(event:React.PointerEvent<HTMLElement>)=>{const drag=dragRef.current;if(!drag||drag.pointerId!==event.pointerId)return;const next=clampPanelPosition({x:drag.x+event.clientX-drag.clientX,y:drag.y+event.clientY-drag.clientY},viewport(),panelSize(panelRef.current));setState(current=>({...current,...next}))};
  const pointerEnd=(event:React.PointerEvent<HTMLElement>)=>{if(dragRef.current?.pointerId!==event.pointerId)return;dragRef.current=null;document.body.classList.remove('dragging-theme-panel');setState(current=>{persist(current);return current})};
  return <aside ref={panelRef} className={`floating-theme-panel ${state.collapsed?'collapsed':''}`} role="complementary" aria-label="Tùy chỉnh giao diện" style={{left:state.x,top:state.y}}>
    <header className="floating-theme-header" aria-label="Kéo bảng tùy chỉnh giao diện" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd}>
      <GripHorizontal size={18}/><strong>Tùy chỉnh giao diện</strong>
      <button aria-label="Đặt lại vị trí bảng tùy chỉnh" title="Đặt lại vị trí bảng tùy chỉnh" onClick={()=>update(current=>resetPanelPosition(current,viewport(),panelSize(panelRef.current)))}><LocateFixed size={17}/></button>
      <button aria-label={state.collapsed?'Mở rộng bảng tùy chỉnh':'Thu gọn bảng tùy chỉnh'} title={state.collapsed?'Mở rộng':'Thu gọn'} aria-expanded={!state.collapsed} onClick={()=>update(current=>({...current,collapsed:!current.collapsed}))}>{state.collapsed?<ChevronsUpDown size={17}/>:<ChevronsDownUp size={17}/>}</button>
      <button aria-label="Đóng bảng tùy chỉnh giao diện" title="Đóng" onClick={()=>void close()}><X size={18}/></button>
    </header>
    {!state.collapsed&&<div ref={bodyRef} className="floating-theme-body"><ThemeCustomizerContent controller={controller} compact/></div>}
  </aside>;
}

export function initialFloatingThemePanelState():FloatingThemePanelState{
  if(typeof window==='undefined')return defaultPanelState({width:900,height:600},{width:FLOATING_THEME_PANEL_WIDTH,height:520});
  return loadFloatingThemePanelState();
}
