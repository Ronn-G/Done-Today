import {describe,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {initializeI18n} from '../../i18n';
import {LanguageSettingsView} from './LanguageSettings';

describe('LanguageSettings view',()=>{
  it.each([['vi','Ngôn ngữ'],['en','Language']] as const)('renders an accessible native selector with the localized %s label',async(locale,label)=>{
    await initializeI18n(locale);
    const html=renderToStaticMarkup(<LanguageSettingsView current={locale} state="idle" onChange={vi.fn()} onRetry={vi.fn()}/>);
    expect(html).toContain('<label>');expect(html).toContain('<select>');expect(html).toContain('class="sr-only"');
    expect(html).toContain(`<span class="sr-only">${label}</span>`);
    expect(html).toContain(`value="${locale}" selected=""`);
  });
  it('announces a safe localized error and exposes a keyboard-usable retry button',async()=>{
    await initializeI18n('vi');
    const html=renderToStaticMarkup(<LanguageSettingsView current="vi" state="error" onChange={vi.fn()} onRetry={vi.fn()}/>);
    expect(html).toContain('aria-live="polite"');expect(html).toContain('<button type="button">Thử lại</button>');
    expect(html).not.toContain('database');expect(html).not.toContain('validation');
  });
  it('announces saving and recovery without using color alone',async()=>{
    await initializeI18n('vi');
    const saving=renderToStaticMarkup(<LanguageSettingsView current="vi" state="saving" onChange={vi.fn()} onRetry={vi.fn()}/>);
    const saved=renderToStaticMarkup(<LanguageSettingsView current="vi" state="saved" onChange={vi.fn()} onRetry={vi.fn()}/>);
    expect(saving).toContain('Đang lưu');expect(saved).toContain('Đã lưu');
  });
});
