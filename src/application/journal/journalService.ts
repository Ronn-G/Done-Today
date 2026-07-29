import {
  dayThemeMetadataSchema,
  localDateSchema,
  updateDayThemeMetadataSchema,
  updateWorkItemSchema,
  setDayPersonalizationSchema,
} from '../../domain/journal/models';
import {
  categoryInputSchema,
  categoryUpdateSchema,
  groupDailyItems,
} from '../../domain/journal/categories';
import { calculateCurrentStreak } from '../../domain/journal/statistics';
import type { JournalRepository } from '../../domain/journal/repository';
import { createAppError } from '../../domain/errors/appError';
export class JournalService {
  private readonly repository: JournalRepository;
  constructor(repository: JournalRepository) {
    this.repository = repository;
  }
  async initialize() {
    await this.repository.initialize();
  }
  async getDailyLog(date: string) {
    return this.repository.getDailyLog(localDateSchema.parse(date));
  }
  async setDayTheme(dailyLogId: string, themeId: string, themeVersion: number) {
    const value = updateDayThemeMetadataSchema.parse({
      dailyLogId,
      themeId,
      themeVersion,
    });
    return this.repository.updateDayThemeMetadata(
      value.dailyLogId,
      dayThemeMetadataSchema.parse(value),
    );
  }
  async clearDayTheme(dailyLogId: string) {
    const value = updateDayThemeMetadataSchema.parse({
      dailyLogId,
      themeId: null,
      themeVersion: null,
    });
    return this.repository.updateDayThemeMetadata(
      value.dailyLogId,
      dayThemeMetadataSchema.parse(value),
    );
  }
  async setDayThemeForDate(date: string, metadata: unknown) {
    return this.repository.setDayThemeForDate(
      localDateSchema.parse(date),
      dayThemeMetadataSchema.parse(metadata),
    );
  }
  async setDayPersonalizationForDate(date: string, personalization: unknown) {
    const value = setDayPersonalizationSchema.parse({
      date,
      ...(typeof personalization === 'object' && personalization !== null
        ? personalization
        : {}),
    });
    return this.repository.setDayPersonalizationForDate(value.date, {
      coverVariant: value.coverVariant,
      daySymbol: value.daySymbol,
      journalFontRole: value.journalFontRole,
    });
  }
  async createWorkItem(date: string, categoryId: string | null = null) {
    return this.repository.createWorkItem(
      localDateSchema.parse(date),
      categoryId,
    );
  }
  async updateWorkItem(input: unknown) {
    return this.repository.updateWorkItem(updateWorkItemSchema.parse(input));
  }
  async deleteWorkItem(id: string) {
    return this.repository.deleteWorkItem(id);
  }
  async reorderWorkItems(logId: string, ids: string[]) {
    return this.repository.reorderWorkItems(logId, ids);
  }
  async listCategories(includeInactive = true) {
    return this.repository.listCategories(includeInactive);
  }
  async createCategory(input: unknown) {
    return this.repository.createCategory(categoryInputSchema.parse(input));
  }
  async updateCategory(id: string, input: unknown) {
    return this.repository.updateCategory(
      id,
      categoryUpdateSchema.parse(input),
    );
  }
  async archiveCategory(id: string, isActive: boolean) {
    return this.repository.archiveCategory(id, isActive);
  }
  async reorderCategories(ids: string[]) {
    return this.repository.reorderCategories(ids);
  }
  async moveWorkItemToCategory(itemId: string, categoryId: string | null) {
    return this.repository.assignWorkItemCategory(itemId, categoryId);
  }
  groupDailyItems = groupDailyItems;
  async getCurrentStreak(today: string) {
    return calculateCurrentStreak(
      await this.repository.listJournalActivityDates(),
      today,
    );
  }
  async listHistory(page: number, pageSize = 20) {
    if (!Number.isInteger(page) || page < 1)
      throw createAppError('history.pagination_invalid', {
        field: 'page',
        min: 1,
      });
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)
      throw createAppError('history.pagination_invalid', {
        field: 'pageSize',
        min: 1,
        max: 100,
      });
    return this.repository.listDailyLogSummaries(page, pageSize);
  }
  async listCalendar(startDate: string, endDateExclusive: string) {
    const start = localDateSchema.parse(startDate);
    const end = localDateSchema.parse(endDateExclusive);
    if (start >= end) throw createAppError('date.invalid');
    return this.repository.listCalendarDaySummaries(start, end);
  }
}
