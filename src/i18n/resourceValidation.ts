import { namespaces, resources, type ResourceNamespace } from './resources';
import type { AppLocale } from '../domain/localization/locale';

export type ResourceCatalog = Record<AppLocale, Record<string, unknown>>;
const officialNamespaces = [
  'common',
  'nav',
  'today',
  'history',
  'settings',
  'theme',
  'backup',
  'errors',
] as const;
const pluralSuffix = /_(zero|one|two|few|many|other)$/;
const possiblePluralSuffix = /_([a-z][A-Za-z0-9]*)$/;
const optionalExactPluralForms = new Set(['zero']);
const interpolation = /{{\s*([^},\s]+).*?}}/g;
type PluralFamilies = Map<string, Map<string, string>>;

export const flattenResource = (
  value: unknown,
  prefix = '',
): Record<string, string> =>
  Object.entries(value as Record<string, unknown>).reduce(
    (all, [key, entry]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof entry === 'string'
        ? { ...all, [path]: entry }
        : { ...all, ...flattenResource(entry, path) };
    },
    {},
  );
const variables = (value: string) =>
  [...value.matchAll(interpolation)].map((match) => match[1]).sort();
const isLowerCamelSegment = (segment: string) =>
  /^[a-z][A-Za-z0-9]*$/.test(segment.replace(pluralSuffix, ''));
const pluralBase = (path: string) =>
  pluralSuffix.test(path) ? path.replace(pluralSuffix, '') : null;
const findPluralFamilies = (flat: Record<string, string>): PluralFamilies => {
  const candidates: PluralFamilies = new Map();
  for (const [key, value] of Object.entries(flat)) {
    const match = pluralSuffix.exec(key);
    if (!match) continue;
    const base = key.replace(pluralSuffix, '');
    const variants = candidates.get(base) ?? new Map<string, string>();
    variants.set(match[1], value);
    candidates.set(base, variants);
  }
  return new Map(
    [...candidates].filter(
      ([, variants]) =>
        variants.size >= 2 ||
        [...variants.values()].some((value) =>
          variables(value).includes('count'),
        ),
    ),
  );
};
const semanticPath = (path: string, families: PluralFamilies) => {
  const base = pluralBase(path);
  return base !== null && families.has(base) ? base : path;
};
export const resourceLookupPaths = (resource: unknown): Set<string> => {
  const flat = flattenResource(resource);
  const families = findPluralFamilies(flat);
  const paths = new Set<string>();
  for (const key of Object.keys(flat)) {
    paths.add(key);
    paths.add(semanticPath(key, families));
  }
  return paths;
};
const representativeVariables = (
  flat: Record<string, string>,
  families: PluralFamilies,
  key: string,
) => {
  const family = families.get(key);
  if (!family) return variables(flat[key] ?? '');
  const representative =
    [...family].find(([form]) => form !== 'zero')?.[1] ??
    family.values().next().value ??
    '';
  return variables(representative);
};

export function validateResourceCatalog(
  catalog: ResourceCatalog = resources as unknown as ResourceCatalog,
): string[] {
  const errors: string[] = [];
  for (const locale of ['vi', 'en'] as const) {
    const actual = Object.keys(catalog[locale] ?? {});
    if (actual.join('|') !== officialNamespaces.join('|'))
      errors.push(`${locale}: expected exactly eight official namespaces`);
  }
  const flattened = {} as Record<
    AppLocale,
    Record<ResourceNamespace, Record<string, string>>
  >;
  const pluralFamilies = {} as Record<
    AppLocale,
    Record<ResourceNamespace, PluralFamilies>
  >;
  for (const locale of ['vi', 'en'] as const) {
    flattened[locale] = {} as Record<ResourceNamespace, Record<string, string>>;
    pluralFamilies[locale] = {} as Record<ResourceNamespace, PluralFamilies>;
    for (const namespace of namespaces) {
      const flat = flattenResource(catalog[locale]?.[namespace] ?? {});
      const groups = findPluralFamilies(flat);
      flattened[locale][namespace] = flat;
      pluralFamilies[locale][namespace] = groups;
      for (const [key, value] of Object.entries(flat)) {
        if (!value.trim())
          errors.push(`${locale}/${namespace}:${key} is empty`);
        if (/<[^>]+>/.test(value))
          errors.push(`${locale}/${namespace}:${key} contains raw HTML`);
        if (key.split('.').some((segment) => !isLowerCamelSegment(segment)))
          errors.push(`${locale}/${namespace}:${key} is not lowerCamelCase`);
      }
      const countBearingBaseKeys = new Set<string>();
      for (const [key, value] of Object.entries(flat)) {
        const base = pluralBase(key);
        if (base !== null && groups.has(base)) continue;
        const suffixMatch = possiblePluralSuffix.exec(key);
        const attemptedBase = suffixMatch
          ? key.slice(0, -suffixMatch[0].length)
          : null;
        if (
          suffixMatch &&
          attemptedBase !== null &&
          groups.has(attemptedBase)
        ) {
          errors.push(
            `${locale}/${namespace}:${key} has unsupported plural suffix ${suffixMatch[1]}`,
          );
          continue;
        }
        if (variables(value).includes('count')) countBearingBaseKeys.add(key);
      }
      for (const base of countBearingBaseKeys) {
        if (groups.has(base))
          errors.push(
            `${locale}/${namespace}:${base} must not mix a base value with plural variants`,
          );
        else
          errors.push(
            `${locale}/${namespace}:${base} uses count but has no plural variants`,
          );
      }
      const requiredForms = new Intl.PluralRules(locale).resolvedOptions()
        .pluralCategories;
      for (const [base, variants] of groups) {
        if (Object.hasOwn(flat, base) && !countBearingBaseKeys.has(base))
          errors.push(
            `${locale}/${namespace}:${base} must not mix a base value with plural variants`,
          );
        const actualForms = [...variants.keys()].sort();
        const missingForms = requiredForms.filter(
          (form) => !variants.has(form),
        );
        if (missingForms.length)
          errors.push(
            `${locale}/${namespace}:${base} expected plural forms ${requiredForms.join(', ')}, missing ${missingForms.join(', ')}`,
          );
        const unsupportedForms = actualForms.filter(
          (form) =>
            !requiredForms.includes(form as Intl.LDMLPluralRule) &&
            !optionalExactPluralForms.has(form),
        );
        if (unsupportedForms.length)
          errors.push(
            `${locale}/${namespace}:${base} has unsupported plural forms ${unsupportedForms.join(', ')}`,
          );
        const regularVariableSets = [...variants]
          .filter(([form]) => form !== 'zero')
          .map(([, value]) => variables(value));
        if (
          regularVariableSets.some(
            (value) => value.join('|') !== regularVariableSets[0]?.join('|'),
          )
        )
          errors.push(
            `${locale}/${namespace}:${base} has plural interpolation mismatch`,
          );
        if (regularVariableSets.some((value) => !value.includes('count')))
          errors.push(
            `${locale}/${namespace}:${base} plural variants must interpolate count`,
          );
        const zero = variants.get('zero');
        if (zero !== undefined && regularVariableSets.length) {
          const zeroVariables = variables(zero);
          const regularVariables = regularVariableSets[0];
          const expectedZeroVariables = zeroVariables.includes('count')
            ? regularVariables
            : regularVariables.filter((variable) => variable !== 'count');
          if (zeroVariables.join('|') !== expectedZeroVariables.join('|'))
            errors.push(
              `${locale}/${namespace}:${base} has plural interpolation mismatch`,
            );
        }
      }
    }
  }
  for (const namespace of namespaces) {
    const vi = flattened.vi[namespace];
    const en = flattened.en[namespace];
    const viFamilies = pluralFamilies.vi[namespace];
    const enFamilies = pluralFamilies.en[namespace];
    const viKeys = [
      ...new Set(Object.keys(vi).map((key) => semanticPath(key, viFamilies))),
    ].sort();
    const enKeys = [
      ...new Set(Object.keys(en).map((key) => semanticPath(key, enFamilies))),
    ].sort();
    if (viKeys.join('|') !== enKeys.join('|'))
      errors.push(`${namespace}: locale key parity mismatch`);
    for (const key of viKeys.filter((value) => enKeys.includes(value))) {
      const viVariables = representativeVariables(vi, viFamilies, key).join(
        '|',
      );
      const enVariables = representativeVariables(en, enFamilies, key).join(
        '|',
      );
      if (viVariables !== enVariables)
        errors.push(`${namespace}:${key} has locale interpolation mismatch`);
    }
  }
  for (const locale of ['vi', 'en'] as const) {
    if (!flattened[locale].errors['messages.unknown']?.trim())
      errors.push(`${locale}/errors: messages.unknown is required`);
  }
  return errors;
}
