import{flushPendingJournalSaves}from'../journal/saveCoordinator';
import type{ImportMode}from'../../domain/backup/preview';
import{TauriBackupRepository}from'../../infrastructure/backup/tauriBackupRepository';
export class BackupService{
  private readonly repository:TauriBackupRepository;private readonly flushTheme:()=>Promise<void>;private readonly invalidate:()=>void;
  constructor(repository:TauriBackupRepository,flushTheme:()=>Promise<void>,invalidate:()=>void){
    this.repository=repository;this.flushTheme=flushTheme;this.invalidate=invalidate;
  }
  private async flush(){await Promise.all([flushPendingJournalSaves(),this.flushTheme()])}
  async export(){
    await this.flush();const path=await this.repository.chooseExportPath();if(!path)return null;
    return this.repository.export(path);
  }
  async chooseAndPreview(){await this.flush();const path=await this.repository.chooseImportPath();if(!path)return null;return{path,preview:await this.repository.preview(path)}}
  async import(path:string,mode:ImportMode,applyTheme:boolean,confirmReimport:boolean){
    await this.flush();const result=await this.repository.import(path,mode,applyTheme,confirmReimport);
    this.invalidate();return result;
  }
}
