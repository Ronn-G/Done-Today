import {
  dailyLogSchema,
  dayThemeMetadataSchema,
  historyPageSchema,
  journalActivityDatesSchema,
  workItemSchema,
} from '../../domain/journal/models';
import {
  workCategorySchema,
  type CategoryInput,
  type CategoryUpdate,
} from '../../domain/journal/categories';
import type { UpdateWorkItem } from '../../domain/journal/models';
import type { DayThemeMetadata } from '../../domain/journal/models';
import type { JournalRepository } from '../../domain/journal/repository';
import { invokeTauriCommand } from '../tauri/invoke';
export class TauriJournalRepository implements JournalRepository {
  private initialized = false;
  async initialize() {
    if (!this.initialized) {
      await invokeTauriCommand('initialize_database');
      this.initialized = true;
    }
  }
  async getDailyLog(date: string) {
    const result = await invokeTauriCommand<unknown>('get_daily_log', { date });
    return result === null ? null : dailyLogSchema.parse(result);
  }
  async updateDayThemeMetadata(dailyLogId: string, metadata: DayThemeMetadata) {
    return dayThemeMetadataSchema.parse(
      await invokeTauriCommand<unknown>('update_daily_log_day_theme', {
        dailyLogId,
        themeId: metadata.themeId,
        themeVersion: metadata.themeVersion,
      }),
    );
  }
  async setDayThemeForDate(date: string, metadata: DayThemeMetadata) {
    return dailyLogSchema.parse(
      await invokeTauriCommand<unknown>('set_daily_log_day_theme', {
        date,
        themeId: metadata.themeId,
        themeVersion: metadata.themeVersion,
      }),
    );
  }
  async createWorkItem(date: string, categoryId: string | null = null) {
    return workItemSchema.parse(
      await invokeTauriCommand<unknown>('create_work_item', {
        date,
        categoryId,
      }),
    );
  }
  async updateWorkItem(item: UpdateWorkItem) {
    return workItemSchema.parse(
      await invokeTauriCommand<unknown>('update_work_item', { input: item }),
    );
  }
  async deleteWorkItem(itemId: string) {
    await invokeTauriCommand('delete_work_item', { itemId });
  }
  async reorderWorkItems(dailyLogId: string, orderedIds: string[]) {
    return workItemSchema.array().parse(
      await invokeTauriCommand<unknown>('reorder_work_items', {
        dailyLogId,
        orderedIds,
      }),
    );
  }
  async listDailyLogSummaries(page: number, pageSize: number) {
    return historyPageSchema.parse(
      await invokeTauriCommand<unknown>('list_daily_log_summaries', {
        page,
        pageSize,
      }),
    );
  }
  async listJournalActivityDates() {
    return journalActivityDatesSchema.parse(
      await invokeTauriCommand<unknown>('list_journal_activity_dates'),
    );
  }
  async listCategories(includeInactive = true) {
    return workCategorySchema.array().parse(
      await invokeTauriCommand<unknown>('list_work_categories', {
        includeInactive,
      }),
    );
  }
  async createCategory(input: CategoryInput) {
    return workCategorySchema.parse(
      await invokeTauriCommand<unknown>('create_work_category', { input }),
    );
  }
  async updateCategory(id: string, input: CategoryUpdate) {
    return workCategorySchema.parse(
      await invokeTauriCommand<unknown>('update_work_category', { id, input }),
    );
  }
  async archiveCategory(id: string, isActive: boolean) {
    return workCategorySchema.parse(
      await invokeTauriCommand<unknown>('archive_work_category', {
        id,
        isActive,
      }),
    );
  }
  async reorderCategories(orderedIds: string[]) {
    return workCategorySchema.array().parse(
      await invokeTauriCommand<unknown>('reorder_work_categories', {
        orderedIds,
      }),
    );
  }
  async assignWorkItemCategory(itemId: string, categoryId: string | null) {
    return workItemSchema.parse(
      await invokeTauriCommand<unknown>('assign_work_item_category', {
        itemId,
        categoryId,
      }),
    );
  }
}
