import {describe,expect,it} from 'vitest';
import {isAppLocale,normalizeLocale,resolveLocale} from './locale';

describe('locale policy',()=>{
  it.each([
    ['vi','vi'],['VI','vi'],['vi-VN','vi'],['en','en'],['EN','en'],['en-US','en'],['en-GB','en'],
    ['fr-FR',null],['english',null],['vietnamese',null],['enAnything',null],['viAnything',null],
    ['en_',null],['vi_',null],['en-US-extra',null],['en--US',null],['vi--VN',null],
    ['',null],['   ',null],[null,null],[42,null],
  ])('normalizes %s', (input,expected)=>{
    expect(normalizeLocale(input)).toBe(expected);
  });
  it('validates only supported canonical locales',()=>{
    expect(isAppLocale('vi')).toBe(true);expect(isAppLocale('en')).toBe(true);expect(isAppLocale('en-US')).toBe(false);
  });
  it('prefers a valid persisted preference and safely falls back to compatibility Vietnamese',()=>{
    expect(resolveLocale('en')).toBe('en');expect(resolveLocale('invalid')).toBe('vi');expect(resolveLocale(null)).toBe('vi');
  });
});
