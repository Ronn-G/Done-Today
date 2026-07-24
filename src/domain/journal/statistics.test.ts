import { describe,expect,it } from 'vitest';
import {workStatusSchema,type WorkItem} from './models';
import {calculateCurrentStreak,calculateStatistics} from './statistics';
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

describe('current journal streak',()=>{
  it('returns zero without activity',()=>expect(calculateCurrentStreak([],'2026-07-24')).toBe(0));
  it('counts today as one',()=>expect(calculateCurrentStreak(['2026-07-24'],'2026-07-24')).toBe(1));
  it('counts consecutive days ending today',()=>{
    expect(calculateCurrentStreak(['2026-07-22','2026-07-23','2026-07-24'],'2026-07-24')).toBe(3);
  });
  it('keeps a streak ending yesterday when today is empty',()=>{
    expect(calculateCurrentStreak(['2026-07-21','2026-07-22','2026-07-23'],'2026-07-24')).toBe(3);
  });
  it('returns zero when the latest activity is older than yesterday',()=>{
    expect(calculateCurrentStreak(['2026-07-22'],'2026-07-24')).toBe(0);
  });
  it('stops at the nearest gap',()=>{
    expect(calculateCurrentStreak(['2026-07-20','2026-07-22','2026-07-23','2026-07-24'],'2026-07-24')).toBe(3);
  });
  it('accepts unordered input without mutating it',()=>{
    const dates=['2026-07-24','2026-07-22','2026-07-23'];const before=[...dates];
    expect(calculateCurrentStreak(dates,'2026-07-24')).toBe(3);expect(dates).toEqual(before);
  });
  it('deduplicates dates',()=>{
    expect(calculateCurrentStreak(['2026-07-24','2026-07-24','2026-07-23'],'2026-07-24')).toBe(2);
  });
  it('ignores future dates',()=>{
    expect(calculateCurrentStreak(['2026-07-23','2026-07-24','2026-07-25'],'2026-07-24')).toBe(2);
  });
  it('crosses a month boundary',()=>{
    expect(calculateCurrentStreak(['2026-02-28','2026-03-01'],'2026-03-01')).toBe(2);
  });
  it('crosses a year boundary',()=>{
    expect(calculateCurrentStreak(['2025-12-31','2026-01-01'],'2026-01-01')).toBe(2);
  });
  it('crosses leap day',()=>{
    expect(calculateCurrentStreak(['2028-02-28','2028-02-29','2028-03-01'],'2028-03-01')).toBe(3);
  });
  it('ignores impossible non-leap dates',()=>{
    expect(calculateCurrentStreak(['2026-02-29'],'2026-03-01')).toBe(0);
  });
  it('ignores malformed activity dates and handles malformed today safely',()=>{
    expect(calculateCurrentStreak(['bad','2026-7-24','2026-07-24'],'2026-07-24')).toBe(1);
    expect(calculateCurrentStreak(['2026-07-24'],'not-a-date')).toBe(0);
  });
});
