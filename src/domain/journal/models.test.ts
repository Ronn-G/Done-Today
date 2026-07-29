import { describe, expect, it } from 'vitest';
import {
  calendarDaySummarySchema,
  dailyLogSchema,
  dailyLogSummarySchema,
  dayThemeMetadataSchema,
} from './models';

const log = {
  id: 'log-1',
  logDate: '2026-07-19',
  createdAt: '2026-07-19T00:00:00Z',
  updatedAt: '2026-07-19T00:00:00Z',
  items: [],
};

describe('daily log Day Theme metadata model', () => {
  it.each([
    { themeId: null, themeVersion: null },
    { themeId: 'done-today-default', themeVersion: 1 },
    { themeId: 'future-theme', themeVersion: 99 },
  ])('accepts a structurally valid pair $themeId/$themeVersion', (metadata) => {
    expect(dailyLogSchema.parse({ ...log, ...metadata })).toMatchObject(
      metadata,
    );
    expect(dayThemeMetadataSchema.parse(metadata)).toEqual(metadata);
  });

  it.each([
    { themeId: 'valid-theme', themeVersion: null },
    { themeId: null, themeVersion: 1 },
    { themeId: 'Bad ID', themeVersion: 1 },
    { themeId: 'valid-theme', themeVersion: 0 },
    { themeId: 'valid-theme', themeVersion: 1.5 },
  ])('rejects a malformed pair $themeId/$themeVersion', (metadata) => {
    expect(dailyLogSchema.safeParse({ ...log, ...metadata }).success).toBe(
      false,
    );
    expect(dayThemeMetadataSchema.safeParse(metadata).success).toBe(false);
  });
});

describe('Calendar and History Day Theme summary models', () => {
  it('accepts nullable, known and unknown complete pairs', () => {
    for (const metadata of [
      { themeId: null, themeVersion: null },
      { themeId: 'rainy', themeVersion: 1 },
      { themeId: 'future-theme', themeVersion: 9 },
    ]) {
      expect(
        calendarDaySummarySchema.safeParse({
          date: '2026-07-19',
          hasLog: true,
          ...metadata,
        }).success,
      ).toBe(true);
      expect(
        dailyLogSummarySchema.safeParse({
          ...log,
          logDate: '2026-07-19',
          totalItems: 1,
          completedItems: 0,
          percentage: 0,
          previewTasks: [],
          ...metadata,
        }).success,
      ).toBe(true);
    }
  });

  it('rejects partial and malformed summary pairs', () => {
    for (const metadata of [
      { themeId: 'rainy', themeVersion: null },
      { themeId: null, themeVersion: 1 },
      { themeId: 'Bad ID', themeVersion: 1 },
    ]) {
      expect(
        calendarDaySummarySchema.safeParse({
          date: '2026-07-19',
          hasLog: true,
          ...metadata,
        }).success,
      ).toBe(false);
    }
  });
});
