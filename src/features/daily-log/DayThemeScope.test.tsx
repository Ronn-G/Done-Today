import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { dayThemeRegistry } from '../../domain/day-theme/registry';
import { DayThemeScope } from './DayThemeScope';

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

  it('keeps light, dark and custom App Theme ownership outside the Day Theme scope', () => {
    const markup = renderToStaticMarkup(
      <DayThemeScope resolvedTheme={dayThemeRegistry.resolve('coffee', 1)}>
        <main>Journal</main>
      </DayThemeScope>,
    );
    const styles = readFileSync('src/styles.css', 'utf8');
    expect(markup).toContain('--day-light-accent:#8a4f2d');
    expect(markup).toContain('--day-dark-accent:#d69a6d');
    expect(markup).not.toContain('--accent:');
    expect(markup).not.toContain('--bg-app:');
    expect(styles).toMatch(
      /\.day-theme-scope\s*\{[\s\S]*?--day-accent:\s*var\(--day-light-accent\)/,
    );
    expect(styles).toMatch(
      /\.dark \.day-theme-scope\s*\{[\s\S]*?--day-accent:\s*var\(--day-dark-accent\)/,
    );
    expect(styles).toContain('--app-day-accent: var(--accent)');
  });

  it('never overrides specialized App Theme table-header or statistics variables', () => {
    const styles = readFileSync('src/styles.css', 'utf8');
    const scopeRule =
      /\.day-theme-scope\s*\{([\s\S]*?)\n\}/.exec(styles)?.[1] ?? '';
    for (const variable of [
      '--bg-table-header',
      '--stats-bg',
      '--stats-border',
      '--stats-text-primary',
      '--stats-text-secondary',
      '--stats-progress-track',
      '--stats-progress-fill',
    ])
      expect(scopeRule).not.toMatch(
        new RegExp(`^\\s*${variable.replaceAll('-', '\\-')}\\s*:`, 'm'),
      );
    expect(scopeRule).toContain('--accent: var(--day-accent)');
    expect(scopeRule).toContain('--bg-editor-hover: var(--day-accent-soft)');
  });

  it('scopes the selected journal font role to journal copy variables', () => {
    const markup = renderToStaticMarkup(
      <DayThemeScope
        resolvedTheme={dayThemeRegistry.resolve('rainy', 1)}
        personalization={{
          coverVariant: null,
          daySymbol: null,
          journalFontRole: 'ui',
        }}
      >
        <main>Journal</main>
      </DayThemeScope>,
    );
    expect(markup).toContain('data-journal-font-role="ui"');
    expect(markup).toContain(
      '--day-journal-font:Inter, ui-sans-serif, system-ui, sans-serif',
    );
    expect(readFileSync('src/styles.css', 'utf8')).toContain(
      '.day-theme-scope .work-item-editor',
    );
  });
});
