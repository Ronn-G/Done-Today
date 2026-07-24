import {describe,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import type {SaveState} from '../application/journal/saveCoordinator';
import {initializeI18n} from '../i18n';
import {SaveIndicator} from './App';

const render=(state:SaveState,retry=vi.fn())=>renderToStaticMarkup(<SaveIndicator state={state} retry={retry}/>);

describe('I18N-2 Today autosave states',()=>{
  it('renders Vietnamese saving, saved, failure and Retry accessibility copy',async()=>{
    await initializeI18n('vi');
    const saving=render('saving');const saved=render('saved');const failed=render('error');
    expect(saving).toContain('Đang lưu…');expect(saved).toContain('Đã lưu');
    expect(failed).toContain('Không thể lưu');expect(failed).toContain('>Thử lại<');
    expect(failed).toContain('aria-label="Thử lưu lại thay đổi"');expect(failed).toContain('title="Thử lưu lại thay đổi"');
    for(const html of [saving,saved,failed]){
      expect(html).toContain('role="status"');expect(html).toContain('aria-live="polite"');expect(html).toContain('aria-atomic="true"');
      expect(html).not.toContain('today.');expect(html).not.toContain('work_item.');
    }
  });

  it('switches every displayed technical state to English without invoking Retry',async()=>{
    const retry=vi.fn();
    await initializeI18n('vi');
    const vietnamese=(['saving','saved','error'] as const).map(state=>render(state,retry));
    await initializeI18n('en');
    const english=(['saving','saved','error'] as const).map(state=>render(state,retry));
    expect(vietnamese.join(' ')).toContain('Đang lưu…');expect(vietnamese.join(' ')).toContain('Đã lưu');expect(vietnamese.join(' ')).toContain('Không thể lưu');
    expect(english.join(' ')).toContain('Saving…');expect(english.join(' ')).toContain('Saved');expect(english.join(' ')).toContain('Couldn’t save');expect(english.join(' ')).toContain('>Retry<');
    expect(english.join(' ')).toContain('aria-label="Retry saving changes"');
    for(const state of ['saving','saved','failed']){expect(vietnamese.join(' ')).toContain(`save-state ${state}`);expect(english.join(' ')).toContain(`save-state ${state}`)}
    expect(retry).not.toHaveBeenCalled();expect(english.join(' ')).not.toContain('today.');
  });

  it('renders no announcement or action while the technical state is idle',async()=>{
    await initializeI18n('en');const retry=vi.fn();
    expect(render('idle',retry)).toBe('');expect(retry).not.toHaveBeenCalled();
  });
});
