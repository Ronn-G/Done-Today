import { describe, expect, it } from 'vitest';
import { dailyLogSchema, dayThemeMetadataSchema } from './models';

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
