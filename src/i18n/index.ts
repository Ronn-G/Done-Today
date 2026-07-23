import i18next,{type i18n,type InitOptions,type Module} from 'i18next';
import {initReactI18next} from 'react-i18next';
import {isAppLocale,normalizeLocale,resourceFallbackLocale,type AppLocale} from '../domain/localization/locale';
import {namespaces,resources} from './resources';

type DocumentLanguageTarget={lang:string};
type I18nRuntime=Pick<i18n,'isInitialized'|'language'|'resolvedLanguage'|'init'|'changeLanguage'|'on'> & {use(module:Module):i18n};
const emergencyMissingTranslation='Something went wrong. Please try again.';

export function syncDocumentLanguage(locale:unknown,target:DocumentLanguageTarget|null|undefined=globalThis.document?.documentElement){
  if(target&&isAppLocale(locale))target.lang=locale;
}

export function safeMissingTranslation(locale:unknown){
  const resolved=normalizeLocale(locale)??resourceFallbackLocale;
  return resources[resolved]?.errors?.messages?.unknown??resources.en?.errors?.messages?.unknown??emergencyMissingTranslation;
}

export const resolveDiagnosticLocale=(resolvedLanguage:unknown,language:unknown)=>normalizeLocale(resolvedLanguage??language)??resourceFallbackLocale;

export function createI18nController(runtime:I18nRuntime,setup:()=>void,reportMissing:(message:string)=>void=message=>console.warn(message)){
  let initialization:Promise<i18n>|null=null;
  let languageListenerInstalled=false;
  let setupComplete=false;
  const reportedMissingKeys=new Set<string>();
  const installLanguageListener=()=>{
    if(languageListenerInstalled)return;
    runtime.on('languageChanged',language=>syncDocumentLanguage(language));
    languageListenerInstalled=true;
  };
  const options:InitOptions={
    resources,fallbackLng:resourceFallbackLocale,supportedLngs:['vi','en'],ns:[...namespaces],defaultNS:'common',
    interpolation:{escapeValue:false},initAsync:false,returnNull:false,saveMissing:true,
    parseMissingKeyHandler:()=>safeMissingTranslation(runtime.resolvedLanguage??runtime.language),
    missingKeyHandler:(_languages,namespace,key)=>{
      const identity=`${namespace}:${key}`;
      if(!reportedMissingKeys.has(identity)){
        reportedMissingKeys.add(identity);
        const locale=resolveDiagnosticLocale(runtime.resolvedLanguage,runtime.language);
        reportMissing(`Missing translation [locale=${locale}] [namespace=${namespace}] [key=${key}]`);
      }
    },
  };
  const initialize=(locale:AppLocale):Promise<i18n>=>{
    installLanguageListener();
    if(runtime.isInitialized){
      const ready=runtime.language===locale?Promise.resolve(runtime as i18n):runtime.changeLanguage(locale).then(()=>runtime as i18n);
      return ready.then(instance=>{syncDocumentLanguage(instance.resolvedLanguage??instance.language);return instance});
    }
    if(!initialization){
      if(!setupComplete){setup();setupComplete=true}
      initialization=runtime.init({...options,lng:locale}).then(()=>{
        syncDocumentLanguage(runtime.resolvedLanguage??runtime.language);
        return runtime as i18n;
      }).catch(error=>{initialization=null;throw error});
    }
    return initialization;
  };
  const changeLanguage=async(locale:AppLocale)=>{
    await runtime.changeLanguage(locale);
    syncDocumentLanguage(runtime.resolvedLanguage??runtime.language);
  };
  return{initialize,changeLanguage};
}

const controller=createI18nController(i18next,()=>{i18next.use(initReactI18next)});
export const initializeI18n=controller.initialize;
export const changeAppLanguage=controller.changeLanguage;
export {i18next};
