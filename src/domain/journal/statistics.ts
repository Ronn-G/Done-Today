import type { WorkItem, WorkStatus } from './models';
export const statusLabels: Record<WorkStatus,string> = {
  completed:'Hoàn thành', in_progress:'Đang làm', postponed:'Bị hoãn', cancelled:'Đã hủy',
};
export function calculateStatistics(items: WorkItem[]) {
  const total=items.length;
  const completed=items.filter((item)=>item.status==='completed').length;
  return { total, completed, percentage:total===0?0:Math.round(completed/total*100) };
}
