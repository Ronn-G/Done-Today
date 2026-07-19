import {describe,expect,it}from'vitest';
import {clampPanelPosition,closeFloatingThemePanel,defaultPanelState,FLOATING_THEME_PANEL_SCHEMA_VERSION,getDefaultPanelPosition,isInteractiveDragTarget,parsePanelState,resetPanelPosition,setPanelOpen}from'./floatingThemePanelState';

const viewport={width:900,height:600};const panel={width:400,height:520};
describe('floating theme panel state',()=>{
  it('validates and preserves a valid state',()=>expect(parsePanelState(JSON.stringify({x:300,y:50,collapsed:true,open:true,schemaVersion:FLOATING_THEME_PANEL_SCHEMA_VERSION}),viewport,panel)).toMatchObject({x:300,y:50,collapsed:true,open:true}));
  it('falls back when persisted state is invalid',()=>expect(parsePanelState('{"x":"bad"}',viewport,panel)).toEqual(defaultPanelState(viewport,panel)));
  it('clamps position into the viewport',()=>expect(clampPanelPosition({x:4000,y:-40},viewport,panel)).toEqual({x:484,y:16}));
  it('re-clamps after a viewport resize',()=>expect(clampPanelPosition({x:800,y:500},{width:700,height:400},panel)).toEqual({x:284,y:16}));
  it('persists collapsed and open values through parsing',()=>expect(parsePanelState(JSON.stringify({...defaultPanelState(viewport,panel),collapsed:true,open:true}),viewport,panel)).toMatchObject({collapsed:true,open:true}));
  it('opens without changing unrelated browser state',()=>expect(setPanelOpen(defaultPanelState(viewport,panel),true)).toMatchObject({open:true,collapsed:false}));
  it('resets only the position',()=>{const state={...defaultPanelState(viewport,panel),x:20,y:20,open:true,collapsed:true};expect(resetPanelPosition(state,viewport,panel)).toEqual({...state,...getDefaultPanelPosition(viewport,panel)})});
  it('does not start dragging from interactive controls',()=>{expect(isInteractiveDragTarget({closest:()=>({})} as unknown as EventTarget)).toBe(true);expect(isInteractiveDragTarget({closest:()=>null} as unknown as EventTarget)).toBe(false)});
  it('flushes before closing even when persistence fails',async()=>{const order:string[]=[];await expect(closeFloatingThemePanel(async()=>{order.push('flush');throw new Error('save')},()=>order.push('close'))).rejects.toThrow('save');expect(order).toEqual(['flush','close'])});
});
