import type { DailyLog } from './models';
export interface JournalRepository {
  initialize(): Promise<void>;
  getDailyLog(date: string): Promise<DailyLog | null>;
}
