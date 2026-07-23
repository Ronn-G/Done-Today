import {afterEach,describe,expect,it,vi} from 'vitest';
import {createInstance,type i18n} from 'i18next';
import {createI18nController,resolveDiagnosticLocale,safeMissingTranslation,syncDocumentLanguage} from './index';

afterEach(()=>vi.unstubAllGlobals());
describe('i18n controller',()=>{
  it('initializes idempotently and synchronizes document language',async()=>{
    const target={lang:'en'};vi.stubGlobal('document',{documentElement:target});
    const instance=createInstance();const controller=createI18nController(instance,()=>{});
    const first=await controller.initialize('vi');const second=await controller.initialize('vi');
    expect(second).toBe(first);expect(target.lang).toBe('vi');
    await controller.changeLanguage('en');expect(target.lang).toBe('en');
    await controller.changeLanguage('vi');expect(target.lang).toBe('vi');
  });
  it('clears a rejected initialization so a transient failure can be retried',async()=>{
    let attempts=0;const listeners:Array<(language:string)=>void>=[];
    const runtime={
      isInitialized:false,language:'',resolvedLanguage:undefined as string|undefined,
      use:()=>runtime as unknown as i18n,
      init:async(options:{lng?:string})=>{attempts++;if(attempts===1)throw new Error('transient');runtime.isInitialized=true;runtime.language=String(options.lng);runtime.resolvedLanguage=String(options.lng);return (()=>'') as never},
      changeLanguage:async(language:string)=>{runtime.language=language;runtime.resolvedLanguage=language;listeners.forEach(listener=>listener(language));return (()=>'') as never},
      on:(_event:string,listener:(language:string)=>void)=>{listeners.push(listener);return runtime as unknown as i18n},
    };
    const setup=vi.fn();const controller=createI18nController(runtime as unknown as Parameters<typeof createI18nController>[0],setup);
    await expect(controller.initialize('vi')).rejects.toThrow('transient');
    await expect(controller.initialize('vi')).resolves.toBe(runtime);expect(attempts).toBe(2);expect(setup).toHaveBeenCalledOnce();
  });
  it('returns meaningful localized copy instead of a raw missing key',async()=>{
    const instance=createInstance();const report=vi.fn();const controller=createI18nController(instance,()=>{},report);
    await controller.initialize('vi');
    expect(instance.t('settings:keyThatDoesNotExist')).toBe(safeMissingTranslation('vi'));
    expect(instance.t('settings:keyThatDoesNotExist')).not.toContain('keyThatDoesNotExist');
    expect(report).toHaveBeenLastCalledWith('Missing translation [locale=vi] [namespace=settings] [key=keyThatDoesNotExist]');
    instance.t('settings:keyThatDoesNotExist');expect(report).toHaveBeenCalledTimes(1);
    await controller.changeLanguage('en');
    expect(instance.t('settings:stillMissing')).toBe(safeMissingTranslation('en'));
    expect(report).toHaveBeenLastCalledWith('Missing translation [locale=en] [namespace=settings] [key=stillMissing]');
    expect(report).toHaveBeenCalledTimes(2);
  });
  it('prefers and canonicalizes resolved language for diagnostics',()=>{
    expect(resolveDiagnosticLocale('en','vi')).toBe('en');
    expect(resolveDiagnosticLocale('VI-vn','en')).toBe('vi');
    expect(resolveDiagnosticLocale(undefined,'vi')).toBe('vi');
    expect(resolveDiagnosticLocale('fr-FR','vi')).toBe('en');
  });
  it('ignores unsupported document languages',()=>{const target={lang:'vi'};syncDocumentLanguage('fr',target);expect(target.lang).toBe('vi')});
});
