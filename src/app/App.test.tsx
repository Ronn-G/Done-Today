import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { initializeI18n } from '../i18n';
import { dayThemeRegistry } from '../domain/day-theme/registry';
import { DayThemeScope } from '../features/daily-log/DayThemeScope';
import { i18next } from '../i18n';
import {
  AppNavigation,
  mergeSavedDayTheme,
  resolveDayThemeForLog,
  shouldAcceptDayThemeCompletion,
  shouldPersistDayTheme,
  TodayOverview,
} from './App';

describe('I18N-2 app shell and Today overview', () => {
  it.each([
    ['vi', ['Hôm nay', 'Lịch sử', 'Cài đặt']],
    ['en', ['Today', 'History', 'Settings']],
  ] as const)('renders navigation in %s', async (locale, labels) => {
    await initializeI18n(locale);
    const html = renderToStaticMarkup(
      <AppNavigation activePage="day" onNavigate={vi.fn()} />,
    );
    for (const label of labels) expect(html).toContain(label);
  });

  it.each([
    [
      'vi',
      'Nhật ký theo ngày',
      'Ngày trước',
      'Tỷ lệ hoàn thành',
      'Giao diện ứng dụng',
      'Chủ đề của ngày',
    ],
    [
      'en',
      'Daily journal',
      'Previous day',
      'Completion rate',
      'App appearance',
      'Day theme',
    ],
  ] as const)(
    'renders localized dates, controls and statistics in %s',
    async (
      locale,
      eyebrow,
      previous,
      completionRate,
      appAppearance,
      dayTheme,
    ) => {
      await initializeI18n(locale);
      const html = renderToStaticMarkup(
        <TodayOverview
          date="2026-01-02"
          stats={{ total: 2, completed: 1, percentage: 50 }}
          currentStreak={6}
          onGo={vi.fn()}
          onOpenTheme={vi.fn()}
          onOpenDayTheme={vi.fn()}
          resolvedTheme={dayThemeRegistry.resolve(null, null)}
        />,
      );
      expect(html).toContain(eyebrow);
      expect(html).toContain(`aria-label="${previous}"`);
      expect(html).toContain(`aria-label="${appAppearance}"`);
      expect(html).toContain(`<span>${dayTheme}</span>`);
      expect(html).toContain(completionRate);
      expect(html).toContain('50%');
      if (locale === 'en') expect(html).toContain('Friday, January 2, 2026');
      else expect(html).toContain('tháng 1');
    },
  );

  it('renders the fourth statistic in Vietnamese without a raw key', async () => {
    await initializeI18n('vi');
    const html = renderToStaticMarkup(
      <TodayOverview
        date="2026-01-02"
        stats={{ total: 0, completed: 0, percentage: 0 }}
        currentStreak={0}
        onGo={vi.fn()}
        onOpenTheme={vi.fn()}
        onOpenDayTheme={vi.fn()}
        resolvedTheme={dayThemeRegistry.resolve(null, null)}
      />,
    );
    expect(html).toContain('aria-label="Thống kê trong ngày"');
    expect(html).toContain('class="stat streak-stat"');
    expect(html).toContain('Chuỗi ngày ghi nhật ký');
    expect(html).toContain('0 ngày');
    expect(html).not.toContain('today.');
  });

  it('uses English singular and plural streak values while preserving existing stats', async () => {
    await initializeI18n('en');
    const one = renderToStaticMarkup(
      <TodayOverview
        date="2026-01-02"
        stats={{ total: 2, completed: 1, percentage: 50 }}
        currentStreak={1}
        onGo={vi.fn()}
        onOpenTheme={vi.fn()}
        onOpenDayTheme={vi.fn()}
        resolvedTheme={dayThemeRegistry.resolve(null, null)}
      />,
    );
    const many = renderToStaticMarkup(
      <TodayOverview
        date="2026-01-02"
        stats={{ total: 2, completed: 1, percentage: 50 }}
        currentStreak={6}
        onGo={vi.fn()}
        onOpenTheme={vi.fn()}
        onOpenDayTheme={vi.fn()}
        resolvedTheme={dayThemeRegistry.resolve(null, null)}
      />,
    );
    for (const text of [
      'Total tasks',
      'Completed',
      'Completion rate',
      'Journal streak',
      '1 day',
    ])
      expect(one).toContain(text);
    expect(one).not.toContain('1 days');
    expect(many).toContain('6 days');
    expect(many).toContain('role="progressbar"');
    expect(many).not.toContain('today.');
  });

  it('keeps the four-stat panel responsive with a two-by-two compact grid', () => {
    const styles = readFileSync(
      new URL('../styles.css', import.meta.url),
      'utf8',
    );
    expect(styles).toContain(
      '.stats {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }',
    );
    expect(styles).toContain(
      '.stats .stat:nth-child(3) {\n    border-left: 0;\n  }',
    );
    expect(styles).toContain(
      '.stats .stat:nth-child(3),\n  .stats .stat:nth-child(4) {\n    border-top: 1px solid var(--stats-border);\n  }',
    );
  });
});

describe('Day Theme foundation integration', () => {
  it('does not create a log when applying the default to an untouched day', () => {
    expect(
      shouldPersistDayTheme(null, { themeId: null, themeVersion: null }),
    ).toBe(false);
    expect(
      shouldPersistDayTheme(null, { themeId: 'sakura', themeVersion: 1 }),
    ).toBe(true);
  });

  it('merges saved theme metadata without replacing a pending editor draft', () => {
    const current = {
      id: 'log-1',
      logDate: '2026-07-29',
      createdAt: 'created',
      updatedAt: 'before',
      themeId: null,
      themeVersion: null,
      items: [
        {
          id: 'item-1',
          dailyLogId: 'log-1',
          task: 'pending draft',
          result: '',
          nextAction: '',
          status: 'in_progress' as const,
          position: 0,
          categoryId: null,
          createdAt: 'created',
          updatedAt: 'before',
        },
      ],
    };
    const nativeResult = {
      ...current,
      updatedAt: 'after',
      themeId: 'rainy',
      themeVersion: 1,
      items: [{ ...current.items[0], task: 'persisted old value' }],
    };
    expect(mergeSavedDayTheme(current, nativeResult)).toMatchObject({
      updatedAt: 'after',
      themeId: 'rainy',
      themeVersion: 1,
      items: [{ task: 'pending draft' }],
    });
  });

  it('rejects a stale completion after navigation to another day', () => {
    expect(shouldAcceptDayThemeCompletion('2026-07-30', '2026-07-29')).toBe(
      false,
    );
    expect(shouldAcceptDayThemeCompletion('2026-07-29', '2026-07-29')).toBe(
      true,
    );
    expect(shouldAcceptDayThemeCompletion(null, '2026-07-29')).toBe(false);
  });

  it('resolves null, known and unknown metadata without mutating the original reference', () => {
    const unknown = { themeId: 'future-theme', themeVersion: 7 };
    expect(resolveDayThemeForLog(null)).toMatchObject({
      source: 'default',
      requested: null,
    });
    expect(
      resolveDayThemeForLog({ themeId: 'done-today-default', themeVersion: 1 }),
    ).toMatchObject({
      source: 'exact',
      definition: { id: 'done-today-default', version: 1 },
    });
    expect(resolveDayThemeForLog(unknown)).toMatchObject({
      source: 'default',
      definition: { id: 'done-today-default', version: 1 },
      requested: { id: 'future-theme', version: 7 },
    });
    expect(unknown).toEqual({ themeId: 'future-theme', themeVersion: 7 });
  });

  it('updates only the scope resolution while app-shell markup stays outside the boundary', () => {
    const render = (themeId: string | null, themeVersion: number | null) =>
      renderToStaticMarkup(
        <>
          <aside data-testid="stable-shell">Done Today</aside>
          <DayThemeScope
            resolvedTheme={dayThemeRegistry.resolve(themeId, themeVersion)}
          >
            <main>Journal</main>
          </DayThemeScope>
        </>,
      );
    const known = render('done-today-default', 1);
    const unknown = render('future-theme', 7);
    expect(known).toContain('data-day-theme-resolution="exact"');
    expect(unknown).toContain('data-day-theme-resolution="default"');
    for (const markup of [known, unknown]) {
      expect(markup).toContain(
        '<aside data-testid="stable-shell">Done Today</aside>',
      );
      expect(markup.indexOf('</aside>')).toBeLessThan(
        markup.indexOf('day-theme-scope'),
      );
    }
  });

  it.each(['vi', 'en'] as const)(
    'resolves the built-in name and description in %s without raw keys',
    async (locale) => {
      await initializeI18n(locale);
      const definition = dayThemeRegistry.list()[0];
      const name = i18next.t(definition.nameKey);
      const description = i18next.t(definition.descriptionKey);
      expect(name).not.toContain('dayTheme.');
      expect(description).not.toContain('dayTheme.');
      expect(name.trim()).not.toBe('');
      expect(description.trim()).not.toBe('');
    },
  );

  it('keeps theme-specific branching out of the Today business component and global selectors', () => {
    const appSource = readFileSync(
      new URL('./App.tsx', import.meta.url),
      'utf8',
    );
    const styles = readFileSync(
      new URL('../styles.css', import.meta.url),
      'utf8',
    );
    expect(appSource).not.toMatch(/themeId\s*===/);
    expect(appSource).not.toContain("'done-today-default'");
    const scopeBlock =
      /\.day-theme-scope\s*\{([^}]+)\}/.exec(styles)?.[1] ?? '';
    expect(scopeBlock).toContain('--accent: var(--day-accent)');
    expect(scopeBlock).not.toMatch(/:root|html|body/);
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it.each(['done-today-default', 'sakura', 'coffee', 'rainy'])(
    'renders the Today cover for %s through registry resolution',
    (themeId) => {
      const html = renderToStaticMarkup(
        <TodayOverview
          date="2026-01-02"
          stats={{ total: 2, completed: 1, percentage: 50 }}
          currentStreak={2}
          onGo={vi.fn()}
          onOpenTheme={vi.fn()}
          onOpenDayTheme={vi.fn()}
          resolvedTheme={dayThemeRegistry.resolve(themeId, 1)}
        />,
      );
      expect(html).toContain('class="day-cover"');
      expect(html).toContain('data-day-cover-asset-state="fallback"');
      expect(html.match(/<h1>/g)).toHaveLength(1);
      expect(html).not.toContain(`theme:dayTheme.${themeId}`);
    },
  );
});
