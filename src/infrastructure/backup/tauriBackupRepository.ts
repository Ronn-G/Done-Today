import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { z } from 'zod';
import { normalizeAppWarning } from '../../application/errors/errorNormalizer';
import type {
  BackupDialogPresentation,
  BackupRepository,
} from '../../application/backup/backupRepository';
import type {
  ExportResult,
  ImportMode,
  ImportPreview,
  ImportResult,
} from '../../domain/backup/preview';
import { invokeWithAppError, type InvokeCommand } from '../tauri/invoke';

const counts = z.object({
  dailyLogs: z.number().int().nonnegative(),
  workItems: z.number().int().nonnegative(),
  workCategories: z.number().int().nonnegative(),
  theme: z.boolean(),
});
const previewSchema = z
  .object({
    fileName: z.string(),
    format: z.literal('done-today-backup'),
    version: z.literal(1),
    exportedAt: z.string(),
    appVersion: z.string(),
    checksum: z.string(),
    checksumValid: z.boolean(),
    counts,
    existingIds: z.number().int().nonnegative(),
    newRecords: z.number().int().nonnegative(),
    conflicts: z.number().int().nonnegative(),
    unchanged: z.number().int().nonnegative(),
    previouslyImportedAt: z.string().nullable(),
    warnings: z.array(z.unknown()),
  })
  .transform((value) => ({
    ...value,
    warnings: value.warnings.map(normalizeAppWarning),
  }));
const exportSchema = z.object({ fileName: z.string(), counts });
const importSchema = z.object({
  mode: z.enum(['merge', 'replace']),
  counts,
  remapped: z.number().int().nonnegative(),
});
type SaveDialog = typeof save;
type OpenDialog = typeof open;
export class TauriBackupRepository implements BackupRepository {
  private readonly saveDialog: SaveDialog;
  private readonly openDialog: OpenDialog;
  private readonly invokeCommand: InvokeCommand;
  constructor(
    saveDialog: SaveDialog = save,
    openDialog: OpenDialog = open,
    invokeCommand: InvokeCommand = (command, args) => invoke(command, args),
  ) {
    this.saveDialog = saveDialog;
    this.openDialog = openDialog;
    this.invokeCommand = invokeCommand;
  }
  async chooseExportPath(presentation: BackupDialogPresentation) {
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    return await this.saveDialog({
      title: presentation.title,
      defaultPath: `done-today-backup-${stamp}.json`,
      filters: [{ name: presentation.filterName, extensions: ['json'] }],
    });
  }
  async chooseImportPath(presentation: BackupDialogPresentation) {
    const selected = await this.openDialog({
      title: presentation.title,
      multiple: false,
      directory: false,
      filters: [{ name: presentation.filterName, extensions: ['json'] }],
    });
    return typeof selected === 'string' ? selected : null;
  }
  async export(path: string): Promise<ExportResult> {
    return exportSchema.parse(
      await invokeWithAppError(this.invokeCommand, 'export_backup', { path }),
    );
  }
  async preview(path: string): Promise<ImportPreview> {
    return previewSchema.parse(
      await invokeWithAppError(this.invokeCommand, 'preview_backup', { path }),
    );
  }
  async import(
    path: string,
    mode: ImportMode,
    applyTheme: boolean,
    confirmReimport: boolean,
  ): Promise<ImportResult> {
    return importSchema.parse(
      await invokeWithAppError(this.invokeCommand, 'import_backup', {
        path,
        mode,
        applyTheme,
        confirmReimport,
      }),
    );
  }
}
