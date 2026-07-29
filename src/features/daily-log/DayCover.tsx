import { useEffect, useState, type ReactNode } from 'react';
import {
  loadDayThemeAsset,
  type DayThemeAssetLoader,
} from '../../domain/day-theme/assets';
import type { ResolvedDayTheme } from '../../domain/day-theme/models';
import type {
  CoverVariant,
  DaySymbol,
} from '../../domain/day-theme/personalization';
import { DaySymbolIcon } from './DaySymbolIcon';

export function DayCover({
  resolvedTheme,
  eyebrow,
  heading,
  subtitle,
  actions,
  coverVariant = null,
  daySymbol = null,
  assetLoader = loadDayThemeAsset,
}: {
  resolvedTheme: ResolvedDayTheme;
  eyebrow: ReactNode;
  heading: ReactNode;
  subtitle: ReactNode;
  actions: ReactNode;
  coverVariant?: CoverVariant | null;
  daySymbol?: DaySymbol | null;
  assetLoader?: DayThemeAssetLoader;
}) {
  const assetId =
    coverVariant === 'minimal'
      ? null
      : (resolvedTheme.definition.cover.assetId ??
        resolvedTheme.definition.cover.motifAssetId ??
        null);
  const [loadedAsset, setLoadedAsset] = useState<{
    assetId: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (!assetId) return;
    let active = true;
    void assetLoader(assetId)
      .then((url) => {
        if (active && url) setLoadedAsset({ assetId, url });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [assetId, assetLoader]);

  const assetUrl = loadedAsset?.assetId === assetId ? loadedAsset.url : null;
  return (
    <header
      className="day-cover"
      data-day-cover-variant={coverVariant ?? 'theme-default'}
      data-day-cover-asset-state={
        coverVariant === 'minimal'
          ? 'suppressed'
          : assetUrl
            ? 'loaded'
            : 'fallback'
      }
    >
      <span className="day-cover-overlay" aria-hidden="true" />
      {coverVariant !== 'minimal' && (
        <span
          className="day-cover-motif"
          aria-hidden="true"
          style={
            assetUrl ? { backgroundImage: `url("${assetUrl}")` } : undefined
          }
        />
      )}
      <div className="day-cover-content">
        <div className="day-cover-copy">
          <div className="day-cover-identity">
            <span className="day-cover-symbol" aria-hidden="true">
              <DaySymbolIcon
                symbol={daySymbol}
                themeSymbol={resolvedTheme.definition.calendar.symbol}
                size={20}
              />
            </span>
            <p className="eyebrow">{eyebrow}</p>
          </div>
          <h1>{heading}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
        {actions}
      </div>
    </header>
  );
}
