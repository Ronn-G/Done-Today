import {beforeEach,describe,expect,it} from 'vitest';
import {initializeI18n,i18next,safeMissingTranslation} from './index';
import {namespaces,resources} from './resources';
import {flattenResource,validateResourceCatalog} from './resourceValidation';
import {validateProductionResourceSources,validateProductionTranslationCallSites} from './sourceValidation';

describe('i18n resources',()=>{
  beforeEach(async()=>{await initializeI18n('vi')});
  it('passes semantic and source validation',()=>{
    const productionScan=validateProductionTranslationCallSites();
    expect(validateResourceCatalog()).toEqual([]);
    expect(validateProductionResourceSources()).toEqual([]);
    expect(productionScan.filesScanned.some(fileName=>fileName.replaceAll('\\','/').endsWith('/src/features/settings/LanguageSettings.tsx'))).toBe(true);
    expect(productionScan.callSites).toEqual(expect.arrayContaining([
      expect.objectContaining({namespace:'settings',key:'language.label'}),
    ]));
    expect(productionScan.callSites.some(site=>site.fileName.replaceAll('\\','/').endsWith('/src/features/settings/LanguageSettings.tsx')&&site.namespace==='settings'&&site.key==='language.label')).toBe(true);
    expect(productionScan.errors).toEqual([]);
  });
  it('registers the official namespaces and required I18N-1 semantic keys',()=>{
    expect(namespaces).toEqual(['common','nav','today','history','settings','theme','backup','errors']);
    for(const locale of ['vi','en'] as const){
      expect(flattenResource(resources[locale].errors)).toHaveProperty('messages.unknown');
      expect(flattenResource(resources[locale].settings)).toHaveProperty('language.label');
      expect(flattenResource(resources[locale].settings)).toHaveProperty('language.status.error');
      expect(flattenResource(resources[locale].common)).toHaveProperty('actions.retry');
      expect(flattenResource(resources[locale].history)).toHaveProperty('heading.title');
      expect(flattenResource(resources[locale].history)).toHaveProperty('summary.daily_other');
    }
  });
  it('initializes idempotently and switches output',async()=>{
    const first=await initializeI18n('vi');const second=await initializeI18n('vi');expect(second).toBe(first);
    expect(i18next.t('nav:today')).toBe('Hôm nay');expect(i18next.t('common:examples.itemCount',{count:1})).toBe('1 mục');
    await initializeI18n('en');expect(i18next.t('nav:today')).toBe('Today');
    expect(i18next.t('common:examples.welcome',{name:'Lan'})).toBe('Hello, Lan');
    expect(i18next.t('common:examples.itemCount',{count:1})).toBe('1 item');
    expect(i18next.t('common:examples.itemCount',{count:2})).toBe('2 items');
  });
  it('uses a safe fallback for a missing user-facing key',()=>{
    expect(i18next.t('settings:notPresent')).toBe(safeMissingTranslation(i18next.resolvedLanguage));
  });
});
