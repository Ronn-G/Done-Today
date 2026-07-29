import { describe, expect, it, vi } from 'vitest';
import { LocaleSwitchCoordinator } from './localeSwitchCoordinator';
import type { AppLocale } from '../../domain/localization/locale';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
describe('LocaleSwitchCoordinator', () => {
  it.each([
    ['vi', 'en'],
    ['en', 'vi'],
  ] as const)(
    'switches %s to %s and persists the active locale',
    async (_from, to) => {
      const active: AppLocale[] = [];
      const saved: AppLocale[] = [];
      const states: string[] = [];
      const coordinator = new LocaleSwitchCoordinator(
        async (locale) => {
          active.push(locale);
        },
        async (locale) => {
          saved.push(locale);
        },
        (state) => states.push(state),
      );
      coordinator.attach();
      await coordinator.switchTo(to);
      expect(active.at(-1)).toBe(to);
      expect(saved).toEqual([to]);
      expect(states).toEqual(['saving', 'saved']);
    },
  );
  it('serializes rapid vi-en-vi persistence so the latest choice wins', async () => {
    const first = deferred();
    const saved: AppLocale[] = [];
    const states: string[] = [];
    const save = vi.fn(async (locale: AppLocale) => {
      saved.push(locale);
      if (saved.length === 1) await first.promise;
    });
    const coordinator = new LocaleSwitchCoordinator(
      async () => undefined,
      save,
      (state) => states.push(state),
    );
    coordinator.attach();
    const en = coordinator.switchTo('en');
    const viRequest = coordinator.switchTo('vi');
    await vi.waitFor(() => expect(saved).toEqual(['en']));
    first.resolve();
    await Promise.all([en, viRequest]);
    expect(saved).toEqual(['en', 'vi']);
    expect(coordinator.desired).toBe('vi');
    expect(states.at(-1)).toBe('saved');
  });
  it('serializes rapid en-vi-en persistence so the latest choice wins', async () => {
    const first = deferred();
    const saved: AppLocale[] = [];
    const coordinator = new LocaleSwitchCoordinator(
      async () => undefined,
      async (locale) => {
        saved.push(locale);
        if (saved.length === 1) await first.promise;
      },
      vi.fn(),
    );
    coordinator.attach();
    const viRequest = coordinator.switchTo('vi');
    const en = coordinator.switchTo('en');
    first.resolve();
    await Promise.all([viRequest, en]);
    expect(saved).toEqual(['vi', 'en']);
    expect(coordinator.desired).toBe('en');
  });
  it('ignores stale failure state and still persists the newer request', async () => {
    const states: string[] = [];
    const saved: AppLocale[] = [];
    const coordinator = new LocaleSwitchCoordinator(
      async () => undefined,
      async (locale) => {
        saved.push(locale);
        if (locale === 'en') throw new Error('old failure');
      },
      (state) => states.push(state),
    );
    coordinator.attach();
    const old = coordinator.switchTo('en').catch(() => undefined);
    const latest = coordinator.switchTo('vi');
    await Promise.all([old, latest]);
    expect(saved).toEqual(['en', 'vi']);
    expect(states.at(-1)).toBe('saved');
    expect(states).not.toContain('error');
  });
  it('serializes a new request that arrives while an older transition is pending', async () => {
    const first = deferred();
    const middle = deferred();
    const active: AppLocale[] = [];
    const saved: AppLocale[] = [];
    const states: string[] = [];
    let runtimeLocale: AppLocale = 'vi';
    let selectorLocale: AppLocale = 'vi';
    const documentElement = { lang: 'vi' };
    const activate = vi.fn(async (locale: AppLocale) => {
      if (activate.mock.calls.length === 1) await first.promise;
      if (activate.mock.calls.length === 2) await middle.promise;
      active.push(locale);
      runtimeLocale = locale;
      selectorLocale = locale;
      documentElement.lang = locale;
    });
    const coordinator = new LocaleSwitchCoordinator(
      activate,
      async (locale) => {
        saved.push(locale);
      },
      (state) => states.push(state),
    );
    coordinator.attach();
    const old = coordinator.switchTo('en');
    const viRequest = coordinator.switchTo('vi');
    await vi.waitFor(() => expect(activate).toHaveBeenCalledTimes(1));
    first.resolve();
    await vi.waitFor(() => expect(activate).toHaveBeenCalledTimes(2));
    const latest = coordinator.switchTo('en');
    await Promise.resolve();
    expect(activate).toHaveBeenCalledTimes(2);
    middle.resolve();
    await Promise.all([old, viRequest, latest]);
    expect(active).toEqual(['en', 'vi', 'en']);
    expect(active.at(-1)).toBe('en');
    expect(saved).toEqual(['en', 'vi', 'en']);
    expect(saved.at(-1)).toBe('en');
    expect(runtimeLocale).toBe('en');
    expect(selectorLocale).toBe('en');
    expect(documentElement.lang).toBe('en');
    expect(coordinator.desired).toBe('en');
    expect(states.filter((state) => state === 'saved')).toEqual(['saved']);
    expect(states).not.toContain('error');
  });
  it('continues queued activation and persistence after a stale activation failure', async () => {
    const saved: AppLocale[] = [];
    const states: string[] = [];
    let attempts = 0;
    const coordinator = new LocaleSwitchCoordinator(
      async () => {
        if (++attempts === 1) throw new Error('old activation failed');
      },
      async (locale) => {
        saved.push(locale);
      },
      (state) => states.push(state),
    );
    coordinator.attach();
    const old = coordinator.switchTo('en').catch(() => undefined);
    const latest = coordinator.switchTo('vi');
    await Promise.all([old, latest]);
    expect(attempts).toBe(2);
    expect(saved).toEqual(['vi']);
    expect(coordinator.desired).toBe('vi');
    expect(states.at(-1)).toBe('saved');
    expect(states).not.toContain('error');
  });
  it('keeps the latest runtime choice on failure and retries that choice', async () => {
    let fail = true;
    const saved: AppLocale[] = [];
    const states: string[] = [];
    const activate = vi.fn(async () => undefined);
    const coordinator = new LocaleSwitchCoordinator(
      activate,
      async (locale) => {
        saved.push(locale);
        if (fail) throw new Error('save failed');
      },
      (state) => states.push(state),
    );
    coordinator.attach();
    await expect(coordinator.switchTo('en')).rejects.toThrow('save failed');
    expect(states.at(-1)).toBe('error');
    fail = false;
    await coordinator.retry();
    expect(saved).toEqual(['en', 'en']);
    expect(activate).toHaveBeenCalledOnce();
    expect(states.at(-1)).toBe('saved');
  });
  it('retries the newest choice when the user changes locale after a failed save', async () => {
    let fail = true;
    const saved: AppLocale[] = [];
    const coordinator = new LocaleSwitchCoordinator(
      async () => undefined,
      async (locale) => {
        saved.push(locale);
        if (fail) throw new Error('save failed');
      },
      vi.fn(),
    );
    coordinator.attach();
    await expect(coordinator.switchTo('en')).rejects.toThrow('save failed');
    fail = false;
    await coordinator.switchTo('vi');
    await coordinator.retry();
    expect(saved).toEqual(['en', 'vi', 'vi']);
    expect(coordinator.desired).toBe('vi');
  });
  it('does not emit state after detach while allowing the requested persistence to finish', async () => {
    const wait = deferred();
    const states: string[] = [];
    const save = vi.fn(async () => wait.promise);
    const coordinator = new LocaleSwitchCoordinator(
      async () => undefined,
      save,
      (state) => states.push(state),
    );
    coordinator.attach();
    const request = coordinator.switchTo('en');
    await Promise.resolve();
    coordinator.detach();
    wait.resolve();
    await request;
    expect(states).toEqual(['saving']);
    expect(save).toHaveBeenCalledOnce();
  });
});
