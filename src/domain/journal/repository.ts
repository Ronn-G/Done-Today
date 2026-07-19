import type { DailyLog,HistoryPage,UpdateWorkItem,WorkItem } from './models';
import type{CategoryInput,CategoryUpdate,WorkCategory}from'./categories';
export interface JournalRepository {
  initialize(): Promise<void>;
  getDailyLog(date: string): Promise<DailyLog | null>;
  createWorkItem(date:string,categoryId?:string|null):Promise<WorkItem>;
  updateWorkItem(item:UpdateWorkItem):Promise<WorkItem>;
  deleteWorkItem(itemId:string):Promise<void>;
  reorderWorkItems(dailyLogId:string,orderedIds:string[]):Promise<WorkItem[]>;
  listCategories(includeInactive?:boolean):Promise<WorkCategory[]>;
  createCategory(input:CategoryInput):Promise<WorkCategory>;
  updateCategory(id:string,input:CategoryUpdate):Promise<WorkCategory>;
  archiveCategory(id:string,isActive:boolean):Promise<WorkCategory>;
  reorderCategories(orderedIds:string[]):Promise<WorkCategory[]>;
  assignWorkItemCategory(itemId:string,categoryId:string|null):Promise<WorkItem>;
  listDailyLogSummaries(page:number,pageSize:number):Promise<HistoryPage>;
}
