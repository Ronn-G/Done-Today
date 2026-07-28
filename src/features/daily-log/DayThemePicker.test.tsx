// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {initializeI18n} from '../../i18n';
import {DayThemePicker, type DayThemePickerProps} from './DayThemePicker';

afterEach(cleanup);

function props(overrides: Partial<DayThemePickerProps> = {}): DayThemePickerProps {
  return {
    persisted: {themeId: 'sakura', themeVersion: 1},
    onPreview: vi.fn(),
    onRollbackPreview: vi.fn(),
    onApply: vi.fn(async () => undefined),
    onApplied: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('DayThemePicker', () => {
  it.each([
    ['vi', 'Chủ đề của ngày', ['Done Today Mặc định', 'Sakura', 'Coffee', 'Rainy']],
    ['en', 'Day theme', ['Done Today Default', 'Sakura', 'Coffee', 'Rainy']],
  ] as const)('renders curated localized choices in %s', async (locale, title, names) => {
    await initializeI18n(locale);
    render(<DayThemePicker {...props()}/>);
    expect(screen.getByRole('dialog', {name: title})).toBeTruthy();
    const choices = screen.getAllByRole('radio');
    expect(choices).toHaveLength(4);
    names.forEach((name, index) => expect(choices[index].textContent).toContain(name));
    expect(choices[1].getAttribute('aria-checked')).toBe('true');
    expect(document.querySelectorAll('.day-theme-picker-thumbnail')).toHaveLength(4);
    expect(document.querySelector('[role="img"]')).toBeNull();
  });

  it('keeps preview separate from persistence and restores it on cancel, Escape and outside close', async () => {
    await initializeI18n('en');
    const value = props();
    const view = render(<DayThemePicker {...value}/>);
    fireEvent.mouseEnter(screen.getByRole('radio', {name: /Coffee/}));
    expect(value.onPreview).toHaveBeenLastCalledWith({themeId: 'coffee', themeVersion: 1});
    expect(value.onApply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(value.onRollbackPreview).toHaveBeenCalledOnce();
    expect(value.onCancel).toHaveBeenCalledOnce();
    view.unmount();

    const escape = props();
    render(<DayThemePicker {...escape}/>);
    fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
    expect(escape.onRollbackPreview).toHaveBeenCalledOnce();
    expect(escape.onCancel).toHaveBeenCalledOnce();

    const outside = props();
    cleanup();
    render(<DayThemePicker {...outside}/>);
    fireEvent.mouseDown(document.querySelector('.day-theme-picker-backdrop') as HTMLElement);
    expect(outside.onCancel).toHaveBeenCalledOnce();
  });

  it('supports arrow selection, default normalization and keyboard apply', async () => {
    await initializeI18n('en');
    const value = props();
    render(<DayThemePicker {...value}/>);
    const sakura = screen.getByRole('radio', {name: /Sakura/});
    sakura.focus();
    fireEvent.keyDown(sakura, {key: 'ArrowRight'});
    expect(screen.getByRole('radio', {name: /Coffee/}).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('button', {name: 'Use default theme'}));
    fireEvent.click(screen.getByRole('button', {name: 'Apply'}));
    await waitFor(() => expect(value.onApply).toHaveBeenCalledWith({themeId: null, themeVersion: null}));
    expect(value.onApplied).toHaveBeenCalledWith({themeId: null, themeVersion: null});
  });

  it('restores focus and preview when the picker unmounts during a day change', async () => {
    await initializeI18n('en');
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const value = props();
    const view = render(<DayThemePicker {...value}/>);
    fireEvent.mouseEnter(screen.getByRole('radio', {name: /Coffee/}));
    view.unmount();
    expect(value.onRollbackPreview).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('keeps its draft while an open picker changes locale', async () => {
    await initializeI18n('en');
    const value = props();
    render(<DayThemePicker {...value}/>);
    fireEvent.click(screen.getByRole('radio', {name: /Coffee/}));
    await initializeI18n('vi');
    expect(screen.getByRole('radio', {name: /Coffee/}).getAttribute('aria-checked')).toBe('true');
    expect(value.onApply).not.toHaveBeenCalled();
  });

  it('uses the safe runtime fallback for unknown persisted metadata without writing it', async () => {
    await initializeI18n('en');
    const value = props({persisted: {themeId: 'future-theme', themeVersion: 7}});
    render(<DayThemePicker {...value}/>);
    expect(screen.getByRole('radio', {name: /Done Today Default/}).getAttribute('aria-checked')).toBe('true');
    expect(value.onApply).not.toHaveBeenCalled();
  });

  it('blocks duplicate Apply requests while persistence is in flight', async () => {
    await initializeI18n('en');
    let release: (() => void) | undefined;
    const onApply = vi.fn(() => new Promise<void>(resolve => { release = resolve }));
    render(<DayThemePicker {...props({onApply})}/>);
    const apply = screen.getByRole('button', {name: 'Apply'});
    fireEvent.click(apply);
    fireEvent.click(apply);
    expect(onApply).toHaveBeenCalledOnce();
    expect(apply).toHaveProperty('disabled', true);
    release?.();
  });

  it('rolls back on failure and retries the same intended selection without duplicate requests', async () => {
    await initializeI18n('en');
    let attempts = 0;
    let release: (() => void) | undefined;
    const onApply = vi.fn(() => new Promise<void>((resolve, reject) => {
      attempts += 1;
      if (attempts === 1) reject(new Error('safe failure'));
      else release = resolve;
    }));
    const value = props({onApply});
    render(<DayThemePicker {...value}/>);
    fireEvent.click(screen.getByRole('radio', {name: /Rainy/}));
    fireEvent.click(screen.getByRole('button', {name: 'Apply'}));
    await screen.findByRole('alert');
    expect(value.onRollbackPreview).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', {name: 'Retry'}));
    expect(onApply).toHaveBeenCalledTimes(2);
    expect(onApply).toHaveBeenLastCalledWith({themeId: 'rainy', themeVersion: 1});
    release?.();
    await waitFor(() => expect(value.onApplied).toHaveBeenCalledWith({themeId: 'rainy', themeVersion: 1}));
  });
});
