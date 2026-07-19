import{describe,expect,it}from'vitest';
import{canonicalPayload,checksumPayload}from'./canonical';
import{backupEnvelopeSchema,backupPayloadSchema,parseBackupEnvelope,type BackupPayloadV1}from'./models';
const now='2026-07-19T00:00:00.000Z';
const payload:BackupPayloadV1={dailyLogs:[{id:'b',logDate:'2026-07-19',createdAt:now,updatedAt:now},{id:'a',logDate:'2026-07-18',createdAt:now,updatedAt:now}],
  workItems:[{id:'i',dailyLogId:'b',categoryId:null,task:'Việc',result:'',nextAction:'',status:'completed',position:0,createdAt:now,updatedAt:now}],
  workCategories:[],themePreferences:null};
describe('backup v1',()=>{
  it('validates a complete envelope',async()=>expect(backupEnvelopeSchema.safeParse({format:'done-today-backup',version:1,exportedAt:now,appVersion:'0.1.0',payload,checksum:await checksumPayload(payload)}).success).toBe(true));
  it('rejects wrong format and versions',()=>{expect(()=>parseBackupEnvelope({format:'bad',version:1})).toThrow();expect(()=>parseBackupEnvelope({version:2})).toThrow(/mới hơn/)});
  it('canonicalizes object and collection order',()=>expect(canonicalPayload({...payload,dailyLogs:[...payload.dailyLogs].reverse()})).toBe(canonicalPayload(payload)));
  it('has a stable and sensitive checksum',async()=>{expect(await checksumPayload(payload)).toBe(await checksumPayload({...payload,dailyLogs:[...payload.dailyLogs].reverse()}));expect(await checksumPayload(payload)).not.toBe(await checksumPayload({...payload,workItems:[{...payload.workItems[0],task:'Khác'}]}))});
  it('rejects invalid payload boundaries',()=>{
    expect(backupPayloadSchema.safeParse({...payload,dailyLogs:[payload.dailyLogs[0],payload.dailyLogs[0]]}).success).toBe(false);
    expect(backupPayloadSchema.safeParse({...payload,dailyLogs:[{...payload.dailyLogs[0],logDate:'2026-02-31'}]}).success).toBe(false);
    expect(backupPayloadSchema.safeParse({...payload,workItems:[{...payload.workItems[0],status:'bad'}]}).success).toBe(false);
    expect(backupPayloadSchema.safeParse({...payload,workItems:[{...payload.workItems[0],dailyLogId:'missing'}]}).success).toBe(false);
    expect(backupPayloadSchema.safeParse({...payload,workItems:[{...payload.workItems[0],categoryId:'missing'}]}).success).toBe(false);
  });
});
