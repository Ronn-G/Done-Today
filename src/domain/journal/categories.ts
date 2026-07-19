import{z}from'zod';
import type{WorkItem}from'./models';

export const categoryColorSchema=z.string().regex(/^#[0-9A-Fa-f]{6}$/,'Màu nhóm phải dùng HEX #RRGGBB.');
export const categoryNameSchema=z.string().trim().min(1,'Tên nhóm không được để trống.').max(100,'Tên nhóm tối đa 100 ký tự.');
export const workCategorySchema=z.object({
  id:z.string().min(1),name:categoryNameSchema,color:categoryColorSchema,
  position:z.number().int().nonnegative(),isActive:z.boolean(),createdAt:z.string(),updatedAt:z.string(),
});
export type WorkCategory=z.infer<typeof workCategorySchema>;
export const categoryInputSchema=z.object({name:categoryNameSchema,color:categoryColorSchema});
export type CategoryInput=z.infer<typeof categoryInputSchema>;
export const categoryUpdateSchema=categoryInputSchema.extend({isActive:z.boolean()});
export type CategoryUpdate=z.infer<typeof categoryUpdateSchema>;
export type CategoryGroup={id:string|null;category:WorkCategory|null;name:string;color:string|null;isActive:boolean;items:WorkItem[];totalItems:number;completedItems:number};

export function sortItemsByBucket(items:readonly WorkItem[]):WorkItem[]{
  return[...items].sort((a,b)=>Number(a.status==='completed')-Number(b.status==='completed')||a.position-b.position||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
}
export function groupDailyItems(items:readonly WorkItem[],categories:readonly WorkCategory[]):CategoryGroup[]{
  const byId=new Map(categories.map(category=>[category.id,category]));
  const used=new Map<string|null,WorkItem[]>();
  for(const item of items){const key=item.categoryId&&byId.has(item.categoryId)?item.categoryId:null;const current=used.get(key)??[];current.push(item);used.set(key,current)}
  const active=categories.filter(category=>category.isActive&&used.has(category.id)).sort((a,b)=>a.position-b.position);
  const inactive=categories.filter(category=>!category.isActive&&used.has(category.id)).sort((a,b)=>a.position-b.position);
  const make=(category:WorkCategory):CategoryGroup=>{const grouped=sortItemsByBucket(used.get(category.id)??[]);return{id:category.id,category,name:category.name,color:category.color,isActive:category.isActive,items:grouped,totalItems:grouped.length,completedItems:grouped.filter(item=>item.status==='completed').length}};
  const result=[...active.map(make),...inactive.map(make)];
  if(used.has(null)){const grouped=sortItemsByBucket(used.get(null)??[]);result.push({id:null,category:null,name:'Việc khác',color:null,isActive:true,items:grouped,totalItems:grouped.length,completedItems:grouped.filter(item=>item.status==='completed').length})}
  return result;
}
export const collapsedCategoryStateSchema=z.object({schemaVersion:z.literal(1),collapsedCategoryIds:z.array(z.string()).catch([])});
export type CollapsedCategoryState=z.infer<typeof collapsedCategoryStateSchema>;
export function parseCollapsedCategoryState(raw:string|null,validIds:readonly string[]):CollapsedCategoryState{
  try{const parsed=collapsedCategoryStateSchema.parse(JSON.parse(raw??''));const valid=new Set(validIds);return{schemaVersion:1,collapsedCategoryIds:parsed.collapsedCategoryIds.filter(id=>id==='__other__'||valid.has(id))}}catch{return{schemaVersion:1,collapsedCategoryIds:[]}}
}
