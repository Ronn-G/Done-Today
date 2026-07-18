use chrono::{Local, Utc};
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use std::{fs, path::{Path, PathBuf}};
use tauri::Manager;
use uuid::Uuid;

const MIGRATION_V1: &str = include_str!("../migrations/001_initial.sql");

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkItem {
    id: String, daily_log_id: String, task: String, result: String,
    next_action: String, status: String, position: i64,
    created_at: String, updated_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DailyLog {
    id: String, log_date: String, created_at: String, updated_at: String,
    items: Vec<WorkItem>,
}

fn migrate(connection: &mut Connection) -> rusqlite::Result<()> {
    connection.pragma_update(None, "foreign_keys", "ON")?;
    let transaction = connection.transaction()?;
    transaction.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL
        );",
    )?;
    let applied: bool = transaction.query_row(
        "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?1)",
        [1], |row| row.get(0),
    )?;
    if !applied {
        transaction.execute_batch(MIGRATION_V1)?;
        transaction.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, ?2)",
            params![1, Utc::now().to_rfc3339()],
        )?;
    }
    transaction.commit()
}

fn seed_development(connection: &mut Connection) -> rusqlite::Result<()> {
    if !cfg!(debug_assertions) { return Ok(()); }
    let date = Local::now().format("%Y-%m-%d").to_string();
    let exists: bool = connection.query_row(
        "SELECT EXISTS(SELECT 1 FROM daily_logs WHERE log_date = ?1)", [&date], |row| row.get(0),
    )?;
    if exists { return Ok(()); }
    let transaction = connection.transaction()?;
    let log_id = Uuid::new_v4().to_string();
    let item_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    transaction.execute(
        "INSERT INTO daily_logs (id, log_date, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        params![log_id, date, now, now],
    )?;
    transaction.execute(
        "INSERT INTO work_items
        (id,daily_log_id,task,result,next_action,status,position,created_at,updated_at)
        VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![item_id, log_id, "Khởi tạo ứng dụng Done Today",
            "Ứng dụng đã kết nối và đọc dữ liệu từ SQLite",
            "Triển khai chỉnh sửa trực tiếp trong bảng", "completed", 0, now, now],
    )?;
    transaction.commit()
}

fn open_database(path: &Path) -> Result<Connection, String> {
    if let Some(parent) = path.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
    let mut connection = Connection::open(path).map_err(|e| e.to_string())?;
    migrate(&mut connection).map_err(|e| e.to_string())?;
    seed_development(&mut connection).map_err(|e| e.to_string())?;
    Ok(connection)
}

#[tauri::command]
fn initialize_database(app: tauri::AppHandle) -> Result<(), String> {
    open_database(&database_path(&app)?)?;
    Ok(())
}

#[tauri::command]
fn get_daily_log(app: tauri::AppHandle, date: String) -> Result<Option<DailyLog>, String> {
    let connection = open_database(&database_path(&app)?)?;
    find_daily_log(&connection, &date).map_err(|e| e.to_string())
}

fn find_daily_log(connection: &Connection, date: &str) -> rusqlite::Result<Option<DailyLog>> {
    let header = connection.query_row(
        "SELECT id, log_date, created_at, updated_at FROM daily_logs WHERE log_date = ?1",
        [date], |row| Ok((row.get(0)?,row.get(1)?,row.get(2)?,row.get(3)?)),
    ).optional()?;
    let Some((id,log_date,created_at,updated_at)) = header else { return Ok(None); };
    let mut statement = connection.prepare(
        "SELECT id,daily_log_id,task,result,next_action,status,position,created_at,updated_at
         FROM work_items WHERE daily_log_id = ?1 ORDER BY position, created_at",
    )?;
    let items = statement.query_map([&id], |row| Ok(WorkItem {
        id:row.get(0)?,daily_log_id:row.get(1)?,task:row.get(2)?,result:row.get(3)?,
        next_action:row.get(4)?,status:row.get(5)?,position:row.get(6)?,
        created_at:row.get(7)?,updated_at:row.get(8)?,
    }))?.collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(Some(DailyLog { id,log_date,created_at,updated_at,items }))
}

fn database_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map(|path| path.join("done-today.sqlite3")).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![initialize_database, get_daily_log])
        .run(tauri::generate_context!())
        .expect("error while running Done Today");
}

#[cfg(test)]
mod tests {
    use super::*;
    fn memory() -> Connection {
        let mut connection=Connection::open_in_memory().unwrap();
        migrate(&mut connection).unwrap();
        connection
    }
    fn insert_seed(connection:&mut Connection) {
        let tx=connection.transaction().unwrap();
        tx.execute("INSERT INTO daily_logs VALUES (?1,?2,?3,?4)",params!["log","2026-07-18","now","now"]).unwrap();
        tx.execute("INSERT INTO work_items VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",params!["item","log","Task","Result","Next","completed",0,"now","now"]).unwrap();
        tx.commit().unwrap();
    }
    #[test] fn migration_is_idempotent() {
        let mut db=memory(); insert_seed(&mut db); migrate(&mut db).unwrap();
        assert_eq!(db.query_row("SELECT COUNT(*) FROM work_items",[],|r|r.get::<_,i64>(0)).unwrap(),1);
    }
    #[test] fn constraints_work() {
        let mut db=memory(); insert_seed(&mut db);
        assert!(db.execute("INSERT INTO work_items VALUES ('bad','log','','','','wrong',1,'','')",[]).is_err());
        db.execute("DELETE FROM daily_logs WHERE id=?1",["log"]).unwrap();
        assert_eq!(db.query_row("SELECT COUNT(*) FROM work_items",[],|r|r.get::<_,i64>(0)).unwrap(),0);
    }
    #[test] fn repository_reads_log_and_items() {
        let mut db=memory(); insert_seed(&mut db);
        let log=find_daily_log(&db,"2026-07-18").unwrap().unwrap();
        assert_eq!(log.items.len(),1); assert_eq!(log.items[0].task,"Task");
    }
    #[test] fn development_seed_does_not_duplicate() {
        let mut db=memory();
        seed_development(&mut db).unwrap();
        seed_development(&mut db).unwrap();
        assert_eq!(db.query_row("SELECT COUNT(*) FROM daily_logs",[],|r|r.get::<_,i64>(0)).unwrap(),1);
        assert_eq!(db.query_row("SELECT COUNT(*) FROM work_items",[],|r|r.get::<_,i64>(0)).unwrap(),1);
    }
}
