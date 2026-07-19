use crate::{validate_theme_preferences, AppError, AppResult, STATUSES, THEME_KEY};
use chrono::{DateTime, NaiveDate, Utc};
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, HashSet},
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::Path,
};
use uuid::Uuid;

const FORMAT: &str = "done-today-backup";
const VERSION: i64 = 1;
const MAX_FILE_SIZE: u64 = 20 * 1024 * 1024;

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
    warnings: Vec<String>,
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

fn error(code: &'static str, message: &str) -> AppError {
    AppError {
        code,
        message: message.into(),
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
        .map_err(|_| error("unknown", "Không thể tạo bản sao lưu."))?;
    serde_json::to_string(&value).map_err(|_| error("unknown", "Không thể tạo bản sao lưu."))
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
            return Err(AppError::validation("ID ngày bị trống hoặc trùng."));
        }
        let parsed = NaiveDate::parse_from_str(&log.log_date, "%Y-%m-%d")
            .map_err(|_| AppError::validation("Ngày trong bản sao lưu không hợp lệ."))?;
        if parsed.format("%Y-%m-%d").to_string() != log.log_date
            || !dates.insert(log.log_date.as_str())
        {
            return Err(AppError::validation(
                "Ngày trong bản sao lưu bị trùng hoặc không hợp lệ.",
            ));
        }
        if !valid_timestamp(&log.created_at) || !valid_timestamp(&log.updated_at) {
            return Err(AppError::validation("Mốc thời gian không hợp lệ."));
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
            return Err(AppError::validation("ID nhóm bị trống hoặc trùng."));
        }
        if category.name.trim().is_empty() || category.name.chars().count() > 80 {
            return Err(AppError::validation("Tên nhóm không hợp lệ."));
        }
        if category.color.len() != 7
            || !category.color.starts_with('#')
            || !category.color[1..]
                .chars()
                .all(|value| value.is_ascii_hexdigit())
        {
            return Err(AppError::validation("Màu nhóm phải có dạng #RRGGBB."));
        }
        if category.position < 0
            || !valid_timestamp(&category.created_at)
            || !valid_timestamp(&category.updated_at)
        {
            return Err(AppError::validation("Dữ liệu nhóm không hợp lệ."));
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
            return Err(AppError::validation("ID công việc bị trống hoặc trùng."));
        }
        if !log_ids.contains(item.daily_log_id.as_str()) {
            return Err(AppError::validation(
                "Công việc tham chiếu đến ngày không tồn tại.",
            ));
        }
        if item
            .category_id
            .as_deref()
            .is_some_and(|id| !category_ids.contains(id))
        {
            return Err(AppError::validation(
                "Công việc tham chiếu đến nhóm không tồn tại.",
            ));
        }
        if !STATUSES.contains(&item.status.as_str())
            || item.position < 0
            || item.task.chars().count() > 500
            || item.result.chars().count() > 2000
            || item.next_action.chars().count() > 1000
            || !valid_timestamp(&item.created_at)
            || !valid_timestamp(&item.updated_at)
        {
            return Err(AppError::validation("Dữ liệu công việc không hợp lệ."));
        }
    }
    if let Some(theme) = &payload.theme_preferences {
        validate_theme_preferences(theme)?;
    }
    Ok(())
}
fn read(path: &Path) -> AppResult<BackupEnvelopeV1> {
    let metadata =
        fs::metadata(path).map_err(|_| error("file_read", "Không thể đọc file sao lưu."))?;
    if metadata.len() > MAX_FILE_SIZE {
        return Err(error(
            "file_too_large",
            "File sao lưu lớn hơn giới hạn 20 MiB.",
        ));
    }
    let file = File::open(path).map_err(|_| error("file_read", "Không thể đọc file sao lưu."))?;
    let mut bytes = Vec::with_capacity(metadata.len() as usize);
    file.take(MAX_FILE_SIZE + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| error("file_read", "Không thể đọc file sao lưu."))?;
    let value: serde_json::Value = serde_json::from_slice(&bytes)
        .map_err(|_| AppError::validation("File không phải JSON hợp lệ."))?;
    let version = value
        .get("version")
        .and_then(serde_json::Value::as_i64)
        .ok_or_else(|| AppError::validation("Thiếu phiên bản bản sao lưu."))?;
    if version > VERSION {
        return Err(error(
            "unsupported_version",
            "Bản sao lưu được tạo bởi phiên bản mới hơn của Done Today.",
        ));
    }
    if version < VERSION {
        return Err(error(
            "unsupported_version",
            "Phiên bản bản sao lưu không được hỗ trợ.",
        ));
    }
    let envelope: BackupEnvelopeV1 = serde_json::from_value(value)
        .map_err(|_| AppError::validation("Cấu trúc bản sao lưu không hợp lệ."))?;
    if envelope.format != FORMAT {
        return Err(AppError::validation("Định dạng bản sao lưu không hợp lệ."));
    }
    if !valid_timestamp(&envelope.exported_at) {
        return Err(AppError::validation("Thời điểm xuất không hợp lệ."));
    }
    validate(&envelope.payload)?;
    if checksum(&envelope.payload)? != envelope.checksum {
        return Err(error(
            "checksum_mismatch",
            "Checksum không khớp. File có thể đã bị thay đổi.",
        ));
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
        .map_err(|_| AppError::validation("Giao diện đã lưu không hợp lệ."))?;
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
        .ok_or_else(|| error("file_write", "Vị trí lưu không hợp lệ."))?;
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
    result.map_err(|_| {
        error(
            "file_write",
            "Không thể ghi file sao lưu. Vui lòng chọn vị trí khác.",
        )
    })
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
        .map_err(|_| error("unknown", "Không thể tạo bản sao lưu."))?;
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
            (Some(_), _) => {
                return Err(error(
                    "conflict",
                    "ID ngày trùng nhưng ngày khác; không thể hợp nhất an toàn.",
                ))
            }
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
            .ok_or_else(|| AppError::validation("Thiếu ánh xạ ngày."))?;
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
        warnings.push("Bản sao lưu được tạo bởi phiên bản ứng dụng khác.".into());
    }
    if previously_imported_at.is_some() {
        warnings.push("Bản sao lưu này đã từng được nhập.".into());
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
        return Err(error(
            "conflict",
            "Bản sao lưu này đã từng được nhập. Hãy xác nhận để nhập lại.",
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
            params![THEME_KEY,serde_json::to_string(theme).map_err(|_|AppError::validation("Giao diện không hợp lệ."))?,Utc::now().to_rfc3339()])?;
    }
    let summary=serde_json::to_string(&serde_json::json!({"dailyLogs":envelope.payload.daily_logs.len(),"workItems":envelope.payload.work_items.len(),"workCategories":envelope.payload.work_categories.len(),"remapped":remapped}))
        .map_err(|_|error("unknown","Không thể ghi biên nhận."))?;
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
        assert_eq!(validate(&value).unwrap_err().code, "validation")
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
    fn invalid_json_is_rejected() {
        let file = tempfile::NamedTempFile::new().unwrap();
        fs::write(file.path(), b"{").unwrap();
        assert_eq!(read(file.path()).unwrap_err().code, "validation")
    }
    #[test]
    fn wrong_format_is_rejected() {
        let payload = empty_payload();
        let file = write_envelope(payload);
        let mut value: serde_json::Value =
            serde_json::from_slice(&fs::read(file.path()).unwrap()).unwrap();
        value["format"] = "wrong".into();
        fs::write(file.path(), serde_json::to_vec(&value).unwrap()).unwrap();
        assert_eq!(read(file.path()).unwrap_err().code, "validation")
    }
    #[test]
    fn unsupported_version_is_rejected() {
        let file = tempfile::NamedTempFile::new().unwrap();
        fs::write(file.path(), br#"{"version":2}"#).unwrap();
        assert_eq!(read(file.path()).unwrap_err().code, "unsupported_version")
    }
    #[test]
    fn checksum_mismatch_is_rejected() {
        let file = write_envelope(empty_payload());
        let mut value: serde_json::Value =
            serde_json::from_slice(&fs::read(file.path()).unwrap()).unwrap();
        value["checksum"] = format!("sha256:{}", "0".repeat(64)).into();
        fs::write(file.path(), serde_json::to_vec(&value).unwrap()).unwrap();
        assert_eq!(read(file.path()).unwrap_err().code, "checksum_mismatch")
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
        assert_eq!(
            import(&db_path, file.path(), ImportMode::Merge, false, false)
                .unwrap_err()
                .code,
            "conflict"
        );
        import(&db_path, file.path(), ImportMode::Merge, false, true).unwrap();
    }
    #[test]
    fn file_size_limit_is_enforced() {
        let file = tempfile::NamedTempFile::new().unwrap();
        file.as_file().set_len(MAX_FILE_SIZE + 1).unwrap();
        assert_eq!(read(file.path()).unwrap_err().code, "file_too_large");
    }
}
