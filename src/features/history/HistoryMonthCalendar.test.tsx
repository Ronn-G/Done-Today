// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalendarDaySummary } from '../../domain/journal/models';
import { i18next, initializeI18n } from '../../i18n';
import {
  calendarDaysForMonth,
  HistoryMonthCalendar,
  monthRangeFor,
} from './HistoryMonthCalendar';

const julySummaries: CalendarDaySummary[] = [
  {
    date: '2026-07-05',
    hasLog: true,
    themeId: null,
    themeVersion: null,
  },
  {
    date: '2026-07-06',
    hasLog: true,
    themeId: 'sakura',
    themeVersion: 1,
    daySymbol: 'growth',
  },
  {
    date: '2026-07-07',
    hasLog: true,
    themeId: 'coffee',
    themeVersion: 1,
    daySymbol: 'none',
  },
  {
    date: '2026-07-08',
    hasLog: true,
    themeId: 'rainy',
    themeVersion: 1,
    daySymbol: 'future-symbol',
  },
  {
    date: '2026-07-09',
    hasLog: true,
    themeId: 'future-theme',
    themeVersion: 9,
  },
];

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('HistoryMonthCalendar', () => {
  afterEach(() => cleanup());

  beforeEach(async () => {
    await initializeI18n('en');
  });

  it('builds deterministic half-open month ranges and in-month cells', () => {
    expect(monthRangeFor('2026-07-29')).toEqual({
      startDate: '2026-07-01',
      endDateExclusive: '2026-08-01',
    });
    const days = calendarDaysForMonth('2024-02-12');
    expect(days).toHaveLength(29);
    expect(days[0]).toBe('2024-02-01');
    expect(days.at(-1)).toBe('2024-02-29');
  });

  it('renders locale-aware weekdays and all built-in/fallback indicators without hiding day numbers', async () => {
    const loadMonth = vi.fn(async () => julySummaries);
    render(
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-15"
        loadMonth={loadMonth}
        onOpenDay={vi.fn()}
      />,
    );
    expect(
      await screen.findByRole('heading', { name: 'July 2026' }),
    ).toBeTruthy();
    expect(loadMonth).toHaveBeenCalledWith('2026-07-01', '2026-08-01');
    expect(screen.getByTestId('calendar-weekdays').textContent).toContain(
      'Mon',
    );
    for (const name of ['Done Today Default', 'Sakura', 'Coffee', 'Rainy']) {
      expect(screen.getAllByTitle(name).length).toBeGreaterThan(0);
    }
    const unknown = screen.getByRole('button', {
      name: /Open Thursday, July 9, 2026.*Done Today Default/,
    });
    expect(unknown.dataset.hasLog).toBe('true');
    expect(unknown.textContent).toContain('9');
    const empty = screen.getByRole('button', {
      name: /Open Saturday, July 4, 2026.*No journal recorded/,
    });
    expect(empty.dataset.hasLog).toBe('false');
    expect(empty.querySelector('.history-calendar-marker')).toBeNull();
    const growth = screen.getByRole('button', {
      name: /Open Monday, July 6, 2026.*Sakura, Growth/,
    });
    expect(growth.querySelector('.history-calendar-marker svg')).toBeTruthy();
    const none = screen.getByRole('button', {
      name: /Open Tuesday, July 7, 2026.*Coffee, None/,
    });
    expect(none.querySelector('.history-calendar-marker svg')).toBeNull();
    const unknownSymbol = screen.getByRole('button', {
      name: /Open Wednesday, July 8, 2026.*Rainy/,
    });
    expect(
      unknownSymbol.querySelector('.history-calendar-marker')?.textContent,
    ).toContain('⋮');
  });

  it('reacts to vi/en locale changes without reloading month data', async () => {
    const loadMonth = vi.fn(async () => julySummaries);
    await initializeI18n('vi');
    render(
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-15"
        loadMonth={loadMonth}
        onOpenDay={vi.fn()}
      />,
    );
    expect(
      await screen.findByRole('heading', { name: 'tháng 7 năm 2026' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: /Mở Thứ Hai, 6 tháng 7, 2026.*Sakura/,
      }),
    ).toBeTruthy();
    await act(async () => {
      await i18next.changeLanguage('en');
    });
    expect(screen.getByRole('heading', { name: 'July 2026' })).toBeTruthy();
    expect(loadMonth).toHaveBeenCalledTimes(1);
  });

  it('navigates months with controls and keeps future dates available', async () => {
    const loadMonth = vi.fn(async () => []);
    render(
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-15"
        loadMonth={loadMonth}
        onOpenDay={vi.fn()}
      />,
    );
    await screen.findByRole('heading', { name: 'July 2026' });
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(
      await screen.findByRole('heading', { name: 'August 2026' }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(loadMonth).toHaveBeenLastCalledWith('2026-08-01', '2026-09-01'),
    );
    expect(
      (
        screen.getByRole('button', {
          name: /Open Monday, August 10, 2026/,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(
      await screen.findByRole('heading', { name: 'July 2026' }),
    ).toBeTruthy();
  });

  it('uses roving focus for arrows, Home/End and opens with click, Enter or Space', async () => {
    const onOpenDay = vi.fn();
    render(
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-15"
        loadMonth={async () => julySummaries}
        onOpenDay={onOpenDay}
      />,
    );
    const day15 = await screen.findByRole('button', {
      name: /Open Wednesday, July 15, 2026/,
    });
    expect(day15.getAttribute('aria-current')).toBe('date');
    expect(day15.getAttribute('aria-pressed')).toBe('true');
    day15.focus();
    fireEvent.keyDown(day15, { key: 'ArrowRight' });
    const day16 = screen.getByRole('button', {
      name: /Open Thursday, July 16, 2026/,
    });
    expect(document.activeElement).toBe(day16);
    expect(day16.getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(day16, { key: 'Home' });
    const monday = screen.getByRole('button', {
      name: /Open Monday, July 13, 2026/,
    });
    expect(document.activeElement).toBe(monday);
    fireEvent.keyDown(monday, { key: 'End' });
    const sunday = screen.getByRole('button', {
      name: /Open Sunday, July 19, 2026/,
    });
    fireEvent.keyDown(sunday, { key: 'Enter' });
    fireEvent.keyDown(sunday, { key: ' ' });
    fireEvent.click(sunday);
    expect(onOpenDay).toHaveBeenNthCalledWith(1, '2026-07-19');
    expect(onOpenDay).toHaveBeenNthCalledWith(2, '2026-07-19');
    expect(onOpenDay).toHaveBeenNthCalledWith(3, '2026-07-19');
  });

  it('moves focus across a month boundary and loads the new range', async () => {
    const loadMonth = vi.fn(async () => []);
    render(
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-31"
        loadMonth={loadMonth}
        onOpenDay={vi.fn()}
      />,
    );
    const july31 = await screen.findByRole('button', {
      name: /Open Friday, July 31, 2026/,
    });
    july31.focus();
    fireEvent.keyDown(july31, { key: 'ArrowRight' });
    expect(
      await screen.findByRole('heading', { name: 'August 2026' }),
    ).toBeTruthy();
    const august1 = screen.getByRole('button', {
      name: /Open Saturday, August 1, 2026/,
    });
    await waitFor(() => expect(document.activeElement).toBe(august1));
    expect(august1.getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps the latest month when an older request completes late', async () => {
    const july = deferred<CalendarDaySummary[]>();
    const august = deferred<CalendarDaySummary[]>();
    const loadMonth = vi
      .fn()
      .mockImplementationOnce(() => july.promise)
      .mockImplementationOnce(() => august.promise);
    render(
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-15"
        loadMonth={loadMonth}
        onOpenDay={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    await act(async () => {
      august.resolve([
        {
          date: '2026-08-02',
          hasLog: true,
          themeId: 'rainy',
          themeVersion: 1,
        },
      ]);
      await august.promise;
    });
    expect(await screen.findByTitle('Rainy')).toBeTruthy();
    await act(async () => {
      july.resolve(julySummaries);
      await july.promise;
    });
    expect(screen.getByRole('heading', { name: 'August 2026' })).toBeTruthy();
    expect(screen.queryByTitle('Sakura')).toBeNull();
    expect(screen.getByTitle('Rainy')).toBeTruthy();
  });

  it('shows localized loading/error state and retries only the calendar region', async () => {
    const loadMonth = vi
      .fn()
      .mockRejectedValueOnce(new Error('database path must stay hidden'))
      .mockResolvedValueOnce(julySummaries);
    render(
      <HistoryMonthCalendar
        initialMonth="2026-07-01"
        todayDate="2026-07-15"
        loadMonth={loadMonth}
        onOpenDay={vi.fn()}
      />,
    );
    expect(screen.getByRole('status').textContent).toContain('Loading month');
    expect((await screen.findByRole('alert')).textContent).toContain(
      'We couldn’t load this month.',
    );
    expect(screen.getByRole('alert').textContent).not.toContain('database');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTitle('Sakura')).toBeTruthy();
    expect(loadMonth).toHaveBeenCalledTimes(2);
  });
});
