import type { DayThemeDefinition } from './models';

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const entry of Object.values(value as Record<string, unknown>))
      deepFreeze(entry);
  }
  return value;
}

export function defineDayTheme(
  definition: DayThemeDefinition,
): DayThemeDefinition {
  return deepFreeze(structuredClone(definition));
}
