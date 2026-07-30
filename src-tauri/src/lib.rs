use chrono::{NaiveDate, Utc};
use rusqlite::{params, Connection, OptionalExtension, Transaction, TransactionBehavior};
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::Manager;
use uuid::Uuid;
mod backup;

const MIGRATION_V1: &str = include_str!("../migrations/001_initial.sql");
const MIGRATION_V2: &str = include_str!("../migrations/002_app_settings.sql");
const MIGRATION_V3: &str = include_str!("../migrations/003_work_categories.sql");
const MIGRATION_V4: &str = include_str!("../migrations/004_backup_receipts.sql");
const MIGRATION_V5: &str = include_str!("../migrations/005_day_theme.sql");
const MIGRATION_V6: &str = include_str!("../migrations/006_day_personalization.sql");
const STATUSES: [&str; 4] = ["completed", "in_progress", "postponed", "cancelled"];
const THEME_KEY: &str = "appearance.themePreferences";
const LOCALE_KEY: &str = "localization.locale";
const INSTALLATION_BOOTSTRAP_KEY: &str = "installation.bootstrap";
const INSTALLATION_BOOTSTRAP_VERSION: u8 = 1;
static LOCALE_INITIALIZATION_LOCK: Mutex<()> = Mutex::new(());
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

mod error_code {
    pub const DATA_NOT_FOUND: &str = "data.not_found";
    pub const DATABASE_UNAVAILABLE: &str = "database.unavailable";
    pub const LOCALIZATION_UNSUPPORTED: &str = "localization.unsupported";
    pub const DATE_INVALID: &str = "date.invalid";
    pub const WORK_ITEM_TASK_TOO_LONG: &str = "work_item.task_too_long";
    pub const WORK_ITEM_RESULT_TOO_LONG: &str = "work_item.result_too_long";
    pub const WORK_ITEM_NEXT_ACTION_TOO_LONG: &str = "work_item.next_action_too_long";
    pub const WORK_ITEM_STATUS_INVALID: &str = "work_item.status_invalid";
    pub const WORK_ITEM_REORDER_EMPTY: &str = "work_item.reorder_empty";
    pub const WORK_ITEM_REORDER_INVALID: &str = "work_item.reorder_invalid";
    pub const CATEGORY_NAME_INVALID: &str = "category.name_invalid";
    pub const CATEGORY_COLOR_INVALID: &str = "category.color_invalid";
    pub const CATEGORY_REORDER_INVALID: &str = "category.reorder_invalid";
    pub const HISTORY_PAGINATION_INVALID: &str = "history.pagination_invalid";
    pub const DAY_THEME_METADATA_INVALID: &str = "day_theme.metadata_invalid";
    pub const THEME_INVALID: &str = "theme.invalid";
    pub const THEME_TOO_LARGE: &str = "theme.too_large";
    pub const THEME_SCHEMA_UNSUPPORTED: &str = "theme.schema_unsupported";
    pub const THEME_PALETTE_INVALID: &str = "theme.palette_invalid";
    pub const THEME_PALETTE_INCOMPLETE: &str = "theme.palette_incomplete";
    pub const THEME_COLOR_INVALID: &str = "theme.color_invalid";
    pub const THEME_STORED_CORRUPT: &str = "theme.stored_corrupt";
    pub const BACKUP_CREATE_FAILED: &str = "backup.create_failed";
    pub const BACKUP_FILE_READ_FAILED: &str = "backup.file_read_failed";
    pub const BACKUP_FILE_TOO_LARGE: &str = "backup.file_too_large";
    pub const BACKUP_JSON_INVALID: &str = "backup.json_invalid";
    pub const BACKUP_VERSION_MISSING: &str = "backup.version_missing";
    pub const BACKUP_VERSION_NEWER: &str = "backup.version_newer";
    pub const BACKUP_VERSION_UNSUPPORTED: &str = "backup.version_unsupported";
    pub const BACKUP_STRUCTURE_INVALID: &str = "backup.structure_invalid";
    pub const BACKUP_FORMAT_INVALID: &str = "backup.format_invalid";
    pub const BACKUP_TIMESTAMP_INVALID: &str = "backup.timestamp_invalid";
    pub const BACKUP_CHECKSUM_MISMATCH: &str = "backup.checksum_mismatch";
    pub const BACKUP_REFERENCE_INVALID: &str = "backup.reference_invalid";
    pub const BACKUP_DUPLICATE_ID: &str = "backup.duplicate_id";
    pub const BACKUP_THEME_INVALID: &str = "backup.theme_invalid";
    pub const BACKUP_DESTINATION_INVALID: &str = "backup.destination_invalid";
    pub const BACKUP_FILE_WRITE_FAILED: &str = "backup.file_write_failed";
    pub const BACKUP_MERGE_UNSAFE: &str = "backup.merge_unsafe";
    pub const BACKUP_MAPPING_MISSING: &str = "backup.mapping_missing";
    pub const BACKUP_REIMPORT_CONFIRMATION_REQUIRED: &str = "backup.reimport_confirmation_required";
    pub const BACKUP_RECEIPT_WRITE_FAILED: &str = "backup.receipt_write_failed";

    #[cfg(test)]
    pub const ALL: [&str; 42] = [
        DATA_NOT_FOUND,
        DATABASE_UNAVAILABLE,
        LOCALIZATION_UNSUPPORTED,
        DATE_INVALID,
        WORK_ITEM_TASK_TOO_LONG,
        WORK_ITEM_RESULT_TOO_LONG,
        WORK_ITEM_NEXT_ACTION_TOO_LONG,
        WORK_ITEM_STATUS_INVALID,
        WORK_ITEM_REORDER_EMPTY,
        WORK_ITEM_REORDER_INVALID,
        CATEGORY_NAME_INVALID,
        CATEGORY_COLOR_INVALID,
        CATEGORY_REORDER_INVALID,
        HISTORY_PAGINATION_INVALID,
        DAY_THEME_METADATA_INVALID,
        THEME_INVALID,
        THEME_TOO_LARGE,
        THEME_SCHEMA_UNSUPPORTED,
        THEME_PALETTE_INVALID,
        THEME_PALETTE_INCOMPLETE,
        THEME_COLOR_INVALID,
        THEME_STORED_CORRUPT,
        BACKUP_CREATE_FAILED,
        BACKUP_FILE_READ_FAILED,
        BACKUP_FILE_TOO_LARGE,
        BACKUP_JSON_INVALID,
        BACKUP_VERSION_MISSING,
        BACKUP_VERSION_NEWER,
        BACKUP_VERSION_UNSUPPORTED,
        BACKUP_STRUCTURE_INVALID,
        BACKUP_FORMAT_INVALID,
        BACKUP_TIMESTAMP_INVALID,
        BACKUP_CHECKSUM_MISMATCH,
        BACKUP_REFERENCE_INVALID,
        BACKUP_DUPLICATE_ID,
        BACKUP_THEME_INVALID,
        BACKUP_DESTINATION_INVALID,
        BACKUP_FILE_WRITE_FAILED,
        BACKUP_MERGE_UNSAFE,
        BACKUP_MAPPING_MISSING,
        BACKUP_REIMPORT_CONFIRMATION_REQUIRED,
        BACKUP_RECEIPT_WRITE_FAILED,
    ];
}

#[derive(Clone, Debug, Serialize, PartialEq)]
#[serde(untagged)]
pub(crate) enum AppErrorParam {
    String(String),
    Number(i64),
    Boolean(bool),
}
pub(crate) type AppErrorParams = BTreeMap<String, AppErrorParam>;

#[derive(Debug, Serialize)]
struct AppError {
    code: &'static str,
    params: AppErrorParams,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}
type AppResult<T> = Result<T, AppError>;
impl AppError {
    pub(crate) fn new(code: &'static str) -> Self {
        Self {
            code,
            params: BTreeMap::new(),
            message: Some("The operation could not be completed.".into()),
        }
    }
    pub(crate) fn with_number(mut self, name: &str, value: i64) -> Self {
        self.params
            .insert(name.into(), AppErrorParam::Number(value));
        self
    }
    #[allow(dead_code)]
    pub(crate) fn with_boolean(mut self, name: &str, value: bool) -> Self {
        self.params
            .insert(name.into(), AppErrorParam::Boolean(value));
        self
    }
    fn not_found() -> Self {
        Self::new(error_code::DATA_NOT_FOUND)
    }
    fn database() -> Self {
        Self::new(error_code::DATABASE_UNAVAILABLE)
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
    theme_id: Option<String>,
    theme_version: Option<i64>,
    cover_variant: Option<String>,
    day_symbol: Option<String>,
    journal_font_role: Option<String>,
    items: Vec<WorkItem>,
}
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct DayThemeMetadata {
    theme_id: Option<String>,
    theme_version: Option<i64>,
}
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct DayPersonalization {
    cover_variant: Option<String>,
    day_symbol: Option<String>,
    journal_font_role: Option<String>,
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
    theme_id: Option<String>,
    theme_version: Option<i64>,
    day_symbol: Option<String>,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HistoryPage {
    items: Vec<DailyLogSummary>,
    page: i64,
    page_size: i64,
    has_more: bool,
}
#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct CalendarDaySummary {
    date: String,
    has_log: bool,
    theme_id: Option<String>,
    theme_version: Option<i64>,
    day_symbol: Option<String>,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
enum InstallationClassification {
    Fresh,
    LegacyOrUnclassified,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct InstallationBootstrapMarker {
    version: u8,
    classification: InstallationClassification,
}

#[derive(Clone, Copy, Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
enum LocaleInitializationSource {
    Persisted,
    Fresh,
    Compatibility,
}

#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct LocaleInitializationResult {
    locale: &'static str,
    source: LocaleInitializationSource,
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
    apply_migration(&transaction, 4, MIGRATION_V4)?;
    apply_migration(&transaction, 5, MIGRATION_V5)?;
    apply_migration(&transaction, 6, MIGRATION_V6)?;
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
    let encoded =
        serde_json::to_string(value).map_err(|_| AppError::new(error_code::THEME_INVALID))?;
    if encoded.len() > 16_384 {
        return Err(AppError::new(error_code::THEME_TOO_LARGE).with_number("maxKiB", 16));
    }
    let object = value
        .as_object()
        .ok_or_else(|| AppError::new(error_code::THEME_INVALID))?;
    const OUTER_KEYS: [&str; 6] = [
        "selectedPresetId",
        "lightColors",
        "darkColors",
        "borderRadius",
        "updatedAt",
        "schemaVersion",
    ];
    let schema_version = object
        .get("schemaVersion")
        .and_then(serde_json::Value::as_i64)
        .ok_or_else(|| AppError::new(error_code::THEME_INVALID))?;
    if !matches!(schema_version, 1 | 2) {
        return Err(AppError::new(error_code::THEME_SCHEMA_UNSUPPORTED)
            .with_number("version", schema_version)
            .with_number("supportedVersion", 2));
    }
    if object.len() != OUTER_KEYS.len()
        || !OUTER_KEYS.iter().all(|key| object.contains_key(*key))
        || !matches!(object.get("selectedPresetId").and_then(serde_json::Value::as_str), Some(id) if !id.is_empty() && id.len() <= 40)
        || !matches!(
            object
                .get("borderRadius")
                .and_then(serde_json::Value::as_str),
            Some("square" | "subtle" | "rounded" | "soft")
        )
        || !matches!(object.get("updatedAt").and_then(serde_json::Value::as_str), Some(timestamp) if timestamp.len() <= 40 && chrono::DateTime::parse_from_rfc3339(timestamp).is_ok())
    {
        return Err(AppError::new(error_code::THEME_INVALID));
    }
    for palette_name in ["lightColors", "darkColors"] {
        let palette = object
            .get(palette_name)
            .and_then(serde_json::Value::as_object)
            .ok_or_else(|| AppError::new(error_code::THEME_PALETTE_INVALID))?;
        let required_keys = if schema_version == 1 {
            &THEME_COLOR_KEYS[..LEGACY_THEME_COLOR_COUNT]
        } else {
            &THEME_COLOR_KEYS[..]
        };
        if palette.len() != required_keys.len()
            || !required_keys.iter().all(|key| palette.contains_key(*key))
        {
            return Err(AppError::new(error_code::THEME_PALETTE_INCOMPLETE));
        }
        for key in required_keys {
            let color = palette
                .get(*key)
                .and_then(serde_json::Value::as_str)
                .ok_or_else(|| AppError::new(error_code::THEME_PALETTE_INCOMPLETE))?;
            if color.len() != 7
                || !color.starts_with('#')
                || !color[1..]
                    .chars()
                    .all(|character| character.is_ascii_hexdigit())
            {
                return Err(AppError::new(error_code::THEME_COLOR_INVALID));
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
            .ok_or_else(|| AppError::new(error_code::THEME_PALETTE_INVALID))?;
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
                .ok_or_else(|| AppError::new(error_code::THEME_PALETTE_INCOMPLETE))?;
            palette.insert(target.into(), color);
        }
    }
    value["schemaVersion"] = serde_json::json!(2);
    validate_theme_preferences(value)?;
    Ok(true)
}

fn save_theme(connection: &Connection, value: &serde_json::Value) -> AppResult<()> {
    validate_theme_preferences(value)?;
    let encoded =
        serde_json::to_string(value).map_err(|_| AppError::new(error_code::THEME_INVALID))?;
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
                .map_err(|_| AppError::new(error_code::THEME_STORED_CORRUPT))?;
            validate_theme_preferences(&value)
                .map_err(|_| AppError::new(error_code::THEME_STORED_CORRUPT))?;
            if upgrade_legacy_theme(&mut value)? {
                save_theme(connection, &value)?;
            }
            Ok(value)
        })
        .transpose()
}

fn load_locale(connection: &Connection) -> AppResult<Option<String>> {
    Ok(connection
        .query_row(
            "SELECT value FROM app_settings WHERE key = ?1",
            [LOCALE_KEY],
            |row| row.get(0),
        )
        .optional()?)
}

fn save_locale(connection: &Connection, locale: &str) -> AppResult<()> {
    if !matches!(locale, "vi" | "en") {
        return Err(AppError::new(error_code::LOCALIZATION_UNSUPPORTED));
    }
    connection.execute(
        "INSERT INTO app_settings (key,value,updated_at) VALUES (?1,?2,?3)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
        params![LOCALE_KEY, locale, Utc::now().to_rfc3339()],
    )?;
    Ok(())
}

fn load_setting(connection: &Connection, key: &str) -> AppResult<Option<String>> {
    Ok(connection
        .query_row(
            "SELECT value FROM app_settings WHERE key = ?1",
            [key],
            |row| row.get(0),
        )
        .optional()?)
}

fn upsert_setting(
    transaction: &Transaction<'_>,
    key: &str,
    value: &str,
    updated_at: &str,
) -> AppResult<()> {
    transaction.execute(
        "INSERT INTO app_settings (key,value,updated_at) VALUES (?1,?2,?3)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
        params![key, value, updated_at],
    )?;
    Ok(())
}

fn parse_installation_marker(value: Option<&str>) -> Option<InstallationClassification> {
    let marker: InstallationBootstrapMarker = serde_json::from_str(value?).ok()?;
    (marker.version == INSTALLATION_BOOTSTRAP_VERSION).then_some(marker.classification)
}

fn encode_installation_marker(classification: InstallationClassification) -> AppResult<String> {
    serde_json::to_string(&InstallationBootstrapMarker {
        version: INSTALLATION_BOOTSTRAP_VERSION,
        classification,
    })
    .map_err(|_| AppError::database())
}

fn normalize_windows_locale(value: Option<&str>) -> &'static str {
    let Some(value) = value.map(str::trim).filter(|value| !value.is_empty()) else {
        return "en";
    };
    let normalized = value.replace('_', "-").to_ascii_lowercase();
    if normalized == "vi" || normalized == "vi-vn" {
        "vi"
    } else {
        "en"
    }
}

fn initialize_locale_transaction<F>(
    connection: &mut Connection,
    database_existed_before_bootstrap: bool,
    windows_locale: Option<&str>,
    after_marker_write: F,
) -> AppResult<LocaleInitializationResult>
where
    F: FnOnce() -> rusqlite::Result<()>,
{
    let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let persisted_locale = load_setting(&transaction, LOCALE_KEY)?;
    let raw_marker = load_setting(&transaction, INSTALLATION_BOOTSTRAP_KEY)?;
    let valid_marker = parse_installation_marker(raw_marker.as_deref());
    let inferred_classification = if database_existed_before_bootstrap {
        InstallationClassification::LegacyOrUnclassified
    } else {
        InstallationClassification::Fresh
    };
    let classification = valid_marker.unwrap_or(inferred_classification);
    let now = Utc::now().to_rfc3339();

    if valid_marker.is_none() {
        let encoded = encode_installation_marker(classification)?;
        upsert_setting(&transaction, INSTALLATION_BOOTSTRAP_KEY, &encoded, &now)?;
    }

    let persisted = persisted_locale
        .as_deref()
        .filter(|locale| matches!(*locale, "vi" | "en"));
    let (locale, source) = if let Some(locale) = persisted {
        (
            if locale == "vi" { "vi" } else { "en" },
            LocaleInitializationSource::Persisted,
        )
    } else {
        after_marker_write()?;
        let locale = match classification {
            InstallationClassification::Fresh => normalize_windows_locale(windows_locale),
            InstallationClassification::LegacyOrUnclassified => "vi",
        };
        upsert_setting(&transaction, LOCALE_KEY, locale, &now)?;
        let source = match classification {
            InstallationClassification::Fresh => LocaleInitializationSource::Fresh,
            InstallationClassification::LegacyOrUnclassified => {
                LocaleInitializationSource::Compatibility
            }
        };
        (locale, source)
    };

    transaction.commit()?;
    Ok(LocaleInitializationResult { locale, source })
}

fn initialize_locale_at_path(
    path: &Path,
    windows_locale: Option<&str>,
) -> AppResult<LocaleInitializationResult> {
    let _guard = LOCALE_INITIALIZATION_LOCK
        .lock()
        .map_err(|_| AppError::database())?;
    let database_existed_before_bootstrap = path.try_exists().map_err(|_| AppError::database())?;
    let mut connection = open_database(path)?;
    initialize_locale_transaction(
        &mut connection,
        database_existed_before_bootstrap,
        windows_locale,
        || Ok(()),
    )
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
    seed_categories(&mut connection)?;
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
        .map_err(|_| AppError::new(error_code::DATE_INVALID))
}
fn validate_text(input: &UpdateWorkItem) -> AppResult<()> {
    if input.task.chars().count() > 500 {
        return Err(AppError::new(error_code::WORK_ITEM_TASK_TOO_LONG).with_number("max", 500));
    }
    if input.result.chars().count() > 2_000 {
        return Err(AppError::new(error_code::WORK_ITEM_RESULT_TOO_LONG).with_number("max", 2_000));
    }
    if input.next_action.chars().count() > 1_000 {
        return Err(
            AppError::new(error_code::WORK_ITEM_NEXT_ACTION_TOO_LONG).with_number("max", 1_000)
        );
    }
    if !STATUSES.contains(&input.status.as_str()) {
        return Err(AppError::new(error_code::WORK_ITEM_STATUS_INVALID));
    }
    Ok(())
}
fn valid_day_theme_id(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 64
        && value
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
        && !value.starts_with('-')
        && !value.ends_with('-')
        && !value.contains("--")
}
fn validate_day_theme_metadata(
    theme_id: Option<&str>,
    theme_version: Option<i64>,
) -> AppResult<()> {
    match (theme_id, theme_version) {
        (None, None) => Ok(()),
        (Some(id), Some(version)) if valid_day_theme_id(id) && version > 0 => Ok(()),
        _ => Err(AppError::new(error_code::DAY_THEME_METADATA_INVALID)),
    }
}
fn validate_day_personalization(value: &DayPersonalization) -> AppResult<()> {
    let cover_valid = matches!(value.cover_variant.as_deref(), None | Some("minimal"));
    let symbol_valid = matches!(
        value.day_symbol.as_deref(),
        None | Some("none" | "sparkle" | "focus" | "growth" | "calm" | "celebrate")
    );
    let font_valid = matches!(
        value.journal_font_role.as_deref(),
        None | Some("ui" | "journal")
    );
    if cover_valid && symbol_valid && font_valid {
        Ok(())
    } else {
        Err(AppError::new(error_code::DAY_THEME_METADATA_INVALID))
    }
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
            "SELECT id,log_date,created_at,updated_at,theme_id,theme_version,
                    cover_variant,day_symbol,journal_font_role
             FROM daily_logs WHERE log_date=?1",
            [date],
            |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                    row.get(5)?,
                    row.get(6)?,
                    row.get(7)?,
                    row.get(8)?,
                ))
            },
        )
        .optional()?;
    let Some((
        id,
        log_date,
        created_at,
        updated_at,
        theme_id,
        theme_version,
        cover_variant,
        day_symbol,
        journal_font_role,
    )) = header
    else {
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
        theme_id,
        theme_version,
        cover_variant,
        day_symbol,
        journal_font_role,
        items,
    }))
}
fn update_day_theme_metadata(
    connection: &mut Connection,
    daily_log_id: &str,
    metadata: DayThemeMetadata,
) -> AppResult<DayThemeMetadata> {
    validate_day_theme_metadata(metadata.theme_id.as_deref(), metadata.theme_version)?;
    let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let changed = transaction.execute(
        "UPDATE daily_logs
         SET theme_id=?1,theme_version=?2,updated_at=?3
         WHERE id=?4",
        params![
            metadata.theme_id.as_deref(),
            metadata.theme_version,
            Utc::now().to_rfc3339(),
            daily_log_id
        ],
    )?;
    if changed == 0 {
        return Err(AppError::not_found());
    }
    transaction.commit()?;
    Ok(metadata)
}
fn set_day_theme_for_date(
    connection: &mut Connection,
    date: &str,
    metadata: DayThemeMetadata,
) -> AppResult<DailyLog> {
    validate_day_theme_metadata(metadata.theme_id.as_deref(), metadata.theme_version)?;
    let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let daily_log_id = ensure_daily_log(&transaction, date)?;
    transaction.execute(
        "UPDATE daily_logs
         SET theme_id=?1,theme_version=?2,updated_at=?3
         WHERE id=?4",
        params![
            metadata.theme_id.as_deref(),
            metadata.theme_version,
            Utc::now().to_rfc3339(),
            daily_log_id
        ],
    )?;
    transaction.commit()?;
    find_daily_log(connection, date)?.ok_or_else(AppError::not_found)
}
fn set_day_personalization_for_date(
    connection: &mut Connection,
    date: &str,
    personalization: DayPersonalization,
) -> AppResult<Option<DailyLog>> {
    validate_date(date)?;
    validate_day_personalization(&personalization)?;
    let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let existing_id = transaction
        .query_row(
            "SELECT id FROM daily_logs WHERE log_date=?1",
            [date],
            |row| row.get::<_, String>(0),
        )
        .optional()?;
    if existing_id.is_none()
        && personalization.cover_variant.is_none()
        && personalization.day_symbol.is_none()
        && personalization.journal_font_role.is_none()
    {
        transaction.commit()?;
        return Ok(None);
    }
    let daily_log_id = match existing_id {
        Some(id) => id,
        None => ensure_daily_log(&transaction, date)?,
    };
    transaction.execute(
        "UPDATE daily_logs
         SET cover_variant=?1,day_symbol=?2,journal_font_role=?3,updated_at=?4
         WHERE id=?5",
        params![
            personalization.cover_variant.as_deref(),
            personalization.day_symbol.as_deref(),
            personalization.journal_font_role.as_deref(),
            Utc::now().to_rfc3339(),
            daily_log_id
        ],
    )?;
    transaction.commit()?;
    find_daily_log(connection, date)
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
        return Err(AppError::new(error_code::CATEGORY_NAME_INVALID)
            .with_number("min", 1)
            .with_number("max", 100));
    }
    if color.len() != 7
        || !color.starts_with('#')
        || !color[1..].chars().all(|c| c.is_ascii_hexdigit())
    {
        return Err(AppError::new(error_code::CATEGORY_COLOR_INVALID));
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
        return Err(AppError::new(error_code::CATEGORY_REORDER_INVALID));
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
        return Err(AppError::new(error_code::WORK_ITEM_REORDER_EMPTY));
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
        return Err(AppError::new(error_code::WORK_ITEM_REORDER_INVALID));
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
        return Err(AppError::new(error_code::HISTORY_PAGINATION_INVALID));
    }
    let offset = (page - 1) * page_size;
    let mut statement = connection.prepare(
        "SELECT d.id,d.log_date,COUNT(w.id),
                COALESCE(SUM(CASE WHEN w.status='completed' THEN 1 ELSE 0 END),0),
                d.updated_at,d.theme_id,d.theme_version,d.day_symbol,
                COALESCE((
                  SELECT json_group_array(preview.task)
                  FROM (
                    SELECT preview.task
                    FROM work_items preview
                    WHERE preview.daily_log_id=d.id AND TRIM(preview.task)<>''
                    ORDER BY preview.position,preview.created_at,preview.id
                    LIMIT 3
                  ) preview
                ),'[]')
         FROM daily_logs d JOIN work_items w ON w.daily_log_id=d.id
         GROUP BY d.id,d.log_date,d.updated_at,d.theme_id,d.theme_version,d.day_symbol
         ORDER BY d.log_date DESC LIMIT ?1 OFFSET ?2",
    )?;
    let rows = statement.query_map(params![page_size + 1, offset], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
            row.get::<_, i64>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, Option<String>>(5)?,
            row.get::<_, Option<i64>>(6)?,
            row.get::<_, Option<String>>(7)?,
            row.get::<_, String>(8)?,
        ))
    })?;
    let mut raw = rows.collect::<rusqlite::Result<Vec<_>>>()?;
    let has_more = raw.len() > page_size as usize;
    raw.truncate(page_size as usize);
    let mut items = Vec::with_capacity(raw.len());
    for (
        id,
        log_date,
        total_items,
        completed_items,
        updated_at,
        theme_id,
        theme_version,
        day_symbol,
        preview_tasks_json,
    ) in raw
    {
        let preview_tasks =
            serde_json::from_str(&preview_tasks_json).map_err(|_| AppError::database())?;
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
            theme_id,
            theme_version,
            day_symbol,
        });
    }
    Ok(HistoryPage {
        items,
        page,
        page_size,
        has_more,
    })
}
fn list_calendar_summaries(
    connection: &Connection,
    start_date: &str,
    end_date_exclusive: &str,
) -> AppResult<Vec<CalendarDaySummary>> {
    let start = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")
        .map_err(|_| AppError::new(error_code::DATE_INVALID))?;
    let end = NaiveDate::parse_from_str(end_date_exclusive, "%Y-%m-%d")
        .map_err(|_| AppError::new(error_code::DATE_INVALID))?;
    if start >= end {
        return Err(AppError::new(error_code::DATE_INVALID));
    }
    let mut statement = connection.prepare(
        "SELECT log_date,theme_id,theme_version,day_symbol
         FROM daily_logs
         WHERE log_date>=?1 AND log_date<?2
         ORDER BY log_date",
    )?;
    let summaries = statement
        .query_map(params![start_date, end_date_exclusive], |row| {
            Ok(CalendarDaySummary {
                date: row.get(0)?,
                has_log: true,
                theme_id: row.get(1)?,
                theme_version: row.get(2)?,
                day_symbol: row.get(3)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(summaries)
}
fn list_activity_dates(connection: &Connection) -> AppResult<Vec<String>> {
    let mut statement = connection.prepare(
        "SELECT DISTINCT d.log_date
         FROM daily_logs d
         JOIN work_items w ON w.daily_log_id=d.id
         WHERE TRIM(w.task,
           char(9)||char(10)||char(11)||char(12)||char(13)||char(32)||char(133)||char(160)||
           char(5760)||char(8192)||char(8193)||char(8194)||char(8195)||char(8196)||char(8197)||
           char(8198)||char(8199)||char(8200)||char(8201)||char(8202)||char(8232)||char(8233)||
           char(8239)||char(8287)||char(12288)
         )<>''
         ORDER BY d.log_date",
    )?;
    let dates = statement
        .query_map([], |row| row.get(0))?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(dates)
}

#[tauri::command]
fn initialize_database(app: tauri::AppHandle) -> AppResult<()> {
    open_database(&database_path(&app)?)?;
    Ok(())
}
#[tauri::command]
fn initialize_locale_preference(
    app: tauri::AppHandle,
    os_locale: Option<String>,
) -> AppResult<LocaleInitializationResult> {
    initialize_locale_at_path(&database_path(&app)?, os_locale.as_deref())
}
#[tauri::command]
fn get_daily_log(app: tauri::AppHandle, date: String) -> AppResult<Option<DailyLog>> {
    find_daily_log(&open_database(&database_path(&app)?)?, &date)
}
#[tauri::command]
fn update_daily_log_day_theme(
    app: tauri::AppHandle,
    daily_log_id: String,
    theme_id: Option<String>,
    theme_version: Option<i64>,
) -> AppResult<DayThemeMetadata> {
    update_day_theme_metadata(
        &mut open_database(&database_path(&app)?)?,
        &daily_log_id,
        DayThemeMetadata {
            theme_id,
            theme_version,
        },
    )
}
#[tauri::command]
fn set_daily_log_day_theme(
    app: tauri::AppHandle,
    date: String,
    theme_id: Option<String>,
    theme_version: Option<i64>,
) -> AppResult<DailyLog> {
    set_day_theme_for_date(
        &mut open_database(&database_path(&app)?)?,
        &date,
        DayThemeMetadata {
            theme_id,
            theme_version,
        },
    )
}
#[tauri::command]
fn set_daily_log_personalization(
    app: tauri::AppHandle,
    date: String,
    cover_variant: Option<String>,
    day_symbol: Option<String>,
    journal_font_role: Option<String>,
) -> AppResult<Option<DailyLog>> {
    set_day_personalization_for_date(
        &mut open_database(&database_path(&app)?)?,
        &date,
        DayPersonalization {
            cover_variant,
            day_symbol,
            journal_font_role,
        },
    )
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
fn list_calendar_day_summaries(
    app: tauri::AppHandle,
    start_date: String,
    end_date_exclusive: String,
) -> AppResult<Vec<CalendarDaySummary>> {
    list_calendar_summaries(
        &open_database(&database_path(&app)?)?,
        &start_date,
        &end_date_exclusive,
    )
}
#[tauri::command]
fn list_journal_activity_dates(app: tauri::AppHandle) -> AppResult<Vec<String>> {
    list_activity_dates(&open_database(&database_path(&app)?)?)
}
#[tauri::command]
fn get_theme_preferences(app: tauri::AppHandle) -> AppResult<Option<serde_json::Value>> {
    load_theme(&open_database(&database_path(&app)?)?)
}
#[tauri::command]
fn save_theme_preferences(app: tauri::AppHandle, preferences: serde_json::Value) -> AppResult<()> {
    save_theme(&open_database(&database_path(&app)?)?, &preferences)
}

#[tauri::command]
fn get_locale_preference(app: tauri::AppHandle) -> AppResult<Option<String>> {
    load_locale(&open_database(&database_path(&app)?)?)
}

#[tauri::command]
fn save_locale_preference(app: tauri::AppHandle, locale: String) -> AppResult<()> {
    save_locale(&open_database(&database_path(&app)?)?, &locale)
}

#[tauri::command]
fn export_backup(app: tauri::AppHandle, path: String) -> AppResult<backup::ExportResult> {
    backup::export(&database_path(&app)?, Path::new(&path))
}

#[tauri::command]
fn preview_backup(app: tauri::AppHandle, path: String) -> AppResult<backup::ImportPreview> {
    backup::preview(&database_path(&app)?, Path::new(&path))
}

#[tauri::command]
fn import_backup(
    app: tauri::AppHandle,
    path: String,
    mode: backup::ImportMode,
    apply_theme: bool,
    confirm_reimport: bool,
) -> AppResult<backup::ImportResult> {
    backup::import(
        &database_path(&app)?,
        Path::new(&path),
        mode,
        apply_theme,
        confirm_reimport,
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            initialize_database,
            initialize_locale_preference,
            get_daily_log,
            update_daily_log_day_theme,
            set_daily_log_day_theme,
            set_daily_log_personalization,
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
            list_calendar_day_summaries,
            list_journal_activity_dates,
            get_theme_preferences,
            save_theme_preferences,
            get_locale_preference,
            save_locale_preference,
            export_backup,
            preview_backup,
            import_backup
        ])
        .run(tauri::generate_context!())
        .expect("error while running Done Today");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[derive(Deserialize)]
    struct ErrorCodeContract {
        errors: Vec<String>,
        warnings: Vec<String>,
    }

    #[test]
    fn structured_error_contract_matches_shared_code_matrix() {
        let contract: ErrorCodeContract =
            serde_json::from_str(include_str!("../../contracts/app-error-codes.json")).unwrap();
        assert_eq!(contract.errors, error_code::ALL);
        assert_eq!(contract.warnings, backup::warning_code::ALL);
    }

    #[test]
    fn app_error_serializes_scalar_params_without_internal_details() {
        let error = AppError::new(error_code::WORK_ITEM_TASK_TOO_LONG)
            .with_number("max", 500)
            .with_boolean("retryable", false);
        let value = serde_json::to_value(error).unwrap();
        assert_eq!(value["code"], error_code::WORK_ITEM_TASK_TOO_LONG);
        assert_eq!(value["params"]["max"], 500);
        assert_eq!(value["params"]["retryable"], false);
        let encoded = value.to_string().to_lowercase();
        for unsafe_fragment in ["sqlite", "select ", "c:\\", "stack"] {
            assert!(!encoded.contains(unsafe_fragment));
        }
    }

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
        assert_eq!(
            db.query_row("SELECT MAX(version) FROM schema_migrations", [], |row| {
                row.get::<_, i64>(0)
            })
            .unwrap(),
            6
        );
    }
    #[test]
    fn migration_v5_upgrades_the_full_baseline_without_rewriting_data() {
        let mut db = Connection::open_in_memory().unwrap();
        {
            let tx = db.transaction().unwrap();
            tx.execute_batch(
                "CREATE TABLE schema_migrations(
                    version INTEGER PRIMARY KEY,
                    applied_at TEXT NOT NULL
                );",
            )
            .unwrap();
            apply_migration(&tx, 1, MIGRATION_V1).unwrap();
            apply_migration(&tx, 2, MIGRATION_V2).unwrap();
            apply_migration(&tx, 3, MIGRATION_V3).unwrap();
            apply_migration(&tx, 4, MIGRATION_V4).unwrap();
            tx.commit().unwrap();
        }
        let now = "2026-07-19T00:00:00Z";
        db.execute(
            "INSERT INTO daily_logs(id,log_date,created_at,updated_at)
             VALUES('log','2026-07-19',?1,?1)",
            [now],
        )
        .unwrap();
        db.execute(
            "INSERT INTO work_categories(
                id,name,color,position,is_active,created_at,updated_at
             ) VALUES('category','Existing','#4F7CAC',0,1,?1,?1)",
            [now],
        )
        .unwrap();
        db.execute(
            "INSERT INTO work_items(
                id,daily_log_id,task,result,next_action,status,position,category_id,created_at,updated_at
             ) VALUES('item','log','Task','Result','Next','completed',0,'category',?1,?1)",
            [now],
        )
        .unwrap();
        db.execute(
            "INSERT INTO app_settings(key,value,updated_at)
             VALUES('test.setting','preserved',?1)",
            [now],
        )
        .unwrap();
        db.execute(
            "INSERT INTO backup_import_receipts(
                id,checksum,imported_at,mode,source_exported_at,result_summary_json
             ) VALUES('receipt','sha256:legacy',?1,'merge',?1,'{}')",
            [now],
        )
        .unwrap();

        migrate(&mut db).unwrap();
        migrate(&mut db).unwrap();
        let columns: Vec<String> = {
            let mut statement = db.prepare("PRAGMA table_info(daily_logs)").unwrap();
            statement
                .query_map([], |row| row.get(1))
                .unwrap()
                .collect::<rusqlite::Result<Vec<_>>>()
                .unwrap()
        };
        assert!(columns.contains(&"theme_id".into()));
        assert!(columns.contains(&"theme_version".into()));
        assert!(columns.contains(&"cover_variant".into()));
        assert!(columns.contains(&"day_symbol".into()));
        assert!(columns.contains(&"journal_font_role".into()));
        assert_eq!(
            db.query_row(
                "SELECT theme_id,theme_version FROM daily_logs WHERE id='log'",
                [],
                |row| Ok((
                    row.get::<_, Option<String>>(0)?,
                    row.get::<_, Option<i64>>(1)?
                ))
            )
            .unwrap(),
            (None, None)
        );
        assert_eq!(
            db.query_row(
                "SELECT cover_variant,day_symbol,journal_font_role
                 FROM daily_logs WHERE id='log'",
                [],
                |row| Ok((
                    row.get::<_, Option<String>>(0)?,
                    row.get::<_, Option<String>>(1)?,
                    row.get::<_, Option<String>>(2)?
                ))
            )
            .unwrap(),
            (None, None, None)
        );
        assert_eq!(
            db.query_row(
                "SELECT task,result,next_action,status,position,category_id
                 FROM work_items WHERE id='item'",
                [],
                |row| Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, i64>(4)?,
                    row.get::<_, String>(5)?
                ))
            )
            .unwrap(),
            (
                "Task".into(),
                "Result".into(),
                "Next".into(),
                "completed".into(),
                0,
                "category".into()
            )
        );
        assert_eq!(
            db.query_row(
                "SELECT value FROM app_settings WHERE key='test.setting'",
                [],
                |row| row.get::<_, String>(0)
            )
            .unwrap(),
            "preserved"
        );
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM backup_import_receipts", [], |row| {
                row.get::<_, i64>(0)
            })
            .unwrap(),
            1
        );
    }
    #[test]
    fn day_theme_metadata_persists_unknown_valid_ids_and_clears_atomically() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        assert_eq!(
            find_daily_log(&db, "2026-07-18").unwrap().unwrap().theme_id,
            None
        );
        let saved = update_day_theme_metadata(
            &mut db,
            &item.daily_log_id,
            DayThemeMetadata {
                theme_id: Some("future-theme".into()),
                theme_version: Some(7),
            },
        )
        .unwrap();
        assert_eq!(
            saved,
            DayThemeMetadata {
                theme_id: Some("future-theme".into()),
                theme_version: Some(7)
            }
        );
        let log = find_daily_log(&db, "2026-07-18").unwrap().unwrap();
        assert_eq!(log.theme_id.as_deref(), Some("future-theme"));
        assert_eq!(log.theme_version, Some(7));
        assert_eq!(log.items.len(), 1);

        update_day_theme_metadata(
            &mut db,
            &item.daily_log_id,
            DayThemeMetadata {
                theme_id: None,
                theme_version: None,
            },
        )
        .unwrap();
        let log = find_daily_log(&db, "2026-07-18").unwrap().unwrap();
        assert_eq!((log.theme_id, log.theme_version), (None, None));
        assert_eq!(log.items.len(), 1);
    }
    #[test]
    fn date_scoped_day_theme_write_creates_only_one_minimal_log() {
        let mut db = memory();
        let first = set_day_theme_for_date(
            &mut db,
            "2026-07-29",
            DayThemeMetadata {
                theme_id: Some("rainy".into()),
                theme_version: Some(1),
            },
        )
        .unwrap();
        assert_eq!(first.log_date, "2026-07-29");
        assert_eq!(first.theme_id.as_deref(), Some("rainy"));
        assert_eq!(first.theme_version, Some(1));
        assert!(first.items.is_empty());

        let second = set_day_theme_for_date(
            &mut db,
            "2026-07-29",
            DayThemeMetadata {
                theme_id: Some("coffee".into()),
                theme_version: Some(1),
            },
        )
        .unwrap();
        assert_eq!(second.id, first.id);
        assert_eq!(second.theme_id.as_deref(), Some("coffee"));
        assert_eq!(
            db.query_row(
                "SELECT COUNT(*) FROM daily_logs WHERE log_date='2026-07-29'",
                [],
                |row| row.get::<_, i64>(0)
            )
            .unwrap(),
            1
        );

        let cleared = set_day_theme_for_date(
            &mut db,
            "2026-07-29",
            DayThemeMetadata {
                theme_id: None,
                theme_version: None,
            },
        )
        .unwrap();
        assert_eq!((cleared.theme_id, cleared.theme_version), (None, None));
        assert!(cleared.items.is_empty());
    }
    #[test]
    fn day_personalization_is_atomic_and_respects_empty_day_semantics() {
        let mut db = memory();
        let defaults = DayPersonalization {
            cover_variant: None,
            day_symbol: None,
            journal_font_role: None,
        };
        assert!(
            set_day_personalization_for_date(&mut db, "2026-07-29", defaults)
                .unwrap()
                .is_none()
        );
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM daily_logs", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            0
        );

        let saved = set_day_personalization_for_date(
            &mut db,
            "2026-07-29",
            DayPersonalization {
                cover_variant: Some("minimal".into()),
                day_symbol: Some("focus".into()),
                journal_font_role: Some("journal".into()),
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!(saved.cover_variant.as_deref(), Some("minimal"));
        assert_eq!(saved.day_symbol.as_deref(), Some("focus"));
        assert_eq!(saved.journal_font_role.as_deref(), Some("journal"));
        assert!(saved.items.is_empty());
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM daily_logs", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            1
        );

        set_day_theme_for_date(
            &mut db,
            "2026-07-29",
            DayThemeMetadata {
                theme_id: Some("coffee".into()),
                theme_version: Some(1),
            },
        )
        .unwrap();
        let reset = set_day_personalization_for_date(
            &mut db,
            "2026-07-29",
            DayPersonalization {
                cover_variant: None,
                day_symbol: None,
                journal_font_role: None,
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!(
            (
                reset.cover_variant,
                reset.day_symbol,
                reset.journal_font_role
            ),
            (None, None, None)
        );
        assert_eq!(
            (reset.theme_id.as_deref(), reset.theme_version),
            (Some("coffee"), Some(1))
        );
    }
    #[test]
    fn day_personalization_rejects_unknown_direct_writes_without_mutation() {
        let mut db = memory();
        let error = set_day_personalization_for_date(
            &mut db,
            "2026-07-29",
            DayPersonalization {
                cover_variant: Some("future-cover".into()),
                day_symbol: None,
                journal_font_role: None,
            },
        )
        .unwrap_err();
        assert_eq!(error.code, error_code::DAY_THEME_METADATA_INVALID);
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM daily_logs", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            0
        );
    }
    #[test]
    fn day_theme_metadata_rejects_invalid_pairs_without_changing_the_log() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        for metadata in [
            DayThemeMetadata {
                theme_id: Some("valid-theme".into()),
                theme_version: None,
            },
            DayThemeMetadata {
                theme_id: None,
                theme_version: Some(1),
            },
            DayThemeMetadata {
                theme_id: Some("".into()),
                theme_version: Some(1),
            },
            DayThemeMetadata {
                theme_id: Some("Bad ID".into()),
                theme_version: Some(1),
            },
            DayThemeMetadata {
                theme_id: Some("x".repeat(65)),
                theme_version: Some(1),
            },
            DayThemeMetadata {
                theme_id: Some("valid-theme".into()),
                theme_version: Some(0),
            },
            DayThemeMetadata {
                theme_id: Some("valid-theme".into()),
                theme_version: Some(-1),
            },
        ] {
            assert_eq!(
                update_day_theme_metadata(&mut db, &item.daily_log_id, metadata)
                    .unwrap_err()
                    .code,
                error_code::DAY_THEME_METADATA_INVALID
            );
        }
        assert_eq!(
            db.query_row(
                "SELECT theme_id,theme_version FROM daily_logs WHERE id=?1",
                [&item.daily_log_id],
                |row| Ok((
                    row.get::<_, Option<String>>(0)?,
                    row.get::<_, Option<i64>>(1)?
                ))
            )
            .unwrap(),
            (None, None)
        );
    }
    #[test]
    fn concurrent_day_theme_writes_never_leave_a_partial_pair() {
        use std::sync::{Arc, Barrier};
        use std::thread;
        use std::time::Duration;

        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("concurrent-day-theme.sqlite3");
        let daily_log_id = {
            let mut db = open_database(&path).unwrap();
            create_item(&mut db, "2026-07-18", None)
                .unwrap()
                .daily_log_id
        };
        let barrier = Arc::new(Barrier::new(3));
        let mut handles = Vec::new();
        for metadata in [
            DayThemeMetadata {
                theme_id: Some("future-theme".into()),
                theme_version: Some(2),
            },
            DayThemeMetadata {
                theme_id: None,
                theme_version: None,
            },
        ] {
            let path = path.clone();
            let daily_log_id = daily_log_id.clone();
            let barrier = Arc::clone(&barrier);
            handles.push(thread::spawn(move || {
                let mut db = Connection::open(path).unwrap();
                db.busy_timeout(Duration::from_secs(2)).unwrap();
                barrier.wait();
                update_day_theme_metadata(&mut db, &daily_log_id, metadata)
            }));
        }
        barrier.wait();
        for handle in handles {
            handle.join().unwrap().unwrap();
        }
        let db = Connection::open(path).unwrap();
        let pair = db
            .query_row(
                "SELECT theme_id,theme_version FROM daily_logs WHERE id=?1",
                [&daily_log_id],
                |row| {
                    Ok((
                        row.get::<_, Option<String>>(0)?,
                        row.get::<_, Option<i64>>(1)?,
                    ))
                },
            )
            .unwrap();
        validate_day_theme_metadata(pair.0.as_deref(), pair.1).unwrap();
    }
    #[test]
    fn locale_setting_persists_and_rejects_unsupported_values() {
        let db = memory();
        assert_eq!(load_locale(&db).unwrap(), None);
        save_locale(&db, "en").unwrap();
        assert_eq!(load_locale(&db).unwrap().as_deref(), Some("en"));
        let error = save_locale(&db, "fr").unwrap_err();
        assert_eq!(error.code, error_code::LOCALIZATION_UNSUPPORTED);
        assert!(error.params.is_empty());
        assert_eq!(load_locale(&db).unwrap().as_deref(), Some("en"));
    }
    #[test]
    fn windows_locale_normalization_uses_vietnamese_only_for_supported_vietnamese_tags() {
        for value in ["vi", "vi-VN", "VI-vn", "vi_VN"] {
            assert_eq!(normalize_windows_locale(Some(value)), "vi");
        }
        for value in [
            "en",
            "en-US",
            "en-GB",
            "EN_us",
            "fr-FR",
            "de-DE",
            "ja-JP",
            "",
            " ",
            "vi--VN",
            "vietnamese",
        ] {
            assert_eq!(normalize_windows_locale(Some(value)), "en");
        }
        assert_eq!(normalize_windows_locale(None), "en");
    }
    #[test]
    fn fresh_database_persists_os_locale_and_reopen_keeps_it() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("fresh.sqlite3");
        let first = initialize_locale_at_path(&path, Some("en-US")).unwrap();
        assert_eq!(
            first,
            LocaleInitializationResult {
                locale: "en",
                source: LocaleInitializationSource::Fresh
            }
        );
        let reopened = initialize_locale_at_path(&path, Some("vi-VN")).unwrap();
        assert_eq!(
            reopened,
            LocaleInitializationResult {
                locale: "en",
                source: LocaleInitializationSource::Persisted
            }
        );
        let db = Connection::open(path).unwrap();
        assert_eq!(load_locale(&db).unwrap().as_deref(), Some("en"));
        assert_eq!(
            parse_installation_marker(
                load_setting(&db, INSTALLATION_BOOTSTRAP_KEY)
                    .unwrap()
                    .as_deref()
            ),
            Some(InstallationClassification::Fresh)
        );
    }
    #[test]
    fn fresh_database_uses_vietnamese_windows_locale_and_unsupported_falls_back_to_english() {
        for (name, os_locale, expected) in [
            ("vi.sqlite3", Some("vi-VN"), "vi"),
            ("unsupported.sqlite3", Some("fr-FR"), "en"),
            ("missing.sqlite3", None, "en"),
        ] {
            let directory = tempfile::tempdir().unwrap();
            let result =
                initialize_locale_at_path(&directory.path().join(name), os_locale).unwrap();
            assert_eq!(result.locale, expected);
            assert_eq!(result.source, LocaleInitializationSource::Fresh);
        }
    }
    #[test]
    fn existing_database_without_locale_is_classified_conservatively_and_preserves_data() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("legacy.sqlite3");
        let original_theme = theme_value();
        {
            let mut db = open_database(&path).unwrap();
            let item = create_item(&mut db, "2026-07-19", None).unwrap();
            update_item(&db, update(&item.id, "Legacy journal", "completed")).unwrap();
            save_theme(&db, &original_theme).unwrap();
            db.execute(
                "INSERT INTO backup_import_receipts VALUES('receipt','sha256:legacy','2026-07-19T00:00:00Z','merge',NULL,'{}')",
                [],
            )
            .unwrap();
        }
        let result = initialize_locale_at_path(&path, Some("en-US")).unwrap();
        assert_eq!(
            result,
            LocaleInitializationResult {
                locale: "vi",
                source: LocaleInitializationSource::Compatibility
            }
        );
        let db = Connection::open(path).unwrap();
        assert_eq!(load_locale(&db).unwrap().as_deref(), Some("vi"));
        assert_eq!(
            parse_installation_marker(
                load_setting(&db, INSTALLATION_BOOTSTRAP_KEY)
                    .unwrap()
                    .as_deref()
            ),
            Some(InstallationClassification::LegacyOrUnclassified)
        );
        assert_eq!(
            db.query_row(
                "SELECT task FROM work_items WHERE task='Legacy journal'",
                [],
                |row| row.get::<_, String>(0)
            )
            .unwrap(),
            "Legacy journal"
        );
        assert_eq!(load_theme(&db).unwrap(), Some(original_theme));
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM backup_import_receipts", [], |row| {
                row.get::<_, i64>(0)
            })
            .unwrap(),
            1
        );
    }
    #[test]
    fn persisted_locale_is_authoritative_and_repairs_missing_or_corrupt_marker() {
        for (marker, expected_classification) in [
            (None, InstallationClassification::LegacyOrUnclassified),
            (
                Some(r#"{"version":99,"classification":"fresh"}"#),
                InstallationClassification::LegacyOrUnclassified,
            ),
        ] {
            let directory = tempfile::tempdir().unwrap();
            let path = directory.path().join("persisted.sqlite3");
            {
                let db = open_database(&path).unwrap();
                save_locale(&db, "en").unwrap();
                if let Some(marker) = marker {
                    db.execute(
                        "INSERT INTO app_settings(key,value,updated_at)VALUES(?1,?2,?3)",
                        params![INSTALLATION_BOOTSTRAP_KEY, marker, Utc::now().to_rfc3339()],
                    )
                    .unwrap();
                }
            }
            let result = initialize_locale_at_path(&path, Some("vi-VN")).unwrap();
            assert_eq!(result.locale, "en");
            assert_eq!(result.source, LocaleInitializationSource::Persisted);
            let db = Connection::open(path).unwrap();
            assert_eq!(
                parse_installation_marker(
                    load_setting(&db, INSTALLATION_BOOTSTRAP_KEY)
                        .unwrap()
                        .as_deref()
                ),
                Some(expected_classification)
            );
        }
    }
    #[test]
    fn marker_controls_missing_or_invalid_locale_resolution() {
        for (classification, stored_locale, os_locale, expected, source) in [
            (
                InstallationClassification::Fresh,
                None,
                Some("vi-VN"),
                "vi",
                LocaleInitializationSource::Fresh,
            ),
            (
                InstallationClassification::Fresh,
                Some("invalid"),
                Some("en-US"),
                "en",
                LocaleInitializationSource::Fresh,
            ),
            (
                InstallationClassification::LegacyOrUnclassified,
                None,
                Some("en-US"),
                "vi",
                LocaleInitializationSource::Compatibility,
            ),
        ] {
            let directory = tempfile::tempdir().unwrap();
            let path = directory.path().join("classified.sqlite3");
            {
                let db = open_database(&path).unwrap();
                let marker = encode_installation_marker(classification).unwrap();
                db.execute(
                    "INSERT INTO app_settings(key,value,updated_at)VALUES(?1,?2,?3)",
                    params![INSTALLATION_BOOTSTRAP_KEY, marker, Utc::now().to_rfc3339()],
                )
                .unwrap();
                if let Some(locale) = stored_locale {
                    db.execute(
                        "INSERT INTO app_settings(key,value,updated_at)VALUES(?1,?2,?3)",
                        params![LOCALE_KEY, locale, Utc::now().to_rfc3339()],
                    )
                    .unwrap();
                }
            }
            let result = initialize_locale_at_path(&path, os_locale).unwrap();
            assert_eq!(result.locale, expected);
            assert_eq!(result.source, source);
            let db = Connection::open(path).unwrap();
            assert_eq!(load_locale(&db).unwrap().as_deref(), Some(expected));
        }
    }
    #[test]
    fn corrupt_marker_on_existing_database_fails_closed_to_compatibility_vietnamese() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("corrupt.sqlite3");
        {
            let db = open_database(&path).unwrap();
            db.execute(
                "INSERT INTO app_settings(key,value,updated_at)VALUES(?1,'not-json',?2)",
                params![INSTALLATION_BOOTSTRAP_KEY, Utc::now().to_rfc3339()],
            )
            .unwrap();
        }
        let result = initialize_locale_at_path(&path, Some("en-US")).unwrap();
        assert_eq!(result.locale, "vi");
        assert_eq!(result.source, LocaleInitializationSource::Compatibility);
    }
    #[test]
    fn repeated_and_concurrent_initialization_are_idempotent() {
        use std::sync::{Arc, Barrier};
        use std::thread;

        let directory = tempfile::tempdir().unwrap();
        let path = Arc::new(directory.path().join("concurrent.sqlite3"));
        let barrier = Arc::new(Barrier::new(3));
        let mut handles = Vec::new();
        for _ in 0..2 {
            let path = Arc::clone(&path);
            let barrier = Arc::clone(&barrier);
            handles.push(thread::spawn(move || {
                barrier.wait();
                initialize_locale_at_path(&path, Some("en-US")).unwrap()
            }));
        }
        barrier.wait();
        let results: Vec<_> = handles
            .into_iter()
            .map(|handle| handle.join().unwrap())
            .collect();
        assert!(results.iter().all(|result| result.locale == "en"));
        assert_eq!(
            results
                .iter()
                .filter(|result| result.source == LocaleInitializationSource::Fresh)
                .count(),
            1
        );
        assert_eq!(
            results
                .iter()
                .filter(|result| result.source == LocaleInitializationSource::Persisted)
                .count(),
            1
        );
        let db = Connection::open(path.as_path()).unwrap();
        assert_eq!(
            db.query_row(
                "SELECT COUNT(*) FROM app_settings WHERE key IN (?1,?2)",
                params![LOCALE_KEY, INSTALLATION_BOOTSTRAP_KEY],
                |row| row.get::<_, i64>(0)
            )
            .unwrap(),
            2
        );
    }
    #[test]
    fn failed_initialization_transaction_leaves_no_partial_marker_or_locale() {
        let mut db = memory();
        let error = initialize_locale_transaction(&mut db, false, Some("en-US"), || {
            Err(rusqlite::Error::InvalidQuery)
        })
        .unwrap_err();
        assert_eq!(error.code, error_code::DATABASE_UNAVAILABLE);
        assert_eq!(
            db.query_row(
                "SELECT COUNT(*) FROM app_settings WHERE key IN (?1,?2)",
                params![LOCALE_KEY, INSTALLATION_BOOTSTRAP_KEY],
                |row| row.get::<_, i64>(0)
            )
            .unwrap(),
            0
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
    fn theme_v2_has_exactly_33_unique_colors_in_each_palette() {
        assert_eq!(THEME_COLOR_KEYS.len(), 33);
        assert_eq!(
            THEME_COLOR_KEYS
                .iter()
                .collect::<std::collections::BTreeSet<_>>()
                .len(),
            33
        );
        let value = theme_value();
        validate_theme_preferences(&value).unwrap();
        for palette_name in ["lightColors", "darkColors"] {
            let palette = value[palette_name].as_object().unwrap();
            assert_eq!(palette.len(), 33);
            assert!(THEME_COLOR_KEYS
                .iter()
                .all(|key| palette.contains_key(*key)));
        }
    }
    #[test]
    fn specialized_theme_surface_colors_round_trip_independently() {
        let db = memory();
        let mut value = theme_value();
        for palette_name in ["lightColors", "darkColors"] {
            for (key, color) in [
                ("accent", "#00FF00"),
                ("tableHeaderBackground", "#FF00FF"),
                ("statsPanelBackground", "#111111"),
                ("statsPanelBorder", "#FF0000"),
                ("statsPanelPrimaryText", "#FFFFFF"),
                ("statsPanelSecondaryText", "#FFFF00"),
                ("statsPanelProgressTrack", "#444444"),
                ("statsPanelProgressFill", "#00FFFF"),
            ] {
                value[palette_name][key] = serde_json::json!(color);
            }
        }
        value["selectedPresetId"] = serde_json::json!("custom");
        save_theme(&db, &value).unwrap();
        let loaded = load_theme(&db).unwrap().unwrap();
        assert_eq!(loaded, value);
        assert_ne!(
            loaded["lightColors"]["accent"],
            loaded["lightColors"]["tableHeaderBackground"]
        );
        assert_ne!(
            loaded["lightColors"]["statsPanelBackground"],
            loaded["lightColors"]["statsPanelProgressFill"]
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
        assert_eq!(
            save_theme(&db, &value).unwrap_err().code,
            error_code::THEME_COLOR_INVALID
        );
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
            6
        );
        let error: AppError = rusqlite::Error::InvalidQuery.into();
        assert_eq!(error.code, error_code::DATABASE_UNAVAILABLE);
        let message = error.message.as_deref().unwrap_or_default();
        assert!(!message.to_lowercase().contains("sqlite"));
        assert!(!message.contains(file.path().to_string_lossy().as_ref()));
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
            error_code::WORK_ITEM_STATUS_INVALID
        );
        assert_eq!(
            update_item(&db, update(&item.id, &"x".repeat(501), "completed"))
                .unwrap_err()
                .code,
            error_code::WORK_ITEM_TASK_TOO_LONG
        );
    }
    #[test]
    fn deletes_item() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        delete_item(&db, &item.id).unwrap();
        assert_eq!(
            delete_item(&db, &item.id).unwrap_err().code,
            error_code::DATA_NOT_FOUND
        );
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
        assert_eq!(
            reorder_items(&mut db, &items[0].daily_log_id, &[])
                .unwrap_err()
                .code,
            error_code::WORK_ITEM_REORDER_EMPTY
        );
        assert_eq!(
            reorder_items(
                &mut db,
                &items[0].daily_log_id,
                &[items[0].id.clone(), "missing".into()]
            )
            .unwrap_err()
            .code,
            error_code::WORK_ITEM_REORDER_INVALID
        );
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
        assert_eq!(
            list_summaries(&db, 1, 101).unwrap_err().code,
            error_code::HISTORY_PAGINATION_INVALID
        );
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
    fn history_returns_theme_metadata_without_per_card_preview_queries() {
        let mut db = memory();
        let first = create_item(&mut db, "2026-07-18", None).unwrap();
        update_item(
            &db,
            update(&first.id, "Quoted \"task\" and newline\nsafe", "completed"),
        )
        .unwrap();
        db.execute(
            "UPDATE daily_logs SET theme_id='coffee',theme_version=1 WHERE id=?1",
            [&first.daily_log_id],
        )
        .unwrap();
        let second = create_item(&mut db, "2026-07-19", None).unwrap();
        update_item(&db, update(&second.id, "Unknown theme", "in_progress")).unwrap();
        db.execute(
            "UPDATE daily_logs SET theme_id='future-theme',theme_version=7 WHERE id=?1",
            [&second.daily_log_id],
        )
        .unwrap();
        let page = list_summaries(&db, 1, 20).unwrap();
        assert_eq!(
            (
                page.items[0].theme_id.as_deref(),
                page.items[0].theme_version
            ),
            (Some("future-theme"), Some(7))
        );
        assert_eq!(
            (
                page.items[1].theme_id.as_deref(),
                page.items[1].theme_version
            ),
            (Some("coffee"), Some(1))
        );
        assert_eq!(
            page.items[1].preview_tasks,
            vec!["Quoted \"task\" and newline\nsafe"]
        );
    }
    #[test]
    fn calendar_summaries_use_an_ordered_half_open_indexed_range() {
        let mut db = memory();
        for date in ["2026-06-30", "2026-07-01", "2026-07-15", "2026-08-01"] {
            let transaction = db.transaction().unwrap();
            ensure_daily_log(&transaction, date).unwrap();
            transaction.commit().unwrap();
        }
        db.execute(
            "UPDATE daily_logs SET theme_id='sakura',theme_version=1 WHERE log_date='2026-07-15'",
            [],
        )
        .unwrap();
        let summaries = list_calendar_summaries(&db, "2026-07-01", "2026-08-01").unwrap();
        assert_eq!(
            summaries,
            vec![
                CalendarDaySummary {
                    date: "2026-07-01".into(),
                    has_log: true,
                    theme_id: None,
                    theme_version: None,
                    day_symbol: None,
                },
                CalendarDaySummary {
                    date: "2026-07-15".into(),
                    has_log: true,
                    theme_id: Some("sakura".into()),
                    theme_version: Some(1),
                    day_symbol: None,
                },
            ]
        );
        let plan = db
            .prepare(
                "EXPLAIN QUERY PLAN
                 SELECT log_date,theme_id,theme_version FROM daily_logs
                 WHERE log_date>=?1 AND log_date<?2 ORDER BY log_date",
            )
            .unwrap()
            .query_map(params!["2026-07-01", "2026-08-01"], |row| {
                row.get::<_, String>(3)
            })
            .unwrap()
            .collect::<rusqlite::Result<Vec<_>>>()
            .unwrap();
        assert!(plan.iter().any(|detail| detail.contains("log_date")));
    }
    #[test]
    fn calendar_summaries_preserve_unknown_theme_metadata_and_reject_bad_ranges() {
        let mut db = memory();
        let transaction = db.transaction().unwrap();
        let id = ensure_daily_log(&transaction, "2026-07-20").unwrap();
        transaction.commit().unwrap();
        db.execute(
            "UPDATE daily_logs SET theme_id='future-theme',theme_version=9 WHERE id=?1",
            [&id],
        )
        .unwrap();
        let summaries = list_calendar_summaries(&db, "2026-07-01", "2026-08-01").unwrap();
        assert_eq!(summaries[0].theme_id.as_deref(), Some("future-theme"));
        assert_eq!(summaries[0].theme_version, Some(9));
        for (start, end) in [
            ("bad-date", "2026-08-01"),
            ("2026-07-01", "bad-date"),
            ("2026-07-01", "2026-07-01"),
            ("2026-08-01", "2026-07-01"),
        ] {
            assert_eq!(
                list_calendar_summaries(&db, start, end).unwrap_err().code,
                error_code::DATE_INVALID
            );
        }
    }
    #[test]
    fn rejects_invalid_dates() {
        let mut db = memory();
        assert_eq!(
            create_item(&mut db, "2026-02-31", None).unwrap_err().code,
            error_code::DATE_INVALID
        );
        assert_eq!(
            find_daily_log(&db, "bad").unwrap_err().code,
            error_code::DATE_INVALID
        );
    }
    #[test]
    fn normal_startup_does_not_seed_journal_data() {
        let directory = tempfile::tempdir().unwrap();
        let db = open_database(&directory.path().join("done-today.sqlite3")).unwrap();
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM daily_logs", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            0
        );
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM work_items", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            0
        );
        assert_eq!(list_categories(&db, true).unwrap().len(), 3);
    }
    #[test]
    fn activity_dates_exclude_empty_whitespace_and_auxiliary_only_items() {
        let mut db = memory();
        let empty = create_item(&mut db, "2026-07-18", None).unwrap();
        db.execute(
            "UPDATE work_items SET result='Result',next_action='Next' WHERE id=?1",
            [&empty.id],
        )
        .unwrap();
        let whitespace = create_item(&mut db, "2026-07-19", None).unwrap();
        db.execute(
            "UPDATE work_items SET task=char(9)||char(10)||char(13)||char(160)||char(12288)||'   ' WHERE id=?1",
            [&whitespace.id],
        )
        .unwrap();
        let transaction = db.transaction().unwrap();
        ensure_daily_log(&transaction, "2026-07-20").unwrap();
        transaction.commit().unwrap();
        assert!(list_activity_dates(&db).unwrap().is_empty());
    }
    #[test]
    fn activity_dates_are_distinct_deterministic_and_status_neutral() {
        let mut db = memory();
        for (date, status) in [
            ("2026-07-21", "cancelled"),
            ("2026-07-18", "in_progress"),
            ("2026-07-20", "postponed"),
            ("2026-07-19", "completed"),
        ] {
            let item = create_item(&mut db, date, None).unwrap();
            update_item(&db, update(&item.id, "Journal entry", status)).unwrap();
        }
        let duplicate = create_item(&mut db, "2026-07-19", None).unwrap();
        update_item(&db, update(&duplicate.id, "Second entry", "in_progress")).unwrap();
        assert_eq!(
            list_activity_dates(&db).unwrap(),
            vec!["2026-07-18", "2026-07-19", "2026-07-20", "2026-07-21"]
        );
    }
    #[test]
    fn activity_date_tracks_current_content_after_clear_and_delete() {
        let mut db = memory();
        let item = create_item(&mut db, "2026-07-18", None).unwrap();
        update_item(&db, update(&item.id, "Journal entry", "completed")).unwrap();
        assert_eq!(list_activity_dates(&db).unwrap(), vec!["2026-07-18"]);
        update_item(&db, update(&item.id, "   ", "cancelled")).unwrap();
        assert!(list_activity_dates(&db).unwrap().is_empty());
        update_item(&db, update(&item.id, "Journal entry", "in_progress")).unwrap();
        delete_item(&db, &item.id).unwrap();
        assert!(list_activity_dates(&db).unwrap().is_empty());
        assert!(find_daily_log(&db, "2026-07-18").unwrap().is_some());
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
            6
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
            error_code::CATEGORY_NAME_INVALID
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
            error_code::CATEGORY_COLOR_INVALID
        );
        let mut db = memory();
        seed_categories(&mut db).unwrap();
        let first_id = list_categories(&db, true).unwrap()[0].id.clone();
        assert_eq!(
            reorder_category_records(&mut db, &[first_id])
                .unwrap_err()
                .code,
            error_code::CATEGORY_REORDER_INVALID
        );
    }

    #[test]
    fn theme_limit_and_schema_errors_include_numeric_params() {
        let mut unsupported = theme_value();
        unsupported["schemaVersion"] = 3.into();
        let schema_error = validate_theme_preferences(&unsupported).unwrap_err();
        assert_eq!(schema_error.code, error_code::THEME_SCHEMA_UNSUPPORTED);
        assert_eq!(
            schema_error.params.get("version"),
            Some(&AppErrorParam::Number(3))
        );
        assert_eq!(
            schema_error.params.get("supportedVersion"),
            Some(&AppErrorParam::Number(2))
        );

        let mut oversized = theme_value();
        oversized["selectedPresetId"] = "x".repeat(17_000).into();
        let size_error = validate_theme_preferences(&oversized).unwrap_err();
        assert_eq!(size_error.code, error_code::THEME_TOO_LARGE);
        assert_eq!(
            size_error.params.get("maxKiB"),
            Some(&AppErrorParam::Number(16))
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
