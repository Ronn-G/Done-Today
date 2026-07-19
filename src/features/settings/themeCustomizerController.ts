import type {Dispatch,SetStateAction} from 'react';
import type {ThemeSaveState} from '../../application/theme/themeSaveCoordinator';
import type {PaletteMode,ThemeMode,ThemePreferences} from '../../domain/theme/models';

export type ThemeCustomizerController={
  mode:ThemeMode;
  setMode:(mode:ThemeMode)=>void;
  preferences:ThemePreferences;
  setPreferences:Dispatch<SetStateAction<ThemePreferences>>;
  activePalette:PaletteMode;
  saveState:ThemeSaveState;
  error:string|null;
  commit:(next:ThemePreferences)=>void;
  flush:()=>Promise<void>;
  retry:()=>Promise<void>;
  reset:()=>void;
};
