import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { invokeAndParse, tauriVoidSchema } from './invoke';

const responseSchema = z.object({
  kind: z.enum(['primary', 'secondary']),
  nested: z.object({ count: z.number().int() }),
});

describe('Tauri invocation response boundary', () => {
  it('parses a valid response and returns the schema output type', async () => {
    const command = vi.fn(async () => ({ ok: true }));
    await expect(
      invokeAndParse(
        command,
        'probe',
        { value: 1 },
        z.object({ ok: z.literal(true) }),
      ),
    ).resolves.toEqual({ ok: true });
    expect(command).toHaveBeenCalledWith('probe', { value: 1 });
  });

  it.each([
    ['missing required field', { kind: 'primary' }],
    ['wrong primitive type', { kind: 'primary', nested: { count: '1' } }],
    ['invalid enum', { kind: 'future', nested: { count: 1 } }],
    ['invalid nested object', { kind: 'primary', nested: null }],
  ])('normalizes an invalid response with a %s', async (_case, response) => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    await expect(
      invokeAndParse(
        vi.fn(async () => response),
        'journal_probe',
        undefined,
        responseSchema,
      ),
    ).rejects.toEqual({ kind: 'unknown' });
    expect(consoleError).toHaveBeenCalledWith(
      'Invalid Tauri response',
      'journal_probe',
      expect.any(Array),
    );
    const exposedError = await invokeAndParse(
      vi.fn(async () => response),
      'journal_probe',
      undefined,
      responseSchema,
    ).catch((reason: unknown) => reason);
    expect(exposedError).toEqual({ kind: 'unknown' });
    expect(exposedError).not.toBeInstanceOf(z.ZodError);
    consoleError.mockRestore();
  });

  it('accepts valid nullable, array, and void responses', async () => {
    await expect(
      invokeAndParse(
        vi.fn(async () => null),
        'nullable',
        undefined,
        z.string().nullable(),
      ),
    ).resolves.toBeNull();
    await expect(
      invokeAndParse(
        vi.fn(async () => ['a', 'b']),
        'array',
        undefined,
        z.array(z.string()),
      ),
    ).resolves.toEqual(['a', 'b']);
    await expect(
      invokeAndParse(
        vi.fn(async () => null),
        'void_null',
        undefined,
        tauriVoidSchema,
      ),
    ).resolves.toBeUndefined();
    await expect(
      invokeAndParse(
        vi.fn(async () => undefined),
        'void_undefined',
        undefined,
        tauriVoidSchema,
      ),
    ).resolves.toBeUndefined();
  });

  it('throws only the normalized structured payload for transport rejection', async () => {
    const command = vi.fn(async () => {
      throw {
        code: 'database.unavailable',
        params: {},
        message: String.raw`C:\Users\private\done-today.sqlite: SELECT *`,
      };
    });
    await expect(
      invokeAndParse(
        command,
        'initialize_database',
        undefined,
        tauriVoidSchema,
      ),
    ).rejects.toEqual({
      kind: 'known',
      code: 'database.unavailable',
      params: {},
    });
  });
});
