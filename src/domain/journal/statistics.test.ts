import { describe,expect,it } from 'vitest';
import {workStatusSchema,type WorkItem} from './models';
import { calculateStatistics } from './statistics';
const item=(status:WorkItem['status']):WorkItem=>({
  id:crypto.randomUUID(),dailyLogId:'log',task:'',result:'',nextAction:'',status,position:0,categoryId:null,createdAt:'',updatedAt:'',
});
describe('journal statistics',()=>{
  it('calculates totals and completion percentage',()=>{
    expect(calculateStatistics([item('completed'),item('in_progress'),item('completed')])).toEqual({total:3,completed:2,percentage:67});
  });
  it('keeps every status as a locale-neutral stable ID',()=>{
    expect(workStatusSchema.options).toEqual(['completed','in_progress','postponed','cancelled']);
  });
});
