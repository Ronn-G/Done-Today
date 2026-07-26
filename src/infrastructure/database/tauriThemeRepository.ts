import {parseThemePreferences,type ThemePreferences} from '../../domain/theme/models';
import type {ThemeRepository} from '../../domain/theme/repository';
import{invokeTauriCommand}from'../tauri/invoke';
export class TauriThemeRepository implements ThemeRepository{
  private initialized=false;
  async initialize(){if(!this.initialized){await invokeTauriCommand('initialize_database');this.initialized=true}}
  async load(){await this.initialize();const value=await invokeTauriCommand<unknown>('get_theme_preferences');return value===null?null:parseThemePreferences(value)}
  async save(preferences:ThemePreferences){await this.initialize();await invokeTauriCommand('save_theme_preferences',{preferences})}
}
