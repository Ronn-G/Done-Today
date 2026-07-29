import type { AppLocale } from '../../domain/localization/locale';

export type LocaleSwitchState = 'idle' | 'saving' | 'saved' | 'error';
export class LocaleSwitchCoordinator {
  private revision = 0;
  private desiredLocale: AppLocale | null = null;
  private activeLocale: AppLocale | null = null;
  private activationQueue: Promise<void> = Promise.resolve();
  private persistenceQueue: Promise<void> = Promise.resolve();
  private attached = false;
  private readonly activate: (locale: AppLocale) => Promise<void>;
  private readonly save: (locale: AppLocale) => Promise<void>;
  private readonly state: (state: LocaleSwitchState) => void;
  constructor(
    activate: (locale: AppLocale) => Promise<void>,
    save: (locale: AppLocale) => Promise<void>,
    state: (state: LocaleSwitchState) => void,
  ) {
    this.activate = activate;
    this.save = save;
    this.state = state;
  }
  attach() {
    this.attached = true;
  }
  detach() {
    this.attached = false;
  }
  private emit(state: LocaleSwitchState) {
    if (this.attached) this.state(state);
  }
  switchTo(locale: AppLocale): Promise<void> {
    const revision = ++this.revision;
    this.desiredLocale = locale;
    this.emit('saving');
    const activation = this.activationQueue.then(async () => {
      if (this.activeLocale === locale) return;
      await this.activate(locale);
      this.activeLocale = locale;
    });
    this.activationQueue = activation.catch(() => undefined);
    const persistence = this.persistenceQueue.then(async () => {
      await activation;
      await this.save(locale);
    });
    this.persistenceQueue = persistence.catch(() => undefined);
    return persistence
      .then(() => {
        if (revision === this.revision) this.emit('saved');
      })
      .catch((error) => {
        if (revision === this.revision) this.emit('error');
        throw error;
      });
  }
  retry() {
    return this.desiredLocale === null
      ? Promise.resolve()
      : this.switchTo(this.desiredLocale);
  }
  get desired() {
    return this.desiredLocale;
  }
}
