import { invoke } from '@tauri-apps/api/core';
import { dailyLogSchema,historyPageSchema,workItemSchema } from '../../domain/journal/models';
import type { UpdateWorkItem } from '../../domain/journal/models';
import type { JournalRepository } from '../../domain/journal/repository';
export class TauriJournalRepository implements JournalRepository {
  private initialized=false;
  async initialize() {
    if (!this.initialized) { await invoke('initialize_database'); this.initialized=true; }
  }
  async getDailyLog(date:string) {
    const result=await invoke<unknown>('get_daily_log',{date});
    return result===null?null:dailyLogSchema.parse(result);
  }
  async createWorkItem(date:string){return workItemSchema.parse(await invoke<unknown>('create_work_item',{date}))}
  async updateWorkItem(item:UpdateWorkItem){return workItemSchema.parse(await invoke<unknown>('update_work_item',{input:item}))}
  async deleteWorkItem(itemId:string){await invoke('delete_work_item',{itemId})}
  async reorderWorkItems(dailyLogId:string,orderedIds:string[]){
    return workItemSchema.array().parse(await invoke<unknown>('reorder_work_items',{dailyLogId,orderedIds}));
  }
  async listDailyLogSummaries(page:number,pageSize:number){
    return historyPageSchema.parse(await invoke<unknown>('list_daily_log_summaries',{page,pageSize}));
  }
}
