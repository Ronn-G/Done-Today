export const FLOATING_THEME_PANEL_STORAGE_KEY='done-today-floating-theme-panel';
export const FLOATING_THEME_PANEL_SCHEMA_VERSION=1;
export const FLOATING_THEME_PANEL_WIDTH=400;
export const FLOATING_THEME_PANEL_HEADER_HEIGHT=54;
export const FLOATING_THEME_PANEL_MARGIN=16;

export type ViewportSize={width:number;height:number};
export type PanelSize={width:number;height:number};
export type PanelPosition={x:number;y:number};
export type FloatingThemePanelState=PanelPosition&{
  collapsed:boolean;
  open:boolean;
  schemaVersion:typeof FLOATING_THEME_PANEL_SCHEMA_VERSION;
};

const finite=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);

export function getDefaultPanelPosition(viewport:ViewportSize,panel:PanelSize={width:FLOATING_THEME_PANEL_WIDTH,height:FLOATING_THEME_PANEL_HEADER_HEIGHT}):PanelPosition{
  return clampPanelPosition({x:viewport.width-panel.width-FLOATING_THEME_PANEL_MARGIN,y:88},viewport,panel);
}

export function clampPanelPosition(position:PanelPosition,viewport:ViewportSize,panel:PanelSize):PanelPosition{
  const maxX=Math.max(FLOATING_THEME_PANEL_MARGIN,viewport.width-panel.width-FLOATING_THEME_PANEL_MARGIN);
  const maxY=Math.max(FLOATING_THEME_PANEL_MARGIN,viewport.height-panel.height-FLOATING_THEME_PANEL_MARGIN);
  return{
    x:Math.min(Math.max(position.x,FLOATING_THEME_PANEL_MARGIN),maxX),
    y:Math.min(Math.max(position.y,FLOATING_THEME_PANEL_MARGIN),maxY),
  };
}

export function defaultPanelState(viewport:ViewportSize,panel?:PanelSize):FloatingThemePanelState{
  return{...getDefaultPanelPosition(viewport,panel),collapsed:false,open:false,schemaVersion:FLOATING_THEME_PANEL_SCHEMA_VERSION};
}

export function parsePanelState(raw:string|null,viewport:ViewportSize,panel:PanelSize):FloatingThemePanelState{
  const fallback=defaultPanelState(viewport,panel);
  if(!raw)return fallback;
  try{
    const value:unknown=JSON.parse(raw);
    if(typeof value!=='object'||value===null)return fallback;
    const candidate=value as Record<string,unknown>;
    if(candidate.schemaVersion!==FLOATING_THEME_PANEL_SCHEMA_VERSION||!finite(candidate.x)||!finite(candidate.y)||typeof candidate.collapsed!=='boolean'||typeof candidate.open!=='boolean')return fallback;
    return{...clampPanelPosition({x:candidate.x,y:candidate.y},viewport,panel),collapsed:candidate.collapsed,open:candidate.open,schemaVersion:FLOATING_THEME_PANEL_SCHEMA_VERSION};
  }catch{return fallback}
}

export function isInteractiveDragTarget(target:EventTarget|null):boolean{
  return Boolean(target&&typeof (target as {closest?:unknown}).closest==='function'&&(target as unknown as {closest:(selector:string)=>Element|null}).closest('button,input,select,textarea,a,label,[role="button"],[contenteditable="true"]'));
}

export function resetPanelPosition(state:FloatingThemePanelState,viewport:ViewportSize,panel:PanelSize):FloatingThemePanelState{
  return{...state,...getDefaultPanelPosition(viewport,panel)};
}

export function setPanelOpen(state:FloatingThemePanelState,open:boolean):FloatingThemePanelState{
  return{...state,open};
}

export async function closeFloatingThemePanel(flush:()=>Promise<void>,close:()=>void):Promise<void>{
  try{await flush()}finally{close()}
}
