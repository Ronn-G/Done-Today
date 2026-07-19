import{describe,expect,it}from'vitest';
import{categoryInputSchema,groupDailyItems,parseCollapsedCategoryState,sortItemsByBucket,type WorkCategory}from'./categories';
import type{WorkItem}from'./models';
const item=(id:string,status:WorkItem['status'],categoryId:string|null,position:number):WorkItem=>({id,dailyLogId:'log',task:id,result:'',nextAction:'',status,position,categoryId,createdAt:`2026-01-01T00:00:0${position}Z`,updatedAt:'2026-01-01T00:00:00Z'});
const categories:WorkCategory[]=[{id:'a',name:'A',color:'#4F7CAC',position:1,isActive:true,createdAt:'',updatedAt:''},{id:'b',name:'B',color:'#7A6FA8',position:0,isActive:false,createdAt:'',updatedAt:''}];
describe('work categories',()=>{
  it('validates category input',()=>expect(categoryInputSchema.parse({name:' Học tập ',color:'#4F8A65'}).name).toBe('Học tập'));
  it('rejects empty and overlong names',()=>{expect(()=>categoryInputSchema.parse({name:' ',color:'#4F8A65'})).toThrow();expect(()=>categoryInputSchema.parse({name:'x'.repeat(101),color:'#4F8A65'})).toThrow()});
  it('rejects invalid HEX',()=>expect(()=>categoryInputSchema.parse({name:'A',color:'red'})).toThrow());
  it('groups null as Việc khác and keeps inactive used groups',()=>{const groups=groupDailyItems([item('1','in_progress',null,0),item('2','completed','b',0)],categories);expect(groups.map(group=>group.name)).toEqual(['B','Việc khác'])});
  it('orders active categories by position',()=>{const active=categories.map(category=>({...category,isActive:true}));expect(groupDailyItems([item('a','in_progress','a',0),item('b','in_progress','b',0)],active).map(group=>group.id)).toEqual(['b','a'])});
  it('places completed after non-completed while preserving bucket position',()=>expect(sortItemsByBucket([item('done','completed','a',0),item('todo','in_progress','a',3)]).map(value=>value.id)).toEqual(['todo','done']));
  it('calculates category statistics',()=>expect(groupDailyItems([item('1','completed','a',0),item('2','in_progress','a',1)],categories)[0]).toMatchObject({totalItems:2,completedItems:1}));
  it('validates collapsed state and drops stale ids',()=>expect(parseCollapsedCategoryState(JSON.stringify({schemaVersion:1,collapsedCategoryIds:['a','stale']}),['a'])).toEqual({schemaVersion:1,collapsedCategoryIds:['a']}));
});
