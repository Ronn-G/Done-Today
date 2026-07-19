import {z} from 'zod';
import {themePreferencesSchema} from '../theme/models';
import {workStatusSchema} from '../journal/models';

const id=z.string().trim().min(1).max(100);
const timestamp=z.string().datetime({offset:true});
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{
  const parsed=new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf())&&parsed.toISOString().slice(0,10)===value;
});
export const backupDailyLogSchema=z.object({id,logDate:date,createdAt:timestamp,updatedAt:timestamp}).strict();
export const backupWorkItemSchema=z.object({
  id,dailyLogId:id,categoryId:id.nullable(),task:z.string().max(500),result:z.string().max(2000),
  nextAction:z.string().max(1000),status:workStatusSchema,position:z.number().int().nonnegative(),
  createdAt:timestamp,updatedAt:timestamp,
}).strict();
export const backupCategorySchema=z.object({
  id,name:z.string().trim().min(1).max(80),color:z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  position:z.number().int().nonnegative(),isActive:z.boolean(),createdAt:timestamp,updatedAt:timestamp,
}).strict();
export const backupPayloadSchema=z.object({
  dailyLogs:z.array(backupDailyLogSchema),workItems:z.array(backupWorkItemSchema),
  workCategories:z.array(backupCategorySchema),themePreferences:themePreferencesSchema.nullable(),
}).strict().superRefine((payload,context)=>{
  const unique=(values:string[],path:string)=>{const seen=new Set<string>();values.forEach((value,index)=>{
    if(seen.has(value))context.addIssue({code:'custom',path:[path,index,'id'],message:'ID bị trùng.'});seen.add(value);
  })};
  unique(payload.dailyLogs.map(value=>value.id),'dailyLogs');
  unique(payload.workItems.map(value=>value.id),'workItems');
  unique(payload.workCategories.map(value=>value.id),'workCategories');
  const dates=new Set<string>();payload.dailyLogs.forEach((value,index)=>{
    if(dates.has(value.logDate))context.addIssue({code:'custom',path:['dailyLogs',index,'logDate'],message:'Ngày bị trùng.'});dates.add(value.logDate);
  });
  const logs=new Set(payload.dailyLogs.map(value=>value.id));
  const categories=new Set(payload.workCategories.map(value=>value.id));
  payload.workItems.forEach((value,index)=>{
    if(!logs.has(value.dailyLogId))context.addIssue({code:'custom',path:['workItems',index,'dailyLogId'],message:'Không tìm thấy ngày tham chiếu.'});
    if(value.categoryId!==null&&!categories.has(value.categoryId))context.addIssue({code:'custom',path:['workItems',index,'categoryId'],message:'Không tìm thấy nhóm tham chiếu.'});
  });
});
export const backupEnvelopeSchema=z.object({
  format:z.literal('done-today-backup'),version:z.literal(1),exportedAt:timestamp,
  appVersion:z.string().trim().min(1).max(40),payload:backupPayloadSchema,
  checksum:z.string().regex(/^sha256:[0-9a-f]{64}$/),
}).strict();
export type BackupPayloadV1=z.infer<typeof backupPayloadSchema>;
export type BackupEnvelopeV1=z.infer<typeof backupEnvelopeSchema>;
export function parseBackupEnvelope(value:unknown):BackupEnvelopeV1{
  if(typeof value==='object'&&value!==null&&'version'in value&&value.version!==1)
    throw new Error(Number(value.version)>1?'Bản sao lưu được tạo bởi phiên bản mới hơn của Done Today.':'Phiên bản bản sao lưu không được hỗ trợ.');
  return backupEnvelopeSchema.parse(value);
}
