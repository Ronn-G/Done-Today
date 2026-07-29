import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DailyLogSummary } from '../domain/journal/models';
import { initializeI18n } from '../i18n';
import { HistoryView, mergeHistorySummaries } from './App';

const summaries: DailyLogSummary[] = [
  {
    id: 'log-2026-01-02',
    logDate: '2026-01-02',
    totalItems: 1,
    completedItems: 1,
    percentage: 100,
    previewTasks: ['Chuẩn bị bản demo cho Khách hàng ACME'],
    updatedAt: '2026-01-02T12:00:00Z',
  },
  {
    id: 'log-2026-01-01',
    logDate: '2026-01-01',
    totalItems: 2,
    completedItems: 1,
    percentage: 50,
    previewTasks: ['Follow up at 09:30', 'Ghi lại kết quả'],
    updatedAt: '2026-01-01T12:00:00Z',
  },
];

const callbacks = () => ({
  onRetry: vi.fn(),
  onLoadMore: vi.fn(),
  onOpenDay: vi.fn(),
  onGoToday: vi.fn(),
});
const renderHistory = (
  overrides: Partial<React.ComponentProps<typeof HistoryView>> = {},
) => {
  const actions = callbacks();
  const props: React.ComponentProps<typeof HistoryView> = {
    items: summaries,
    loading: false,
    loadingMore: false,
    error: false,
    hasMore: true,
    ...actions,
    ...overrides,
  };
  return {
    html: renderToStaticMarkup(<HistoryView {...props} />),
    actions,
    props,
  };
};

describe('I18N-3 History checkpoint', () => {
  it('renders Vietnamese loading, empty, error and actions without raw failures or keys', async () => {
    await initializeI18n('vi');
    const loading = renderHistory({
      items: [],
      loading: true,
      hasMore: false,
    }).html;
    expect(loading).toContain('Nhìn lại hành trình');
    expect(loading).toContain('Lịch sử');
    expect(loading).toContain('Mỗi ngày đã ghi lại là một dấu mốc nhỏ.');
    expect(loading).toContain('Đang tải lịch sử…');
    expect(loading).toContain('role="status"');

    const empty = renderHistory({ items: [], hasMore: false }).html;
    expect(empty).toContain('Chưa có ngày nhật ký nào.');
    expect(empty).toContain('Những ngày bạn ghi lại sẽ xuất hiện tại đây.');
    expect(empty).toContain('>Đi đến Hôm nay<');

    const error = renderHistory({
      items: [],
      error: true,
      hasMore: false,
    }).html;
    expect(error).toContain('Không thể tải lịch sử.');
    expect(error).toContain('>Thử lại<');
    expect(error).toContain('role="alert"');
    expect(error).toContain('type="button"');
    expect(error).not.toContain('SQLITE_BUSY');
    expect(error).not.toContain('history.');
  });

  it('renders Vietnamese summaries with locale-aware dates, counts, percentage and accessibility', async () => {
    await initializeI18n('vi');
    const { html } = renderHistory();
    expect(html).toContain('aria-label="Danh sách ngày nhật ký"');
    expect(html).toContain('02/01/2026');
    expect(html).toContain('Thứ Sáu');
    expect(html).toContain('1 việc · 1 hoàn thành · 100%');
    expect(html).toContain('2 việc · 1 hoàn thành · 50%');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain('Chuẩn bị bản demo cho Khách hàng ACME');
    expect(html).toContain('>Tải thêm<');
    expect(html).not.toContain('history.');
  });

  it('formats large History counts with the active locale at the interpolation boundary', async () => {
    const large = {
      ...summaries[1],
      totalItems: 1234,
      completedItems: 1000,
      percentage: 81,
    };
    await initializeI18n('vi');
    const vietnamese = renderHistory({ items: [large], hasMore: false }).html;
    await initializeI18n('en');
    const english = renderHistory({ items: [large], hasMore: false }).html;
    expect(vietnamese).toContain('1.234 việc · 1.000 hoàn thành · 81%');
    expect(english).toContain('1,234 tasks · 1,000 completed · 81%');
  });

  it('switches the same loaded pages to natural English without fetching, writing or changing user data', async () => {
    const shared = callbacks();
    const props: React.ComponentProps<typeof HistoryView> = {
      items: summaries,
      loading: false,
      loadingMore: false,
      error: false,
      hasMore: true,
      ...shared,
    };
    await initializeI18n('vi');
    const vietnamese = renderToStaticMarkup(<HistoryView {...props} />);
    await initializeI18n('en');
    const english = renderToStaticMarkup(<HistoryView {...props} />);
    for (const text of [
      'Looking back',
      'History',
      'Each day you record becomes a small milestone.',
      'Journal days',
      'Load more',
    ]) {
      expect(english).toContain(text);
    }
    expect(english).toContain('01/02/2026');
    expect(english).toContain('Friday');
    expect(english).toContain('1 task · 1 completed · 100%');
    expect(english).toContain('2 tasks · 1 completed · 50%');
    expect(english).toContain(
      'Open Friday, January 2, 2026: 1 task · 1 completed · 100%',
    );
    for (const task of summaries.flatMap((summary) => summary.previewTasks)) {
      expect(vietnamese).toContain(task);
      expect(english).toContain(task);
    }
    expect(summaries.map((summary) => summary.id)).toEqual([
      'log-2026-01-02',
      'log-2026-01-01',
    ]);
    expect(summaries.map((summary) => summary.logDate)).toEqual([
      '2026-01-02',
      '2026-01-01',
    ]);
    for (const action of Object.values(shared))
      expect(action).not.toHaveBeenCalled();
    expect(english).not.toContain('history.');
  });

  it('keeps loading and error technical states while only localized copy changes', async () => {
    const actions = callbacks();
    const loadingProps: React.ComponentProps<typeof HistoryView> = {
      items: summaries,
      loading: true,
      loadingMore: false,
      error: false,
      hasMore: true,
      ...actions,
    };
    await initializeI18n('vi');
    const viLoading = renderToStaticMarkup(<HistoryView {...loadingProps} />);
    await initializeI18n('en');
    const enLoading = renderToStaticMarkup(<HistoryView {...loadingProps} />);
    expect(viLoading).toContain('Đang tải lịch sử…');
    expect(enLoading).toContain('Loading history…');

    const errorProps = { ...loadingProps, loading: false, error: true };
    await initializeI18n('vi');
    const viError = renderToStaticMarkup(<HistoryView {...errorProps} />);
    await initializeI18n('en');
    const enError = renderToStaticMarkup(<HistoryView {...errorProps} />);
    expect(viError).toContain('Không thể tải lịch sử.');
    expect(enError).toContain('We couldn’t load your history.');
    expect(enError).toContain('>Retry<');
    expect(enError).not.toContain('SQLITE_BUSY');
    for (const action of Object.values(actions))
      expect(action).not.toHaveBeenCalled();
  });

  it('localizes Load more and Loading more while preserving the disabled pagination state', async () => {
    await initializeI18n('vi');
    const viReady = renderHistory().html;
    const viLoading = renderHistory({ loadingMore: true }).html;
    expect(viReady).toContain('>Tải thêm<');
    expect(viLoading).toContain('>Đang tải…<');
    expect(viLoading).toContain('disabled=""');
    expect(viLoading).toContain('aria-busy="true"');
    await initializeI18n('en');
    const enReady = renderHistory().html;
    const enLoading = renderHistory({ loadingMore: true }).html;
    expect(enReady).toContain('>Load more<');
    expect(enLoading).toContain('>Loading…<');
  });

  it('keeps loaded pages, ordering and stable IDs while de-duplicating an appended page', () => {
    const replacement = { ...summaries[1], previewTasks: ['Updated preview'] };
    const next = {
      ...summaries[1],
      id: 'log-2025-12-31',
      logDate: '2025-12-31',
    };
    expect(
      mergeHistorySummaries(summaries, [replacement, next], true).map(
        (summary) => summary.id,
      ),
    ).toEqual(['log-2026-01-02', 'log-2026-01-01', 'log-2025-12-31']);
    expect(mergeHistorySummaries(summaries, [replacement], false)).toEqual([
      replacement,
    ]);
  });
});
