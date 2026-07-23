import {describe,expect,it,vi} from 'vitest';
import {isValidElement,type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BootstrapFailure,createApplicationBootstrap} from './bootstrap';

describe('application bootstrap',()=>{
  it('renders the application once after a persisted locale initializes',async()=>{
    const rendered:ReactNode[]=[];const initializeI18n=vi.fn(async()=>undefined);
    const bootstrap=createApplicationBootstrap({render:node=>rendered.push(node)},{
      localeService:{initialize:async()=>({locale:'en',source:'persisted'})},
      initializeI18n,renderApplication:()=> 'application',reportError:vi.fn(),
    });
    await bootstrap.run();
    expect(initializeI18n).toHaveBeenCalledWith('en');expect(rendered).toEqual(['application']);
  });
  it('uses runtime Vietnamese without overwriting data when locale read fails',async()=>{
    const rendered:ReactNode[]=[];const failure=new Error('read failed');const reportError=vi.fn();
    const bootstrap=createApplicationBootstrap({render:node=>rendered.push(node)},{
      localeService:{initialize:async()=>({locale:'vi',source:'readFailure',error:failure})},
      initializeI18n:async()=>undefined,renderApplication:()=> 'application',reportError,
    });
    await bootstrap.run();
    expect(rendered).toEqual(['application']);expect(reportError).toHaveBeenCalledWith('Unable to read the saved language preference.',failure);
  });
  it('renders a recoverable fallback and retries a transient initialization failure',async()=>{
    const rendered:ReactNode[]=[];let attempts=0;
    const bootstrap=createApplicationBootstrap({render:node=>rendered.push(node)},{
      localeService:{initialize:async()=>({locale:'vi',source:'persisted'})},
      initializeI18n:async()=>{if(++attempts===1)throw new Error('transient')},
      renderApplication:()=> 'application',reportError:vi.fn(),
    });
    await bootstrap.run();
    const fallback=rendered[0];expect(isValidElement(fallback)&&fallback.type).toBe(BootstrapFailure);
    if(!isValidElement<{retry:()=>Promise<void>}>(fallback))throw new Error('Expected fallback element');
    await fallback.props.retry();
    expect(rendered).toHaveLength(2);expect(rendered[1]).toBe('application');expect(attempts).toBe(2);
  });
  it('keeps repeated failure recoverable without an automatic retry loop or raw key',async()=>{
    const rendered:ReactNode[]=[];let attempts=0;
    const bootstrap=createApplicationBootstrap({render:node=>rendered.push(node)},{
      localeService:{initialize:async()=>({locale:'vi',source:'persisted'})},
      initializeI18n:async()=>{attempts++;throw new Error('still failing')},
      renderApplication:()=> 'application',reportError:vi.fn(),
    });
    await bootstrap.run();expect(attempts).toBe(1);
    const first=rendered[0];if(!isValidElement<{retry:()=>Promise<void>}>(first))throw new Error('Expected fallback element');
    const html=renderToStaticMarkup(first);
    expect(html).toContain('role="alert"');expect(html).toContain('<button type="button">Retry</button>');expect(html).not.toContain('errors.');
    await first.props.retry();expect(attempts).toBe(2);expect(rendered).toHaveLength(2);
  });
  it('coalesces concurrent bootstrap attempts',async()=>{
    let release!:()=>void;const waiting=new Promise<void>(resolve=>{release=resolve});const rendered:ReactNode[]=[];
    const bootstrap=createApplicationBootstrap({render:node=>rendered.push(node)},{
      localeService:{initialize:async()=>({locale:'vi',source:'persisted'})},
      initializeI18n:async()=>waiting,renderApplication:()=> 'application',reportError:vi.fn(),
    });
    const first=bootstrap.run();const second=bootstrap.run();expect(second).toBe(first);release();await first;
    expect(rendered).toEqual(['application']);
  });
});
