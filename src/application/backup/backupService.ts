import{flushPendingJournalSaves}from'../journal/saveCoordinator';
import type{ImportMode}from'../../domain/backup/preview';
import type{BackupDialogPresentation,BackupRepository}from'./backupRepository';
export class BackupService{
  private readonly repository:BackupRepository;private readonly flushTheme:()=>Promise<void>;private readonly invalidate:()=>void;
  constructor(repository:BackupRepository,flushTheme:()=>Promise<void>,invalidate:()=>void){
    this.repository=repository;this.flushTheme=flushTheme;this.invalidate=invalidate;
  }
  private async flush(){await Promise.all([flushPendingJournalSaves(),this.flushTheme()])}
  async export(presentation:BackupDialogPresentation){
    await this.flush();const path=await this.repository.chooseExportPath(presentation);if(!path)return null;
    return this.repository.export(path);
  }
  async chooseAndPreview(presentation:BackupDialogPresentation){
    await this.flush();const path=await this.repository.chooseImportPath(presentation);if(!path)return null;
    return{path,preview:await this.repository.preview(path)};
  }
  async import(path:string,mode:ImportMode,applyTheme:boolean,confirmReimport:boolean){
    await this.flush();const result=await this.repository.import(path,mode,applyTheme,confirmReimport);
    this.invalidate();return result;
  }
}
