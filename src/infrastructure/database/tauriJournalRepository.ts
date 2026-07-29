import {
  calendarDaySummariesSchema,
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
import { invokeTauriCommand, tauriVoidSchema } from '../tauri/invoke';

const nullableDailyLogSchema = dailyLogSchema.nullable();
const workItemsSchema = workItemSchema.array();
const workCategoriesSchema = workCategorySchema.array();

export class TauriJournalRepository implements JournalRepository {
  private initialized = false;
  async initialize() {
    if (!this.initialized) {
      await invokeTauriCommand(
        'initialize_database',
        undefined,
        tauriVoidSchema,
      );
      this.initialized = true;
    }
  }
  async getDailyLog(date: string) {
    return invokeTauriCommand(
      'get_daily_log',
      { date },
      nullableDailyLogSchema,
    );
  }
  async updateDayThemeMetadata(dailyLogId: string, metadata: DayThemeMetadata) {
    return invokeTauriCommand(
      'update_daily_log_day_theme',
      {
        dailyLogId,
        themeId: metadata.themeId,
        themeVersion: metadata.themeVersion,
      },
      dayThemeMetadataSchema,
    );
  }
  async setDayThemeForDate(date: string, metadata: DayThemeMetadata) {
    return invokeTauriCommand(
      'set_daily_log_day_theme',
      {
        date,
        themeId: metadata.themeId,
        themeVersion: metadata.themeVersion,
      },
      dailyLogSchema,
    );
  }
  async createWorkItem(date: string, categoryId: string | null = null) {
    return invokeTauriCommand(
      'create_work_item',
      { date, categoryId },
      workItemSchema,
    );
  }
  async updateWorkItem(item: UpdateWorkItem) {
    return invokeTauriCommand(
      'update_work_item',
      { input: item },
      workItemSchema,
    );
  }
  async deleteWorkItem(itemId: string) {
    await invokeTauriCommand('delete_work_item', { itemId }, tauriVoidSchema);
  }
  async reorderWorkItems(dailyLogId: string, orderedIds: string[]) {
    return invokeTauriCommand(
      'reorder_work_items',
      {
        dailyLogId,
        orderedIds,
      },
      workItemsSchema,
    );
  }
  async listDailyLogSummaries(page: number, pageSize: number) {
    return invokeTauriCommand(
      'list_daily_log_summaries',
      { page, pageSize },
      historyPageSchema,
    );
  }
  async listCalendarDaySummaries(startDate: string, endDateExclusive: string) {
    return invokeTauriCommand(
      'list_calendar_day_summaries',
      { startDate, endDateExclusive },
      calendarDaySummariesSchema,
    );
  }
  async listJournalActivityDates() {
    return invokeTauriCommand(
      'list_journal_activity_dates',
      undefined,
      journalActivityDatesSchema,
    );
  }
  async listCategories(includeInactive = true) {
    return invokeTauriCommand(
      'list_work_categories',
      { includeInactive },
      workCategoriesSchema,
    );
  }
  async createCategory(input: CategoryInput) {
    return invokeTauriCommand(
      'create_work_category',
      { input },
      workCategorySchema,
    );
  }
  async updateCategory(id: string, input: CategoryUpdate) {
    return invokeTauriCommand(
      'update_work_category',
      { id, input },
      workCategorySchema,
    );
  }
  async archiveCategory(id: string, isActive: boolean) {
    return invokeTauriCommand(
      'archive_work_category',
      { id, isActive },
      workCategorySchema,
    );
  }
  async reorderCategories(orderedIds: string[]) {
    return invokeTauriCommand(
      'reorder_work_categories',
      { orderedIds },
      workCategoriesSchema,
    );
  }
  async assignWorkItemCategory(itemId: string, categoryId: string | null) {
    return invokeTauriCommand(
      'assign_work_item_category',
      { itemId, categoryId },
      workItemSchema,
    );
  }
}
