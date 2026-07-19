import { localDateSchema,updateWorkItemSchema } from '../../domain/journal/models';
import type { JournalRepository } from '../../domain/journal/repository';
export class JournalService {
  private readonly repository:JournalRepository;
  constructor(repository:JournalRepository){this.repository=repository}
  async initialize(){await this.repository.initialize()}
  async getDailyLog(date:string){return this.repository.getDailyLog(localDateSchema.parse(date))}
  async createWorkItem(date:string){return this.repository.createWorkItem(localDateSchema.parse(date))}
  async updateWorkItem(input:unknown){return this.repository.updateWorkItem(updateWorkItemSchema.parse(input))}
  async deleteWorkItem(id:string){return this.repository.deleteWorkItem(id)}
  async reorderWorkItems(logId:string,ids:string[]){return this.repository.reorderWorkItems(logId,ids)}
  async listHistory(page:number,pageSize=20){
    if(!Number.isInteger(page)||page<1)throw new Error('Trang không hợp lệ');
    if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('Kích thước trang không hợp lệ');
    return this.repository.listDailyLogSummaries(page,pageSize);
  }
}
