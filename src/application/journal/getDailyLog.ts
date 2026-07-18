import type { JournalRepository } from '../../domain/journal/repository';
export class JournalService {
  private readonly repository: JournalRepository;
  constructor(repository: JournalRepository) { this.repository=repository; }
  async getDailyLog(date:string) {
    await this.repository.initialize();
    return this.repository.getDailyLog(date);
  }
}
