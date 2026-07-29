// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import type {
  CalendarDaySummary,
  DailyLog,
  DailyLogSummary,
} from '../domain/journal/models';
import { initializeI18n } from '../i18n';
import { DayThemeScope } from '../features/daily-log/DayThemeScope';
import { HistoryMonthCalendar } from '../features/history/HistoryMonthCalendar';
import {
  HistoryView,
  resolveDayThemeForLog,
  shouldAcceptDayThemeCompletion,
} from './App';

const themedLogs: Record<string, DailyLog> = {
  '2026-07-10': {
    id: 'log-sakura',
    logDate: '2026-07-10',
    createdAt: 'now',
    updatedAt: 'now',
    themeId: 'sakura',
    themeVersion: 1,
    items: [],
  },
  '2026-07-11': {
    id: 'log-coffee',
    logDate: '2026-07-11',
    createdAt: 'now',
    updatedAt: 'now',
    themeId: 'coffee',
    themeVersion: 1,
    items: [],
  },
  '2026-07-12': {
    id: 'log-rainy',
    logDate: '2026-07-12',
    createdAt: 'now',
    updatedAt: 'now',
    themeId: 'rainy',
    themeVersion: 1,
    items: [],
  },
};

const calendarSummaries: CalendarDaySummary[] = Object.values(themedLogs).map(
  (log) => ({
    date: log.logDate,
    hasLog: true,
    themeId: log.themeId,
    themeVersion: log.themeVersion,
  }),
);

const historySummaries: DailyLogSummary[] = Object.values(themedLogs).map(
  (log) => ({
    id: log.id,
    logDate: log.logDate,
    totalItems: 1,
    completedItems: 1,
    percentage: 100,
    previewTasks: ['Compatibility task'],
    updatedAt: log.updatedAt,
    themeId: log.themeId,
    themeVersion: log.themeVersion,
  }),
);

function RestoredDay({ date }: { date: string | null }) {
  if (!date) return null;
  const log = themedLogs[date];
  return (
    <DayThemeScope resolvedTheme={resolveDayThemeForLog(log)}>
      <span data-testid="restored-date">{date}</span>
    </DayThemeScope>
  );
}

function CalendarRestoreHarness() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  return (
    <main data-testid="app-shell" style={{ color: 'rgb(1, 2, 3)' }}>
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-29"
        loadMonth={async () => calendarSummaries}
        onOpenDay={setSelectedDate}
      />
      <RestoredDay date={selectedDate} />
    </main>
  );
}

function HistoryRestoreHarness() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  return (
    <main data-testid="app-shell" style={{ color: 'rgb(1, 2, 3)' }}>
      <HistoryView
        items={historySummaries}
        loading={false}
        loadingMore={false}
        error={false}
        hasMore={false}
        onRetry={vi.fn()}
        onLoadMore={vi.fn()}
        onOpenDay={setSelectedDate}
        onGoToday={vi.fn()}
      />
      <RestoredDay date={selectedDate} />
    </main>
  );
}

describe('Day Theme Calendar and History compatibility', () => {
  afterEach(() => cleanup());
  beforeEach(async () => initializeI18n('en'));

  it.each([
    ['Friday, July 10, 2026', 'Sakura', 'sakura', '2026-07-10'],
    ['Saturday, July 11, 2026', 'Coffee', 'coffee', '2026-07-11'],
    ['Sunday, July 12, 2026', 'Rainy', 'rainy', '2026-07-12'],
  ])(
    'opens %s from Calendar and restores %s',
    async (dateLabel, themeName, themeId, date) => {
      render(<CalendarRestoreHarness />);
      fireEvent.click(
        await screen.findByRole('button', {
          name: new RegExp(`Open ${dateLabel}.*${themeName}`),
        }),
      );
      expect(screen.getByTestId('restored-date').textContent).toBe(date);
      expect(
        screen
          .getByTestId('restored-date')
          .closest('.day-theme-scope')
          ?.getAttribute('data-day-theme-id'),
      ).toBe(themeId);
      const shell = screen.getByTestId('app-shell');
      expect(shell.closest('.day-theme-scope')).toBeNull();
      expect(shell.style.color).toBe('rgb(1, 2, 3)');
    },
  );

  it.each([
    ['Friday, July 10, 2026', 'Sakura', 'sakura', '2026-07-10'],
    ['Saturday, July 11, 2026', 'Coffee', 'coffee', '2026-07-11'],
    ['Sunday, July 12, 2026', 'Rainy', 'rainy', '2026-07-12'],
  ])(
    'opens %s from History and restores %s',
    (dateLabel, themeName, themeId, date) => {
      render(<HistoryRestoreHarness />);
      fireEvent.click(
        screen.getByRole('button', {
          name: new RegExp(`Open ${dateLabel}.*${themeName}`),
        }),
      );
      expect(screen.getByTestId('restored-date').textContent).toBe(date);
      expect(
        screen
          .getByTestId('restored-date')
          .closest('.day-theme-scope')
          ?.getAttribute('data-day-theme-id'),
      ).toBe(themeId);
      expect(screen.getByTestId('app-shell').closest('.day-theme-scope')).toBe(
        null,
      );
    },
  );

  it('keeps null/default and unknown metadata read-only while restoring the safe runtime identity', () => {
    const defaultLog = {
      ...themedLogs['2026-07-10'],
      themeId: null,
      themeVersion: null,
    };
    const unknownLog = {
      ...themedLogs['2026-07-11'],
      themeId: 'future-theme',
      themeVersion: 9,
    };
    expect(resolveDayThemeForLog(defaultLog)).toMatchObject({
      source: 'default',
      definition: { id: 'done-today-default' },
    });
    expect(resolveDayThemeForLog(unknownLog)).toMatchObject({
      source: 'default',
      definition: { id: 'done-today-default' },
      requested: { id: 'future-theme', version: 9 },
    });
    expect(defaultLog.themeId).toBeNull();
    expect(unknownLog).toMatchObject({
      themeId: 'future-theme',
      themeVersion: 9,
    });
  });

  it('rejects a late completion from the previous date', () => {
    expect(shouldAcceptDayThemeCompletion('2026-07-11', '2026-07-10')).toBe(
      false,
    );
    expect(shouldAcceptDayThemeCompletion('2026-07-11', '2026-07-11')).toBe(
      true,
    );
  });

  it('keeps the Calendar source outside the motif and full-cover asset boundary', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/history/HistoryMonthCalendar.tsx'),
      'utf8',
    );
    expect(source).not.toMatch(
      /day-theme\/assets|loadDayThemeAsset|DayCover|motif/i,
    );
    expect(source).toContain('dayThemeRegistry.resolve');
  });
});
