import{describe,expect,it,vi}from'vitest';
import{renderToStaticMarkup}from'react-dom/server';
import{initializeI18n,i18next}from'../../i18n';
import{applyThemePreferences}from'../../domain/theme/applyTheme';
import{themeColorsSchema,type ThemePreferences}from'../../domain/theme/models';
import{defaultThemePreferences,selectPreset,updateThemeColor}from'../../domain/theme/presets';
import{resources}from'../../i18n/resources';
import{flattenResource}from'../../i18n/resourceValidation';
import{FloatingThemeCustomizer}from'./FloatingThemeCustomizer';
import type{FloatingThemePanelState}from'./floatingThemePanelState';
import{resolveColorControlInput,ThemeCustomizerContent,ThemeModeSettings,ThemePresetSettings,ThemeSettings}from'./ThemeSettings';
import type{ThemeCustomizerController}from'./themeCustomizerController';
import{themeColorTranslationKeys}from'./themeColorTranslations';

const makeController=(preferences:ThemePreferences=defaultThemePreferences(),overrides:Partial<ThemeCustomizerController>={}):ThemeCustomizerController=>({
  mode:'system',setMode:vi.fn(),preferences,setPreferences:vi.fn(),activePalette:'light',
  saveState:'idle',error:null,commit:vi.fn(),flush:vi.fn(async()=>undefined),
  retry:vi.fn(async()=>undefined),reset:vi.fn(),...overrides,
});
const panelState:FloatingThemePanelState={x:120,y:88,collapsed:true,open:true,schemaVersion:1};

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

describe('I18N-3 Custom colors and floating customizer',()=>{
  it('maps exactly all 33 ThemeColorKey values to resolvable semantic translation keys',async()=>{
    const schemaKeys=Object.keys(themeColorsSchema.shape).sort();
    expect(schemaKeys).toHaveLength(33);
    expect(Object.keys(themeColorTranslationKeys).sort()).toEqual(schemaKeys);
    for(const locale of ['vi','en']as const){
      await initializeI18n(locale);
      const catalog=flattenResource(resources[locale].theme);
      for(const [colorKey,translationKey]of Object.entries(themeColorTranslationKeys)){
        expect(translationKey).toBe(`colors.${colorKey}`);
        expect(catalog[translationKey]).toBeTruthy();
        expect(i18next.t(`theme:${translationKey}`)).not.toBe(translationKey);
      }
      expect(themeColorTranslationKeys.tableHeaderBackground).toBe('colors.tableHeaderBackground');
      expect(catalog[themeColorTranslationKeys.tableHeaderBackground]).toBe(locale==='vi'?'Tiêu đề bảng':'Table header');
    }
  });

  it.each([
    ['vi','Tùy chỉnh màu','Nền và bề mặt','Chọn màu: Nền ứng dụng','Mã HEX: Nền ứng dụng','Độ bo góc','Mọi thay đổi tự động lưu'],
    ['en','Custom colors','Backgrounds and surfaces','Choose color: App background','HEX code: App background','Corner radius','All changes save automatically'],
  ]as const)('renders all localized %s color controls and accessible names',async(locale,heading,group,colorPicker,hexCode,radius,status)=>{
    await initializeI18n(locale);const controller=makeController();
    const html=renderToStaticMarkup(<ThemeSettings controller={controller}/>);
    expect(html).toContain(heading);expect(html).toContain(group);expect(html).toContain(`aria-label="${colorPicker}"`);
    expect(html).toContain(`aria-label="${hexCode}"`);expect(html).toContain(radius);expect(html).toContain(status);
    expect(html.match(/type="color"/g)).toHaveLength(33);
    for(const colorKey of Object.keys(themeColorTranslationKeys))expect(html).not.toContain(`>${colorKey}<`);
    expect(html).not.toMatch(/theme\.(colors|groups|customize|radius|status)/);
  });

  it('normalizes valid HEX drafts and never promotes invalid input to theme state',()=>{
    expect(resolveColorControlInput('#123456')).toEqual({draft:null,normalized:'#123456',invalid:false});
    expect(resolveColorControlInput('#a3F')).toEqual({draft:'#a3F',normalized:null,invalid:false});
    expect(resolveColorControlInput('#a3F',true)).toEqual({draft:null,normalized:'#AA33FF',invalid:false});
    expect(resolveColorControlInput('#12')).toEqual({draft:'#12',normalized:null,invalid:false});
    expect(resolveColorControlInput('#12',true)).toEqual({draft:null,normalized:null,invalid:true});
    expect(resolveColorControlInput('not-a-color')).toEqual({draft:'not-a-color',normalized:null,invalid:true});
  });

  it('keeps the table-header picker, HEX field, draft palette and live preview synchronized',async()=>{
    await initializeI18n('vi');
    const initial=defaultThemePreferences();
    const pickerChange=resolveColorControlInput('#123456',true);
    expect(pickerChange.normalized).toBe('#123456');
    const preferences=updateThemeColor(initial,'light','tableHeaderBackground',pickerChange.normalized!);
    const values=new Map<string,string>();
    const root={style:{setProperty:(key:string,value:string)=>values.set(key,value)}} as unknown as HTMLElement;
    applyThemePreferences(preferences,'light',root);
    const html=renderToStaticMarkup(<ThemeCustomizerContent controller={makeController(preferences)}/>);
    expect(preferences.selectedPresetId).toBe('custom');
    expect(preferences.lightColors.tableHeaderBackground).toBe('#123456');
    expect(preferences.darkColors.tableHeaderBackground).toBe(initial.darkColors.tableHeaderBackground);
    expect(values.get('--bg-table-header')).toBe('#123456');
    expect(html).toMatch(/type="color" aria-label="Chọn màu: Tiêu đề bảng" value="#123456"/);
    expect(html).toMatch(/aria-label="Mã HEX: Tiêu đề bảng" value="#123456"/);
  });

  it.each([
    ['vi','Độ tương phản thấp','Chữ chính / Nền ứng dụng'],
    ['en','Low contrast','Primary text / App background'],
  ]as const)('translates %s contrast warnings without exposing internal field keys',async(locale,message,pair)=>{
    await initializeI18n(locale);
    const preferences=updateThemeColor(defaultThemePreferences(),'light','primaryText','#FFFFFF');
    const html=renderToStaticMarkup(<ThemeCustomizerContent controller={makeController(preferences)}/>);
    expect(html).toContain(message);expect(html).toContain(pair);
    expect(html).not.toContain('primaryText / pageBackground');
  });

  it.each([
    ['vi','Tùy chỉnh','Bảng màu hoặc độ bo góc đã được bạn tinh chỉnh.'],
    ['en','Custom','Your fine-tuned color palette or corner radius.'],
  ]as const)('renders the localized %s custom-preset state without changing preset behavior',async(locale,name,description)=>{
    await initializeI18n(locale);
    const preferences=updateThemeColor(selectPreset('forest'),'dark','accent','#123456');
    const before=structuredClone(preferences);const onSelect=vi.fn();
    const html=renderToStaticMarkup(<ThemePresetSettings preferences={preferences} onSelect={onSelect}/>);
    expect(html).toContain(`<strong>${name}</strong>`);expect(html).toContain(description);
    expect(preferences.selectedPresetId).toBe('custom');expect(preferences).toEqual(before);expect(onSelect).not.toHaveBeenCalled();
  });

  it.each([
    ['vi','Bảng tùy chỉnh giao diện','Kéo bảng tùy chỉnh giao diện','Đặt lại vị trí bảng tùy chỉnh','Mở rộng bảng tùy chỉnh giao diện','Đóng bảng tùy chỉnh giao diện','Mở rộng','Đóng'],
    ['en','Appearance customizer','Drag the appearance customizer','Reset the appearance customizer position','Expand the appearance customizer','Close the appearance customizer','Expand','Close'],
  ]as const)('renders localized %s floating-panel visible, tooltip, and accessibility copy',async(locale,label,drag,reset,expand,close,expandTitle,closeTitle)=>{
    await initializeI18n(locale);
    const html=renderToStaticMarkup(<FloatingThemeCustomizer controller={makeController()} state={panelState} setState={vi.fn()}/>);
    expect(html).toContain(`aria-label="${label}"`);expect(html).toContain(`aria-label="${drag}"`);
    expect(html).toContain(`aria-label="${reset}"`);expect(html).toContain(`aria-label="${expand}"`);
    expect(html).toContain(`aria-label="${close}"`);expect(html).toContain(`title="${expandTitle}"`);
    expect(html).toContain(`title="${closeTitle}"`);expect(html).not.toContain('theme.floating');
  });

  it('switches locale without mutating theme or floating-panel technical state',async()=>{
    const preferences=updateThemeColor(selectPreset('ocean'),'light','accent','#123456');
    const controller=makeController(preferences,{mode:'dark',activePalette:'dark'});
    const beforePreferences=structuredClone(preferences);const beforePanel=structuredClone(panelState);
    await initializeI18n('vi');
    const vietnamese=renderToStaticMarkup(<><ThemeCustomizerContent controller={controller}/><FloatingThemeCustomizer controller={controller} state={panelState} setState={vi.fn()}/></>);
    await initializeI18n('en');
    const english=renderToStaticMarkup(<><ThemeCustomizerContent controller={controller}/><FloatingThemeCustomizer controller={controller} state={panelState} setState={vi.fn()}/></>);
    expect(vietnamese).toContain('Tùy chỉnh màu');expect(english).toContain('Custom colors');
    expect(preferences).toEqual(beforePreferences);expect(panelState).toEqual(beforePanel);
    expect(controller.mode).toBe('dark');expect(controller.activePalette).toBe('dark');
    expect(controller.commit).not.toHaveBeenCalled();expect(controller.setMode).not.toHaveBeenCalled();
    expect(controller.flush).not.toHaveBeenCalled();expect(controller.reset).not.toHaveBeenCalled();
  });

  it.each([
    ['vi','Đang lưu…','Đã lưu','Lưu thất bại','Thử lại'],
    ['en','Saving…','Saved','Save failed','Retry'],
  ]as const)('localizes %s save states and retry while retaining the existing coordinator callbacks',async(locale,saving,saved,error,retry)=>{
    await initializeI18n(locale);
    const preferences=defaultThemePreferences();
    const savingHtml=renderToStaticMarkup(<ThemeCustomizerContent controller={makeController(preferences,{saveState:'saving'})}/>);
    const savedHtml=renderToStaticMarkup(<ThemeCustomizerContent controller={makeController(preferences,{saveState:'saved'})}/>);
    const retryCallback=vi.fn(async()=>undefined);
    const errorHtml=renderToStaticMarkup(<ThemeCustomizerContent controller={makeController(preferences,{saveState:'error',error:{kind:'known',code:'theme.invalid',params:{}},retry:retryCallback})}/>);
    expect(savingHtml).toContain(saving);expect(savedHtml).toContain(saved);expect(errorHtml).toContain(error);expect(errorHtml).toContain(retry);
    expect(errorHtml).toContain('role="alert"');expect(retryCallback).not.toHaveBeenCalled();
  });
});
