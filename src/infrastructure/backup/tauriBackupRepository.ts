import{invoke}from'@tauri-apps/api/core';
import{open,save}from'@tauri-apps/plugin-dialog';
import{z}from'zod';
import type{ImportMode,ImportPreview}from'../../domain/backup/preview';

const counts=z.object({dailyLogs:z.number().int().nonnegative(),workItems:z.number().int().nonnegative(),workCategories:z.number().int().nonnegative(),theme:z.boolean()});
const previewSchema=z.object({fileName:z.string(),format:z.literal('done-today-backup'),version:z.literal(1),exportedAt:z.string(),
  appVersion:z.string(),checksum:z.string(),checksumValid:z.boolean(),counts,existingIds:z.number().int().nonnegative(),
  newRecords:z.number().int().nonnegative(),conflicts:z.number().int().nonnegative(),unchanged:z.number().int().nonnegative(),
  previouslyImportedAt:z.string().nullable(),warnings:z.array(z.string())});
const exportSchema=z.object({fileName:z.string(),counts});
const importSchema=z.object({mode:z.enum(['merge','replace']),counts,remapped:z.number().int().nonnegative()});
export type ExportResult=z.infer<typeof exportSchema>;
export type ImportResult=z.infer<typeof importSchema>;
export class TauriBackupRepository{
  async chooseExportPath(){
    const stamp=new Date().toISOString().replace(/\D/g,'').slice(0,14);
    return await save({title:'Xuất bản sao lưu Done Today',defaultPath:`done-today-backup-${stamp}.json`,filters:[{name:'Done Today backup',extensions:['json']}]});
  }
  async chooseImportPath(){
    const selected=await open({title:'Khôi phục từ bản sao lưu',multiple:false,directory:false,filters:[{name:'Done Today backup',extensions:['json']}]});
    return typeof selected==='string'?selected:null;
  }
  async export(path:string){return exportSchema.parse(await invoke<unknown>('export_backup',{path}))}
  async preview(path:string):Promise<ImportPreview>{return previewSchema.parse(await invoke<unknown>('preview_backup',{path}))}
  async import(path:string,mode:ImportMode,applyTheme:boolean,confirmReimport:boolean){
    return importSchema.parse(await invoke<unknown>('import_backup',{path,mode,applyTheme,confirmReimport}));
  }
}
