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
    expect(markup).toContain('data-day-theme-id="done-today-default"');
    expect(markup).toContain('data-day-theme-resolution="default"');
    expect(markup).toContain('--day-light-accent:var(--app-day-accent)');
    expect(markup).toContain('--day-dark-accent:var(--app-day-accent)');
    expect(markup).toContain('Journal content');
    expect(markup).not.toContain(':root');
  });

  it('maps adaptive light and dark variants without changing the app shell', () => {
    const markup = renderToStaticMarkup(
      <DayThemeScope resolvedTheme={dayThemeRegistry.resolve('sakura', 1)}>
        <main>Journal</main>
      </DayThemeScope>,
    );
    expect(markup).toContain('data-day-theme-id="sakura"');
    expect(markup).toContain('--day-light-page-background:#fffafc');
    expect(markup).toContain('--day-dark-page-background:#1a1518');
    expect(markup).not.toContain('sidebar');
  });
});
