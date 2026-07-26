import {describe, expect, it, vi} from 'vitest';
import {invokeWithAppError} from './invoke';

describe('Tauri invocation error boundary', () => {
  it('returns successful command values unchanged', async () => {
    const command = vi.fn(async () => ({ok: true}));
    await expect(invokeWithAppError(command, 'probe', {value: 1}))
      .resolves.toEqual({ok: true});
    expect(command).toHaveBeenCalledWith('probe', {value: 1});
  });

  it('throws only the normalized structured payload', async () => {
    const command = vi.fn(async () => {
      throw {
        code: 'database.unavailable',
        params: {},
        message: String.raw`C:\Users\private\done-today.sqlite: SELECT *`,
      };
    });
    await expect(invokeWithAppError(command, 'initialize_database')).rejects.toEqual({
      kind: 'known',
      code: 'database.unavailable',
      params: {},
    });
  });
});
