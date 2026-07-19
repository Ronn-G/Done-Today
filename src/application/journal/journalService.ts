import { localDateSchema,updateWorkItemSchema } from '../../domain/journal/models';
import{categoryInputSchema,categoryUpdateSchema,groupDailyItems}from'../../domain/journal/categories';
import type { JournalRepository } from '../../domain/journal/repository';
export class JournalService {
  private readonly repository:JournalRepository;
  constructor(repository:JournalRepository){this.repository=repository}
  async initialize(){await this.repository.initialize()}
  async getDailyLog(date:string){return this.repository.getDailyLog(localDateSchema.parse(date))}
  async createWorkItem(date:string,categoryId:string|null=null){return this.repository.createWorkItem(localDateSchema.parse(date),categoryId)}
  async updateWorkItem(input:unknown){return this.repository.updateWorkItem(updateWorkItemSchema.parse(input))}
  async deleteWorkItem(id:string){return this.repository.deleteWorkItem(id)}
  async reorderWorkItems(logId:string,ids:string[]){return this.repository.reorderWorkItems(logId,ids)}
  async listCategories(includeInactive=true){return this.repository.listCategories(includeInactive)}
  async createCategory(input:unknown){return this.repository.createCategory(categoryInputSchema.parse(input))}
  async updateCategory(id:string,input:unknown){return this.repository.updateCategory(id,categoryUpdateSchema.parse(input))}
  async archiveCategory(id:string,isActive:boolean){return this.repository.archiveCategory(id,isActive)}
  async reorderCategories(ids:string[]){return this.repository.reorderCategories(ids)}
  async moveWorkItemToCategory(itemId:string,categoryId:string|null){return this.repository.assignWorkItemCategory(itemId,categoryId)}
  groupDailyItems=groupDailyItems;
  async listHistory(page:number,pageSize=20){
    if(!Number.isInteger(page)||page<1)throw new Error('Trang không hợp lệ');
    if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('Kích thước trang không hợp lệ');
    return this.repository.listDailyLogSummaries(page,pageSize);
  }
}
