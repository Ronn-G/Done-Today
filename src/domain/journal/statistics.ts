import type { WorkItem } from './models';
export function calculateStatistics(items: WorkItem[]) {
  const total=items.length;
  const completed=items.filter((item)=>item.status==='completed').length;
  return { total, completed, percentage:total===0?0:Math.round(completed/total*100) };
}
