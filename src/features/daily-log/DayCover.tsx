import {useEffect, useState, type ReactNode} from 'react';
import {loadDayThemeAsset, type DayThemeAssetLoader} from '../../domain/day-theme/assets';
import type {ResolvedDayTheme} from '../../domain/day-theme/models';

export function DayCover({
  resolvedTheme,
  eyebrow,
  heading,
  subtitle,
  actions,
  assetLoader = loadDayThemeAsset,
}: {
  resolvedTheme: ResolvedDayTheme;
  eyebrow: ReactNode;
  heading: ReactNode;
  subtitle: ReactNode;
  actions: ReactNode;
  assetLoader?: DayThemeAssetLoader;
}) {
  const assetId = resolvedTheme.definition.cover.assetId
    ?? resolvedTheme.definition.cover.motifAssetId
    ?? null;
  const [loadedAsset, setLoadedAsset] = useState<{assetId: string; url: string} | null>(null);

  useEffect(() => {
    if (!assetId) return;
    let active = true;
    void assetLoader(assetId)
      .then(url => {
        if (active && url) setLoadedAsset({assetId, url});
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [assetId, assetLoader]);

  const assetUrl = loadedAsset?.assetId === assetId ? loadedAsset.url : null;
  return <header
    className="day-cover"
    data-day-cover-asset-state={assetUrl ? 'loaded' : 'fallback'}
  >
    <span className="day-cover-overlay" aria-hidden="true"/>
    <span
      className="day-cover-motif"
      aria-hidden="true"
      style={assetUrl ? {backgroundImage: `url("${assetUrl}")`} : undefined}
    />
    <div className="day-cover-content">
      <div className="day-cover-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{heading}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      {actions}
    </div>
  </header>;
}
