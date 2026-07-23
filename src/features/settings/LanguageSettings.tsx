import {useEffect,useMemo,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {LocaleService} from '../../application/localization/localeService';
import {LocaleSwitchCoordinator,type LocaleSwitchState} from '../../application/localization/localeSwitchCoordinator';
import {isAppLocale,type AppLocale} from '../../domain/localization/locale';
import {TauriLocaleRepository} from '../../infrastructure/database/tauriLocaleRepository';
import {changeAppLanguage} from '../../i18n';

const defaultLocaleService=new LocaleService(new TauriLocaleRepository());
type LanguageSettingsViewProps={current:AppLocale;state:LocaleSwitchState;onChange(locale:AppLocale):void;onRetry():void};
export function LanguageSettingsView({current,state,onChange,onRetry}:LanguageSettingsViewProps){
  const {t}=useTranslation('settings');
  const statusMessage=state==='saving'?t('language.status.saving'):
    state==='saved'?t('language.status.saved'):
    state==='error'?t('language.status.error'):null;
  return <section className="settings-card"><h2>{t('language.label')}</h2><p>{t('language.description')}</p>
    <label><span className="sr-only">{t('language.label')}</span><select value={current} onChange={event=>{if(isAppLocale(event.target.value))onChange(event.target.value)}}>
      <option value="vi">{t('language.option.vi')}</option><option value="en">{t('language.option.en')}</option>
    </select></label>
    {statusMessage&&<span aria-live="polite">{statusMessage}</span>}
    {state==='error'&&<button type="button" onClick={onRetry}>{t('common:actions.retry')}</button>}
  </section>;
}
export function LanguageSettings({service=defaultLocaleService,activate=changeAppLanguage}:{service?:Pick<LocaleService,'save'>;activate?:(locale:AppLocale)=>Promise<void>}={}){
  const {i18n}=useTranslation();
  const[state,setState]=useState<LocaleSwitchState>('idle');
  const coordinator=useMemo(()=>new LocaleSwitchCoordinator(activate,locale=>service.save(locale),setState),[activate,service]);
  useEffect(()=>{coordinator.attach();return()=>coordinator.detach()},[coordinator]);
  const current=isAppLocale(i18n.resolvedLanguage)?i18n.resolvedLanguage:isAppLocale(i18n.language)?i18n.language:'vi';
  return <LanguageSettingsView current={current} state={state}
    onChange={locale=>{void coordinator.switchTo(locale).catch(()=>undefined)}}
    onRetry={()=>{void coordinator.retry().catch(()=>undefined)}}/>;
}
