import viCommon from './locales/vi/common';
import viNav from './locales/vi/nav';
import viToday from './locales/vi/today';
import viHistory from './locales/vi/history';
import viSettings from './locales/vi/settings';
import viTheme from './locales/vi/theme';
import viBackup from './locales/vi/backup';
import viErrors from './locales/vi/errors';
import enCommon from './locales/en/common';
import enNav from './locales/en/nav';
import enToday from './locales/en/today';
import enHistory from './locales/en/history';
import enSettings from './locales/en/settings';
import enTheme from './locales/en/theme';
import enBackup from './locales/en/backup';
import enErrors from './locales/en/errors';

export const namespaces = [
  'common',
  'nav',
  'today',
  'history',
  'settings',
  'theme',
  'backup',
  'errors',
] as const;
export type ResourceNamespace = (typeof namespaces)[number];
export const resources = {
  vi: {
    common: viCommon,
    nav: viNav,
    today: viToday,
    history: viHistory,
    settings: viSettings,
    theme: viTheme,
    backup: viBackup,
    errors: viErrors,
  },
  en: {
    common: enCommon,
    nav: enNav,
    today: enToday,
    history: enHistory,
    settings: enSettings,
    theme: enTheme,
    backup: enBackup,
    errors: enErrors,
  },
} as const;
