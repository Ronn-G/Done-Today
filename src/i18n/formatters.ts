import type {AppLocale} from '../domain/localization/locale';

export const intlLocale:Record<AppLocale,string>={vi:'vi-VN',en:'en-US'};
const numberFormatters=new Map<string,Intl.NumberFormat>();
const dateFormatters=new Map<string,Intl.DateTimeFormat>();
const pluralRules=new Map<AppLocale,Intl.PluralRules>();
const listFormatters=new Map<AppLocale,Intl.ListFormat>();
const finite=(value:number)=>{if(!Number.isFinite(value))throw new RangeError('Value must be a finite number.');return value};
const validDate=(value:Date)=>{if(!(value instanceof Date)||Number.isNaN(value.getTime()))throw new RangeError('Date must be valid.');return value};
const numberFormatter=(locale:AppLocale,options:Intl.NumberFormatOptions)=>{
  const key=`${locale}:${JSON.stringify(options)}`;let formatter=numberFormatters.get(key);
  if(!formatter){formatter=new Intl.NumberFormat(intlLocale[locale],options);numberFormatters.set(key,formatter)}
  return formatter;
};
const dateFormatter=(locale:AppLocale,options:Intl.DateTimeFormatOptions)=>{
  const key=`${locale}:${JSON.stringify(options)}`;let formatter=dateFormatters.get(key);
  if(!formatter){formatter=new Intl.DateTimeFormat(intlLocale[locale],options);dateFormatters.set(key,formatter)}
  return formatter;
};
export const formatNumber=(value:number,locale:AppLocale)=>numberFormatter(locale,{maximumFractionDigits:3}).format(finite(value));
export const formatPercent=(ratio:number,locale:AppLocale)=>numberFormatter(locale,{style:'percent',maximumFractionDigits:0}).format(finite(ratio));
export const formatDate=(value:Date,locale:AppLocale,options:Intl.DateTimeFormatOptions={dateStyle:'long'})=>dateFormatter(locale,options).format(validDate(value));
export const formatDateTime=(value:Date,locale:AppLocale,options:Intl.DateTimeFormatOptions={dateStyle:'medium',timeStyle:'short'})=>dateFormatter(locale,options).format(validDate(value));
export const formatList=(values:readonly string[],locale:AppLocale)=>{
  let formatter=listFormatters.get(locale);if(!formatter){formatter=new Intl.ListFormat(intlLocale[locale],{style:'long',type:'conjunction'});listFormatters.set(locale,formatter)}
  return formatter.format(values);
};
export type FormattedCount={value:string;pluralCategory:Intl.LDMLPluralRule};
export const formatCount=(count:number,locale:AppLocale):FormattedCount=>{
  finite(count);if(!Number.isInteger(count)||count<0)throw new RangeError('Count must be a non-negative integer.');
  let rules=pluralRules.get(locale);if(!rules){rules=new Intl.PluralRules(intlLocale[locale]);pluralRules.set(locale,rules)}
  return{value:numberFormatter(locale,{maximumFractionDigits:0}).format(count),pluralCategory:rules.select(count)};
};
