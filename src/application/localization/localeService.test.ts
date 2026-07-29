import { describe, expect, it, vi } from 'vitest';
import { LocaleService } from './localeService';

describe('LocaleService', () => {
  it.each([
    [{ locale: 'en', source: 'persisted' } as const],
    [{ locale: 'vi', source: 'fresh' } as const],
    [{ locale: 'vi', source: 'compatibility' } as const],
  ])('returns the typed native bootstrap resolution %#', async (expected) => {
    const service = new LocaleService({
      initialize: async () => expected,
      save: vi.fn(),
    });
    await expect(service.initialize()).resolves.toEqual(expected);
  });
  it('uses safe compatibility Vietnamese when native initialization fails', async () => {
    const failure = new Error('database unavailable');
    const save = vi.fn();
    const service = new LocaleService({
      initialize: async () => {
        throw failure;
      },
      save,
    });
    await expect(service.initialize()).resolves.toEqual({
      locale: 'vi',
      source: 'readFailure',
      error: failure,
    });
    expect(save).not.toHaveBeenCalled();
  });
  it('delegates explicit runtime locale persistence unchanged', async () => {
    const save = vi.fn();
    const service = new LocaleService({
      initialize: async () => ({ locale: 'vi', source: 'persisted' }),
      save,
    });
    await service.save('en');
    expect(save).toHaveBeenCalledWith('en');
  });
});
