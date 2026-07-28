import type {LocaleRepository} from '../../domain/localization/repository';
import {compatibilityLocale,type AppLocale} from '../../domain/localization/locale';

export type LocaleInitializationResult=
  |{locale:AppLocale;source:'persisted'|'fresh'|'compatibility'}
  |{locale:AppLocale;source:'readFailure';error:unknown};

export class LocaleService{
  private readonly repository:LocaleRepository;
  constructor(repository:LocaleRepository){this.repository=repository}
  async initialize():Promise<LocaleInitializationResult>{
    try{return await this.repository.initialize()}
    catch(error){return{locale:compatibilityLocale,source:'readFailure',error}}
  }
  async save(locale:AppLocale){await this.repository.save(locale)}
}
