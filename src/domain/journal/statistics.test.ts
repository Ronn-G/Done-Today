import { describe,expect,it } from 'vitest';
import type { WorkItem } from './models';
import { calculateStatistics,statusLabels } from './statistics';
const item=(status:WorkItem['status']):WorkItem=>({
  id:crypto.randomUUID(),dailyLogId:'log',task:'',result:'',nextAction:'',status,position:0,createdAt:'',updatedAt:'',
});
describe('journal statistics',()=>{
  it('calculates totals and completion percentage',()=>{
    expect(calculateStatistics([item('completed'),item('in_progress'),item('completed')])).toEqual({total:3,completed:2,percentage:67});
  });
  it('maps every status to Vietnamese',()=>{
    expect(statusLabels).toEqual({completed:'Hoàn thành',in_progress:'Đang làm',postponed:'Bị hoãn',cancelled:'Đã hủy'});
  });
});
