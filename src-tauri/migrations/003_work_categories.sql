CREATE TABLE work_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100),
  color TEXT NOT NULL CHECK (length(color) = 7 AND color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
  position INTEGER NOT NULL CHECK (position >= 0),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
ALTER TABLE work_items ADD COLUMN category_id TEXT NULL REFERENCES work_categories(id) ON DELETE SET NULL;
CREATE INDEX idx_work_categories_position ON work_categories(position);
CREATE INDEX idx_work_categories_active_position ON work_categories(is_active, position);
CREATE INDEX idx_work_items_category_id ON work_items(category_id);
CREATE INDEX idx_work_items_daily_category_position ON work_items(daily_log_id, category_id, position);
