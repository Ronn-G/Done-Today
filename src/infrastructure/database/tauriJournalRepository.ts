import { invoke } from '@tauri-apps/api/core';
import { dailyLogSchema } from '../../domain/journal/models';
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
}
