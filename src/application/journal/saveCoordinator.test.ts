import {describe,expect,it,vi} from 'vitest';
import {SaveCoordinator,type SaveState} from './saveCoordinator';
describe('SaveCoordinator',()=>{
  it('debounces and saves the newest value',async()=>{
    vi.useFakeTimers();const saved:string[]=[];const states:SaveState[]=[];
    const coordinator=new SaveCoordinator<string>(async value=>value,value=>saved.push(value),state=>states.push(state),600);
    coordinator.schedule('a');coordinator.schedule('b');await vi.advanceTimersByTimeAsync(600);
    expect(saved).toEqual(['b']);expect(states).toEqual(['saving','saved']);vi.useRealTimers();
  });
  it('does not let an older response win',async()=>{
    const resolvers:Array<()=>void>=[];const states:SaveState[]=[];
    const committed:string[]=[];
    const coordinator=new SaveCoordinator<string>(value=>new Promise<string>(resolve=>{resolvers.push(()=>resolve(value))}),value=>committed.push(value),state=>states.push(state));
    coordinator.schedule('a');const first=coordinator.flush();coordinator.schedule('b');const second=coordinator.flush();
    resolvers[1]();await second;resolvers[0]();await first;
    expect(states.at(-1)).toBe('saved');expect(states.filter(s=>s==='saved')).toHaveLength(1);expect(committed).toEqual(['b']);
  });
  it('keeps failed data available for retry',async()=>{
    let attempts=0;const states:SaveState[]=[];
    const coordinator=new SaveCoordinator(async value=>{if(attempts++===0)throw new Error('fail');return value},()=>undefined,state=>states.push(state));
    coordinator.schedule('draft');await expect(coordinator.flush()).rejects.toThrow('fail');
    await coordinator.flush();expect(states.at(-1)).toBe('saved');
  });
});
