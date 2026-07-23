import {describe,expect,it,vi} from 'vitest';
import {TauriLocaleRepository} from './tauriLocaleRepository';

describe('TauriLocaleRepository',()=>{
  it('initializes once and preserves the get/save command contract',async()=>{
    const invoke=vi.fn(async(command:string)=>command==='get_locale_preference'?'en':undefined);
    const repository=new TauriLocaleRepository(invoke);
    await expect(repository.load()).resolves.toBe('en');await repository.save('vi');
    expect(invoke.mock.calls).toEqual([
      ['initialize_database'],['get_locale_preference'],['save_locale_preference',{locale:'vi'}],
    ]);
  });
  it('propagates read infrastructure errors instead of converting them to missing',async()=>{
    const failure=new Error('invoke failed');const invoke=vi.fn(async(command:string)=>{if(command==='get_locale_preference')throw failure});
    const repository=new TauriLocaleRepository(invoke);
    await expect(repository.load()).rejects.toBe(failure);expect(invoke).not.toHaveBeenCalledWith('save_locale_preference',expect.anything());
  });
  it('propagates save infrastructure errors',async()=>{
    const failure=new Error('write failed');const invoke=vi.fn(async(command:string)=>{if(command==='save_locale_preference')throw failure});
    const repository=new TauriLocaleRepository(invoke);
    await expect(repository.save('en')).rejects.toBe(failure);
  });
});
