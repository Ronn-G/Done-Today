# Database Design

**Document status:** Authoritative
**Document version:** 1.3
**Last verified against baseline commit:** `81b3276ac4026a852516ae27c81053a38e5caa5f` (2026-07-28)

## 1. Bảng daily_logs

```sql
CREATE TABLE daily_logs (
  id TEXT PRIMARY KEY,
  log_date TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  theme_id TEXT NULL,
  theme_version INTEGER NULL
);
```

`log_date` dùng định dạng `YYYY-MM-DD` theo múi giờ địa phương của người dùng.

Migration `005_day_theme.sql` bổ sung hai cột Day Theme nullable mà không backfill hoặc rewrite
daily log cũ. `NULL/NULL` nghĩa là chưa có lựa chọn Day Theme cụ thể; renderer dùng default runtime
nhưng không persist `done-today-default`. Khi có `theme_id`, `theme_version` phải là số nguyên dương.
ID dùng lower-kebab-case ASCII, dài tối đa 64 ký tự. SQLite không có foreign key tới registry
built-in; application/persistence boundary kiểm tra pair và ghi hoặc clear cả hai field bằng một
statement trong transaction. Unknown nhưng structurally valid ID/version được giữ nguyên để
registry fallback khi render; fallback không tự xóa metadata.

## 2. Bảng work_items

```sql
CREATE TABLE work_items (
  id TEXT PRIMARY KEY,
  daily_log_id TEXT NOT NULL,
  task TEXT NOT NULL DEFAULT '',
  result TEXT NOT NULL DEFAULT '',
  next_action TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('completed', 'in_progress', 'postponed', 'cancelled')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE CASCADE
);
```

## 3. Bảng app_settings

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Các key application preference hiện hành:

- `appearance.themePreferences`: App Theme schema version 2.
- `localization.locale`: locale canonical `vi` hoặc `en`, là preference cục bộ của thiết bị.
- `installation.bootstrap`: marker JSON nhỏ, versioned, ghi một lần để phân biệt
  `fresh` với `legacyOrUnclassified` cho chính sách khởi tạo locale I18N-5.

Marker version 1 có shape:

```json
{"version":1,"classification":"fresh"}
```

`classification` chỉ nhận `fresh` hoặc `legacyOrUnclassified`. Marker thiếu, hỏng hoặc version lạ
trên database đã tồn tại phải fail closed về `legacyOrUnclassified`; locale `vi`/`en` hợp lệ đã
persist luôn authoritative. Marker và locale khởi tạo được resolve/upsert trong cùng transaction.
Không thêm migration mới vì `app_settings` là metadata store canonical đã có.

## 4. Chỉ mục

```sql
CREATE INDEX idx_work_items_daily_log_id
ON work_items(daily_log_id);

CREATE INDEX idx_daily_logs_log_date
ON daily_logs(log_date);
```

Nếu triển khai tìm kiếm toàn văn, có thể bổ sung FTS5 ở sprint sau.

## 5. Quy tắc dữ liệu

- Một ngày chỉ có một `daily_log`.
- Một `daily_log` có nhiều `work_items`.
- Dòng trống hoàn toàn không nên được lưu lâu dài.
- Khi người dùng nhập vào dòng mới, chỉ tạo bản ghi khi có nội dung ở ít nhất một trong ba trường văn bản.
- Khi xóa ngày, toàn bộ work item phải bị xóa theo cascade.
- `position` giữ nguyên thứ tự hiển thị và được chuẩn hóa trong transaction khi reorder.
- ID dùng UUID.
- Thời gian lưu theo ISO 8601.

## 6. Nhóm công việc

Migration 003 thêm `work_categories` và khóa ngoại nullable `work_items.category_id`. Xem
`07-WORK-CATEGORIES.md` để biết constraints, archive, fallback và sorting semantics.

## 7. Backup format

Schema, ví dụ JSON và semantics authoritative nằm duy nhất trong `08-BACKUP-RESTORE.md`.
Không sao chép envelope hoặc payload backup vào tài liệu này để tránh hai nguồn sự thật.

Migration 004 bổ sung
`backup_import_receipts(id, checksum, imported_at, mode, source_exported_at, result_summary_json)`
và index theo checksum. Receipt không thuộc payload backup.

Migration 005 bổ sung `daily_logs.theme_id` và `daily_logs.theme_version`; dữ liệu, timestamps,
work item, category, setting và receipt hiện có được giữ nguyên.
