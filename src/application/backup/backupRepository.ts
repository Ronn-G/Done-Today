import type {
  ImportMode,
  ImportPreview,
  ExportResult,
  ImportResult,
} from '../../domain/backup/preview';

export type BackupDialogPresentation = { title: string; filterName: string };

export interface BackupRepository {
  chooseExportPath(
    presentation: BackupDialogPresentation,
  ): Promise<string | null>;
  chooseImportPath(
    presentation: BackupDialogPresentation,
  ): Promise<string | null>;
  export(path: string): Promise<ExportResult>;
  preview(path: string): Promise<ImportPreview>;
  import(
    path: string,
    mode: ImportMode,
    applyTheme: boolean,
    confirmReimport: boolean,
  ): Promise<ImportResult>;
}
