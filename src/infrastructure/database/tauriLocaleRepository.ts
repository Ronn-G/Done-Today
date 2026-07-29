import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import type { AppLocale } from '../../domain/localization/locale';
import type { LocaleRepository } from '../../domain/localization/repository';
import { invokeWithAppError, type InvokeCommand } from '../tauri/invoke';

const localeInitializationSchema = z
  .object({
    locale: z.enum(['vi', 'en']),
    source: z.enum(['persisted', 'fresh', 'compatibility']),
  })
  .strict();
type PreferredLocaleReader = () => unknown;
const readPreferredSystemLocale = () => globalThis.navigator?.language ?? null;

export class TauriLocaleRepository implements LocaleRepository {
  private initialized = false;
  private readonly invokeCommand: InvokeCommand;
  private readonly readPreferredLocale: PreferredLocaleReader;
  constructor(
    invokeCommand: InvokeCommand = (command, args) => invoke(command, args),
    readPreferredLocale: PreferredLocaleReader = readPreferredSystemLocale,
  ) {
    this.invokeCommand = invokeCommand;
    this.readPreferredLocale = readPreferredLocale;
  }
  private async ensureDatabase() {
    if (!this.initialized) {
      await invokeWithAppError(this.invokeCommand, 'initialize_database');
      this.initialized = true;
    }
  }
  async initialize() {
    let osLocale: unknown = null;
    try {
      osLocale = this.readPreferredLocale();
    } catch {
      osLocale = null;
    }
    const result = localeInitializationSchema.parse(
      await invokeWithAppError(
        this.invokeCommand,
        'initialize_locale_preference',
        {
          osLocale: typeof osLocale === 'string' ? osLocale : null,
        },
      ),
    );
    this.initialized = true;
    return result;
  }
  async save(locale: AppLocale) {
    await this.ensureDatabase();
    await invokeWithAppError(this.invokeCommand, 'save_locale_preference', {
      locale,
    });
  }
}
