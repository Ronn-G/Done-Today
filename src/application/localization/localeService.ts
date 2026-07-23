import type {LocaleRepository} from '../../domain/localization/repository';
import {resolveLocale,type AppLocale} from '../../domain/localization/locale';

export type LocaleInitializationResult=
  |{locale:AppLocale;source:'persisted'}
  |{locale:AppLocale;source:'compatibility';persistence:'saved'|'failed';error?:unknown}
  |{locale:AppLocale;source:'readFailure';error:unknown};

export class LocaleService{
  private readonly repository:LocaleRepository;
  constructor(repository:LocaleRepository){this.repository=repository}
  async initialize():Promise<LocaleInitializationResult>{
    let saved:unknown;
    try{saved=await this.repository.load()}catch(error){
      return{locale:resolveLocale(null),source:'readFailure',error};
    }
    const locale=resolveLocale(saved);
    if(saved===locale)return{locale,source:'persisted'};
    try{
      await this.repository.save(locale);
      return{locale,source:'compatibility',persistence:'saved'};
    }catch(error){
      return{locale,source:'compatibility',persistence:'failed',error};
    }
  }
  async save(locale:AppLocale){await this.repository.save(locale)}
}
