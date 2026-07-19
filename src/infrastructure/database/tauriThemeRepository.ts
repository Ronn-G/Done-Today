import {invoke} from '@tauri-apps/api/core';
import {parseThemePreferences,type ThemePreferences} from '../../domain/theme/models';
import type {ThemeRepository} from '../../domain/theme/repository';
export class TauriThemeRepository implements ThemeRepository{
  private initialized=false;
  async initialize(){if(!this.initialized){await invoke('initialize_database');this.initialized=true}}
  async load(){await this.initialize();const value=await invoke<unknown>('get_theme_preferences');return value===null?null:parseThemePreferences(value)}
  async save(preferences:ThemePreferences){await this.initialize();await invoke('save_theme_preferences',{preferences})}
}
