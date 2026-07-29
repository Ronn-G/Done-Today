import {
  themePreferencesResponseSchema,
  type ThemePreferences,
} from '../../domain/theme/models';
import type { ThemeRepository } from '../../domain/theme/repository';
import { invokeTauriCommand, tauriVoidSchema } from '../tauri/invoke';

const nullableThemePreferencesSchema =
  themePreferencesResponseSchema.nullable();

export class TauriThemeRepository implements ThemeRepository {
  private initialized = false;
  async initialize() {
    if (!this.initialized) {
      await invokeTauriCommand(
        'initialize_database',
        undefined,
        tauriVoidSchema,
      );
      this.initialized = true;
    }
  }
  async load() {
    await this.initialize();
    return invokeTauriCommand(
      'get_theme_preferences',
      undefined,
      nullableThemePreferencesSchema,
    );
  }
  async save(preferences: ThemePreferences) {
    await this.initialize();
    await invokeTauriCommand(
      'save_theme_preferences',
      { preferences },
      tauriVoidSchema,
    );
  }
}
