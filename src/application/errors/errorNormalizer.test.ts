import {describe, expect, it} from 'vitest';
import {normalizeAppError, normalizeAppWarning} from './errorNormalizer';

describe('structured Tauri error normalization', () => {
  it('accepts known codes with scalar params and discards compatibility messages', () => {
    expect(normalizeAppError({
      code: 'work_item.task_too_long',
      params: {max: 500, retryable: false, field: 'task'},
      message: 'Do not render this backend message',
    })).toEqual({
      kind: 'known',
      code: 'work_item.task_too_long',
      params: {max: 500, retryable: false, field: 'task'},
    });
  });

  it('accepts JSON-shaped rejections while rejecting raw and malformed values', () => {
    expect(normalizeAppError(JSON.stringify({
      code: 'backup.file_too_large',
      params: {maxMiB: 20},
    }))).toEqual({
      kind: 'known',
      code: 'backup.file_too_large',
      params: {maxMiB: 20},
    });
    expect(normalizeAppError(new Error(JSON.stringify({
      code: 'date.invalid',
      params: {},
    })))).toEqual({kind: 'known', code: 'date.invalid', params: {}});
    expect(normalizeAppError({code: 'date.invalid', params: {nested: {unsafe: true}}}))
      .toEqual({kind: 'unknown'});
    expect(normalizeAppError({code: 'future.code', params: {}}))
      .toEqual({kind: 'unknown'});
    expect(normalizeAppError(String.raw`C:\private\done-today.sqlite SELECT * FROM app_settings`))
      .toEqual({kind: 'unknown'});
  });

  it('normalizes known warnings and safely degrades unknown warnings', () => {
    expect(normalizeAppWarning({
      code: 'backup.warning.app_version',
      params: {backupVersion: '0.1.0', currentVersion: '0.2.0'},
    })).toEqual({
      kind: 'known',
      code: 'backup.warning.app_version',
      params: {backupVersion: '0.1.0', currentVersion: '0.2.0'},
    });
    expect(normalizeAppWarning({code: 'backup.warning.future', params: {}}))
      .toEqual({kind: 'unknown'});
  });
});
