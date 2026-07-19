import type {BackupPayloadV1} from './models';
type Json=string|number|boolean|null|Json[]|{[key:string]:Json};
function normalize(value:Json):Json{
  if(Array.isArray(value))return value.map(normalize);
  if(value!==null&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key])]));
  return value;
}
const sortBy=(keys:string[])=>(left:Record<string,unknown>,right:Record<string,unknown>)=>{
  for(const key of keys){const a=left[key],b=right[key];const order=typeof a==='number'&&typeof b==='number'?a-b:String(a??'').localeCompare(String(b??''));if(order)return order}return 0;
};
export function canonicalPayload(payload:BackupPayloadV1):string{
  const stable={dailyLogs:[...payload.dailyLogs].sort(sortBy(['logDate','id'])),
    workItems:[...payload.workItems].sort(sortBy(['dailyLogId','position','id'])),
    workCategories:[...payload.workCategories].sort(sortBy(['position','id'])),
    themePreferences:payload.themePreferences}as unknown as Json;
  return JSON.stringify(normalize(stable));
}
export async function checksumPayload(payload:BackupPayloadV1):Promise<string>{
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalPayload(payload)));
  return`sha256:${[...new Uint8Array(digest)].map(value=>value.toString(16).padStart(2,'0')).join('')}`;
}
