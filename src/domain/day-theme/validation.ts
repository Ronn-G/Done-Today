import type {DayThemeDefinition} from './models';

export const DAY_THEME_ID_MAX_LENGTH = 64;
const ASSET_ID_MAX_LENGTH = 128;
const CSS_VALUE_MAX_LENGTH = 512;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ASSET_ID_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const TRANSLATION_KEY_PATTERN = /^theme:[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*){2,}$/;
const UNSAFE_CSS_PATTERN = /[;{}]|url\s*\(|expression\s*\(|@import|[\u0000-\u001f\u007f]/i;

export class DayThemeValidationError extends Error {
  readonly issues: readonly string[];
  constructor(issues: readonly string[]) {
    super(`Invalid Day Theme definition: ${issues.join(', ')}`);
    this.name = 'DayThemeValidationError';
    this.issues = Object.freeze([...issues]);
  }
}

export function isValidDayThemeId(value: string): boolean {
  return value.length > 0 && value.length <= DAY_THEME_ID_MAX_LENGTH && ID_PATTERN.test(value);
}

export function isValidDayThemeVersion(value: number): boolean {
  return Number.isInteger(value) && value >= 1;
}

function validCssValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0
    && trimmed.length <= CSS_VALUE_MAX_LENGTH
    && !UNSAFE_CSS_PATTERN.test(trimmed);
}

function validGradient(value: string): boolean {
  const trimmed = value.trim();
  return validCssValue(trimmed) && /^(?:linear|radial)-gradient\(/i.test(trimmed);
}

function validAssetId(value: string | undefined): boolean {
  return value === undefined
    || (value.length <= ASSET_ID_MAX_LENGTH && ASSET_ID_PATTERN.test(value));
}

export function validateDayThemeDefinition(value: DayThemeDefinition): readonly string[] {
  const issues: string[] = [];
  if (!isValidDayThemeId(value.id)) issues.push('id');
  if (!isValidDayThemeVersion(value.version)) issues.push('version');
  if (!TRANSLATION_KEY_PATTERN.test(value.nameKey)) issues.push('nameKey');
  if (!TRANSLATION_KEY_PATTERN.test(value.descriptionKey)) issues.push('descriptionKey');
  if (!['light', 'dark', 'adaptive'].includes(value.mode)) issues.push('mode');

  for (const [name, token] of Object.entries(value.tokens)) {
    if (!validCssValue(token)) issues.push(`tokens.${name}`);
  }
  const requiredTokenKeys = [
    'pageBackground', 'daySurface', 'daySurfaceRaised', 'dayText', 'dayTextMuted',
    'dayBorder', 'accent', 'accentHover', 'accentSoft', 'focusRing',
  ];
  for (const name of requiredTokenKeys) {
    if (!Object.hasOwn(value.tokens, name)) issues.push(`tokens.${name}`);
  }

  if (!validGradient(value.cover.fallbackGradient)) issues.push('cover.fallbackGradient');
  if (!validCssValue(value.cover.overlay)) issues.push('cover.overlay');
  if (!['light', 'dark'].includes(value.cover.textTone)) issues.push('cover.textTone');
  if (!validAssetId(value.cover.assetId)) issues.push('cover.assetId');
  if (!validAssetId(value.cover.motifAssetId)) issues.push('cover.motifAssetId');
  if (!validCssValue(value.calendar.indicatorColor)) issues.push('calendar.indicatorColor');
  if (value.calendar.symbol !== undefined && [...value.calendar.symbol].length > 4) {
    issues.push('calendar.symbol');
  }
  if (value.typography?.journalFontRole !== undefined
    && !['ui', 'journal', 'display'].includes(value.typography.journalFontRole)) {
    issues.push('typography.journalFontRole');
  }
  if (value.typography?.headingWeight !== undefined
    && (!Number.isInteger(value.typography.headingWeight)
      || value.typography.headingWeight < 400
      || value.typography.headingWeight > 800)) {
    issues.push('typography.headingWeight');
  }
  if (!['calm', 'warm', 'nature', 'night', 'seasonal', 'minimal'].includes(value.metadata.category)) {
    issues.push('metadata.category');
  }
  if (typeof value.metadata.builtIn !== 'boolean') issues.push('metadata.builtIn');
  return Object.freeze([...new Set(issues)]);
}

export function assertValidDayThemeDefinition(value: DayThemeDefinition): void {
  const issues = validateDayThemeDefinition(value);
  if (issues.length > 0) throw new DayThemeValidationError(issues);
}

export function validateDayThemeMetadata(
  themeId: string | null,
  themeVersion: number | null,
): boolean {
  return themeId === null && themeVersion === null
    || themeId !== null
      && themeVersion !== null
      && isValidDayThemeId(themeId)
      && isValidDayThemeVersion(themeVersion);
}
