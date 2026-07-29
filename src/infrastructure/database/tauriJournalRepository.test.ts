import { invoke } from '@tauri-apps/api/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TauriJournalRepository } from './tauriJournalRepository';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

describe('TauriJournalRepository journal activity dates', () => {
  beforeEach(() => vi.mocked(invoke).mockReset());

  it('uses the typed activity-date command without sending journal data to the UI', async () => {
    vi.mocked(invoke).mockResolvedValue(['2026-07-23', '2026-07-24']);
    await expect(
      new TauriJournalRepository().listJournalActivityDates(),
    ).resolves.toEqual(['2026-07-23', '2026-07-24']);
    expect(invoke).toHaveBeenCalledWith('list_journal_activity_dates');
  });

  it('preserves malformed strings for the safe domain filter but rejects non-string data', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(['bad-date', '2026-07-24']);
    await expect(
      new TauriJournalRepository().listJournalActivityDates(),
    ).resolves.toEqual(['bad-date', '2026-07-24']);
    vi.mocked(invoke).mockResolvedValueOnce(['2026-07-24', 42]);
    await expect(
      new TauriJournalRepository().listJournalActivityDates(),
    ).rejects.toEqual({ kind: 'unknown' });
  });
});

describe('TauriJournalRepository Day Theme metadata', () => {
  beforeEach(() => vi.mocked(invoke).mockReset());

  it('writes the pair with one typed command and accepts unknown valid IDs', async () => {
    vi.mocked(invoke).mockResolvedValue({
      themeId: 'future-theme',
      themeVersion: 7,
    });
    await expect(
      new TauriJournalRepository().updateDayThemeMetadata('log-1', {
        themeId: 'future-theme',
        themeVersion: 7,
      }),
    ).resolves.toEqual({ themeId: 'future-theme', themeVersion: 7 });
    expect(invoke).toHaveBeenCalledWith('update_daily_log_day_theme', {
      dailyLogId: 'log-1',
      themeId: 'future-theme',
      themeVersion: 7,
    });
  });

  it('rejects a malformed native pair', async () => {
    vi.mocked(invoke).mockResolvedValue({
      themeId: 'future-theme',
      themeVersion: null,
    });
    await expect(
      new TauriJournalRepository().updateDayThemeMetadata('log-1', {
        themeId: 'future-theme',
        themeVersion: 7,
      }),
    ).rejects.toEqual({ kind: 'unknown' });
  });

  it('sets a day theme by date and parses the complete daily log', async () => {
    const saved = {
      id: 'log-1',
      logDate: '2026-07-29',
      createdAt: 'now',
      updatedAt: 'now',
      themeId: 'coffee',
      themeVersion: 1,
      items: [],
    };
    vi.mocked(invoke).mockResolvedValue(saved);
    await expect(
      new TauriJournalRepository().setDayThemeForDate('2026-07-29', {
        themeId: 'coffee',
        themeVersion: 1,
      }),
    ).resolves.toEqual(saved);
    expect(invoke).toHaveBeenCalledWith('set_daily_log_day_theme', {
      date: '2026-07-29',
      themeId: 'coffee',
      themeVersion: 1,
    });
  });
});

describe('TauriJournalRepository Calendar and History summaries', () => {
  beforeEach(() => vi.mocked(invoke).mockReset());

  it('loads a lightweight calendar range with nullable and unknown theme metadata', async () => {
    const response = [
      {
        date: '2026-07-01',
        hasLog: true,
        themeId: null,
        themeVersion: null,
      },
      {
        date: '2026-07-02',
        hasLog: true,
        themeId: 'future-theme',
        themeVersion: 7,
      },
    ];
    vi.mocked(invoke).mockResolvedValue(response);
    await expect(
      new TauriJournalRepository().listCalendarDaySummaries(
        '2026-07-01',
        '2026-08-01',
      ),
    ).resolves.toEqual(response);
    expect(invoke).toHaveBeenCalledWith('list_calendar_day_summaries', {
      startDate: '2026-07-01',
      endDateExclusive: '2026-08-01',
    });
  });

  it.each([
    [{ date: '2026-07-01', hasLog: true, themeId: 'rainy' }],
    [
      {
        date: '2026-07-01',
        hasLog: 'yes',
        themeId: null,
        themeVersion: null,
      },
    ],
    [
      {
        date: 20260701,
        hasLog: true,
        themeId: null,
        themeVersion: null,
      },
    ],
  ])('normalizes malformed calendar response %#', async (response) => {
    vi.mocked(invoke).mockResolvedValue(response);
    await expect(
      new TauriJournalRepository().listCalendarDaySummaries(
        '2026-07-01',
        '2026-08-01',
      ),
    ).rejects.toEqual({ kind: 'unknown' });
  });

  it('parses History theme metadata and rejects a partial pair', async () => {
    const page = {
      items: [
        {
          id: 'log-1',
          logDate: '2026-07-01',
          totalItems: 1,
          completedItems: 0,
          percentage: 0,
          previewTasks: ['Task'],
          updatedAt: 'now',
          themeId: 'coffee',
          themeVersion: 1,
        },
      ],
      page: 1,
      pageSize: 20,
      hasMore: false,
    };
    vi.mocked(invoke).mockResolvedValueOnce(page);
    await expect(
      new TauriJournalRepository().listDailyLogSummaries(1, 20),
    ).resolves.toEqual(page);
    vi.mocked(invoke).mockResolvedValueOnce({
      ...page,
      items: [{ ...page.items[0], themeVersion: null }],
    });
    await expect(
      new TauriJournalRepository().listDailyLogSummaries(1, 20),
    ).rejects.toEqual({ kind: 'unknown' });
  });
});
