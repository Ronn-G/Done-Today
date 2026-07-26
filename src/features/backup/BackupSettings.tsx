import{useId,useMemo,useState}from'react';
import{useTranslation}from'react-i18next';
import type{TFunction}from'i18next';
import{ArchiveRestore,Download,LoaderCircle,ShieldAlert,Upload}from'lucide-react';
import{BackupService}from'../../application/backup/backupService';
import type{BackupDialogPresentation}from'../../application/backup/backupRepository';
import{normalizeAppError}from'../../application/errors/errorNormalizer';
import type{NormalizedAppError}from'../../domain/errors/appError';
import{compatibilityLocale,normalizeLocale,type AppLocale}from'../../domain/localization/locale';
import type{ExportResult,ImportMode,ImportPreview,ImportResult}from'../../domain/backup/preview';
import{localizeAppError,localizeAppWarning,toErrorTranslator}from'../../i18n/errorPresentation';
import{formatDateTime,formatList}from'../../i18n/formatters';
import{TauriBackupRepository}from'../../infrastructure/backup/tauriBackupRepository';

type Props={flushTheme:()=>Promise<void>;onImported:()=>void};
export type BackupOperation='idle'|'preparing'|'choosing'|'validating'|'importing'|'success'|'error';
export type BackupResult={kind:'export';value:ExportResult}|{kind:'import';value:ImportResult};

export function backupDialogPresentation(t:TFunction<'backup'>):{export:BackupDialogPresentation;import:BackupDialogPresentation}{
  const filterName=t('dialog.filterName');
  return{
    export:{title:t('dialog.exportTitle'),filterName},
    import:{title:t('dialog.importTitle'),filterName},
  };
}
export function backupErrorMessage(error:unknown,t:TFunction<'errors'>):string{
  return localizeAppError(error,(key,options)=>t(key,options));
}
const exportSummary=(value:ExportResult,t:TFunction<'backup'>,locale:AppLocale)=>t('export.success',{fileName:value.fileName,summary:formatList([
  t('export.summary.dailyLogs',{count:value.counts.dailyLogs}),
  t('export.summary.workItems',{count:value.counts.workItems}),
  t('export.summary.workCategories',{count:value.counts.workCategories}),
  value.counts.theme?t('export.summary.themeIncluded'):t('export.summary.themeExcluded'),
],locale)});
const importSummary=(value:ImportResult,t:TFunction<'backup'>,locale:AppLocale)=>{
  const parts=[
    t('import.summary.dailyLogs',{count:value.counts.dailyLogs}),
    t('import.summary.workItems',{count:value.counts.workItems}),
  ];
  if(value.remapped>0)parts.push(t('import.summary.remapped',{count:value.remapped}));
  return t('import.success',{summary:formatList(parts,locale)});
};

export function BackupSettings({flushTheme,onImported}:Props){
  const{t,i18n}=useTranslation('backup');
  const locale=normalizeLocale(i18n.resolvedLanguage??i18n.language)??compatibilityLocale;
  const service=useMemo(()=>new BackupService(new TauriBackupRepository(),flushTheme,onImported),[flushTheme,onImported]);
  const[state,setState]=useState<BackupOperation>('idle');const[error,setError]=useState<NormalizedAppError|null>(null);
  const[result,setResult]=useState<BackupResult|null>(null);const[selected,setSelected]=useState<{path:string;preview:ImportPreview}|null>(null);
  const[mode,setMode]=useState<ImportMode>('merge');const[applyTheme,setApplyTheme]=useState(false);
  const[replaceConfirmed,setReplaceConfirmed]=useState(false);const[reimportConfirmed,setReimportConfirmed]=useState(false);
  const runExport=async()=>{
    setState('preparing');setError(null);setResult(null);
    try{
      setState('choosing');const value=await service.export(backupDialogPresentation(t).export);
      if(!value){setState('idle');return}
      setResult({kind:'export',value});setState('success');
    }catch(reason){setError(normalizeAppError(reason));setState('error')}
  };
  const chooseImport=async()=>{
    setState('choosing');setError(null);setResult(null);
    try{
      setState('validating');const value=await service.chooseAndPreview(backupDialogPresentation(t).import);
      if(!value){setState('idle');return}
      setSelected(value);setMode('merge');setApplyTheme(false);setReplaceConfirmed(false);setReimportConfirmed(false);setState('idle');
    }catch(reason){setError(normalizeAppError(reason));setState('error')}
  };
  const runImport=async()=>{
    if(!selected)return;
    setState('importing');setError(null);
    try{
      const value=await service.import(selected.path,mode,applyTheme,reimportConfirmed);
      setSelected(null);setResult({kind:'import',value});setState('success');
    }catch(reason){setError(normalizeAppError(reason));setState('error')}
  };
  return <><BackupSettingsView state={state} error={error} result={result} locale={locale}
    onExport={()=>void runExport()} onChooseImport={()=>void chooseImport()} onCloseError={()=>setState('idle')}/>
    {selected&&<ImportPreviewDialog value={selected.preview} mode={mode} setMode={value=>{setMode(value);setReplaceConfirmed(false)}} applyTheme={applyTheme} setApplyTheme={setApplyTheme}
      replaceConfirmed={replaceConfirmed} setReplaceConfirmed={setReplaceConfirmed} reimportConfirmed={reimportConfirmed} setReimportConfirmed={setReimportConfirmed}
      busy={state==='importing'} cancel={()=>setSelected(null)} submit={()=>void runImport()}/>}</>;
}

export function BackupSettingsView({state,error,result,locale,onExport,onChooseImport,onCloseError}:{
  state:BackupOperation;error:NormalizedAppError|null;result:BackupResult|null;locale:AppLocale;
  onExport:()=>void;onChooseImport:()=>void;onCloseError:()=>void;
}){
  const{t}=useTranslation('backup');
  const{t:tCommon}=useTranslation('common');const{t:tErrors}=useTranslation('errors');
  const titleId=useId();
  const busy=['preparing','choosing','validating','importing'].includes(state);
  const resultText=result?(result.kind==='export'?exportSummary(result.value,t,locale):importSummary(result.value,t,locale)):null;
  return <section className="settings-card backup-settings" role="region" aria-labelledby={titleId}>
    <div className="settings-heading"><div><h2 id={titleId}>{t('settings.title')}</h2><p>{t('settings.description')}</p></div><ArchiveRestore aria-hidden="true" size={24}/></div>
    <p className="privacy-warning"><ShieldAlert aria-hidden="true" size={18}/> {t('settings.privacyWarning')}</p>
    <div className="backup-actions"><button type="button" disabled={busy} onClick={onExport}><Download aria-hidden="true" size={17}/> {t('export.action')}</button>
      <button type="button" disabled={busy} onClick={onChooseImport}><Upload aria-hidden="true" size={17}/> {t('import.action')}</button>
      {busy&&<span role="status" aria-live="polite" aria-atomic="true"><LoaderCircle aria-hidden="true" className="spin" size={16}/> {state==='importing'?t('status.restoring'):t('status.preparing')}</span>}</div>
    {resultText&&<p className="backup-success" role="status" aria-live="polite">{resultText}</p>}
    {error!=null&&<div className="page-error" role="alert"><span>{backupErrorMessage(error,tErrors)}</span><button type="button" onClick={onCloseError}>{String(tCommon('actions.close'))}</button></div>}
  </section>;
}

export function ImportPreviewDialog({value,mode,setMode,applyTheme,setApplyTheme,replaceConfirmed,setReplaceConfirmed,reimportConfirmed,setReimportConfirmed,busy,cancel,submit}:{
  value:ImportPreview;mode:ImportMode;setMode:(value:ImportMode)=>void;applyTheme:boolean;setApplyTheme:(value:boolean)=>void;
  replaceConfirmed:boolean;setReplaceConfirmed:(value:boolean)=>void;reimportConfirmed:boolean;setReimportConfirmed:(value:boolean)=>void;
  busy:boolean;cancel:()=>void;submit:()=>void;
}){
  const{t,i18n}=useTranslation('backup');
  const{t:tCommon}=useTranslation('common');const{t:tErrors}=useTranslation('errors');const locale=normalizeLocale(i18n.resolvedLanguage??i18n.language)??compatibilityLocale;
  const titleId=useId(),fileId=useId(),mergeId=useId(),mergeDescriptionId=useId(),replaceId=useId(),replaceDescriptionId=useId();
  const replaceConfirmId=useId(),reimportConfirmId=useId(),applyThemeId=useId();
  const allowed=(mode==='merge'||replaceConfirmed)&&(!value.previouslyImportedAt||reimportConfirmed);
  const dataSummary=formatList([
    t('preview.data.dailyLogs',{count:value.counts.dailyLogs}),
    t('preview.data.workItems',{count:value.counts.workItems}),
    t('preview.data.workCategories',{count:value.counts.workCategories}),
    value.counts.theme?t('preview.data.themeIncluded'):t('preview.data.themeExcluded'),
  ],locale);
  const dryRunSummary=formatList([
    t('preview.dryRun.newRecords',{count:value.newRecords}),
    t('preview.dryRun.existingIds',{count:value.existingIds}),
    t('preview.dryRun.conflicts',{count:value.conflicts}),
    t('preview.dryRun.unchanged',{count:value.unchanged}),
  ],locale);
  return <div className="dialog-backdrop" role="presentation"><section className="import-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={fileId}>
    <h2 id={titleId}>{t('preview.title')}</h2><p id={fileId}><strong>{value.fileName}</strong></p>
    <dl><div><dt>{t('preview.metadata.format')}</dt><dd>{value.format} v{value.version}</dd></div>
      <div><dt>{t('preview.metadata.exportedAt')}</dt><dd>{formatDateTime(new Date(value.exportedAt),locale)}</dd></div>
      <div><dt>{t('preview.metadata.appVersion')}</dt><dd>{value.appVersion}</dd></div>
      <div><dt>{t('preview.metadata.checksum')}</dt><dd>{value.checksumValid?t('preview.checksum.valid'):t('preview.checksum.invalid')}</dd></div>
      <div><dt>{t('preview.metadata.data')}</dt><dd>{dataSummary}</dd></div>
      <div><dt>{t('preview.metadata.dryRun')}</dt><dd>{dryRunSummary}</dd></div></dl>
    {value.warnings.map((warning,index)=><p className="import-warning" key={`${warning.kind==='known'?warning.code:'unknown'}-${index}`}>{localizeAppWarning(warning,toErrorTranslator(tErrors))}</p>)}
    {value.previouslyImportedAt&&<label className="confirm-row" htmlFor={reimportConfirmId}><input id={reimportConfirmId} type="checkbox" checked={reimportConfirmed} onChange={event=>setReimportConfirmed(event.target.checked)}/>
      <span>{t('confirm.reimport',{dateTime:formatDateTime(new Date(value.previouslyImportedAt),locale)})}</span></label>}
    <fieldset><legend>{t('mode.legend')}</legend>
      <label htmlFor={mergeId}><input id={mergeId} name="backup-import-mode" type="radio" value="merge" checked={mode==='merge'} aria-describedby={mergeDescriptionId} onChange={()=>setMode('merge')}/>
        <span><strong>{t('mode.merge.label')}</strong><span id={mergeDescriptionId} className="choice-description">{t('mode.merge.description')}</span></span></label>
      <label className="danger-choice" htmlFor={replaceId}><input id={replaceId} name="backup-import-mode" type="radio" value="replace" checked={mode==='replace'} aria-describedby={replaceDescriptionId} onChange={()=>setMode('replace')}/>
        <span><strong>{t('mode.replace.label')}</strong><span id={replaceDescriptionId} className="choice-description">{t('mode.replace.description')}</span></span></label>
    </fieldset>
    {mode==='merge'&&value.counts.theme&&<label className="confirm-row" htmlFor={applyThemeId}><input id={applyThemeId} type="checkbox" checked={applyTheme} onChange={event=>setApplyTheme(event.target.checked)}/>
      <span>{t('options.applyTheme')}</span></label>}
    {mode==='replace'&&<label className="confirm-row danger-box" htmlFor={replaceConfirmId}><input id={replaceConfirmId} type="checkbox" checked={replaceConfirmed} onChange={event=>setReplaceConfirmed(event.target.checked)}/>
      <span><strong>{t('confirm.replace.title')}</strong><span className="choice-description">{t('confirm.replace.body')}</span></span></label>}
    <div className="dialog-actions"><button type="button" disabled={busy} onClick={cancel}>{String(tCommon('actions.cancel'))}</button>
      <button type="button" className={mode==='replace'?'danger-button':''} disabled={!allowed||busy} aria-busy={busy} onClick={submit}>{busy?t('import.submitting'):t('import.submit')}</button></div>
  </section></div>;
}
