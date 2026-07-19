import{describe,expect,it,vi}from'vitest';
import{BackupService}from'./backupService';
describe('BackupService',()=>{
  it('treats cancelled dialogs as a no-op',async()=>{
    const repository={chooseExportPath:vi.fn().mockResolvedValue(null),export:vi.fn()} as never;
    const service=new BackupService(repository,vi.fn(),vi.fn());expect(await service.export()).toBeNull();expect((repository as {export:ReturnType<typeof vi.fn>}).export).not.toHaveBeenCalled();
  });
  it('flushes and invalidates after import',async()=>{
    const repository={import:vi.fn().mockResolvedValue({mode:'merge',counts:{dailyLogs:0,workItems:0,workCategories:0,theme:false},remapped:0})}as never;
    const flush=vi.fn();const invalidate=vi.fn();const service=new BackupService(repository,flush,invalidate);
    await service.import('backup.json','merge',false,false);expect(flush).toHaveBeenCalled();expect(invalidate).toHaveBeenCalled();
  });
});
