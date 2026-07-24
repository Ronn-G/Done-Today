import{describe,expect,it,vi}from'vitest';
import{renderToStaticMarkup}from'react-dom/server';
import{initializeI18n,syncDocumentLanguage}from'../i18n';
import{SettingsPageView}from'./App';

describe('I18N-3 Settings shell',()=>{
  it.each([
    ['vi','Tùy chỉnh trải nghiệm','Cài đặt','Quản lý ngôn ngữ, nhóm công việc, sao lưu và giao diện.'],
    ['en','Personalize your experience','Settings','Manage your language, work categories, backups, and appearance.'],
  ]as const)('renders an accessible %s Settings region',async(locale,eyebrow,title,subtitle)=>{
    await initializeI18n(locale);
    const html=renderToStaticMarkup(<SettingsPageView><section>Checkpoint 3–4 content unchanged</section></SettingsPageView>);
    expect(html).toContain('role="region"');expect(html).toContain('aria-labelledby="settings-page-title"');
    expect(html).toContain(`id="settings-page-title">${title}</h1>`);expect(html).toContain(eyebrow);expect(html).toContain(subtitle);
    expect(html).toContain('Checkpoint 3–4 content unchanged');
    expect(html).not.toContain('settings.heading');
  });

  it('updates the shell and html language without reload or callbacks',async()=>{
    const sideEffect=vi.fn();
    await initializeI18n('vi');const vietnamese=renderToStaticMarkup(<SettingsPageView><button onClick={sideEffect}>Giữ nguyên</button></SettingsPageView>);
    await initializeI18n('en');const english=renderToStaticMarkup(<SettingsPageView><button onClick={sideEffect}>Giữ nguyên</button></SettingsPageView>);
    expect(vietnamese).toContain('Cài đặt');expect(english).toContain('Settings');
    expect(vietnamese).toContain('Giữ nguyên');expect(english).toContain('Giữ nguyên');
    const documentElement={lang:'vi'};syncDocumentLanguage('en',documentElement);
    expect(documentElement.lang).toBe('en');expect(sideEffect).not.toHaveBeenCalled();
  });
});
