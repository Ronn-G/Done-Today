import {invoke} from '@tauri-apps/api/core';
import type {AppLocale} from '../../domain/localization/locale';
import type {LocaleRepository} from '../../domain/localization/repository';
type InvokeCommand=(command:string,args?:Record<string,unknown>)=>Promise<unknown>;

export class TauriLocaleRepository implements LocaleRepository{
  private initialized=false;
  private readonly invokeCommand:InvokeCommand;
  constructor(invokeCommand:InvokeCommand=(command,args)=>invoke(command,args)){this.invokeCommand=invokeCommand}
  private async initialize(){if(!this.initialized){await this.invokeCommand('initialize_database');this.initialized=true}}
  async load(){await this.initialize();return this.invokeCommand('get_locale_preference')}
  async save(locale:AppLocale){await this.initialize();await this.invokeCommand('save_locale_preference',{locale})}
}
