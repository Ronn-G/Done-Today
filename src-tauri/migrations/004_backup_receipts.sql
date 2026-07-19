CREATE TABLE backup_import_receipts (
  id TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('merge', 'replace')),
  source_exported_at TEXT,
  result_summary_json TEXT NOT NULL
);

CREATE INDEX idx_backup_import_receipts_checksum
ON backup_import_receipts(checksum);
