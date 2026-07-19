use chrono::{Local, NaiveDate, Utc};
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
};
use tauri::Manager;
use uuid::Uuid;

const MIGRATION_V1: &str = include_str!("../migrations/001_initial.sql");
const MIGRATION_V2: &str = include_str!("../migrations/002_app_settings.sql");
const MIGRATION_V3: &str = include_str!("../migrations/003_work_categories.sql");
const STATUSES: [&str; 4] = ["completed", "in_progress", "postponed", "cancelled"];
const THEME_KEY: &str = "appearance.themePreferences";
const LEGACY_THEME_COLOR_COUNT: usize = 27;
const THEME_COLOR_KEYS: [&str; 33] = [
    "pageBackground",
    "sidebarBackground",
    "sidebarActiveBackground",
    "cardBackground",
    "tableHeaderBackground",
    "editorHoverBackground",
    "primaryText",
    "secondaryText",
    "mutedText",
    "sidebarText",
    "sidebarActiveText",
    "border",
    "accent",
    "focusRing",
    "progressTrack",
    "completedBackground",
    "completedText",
    "completedBorder",
    "inProgressBackground",
    "inProgressText",
    "inProgressBorder",
    "postponedBackground",
    "postponedText",
    "postponedBorder",
    "cancelledBackground",
    "cancelledText",
    "cancelledBorder",
    "statsPanelBackground",
    "statsPanelBorder",
    "statsPanelPrimaryText",
    "statsPanelSecondaryText",
    "statsPanelProgressTrack",
    "statsPanelProgressFill",
];

#[derive(Debug, Serialize)]
struct AppError {
    code: &'static str,
    message: String,
}
type AppResult<T> = Result<T, AppError>;
impl AppError {
    fn validation(message: &str) -> Self {
        Self {
            code: "validation",
            message: message.into(),
        }
    }
    fn not_found() -> Self {
        Self {
            code: "not_found",
            message: "Không tìm thấy dữ liệu.".into(),
        }
    }
    fn database() -> Self {
        Self {
            code: "database",
            message: "Không thể truy cập dữ liệu. Vui lòng thử lại.".into(),
        }
    }
}
impl From<rusqlite::Error> for AppError {
    fn from(error: rusqlite::Error) -> Self {
        if cfg!(debug_assertions) {
            eprintln!("SQLite error: {error}");
        }
        Self::database()
    }
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkItem {
    id: String,
    daily_log_id: String,
    task: String,
    result: String,
    next_action: String,
    status: String,
    position: i64,
    category_id: Option<String>,
    created_at: String,
    updated_at: String,
}
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkCategory {
    id: String,
    name: String,
    color: String,
    position: i64,
    is_active: bool,
    created_at: String,
    updated_at: String,
}
#[derive(Debug, Deserialize)]
struct CategoryInput {
    name: String,
    color: String,
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CategoryUpdate {
    name: String,
    color: String,
    is_active: bool,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DailyLog {
    id: String,
    log_date: String,
    created_at: String,
    updated_at: String,
    items: Vec<WorkItem>,
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateWorkItem {
    id: String,
    task: String,
    result: String,
    next_action: String,
    status: String,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DailyLogSummary {
    id: String,
    log_date: String,
    total_items: i64,
    completed_items: i64,
    percentage: i64,
    preview_tasks: Vec<String>,
    updated_at: String,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HistoryPage {
    items: Vec<DailyLogSummary>,
    page: i64,
    page_size: i64,
    has_more: bool,
}

fn migrate(connection: &mut Connection) -> rusqlite::Result<()> {
    connection.pragma_update(None, "foreign_keys", "ON")?;
    let transaction = connection.transaction()?;
    transaction.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL
        );",
    )?;
    apply_migration(&transaction, 1, MIGRATION_V1)?;
    apply_migration(&transaction, 2, MIGRATION_V2)?;
    apply_migration(&transaction, 3, MIGRATION_V3)?;
    transaction.commit()
}

fn apply_migration(transaction: &Transaction<'_>, version: i64, sql: &str) -> rusqlite::Result<()> {
    let applied: bool = transaction.query_row(
        "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?1)",
        [version],
        |row| row.get(0),
    )?;
    if !applied {
        transaction.execute_batch(sql)?;
        transaction.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, ?2)",
            params![version, Utc::now().to_rfc3339()],
        )?;
    }
    Ok(())
}

fn validate_theme_preferences(value: &serde_json::Value) -> AppResult<()> {
    let encoded = serde_json::to_string(value)
        .map_err(|_| AppError::validation("Cấu hình giao diện không hợp lệ."))?;
    if encoded.len() > 16_384 {
        return Err(AppError::validation(
            "Cấu hình giao diện vượt quá giới hạn.",
        ));
    }
    let object = value
        .as_object()
        .ok_or_else(|| AppError::validation("Cấu hình giao diện không hợp lệ."))?;
    const OUTER_KEYS: [&str; 6] = [
        "selectedPresetId",
        "lightColors",
        "darkColors",
        "borderRadius",
        "updatedAt",
        "schemaVersion",
    ];
    if object.len() != OUTER_KEYS.len()
        || !OUTER_KEYS.iter().all(|key| object.contains_key(*key))
        || !matches!(
            object
                .get("schemaVersion")
                .and_then(serde_json::Value::as_i64),
            Some(1 | 2)
        )
        || !matches!(object.get("selectedPresetId").and_then(serde_json::Value::as_str), Some(id) if !id.is_empty() && id.len() <= 40)
        || !matches!(
            object
                .get("borderRadius")
                .and_then(serde_json::Value::as_str),
            Some("square" | "subtle" | "rounded" | "soft")
        )
        || !matches!(object.get("updatedAt").and_then(serde_json::Value::as_str), Some(timestamp) if timestamp.len() <= 40 && chrono::DateTime::parse_from_rfc3339(timestamp).is_ok())
    {
        return Err(AppError::validation(
            "Phiên bản hoặc thuộc tính giao diện không hợp lệ.",
        ));
    }
    for palette_name in ["lightColors", "darkColors"] {
        let palette = object
            .get(palette_name)
            .and_then(serde_json::Value::as_object)
            .ok_or_else(|| AppError::validation("Bảng màu không hợp lệ."))?;
        let version = object
            .get("schemaVersion")
            .and_then(serde_json::Value::as_i64)
            .unwrap_or_default();
        let required_keys = if version == 1 {
            &THEME_COLOR_KEYS[..LEGACY_THEME_COLOR_COUNT]
        } else {
            &THEME_COLOR_KEYS[..]
        };
        if palette.len() != required_keys.len()
            || !required_keys.iter().all(|key| palette.contains_key(*key))
        {
            return Err(AppError::validation("Bảng màu không đầy đủ."));
        }
        for key in required_keys {
            let color = palette
                .get(*key)
                .and_then(serde_json::Value::as_str)
                .ok_or_else(|| AppError::validation("Bảng màu không đầy đủ."))?;
            if color.len() != 7
                || !color.starts_with('#')
                || !color[1..]
                    .chars()
                    .all(|character| character.is_ascii_hexdigit())
            {
                return Err(AppError::validation("Màu giao diện phải dùng HEX #RRGGBB."));
            }
        }
    }
    Ok(())
}

fn upgrade_legacy_theme(value: &mut serde_json::Value) -> AppResult<bool> {
    if value
        .get("schemaVersion")
        .and_then(serde_json::Value::as_i64)
        != Some(1)
    {
        return Ok(false);
    }
    for palette_name in ["lightColors", "darkColors"] {
        let palette = value
            .get_mut(palette_name)
            .and_then(serde_json::Value::as_object_mut)
            .ok_or_else(|| AppError::validation("Bảng màu không hợp lệ."))?;
        for (target, source) in [
            ("statsPanelBackground", "cardBackground"),
            ("statsPanelBorder", "border"),
            ("statsPanelPrimaryText", "primaryText"),
            ("statsPanelSecondaryText", "secondaryText"),
            ("statsPanelProgressTrack", "progressTrack"),
            ("statsPanelProgressFill", "accent"),
        ] {
            let color = palette
                .get(source)
                .cloned()
                .ok_or_else(|| AppError::validation("Bảng màu không đầy đủ."))?;
            palette.insert(target.into(), color);
        }
    }
    value["schemaVersion"] = serde_json::json!(2);
    validate_theme_preferences(value)?;
    Ok(true)
}

fn save_theme(connection: &Connection, value: &serde_json::Value) -> AppResult<()> {
    validate_theme_preferences(value)?;
    let encoded = serde_json::to_string(value)
        .map_err(|_| AppError::validation("Cấu hình giao diện không hợp lệ."))?;
    connection.execute(
        "INSERT INTO app_settings (key,value,updated_at) VALUES (?1,?2,?3)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
        params![THEME_KEY, encoded, Utc::now().to_rfc3339()],
    )?;
    Ok(())
}

fn load_theme(connection: &Connection) -> AppResult<Option<serde_json::Value>> {
    let encoded: Option<String> = connection
        .query_row(
            "SELECT value FROM app_settings WHERE key = ?1",
            [THEME_KEY],
            |row| row.get(0),
        )
        .optional()?;
    encoded
        .map(|raw| {
            let mut value: serde_json::Value = serde_json::from_str(&raw)
                .map_err(|_| AppError::validation("Cấu hình giao diện đã lưu bị hỏng."))?;
            validate_theme_preferences(&value)?;
            if upgrade_legacy_theme(&mut value)? {
                save_theme(connection, &value)?;
            }
            Ok(value)
        })
        .transpose()
}

fn seed_development(connection: &mut Connection) -> rusqlite::Result<()> {
    seed_categories(connection)?;
    if !cfg!(debug_assertions) {
        return Ok(());
    }
    let date = Local::now().format("%Y-%m-%d").to_string();
    let exists: bool = connection.query_row(
        "SELECT EXISTS(SELECT 1 FROM daily_logs WHERE log_date = ?1)",
        [&date],
        |row| row.get(0),
    )?;
    if exists {
        return Ok(());
    }
    let transaction = connection.transaction()?;
    let log_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    transaction.execute(
        "INSERT INTO daily_logs (id,log_date,created_at,updated_at) VALUES (?1,?2,?3,?4)",
        params![log_id, date, now, now],
    )?;
    transaction.execute(
        "INSERT INTO work_items
         (id,daily_log_id,task,result,next_action,status,position,created_at,updated_at)
         VALUES (?1,?2,?3,?4,?5,'completed',0,?6,?6)",
        params![
            Uuid::new_v4().to_string(),
            log_id,
            "Khởi tạo ứng dụng Done Today",
            "Ứng dụng đã kết nối và đọc dữ liệu từ SQLite",
            "Triển khai chỉnh sửa trực tiếp trong bảng",
            now
        ],
    )?;
    transaction.commit()
}
fn seed_categories(connection: &mut Connection) -> rusqlite::Result<()> {
    let count: i64 =
        connection.query_row("SELECT COUNT(*) FROM work_categories", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }
    let transaction = connection.transaction()?;
    let now = Utc::now().to_rfc3339();
    for (position, name, color) in [
        (0, "Công việc cơ quan", "#4F7CAC"),
        (1, "Dự án cá nhân", "#7A6FA8"),
        (2, "Học tập", "#4F8A65"),
    ] {
        transaction.execute("INSERT INTO work_categories(id,name,color,position,is_active,created_at,updated_at) VALUES(?1,?2,?3,?4,1,?5,?5)",params![Uuid::new_v4().to_string(),name,color,position,now])?;
    }
    transaction.commit()
}

fn open_database(path: &Path) -> AppResult<Connection> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|_| AppError::database())?;
    }
    let mut connection = Connection::open(path)?;
    migrate(&mut connection)?;
    seed_development(&mut connection)?;
    Ok(connection)
}
fn database_path(app: &tauri::AppHandle) -> AppResult<PathBuf> {
    app.path()
        .app_data_dir()
        .map(|path| path.join("done-today.sqlite3"))
        .map_err(|_| AppError::database())
}
fn validate_date(value: &str) -> AppResult<()> {
    NaiveDate::parse_from_str(value, "%Y-%m-%d")
        .map(|_| ())
        .map_err(|_| AppError::validation("Ngày không hợp lệ."))
}
fn validate_text(input: &UpdateWorkItem) -> AppResult<()> {
    if input.task.chars().count() > 500 {
        return Err(AppError::validation(
            "Việc đã làm không được vượt quá 500 ký tự.",
        ));
    }
    if input.result.chars().count() > 2_000 {
        return Err(AppError::validation(
            "Kết quả không được vượt quá 2.000 ký tự.",
        ));
    }
    if input.next_action.chars().count() > 1_000 {
        return Err(AppError::validation(
            "Bước tiếp theo không được vượt quá 1.000 ký tự.",
        ));
    }
    if !STATUSES.contains(&input.status.as_str()) {
        return Err(AppError::validation("Trạng thái không hợp lệ."));
    }
    Ok(())
}
fn ensure_daily_log(transaction: &Transaction<'_>, date: &str) -> AppResult<String> {
    validate_date(date)?;
    if let Some(id) = transaction
        .query_row(
            "SELECT id FROM daily_logs WHERE log_date=?1",
            [date],
            |row| row.get(0),
        )
        .optional()?
    {
        return Ok(id);
    }
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    transaction.execute(
        "INSERT INTO daily_logs (id,log_date,created_at,updated_at) VALUES (?1,?2,?3,?3)",
        params![id, date, now],
    )?;
    Ok(id)
}
fn row_to_item(row: &rusqlite::Row<'_>) -> rusqlite::Result<WorkItem> {
    Ok(WorkItem {
        id: row.get(0)?,
        daily_log_id: row.get(1)?,
        task: row.get(2)?,
        result: row.get(3)?,
        next_action: row.get(4)?,
        status: row.get(5)?,
        position: row.get(6)?,
        category_id: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}
fn find_item(connection: &Connection, id: &str) -> AppResult<WorkItem> {
    connection
        .query_row(
            "SELECT id,daily_log_id,task,result,next_action,status,position,category_id,created_at,updated_at
             FROM work_items WHERE id=?1",
            [id],
            row_to_item,
        )
        .optional()?
        .ok_or_else(AppError::not_found)
}
fn find_daily_log(connection: &Connection, date: &str) -> AppResult<Option<DailyLog>> {
    validate_date(date)?;
    let header = connection
        .query_row(
            "SELECT id,log_date,created_at,updated_at FROM daily_logs WHERE log_date=?1",
            [date],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
        .optional()?;
    let Some((id, log_date, created_at, updated_at)) = header else {
        return Ok(None);
    };
    let mut statement = connection.prepare(
        "SELECT id,daily_log_id,task,result,next_action,status,position,category_id,created_at,updated_at
         FROM work_items WHERE daily_log_id=?1
         ORDER BY CASE WHEN status='completed' THEN 1 ELSE 0 END,position,created_at,id",
    )?;
    let items = statement
        .query_map([&id], row_to_item)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(Some(DailyLog {
        id,
        log_date,
        created_at,
        updated_at,
        items,
    }))
}
fn create_item(
    connection: &mut Connection,
    date: &str,
    category_id: Option<&str>,
) -> AppResult<WorkItem> {
    let transaction = connection.transaction()?;
    let log_id = ensure_daily_log(&transaction, date)?;
    let position: i64 = transaction.query_row(
        "SELECT COALESCE(MAX(position)+1,0) FROM work_items WHERE daily_log_id=?1 AND category_id IS ?2 AND status<>'completed'",
        params![&log_id,category_id],
        |row| row.get(0),
    )?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    transaction.execute(
        "INSERT INTO work_items
         (id,daily_log_id,task,result,next_action,status,position,category_id,created_at,updated_at)
         VALUES (?1,?2,'','','','in_progress',?3,?4,?5,?5)",
        params![id, log_id, position, category_id, now],
    )?;
    transaction.commit()?;
    find_item(connection, &id)
}
fn update_item(connection: &Connection, mut input: UpdateWorkItem) -> AppResult<WorkItem> {
    validate_text(&input)?;
    input.task = input.task.trim().to_string();
    input.result = input.result.trim().to_string();
    input.next_action = input.next_action.trim().to_string();
    let current = find_item(connection, &input.id)?;
    let crossing = (current.status == "completed") != (input.status == "completed");
    let next_position = if crossing {
        connection.query_row("SELECT COALESCE(MAX(position)+1,0) FROM work_items WHERE daily_log_id=?1 AND category_id IS ?2 AND (status='completed')=?3",params![current.daily_log_id,current.category_id,input.status=="completed"],|row|row.get(0))?
    } else {
        current.position
    };
    let changed = connection.execute(
        "UPDATE work_items SET task=?1,result=?2,next_action=?3,status=?4,position=?5,updated_at=?6 WHERE id=?7",
        params![input.task, input.result, input.next_action, input.status,next_position, Utc::now().to_rfc3339(), input.id],
    )?;
    if changed == 0 {
        return Err(AppError::not_found());
    }
    find_item(connection, &input.id)
}
fn delete_item(connection: &Connection, id: &str) -> AppResult<()> {
    if connection.execute("DELETE FROM work_items WHERE id=?1", [id])? == 0 {
        return Err(AppError::not_found());
    }
    Ok(())
}
fn validate_category(name: &str, color: &str) -> AppResult<(String, String)> {
    let name = name.trim().to_string();
    if name.is_empty() || name.chars().count() > 100 {
        return Err(AppError::validation("Tên nhóm phải có từ 1 đến 100 ký tự."));
    }
    if color.len() != 7
        || !color.starts_with('#')
        || !color[1..].chars().all(|c| c.is_ascii_hexdigit())
    {
        return Err(AppError::validation("Màu nhóm phải dùng HEX #RRGGBB."));
    }
    Ok((name, color.to_uppercase()))
}
fn row_to_category(row: &rusqlite::Row<'_>) -> rusqlite::Result<WorkCategory> {
    Ok(WorkCategory {
        id: row.get(0)?,
        name: row.get(1)?,
        color: row.get(2)?,
        position: row.get(3)?,
        is_active: row.get::<_, i64>(4)? == 1,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}
fn list_categories(
    connection: &Connection,
    include_inactive: bool,
) -> AppResult<Vec<WorkCategory>> {
    let mut statement=connection.prepare("SELECT id,name,color,position,is_active,created_at,updated_at FROM work_categories WHERE is_active=1 OR ?1=1 ORDER BY position,created_at,id")?;
    let categories = statement
        .query_map([include_inactive], row_to_category)?
        .collect::<rusqlite::Result<_>>()?;
    Ok(categories)
}
fn find_category(connection: &Connection, id: &str) -> AppResult<WorkCategory> {
    connection.query_row("SELECT id,name,color,position,is_active,created_at,updated_at FROM work_categories WHERE id=?1",[id],row_to_category).optional()?.ok_or_else(AppError::not_found)
}
fn create_category_record(
    connection: &Connection,
    input: CategoryInput,
) -> AppResult<WorkCategory> {
    let (name, color) = validate_category(&input.name, &input.color)?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let position: i64 = connection.query_row(
        "SELECT COALESCE(MAX(position)+1,0) FROM work_categories",
        [],
        |row| row.get(0),
    )?;
    connection.execute("INSERT INTO work_categories(id,name,color,position,is_active,created_at,updated_at)VALUES(?1,?2,?3,?4,1,?5,?5)",params![id,name,color,position,now])?;
    find_category(connection, &id)
}
fn update_category_record(
    connection: &Connection,
    id: &str,
    input: CategoryUpdate,
) -> AppResult<WorkCategory> {
    let (name, color) = validate_category(&input.name, &input.color)?;
    if connection.execute(
        "UPDATE work_categories SET name=?1,color=?2,is_active=?3,updated_at=?4 WHERE id=?5",
        params![name, color, input.is_active, Utc::now().to_rfc3339(), id],
    )? == 0
    {
        return Err(AppError::not_found());
    }
    find_category(connection, id)
}
fn set_category_active(
    connection: &Connection,
    id: &str,
    is_active: bool,
) -> AppResult<WorkCategory> {
    if connection.execute(
        "UPDATE work_categories SET is_active=?1,updated_at=?2 WHERE id=?3",
        params![is_active, Utc::now().to_rfc3339(), id],
    )? == 0
    {
        return Err(AppError::not_found());
    }
    find_category(connection, id)
}
fn reorder_category_records(
    connection: &mut Connection,
    ids: &[String],
) -> AppResult<Vec<WorkCategory>> {
    let transaction = connection.transaction()?;
    let mut existing = transaction
        .prepare("SELECT id FROM work_categories ORDER BY position,created_at,id")?
        .query_map([], |row| row.get(0))?
        .collect::<rusqlite::Result<Vec<String>>>()?;
    let mut supplied = ids.to_vec();
    existing.sort();
    supplied.sort();
    supplied.dedup();
    if existing != supplied {
        return Err(AppError::validation("Danh sách sắp xếp nhóm không hợp lệ."));
    }
    for (position, id) in ids.iter().enumerate() {
        transaction.execute(
            "UPDATE work_categories SET position=?1,updated_at=?2 WHERE id=?3",
            params![position as i64, Utc::now().to_rfc3339(), id],
        )?;
    }
    transaction.commit()?;
    list_categories(connection, true)
}
fn assign_item_category(
    connection: &mut Connection,
    item_id: &str,
    category_id: Option<&str>,
) -> AppResult<WorkItem> {
    let transaction = connection.transaction()?;
    if let Some(id) = category_id {
        let exists: bool = transaction.query_row(
            "SELECT EXISTS(SELECT 1 FROM work_categories WHERE id=?1 AND is_active=1)",
            [id],
            |row| row.get(0),
        )?;
        if !exists {
            return Err(AppError::not_found());
        }
    }
    let (item_log, status): (String, String) = transaction
        .query_row(
            "SELECT daily_log_id,status FROM work_items WHERE id=?1",
            [item_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()?
        .ok_or_else(AppError::not_found)?;
    let position:i64=transaction.query_row("SELECT COALESCE(MAX(position)+1,0) FROM work_items WHERE daily_log_id=?1 AND category_id IS ?2 AND (status='completed')=?3",params![item_log,category_id,status=="completed"],|row|row.get(0))?;
    transaction.execute(
        "UPDATE work_items SET category_id=?1,position=?2,updated_at=?3 WHERE id=?4",
        params![category_id, position, Utc::now().to_rfc3339(), item_id],
    )?;
    transaction.commit()?;
    find_item(connection, item_id)
}
fn reorder_items(
    connection: &mut Connection,
    log_id: &str,
    ids: &[String],
) -> AppResult<Vec<WorkItem>> {
    let transaction = connection.transaction()?;
    if ids.is_empty() {
        return Err(AppError::validation(
            "Danh sách sắp xếp không được để trống.",
        ));
    }
    let (category_id, completed): (Option<String>, bool) = transaction
        .query_row(
            "SELECT category_id,status='completed' FROM work_items WHERE id=?1 AND daily_log_id=?2",
            params![&ids[0], log_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()?
        .ok_or_else(AppError::not_found)?;
    let existing: Vec<String> = {
        let mut statement = transaction.prepare(
            "SELECT id FROM work_items WHERE daily_log_id=?1 AND category_id IS ?2 AND (status='completed')=?3 ORDER BY position,created_at,id",
        )?;
        let collected = statement
            .query_map(params![log_id, category_id, completed], |row| row.get(0))?
            .collect::<rusqlite::Result<_>>()?;
        collected
    };
    let mut expected = existing.clone();
    let mut supplied = ids.to_vec();
    expected.sort();
    supplied.sort();
    supplied.dedup();
    if supplied != expected {
        return Err(AppError::validation("Danh sách sắp xếp không hợp lệ."));
    }
    for (position, id) in ids.iter().enumerate() {
        transaction.execute(
            "UPDATE work_items SET position=?1,updated_at=?2 WHERE id=?3 AND daily_log_id=?4 AND category_id IS ?5 AND (status='completed')=?6",
            params![position as i64, Utc::now().to_rfc3339(), id, log_id,category_id,completed],
        )?;
    }
    transaction.commit()?;
    let date: String = connection.query_row(
        "SELECT log_date FROM daily_logs WHERE id=?1",
        [log_id],
        |row| row.get(0),
    )?;
    Ok(find_daily_log(connection, &date)?.map_or_else(Vec::new, |log| log.items))
}
fn list_summaries(connection: &Connection, page: i64, page_size: i64) -> AppResult<HistoryPage> {
    if page < 1 || !(1..=100).contains(&page_size) {
        return Err(AppError::validation("Thông tin phân trang không hợp lệ."));
    }
    let offset = (page - 1) * page_size;
    let mut statement = connection.prepare(
        "SELECT d.id,d.log_date,COUNT(w.id),
                COALESCE(SUM(CASE WHEN w.status='completed' THEN 1 ELSE 0 END),0),
                d.updated_at
         FROM daily_logs d JOIN work_items w ON w.daily_log_id=d.id
         GROUP BY d.id,d.log_date,d.updated_at
         ORDER BY d.log_date DESC LIMIT ?1 OFFSET ?2",
    )?;
    let rows = statement.query_map(params![page_size + 1, offset], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
            row.get::<_, i64>(3)?,
            row.get::<_, String>(4)?,
        ))
    })?;
    let mut raw = rows.collect::<rusqlite::Result<Vec<_>>>()?;
    let has_more = raw.len() > page_size as usize;
    raw.truncate(page_size as usize);
    let mut items = Vec::with_capacity(raw.len());
    for (id, log_date, total_items, completed_items, updated_at) in raw {
        let preview_tasks = {
            let mut preview = connection.prepare(
                "SELECT task FROM work_items
                 WHERE daily_log_id=?1 AND TRIM(task)<>''
                 ORDER BY position,created_at,id LIMIT 3",
            )?;
            let collected = preview
                .query_map([&id], |row| row.get(0))?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            collected
        };
        items.push(DailyLogSummary {
            id,
            log_date,
            total_items,
            completed_items,
            percentage: if total_items == 0 {
                0
            } else {
                (completed_items * 100 + total_items / 2) / total_items
            },
            preview_tasks,
            updated_at,
        });
    }
    Ok(HistoryPage {
        items,
        page,
        page_size,
        has_more,
    })
}

#[tauri::command]
fn initialize_database(app: tauri::AppHandle) -> AppResult<()> {
    open_database(&database_path(&app)?)?;
    Ok(())
}
#[tauri::command]
fn get_daily_log(app: tauri::AppHandle, date: String) -> AppResult<Option<DailyLog>> {
    find_daily_log(&open_database(&database_path(&app)?)?, &date)
}
#[tauri::command]
fn create_work_item(
    app: tauri::AppHandle,
    date: String,
    category_id: Option<String>,
) -> AppResult<WorkItem> {
    create_item(
        &mut open_database(&database_path(&app)?)?,
        &date,
        category_id.as_deref(),
    )
}
#[tauri::command]
fn list_work_categories(
    app: tauri::AppHandle,
    include_inactive: bool,
) -> AppResult<Vec<WorkCategory>> {
    list_categories(&open_database(&database_path(&app)?)?, include_inactive)
}
#[tauri::command]
fn create_work_category(app: tauri::AppHandle, input: CategoryInput) -> AppResult<WorkCategory> {
    create_category_record(&open_database(&database_path(&app)?)?, input)
}
#[tauri::command]
fn update_work_category(
    app: tauri::AppHandle,
    id: String,
    input: CategoryUpdate,
) -> AppResult<WorkCategory> {
    update_category_record(&open_database(&database_path(&app)?)?, &id, input)
}
#[tauri::command]
fn archive_work_category(
    app: tauri::AppHandle,
    id: String,
    is_active: bool,
) -> AppResult<WorkCategory> {
    set_category_active(&open_database(&database_path(&app)?)?, &id, is_active)
}
#[tauri::command]
fn reorder_work_categories(
    app: tauri::AppHandle,
    ordered_ids: Vec<String>,
) -> AppResult<Vec<WorkCategory>> {
    reorder_category_records(&mut open_database(&database_path(&app)?)?, &ordered_ids)
}
#[tauri::command]
fn assign_work_item_category(
    app: tauri::AppHandle,
    item_id: String,
    category_id: Option<String>,
) -> AppResult<WorkItem> {
    assign_item_category(
        &mut open_database(&database_path(&app)?)?,
        &item_id,
        category_id.as_deref(),
    )
}
#[tauri::command]
fn update_work_item(app: tauri::AppHandle, input: UpdateWorkItem) -> AppResult<WorkItem> {
    update_item(&open_database(&database_path(&app)?)?, input)
}
#[tauri::command]
fn delete_work_item(app: tauri::AppHandle, item_id: String) -> AppResult<()> {
    delete_item(&open_database(&database_path(&app)?)?, &item_id)
}
#[tauri::command]
fn reorder_work_items(
    app: tauri::AppHandle,
    daily_log_id: String,
    ordered_ids: Vec<String>,
) -> AppResult<Vec<WorkItem>> {
    reorder_items(
        &mut open_database(&database_path(&app)?)?,
        &daily_log_id,
        &ordered_ids,
    )
}
#[tauri::command]
fn list_daily_log_summaries(
    app: tauri::AppHandle,
    page: i64,
    page_size: i64,
) -> AppResult<HistoryPage> {
    list_summaries(&open_database(&database_path(&app)?)?, page, page_size)
}
#[tauri::command]
fn get_theme_preferences(app: tauri::AppHandle) -> AppResult<Option<serde_json::Value>> {
    load_theme(&open_database(&database_path(&app)?)?)
}
#[tauri::command]
fn save_theme_preferences(app: tauri::AppHandle, preferences: serde_json::Value) -> AppResult<()> {
    save_theme(&open_database(&database_path(&app)?)?, &preferences)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            initialize_database,
            get_daily_log,
            create_work_item,
            list_work_categories,
            create_work_category,
            update_work_category,
            archive_work_category,
            reorder_work_categories,
            assign_work_item_category,
            update_work_item,
            delete_work_item,
            reorder_work_items,
            list_daily_log_summaries,
            get_theme_preferences,
            save_theme_preferences
        ])
        .run(tauri::generate_context!())
        .expect("error while running Done Today");
}

#[cfg(test)]
mod tests {
    use super::*;
    fn theme_value() -> serde_json::Value {
        let colors = serde_json::json!({
            "pageBackground":"#FAFAF7","sidebarBackground":"#1F3A2E","sidebarActiveBackground":"#2D5240",
            "cardBackground":"#FFFFFF","tableHeaderBackground":"#F2F3EF","editorHoverBackground":"#F4F7F4",
            "primaryText":"#1C1C1A","secondaryText":"#5C5C58","mutedText":"#767672","sidebarText":"#C5D7CA",
            "sidebarActiveText":"#FFFFFF","border":"#E5E4DD","accent":"#0F6E56","focusRing":"#0F6E56",
            "progressTrack":"#E5E4DD","completedBackground":"#E1F5EE","completedText":"#085041",
            "completedBorder":"#9BD5C2","inProgressBackground":"#FAEEDA","inProgressText":"#633806",
            "inProgressBorder":"#DFC18A","postponedBackground":"#F6E6DC","postponedText":"#7A3F22",
            "postponedBorder":"#E2BFA9","cancelledBackground":"#ECECEA","cancelledText":"#51514E",
            "cancelledBorder":"#CFCECA","statsPanelBackground":"#F0F6F2","statsPanelBorder":"#D4E4D8",
            "statsPanelPrimaryText":"#173D31","statsPanelSecondaryText":"#51665A",
            "statsPanelProgressTrack":"#D7E4DA","statsPanelProgressFill":"#0F6E56"
        });
        serde_json::json!({"selectedPresetId":"done-today","lightColors":colors,"darkColors":colors,
            "borderRadius":"rounded","updatedAt":"2026-07-19T00:00:00.000Z","schemaVersion":2})
    }
    fn legacy_theme_value() -> serde_json::Value {
        let mut value = theme_value();
        value["schemaVersion"] = serde_json::json!(1);
        for palette_name in ["lightColors", "darkColors"] {
            let palette = value[palette_name].as_object_mut().unwrap();
            for key in &THEME_COLOR_KEYS[LEGACY_THEME_COLOR_COUNT..] {
                palette.remove(*key);
            }
        }
        value
    }
    fn memory() -> Connection {
        let mut connection = Connection::open_in_memory().unwrap();
        migrate(&mut connection).unwrap();
        connection
    }
    fn create_three(connection: &mut Connection, date: &str) -> Vec<WorkItem> {
        (0..3)
            .map(|_| create_item(connection, date, None).unwrap())
            .collect()
    }
    fn update(id: &str, task: &str, status: &str) -> UpdateWorkItem {
        UpdateWorkItem {
            id: id.into(),
            task: task.into(),
            result: "Result".into(),
            next_action: "Next".into(),
            status: status.into(),
        }
    }
    #[test]
    fn migration_is_idempotent() {
        let mut db = memory();
        create_item(&mut db, "2026-07-18", None).unwrap();
        migrate(&mut db).unwrap();
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM work_items", [], |r| r
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
    }
    #[test]
    fn failed_migration_rolls_back_schema_and_version() {
        let mut db = memory();
        {
            let transaction = db.transaction().unwrap();
            assert!(apply_migration(
                &transaction,
                99,
                "CREATE TABLE rollback_probe (id INTEGER); INVALID SQL;"
            )
            .is_err());
        }
        assert_eq!(
            db.query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='rollback_probe'",
                [],
                |row| row.get::<_, i64>(0)
            )
            .unwrap(),
            0
        );
        assert_eq!(
            db.query_row(
                "SELECT COUNT(*) FROM schema_migrations WHERE version=99",
                [],
                |row| row.get::<_, i64>(0)
            )
            .unwrap(),
            0
        );
    }
    #[test]
    fn theme_preferences_save_read_and_update_without_duplicates() {
        let db = memory();
        let mut value = theme_value();
        save_theme(&db, &value).unwrap();
        assert_eq!(load_theme(&db).unwrap(), Some(value.clone()));
        value["selectedPresetId"] = serde_json::json!("custom");
        save_theme(&db, &value).unwrap();
        assert_eq!(load_theme(&db).unwrap(), Some(value));
        assert_eq!(
            db.query_row(
                "SELECT COUNT(*) FROM app_settings WHERE key=?1",
                [THEME_KEY],
                |row| row.get::<_, i64>(0)
            )
            .unwrap(),
            1
        );
    }
    #[test]
    fn legacy_theme_is_upgraded_and_persisted_without_losing_existing_colors() {
        let db = memory();
        let legacy = legacy_theme_value();
        let original_accent = legacy["lightColors"]["accent"].clone();
        let encoded = serde_json::to_string(&legacy).unwrap();
        db.execute(
            "INSERT INTO app_settings (key,value,updated_at) VALUES (?1,?2,?3)",
            params![THEME_KEY, encoded, Utc::now().to_rfc3339()],
        )
        .unwrap();
        let upgraded = load_theme(&db).unwrap().unwrap();
        assert_eq!(upgraded["schemaVersion"], 2);
        assert_eq!(upgraded["lightColors"]["accent"], original_accent);
        assert_eq!(
            upgraded["lightColors"]["statsPanelProgressFill"],
            original_accent
        );
        let persisted: String = db
            .query_row(
                "SELECT value FROM app_settings WHERE key=?1",
                [THEME_KEY],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&persisted).unwrap()["schemaVersion"],
            2
        );
    }
    #[test]
    fn theme_validation_rejects_invalid_json_and_does_not_touch_journal() {
        let mut db = memory();
        create_item(&mut db, "2026-07-19", None).unwrap();
        let mut value = theme_value();
        value["lightColors"]["accent"] = serde_json::json!("var(--evil)");
        assert_eq!(save_theme(&db, &value).unwrap_err().code, "validation");
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM work_items", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
    }
    #[test]
    fn theme_settings_persist_after_reopen_and_errors_hide_sql_paths() {
        let file = tempfile::NamedTempFile::new().unwrap();
        {
            let mut db = Connection::open(file.path()).unwrap();
            migrate(&mut db).unwrap();
            save_theme(&db, &theme_value()).unwrap();
        }
        let mut reopened = Connection::open(file.path()).unwrap();
        migrate(&mut reopened).unwrap();
        assert_eq!(load_theme(&reopened).unwrap(), Some(theme_value()));
        assert_eq!(
            reopened
                .query_row("SELECT MAX(version) FROM schema_migrations", [], |row| row
                    .get::<_, i64>(
                    0
                ))
                .unwrap(),
            3
        );
        let error: AppError = rusqlite::Error::InvalidQuery.into();
        assert!(!error.message.to_lowercase().contains("sqlite"));
        assert!(!error
            .message
            .contains(file.path().to_string_lossy().as_ref()));
    }
    #[test]
    fn creates_log_once_and_default_item_at_end() {
        let mut db = memory();
        let first = create_item(&mut db, "2026-07-18", None).unwrap();
        let second = create_item(&mut db, "2026-07-18", None).unwrap();
        assert_eq!(first.status, "in_progress");
        assert_eq!(first.task, "");
        assert_eq!(second.position, 1);
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM daily_logs", [], |r| r
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
    }
    #[test]
    fn updates_text_and_status() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        let saved = update_item(&db, update(&item.id, " Task ", "completed")).unwrap();
        assert_eq!(saved.task, "Task");
        assert_eq!(saved.result, "Result");
        assert_eq!(saved.status, "completed");
    }
    #[test]
    fn rejects_invalid_status_and_limits() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        assert_eq!(
            update_item(&db, update(&item.id, "x", "wrong"))
                .unwrap_err()
                .code,
            "validation"
        );
        assert_eq!(
            update_item(&db, update(&item.id, &"x".repeat(501), "completed"))
                .unwrap_err()
                .code,
            "validation"
        );
    }
    #[test]
    fn deletes_item() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        delete_item(&db, &item.id).unwrap();
        assert!(find_daily_log(&db, "2026-07-18")
            .unwrap()
            .unwrap()
            .items
            .is_empty());
    }
    #[test]
    fn reorders_and_normalizes_positions() {
        let mut db = memory();
        let items = create_three(&mut db, "2026-07-18");
        let ids = vec![
            items[2].id.clone(),
            items[0].id.clone(),
            items[1].id.clone(),
        ];
        let reordered = reorder_items(&mut db, &items[0].daily_log_id, &ids).unwrap();
        assert_eq!(
            reordered.iter().map(|i| i.id.clone()).collect::<Vec<_>>(),
            ids
        );
        assert_eq!(
            reordered.iter().map(|i| i.position).collect::<Vec<_>>(),
            vec![0, 1, 2]
        );
    }
    #[test]
    fn reorder_invalid_ids_rolls_back() {
        let mut db = memory();
        let items = create_three(&mut db, "2026-07-18");
        let before = find_daily_log(&db, "2026-07-18").unwrap().unwrap().items;
        assert!(reorder_items(
            &mut db,
            &items[0].daily_log_id,
            &[items[0].id.clone(), "missing".into()]
        )
        .is_err());
        let after = find_daily_log(&db, "2026-07-18").unwrap().unwrap().items;
        assert_eq!(
            before.iter().map(|i| &i.id).collect::<Vec<_>>(),
            after.iter().map(|i| &i.id).collect::<Vec<_>>()
        );
    }
    #[test]
    fn history_sorts_aggregates_previews_and_pages() {
        let mut db = memory();
        for date in ["2026-07-16", "2026-07-17", "2026-07-18"] {
            let items = create_three(&mut db, date);
            update_item(
                &db,
                update(&items[0].id, &format!("Task {date}"), "completed"),
            )
            .unwrap();
            update_item(&db, update(&items[1].id, "Second", "completed")).unwrap();
        }
        let first = list_summaries(&db, 1, 2).unwrap();
        let second = list_summaries(&db, 2, 2).unwrap();
        assert_eq!(first.items[0].log_date, "2026-07-18");
        assert_eq!(first.items[0].total_items, 3);
        assert_eq!(first.items[0].completed_items, 2);
        assert_eq!(first.items[0].percentage, 67);
        assert_eq!(first.items[0].preview_tasks.len(), 2);
        assert!(first.has_more);
        assert_eq!(second.items.len(), 1);
        assert_ne!(first.items[0].id, second.items[0].id);
    }
    #[test]
    fn history_excludes_empty_logs_and_validates_page_size() {
        let mut db = memory();
        let tx = db.transaction().unwrap();
        ensure_daily_log(&tx, "2026-07-18").unwrap();
        tx.commit().unwrap();
        assert!(list_summaries(&db, 1, 20).unwrap().items.is_empty());
        assert_eq!(list_summaries(&db, 1, 101).unwrap_err().code, "validation");
    }
    #[test]
    fn history_reflects_crud() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        update_item(&db, update(&item.id, "Done", "completed")).unwrap();
        assert_eq!(
            list_summaries(&db, 1, 20).unwrap().items[0].completed_items,
            1
        );
        delete_item(&db, &item.id).unwrap();
        assert!(list_summaries(&db, 1, 20).unwrap().items.is_empty());
    }
    #[test]
    fn rejects_invalid_dates() {
        let mut db = memory();
        assert_eq!(
            create_item(&mut db, "2026-02-31", None).unwrap_err().code,
            "validation"
        );
        assert_eq!(find_daily_log(&db, "bad").unwrap_err().code, "validation");
    }
    #[test]
    fn development_seed_does_not_duplicate() {
        let mut db = memory();
        seed_development(&mut db).unwrap();
        seed_development(&mut db).unwrap();
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM work_items", [], |r| r
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
    }
    #[test]
    fn migration_v3_preserves_old_items_with_null_category() {
        let mut db = Connection::open_in_memory().unwrap();
        {
            let tx = db.transaction().unwrap();
            tx.execute_batch("CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY,applied_at TEXT NOT NULL);").unwrap();
            apply_migration(&tx, 1, MIGRATION_V1).unwrap();
            tx.commit().unwrap();
        }
        let now = Utc::now().to_rfc3339();
        db.execute(
            "INSERT INTO daily_logs VALUES('log','2026-07-19',?1,?1)",
            [&now],
        )
        .unwrap();
        db.execute("INSERT INTO work_items(id,daily_log_id,task,result,next_action,status,position,created_at,updated_at)VALUES('item','log','Old','','','in_progress',0,?1,?1)",[&now]).unwrap();
        migrate(&mut db).unwrap();
        assert_eq!(
            db.query_row(
                "SELECT category_id FROM work_items WHERE id='item'",
                [],
                |row| row.get::<_, Option<String>>(0)
            )
            .unwrap(),
            None
        );
        assert_eq!(
            db.query_row("SELECT MAX(version) FROM schema_migrations", [], |row| row
                .get::<_, i64>(
                0
            ))
            .unwrap(),
            3
        );
    }
    #[test]
    fn category_seed_and_crud_are_stable() {
        let mut db = memory();
        seed_categories(&mut db).unwrap();
        seed_categories(&mut db).unwrap();
        assert_eq!(list_categories(&db, true).unwrap().len(), 3);
        let created = create_category_record(
            &db,
            CategoryInput {
                name: " Nhóm mới ".into(),
                color: "#abcdef".into(),
            },
        )
        .unwrap();
        assert_eq!(created.name, "Nhóm mới");
        assert_eq!(created.color, "#ABCDEF");
        let updated = update_category_record(
            &db,
            &created.id,
            CategoryUpdate {
                name: "Đã đổi".into(),
                color: "#112233".into(),
                is_active: true,
            },
        )
        .unwrap();
        assert_eq!(updated.name, "Đã đổi");
        assert!(
            !set_category_active(&db, &created.id, false)
                .unwrap()
                .is_active
        );
    }
    #[test]
    fn category_validation_rejects_bad_values() {
        let db = memory();
        assert_eq!(
            create_category_record(
                &db,
                CategoryInput {
                    name: " ".into(),
                    color: "#112233".into()
                }
            )
            .unwrap_err()
            .code,
            "validation"
        );
        assert_eq!(
            create_category_record(
                &db,
                CategoryInput {
                    name: "Valid".into(),
                    color: "red".into()
                }
            )
            .unwrap_err()
            .code,
            "validation"
        );
    }
    #[test]
    fn assigning_category_preserves_content_and_supports_null() {
        let mut db = memory();
        seed_categories(&mut db).unwrap();
        let category = list_categories(&db, true).unwrap().remove(0);
        let item = create_item(&mut db, "2026-07-19", None).unwrap();
        update_item(&db, update(&item.id, "Keep me", "in_progress")).unwrap();
        let moved = assign_item_category(&mut db, &item.id, Some(&category.id)).unwrap();
        assert_eq!(moved.task, "Keep me");
        assert_eq!(moved.category_id, Some(category.id));
        assert_eq!(
            assign_item_category(&mut db, &item.id, None)
                .unwrap()
                .category_id,
            None
        );
    }
    #[test]
    fn status_crossing_moves_to_end_of_destination_bucket() {
        let mut db = memory();
        let items = create_three(&mut db, "2026-07-19");
        update_item(&db, update(&items[0].id, "First", "completed")).unwrap();
        let second = update_item(&db, update(&items[1].id, "Second", "completed")).unwrap();
        assert!(second.position > 0);
        let restored = update_item(&db, update(&items[0].id, "First", "in_progress")).unwrap();
        assert!(restored.position >= 3);
        let ordered = find_daily_log(&db, "2026-07-19").unwrap().unwrap().items;
        assert_ne!(ordered[0].status, "completed");
    }
}
