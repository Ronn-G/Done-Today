import {describe, expect, it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {dayThemeRegistry} from '../../domain/day-theme/registry';
import {DayThemeScope} from './DayThemeScope';

describe('DayThemeScope', () => {
  it('applies semantic variables only on the day content boundary', () => {
    const markup = renderToStaticMarkup(
      <DayThemeScope resolvedTheme={dayThemeRegistry.resolve(null, null)}>
        <div>Journal content</div>
      </DayThemeScope>,
    );
    expect(markup).toContain('class="day-theme-scope"');
    expect(markup).toContain('data-day-theme-resolution="default"');
    expect(markup).toContain('--day-accent:var(--app-day-accent)');
    expect(markup).toContain('Journal content');
    expect(markup).not.toContain(':root');
  });
});
