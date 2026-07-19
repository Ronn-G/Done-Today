import{describe,expect,it}from'vitest';
import type{WorkCategory}from'../../domain/journal/categories';
import{getRowActionDestinations,moveItemAfterFlush,positionRowActionMenu,ROW_ACTION_COLUMN_COUNT}from'./rowActionMenu';
const category=(id:string,isActive:boolean):WorkCategory=>({id,name:id,color:'#112233',position:0,isActive,createdAt:'',updatedAt:''});
describe('row action menu',()=>{
  it('lists only active destinations',()=>expect(getRowActionDestinations([category('active',true),category('hidden',false)]).map(value=>value.id)).toEqual(['active']));
  it('keeps the six-column contract',()=>expect(ROW_ACTION_COLUMN_COUNT).toBe(6));
  it('clamps left and flips above near the bottom',()=>expect(positionRowActionMenu({left:850,right:890,top:550,bottom:590},{width:900,height:600})).toEqual({left:666,top:284}));
  it('stays in the top-left viewport',()=>expect(positionRowActionMenu({left:2,right:34,top:2,bottom:34},{width:900,height:600})).toEqual({left:8,top:40}));
  it('flushes before moving and does not move after flush failure',async()=>{const order:string[]=[];await moveItemAfterFlush('active',async()=>{order.push('flush')},async()=>{order.push('move')});expect(order).toEqual(['flush','move']);await expect(moveItemAfterFlush(null,async()=>{throw new Error('save')},async()=>{order.push('bad move')})).rejects.toThrow('save');expect(order).not.toContain('bad move')});
});
