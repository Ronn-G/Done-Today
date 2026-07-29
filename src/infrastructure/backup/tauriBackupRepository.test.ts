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

describe('TauriBackupRepository response contracts', () => {
  const counts = {
    dailyLogs: 1,
    workItems: 2,
    workCategories: 3,
    theme: true,
  };

  it('parses Backup v1 export, preview, and import responses', async () => {
    const invokeCommand = vi.fn(async (command: string) => {
      if (command === 'export_backup')
        return { fileName: 'safe.json', counts, futureField: true };
      if (command === 'preview_backup')
        return {
          fileName: 'safe.json',
          format: 'done-today-backup',
          version: 1,
          exportedAt: '2026-07-29T00:00:00Z',
          appVersion: '0.1.0',
          checksum: `sha256:${'0'.repeat(64)}`,
          checksumValid: true,
          counts,
          existingIds: 1,
          newRecords: 2,
          conflicts: 0,
          unchanged: 3,
          previouslyImportedAt: null,
          warnings: [
            {
              code: 'backup.warning.app_version',
              params: {
                backupVersion: '0.1.0',
                currentVersion: '0.2.0',
              },
            },
          ],
        };
      return { mode: 'merge', counts, remapped: 1 };
    });
    const repository = new TauriBackupRepository(
      vi.fn() as never,
      vi.fn() as never,
      invokeCommand,
    );

    await expect(repository.export('safe.json')).resolves.toEqual({
      fileName: 'safe.json',
      counts,
    });
    await expect(repository.preview('safe.json')).resolves.toMatchObject({
      format: 'done-today-backup',
      version: 1,
      warnings: [
        {
          kind: 'known',
          code: 'backup.warning.app_version',
          params: {
            backupVersion: '0.1.0',
            currentVersion: '0.2.0',
          },
        },
      ],
    });
    await expect(
      repository.import('safe.json', 'merge', false, false),
    ).resolves.toEqual({ mode: 'merge', counts, remapped: 1 });
  });

  it('normalizes malformed nested Backup response data', async () => {
    const repository = new TauriBackupRepository(
      vi.fn() as never,
      vi.fn() as never,
      vi.fn(async () => ({
        fileName: 'safe.json',
        counts: { ...counts, dailyLogs: '1' },
      })),
    );
    await expect(repository.export('safe.json')).rejects.toEqual({
      kind: 'unknown',
    });
  });
});
