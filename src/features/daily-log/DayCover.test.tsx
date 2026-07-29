// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DayThemeAssetLoader } from '../../domain/day-theme/assets';
import { dayThemeRegistry } from '../../domain/day-theme/registry';
import { DayCover } from './DayCover';
import { DayThemeScope } from './DayThemeScope';

afterEach(cleanup);

function renderCover(
  themeId: string | null,
  assetLoader: DayThemeAssetLoader = vi.fn(async () => '/motif.svg'),
) {
  const resolvedTheme = dayThemeRegistry.resolve(themeId, themeId ? 1 : null);
  render(
    <DayThemeScope resolvedTheme={resolvedTheme}>
      <DayCover
        resolvedTheme={resolvedTheme}
        eyebrow="Daily journal"
        heading="Friday, January 2, 2026"
        subtitle="A quiet record of your progress."
        actions={<button type="button">Previous day</button>}
        assetLoader={assetLoader}
      />
    </DayThemeScope>,
  );
  return { assetLoader, resolvedTheme };
}

describe('DayCover', () => {
  it.each(['done-today-default', 'sakura', 'coffee', 'rainy'])(
    'renders %s from registry semantics without an extra accessible theme label',
    async (themeId) => {
      const { assetLoader, resolvedTheme } = renderCover(themeId);
      expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
        'Friday, January 2, 2026',
      );
      expect(screen.getByRole('button', { name: 'Previous day' })).toBeTruthy();
      expect(screen.queryByRole('img')).toBeNull();
      expect(
        document
          .querySelector('.day-theme-scope')
          ?.getAttribute('data-day-theme-id'),
      ).toBe(themeId);
      const assetId = resolvedTheme.definition.cover.motifAssetId;
      if (assetId) {
        await waitFor(() => expect(assetLoader).toHaveBeenCalledWith(assetId));
      } else {
        expect(assetLoader).not.toHaveBeenCalled();
      }
    },
  );

  it('keeps content and gradient fallback when a motif cannot load', async () => {
    const assetLoader = vi.fn(async () => null);
    renderCover('coffee', assetLoader);
    await waitFor(() => expect(assetLoader).toHaveBeenCalledOnce());
    expect(
      document
        .querySelector('.day-cover')
        ?.getAttribute('data-day-cover-asset-state'),
    ).toBe('fallback');
    expect(screen.getByRole('heading')).toBeTruthy();
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(false);
  });

  it('loads only the currently rendered motif and keeps decoration hidden', async () => {
    const assetLoader = vi.fn(async () => '/rainy-motif.svg');
    renderCover('rainy', assetLoader);
    await waitFor(() =>
      expect(
        document
          .querySelector('.day-cover')
          ?.getAttribute('data-day-cover-asset-state'),
      ).toBe('loaded'),
    );
    expect(assetLoader).toHaveBeenCalledTimes(1);
    expect(
      document.querySelector('.day-cover-motif')?.getAttribute('aria-hidden'),
    ).toBe('true');
    expect(
      document.querySelector('.day-cover-overlay')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('keeps the cover layout but never loads or renders a motif in minimal mode', () => {
    const assetLoader = vi.fn(async () => '/coffee-motif.svg');
    const resolvedTheme = dayThemeRegistry.resolve('coffee', 1);
    render(
      <DayCover
        resolvedTheme={resolvedTheme}
        eyebrow="Daily journal"
        heading="Journal"
        subtitle="Quiet progress"
        actions={<button type="button">Action</button>}
        coverVariant="minimal"
        daySymbol="none"
        assetLoader={assetLoader}
      />,
    );
    expect(assetLoader).not.toHaveBeenCalled();
    expect(document.querySelector('.day-cover-motif')).toBeNull();
    expect(
      document
        .querySelector('.day-cover')
        ?.getAttribute('data-day-cover-asset-state'),
    ).toBe('suppressed');
    expect(screen.getByRole('heading', { name: 'Journal' })).toBeTruthy();
  });

  it('defines compact responsive heights, reduced motion and forced-colors fallback', () => {
    const styles = readFileSync('src/styles.css', 'utf8');
    expect(styles).toContain('min-height: 172px');
    expect(styles).toContain('min-height: 148px');
    expect(styles).toContain('min-height: 124px');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('@media (forced-colors: active)');
  });
});
