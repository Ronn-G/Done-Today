import type { WorkItem } from './models';
export function calculateStatistics(items: WorkItem[]) {
  const total=items.length;
  const completed=items.filter((item)=>item.status==='completed').length;
  return { total, completed, percentage:total===0?0:Math.round(completed/total*100) };
}

const LOCAL_DATE=/^(\d{4})-(\d{2})-(\d{2})$/;
const MILLISECONDS_PER_DAY=86_400_000;

function localDayOrdinal(value:string){
  const match=LOCAL_DATE.exec(value);if(!match)return null;
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  const date=new Date(0);
  date.setUTCHours(0,0,0,0);
  date.setUTCFullYear(year,month-1,day);
  if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
  return Math.floor(date.getTime()/MILLISECONDS_PER_DAY);
}

export function calculateCurrentStreak(activityDates:readonly string[],today:string){
  const todayOrdinal=localDayOrdinal(today);if(todayOrdinal===null)return 0;
  const activity=new Set<number>();
  for(const value of activityDates){
    const ordinal=localDayOrdinal(value);
    if(ordinal!==null&&ordinal<=todayOrdinal)activity.add(ordinal);
  }
  let cursor=activity.has(todayOrdinal)?todayOrdinal:todayOrdinal-1;
  if(!activity.has(cursor))return 0;
  let streak=0;
  while(activity.has(cursor)){streak++;cursor--}
  return streak;
}
