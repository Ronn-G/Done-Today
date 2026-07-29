import { describe, expect, it, vi } from 'vitest';
import { TauriBackupRepository } from './tauriBackupRepository';

describe('TauriBackupRepository dialog boundary', () => {
  it('passes localized Save title/filter while preserving the stable ASCII filename and JSON extension', async () => {
    const saveDialog = vi.fn(async (options: unknown) => {
      void options;
      return String.raw`C:\Backups\done-today-backup.json`;
    });
    const repository = new TauriBackupRepository(
      saveDialog as never,
      vi.fn() as never,
      vi.fn() as never,
    );
    await expect(
      repository.chooseExportPath({
        title: 'Export Done Today backup',
        filterName: 'Done Today backup',
      }),
    ).resolves.toBe(String.raw`C:\Backups\done-today-backup.json`);
    expect(saveDialog).toHaveBeenCalledOnce();
    const options = saveDialog.mock.calls[0][0] as { defaultPath: string };
    expect(options).toMatchObject({
      title: 'Export Done Today backup',
      filters: [{ name: 'Done Today backup', extensions: ['json'] }],
    });
    expect(options.defaultPath).toMatch(/^done-today-backup-\d{14}\.json$/);
    expect(
      [...options.defaultPath].every(
        (character) => (character.codePointAt(0) ?? 128) <= 127,
      ),
    ).toBe(true);
  });

  it('passes localized Open title/filter without changing selection behavior', async () => {
    const openDialog = vi.fn(async (options: unknown) => {
      void options;
      return String.raw`C:\Backups\safe.json`;
    });
    const repository = new TauriBackupRepository(
      vi.fn() as never,
      openDialog as never,
      vi.fn() as never,
    );
    await expect(
      repository.chooseImportPath({
        title: 'Khôi phục từ bản sao lưu',
        filterName: 'Bản sao lưu Done Today',
      }),
    ).resolves.toBe(String.raw`C:\Backups\safe.json`);
    expect(openDialog).toHaveBeenCalledWith({
      title: 'Khôi phục từ bản sao lưu',
      multiple: false,
      directory: false,
      filters: [{ name: 'Bản sao lưu Done Today', extensions: ['json'] }],
    });
  });

  it('keeps native Save/Open cancellation silent', async () => {
    const saveDialog = vi.fn(async (options: unknown) => {
      void options;
      return null;
    });
    const openDialog = vi.fn(async (options: unknown) => {
      void options;
      return null;
    });
    const repository = new TauriBackupRepository(
      saveDialog as never,
      openDialog as never,
      vi.fn() as never,
    );
    await expect(
      repository.chooseExportPath({ title: 'Export', filterName: 'Backup' }),
    ).resolves.toBeNull();
    await expect(
      repository.chooseImportPath({ title: 'Import', filterName: 'Backup' }),
    ).resolves.toBeNull();
  });
});
