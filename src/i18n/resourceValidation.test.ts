import { describe, expect, it } from 'vitest';
import { resources } from './resources';
import { validateResourceCatalog } from './resourceValidation';
import {
  findDuplicateResourceKeys,
  findTranslationCallSiteErrors,
  validateProductionTranslationCallSites,
} from './sourceValidation';

type MutableCatalog = NonNullable<
  Parameters<typeof validateResourceCatalog>[0]
>;
const catalog = () => structuredClone(resources) as unknown as MutableCatalog;
const examples = (value: MutableCatalog, locale: 'vi' | 'en') =>
  (value[locale].common as { examples: Record<string, string> }).examples;
const replaceItemCount = (
  value: MutableCatalog,
  locale: 'vi' | 'en',
  entries: Record<string, string>,
) => {
  const target = examples(value, locale);
  for (const key of Object.keys(target).filter((key) =>
    key.startsWith('itemCount'),
  ))
    delete target[key];
  Object.assign(target, entries);
};
describe('resource validator negative cases', () => {
  it('rejects a missing namespace', () => {
    const value = catalog();
    delete value.en.backup;
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'eight official namespaces',
    );
  });
  it('rejects a missing key', () => {
    const value = catalog();
    delete (value.en.nav as { today?: string }).today;
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'key parity mismatch',
    );
  });
  it('rejects interpolation mismatch', () => {
    const value = catalog();
    (value.en.common as { examples: { welcome: string } }).examples.welcome =
      'Hello, {{person}}';
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'locale interpolation mismatch',
    );
  });
  it('rejects empty translation', () => {
    const value = catalog();
    (value.en.nav as { today: string }).today = ' ';
    expect(validateResourceCatalog(value).join('\n')).toContain('is empty');
  });
  it('rejects raw HTML', () => {
    const value = catalog();
    (value.en.nav as { today: string }).today = '<b>Today</b>';
    expect(validateResourceCatalog(value).join('\n')).toContain('raw HTML');
  });
  it('rejects missing unknown fallback', () => {
    const value = catalog();
    delete (value.vi.errors as { messages: { unknown?: string } }).messages
      .unknown;
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'messages.unknown is required',
    );
  });
  it('detects duplicate keys from source before object evaluation', () => {
    expect(
      findDuplicateResourceKeys(
        "export default {language:{label:'A',label:'B'}} as const",
        'fixture.ts',
      )[0],
    ).toContain('duplicate key language.label');
  });
  it.each([
    ["export default {a:{b:'first'},'a.b':'second'}", 'a.b'],
    ["export default {'a.b':'first',a:{b:'second'}}", 'a.b'],
    ["export default {a:{b:{c:'first'}},'a.b.c':'second'}", 'a.b.c'],
  ])('detects canonical flattened-path collisions', (source, path) => {
    expect(
      findDuplicateResourceKeys(source, 'fixture.ts').join('\n'),
    ).toContain(`duplicate flattened path ${path}`);
  });
  it('allows distinct nested and dotted paths', () => {
    expect(
      findDuplicateResourceKeys(
        "export default {a:{b:'first'},'a.c':'second'}",
        'fixture.ts',
      ),
    ).toEqual([]);
  });
  it('rejects source spreads that could hide duplicate flattened paths', () => {
    expect(
      findDuplicateResourceKeys(
        "const shared={label:'A'};export default {language:{...shared,label:'B'}}",
        'fixture.ts',
      )[0],
    ).toContain('spread properties are not allowed');
  });
  it('rejects missing English singular form', () => {
    const value = catalog();
    delete (value.en.common as { examples: { itemCount_one?: string } })
      .examples.itemCount_one;
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'expected plural forms one, other',
    );
  });
  it('rejects orphan Vietnamese singular form', () => {
    const value = catalog();
    examples(value, 'vi').itemCount_one = '{{count}} mục';
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'unsupported plural forms one',
    );
  });
  it('accepts count-free ordinary literals whose names end in recognized plural suffixes', () => {
    const value = catalog();
    for (const locale of ['vi', 'en'] as const)
      Object.assign(examples(value, locale), {
        phase_one: 'Phase one',
        status_other: 'Other status',
        amount_zero: 'Zero amount',
      });
    expect(validateResourceCatalog(value)).toEqual([]);
  });
  it('rejects a count-bearing orphan English one variant', () => {
    const value = catalog();
    replaceItemCount(value, 'en', { itemCount_one: '{{count}} item' });
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'expected plural forms one, other, missing other',
    );
  });
  it('rejects a count-bearing orphan Vietnamese zero variant', () => {
    const value = catalog();
    replaceItemCount(value, 'vi', { itemCount_zero: '{{count}} mục' });
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'expected plural forms other, missing other',
    );
  });
  it('rejects plural interpolation mismatch', () => {
    const value = catalog();
    (
      value.en.common as { examples: { itemCount_one: string } }
    ).examples.itemCount_one = '{{total}} item';
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'plural interpolation mismatch',
    );
  });
  it('rejects a mixed base and plural structure', () => {
    const value = catalog();
    (
      value.en.common as { examples: Record<string, string> }
    ).examples.itemCount = '{{count}} items';
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'must not mix a base value',
    );
  });
  it('rejects a count-bearing base key without plural variants', () => {
    const value = catalog();
    replaceItemCount(value, 'vi', { itemCount: '{{count}} mục' });
    replaceItemCount(value, 'en', { itemCount: '{{count}} items' });
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'uses count but has no plural variants',
    );
  });
  it('rejects English other without one', () => {
    const value = catalog();
    replaceItemCount(value, 'en', { itemCount_other: '{{count}} items' });
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'expected plural forms one, other',
    );
  });
  it('accepts the required English and Vietnamese plural forms', () =>
    expect(validateResourceCatalog(catalog())).toEqual([]));
  it('accepts optional exact zero without replacing required plural forms', () => {
    const value = catalog();
    examples(value, 'en').itemCount_zero = 'No items';
    examples(value, 'vi').itemCount_zero = 'Không có mục';
    expect(validateResourceCatalog(value)).toEqual([]);
  });
  it('rejects zero and one when English other is missing', () => {
    const value = catalog();
    replaceItemCount(value, 'en', {
      itemCount_zero: 'No items',
      itemCount_one: '{{count}} item',
    });
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'missing other',
    );
  });
  it('accepts Vietnamese zero plus other', () => {
    const value = catalog();
    examples(value, 'vi').itemCount_zero = '{{count}} mục';
    expect(validateResourceCatalog(value)).toEqual([]);
  });
  it('rejects an unsupported plural suffix', () => {
    const value = catalog();
    examples(value, 'en').itemCount_single = '{{count}} item';
    expect(validateResourceCatalog(value).join('\n')).toContain(
      'unsupported plural suffix single',
    );
  });
  it('does not treat count-free ordinary keys as plural groups', () => {
    const value = catalog();
    examples(value, 'vi').note = 'Ghi chú';
    examples(value, 'en').note = 'Note';
    expect(validateResourceCatalog(value)).toEqual([]);
  });
});

describe('translation call-site validation', () => {
  const withHook = (source: string) =>
    `import {useTranslation} from 'react-i18next';\n${source}`;
  const settingsSource = withHook(
    "const {t}=useTranslation('settings');export const label=()=>t('language.label')",
  );
  it('accepts an existing key in the correct namespace', () =>
    expect(
      findTranslationCallSiteErrors(settingsSource, catalog(), 'fixture.tsx'),
    ).toEqual([]));
  it('accepts an ordinary recognized-suffix literal at a translation call site', () => {
    const value = catalog();
    for (const locale of ['vi', 'en'] as const)
      examples(value, locale).phase_one = 'Phase one';
    expect(
      findTranslationCallSiteErrors(
        withHook("const {t}=useTranslation('common');t('examples.phase_one')"),
        value,
        'fixture.tsx',
      ),
    ).toEqual([]);
  });
  it('fails through the production scanner when both catalogs rename a key without updating LanguageSettings', () => {
    const value = catalog();
    for (const locale of ['vi', 'en'] as const) {
      const language = (
        value[locale].settings as { language: Record<string, unknown> }
      ).language;
      language.caption = language.label;
      delete language.label;
    }
    const scan = validateProductionTranslationCallSites({ catalog: value });
    const languageLabel = scan.callSites.find(
      (site) =>
        site.fileName
          .replaceAll('\\', '/')
          .endsWith('/src/features/settings/LanguageSettings.tsx') &&
        site.namespace === 'settings' &&
        site.key === 'language.label',
    );
    expect(
      scan.filesScanned.some((fileName) =>
        fileName
          .replaceAll('\\', '/')
          .endsWith('/src/features/settings/LanguageSettings.tsx'),
      ),
    ).toBe(true);
    expect(languageLabel).toMatchObject({
      namespace: 'settings',
      key: 'language.label',
    });
    expect(scan.errors.join('\n')).toMatch(
      /LanguageSettings\.tsx:\d+:\d+ missing translation key settings:language\.label for vi, en/,
    );
  });
  it('rejects an unknown literal key', () => {
    expect(
      findTranslationCallSiteErrors(
        withHook(
          "const {t}=useTranslation('settings');t('language.notPresent')",
        ),
        catalog(),
        'fixture.tsx',
      ).join('\n'),
    ).toContain(
      'fixture.tsx:2:38 missing translation key settings:language.notPresent for vi, en',
    );
  });
  it('rejects a valid leaf name in the wrong namespace', () => {
    expect(
      findTranslationCallSiteErrors(
        withHook("const {t}=useTranslation('nav');t('language.label')"),
        catalog(),
        'fixture.tsx',
      ).join('\n'),
    ).toContain('missing translation key nav:language.label');
  });
  it('accepts an explicit valid namespace', () => {
    expect(
      findTranslationCallSiteErrors(
        withHook(
          "const {t}=useTranslation('settings');t('common:actions.retry')",
        ),
        catalog(),
        'fixture.tsx',
      ),
    ).toEqual([]);
  });
  it('rejects dynamic keys without an explicit typed allow-list', () => {
    expect(
      findTranslationCallSiteErrors(
        withHook("const {t}=useTranslation('settings');t(key)"),
        catalog(),
        'fixture.tsx',
      ).join('\n'),
    ).toContain(
      'dynamic translation keys require an explicit typed allow-list',
    );
  });
  it('does not scan a generic helper named t', () => {
    expect(
      findTranslationCallSiteErrors(
        withHook(
          "function run(t:(value:string)=>string){return t('not.a.translation')}",
        ),
        catalog(),
        'fixture.tsx',
      ),
    ).toEqual([]);
  });
  it('resolves a translator separately from a shadowing parameter', () => {
    const source = withHook(`function Component(){
      const {t}=useTranslation('settings');
      function helper(t:(value:string)=>string){return t('not.a.translation')}
      helper(value=>value);return t('language.label');
    }`);
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx'),
    ).toEqual([]);
  });
  it('resolves a translator separately from a block-local shadowing variable', () => {
    const source = withHook(`function Component(){
      const {t}=useTranslation('settings');
      {const t=(value:string)=>value;t('not.a.translation')}
      return t('language.label');
    }`);
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx'),
    ).toEqual([]);
  });
  it('supports translators with the same local name in separate namespace scopes', () => {
    const source =
      withHook(`function SettingsSection(){const {t}=useTranslation('settings');return t('language.label')}
      function CommonSection(){const {t}=useTranslation('common');return t('actions.retry')}`);
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx'),
    ).toEqual([]);
  });
  it('supports different translator identifiers in the same scope', () => {
    const source = withHook(
      "const {t}=useTranslation('settings');const {t:commonT}=useTranslation('common');t('language.label');commonT('actions.retry')",
    );
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx'),
    ).toEqual([]);
  });
  it('does not trust a local helper named useTranslation', () => {
    const source =
      "function helper(value:string){return value} function useTranslation(){return{t:helper}} const {t}=useTranslation();t('not.a.translation')";
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx'),
    ).toEqual([]);
  });
  it('supports an aliased named import from react-i18next', () => {
    const source =
      "import {useTranslation as useI18n} from 'react-i18next';const {t:translate}=useI18n('settings');translate('language.label')";
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx'),
    ).toEqual([]);
  });
  it('resolves an outer translator from an unshadowed nested scope', () => {
    const source = withHook(
      "function Component(){const {t}=useTranslation('settings');function nested(){return t('language.label')}return nested()}",
    );
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx'),
    ).toEqual([]);
  });
  it('fails clearly for an unsupported non-destructured hook result', () => {
    const source = withHook("const translation=useTranslation('settings')");
    expect(
      findTranslationCallSiteErrors(source, catalog(), 'fixture.tsx').join(
        '\n',
      ),
    ).toContain('useTranslation result must use object destructuring');
  });
});
