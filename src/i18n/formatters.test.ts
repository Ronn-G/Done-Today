import { describe, expect, it } from 'vitest';
import {
  formatCount,
  formatDate,
  formatDateTime,
  formatList,
  formatNumber,
  formatPercent,
} from './formatters';

describe('locale-aware Intl formatters', () => {
  it('formats number and percent with the requested locale without stale cache state', () => {
    expect(formatNumber(1234.5, 'vi')).toBe('1.234,5');
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(formatPercent(0.5, 'vi')).toBe('50%');
    expect(formatPercent(0.5, 'en')).toBe('50%');
    expect(formatNumber(1234.5, 'vi')).toBe('1.234,5');
  });
  it('formats date and date-time deterministically with explicit UTC options', () => {
    const value = new Date('2026-01-02T15:04:00Z');
    expect(
      formatDate(value, 'en', { dateStyle: 'long', timeZone: 'UTC' }),
    ).toBe('January 2, 2026');
    expect(
      formatDate(value, 'vi', { dateStyle: 'long', timeZone: 'UTC' }),
    ).toContain('tháng 1');
    expect(
      formatDateTime(value, 'en', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
      }),
    ).toContain('3:04 PM');
  });
  it('selects locale-specific plural categories and formats counts', () => {
    expect(formatCount(1, 'en')).toEqual({ value: '1', pluralCategory: 'one' });
    expect(formatCount(2, 'en')).toEqual({
      value: '2',
      pluralCategory: 'other',
    });
    expect(formatCount(1, 'vi')).toEqual({
      value: '1',
      pluralCategory: 'other',
    });
    expect(formatCount(2, 'vi')).toEqual({
      value: '2',
      pluralCategory: 'other',
    });
  });
  it('formats lists without manual concatenation', () => {
    expect(formatList(['A', 'B'], 'en')).toBe('A and B');
    expect(formatList(['A', 'B'], 'vi')).toBe('A và B');
  });
  it('rejects invalid dates and numeric inputs with a controlled contract', () => {
    expect(() => formatDate(new Date(Number.NaN), 'en')).toThrow(RangeError);
    expect(() => formatNumber(Number.NaN, 'vi')).toThrow(RangeError);
    expect(() => formatPercent(Number.POSITIVE_INFINITY, 'en')).toThrow(
      RangeError,
    );
    expect(() => formatCount(-1, 'en')).toThrow(RangeError);
    expect(() => formatCount(1.5, 'vi')).toThrow(RangeError);
  });
});
