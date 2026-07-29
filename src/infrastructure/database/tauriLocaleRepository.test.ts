import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { TauriLocaleRepository } from './tauriLocaleRepository';

describe('TauriLocaleRepository', () => {
  it('uses the WebView preferred locale in one typed initialization command', async () => {
    const invoke = vi.fn(async (command: string) =>
      command === 'initialize_locale_preference'
        ? { locale: 'en', source: 'fresh' }
        : undefined,
    );
    const repository = new TauriLocaleRepository(invoke, () => 'en-US');
    await expect(repository.initialize()).resolves.toEqual({
      locale: 'en',
      source: 'fresh',
    });
    await repository.save('vi');
    expect(invoke.mock.calls).toEqual([
      ['initialize_locale_preference', { osLocale: 'en-US' }],
      ['save_locale_preference', { locale: 'vi' }],
    ]);
  });
  it('uses a null locale when the WebView locale API is unavailable', async () => {
    const invoke = vi.fn(async () => ({ locale: 'en', source: 'fresh' }));
    const repository = new TauriLocaleRepository(invoke, () => {
      throw new Error('unavailable');
    });
    await expect(repository.initialize()).resolves.toEqual({
      locale: 'en',
      source: 'fresh',
    });
    expect(invoke).toHaveBeenCalledWith('initialize_locale_preference', {
      osLocale: null,
    });
  });
  it('normalizes initialization infrastructure errors', async () => {
    const failure = new Error('invoke failed');
    const invoke = vi.fn(async (command: string) => {
      if (command === 'initialize_locale_preference') throw failure;
    });
    const repository = new TauriLocaleRepository(invoke, () => 'vi-VN');
    await expect(repository.initialize()).rejects.toEqual({ kind: 'unknown' });
    expect(invoke).not.toHaveBeenCalledWith(
      'save_locale_preference',
      expect.anything(),
    );
  });
  it('normalizes save infrastructure errors', async () => {
    const failure = new Error('write failed');
    const invoke = vi.fn(async (command: string) => {
      if (command === 'save_locale_preference') throw failure;
    });
    const repository = new TauriLocaleRepository(invoke, () => 'en-US');
    await expect(repository.save('en')).rejects.toEqual({ kind: 'unknown' });
    expect(invoke.mock.calls[0]).toEqual(['initialize_database']);
  });
  it('rejects a malformed native bootstrap response', async () => {
    const repository = new TauriLocaleRepository(
      async () => ({ locale: 'fr', source: 'fresh' }),
      () => 'fr-FR',
    );
    await expect(repository.initialize()).rejects.toBeInstanceOf(z.ZodError);
  });
});
