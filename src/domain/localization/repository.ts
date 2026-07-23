import type {AppLocale} from './locale';
export interface LocaleRepository{
  load():Promise<unknown>;
  save(locale:AppLocale):Promise<void>;
}
