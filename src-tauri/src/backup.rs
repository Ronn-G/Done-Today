use crate::{
    error_code, validate_theme_preferences, AppError, AppErrorParam, AppErrorParams, AppResult,
    STATUSES, THEME_KEY,
};
use chrono::{DateTime, NaiveDate, Utc};
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, HashMap, HashSet},
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::Path,
};
use uuid::Uuid;

const FORMAT: &str = "done-today-backup";
const VERSION: i64 = 1;
const MAX_FILE_SIZE: u64 = 20 * 1024 * 1024;

pub(crate) mod warning_code {
    pub const APP_VERSION: &str = "backup.warning.app_version";
    pub const PREVIOUSLY_IMPORTED: &str = "backup.warning.previously_imported";
    #[cfg(test)]
    pub const ALL: [&str; 2] = [APP_VERSION, PREVIOUSLY_IMPORTED];
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BackupDailyLogV1 {
    id: String,
    log_date: String,
    created_at: String,
    updated_at: String,
}
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BackupWorkItemV1 {
    id: String,
    daily_log_id: String,
    category_id: Option<String>,
    task: String,
    result: String,
    next_action: String,
    status: String,
    position: i64,
    created_at: String,
    updated_at: String,
}
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BackupCategoryV1 {
    id: String,
    name: String,
    color: String,
    position: i64,
    is_active: bool,
    created_at: String,
    updated_at: String,
}
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BackupPayloadV1 {
    daily_logs: Vec<BackupDailyLogV1>,
    work_items: Vec<BackupWorkItemV1>,
    work_categories: Vec<BackupCategoryV1>,
    theme_preferences: Option<serde_json::Value>,
}
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct BackupEnvelopeV1 {
    format: String,
    version: i64,
    exported_at: String,
    app_version: String,
    payload: BackupPayloadV1,
    checksum: String,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupCounts {
    daily_logs: usize,
    work_items: usize,
    work_categories: usize,
    theme: bool,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportResult {
    file_name: String,
    counts: BackupCounts,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportPreview {
    file_name: String,
    format: String,
    version: i64,
    exported_at: String,
    app_version: String,
    checksum: String,
    checksum_valid: bool,
    counts: BackupCounts,
    existing_ids: usize,
    new_records: usize,
    conflicts: usize,
    unchanged: usize,
    previously_imported_at: Option<String>,
    warnings: Vec<AppWarning>,
}
#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ImportMode {
    Merge,
    Replace,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    mode: ImportMode,
    counts: BackupCounts,
    remapped: usize,
}
#[derive(Default)]
struct Plan {
    existing: usize,
    new_records: usize,
    conflicts: usize,
    unchanged: usize,
    log_map: HashMap<String, String>,
    category_map: HashMap<String, String>,
}

#[derive(Debug, Serialize)]
struct AppWarning {
    code: &'static str,
    params: AppErrorParams,
}
impl AppWarning {
    fn new(code: &'static str) -> Self {
        Self {
            code,
            params: BTreeMap::new(),
        }
    }
    fn with_string(mut self, name: &str, value: impl Into<String>) -> Self {
        self.params
            .insert(name.into(), AppErrorParam::String(value.into()));
        self
    }
}
fn counts(payload: &BackupPayloadV1) -> BackupCounts {
    BackupCounts {
        daily_logs: payload.daily_logs.len(),
        work_items: payload.work_items.len(),
        work_categories: payload.work_categories.len(),
        theme: payload.theme_preferences.is_some(),
    }
}
fn canonical_payload(payload: &BackupPayloadV1) -> AppResult<String> {
    let mut normalized = payload.clone();
    normalized
        .daily_logs
        .sort_by(|a, b| (&a.log_date, &a.id).cmp(&(&b.log_date, &b.id)));
    normalized.work_items.sort_by(|a, b| {
        (&a.daily_log_id, a.position, &a.id).cmp(&(&b.daily_log_id, b.position, &b.id))
    });
    normalized
        .work_categories
        .sort_by(|a, b| (a.position, &a.id).cmp(&(b.position, &b.id)));
    let value = serde_json::to_value(&normalized)
        .map_err(|_| AppError::new(error_code::BACKUP_CREATE_FAILED))?;
    serde_json::to_string(&value).map_err(|_| AppError::new(error_code::BACKUP_CREATE_FAILED))
}
fn checksum(payload: &BackupPayloadV1) -> AppResult<String> {
    Ok(format!(
        "sha256:{:x}",
        Sha256::digest(canonical_payload(payload)?.as_bytes())
    ))
}
fn valid_timestamp(value: &str) -> bool {
    DateTime::parse_from_rfc3339(value).is_ok()
}
fn validate(payload: &BackupPayloadV1) -> AppResult<()> {
    let mut ids = HashSet::new();
    let mut dates = HashSet::new();
    for log in &payload.daily_logs {
        if log.id.trim().is_empty() || !ids.insert(log.id.as_str()) {
            return Err(AppError::new(error_code::BACKUP_DUPLICATE_ID));
        }
        let parsed = NaiveDate::parse_from_str(&log.log_date, "%Y-%m-%d")
            .map_err(|_| AppError::new(error_code::BACKUP_STRUCTURE_INVALID))?;
        if parsed.format("%Y-%m-%d").to_string() != log.log_date
            || !dates.insert(log.log_date.as_str())
        {
            return Err(AppError::new(error_code::BACKUP_DUPLICATE_ID));
        }
        if !valid_timestamp(&log.created_at) || !valid_timestamp(&log.updated_at) {
            return Err(AppError::new(error_code::BACKUP_TIMESTAMP_INVALID));
        }
    }
    let log_ids: HashSet<_> = payload
        .daily_logs
        .iter()
        .map(|value| value.id.as_str())
        .collect();
    ids.clear();
    for category in &payload.work_categories {
        if category.id.trim().is_empty() || !ids.insert(category.id.as_str()) {
            return Err(AppError::new(error_code::BACKUP_DUPLICATE_ID));
        }
        if category.name.trim().is_empty() || category.name.chars().count() > 80 {
            return Err(AppError::new(error_code::BACKUP_STRUCTURE_INVALID));
        }
        if category.color.len() != 7
            || !category.color.starts_with('#')
            || !category.color[1..]
                .chars()
                .all(|value| value.is_ascii_hexdigit())
        {
            return Err(AppError::new(error_code::BACKUP_STRUCTURE_INVALID));
        }
        if category.position < 0
            || !valid_timestamp(&category.created_at)
            || !valid_timestamp(&category.updated_at)
        {
            return Err(AppError::new(error_code::BACKUP_STRUCTURE_INVALID));
        }
    }
    let category_ids: HashSet<_> = payload
        .work_categories
        .iter()
        .map(|value| value.id.as_str())
        .collect();
    ids.clear();
    for item in &payload.work_items {
        if item.id.trim().is_empty() || !ids.insert(item.id.as_str()) {
            return Err(AppError::new(error_code::BACKUP_DUPLICATE_ID));
        }
        if !log_ids.contains(item.daily_log_id.as_str()) {
            return Err(AppError::new(error_code::BACKUP_REFERENCE_INVALID));
        }
        if item
            .category_id
            .as_deref()
            .is_some_and(|id| !category_ids.contains(id))
        {
            return Err(AppError::new(error_code::BACKUP_REFERENCE_INVALID));
        }
        if !STATUSES.contains(&item.status.as_str())
            || item.position < 0
            || item.task.chars().count() > 500
            || item.result.chars().count() > 2000
            || item.next_action.chars().count() > 1000
            || !valid_timestamp(&item.created_at)
            || !valid_timestamp(&item.updated_at)
        {
            return Err(AppError::new(error_code::BACKUP_STRUCTURE_INVALID));
        }
    }
    if let Some(theme) = &payload.theme_preferences {
        validate_theme_preferences(theme)
            .map_err(|_| AppError::new(error_code::BACKUP_THEME_INVALID))?;
    }
    Ok(())
}
fn read(path: &Path) -> AppResult<BackupEnvelopeV1> {
    let metadata =
        fs::metadata(path).map_err(|_| AppError::new(error_code::BACKUP_FILE_READ_FAILED))?;
    if metadata.len() > MAX_FILE_SIZE {
        return Err(AppError::new(error_code::BACKUP_FILE_TOO_LARGE).with_number("maxMiB", 20));
    }
    let file = File::open(path).map_err(|_| AppError::new(error_code::BACKUP_FILE_READ_FAILED))?;
    let mut bytes = Vec::with_capacity(metadata.len() as usize);
    file.take(MAX_FILE_SIZE + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| AppError::new(error_code::BACKUP_FILE_READ_FAILED))?;
    let value: serde_json::Value = serde_json::from_slice(&bytes)
        .map_err(|_| AppError::new(error_code::BACKUP_JSON_INVALID))?;
    let version = value
        .get("version")
        .and_then(serde_json::Value::as_i64)
        .ok_or_else(|| AppError::new(error_code::BACKUP_VERSION_MISSING))?;
    if version > VERSION {
        return Err(AppError::new(error_code::BACKUP_VERSION_NEWER)
            .with_number("version", version)
            .with_number("supportedVersion", VERSION));
    }
    if version < VERSION {
        return Err(AppError::new(error_code::BACKUP_VERSION_UNSUPPORTED)
            .with_number("version", version)
            .with_number("supportedVersion", VERSION));
    }
    let envelope: BackupEnvelopeV1 = serde_json::from_value(value)
        .map_err(|_| AppError::new(error_code::BACKUP_STRUCTURE_INVALID))?;
    if envelope.app_version.trim().is_empty() || envelope.app_version.chars().count() > 40 {
        return Err(AppError::new(error_code::BACKUP_STRUCTURE_INVALID));
    }
    if envelope.format != FORMAT {
        return Err(AppError::new(error_code::BACKUP_FORMAT_INVALID));
    }
    if !valid_timestamp(&envelope.exported_at) {
        return Err(AppError::new(error_code::BACKUP_TIMESTAMP_INVALID));
    }
    validate(&envelope.payload)?;
    if checksum(&envelope.payload)? != envelope.checksum {
        return Err(AppError::new(error_code::BACKUP_CHECKSUM_MISMATCH));
    }
    Ok(envelope)
}
fn snapshot(connection: &mut Connection) -> AppResult<BackupPayloadV1> {
    let tx = connection.transaction()?;
    let daily_logs = {
        let mut statement = tx.prepare(
            "SELECT id,log_date,created_at,updated_at FROM daily_logs ORDER BY log_date,id",
        )?;
        let rows = statement
            .query_map([], |row| {
                Ok(BackupDailyLogV1 {
                    id: row.get(0)?,
                    log_date: row.get(1)?,
                    created_at: row.get(2)?,
                    updated_at: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };
    let work_items = {
        let mut statement = tx.prepare("SELECT id,daily_log_id,category_id,task,result,next_action,status,position,created_at,updated_at FROM work_items ORDER BY daily_log_id,position,id")?;
        let rows = statement
            .query_map([], |row| {
                Ok(BackupWorkItemV1 {
                    id: row.get(0)?,
                    daily_log_id: row.get(1)?,
                    category_id: row.get(2)?,
                    task: row.get(3)?,
                    result: row.get(4)?,
                    next_action: row.get(5)?,
                    status: row.get(6)?,
                    position: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };
    let work_categories = {
        let mut statement = tx.prepare("SELECT id,name,color,position,is_active,created_at,updated_at FROM work_categories ORDER BY position,id")?;
        let rows = statement
            .query_map([], |row| {
                Ok(BackupCategoryV1 {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    position: row.get(3)?,
                    is_active: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };
    let theme_preferences = tx
        .query_row(
            "SELECT value FROM app_settings WHERE key=?1",
            [THEME_KEY],
            |row| row.get::<_, String>(0),
        )
        .optional()?
        .map(|value| serde_json::from_str(&value))
        .transpose()
        .map_err(|_| AppError::new(error_code::BACKUP_THEME_INVALID))?;
    tx.commit()?;
    Ok(BackupPayloadV1 {
        daily_logs,
        work_items,
        work_categories,
        theme_preferences,
    })
}
fn atomic_write(path: &Path, bytes: &[u8]) -> AppResult<()> {
    let parent = path
        .parent()
        .ok_or_else(|| AppError::new(error_code::BACKUP_DESTINATION_INVALID))?;
    let temp = parent.join(format!(
        ".{}.{}.tmp",
        path.file_name().unwrap_or_default().to_string_lossy(),
        Uuid::new_v4()
    ));
    let result = (|| -> std::io::Result<()> {
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp)?;
        file.write_all(bytes)?;
        file.sync_all()?;
        atomic_replace(&temp, path)?;
        if let Ok(directory) = File::open(parent) {
            let _ = directory.sync_all();
        }
        Ok(())
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temp);
    }
    result.map_err(|_| AppError::new(error_code::BACKUP_FILE_WRITE_FAILED))
}

#[cfg(not(windows))]
fn atomic_replace(source: &Path, destination: &Path) -> std::io::Result<()> {
    fs::rename(source, destination)
}

#[cfg(windows)]
fn atomic_replace(source: &Path, destination: &Path) -> std::io::Result<()> {
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::Storage::FileSystem::{
        MoveFileExW, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH,
    };
    let source: Vec<u16> = source.as_os_str().encode_wide().chain(Some(0)).collect();
    let destination: Vec<u16> = destination
        .as_os_str()
        .encode_wide()
        .chain(Some(0))
        .collect();
    // Both paths are NUL-terminated buffers owned for the duration of this synchronous Win32 call.
    let succeeded = unsafe {
        MoveFileExW(
            source.as_ptr(),
            destination.as_ptr(),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
    };
    if succeeded == 0 {
        Err(std::io::Error::last_os_error())
    } else {
        Ok(())
    }
}
pub fn export(database: &Path, path: &Path) -> AppResult<ExportResult> {
    let mut connection = Connection::open(database)?;
    connection.pragma_update(None, "foreign_keys", "ON")?;
    let payload = snapshot(&mut connection)?;
    validate(&payload)?;
    let envelope = BackupEnvelopeV1 {
        format: FORMAT.into(),
        version: VERSION,
        exported_at: Utc::now().to_rfc3339(),
        app_version: env!("CARGO_PKG_VERSION").into(),
        checksum: checksum(&payload)?,
        payload,
    };
    let json = serde_json::to_vec_pretty(&envelope)
        .map_err(|_| AppError::new(error_code::BACKUP_CREATE_FAILED))?;
    atomic_write(path, &json)?;
    Ok(ExportResult {
        file_name: path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        counts: counts(&envelope.payload),
    })
}
fn equivalent_category(tx: &Transaction<'_>, value: &BackupCategoryV1) -> AppResult<bool> {
    Ok(tx.query_row("SELECT name,color,position,is_active,created_at,updated_at FROM work_categories WHERE id=?1",[&value.id],
        |row|Ok((row.get::<_,String>(0)?,row.get::<_,String>(1)?,row.get::<_,i64>(2)?,row.get::<_,bool>(3)?,row.get::<_,String>(4)?,row.get::<_,String>(5)?)))
        .optional()?.is_some_and(|found|found==(value.name.clone(),value.color.to_uppercase(),value.position,value.is_active,value.created_at.clone(),value.updated_at.clone())))
}
fn equivalent_item(
    tx: &Transaction<'_>,
    value: &BackupWorkItemV1,
    log_id: &str,
    category_id: Option<&str>,
) -> AppResult<bool> {
    Ok(tx.query_row("SELECT daily_log_id,category_id,task,result,next_action,status,position,created_at,updated_at FROM work_items WHERE id=?1",[&value.id],
        |row|Ok((row.get::<_,String>(0)?,row.get::<_,Option<String>>(1)?,row.get::<_,String>(2)?,row.get::<_,String>(3)?,row.get::<_,String>(4)?,row.get::<_,String>(5)?,row.get::<_,i64>(6)?,row.get::<_,String>(7)?,row.get::<_,String>(8)?)))
        .optional()?.is_some_and(|found|found==(log_id.into(),category_id.map(str::to_owned),value.task.clone(),value.result.clone(),value.next_action.clone(),value.status.clone(),value.position,value.created_at.clone(),value.updated_at.clone())))
}
fn make_plan(tx: &Transaction<'_>, payload: &BackupPayloadV1) -> AppResult<Plan> {
    let mut plan = Plan::default();
    for log in &payload.daily_logs {
        let by_id: Option<String> = tx
            .query_row(
                "SELECT log_date FROM daily_logs WHERE id=?1",
                [&log.id],
                |row| row.get(0),
            )
            .optional()?;
        let by_date: Option<String> = tx
            .query_row(
                "SELECT id FROM daily_logs WHERE log_date=?1",
                [&log.log_date],
                |row| row.get(0),
            )
            .optional()?;
        match (by_id, by_date) {
            (None, None) => {
                plan.new_records += 1;
                plan.log_map.insert(log.id.clone(), log.id.clone());
            }
            (Some(date), _) if date == log.log_date => {
                plan.existing += 1;
                plan.unchanged += 1;
                plan.log_map.insert(log.id.clone(), log.id.clone());
            }
            (Some(_), _) => return Err(AppError::new(error_code::BACKUP_MERGE_UNSAFE)),
            (None, Some(id)) => {
                plan.existing += 1;
                plan.conflicts += 1;
                plan.log_map.insert(log.id.clone(), id);
            }
        }
    }
    for category in &payload.work_categories {
        if equivalent_category(tx, category)? {
            plan.existing += 1;
            plan.unchanged += 1;
            plan.category_map
                .insert(category.id.clone(), category.id.clone());
        } else if tx.query_row(
            "SELECT EXISTS(SELECT 1 FROM work_categories WHERE id=?1)",
            [&category.id],
            |row| row.get::<_, bool>(0),
        )? {
            plan.existing += 1;
            plan.conflicts += 1;
            plan.category_map
                .insert(category.id.clone(), Uuid::new_v4().to_string());
        } else {
            plan.new_records += 1;
            plan.category_map
                .insert(category.id.clone(), category.id.clone());
        }
    }
    for item in &payload.work_items {
        let log_id = plan
            .log_map
            .get(&item.daily_log_id)
            .ok_or_else(|| AppError::new(error_code::BACKUP_MAPPING_MISSING))?;
        let category_id = item
            .category_id
            .as_ref()
            .and_then(|id| plan.category_map.get(id))
            .map(String::as_str);
        if equivalent_item(tx, item, log_id, category_id)? {
            plan.existing += 1;
            plan.unchanged += 1;
        } else if tx.query_row(
            "SELECT EXISTS(SELECT 1 FROM work_items WHERE id=?1)",
            [&item.id],
            |row| row.get::<_, bool>(0),
        )? {
            plan.existing += 1;
            plan.conflicts += 1;
        } else {
            plan.new_records += 1;
        }
    }
    Ok(plan)
}
pub fn preview(database: &Path, path: &Path) -> AppResult<ImportPreview> {
    let envelope = read(path)?;
    let mut connection = Connection::open(database)?;
    connection.pragma_update(None, "foreign_keys", "ON")?;
    let tx = connection.transaction()?;
    let plan = make_plan(&tx, &envelope.payload)?;
    let previously_imported_at=tx.query_row("SELECT imported_at FROM backup_import_receipts WHERE checksum=?1 ORDER BY imported_at DESC LIMIT 1",[&envelope.checksum],|row|row.get(0)).optional()?;
    tx.rollback()?;
    let mut warnings = Vec::new();
    if envelope.app_version != env!("CARGO_PKG_VERSION") {
        warnings.push(
            AppWarning::new(warning_code::APP_VERSION)
                .with_string("backupVersion", envelope.app_version.clone())
                .with_string("currentVersion", env!("CARGO_PKG_VERSION")),
        );
    }
    if previously_imported_at.is_some() {
        warnings.push(AppWarning::new(warning_code::PREVIOUSLY_IMPORTED));
    }
    Ok(ImportPreview {
        file_name: path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        format: envelope.format,
        version: envelope.version,
        exported_at: envelope.exported_at,
        app_version: envelope.app_version,
        checksum: envelope.checksum,
        checksum_valid: true,
        counts: counts(&envelope.payload),
        existing_ids: plan.existing,
        new_records: plan.new_records,
        conflicts: plan.conflicts,
        unchanged: plan.unchanged,
        previously_imported_at,
        warnings,
    })
}
fn insert_payload(
    tx: &Transaction<'_>,
    payload: &BackupPayloadV1,
    plan: &Plan,
    merge: bool,
) -> AppResult<usize> {
    let mut remapped = 0;
    for log in &payload.daily_logs {
        let target = &plan.log_map[&log.id];
        if !merge
            || target == &log.id
                && !tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM daily_logs WHERE id=?1)",
                    [target],
                    |row| row.get::<_, bool>(0),
                )?
        {
            tx.execute(
                "INSERT INTO daily_logs(id,log_date,created_at,updated_at)VALUES(?1,?2,?3,?4)",
                params![target, log.log_date, log.created_at, log.updated_at],
            )?;
        }
        if target != &log.id {
            remapped += 1
        }
    }
    for category in &payload.work_categories {
        let target = &plan.category_map[&category.id];
        if !merge
            || !tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM work_categories WHERE id=?1)",
                [target],
                |row| row.get::<_, bool>(0),
            )?
        {
            tx.execute("INSERT INTO work_categories(id,name,color,position,is_active,created_at,updated_at)VALUES(?1,?2,?3,?4,?5,?6,?7)",
                params![target,category.name,category.color.to_uppercase(),category.position,category.is_active,category.created_at,category.updated_at])?;
        }
        if target != &category.id {
            remapped += 1
        }
    }
    for item in &payload.work_items {
        let log_id = &plan.log_map[&item.daily_log_id];
        let category_id = item
            .category_id
            .as_ref()
            .map(|id| plan.category_map[id].clone());
        if merge && equivalent_item(tx, item, log_id, category_id.as_deref())? {
            continue;
        }
        let mut target = item.id.clone();
        if merge
            && tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM work_items WHERE id=?1)",
                [&target],
                |row| row.get::<_, bool>(0),
            )?
        {
            target = Uuid::new_v4().to_string();
            remapped += 1
        }
        tx.execute("INSERT INTO work_items(id,daily_log_id,category_id,task,result,next_action,status,position,created_at,updated_at)VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)",
            params![target,log_id,category_id,item.task,item.result,item.next_action,item.status,item.position,item.created_at,item.updated_at])?;
    }
    Ok(remapped)
}
pub fn import(
    database: &Path,
    path: &Path,
    mode: ImportMode,
    apply_theme: bool,
    confirm_reimport: bool,
) -> AppResult<ImportResult> {
    let envelope = read(path)?;
    let mut connection = Connection::open(database)?;
    connection.pragma_update(None, "foreign_keys", "ON")?;
    let tx = connection.transaction()?;
    let prior: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM backup_import_receipts WHERE checksum=?1)",
        [&envelope.checksum],
        |row| row.get(0),
    )?;
    if prior && !confirm_reimport {
        return Err(AppError::new(
            error_code::BACKUP_REIMPORT_CONFIRMATION_REQUIRED,
        ));
    }
    let plan = if matches!(mode, ImportMode::Replace) {
        Plan {
            log_map: envelope
                .payload
                .daily_logs
                .iter()
                .map(|value| (value.id.clone(), value.id.clone()))
                .collect(),
            category_map: envelope
                .payload
                .work_categories
                .iter()
                .map(|value| (value.id.clone(), value.id.clone()))
                .collect(),
            new_records: envelope.payload.daily_logs.len()
                + envelope.payload.work_items.len()
                + envelope.payload.work_categories.len(),
            ..Plan::default()
        }
    } else {
        make_plan(&tx, &envelope.payload)?
    };
    if matches!(mode, ImportMode::Replace) {
        tx.execute("DELETE FROM work_items", [])?;
        tx.execute("DELETE FROM daily_logs", [])?;
        tx.execute("DELETE FROM work_categories", [])?;
        tx.execute("DELETE FROM app_settings WHERE key=?1", [THEME_KEY])?;
    }
    let remapped = insert_payload(
        &tx,
        &envelope.payload,
        &plan,
        matches!(mode, ImportMode::Merge),
    )?;
    if let Some(theme) = envelope
        .payload
        .theme_preferences
        .as_ref()
        .filter(|_| matches!(mode, ImportMode::Replace) || apply_theme)
    {
        tx.execute("INSERT INTO app_settings(key,value,updated_at)VALUES(?1,?2,?3) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
            params![THEME_KEY,serde_json::to_string(theme).map_err(|_|AppError::new(error_code::BACKUP_THEME_INVALID))?,Utc::now().to_rfc3339()])?;
    }
    let summary=serde_json::to_string(&serde_json::json!({"dailyLogs":envelope.payload.daily_logs.len(),"workItems":envelope.payload.work_items.len(),"workCategories":envelope.payload.work_categories.len(),"remapped":remapped}))
        .map_err(|_|AppError::new(error_code::BACKUP_RECEIPT_WRITE_FAILED))?;
    tx.execute("INSERT INTO backup_import_receipts(id,checksum,imported_at,mode,source_exported_at,result_summary_json)VALUES(?1,?2,?3,?4,?5,?6)",
        params![Uuid::new_v4().to_string(),envelope.checksum,Utc::now().to_rfc3339(),match mode{ImportMode::Merge=>"merge",ImportMode::Replace=>"replace"},envelope.exported_at,summary])?;
    tx.commit()?;
    Ok(ImportResult {
        mode,
        counts: counts(&envelope.payload),
        remapped,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::migrate;
    fn memory() -> Connection {
        let mut db = Connection::open_in_memory().unwrap();
        migrate(&mut db).unwrap();
        db
    }
    fn empty_payload() -> BackupPayloadV1 {
        BackupPayloadV1 {
            daily_logs: vec![],
            work_items: vec![],
            work_categories: vec![],
            theme_preferences: None,
        }
    }
    fn write_envelope(payload: BackupPayloadV1) -> tempfile::NamedTempFile {
        let file = tempfile::NamedTempFile::new().unwrap();
        let envelope = BackupEnvelopeV1 {
            format: FORMAT.into(),
            version: VERSION,
            exported_at: "2026-07-19T00:00:00Z".into(),
            app_version: "0.1.0".into(),
            checksum: checksum(&payload).unwrap(),
            payload,
        };
        fs::write(file.path(), serde_json::to_vec(&envelope).unwrap()).unwrap();
        file
    }
    #[test]
    fn canonical_checksum_is_stable_and_sensitive() {
        let mut value = empty_payload();
        let first = checksum(&value).unwrap();
        assert_eq!(first, checksum(&value).unwrap());
        value.daily_logs.push(BackupDailyLogV1 {
            id: "x".into(),
            log_date: "2026-07-19".into(),
            created_at: "2026-07-19T00:00:00Z".into(),
            updated_at: "2026-07-19T00:00:00Z".into(),
        });
        assert_ne!(first, checksum(&value).unwrap())
    }
    #[test]
    fn invalid_references_are_rejected() {
        let mut value = empty_payload();
        value.work_items.push(BackupWorkItemV1 {
            id: "i".into(),
            daily_log_id: "missing".into(),
            category_id: None,
            task: "".into(),
            result: "".into(),
            next_action: "".into(),
            status: "completed".into(),
            position: 0,
            created_at: "2026-07-19T00:00:00Z".into(),
            updated_at: "2026-07-19T00:00:00Z".into(),
        });
        assert_eq!(
            validate(&value).unwrap_err().code,
            error_code::BACKUP_REFERENCE_INVALID
        )
    }
    #[test]
    fn snapshot_excludes_receipts() {
        let mut db = memory();
        db.execute("INSERT INTO backup_import_receipts VALUES('r','sha256:x','2026-07-19T00:00:00Z','merge',NULL,'{}')",[]).unwrap();
        let value = snapshot(&mut db).unwrap();
        assert!(serde_json::to_string(&value)
            .unwrap()
            .find("receipt")
            .is_none())
    }
    #[test]
    fn migration_v4_is_idempotent() {
        let mut db = memory();
        migrate(&mut db).unwrap();
        assert_eq!(
            db.query_row("SELECT MAX(version) FROM schema_migrations", [], |row| row
                .get::<_, i64>(
                0
            ))
            .unwrap(),
            4
        )
    }
    #[test]
    fn preview_does_not_mutate_database() {
        let mut db = memory();
        let tx = db.transaction().unwrap();
        let plan = make_plan(&tx, &empty_payload()).unwrap();
        assert_eq!(plan.new_records, 0);
        tx.rollback().unwrap();
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM backup_import_receipts", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            0
        )
    }
    #[test]
    fn preview_returns_structured_version_warning_with_params() {
        let directory = tempfile::tempdir().unwrap();
        let db_path = directory.path().join("db.sqlite");
        let mut db = Connection::open(&db_path).unwrap();
        migrate(&mut db).unwrap();
        drop(db);
        let file = write_envelope(empty_payload());
        let mut value: serde_json::Value =
            serde_json::from_slice(&fs::read(file.path()).unwrap()).unwrap();
        value["appVersion"] = "9.9.9".into();
        fs::write(file.path(), serde_json::to_vec(&value).unwrap()).unwrap();

        let result = preview(&db_path, file.path()).unwrap();
        assert_eq!(result.warnings.len(), 1);
        let warning = &result.warnings[0];
        assert_eq!(warning.code, warning_code::APP_VERSION);
        assert_eq!(
            warning.params.get("backupVersion"),
            Some(&AppErrorParam::String("9.9.9".into()))
        );
        assert_eq!(
            warning.params.get("currentVersion"),
            Some(&AppErrorParam::String(env!("CARGO_PKG_VERSION").into()))
        );
        let serialized = serde_json::to_value(warning).unwrap();
        assert_eq!(serialized["code"], warning_code::APP_VERSION);
        assert!(serialized["params"].is_object());
    }
    #[test]
    fn oversized_app_version_is_rejected_before_it_reaches_warning_params() {
        let file = write_envelope(empty_payload());
        let mut value: serde_json::Value =
            serde_json::from_slice(&fs::read(file.path()).unwrap()).unwrap();
        value["appVersion"] = "x".repeat(41).into();
        fs::write(file.path(), serde_json::to_vec(&value).unwrap()).unwrap();

        assert_eq!(
            read(file.path()).unwrap_err().code,
            error_code::BACKUP_STRUCTURE_INVALID
        );
    }
    #[test]
    fn invalid_json_is_rejected() {
        let file = tempfile::NamedTempFile::new().unwrap();
        fs::write(file.path(), b"{").unwrap();
        assert_eq!(
            read(file.path()).unwrap_err().code,
            error_code::BACKUP_JSON_INVALID
        )
    }
    #[test]
    fn wrong_format_is_rejected() {
        let payload = empty_payload();
        let file = write_envelope(payload);
        let mut value: serde_json::Value =
            serde_json::from_slice(&fs::read(file.path()).unwrap()).unwrap();
        value["format"] = "wrong".into();
        fs::write(file.path(), serde_json::to_vec(&value).unwrap()).unwrap();
        assert_eq!(
            read(file.path()).unwrap_err().code,
            error_code::BACKUP_FORMAT_INVALID
        )
    }
    #[test]
    fn unsupported_version_is_rejected() {
        let file = tempfile::NamedTempFile::new().unwrap();
        fs::write(file.path(), br#"{"version":2}"#).unwrap();
        let error = read(file.path()).unwrap_err();
        assert_eq!(error.code, error_code::BACKUP_VERSION_NEWER);
        assert_eq!(error.params.get("version"), Some(&AppErrorParam::Number(2)));
        assert_eq!(
            error.params.get("supportedVersion"),
            Some(&AppErrorParam::Number(1))
        )
    }
    #[test]
    fn file_read_error_masks_the_absolute_path() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("private-backup.json");
        let error = read(&path).unwrap_err();
        assert_eq!(error.code, error_code::BACKUP_FILE_READ_FAILED);
        let serialized = serde_json::to_string(&error).unwrap();
        assert!(!serialized.contains(path.to_string_lossy().as_ref()));
        assert!(serde_json::to_value(error).unwrap()["params"].is_object());
    }
    #[test]
    fn checksum_mismatch_is_rejected() {
        let file = write_envelope(empty_payload());
        let mut value: serde_json::Value =
            serde_json::from_slice(&fs::read(file.path()).unwrap()).unwrap();
        value["checksum"] = format!("sha256:{}", "0".repeat(64)).into();
        fs::write(file.path(), serde_json::to_vec(&value).unwrap()).unwrap();
        assert_eq!(
            read(file.path()).unwrap_err().code,
            error_code::BACKUP_CHECKSUM_MISMATCH
        )
    }
    #[test]
    fn atomic_write_creates_and_replaces_after_dialog_confirmation() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("backup.json");
        atomic_write(&path, b"one").unwrap();
        atomic_write(&path, b"two").unwrap();
        assert_eq!(fs::read(path).unwrap(), b"two")
    }
    #[test]
    fn empty_merge_creates_receipt_only_after_success() {
        let directory = tempfile::tempdir().unwrap();
        let db_path = directory.path().join("db.sqlite");
        let mut db = Connection::open(&db_path).unwrap();
        migrate(&mut db).unwrap();
        drop(db);
        let file = write_envelope(empty_payload());
        import(&db_path, file.path(), ImportMode::Merge, false, false).unwrap();
        let db = Connection::open(&db_path).unwrap();
        assert_eq!(
            db.query_row("SELECT COUNT(*) FROM backup_import_receipts", [], |row| row
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
    }
    #[test]
    fn reimport_requires_confirmation_but_is_allowed() {
        let directory = tempfile::tempdir().unwrap();
        let db_path = directory.path().join("db.sqlite");
        let mut db = Connection::open(&db_path).unwrap();
        migrate(&mut db).unwrap();
        drop(db);
        let file = write_envelope(empty_payload());
        import(&db_path, file.path(), ImportMode::Merge, false, false).unwrap();
        let preview = preview(&db_path, file.path()).unwrap();
        assert!(preview
            .warnings
            .iter()
            .any(|warning| warning.code == warning_code::PREVIOUSLY_IMPORTED));
        assert!(preview.previously_imported_at.is_some());
        assert_eq!(
            import(&db_path, file.path(), ImportMode::Merge, false, false)
                .unwrap_err()
                .code,
            error_code::BACKUP_REIMPORT_CONFIRMATION_REQUIRED
        );
        import(&db_path, file.path(), ImportMode::Merge, false, true).unwrap();
    }
    #[test]
    fn file_size_limit_is_enforced() {
        let file = tempfile::NamedTempFile::new().unwrap();
        file.as_file().set_len(MAX_FILE_SIZE + 1).unwrap();
        let error = read(file.path()).unwrap_err();
        assert_eq!(error.code, error_code::BACKUP_FILE_TOO_LARGE);
        assert_eq!(error.params.get("maxMiB"), Some(&AppErrorParam::Number(20)));
    }
}
