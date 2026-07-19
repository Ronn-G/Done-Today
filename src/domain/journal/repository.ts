import type { DailyLog,HistoryPage,UpdateWorkItem,WorkItem } from './models';
export interface JournalRepository {
  initialize(): Promise<void>;
  getDailyLog(date: string): Promise<DailyLog | null>;
  createWorkItem(date:string):Promise<WorkItem>;
  updateWorkItem(item:UpdateWorkItem):Promise<WorkItem>;
  deleteWorkItem(itemId:string):Promise<void>;
  reorderWorkItems(dailyLogId:string,orderedIds:string[]):Promise<WorkItem[]>;
  listDailyLogSummaries(page:number,pageSize:number):Promise<HistoryPage>;
}
