import {afterEach,describe,expect,it,vi} from 'vitest';
import {JOURNAL_AUTOSAVE_DELAY_MS,SaveCoordinator,type SaveState} from './saveCoordinator';
afterEach(()=>vi.useRealTimers());
describe('SaveCoordinator',()=>{
  it('waits 600 ms, saves only the newest payload and does not duplicate a completed draft',async()=>{
    vi.useFakeTimers();const saved:string[]=[];const states:SaveState[]=[];const save=vi.fn(async(value:string)=>value);
    const coordinator=new SaveCoordinator<string>(save,value=>saved.push(value),state=>states.push(state));
    coordinator.schedule('a');coordinator.schedule('b');
    await vi.advanceTimersByTimeAsync(JOURNAL_AUTOSAVE_DELAY_MS-1);expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(1);expect(save).toHaveBeenCalledWith('b');
    expect(saved).toEqual(['b']);expect(states).toEqual(['saving','saved']);
    await coordinator.flush();expect(save).toHaveBeenCalledTimes(1);coordinator.cancel();
  });
  it('does not let an older response win',async()=>{
    const resolvers:Array<()=>void>=[];const states:SaveState[]=[];
    const committed:string[]=[];
    const coordinator=new SaveCoordinator<string>(value=>new Promise<string>(resolve=>{resolvers.push(()=>resolve(value))}),value=>committed.push(value),state=>states.push(state));
    coordinator.schedule('a');const first=coordinator.flush();coordinator.schedule('b');const second=coordinator.flush();
    resolvers[1]();await second;resolvers[0]();await first;
    expect(states.at(-1)).toBe('saved');expect(states.filter(s=>s==='saved')).toHaveLength(1);expect(committed).toEqual(['b']);
    coordinator.cancel();
  });
  it('keeps a failed draft available and retries the same repository payload',async()=>{
    let attempts=0;const states:SaveState[]=[];const payloads:string[]=[];const onPersisted=vi.fn();
    const coordinator=new SaveCoordinator<string>(async value=>{payloads.push(value);if(attempts++===0)throw new Error('work_item.update_failed');return value},onPersisted,state=>states.push(state));
    coordinator.schedule('draft mới nhất');await expect(coordinator.flush()).rejects.toThrow('work_item.update_failed');
    expect(states).toEqual(['saving','error']);expect(payloads).toEqual(['draft mới nhất']);expect(onPersisted).not.toHaveBeenCalled();
    await coordinator.flush();expect(payloads).toEqual(['draft mới nhất','draft mới nhất']);expect(states.at(-1)).toBe('saved');expect(onPersisted).toHaveBeenCalledWith('draft mới nhất');
    coordinator.cancel();
  });
  it('retries a newer draft when the user continues typing after a failure',async()=>{
    let attempts=0;const payloads:string[]=[];
    const coordinator=new SaveCoordinator(async(value:string)=>{payloads.push(value);if(attempts++===0)throw new Error('fail');return value},()=>undefined,()=>undefined);
    coordinator.schedule('old draft');await expect(coordinator.flush()).rejects.toThrow('fail');
    coordinator.schedule('new draft');await coordinator.flush();
    expect(payloads).toEqual(['old draft','new draft']);coordinator.cancel();
  });
  it('keeps the current saved state without an additional timeout transition',async()=>{
    vi.useFakeTimers();const states:SaveState[]=[];const save=vi.fn(async(value:string)=>value);
    const coordinator=new SaveCoordinator(save,()=>undefined,state=>states.push(state));
    coordinator.schedule('draft');await vi.advanceTimersByTimeAsync(JOURNAL_AUTOSAVE_DELAY_MS);
    expect(states).toEqual(['saving','saved']);
    await vi.advanceTimersByTimeAsync(10_000);expect(states).toEqual(['saving','saved']);expect(save).toHaveBeenCalledOnce();
    coordinator.cancel();
  });
});
