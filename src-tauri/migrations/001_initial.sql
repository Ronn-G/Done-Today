CREATE TABLE daily_logs (
  id TEXT PRIMARY KEY,
  log_date TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE work_items (
  id TEXT PRIMARY KEY,
  daily_log_id TEXT NOT NULL,
  task TEXT NOT NULL,
  result TEXT NOT NULL DEFAULT '',
  next_action TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('completed','in_progress','postponed','cancelled')),
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE CASCADE
);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX idx_work_items_daily_log_id ON work_items(daily_log_id);
CREATE INDEX idx_work_items_daily_position ON work_items(daily_log_id, position);
