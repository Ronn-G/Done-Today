# Database Design

## 1. Bảng daily_logs

```sql
CREATE TABLE daily_logs (
  id TEXT PRIMARY KEY,
  log_date TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

`log_date` dùng định dạng `YYYY-MM-DD` theo múi giờ địa phương của người dùng.

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

```json
{
  "format": "done-today-backup",
  "version": 1,
  "exportedAt": "2026-07-18T12:00:00.000Z",
  "dailyLogs": [
    {
      "id": "uuid",
      "logDate": "2026-07-18",
      "createdAt": "...",
      "updatedAt": "...",
      "items": [
        {
          "id": "uuid",
          "task": "...",
          "result": "...",
          "nextAction": "...",
          "status": "completed",
          "position": 0,
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
  ]
}
```
