import {describe,expect,it} from 'vitest';
import {addLocalDays,isValidLocalDate,localDateKey,parseLocalDate} from './date';
describe('local date utilities',()=>{
  it('formats local components without UTC conversion',()=>expect(localDateKey(new Date(2026,6,18,0,5))).toBe('2026-07-18'));
  it('accepts leap day',()=>expect(parseLocalDate('2028-02-29')).not.toBeNull());
  it('rejects impossible dates',()=>expect(isValidLocalDate('2026-02-31')).toBe(false));
  it('crosses month boundaries',()=>expect(addLocalDays('2026-03-01',-1)).toBe('2026-02-28'));
  it('crosses year boundaries',()=>expect(addLocalDays('2026-12-31',1)).toBe('2027-01-01'));
});
