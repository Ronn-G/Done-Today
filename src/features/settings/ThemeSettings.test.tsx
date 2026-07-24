import{describe,expect,it,vi}from'vitest';
import{renderToStaticMarkup}from'react-dom/server';
import{initializeI18n}from'../../i18n';
import{defaultThemePreferences,selectPreset}from'../../domain/theme/presets';
import{ThemeModeSettings,ThemePresetSettings}from'./ThemeSettings';

describe('I18N-3 Theme modes and presets',()=>{
  it.each([
    ['vi','Chế độ hiển thị','Sáng','Tối','Theo hệ thống'],
    ['en','Display mode','Light','Dark','System'],
  ]as const)('renders localized %s mode controls with technical selection unchanged',async(locale,heading,light,dark,system)=>{
    await initializeI18n(locale);const onSelect=vi.fn();
    const html=renderToStaticMarkup(<ThemeModeSettings mode="system" onSelect={onSelect}/>);
    expect(html).toContain(heading);expect(html).toContain(` ${light}</button>`);expect(html).toContain(` ${dark}</button>`);expect(html).toContain(` ${system}</button>`);
    expect(html).toContain('role="group"');expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(onSelect).not.toHaveBeenCalled();expect(html).not.toContain('theme.mode');
  });

  it.each([
    ['vi',['Done Today','Rừng xanh','Đại dương','Oải hương','Cát ấm','Đơn sắc']],
    ['en',['Done Today','Forest','Ocean','Lavender','Warm Sand','Monochrome']],
  ]as const)('renders all localized %s preset metadata and decorative swatches',async(locale,names)=>{
    await initializeI18n(locale);const onSelect=vi.fn();const preferences=selectPreset('ocean');const before=structuredClone(preferences);
    const html=renderToStaticMarkup(<ThemePresetSettings preferences={preferences} onSelect={onSelect}/>);
    for(const name of names)expect(html).toContain(`<strong>${name}</strong>`);
    expect(html).toContain('aria-hidden="true"');expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).not.toContain('theme.preset');expect(onSelect).not.toHaveBeenCalled();expect(preferences).toEqual(before);
  });

  it('switches visible locale without a repository callback or technical-state change',async()=>{
    const onMode=vi.fn();const onPreset=vi.fn();const preferences=defaultThemePreferences();
    await initializeI18n('vi');
    const vietnamese=renderToStaticMarkup(<><ThemeModeSettings mode="dark" onSelect={onMode}/><ThemePresetSettings preferences={preferences} onSelect={onPreset}/></>);
    await initializeI18n('en');
    const english=renderToStaticMarkup(<><ThemeModeSettings mode="dark" onSelect={onMode}/><ThemePresetSettings preferences={preferences} onSelect={onPreset}/></>);
    expect(vietnamese).toContain('Chế độ hiển thị');expect(english).toContain('Display mode');
    expect(vietnamese).toContain('Rừng xanh');expect(english).toContain('Forest');
    expect(onMode).not.toHaveBeenCalled();expect(onPreset).not.toHaveBeenCalled();
    expect(preferences.selectedPresetId).toBe('done-today');
  });
});
