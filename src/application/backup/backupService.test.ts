import { describe, expect, it, vi } from 'vitest';
import { i18next, initializeI18n } from '../../i18n';
import { BackupService } from './backupService';
const exportPresentation = {
  title: 'Export Done Today backup',
  filterName: 'Done Today backup',
};
const importPresentation = {
  title: 'Restore from backup',
  filterName: 'Done Today backup',
};
describe('BackupService', () => {
  it('forwards localized export presentation and treats cancellation as a no-op', async () => {
    const repository = {
      chooseExportPath: vi.fn().mockResolvedValue(null),
      export: vi.fn(),
    } as never;
    const service = new BackupService(repository, vi.fn(), vi.fn());
    await expect(service.export(exportPresentation)).resolves.toBeNull();
    expect(
      (repository as { chooseExportPath: ReturnType<typeof vi.fn> })
        .chooseExportPath,
    ).toHaveBeenCalledWith(exportPresentation);
    expect(
      (repository as { export: ReturnType<typeof vi.fn> }).export,
    ).not.toHaveBeenCalled();
  });
  it('forwards localized import presentation and treats cancellation as a no-op', async () => {
    const repository = {
      chooseImportPath: vi.fn().mockResolvedValue(null),
      preview: vi.fn(),
    } as never;
    const service = new BackupService(repository, vi.fn(), vi.fn());
    await expect(
      service.chooseAndPreview(importPresentation),
    ).resolves.toBeNull();
    expect(
      (repository as { chooseImportPath: ReturnType<typeof vi.fn> })
        .chooseImportPath,
    ).toHaveBeenCalledWith(importPresentation);
    expect(
      (repository as { preview: ReturnType<typeof vi.fn> }).preview,
    ).not.toHaveBeenCalled();
  });
  it('flushes and invalidates after import', async () => {
    const repository = {
      import: vi.fn().mockResolvedValue({
        mode: 'merge',
        counts: {
          dailyLogs: 0,
          workItems: 0,
          workCategories: 0,
          theme: false,
        },
        remapped: 0,
      }),
    } as never;
    const flush = vi.fn();
    const invalidate = vi.fn();
    const service = new BackupService(repository, flush, invalidate);
    await service.import('backup.json', 'merge', false, false);
    expect(flush).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalled();
  });
  it('does not change the active locale after import', async () => {
    await initializeI18n('en');
    const repository = {
      import: vi.fn().mockResolvedValue({
        mode: 'replace',
        counts: {
          dailyLogs: 1,
          workItems: 1,
          workCategories: 0,
          theme: false,
        },
        remapped: 0,
      }),
    } as never;
    const service = new BackupService(repository, vi.fn(), vi.fn());
    await service.import('backup.json', 'replace', false, false);
    expect(i18next.resolvedLanguage).toBe('en');
  });
});
