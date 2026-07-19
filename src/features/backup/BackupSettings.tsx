import{useMemo,useState}from'react';
import{ArchiveRestore,Download,LoaderCircle,ShieldAlert,Upload}from'lucide-react';
import{BackupService}from'../../application/backup/backupService';
import type{ImportMode,ImportPreview}from'../../domain/backup/preview';
import{TauriBackupRepository}from'../../infrastructure/backup/tauriBackupRepository';
type Props={flushTheme:()=>Promise<void>;onImported:()=>void};
type Operation='idle'|'preparing'|'choosing'|'validating'|'importing'|'success'|'error';
const message=(error:unknown)=>typeof error==='object'&&error&&'message'in error&&typeof error.message==='string'?error.message:'Đã có lỗi xảy ra. Vui lòng thử lại.';
export function BackupSettings({flushTheme,onImported}:Props){
  const service=useMemo(()=>new BackupService(new TauriBackupRepository(),flushTheme,onImported),[flushTheme,onImported]);
  const[state,setState]=useState<Operation>('idle');const[error,setError]=useState<string|null>(null);
  const[result,setResult]=useState<string|null>(null);const[selected,setSelected]=useState<{path:string;preview:ImportPreview}|null>(null);
  const[mode,setMode]=useState<ImportMode>('merge');const[applyTheme,setApplyTheme]=useState(false);
  const[replaceConfirmed,setReplaceConfirmed]=useState(false);const[reimportConfirmed,setReimportConfirmed]=useState(false);
  const runExport=async()=>{setState('preparing');setError(null);setResult(null);try{setState('choosing');const value=await service.export();if(!value){setState('idle');return}setResult(`Đã lưu ${value.fileName}: ${value.counts.dailyLogs} ngày, ${value.counts.workItems} công việc, ${value.counts.workCategories} nhóm${value.counts.theme?', có giao diện':', không có giao diện'}.`);setState('success')}catch(reason){setError(message(reason));setState('error')}};
  const chooseImport=async()=>{setState('choosing');setError(null);setResult(null);try{setState('validating');const value=await service.chooseAndPreview();if(!value){setState('idle');return}setSelected(value);setMode('merge');setApplyTheme(false);setReplaceConfirmed(false);setReimportConfirmed(false);setState('idle')}catch(reason){setError(message(reason));setState('error')}};
  const runImport=async()=>{if(!selected)return;setState('importing');setError(null);try{const value=await service.import(selected.path,mode,applyTheme,reimportConfirmed);setSelected(null);setResult(`Khôi phục thành công ${value.counts.dailyLogs} ngày và ${value.counts.workItems} công việc${value.remapped?`; đã ánh xạ lại ${value.remapped} ID`:''}.`);setState('success')}catch(reason){setError(message(reason));setState('error')}};
  const busy=['preparing','choosing','validating','importing'].includes(state);
  return <><section className="settings-card backup-settings"><div className="settings-heading"><div><h2>Sao lưu và khôi phục</h2><p>Dữ liệu được lưu cục bộ. File JSON độc lập với cấu trúc SQLite.</p></div><ArchiveRestore size={24}/></div>
    <p className="privacy-warning"><ShieldAlert size={18}/> File sao lưu có thể chứa nội dung cá nhân. Hãy lưu ở nơi an toàn.</p>
    <div className="backup-actions"><button disabled={busy} onClick={()=>void runExport()}><Download size={17}/> Xuất bản sao lưu</button><button disabled={busy} onClick={()=>void chooseImport()}><Upload size={17}/> Khôi phục từ bản sao lưu</button>{busy&&<span><LoaderCircle className="spin" size={16}/> {state==='importing'?'Đang khôi phục…':'Đang chuẩn bị…'}</span>}</div>
    {result&&<p className="backup-success">{result}</p>}{error&&<div className="page-error"><span>{error}</span><button onClick={()=>setState('idle')}>Đóng</button></div>}</section>
    {selected&&<ImportPreviewDialog value={selected.preview} mode={mode} setMode={value=>{setMode(value);setReplaceConfirmed(false)}} applyTheme={applyTheme} setApplyTheme={setApplyTheme}
      replaceConfirmed={replaceConfirmed} setReplaceConfirmed={setReplaceConfirmed} reimportConfirmed={reimportConfirmed} setReimportConfirmed={setReimportConfirmed}
      busy={state==='importing'} cancel={()=>setSelected(null)} submit={()=>void runImport()}/>}</>;
}
function ImportPreviewDialog({value,mode,setMode,applyTheme,setApplyTheme,replaceConfirmed,setReplaceConfirmed,reimportConfirmed,setReimportConfirmed,busy,cancel,submit}:{
  value:ImportPreview;mode:ImportMode;setMode:(value:ImportMode)=>void;applyTheme:boolean;setApplyTheme:(value:boolean)=>void;
  replaceConfirmed:boolean;setReplaceConfirmed:(value:boolean)=>void;reimportConfirmed:boolean;setReimportConfirmed:(value:boolean)=>void;
  busy:boolean;cancel:()=>void;submit:()=>void;
}){
  const allowed=(mode==='merge'||replaceConfirmed)&&(!value.previouslyImportedAt||reimportConfirmed);
  return <div className="dialog-backdrop" role="presentation"><section className="import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title">
    <h2 id="import-title">Xem trước bản sao lưu</h2><p><strong>{value.fileName}</strong></p>
    <dl><div><dt>Định dạng</dt><dd>{value.format} v{value.version}</dd></div><div><dt>Ngày xuất</dt><dd>{new Date(value.exportedAt).toLocaleString('vi-VN')}</dd></div>
      <div><dt>Phiên bản ứng dụng</dt><dd>{value.appVersion}</dd></div><div><dt>Checksum</dt><dd>{value.checksumValid?'Hợp lệ':'Không hợp lệ'}</dd></div>
      <div><dt>Dữ liệu</dt><dd>{value.counts.dailyLogs} ngày · {value.counts.workItems} việc · {value.counts.workCategories} nhóm · {value.counts.theme?'có theme':'không theme'}</dd></div>
      <div><dt>Dry run</dt><dd>{value.newRecords} mới · {value.existingIds} ID đã có · {value.conflicts} xung đột · {value.unchanged} giữ nguyên</dd></div></dl>
    {value.warnings.map(warning=><p className="import-warning" key={warning}>{warning}</p>)}
    {value.previouslyImportedAt&&<label className="confirm-row"><input type="checkbox" checked={reimportConfirmed} onChange={event=>setReimportConfirmed(event.target.checked)}/> Tôi hiểu file này đã được nhập vào {new Date(value.previouslyImportedAt).toLocaleString('vi-VN')} và muốn nhập lại.</label>}
    <fieldset><legend>Chế độ khôi phục</legend><label><input type="radio" checked={mode==='merge'} onChange={()=>setMode('merge')}/> Merge — giữ dữ liệu hiện tại và thêm dữ liệu không trùng</label>
      <label className="danger-choice"><input type="radio" checked={mode==='replace'} onChange={()=>setMode('replace')}/> Replace all — thay toàn bộ nhật ký, nhóm và giao diện</label></fieldset>
    {mode==='merge'&&value.counts.theme&&<label className="confirm-row"><input type="checkbox" checked={applyTheme} onChange={event=>setApplyTheme(event.target.checked)}/> Áp dụng giao diện từ bản sao lưu</label>}
    {mode==='replace'&&<label className="confirm-row danger-box"><input type="checkbox" checked={replaceConfirmed} onChange={event=>setReplaceConfirmed(event.target.checked)}/> Tôi hiểu mọi nhật ký, nhóm và giao diện hiện tại sẽ bị thay thế. Thao tác chỉ hoàn tất nếu toàn bộ transaction thành công.</label>}
    <div className="dialog-actions"><button disabled={busy} onClick={cancel}>Hủy</button><button className={mode==='replace'?'danger-button':''} disabled={!allowed||busy} onClick={submit}>{busy?'Đang nhập…':'Nhập bản sao lưu'}</button></div>
  </section></div>;
}
