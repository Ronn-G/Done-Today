import{describe,expect,it,vi}from'vitest';
import{renderToStaticMarkup}from'react-dom/server';
import type{ImportPreview}from'../../domain/backup/preview';
import{formatDateTime}from'../../i18n/formatters';
import{i18next,initializeI18n}from'../../i18n';
import{
  backupDialogPresentation,BackupSettingsView,ImportPreviewDialog,type BackupResult,
}from'./BackupSettings';

const preview:ImportPreview={
  fileName:'done-today-backup-20260724.json',format:'done-today-backup',version:1,
  exportedAt:'2026-01-02T15:04:00Z',appVersion:'0.1.0',checksum:'sha256:abc',checksumValid:true,
  counts:{dailyLogs:1,workItems:2,workCategories:1,theme:true},
  existingIds:1,newRecords:2,conflicts:1,unchanged:2,
  previouslyImportedAt:'2026-01-03T10:30:00Z',
  warnings:[{kind:'known',code:'backup.warning.app_version',params:{backupVersion:'0.1.0',currentVersion:'0.2.0'}}],
};
const actions=()=>({
  setMode:vi.fn(),setApplyTheme:vi.fn(),setReplaceConfirmed:vi.fn(),setReimportConfirmed:vi.fn(),
  cancel:vi.fn(),submit:vi.fn(),
});
const renderPreview=(overrides:Partial<React.ComponentProps<typeof ImportPreviewDialog>>={})=>{
  const callbacks=actions();
  const props:React.ComponentProps<typeof ImportPreviewDialog>={
    value:preview,mode:'merge',setMode:callbacks.setMode,applyTheme:true,setApplyTheme:callbacks.setApplyTheme,
    replaceConfirmed:false,setReplaceConfirmed:callbacks.setReplaceConfirmed,reimportConfirmed:true,
    setReimportConfirmed:callbacks.setReimportConfirmed,busy:false,cancel:callbacks.cancel,submit:callbacks.submit,...overrides,
  };
  return{html:renderToStaticMarkup(<ImportPreviewDialog {...props}/>),callbacks,props};
};
const renderSettings=(locale:'vi'|'en',overrides:Partial<React.ComponentProps<typeof BackupSettingsView>>={})=>{
  const callbacks={onExport:vi.fn(),onChooseImport:vi.fn(),onCloseError:vi.fn()};
  const props:React.ComponentProps<typeof BackupSettingsView>={
    state:'idle',error:null,result:null,locale,...callbacks,...overrides,
  };
  return{html:renderToStaticMarkup(<BackupSettingsView {...props}/>),callbacks,props};
};
const expectNoRawBackupKeys=(html:string)=>{
  for(const key of ['settings.title','export.action','import.action','preview.title','mode.merge.label','mode.replace.label'])
    expect(html).not.toContain(`>${key}<`);
};

describe('I18N-4 checkpoint 2 Backup settings',()=>{
  it.each([
    ['vi','Sao lưu và khôi phục','Xuất bản sao lưu','Khôi phục từ bản sao lưu'],
    ['en','Backup and restore','Export backup','Restore from backup'],
  ]as const)('renders the localized %s settings surface with accessible states',async(locale,title,exportAction,importAction)=>{
    await initializeI18n(locale);const{html}=renderSettings(locale);
    expect(html).toContain('role="region"');expect(html).toContain(title);
    expect(html).toContain(exportAction);expect(html).toContain(importAction);
    expect(html).toContain('aria-hidden="true"');expectNoRawBackupKeys(html);
  });

  it.each([
    ['vi','Đang chuẩn bị…','Đã có lỗi xảy ra. Vui lòng thử lại.','Đóng'],
    ['en','Preparing…','Something went wrong. Please try again.','Close'],
  ]as const)('localizes %s loading and safe generic error states',async(locale,loading,fallback,close)=>{
    await initializeI18n(locale);
    const busy=renderSettings(locale,{state:'validating'}).html;
    expect(busy).toContain('role="status"');expect(busy).toContain('aria-live="polite"');expect(busy).toContain(loading);
    const error=renderSettings(locale,{state:'error',error:{kind:'unknown'}}).html;
    expect(error).toContain('role="alert"');expect(error).toContain(fallback);expect(error).toContain(`>${close}</button>`);
    expect(error).not.toContain('database.sqlite');expect(error).not.toContain('SELECT *');
  });

  it('localizes a stable backend code instead of rendering its compatibility message',async()=>{
    await initializeI18n('en');
    const html=renderSettings('en',{state:'error',error:{kind:'known',code:'backup.file_read_failed',params:{}}}).html;
    expect(html).toContain('The backup file could not be read.');
    expect(html).not.toContain('Không thể đọc file sao lưu.');
  });

  it('formats export/import success counts and plurals in the active locale',async()=>{
    const exportResult:BackupResult={kind:'export',value:{
      fileName:'done-today-backup.json',counts:{dailyLogs:1,workItems:1234,workCategories:2,theme:false},
    }};
    const importResult:BackupResult={kind:'import',value:{
      mode:'merge',counts:{dailyLogs:1,workItems:2,workCategories:0,theme:false},remapped:1,
    }};
    await initializeI18n('vi');const vietnamese=renderSettings('vi',{state:'success',result:exportResult}).html;
    expect(vietnamese).toContain('1 ngày nhật ký');expect(vietnamese).toContain('1.234 công việc');expect(vietnamese).toContain('2 nhóm');
    await initializeI18n('en');const englishExport=renderSettings('en',{state:'success',result:exportResult}).html;
    const englishImport=renderSettings('en',{state:'success',result:importResult}).html;
    expect(englishExport).toContain('1 journal day');expect(englishExport).toContain('1,234 tasks');expect(englishExport).toContain('2 categories');
    expect(englishImport).toContain('1 journal day');expect(englishImport).toContain('2 tasks');expect(englishImport).toContain('remapped 1 ID');
    expectNoRawBackupKeys(englishExport);expectNoRawBackupKeys(englishImport);
  });

  it('builds localized native dialog presentation without translating technical file behavior',async()=>{
    await initializeI18n('vi');expect(backupDialogPresentation(i18next.getFixedT('vi','backup'))).toEqual({
      export:{title:'Xuất bản sao lưu Done Today',filterName:'Bản sao lưu Done Today'},
      import:{title:'Khôi phục từ bản sao lưu',filterName:'Bản sao lưu Done Today'},
    });
    await initializeI18n('en');expect(backupDialogPresentation(i18next.getFixedT('en','backup'))).toEqual({
      export:{title:'Export Done Today backup',filterName:'Done Today backup'},
      import:{title:'Restore from backup',filterName:'Done Today backup'},
    });
  });
});

describe('I18N-4 checkpoint 2 Import preview',()=>{
  it('switches preview copy and date-time formatting while preserving preview, mode, apply-theme, and confirmation state',async()=>{
    const before=structuredClone(preview);
    await initializeI18n('vi');const vietnamese=renderPreview();
    await initializeI18n('en');const english=renderToStaticMarkup(<ImportPreviewDialog {...vietnamese.props}/>);
    expect(vietnamese.html).toContain('Xem trước bản sao lưu');expect(english).toContain('Preview backup');
    expect(vietnamese.html).toContain(formatDateTime(new Date(preview.exportedAt),'vi'));
    expect(english).toContain(formatDateTime(new Date(preview.exportedAt),'en'));
    expect(vietnamese.html).toMatch(/<input(?=[^>]*value="merge")(?=[^>]*checked="")[^>]*>/);
    expect(english).toMatch(/<input(?=[^>]*value="merge")(?=[^>]*checked="")[^>]*>/);
    expect(vietnamese.html).toContain('Áp dụng cài đặt giao diện từ bản sao lưu');
    expect(english).toContain('Apply appearance settings from the backup');
    expect(vietnamese.html).toContain('Bản sao lưu được tạo bởi Done Today 0.1.0; bạn đang dùng 0.2.0.');
    expect(english).toContain('This backup was created by Done Today 0.1.0; you are using 0.2.0.');
    expect(preview).toEqual(before);
    for(const callback of Object.values(vietnamese.callbacks))expect(callback).not.toHaveBeenCalled();
  });

  it.each([
    ['vi','Chế độ khôi phục','Hợp nhất (Merge)','Thay thế toàn bộ (Replace all)','Nhập bản sao lưu'],
    ['en','Restore mode','Merge','Replace all','Import backup'],
  ]as const)('renders localized %s mode descriptions and linked accessible controls',async(locale,legend,merge,replace,submit)=>{
    await initializeI18n(locale);const{html}=renderPreview();
    expect(html).toContain(`>${legend}</legend>`);expect(html).toContain(`>${merge}</strong>`);expect(html).toContain(`>${replace}</strong>`);
    expect(html).toContain('name="backup-import-mode"');expect(html).toContain('aria-describedby=');
    expect(html).toContain(`>${submit}</button>`);expect(html).toContain('role="dialog"');expect(html).toContain('aria-modal="true"');
    expectNoRawBackupKeys(html);
  });

  it('keeps replace as the stable internal mode and does not weaken its destructive confirmation',async()=>{
    await initializeI18n('en');
    const{html,callbacks}=renderPreview({mode:'replace',applyTheme:true,replaceConfirmed:true});
    expect(html).toMatch(/<input(?=[^>]*value="replace")(?=[^>]*checked="")[^>]*>/);expect(html).toContain('Confirm replacement of all data');
    expect(html).toContain('all current journal entries, categories, and appearance settings will be replaced');
    expect(html).not.toContain('Apply appearance settings from the backup');
    expect(html).toContain('class="danger-button"');expect(html).not.toContain('disabled=""');
    for(const callback of Object.values(callbacks))expect(callback).not.toHaveBeenCalled();
  });

  it('announces the restoring state and preserves the disabled destructive action',async()=>{
    await initializeI18n('vi');
    const{html}=renderPreview({mode:'replace',replaceConfirmed:true,busy:true});
    expect(html).toContain('Đang nhập…');expect(html).toContain('aria-busy="true"');expect(html).toContain('disabled=""');
  });
});
