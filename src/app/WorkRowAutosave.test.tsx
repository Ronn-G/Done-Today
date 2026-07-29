// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JOURNAL_AUTOSAVE_DELAY_MS } from '../application/journal/saveCoordinator';
import type { WorkItem } from '../domain/journal/models';
import { invokeTauriCommand } from '../infrastructure/tauri/invoke';
import { initializeI18n } from '../i18n';
import { WorkRow } from './App';

vi.mock('../infrastructure/tauri/invoke', () => ({
  invokeTauriCommand: vi.fn(),
}));

const invokeMock = vi.mocked(invokeTauriCommand);
const baseItem: WorkItem = {
  id: 'item-1',
  dailyLogId: 'log-1',
  task: '',
  result: '',
  nextAction: '',
  status: 'in_progress',
  position: 0,
  categoryId: null,
  createdAt: '2026-07-27T00:00:00Z',
  updatedAt: '2026-07-27T00:00:00Z',
};
const noop = () => undefined;
const noopAsync = async () => undefined;
type Deferred<T> = {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
};
function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, deny) => {
    resolve = accept;
    reject = deny;
  });
  return { promise, resolve, reject };
}
function canonicalResponse(
  input: WorkItem,
  updatedAt = '2026-07-27T00:00:01Z',
): WorkItem {
  return {
    ...input,
    task: input.task.trim(),
    result: input.result.trim(),
    nextAction: input.nextAction.trim(),
    updatedAt,
  };
}
function RowHarness() {
  const [item, setItem] = useState(baseItem);
  return (
    <table>
      <tbody>
        <WorkRow
          item={item}
          categories={[]}
          dataIndex={0}
          autoFocus={false}
          onFocused={noop}
          onChange={setItem}
          onJournalActivityChanged={noop}
          onCategoryChange={noopAsync}
          onDelete={noop}
          onMoveUp={noop}
          onMoveDown={noop}
          canMoveUp={false}
          canMoveDown={false}
        />
      </tbody>
    </table>
  );
}
function inputFor(label: string) {
  return screen.getByRole('textbox', { name: label }) as HTMLTextAreaElement;
}
function submittedItem(callIndex: number) {
  return (invokeMock.mock.calls[callIndex][1] as { input: WorkItem }).input;
}
async function advanceAutosave() {
  await act(() => vi.advanceTimersByTimeAsync(JOURNAL_AUTOSAVE_DELAY_MS));
}

beforeEach(async () => {
  vi.useFakeTimers();
  invokeMock.mockReset();
  await initializeI18n('en');
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('WorkRow raw drafts and autosave', () => {
  it.each([
    ['Work done', 'task'],
    ['Result', 'result'],
    ['Next step', 'nextAction'],
  ] as const)(
    'preserves a trailing space and the final payload for %s',
    async (label, field) => {
      const saves: Array<Deferred<unknown>> = [];
      invokeMock.mockImplementation(() => {
        const save = deferred<unknown>();
        saves.push(save);
        return save.promise;
      });
      render(<RowHarness />);
      const input = inputFor(label);
      fireEvent.change(input, { target: { value: 'Hoàn' } });
      fireEvent.change(input, { target: { value: 'Hoàn ' } });
      await advanceAutosave();
      expect(submittedItem(0)[field]).toBe('Hoàn ');
      await act(async () =>
        saves[0].resolve(canonicalResponse({ ...baseItem, [field]: 'Hoàn ' })),
      );
      expect(input.value).toBe('Hoàn ');
      fireEvent.change(input, { target: { value: 'Hoàn thành' } });
      expect(screen.queryByText('Saved')).toBeNull();
      await advanceAutosave();
      await act(async () =>
        saves[1].resolve(
          canonicalResponse({ ...baseItem, [field]: 'Hoàn thành' }),
        ),
      );
      expect(input.value).toBe('Hoàn thành');
      expect(submittedItem(1)[field]).toBe('Hoàn thành');
    },
  );

  it('queues the latest draft while a save is in flight without concurrent writes or stale overwrite', async () => {
    const saves: Array<Deferred<unknown>> = [];
    let active = 0;
    let maximumActive = 0;
    invokeMock.mockImplementation(() => {
      const save = deferred<unknown>();
      saves.push(save);
      active++;
      maximumActive = Math.max(maximumActive, active);
      return save.promise.finally(() => active--);
    });
    render(<RowHarness />);
    const input = inputFor('Work done');
    fireEvent.change(input, { target: { value: 'Hoàn ' } });
    await advanceAutosave();
    fireEvent.change(input, { target: { value: 'Hoàn thành' } });
    await advanceAutosave();
    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(maximumActive).toBe(1);
    await act(async () =>
      saves[0].resolve(canonicalResponse({ ...baseItem, task: 'Hoàn ' })),
    );
    expect(input.value).toBe('Hoàn thành');
    expect(invokeMock).toHaveBeenCalledTimes(2);
    expect(maximumActive).toBe(1);
    await act(async () =>
      saves[1].resolve(canonicalResponse({ ...baseItem, task: 'Hoàn thành' })),
    );
    expect(input.value).toBe('Hoàn thành');
    expect(submittedItem(1).task).toBe('Hoàn thành');
    expect(screen.getByRole('status').textContent).toContain('Saved');
  });

  it('flushes the latest text on blur before the debounce expires', async () => {
    invokeMock.mockImplementation(async (_command, args) =>
      canonicalResponse((args as { input: WorkItem }).input),
    );
    render(<RowHarness />);
    const input = inputFor('Result');
    fireEvent.change(input, { target: { value: 'từ ' } });
    fireEvent.change(input, { target: { value: 'từ tiếp' } });
    fireEvent.blur(input);
    await act(async () => undefined);
    expect(invokeMock).toHaveBeenCalledOnce();
    expect(submittedItem(0).result).toBe('từ tiếp');
    expect(input.value).toBe('từ tiếp');
  });

  it('keeps the newest draft after failure and Retry persists that newest draft', async () => {
    const first = deferred<unknown>();
    invokeMock
      .mockReturnValueOnce(first.promise)
      .mockImplementation(async (_command, args) =>
        canonicalResponse((args as { input: WorkItem }).input),
      );
    render(<RowHarness />);
    const input = inputFor('Next step');
    fireEvent.change(input, { target: { value: 'bản cũ' } });
    await advanceAutosave();
    await act(async () => first.reject(new Error('save failed')));
    expect(input.value).toBe('bản cũ');
    fireEvent.change(input, { target: { value: 'bản mới nhất' } });
    fireEvent.click(
      screen.getByRole('button', { name: 'Retry saving changes' }),
    );
    await act(async () => undefined);
    expect(submittedItem(1).nextAction).toBe('bản mới nhất');
    expect(input.value).toBe('bản mới nhất');
  });

  it('flushes an unsaved draft when the row unmounts', async () => {
    invokeMock.mockImplementation(async (_command, args) =>
      canonicalResponse((args as { input: WorkItem }).input),
    );
    const view = render(<RowHarness />);
    const input = inputFor('Work done');
    fireEvent.change(input, { target: { value: 'chưa kịp lưu' } });
    view.unmount();
    await act(async () => undefined);
    expect(invokeMock).toHaveBeenCalledOnce();
    expect(submittedItem(0).task).toBe('chưa kịp lưu');
  });

  it('waits for compositionEnd before autosaving the completed Vietnamese input', async () => {
    invokeMock.mockImplementation(async (_command, args) =>
      canonicalResponse((args as { input: WorkItem }).input),
    );
    render(<RowHarness />);
    const input = inputFor('Work done');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'Hoà' } });
    await advanceAutosave();
    expect(invokeMock).not.toHaveBeenCalled();
    expect(input.value).toBe('Hoà');
    fireEvent.change(input, { target: { value: 'Hoàn ' } });
    fireEvent.compositionEnd(input, { data: 'n ' });
    await advanceAutosave();
    expect(invokeMock).toHaveBeenCalledOnce();
    expect(submittedItem(0).task).toBe('Hoàn ');
    expect(input.value).toBe('Hoàn ');
  });
});
