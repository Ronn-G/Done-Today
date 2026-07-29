// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initializeI18n } from '../../i18n';
import {
  DayPersonalizationDialog,
  type DayPersonalizationDialogProps,
} from './DayPersonalizationDialog';

afterEach(cleanup);

function props(
  overrides: Partial<DayPersonalizationDialogProps> = {},
): DayPersonalizationDialogProps {
  return {
    persisted: {
      coverVariant: null,
      daySymbol: 'focus',
      journalFontRole: null,
    },
    themeSymbol: '◇',
    onPreview: vi.fn(),
    onRollbackPreview: vi.fn(),
    onApply: vi.fn(async () => undefined),
    onApplied: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('DayPersonalizationDialog', () => {
  it.each([
    ['en', 'Personalize this day', 'Clean UI'],
    ['vi', 'Cá nhân hóa ngày này', 'UI gọn gàng'],
  ] as const)(
    'renders the three curated radiogroups in %s',
    async (locale, title, cleanUi) => {
      await initializeI18n(locale);
      render(<DayPersonalizationDialog {...props()} />);
      expect(screen.getByRole('dialog', { name: title })).toBeTruthy();
      expect(screen.getAllByRole('radiogroup')).toHaveLength(3);
      expect(screen.getAllByRole('radio')).toHaveLength(12);
      expect(screen.getByRole('radio', { name: cleanUi })).toBeTruthy();
    },
  );

  it('previews a draft and rolls it back on cancel, Escape, outside close, and unmount', async () => {
    await initializeI18n('en');
    for (const close of ['cancel', 'escape', 'outside', 'unmount'] as const) {
      const value = props();
      const view = render(<DayPersonalizationDialog {...value} />);
      fireEvent.click(screen.getByRole('radio', { name: 'Minimal' }));
      expect(value.onPreview).toHaveBeenLastCalledWith({
        coverVariant: 'minimal',
        daySymbol: 'focus',
        journalFontRole: null,
      });
      if (close === 'cancel')
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      if (close === 'escape')
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      if (close === 'outside')
        fireEvent.mouseDown(
          document.querySelector(
            '.day-personalization-backdrop',
          ) as HTMLElement,
        );
      if (close === 'unmount') view.unmount();
      expect(value.onRollbackPreview).toHaveBeenCalledOnce();
      if (close !== 'unmount') expect(value.onCancel).toHaveBeenCalledOnce();
      cleanup();
    }
  });

  it('keeps the draft across locale changes and applies all fields atomically', async () => {
    await initializeI18n('en');
    const value = props();
    render(<DayPersonalizationDialog {...value} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Minimal' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Growth' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Classic Serif' }));
    await initializeI18n('vi');
    expect(
      screen
        .getByRole('radio', { name: 'Phát triển' })
        .getAttribute('aria-checked'),
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));
    await waitFor(() =>
      expect(value.onApply).toHaveBeenCalledWith({
        coverVariant: 'minimal',
        daySymbol: 'growth',
        journalFontRole: 'journal',
      }),
    );
    expect(value.onApplied).toHaveBeenCalledOnce();
  });

  it('normalizes to all defaults and blocks duplicate Apply requests', async () => {
    await initializeI18n('en');
    let release: (() => void) | undefined;
    const onApply = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const value = props({ onApply });
    render(<DayPersonalizationDialog {...value} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use theme defaults' }));
    const apply = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(apply);
    fireEvent.click(apply);
    expect(onApply).toHaveBeenCalledOnce();
    expect(onApply).toHaveBeenCalledWith({
      coverVariant: null,
      daySymbol: null,
      journalFontRole: null,
    });
    expect(apply).toHaveProperty('disabled', true);
    release?.();
  });

  it('restores the saved preview on failure and retries the intended draft', async () => {
    await initializeI18n('en');
    const onApply = vi
      .fn()
      .mockRejectedValueOnce(new Error('safe failure'))
      .mockResolvedValueOnce(undefined);
    const value = props({ onApply });
    render(<DayPersonalizationDialog {...value} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Calm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await screen.findByRole('alert');
    expect(value.onRollbackPreview).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(onApply).toHaveBeenCalledTimes(2));
    expect(onApply).toHaveBeenLastCalledWith({
      coverVariant: null,
      daySymbol: 'calm',
      journalFontRole: null,
    });
  });
});
