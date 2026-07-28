import type {AppLocale} from './locale';

export type LocaleBootstrapSource='persisted'|'fresh'|'compatibility';
export type LocaleBootstrapResult={
  locale:AppLocale;
  source:LocaleBootstrapSource;
};

export interface LocaleRepository{
  initialize():Promise<LocaleBootstrapResult>;
  save(locale:AppLocale):Promise<void>;
}
