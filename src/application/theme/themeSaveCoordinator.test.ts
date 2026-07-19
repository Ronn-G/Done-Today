import {describe,expect,it,vi} from 'vitest';
import {ThemeSaveCoordinator} from './themeSaveCoordinator';
describe('ThemeSaveCoordinator',()=>{
  it('persists the latest draft after debounce',async()=>{vi.useFakeTimers();const saved:number[]=[];const coordinator=new ThemeSaveCoordinator<number>(async value=>{saved.push(value)},()=>undefined,10);coordinator.schedule(1);coordinator.schedule(2);await vi.advanceTimersByTimeAsync(10);expect(saved).toEqual([2]);vi.useRealTimers()});
  it('does not let a stale response replace latest state',async()=>{let resolveFirst:()=>void=()=>undefined;const states:string[]=[];const coordinator=new ThemeSaveCoordinator<number>(value=>value===1?new Promise<void>(resolve=>{resolveFirst=resolve}):Promise.resolve(),state=>states.push(state),0);coordinator.schedule(1);const first=coordinator.flush();coordinator.schedule(2);await coordinator.flush();resolveFirst();await first;expect(states.at(-1)).toBe('saved')});
  it('retains failed draft for retry',async()=>{let attempts=0;const coordinator=new ThemeSaveCoordinator<number>(async()=>{attempts++;if(attempts===1)throw new Error('failed')},()=>undefined,0);coordinator.schedule(1);await expect(coordinator.flush()).rejects.toThrow();await coordinator.flush();expect(attempts).toBe(2)});
});
