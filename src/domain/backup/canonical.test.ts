import { describe, expect, it } from 'vitest';
import { canonicalPayload, checksumPayload } from './canonical';
import {
  backupEnvelopeSchema,
  backupPayloadSchema,
  parseBackupEnvelope,
  type BackupPayloadV1,
} from './models';
const now = '2026-07-19T00:00:00.000Z';
const payload: BackupPayloadV1 = {
  dailyLogs: [
    { id: 'b', logDate: '2026-07-19', createdAt: now, updatedAt: now },
    { id: 'a', logDate: '2026-07-18', createdAt: now, updatedAt: now },
  ],
  workItems: [
    {
      id: 'i',
      dailyLogId: 'b',
      categoryId: null,
      task: 'Việc',
      result: '',
      nextAction: '',
      status: 'completed',
      position: 0,
      createdAt: now,
      updatedAt: now,
    },
  ],
  workCategories: [],
  themePreferences: null,
};
describe('backup v1', () => {
  it('validates a complete envelope', async () =>
    expect(
      backupEnvelopeSchema.safeParse({
        format: 'done-today-backup',
        version: 1,
        exportedAt: now,
        appVersion: '0.1.0',
        payload,
        checksum: await checksumPayload(payload),
      }).success,
    ).toBe(true));
  it('rejects wrong format and versions', () => {
    expect(() => parseBackupEnvelope({ format: 'bad', version: 1 })).toThrow();
    expect(() => parseBackupEnvelope({ version: 2 })).toThrow(/mới hơn/);
  });
  it('canonicalizes object and collection order', () =>
    expect(
      canonicalPayload({
        ...payload,
        dailyLogs: [...payload.dailyLogs].reverse(),
      }),
    ).toBe(canonicalPayload(payload)));
  it('keeps legacy null metadata out of the v1 checksum shape', async () => {
    const explicitNull = {
      ...payload,
      dailyLogs: payload.dailyLogs.map((log) => ({
        ...log,
        themeId: null,
        themeVersion: null,
      })),
    };
    expect(canonicalPayload(explicitNull)).toBe(canonicalPayload(payload));
    expect(await checksumPayload(explicitNull)).toBe(
      await checksumPayload(payload),
    );
    expect(canonicalPayload(payload)).not.toContain('themeId');
  });
  it('round trips explicit and unknown structurally valid Day Theme metadata', () => {
    const themed = {
      ...payload,
      dailyLogs: [
        { ...payload.dailyLogs[0], themeId: 'future-theme', themeVersion: 7 },
      ],
    };
    const parsed = backupPayloadSchema.parse(themed);
    expect(parsed.dailyLogs[0]).toMatchObject({
      themeId: 'future-theme',
      themeVersion: 7,
    });
    expect(canonicalPayload(parsed)).toContain('"themeId":"future-theme"');
  });
  it('round trips every Checkpoint 2 Day Theme through the unchanged Backup v1 shape', async () => {
    const themedPayload: BackupPayloadV1 = {
      ...payload,
      dailyLogs: ['sakura', 'coffee', 'rainy'].map((themeId, index) => ({
        id: `theme-log-${index}`,
        logDate: `2026-07-${20 + index}`,
        createdAt: now,
        updatedAt: now,
        themeId,
        themeVersion: 1,
      })),
      workItems: [],
    };
    const canonical = canonicalPayload(themedPayload);
    const parsed = backupPayloadSchema.parse(JSON.parse(canonical));
    expect(
      parsed.dailyLogs.map((log) => [log.themeId, log.themeVersion]),
    ).toEqual([
      ['sakura', 1],
      ['coffee', 1],
      ['rainy', 1],
    ]);
    expect(canonicalPayload(parsed)).toBe(canonical);
    expect(await checksumPayload(parsed)).toBe(
      await checksumPayload(themedPayload),
    );
    expect(
      backupEnvelopeSchema.safeParse({
        format: 'done-today-backup',
        version: 1,
        exportedAt: now,
        appVersion: '0.1.0',
        payload: parsed,
        checksum: await checksumPayload(parsed),
      }).success,
    ).toBe(true);
  });
  it.each([
    { themeId: 'valid-theme', themeVersion: null },
    { themeId: null, themeVersion: 1 },
    { themeId: '', themeVersion: 1 },
    { themeId: 'Bad ID', themeVersion: 1 },
    { themeId: 'x'.repeat(65), themeVersion: 1 },
    { themeId: 'valid-theme', themeVersion: 0 },
    { themeId: 'valid-theme', themeVersion: -1 },
    { themeId: 'valid-theme', themeVersion: 1.5 },
  ])(
    'rejects malformed Day Theme metadata $themeId/$themeVersion',
    (metadata) => {
      expect(
        backupPayloadSchema.safeParse({
          ...payload,
          dailyLogs: [{ ...payload.dailyLogs[0], ...metadata }],
        }).success,
      ).toBe(false);
    },
  );
  it('has a stable and sensitive checksum', async () => {
    expect(await checksumPayload(payload)).toBe(
      await checksumPayload({
        ...payload,
        dailyLogs: [...payload.dailyLogs].reverse(),
      }),
    );
    expect(await checksumPayload(payload)).not.toBe(
      await checksumPayload({
        ...payload,
        workItems: [{ ...payload.workItems[0], task: 'Khác' }],
      }),
    );
  });
  it('rejects invalid payload boundaries', () => {
    expect(
      backupPayloadSchema.safeParse({
        ...payload,
        dailyLogs: [payload.dailyLogs[0], payload.dailyLogs[0]],
      }).success,
    ).toBe(false);
    expect(
      backupPayloadSchema.safeParse({
        ...payload,
        dailyLogs: [{ ...payload.dailyLogs[0], logDate: '2026-02-31' }],
      }).success,
    ).toBe(false);
    expect(
      backupPayloadSchema.safeParse({
        ...payload,
        workItems: [{ ...payload.workItems[0], status: 'bad' }],
      }).success,
    ).toBe(false);
    expect(
      backupPayloadSchema.safeParse({
        ...payload,
        workItems: [{ ...payload.workItems[0], dailyLogId: 'missing' }],
      }).success,
    ).toBe(false);
    expect(
      backupPayloadSchema.safeParse({
        ...payload,
        workItems: [{ ...payload.workItems[0], categoryId: 'missing' }],
      }).success,
    ).toBe(false);
  });
});
