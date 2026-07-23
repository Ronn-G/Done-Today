import {describe,expect,it,vi} from 'vitest';
import {LocaleService} from './localeService';

describe('LocaleService',()=>{
  it('prioritizes and preserves an explicit preference',async()=>{
    const save=vi.fn();const service=new LocaleService({load:async()=> 'en',save});
    await expect(service.initialize()).resolves.toEqual({locale:'en',source:'persisted'});expect(save).not.toHaveBeenCalled();
  });
  it('preserves an explicit Vietnamese preference',async()=>{
    const save=vi.fn();const service=new LocaleService({load:async()=> 'vi',save});
    await expect(service.initialize()).resolves.toEqual({locale:'vi',source:'persisted'});expect(save).not.toHaveBeenCalled();
  });
  it('persists the compatibility fallback without inspecting user content',async()=>{
    const save=vi.fn();const service=new LocaleService({load:async()=>null,save});
    await expect(service.initialize()).resolves.toEqual({locale:'vi',source:'compatibility',persistence:'saved'});expect(save).toHaveBeenCalledWith('vi');
  });
  it('replaces an invalid preference safely',async()=>{
    const save=vi.fn();const service=new LocaleService({load:async()=> 'fr',save});
    await expect(service.initialize()).resolves.toEqual({locale:'vi',source:'compatibility',persistence:'saved'});expect(save).toHaveBeenCalledWith('vi');
  });
  it('distinguishes read failure and never overwrites the stored preference',async()=>{
    const failure=new Error('database unavailable');const save=vi.fn();
    const service=new LocaleService({load:async()=>{throw failure},save});
    await expect(service.initialize()).resolves.toEqual({locale:'vi',source:'readFailure',error:failure});
    expect(save).not.toHaveBeenCalled();
  });
  it('reports compatibility persistence failure without blocking runtime fallback',async()=>{
    const failure=new Error('write failed');const service=new LocaleService({load:async()=>null,save:async()=>{throw failure}});
    await expect(service.initialize()).resolves.toEqual({locale:'vi',source:'compatibility',persistence:'failed',error:failure});
  });
});
