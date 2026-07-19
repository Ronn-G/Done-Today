import type {ThemePreferences} from './models';
export interface ThemeRepository{initialize():Promise<void>;load():Promise<ThemePreferences|null>;save(preferences:ThemePreferences):Promise<void>}
