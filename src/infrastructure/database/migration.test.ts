import initSqlJs from 'sql.js';
import { beforeAll,describe,expect,it } from 'vitest';
import { migrationV1 } from './migration';
type SqlJs = Awaited<ReturnType<typeof initSqlJs>>;
let SQL:SqlJs;
beforeAll(async()=>{ SQL=await initSqlJs(); });
function database() {
  const db=new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(migrationV1);
  return db;
}
function seed(db:InstanceType<SqlJs['Database']>) {
  db.run("INSERT INTO daily_logs VALUES (?,?,?,?)",['log','2026-07-18','now','now']);
  db.run("INSERT INTO work_items VALUES (?,?,?,?,?,?,?,?,?)",['item','log','Task','','','completed',0,'now','now']);
}
describe('migration v1',()=>{
  it('creates the required tables',()=>{
    const db=database();
    const rows=db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0].values.flat();
    expect(rows).toEqual(expect.arrayContaining(['daily_logs','schema_migrations','work_items']));
  });
  it('can run repeatedly without damaging data',()=>{
    const db=database(); seed(db); db.run(migrationV1);
    expect(db.exec('SELECT COUNT(*) FROM work_items')[0].values[0][0]).toBe(1);
  });
  it('rejects an invalid status',()=>{
    const db=database();
    db.run("INSERT INTO daily_logs VALUES ('log','2026-07-18','now','now')");
    expect(()=>db.run("INSERT INTO work_items VALUES ('i','log','Task','','','invalid',0,'now','now')")).toThrow();
  });
  it('enforces foreign keys and cascade delete',()=>{
    const db=database();
    expect(()=>db.run("INSERT INTO work_items VALUES ('i','missing','Task','','','completed',0,'now','now')")).toThrow();
    seed(db); db.run("DELETE FROM daily_logs WHERE id='log'");
    expect(db.exec('SELECT COUNT(*) FROM work_items')[0].values[0][0]).toBe(0);
  });
});
