import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { appErrorCodes, appWarningCodes } from '../domain/errors/appError';
import { i18next, initializeI18n } from '.';
import {
  appErrorPresentation,
  appWarningPresentation,
  localizeAppError,
  localizeAppWarning,
} from './errorPresentation';

const contract = JSON.parse(
  readFileSync(
    new URL('../../contracts/app-error-codes.json', import.meta.url),
    'utf8',
  ),
) as { errors: string[]; warnings: string[] };

const paramsFor = (definition: {
  key: string;
  required?: readonly string[];
  paramTypes?: Readonly<Record<string, 'string' | 'number' | 'boolean'>>;
}) =>
  Object.fromEntries(
    (definition.required ?? []).map((name) => [
      name,
      definition.paramTypes?.[name] === 'string'
        ? '9.9.9'
        : definition.paramTypes?.[name] === 'boolean'
          ? true
          : 20,
    ]),
  );

describe('backend error and warning presentation contract', () => {
  it('keeps the frontend registry synchronized with the shared Rust contract', () => {
    expect(appErrorCodes).toEqual(contract.errors);
    expect(appWarningCodes).toEqual(contract.warnings);
    expect(Object.keys(appErrorPresentation)).toEqual(contract.errors);
    expect(Object.keys(appWarningPresentation)).toEqual(contract.warnings);
  });

  it.each(['vi', 'en'] as const)(
    'maps every stable code to a localized %s message',
    async (locale) => {
      await initializeI18n(locale);
      const translate = i18next.getFixedT(locale, 'errors');
      for (const code of appErrorCodes) {
        const definition = appErrorPresentation[code];
        const message = localizeAppError(
          { code, params: paramsFor(definition), message: 'raw backend text' },
          (key, options) => translate(key, options),
        );
        expect(message).not.toBe(translate('messages.unknown'));
        expect(message).not.toContain('raw backend text');
        expect(message).not.toContain('{{');
      }
      for (const code of appWarningCodes) {
        const definition = appWarningPresentation[code];
        const message = localizeAppWarning(
          { code, params: paramsFor(definition) },
          (key, options) => translate(key, options),
        );
        expect(message).not.toBe(translate('messages.unknown'));
        expect(message).not.toContain('{{');
      }
    },
  );

  it('re-renders the same structured payload in the active locale', async () => {
    const payload = { code: 'backup.file_too_large', params: { maxMiB: 20 } };
    await initializeI18n('vi');
    const vietnamese = localizeAppError(payload, (key, options) =>
      i18next.getFixedT('vi', 'errors')(key, options),
    );
    await i18next.changeLanguage('en');
    const english = localizeAppError(payload, (key, options) =>
      i18next.getFixedT('en', 'errors')(key, options),
    );
    expect(vietnamese).toContain('20 MiB');
    expect(english).toContain('20 MiB');
    expect(vietnamese).not.toBe(english);
  });

  it('uses the localized generic fallback for unknown, malformed, or incomplete payloads', async () => {
    await initializeI18n('en');
    const translate = i18next.getFixedT('en', 'errors');
    const present = (value: unknown) =>
      localizeAppError(value, (key, options) => translate(key, options));
    expect(
      present({ code: 'future.error', params: {}, message: 'SELECT secret' }),
    ).toBe('Something went wrong. Please try again.');
    expect(present({ code: 'work_item.task_too_long', params: {} })).toBe(
      'Something went wrong. Please try again.',
    );
    expect(
      present({ code: 'work_item.task_too_long', params: { max: '500' } }),
    ).toBe('Something went wrong. Please try again.');
    expect(present(new Error(String.raw`C:\secret\done-today.sqlite`))).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
