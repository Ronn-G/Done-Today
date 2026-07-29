export const dayThemeAssetIds = [
  'theme.sakura.cover.motif',
  'theme.coffee.cover.motif',
  'theme.rainy.cover.motif',
] as const;

export type DayThemeAssetId = (typeof dayThemeAssetIds)[number];
export type DayThemeAssetLoader = (assetId: string) => Promise<string | null>;

const assetLoaders: Record<DayThemeAssetId, () => Promise<string>> = {
  'theme.sakura.cover.motif': () =>
    import('./assets/sakura-motif.svg?url').then((module) => module.default),
  'theme.coffee.cover.motif': () =>
    import('./assets/coffee-motif.svg?url').then((module) => module.default),
  'theme.rainy.cover.motif': () =>
    import('./assets/rainy-motif.svg?url').then((module) => module.default),
};

export function isKnownDayThemeAssetId(
  assetId: string,
): assetId is DayThemeAssetId {
  return Object.hasOwn(assetLoaders, assetId);
}

export const loadDayThemeAsset: DayThemeAssetLoader = async (assetId) => {
  if (!isKnownDayThemeAssetId(assetId)) return null;
  try {
    return await assetLoaders[assetId]();
  } catch {
    return null;
  }
};
