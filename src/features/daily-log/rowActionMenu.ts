import type{WorkCategory}from'../../domain/journal/categories';
export const ROW_ACTION_COLUMN_COUNT=6;
export function getRowActionDestinations(categories:readonly WorkCategory[]){return categories.filter(category=>category.isActive)}
export function positionRowActionMenu(trigger:Pick<DOMRect,'left'|'right'|'top'|'bottom'>,viewport:{width:number;height:number},menu={width:224,height:260},margin=8){
  const left=Math.max(margin,Math.min(trigger.right-menu.width,viewport.width-menu.width-margin));
  const below=trigger.bottom+6;const top=below+menu.height<=viewport.height-margin?below:Math.max(margin,trigger.top-menu.height-6);
  return{left,top};
}
export async function moveItemAfterFlush(categoryId:string|null,flush:()=>Promise<void>,move:(id:string|null)=>Promise<void>){
  await flush();await move(categoryId);
}
