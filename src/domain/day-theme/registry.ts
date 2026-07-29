import {
  builtInDayThemes,
  doneTodayDefaultDayTheme,
  DEFAULT_DAY_THEME_ID,
} from './definitions';
import type {
  DayThemeDefinition,
  DayThemeReference,
  ResolvedDayTheme,
} from './models';
import {
  assertValidDayThemeDefinition,
  isValidDayThemeId,
  isValidDayThemeVersion,
} from './validation';

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const entry of Object.values(value as Record<string, unknown>))
      deepFreeze(entry);
  }
  return value;
}

function immutableCopy(definition: DayThemeDefinition): DayThemeDefinition {
  return deepFreeze(structuredClone(definition));
}

const emergencyDayTheme = immutableCopy({
  ...doneTodayDefaultDayTheme,
  id: 'done-today-emergency',
  nameKey: 'theme:dayTheme.doneTodayDefault.name',
  descriptionKey: 'theme:dayTheme.doneTodayDefault.description',
  metadata: { ...doneTodayDefaultDayTheme.metadata, builtIn: false },
});

export class DayThemeRegistry {
  readonly #themes = new Map<string, DayThemeDefinition[]>();
  readonly #defaultId: string;

  constructor(
    definitions: readonly DayThemeDefinition[],
    defaultId = DEFAULT_DAY_THEME_ID,
  ) {
    this.#defaultId = defaultId;
    for (const definition of definitions) this.register(definition);
  }

  register(definition: DayThemeDefinition): DayThemeDefinition {
    assertValidDayThemeDefinition(definition);
    const versions = this.#themes.get(definition.id) ?? [];
    if (versions.some((value) => value.version === definition.version)) {
      throw new Error(
        `Day Theme ${definition.id}@${definition.version} is already registered`,
      );
    }
    const stored = immutableCopy(definition);
    this.#themes.set(
      definition.id,
      [...versions, stored].sort((a, b) => a.version - b.version),
    );
    return stored;
  }

  list(): readonly DayThemeDefinition[] {
    return Object.freeze([...this.#themes.values()].flat());
  }

  resolve(
    themeId: string | null,
    themeVersion: number | null,
  ): ResolvedDayTheme {
    const requested: DayThemeReference | null =
      typeof themeId === 'string' && typeof themeVersion === 'number'
        ? Object.freeze({ id: themeId, version: themeVersion })
        : null;
    if (
      themeId !== null &&
      themeVersion !== null &&
      isValidDayThemeId(themeId) &&
      isValidDayThemeVersion(themeVersion)
    ) {
      const versions = this.#themes.get(themeId) ?? [];
      const exact = versions.find((value) => value.version === themeVersion);
      if (exact)
        return Object.freeze({ definition: exact, source: 'exact', requested });
      const compatible = versions.at(-1);
      if (compatible)
        return Object.freeze({
          definition: compatible,
          source: 'compatible',
          requested,
        });
    }
    const defaultTheme = this.#themes.get(this.#defaultId)?.at(-1);
    if (defaultTheme)
      return Object.freeze({
        definition: defaultTheme,
        source: 'default',
        requested,
      });
    return Object.freeze({
      definition: emergencyDayTheme,
      source: 'emergency',
      requested,
    });
  }
}

export const dayThemeRegistry = new DayThemeRegistry(builtInDayThemes);
