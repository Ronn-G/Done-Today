# Internationalization and localization

Status: architecture specification for Sprint I18N-0  
Initial locales: Vietnamese (`vi`) and English (`en`)

## 1. Goals and scope

Done Today must present the application shell, journal workflow, settings, theme customization,
backup/restore and accessibility text in the selected locale while preserving local-first data and
all stable domain contracts. This document is the source of truth for the staged implementation.

I18N-0 is audit and design only. It does not add a language selector, change the current Vietnamese
experience, migrate user data, change database schema or change backup v1.

## 2. Non-negotiable principles

1. Never translate user-entered task, result, next-action or category text.
2. Never localize database enums, IDs, setting keys, JSON field names or backup format identifiers.
3. Translation happens at presentation boundaries, not in repositories or business sorting.
4. Date, time, number, percentage and plural behavior use the active locale.
5. Existing users must not unexpectedly switch away from Vietnamese.
6. Missing translations must fall back safely and must not block journal access.
7. Backend errors must not expose SQL, stack traces or absolute paths.
8. Locale changes must not reload, rewrite or reorder journal data.
9. Accessibility text is part of the translation catalog.
10. A new locale is incomplete until automated checks and native visual review pass.

## 3. Locale model, default and fallback

Use the supported locale union:

```ts
type AppLocale = 'vi' | 'en';
```

Canonical tags are `vi` and `en`; regional variants from the OS are normalized (`vi-VN` to `vi`,
`en-US`/`en-GB` to `en`). Locale selection has two deliberately separate policies:

- **Current rollout fallback: `vi`.** During I18N-1, an installation that has no stored locale and
  cannot be classified reliably resolves to Vietnamese. This protects existing users during the
  compatibility rollout; it is not the long-term product default.
- **Final fresh-install fallback: `en`.** Once fresh installations can be identified through
  trustworthy installation-generation metadata, migration metadata or a bootstrap marker, detect
  the OS locale. Normalize Vietnamese variants to `vi`, English variants to `en`, and unsupported
  locales to `en`.

After locale initialization, resource lookup falls back from the selected locale to English, then
to a short built-in English emergency string only if i18n initialization itself fails. The
compatibility `vi` decision applies to resolving a missing persisted preference, not to the
long-term translation-resource fallback chain.

### Existing users

If no persisted locale exists in a database created by a pre-i18n release, initialize
`localization.locale = "vi"` once. Do not infer from current OS locale during an upgrade.
Persist the result so the application does not classify the installation again at every startup.

### Fresh installations

The final product policy is OS detection:

- supported Vietnamese OS locale -> `vi`;
- supported English OS locale -> `en`;
- unsupported locale -> `en`.

Implementation must reliably distinguish a pre-existing database from a fresh installation before
using OS detection. If I18N-1 cannot prove that distinction without fragile heuristics, every
missing preference resolves to `vi` for that rollout and final fresh-install detection is deferred
to I18N-5. Do not infer installation age from the presence of daily logs, user content, category
count, Vietnamese category names or theme preferences.

## 4. Detection and persistence

Persist the explicit or initialized locale in SQLite `app_settings` under the stable key:

```text
localization.locale
```

SQLite is preferred over `localStorage` because locale is a durable application preference, the
technical design reserves `localStorage` for non-important UI state, and the existing typed
settings/repository pattern already protects theme preferences.

Recommended startup order:

1. Open/migrate database.
2. Read `localization.locale`.
3. If present and supported, activate it.
4. If absent, apply the compatibility or trustworthy fresh-install policy above.
5. Persist the resolved locale before relying on it at the next startup.
6. Render the application after a small deterministic bootstrap/fallback state.

Changing locale persists optimistically through a coordinator with retry behavior similar to theme
settings. A failed save may keep the current in-memory preview but must show a localized retry state.

Do not store the active locale in route hashes. A small localStorage cache may only be considered to
avoid first-frame language flash; SQLite remains authoritative and invalid cache values are ignored.

## 5. Proposed architecture

```text
src/
├── app/
│   └── providers/
│       └── LocalizationProvider.tsx
├── application/
│   └── localization/
│       ├── localeService.ts
│       └── localeSaveCoordinator.ts
├── domain/
│   └── localization/
│       ├── locale.ts
│       └── formatterContracts.ts
├── infrastructure/
│   └── database/
│       └── tauriLocaleRepository.ts
└── i18n/
    ├── index.ts
    ├── resources.ts
    ├── formatters.ts
    └── locales/
         ├── vi/
         │   ├── common.ts
         │   ├── nav.ts
         │   ├── today.ts
         │   ├── history.ts
         │   ├── settings.ts
         │   ├── theme.ts
         │   ├── backup.ts
         │   └── errors.ts
         └── en/
             └── ...
```

The first implementation may use JSON or typed TypeScript resource objects. TypeScript resources
are preferred initially because the repository already compiles TS, resource keys can be checked
without another generation step, and messages remain bundled/offline.

## 6. Library evaluation and decision

No i18n dependency currently exists. A hand-written dictionary would be small at first, but the
audit already found more than 150 frontend/backend-facing messages, interpolation, plural counts,
fallback requirements and eight resource namespaces. Reimplementing plural resolution, missing-key
diagnostics and React subscription correctly would create avoidable maintenance risk.

Decision for I18N-1:

- add `i18next` and `react-i18next`;
- use built-in browser `Intl` APIs for dates, numbers, percentages and lists;
- do not add Moment, date-fns, Luxon or a separate number-formatting library;
- keep i18next initialization local and synchronous from bundled resources;
- do not use a remote translation backend or language detector plugin.

`react-i18next` is justified by React integration, namespace loading, interpolation/plural support,
fallback behavior and mature diagnostics. Locale detection and SQLite persistence remain
application-owned rather than plugin-owned.

## 7. Translation keys and namespaces

The official convention is:

```text
<namespace>.<area>.<semanticName>
```

Use `lowerCamelCase` for every segment. Keys describe meaning, never the source sentence,
punctuation, visual position or temporary component structure.

```text
common.actions.retry
common.actions.cancel
common.actions.close

nav.today
nav.history
nav.settings

today.fields.task.label
today.fields.task.placeholder
today.fields.result.label
today.fields.nextAction.label

today.item.confirmDelete.title
today.item.confirmDelete.body
today.item.accessibility.actionsForTask

today.stats.total
today.stats.completed
today.stats.completionRate

history.empty.title
history.empty.body

settings.language.label
settings.language.option.vi
settings.language.option.en

theme.preset.coffee.name
theme.preset.coffee.description

backup.errors.fileTooLarge
backup.confirmReplace.title
backup.confirmReplace.body

errors.messages.unknown
```

Namespaces:

- `common`: shared actions and states only when meaning and tone are genuinely identical;
- `nav`: stable application navigation;
- `today`: Today screen, table, item actions and statistics;
- `history`: History screen;
- `settings`: general settings and categories;
- `theme`: appearance modes, color controls and theme presets;
- `backup`: export/import, preview and backup errors;
- `errors`: stable backend/application error-code mapping when not feature-local.

These are eight independent i18next resource namespaces for every locale: `common`, `nav`, `today`,
`history`, `settings`, `theme`, `backup` and `errors`. The namespace is the first segment of the
canonical documentation key; remaining segments form the nested path inside that resource. For
example, `today.fields.task.label` belongs to namespace `today` and has resource-local path
`fields.task.label`. `nav` and `errors` are independent resources, not prefixes inside `common`.
This specification does not require a particular call-site syntax as long as those three concepts
remain distinct.

Avoid a deeply nested universal catalog. Feature ownership should remain obvious.

Use semantic segments consistently:

- `actions` for user actions;
- `label` for a control or field label;
- `title` and `body` for message/dialog hierarchy;
- `description` for supporting copy;
- `placeholder` only for input hints;
- `accessibility` for additional non-visible context;
- `errors` and `warnings` for failure/risk messages;
- `status` for displayed state.

Do not mix patterns such as `addButton`, `buttonAdd` and `actions.add`. Do not use layout-dependent
names such as `leftButton`, `topTitle`, `thirdColumn` or `bottomText`. Do not reuse one key for two
different meanings merely because the current Vietnamese copy is identical.

Visible and accessibility text may share a key only when their complete meaning is identical. If
the accessible name requires context, use a dedicated key such as
`today.item.accessibility.actionsForTask`.

Dynamic theme, status and backend-error mappings must use typed registries or stable allow-lists.
Never construct a key from untrusted data and never call `t(variableFromUserInput)`. A translation
key must not be used as a React key, database ID, theme ID, business condition or serialized value.
Renaming a key requires updating both locales and the completeness test in the same change.

Concrete key segments use `lowerCamelCase`. A placeholder inside `<...>` is descriptive notation in
this specification, not a literal resource segment. Two-segment keys are permitted only for the
small, stable set of navigation destinations under `nav`, such as `nav.today`; other resource keys
use an area and semantic name. The generic fallback therefore uses `errors.messages.unknown`.

| Type | Canonical pattern | Example |
|---|---|---|
| Default resource key | `<namespace>.<area>.<semanticName>` | `today.stats.completed` |
| Nested semantic key | Additional segments may follow the area | `today.fields.task.placeholder` |
| Navigation exception | `nav.<destination>` | `nav.today` |
| Backend stable code | Not a translation key; stable snake_case contract | `work_item.task_too_long` |
| Backend-code mapping target | Frontend translation key | `today.errors.taskTooLong` |
| Dynamic registry key | Only from a typed stable ID | `theme.colors.<themeColorKey>` |

Backend stable codes and frontend translation keys are separate contracts. A backend code is a
machine-readable, locale-independent wire value; it is never passed directly to `t(...)`, never
shown raw in production UI and does not change when resources are reorganized. The frontend uses
an exhaustive typed mapping from each supported code to a translation key. Unknown or unmapped
codes resolve to the localized safe fallback `errors.messages.unknown`.

## 8. Translation quality rules

- Translate intent, not individual words or Vietnamese sentence structure. Natural native wording
  is more important than literal equivalence.
- Machine-generated translation is draft material only until reviewed by a human in context.
- Preserve business meaning, severity and required user decision. Do not change domain meaning to
  make copy sound smoother.
- Never translate user-entered data, `Done Today`, enums, stable IDs, setting keys, backup fields,
  file extensions, checksum identifiers or other stable domain values.
- User data passed through interpolation remains unchanged and must never become a translation key.
- Button text should be short, clear and begin with a verb when appropriate. Dialog titles should
  be brief and identify the main decision.
- An error message should explain what happened and what the user can do next. Do not expose
  implementation terms such as `repository`, `schema`, `SQLite`, `payload` or `migration`.
- Do not assemble sentences from translation fragments when grammar or order may differ by locale.
- Use one consistent translation for the same action unless the meaning genuinely differs.
- Review English in the actual UI, including loading, empty, error, disabled and destructive states,
  rather than only in resource files.
- Keep punctuation, capitalization and sentence case consistent within each locale.
- A placeholder supplements a field label; it must not replace an important visible or accessible
  label.
- Prefer concise natural English when a shorter phrase preserves the full meaning.
- Never soften destructive actions, add marketing language to routine operations or introduce
  inconsistent terminology for the same business concept.
- Persisted category names are user data and must not be translated after creation.

Copy examples:

| Avoid | Prefer |
|---|---|
| `Delete work item` | `Delete task` |
| `Operation completed successfully.` | `Saved.` |
| `An error has occurred in the database.` | `We couldn’t save your changes. Try again.` |
| `Your task has been successfully removed from the system.` | `Task deleted.` |
| `Please input your work item.` | `Add what you worked on.` |

These examples illustrate copy-writing principles. They do not automatically become final
translation resources unless the source inventory or UI specification requires them.

## 9. Voice and tone

Done Today is warm, calm, concise, encouraging, respectful and non-judgmental. Vietnamese and
English must express the same personality without preserving identical sentence structure.

Application by context:

- **Navigation:** direct, familiar nouns with no decorative language.
- **Today:** gentle prompts focused on recording progress, never judging an empty day, unfinished
  work or a low completion rate.
- **Empty states:** encouraging without pressure, gamification or “try harder” language.
- **Autosave and success:** short and quiet; avoid celebration or repeated exclamation marks.
- **Confirmation dialogs:** state the decision and consequence clearly.
- **Destructive actions:** calm but explicit about deletion, Replace all, import/restore and
  possible data loss. Never use humor or soften severity.
- **Validation and errors:** factual, non-blaming and actionable. Technical failure is not the
  user’s fault.
- **Backup/restore:** reassuring about safety while remaining precise about replacement and
  overwrite risk.
- **Theme names/descriptions:** evocative but restrained; never promise productivity, health or
  life improvement.
- **Accessibility labels:** direct and exact, without decorative or motivational phrasing.

Do not use judgmental copy such as “Bạn đã thất bại.”, “Bạn chưa làm đủ.” or “Hãy cố gắng hơn.”
Do not make promises such as “Theme này sẽ giúp bạn làm việc hiệu quả hơn.” or “Ứng dụng sẽ thay
đổi cuộc sống của bạn.” Avoid cold corporate phrasing, excessive gamification and unnecessary
`must`/`should` language in daily progress or empty states; reserve mandatory language for real
requirements.

| Context | Vietnamese style | English style |
|---|---|---|
| Autosave success | Đã lưu | Saved |
| Autosave failure | Không thể lưu thay đổi. Hãy thử lại. | We couldn’t save your changes. Try again. |
| Empty day | Ghi lại một điều bạn đã làm hôm nay. | Add one thing you did today. |
| Delete confirmation | Xóa công việc này? | Delete this task? |
| No history | Chưa có ngày nào được ghi lại. | No journal days yet. |
| Backup success | Đã xuất bản sao lưu. | Backup exported. |
| Replace warning | Dữ liệu hiện tại sẽ bị thay thế. | Your current data will be replaced. |

The table illustrates tone only. Its sentences are not automatically resource decisions unless
required by the source inventory or UI specification.

## 10. Interpolation and pluralization

Interpolation values are named and typed at call sites:

```ts
t('today.categories.completedCount', { completed, total })
t('today.item.actions', { task: userEnteredTask })
```

Never concatenate translated fragments or embed HTML in resources. React owns markup; use
component interpolation only when a sentence genuinely contains styled/interactive content.
Escaping must remain enabled. User text is interpolation, never a translation key.

Use i18next/`Intl.PluralRules` plural categories. Even when Vietnamese strings do not visibly
change, English resources must distinguish one/many:

```text
history.summary_one
history.summary_other
backup.export.workItem_one
backup.export.workItem_other
```

Do not implement `count === 1` branches in components.

## 11. Date and time

Local date storage remains `YYYY-MM-DD`. Parsing must continue to construct a local-noon `Date` (or
equivalent calendar-safe value) to avoid UTC day shifts.

Replace `vietnameseDate` and `shortVietnameseDate` with locale-aware functions:

```ts
formatLongDate(localDate, locale)
formatShortDate(localDate, locale)
formatDateTime(rfc3339Timestamp, locale)
```

Use `Intl.DateTimeFormat` with explicit locale and options. Do not rely on the process/browser
default locale. Preserve the stored timezone semantics:

- journal date is a local calendar date;
- created/updated/export/import timestamps are RFC3339 instants;
- display timestamps in the user’s current local timezone unless a screen explicitly requires UTC.

Capitalization must come from resource/layout policy. Do not uppercase the first code unit of a
formatted date as a general cross-locale algorithm.

## 12. Number and percentage formatting

Use memoized/cached `Intl.NumberFormat` instances:

- integer counts: `{ maximumFractionDigits: 0 }`;
- percentage: `{ style: 'percent', maximumFractionDigits: 0 }`;
- file sizes only when displayed: appropriate unit formatting.

The domain may continue returning integer `percentage` for compatibility, but UI must not append
`%` manually. Convert `67` to `0.67` at the formatter boundary.

## 13. Error-code localization

Rust currently returns:

```rust
AppError { code: &'static str, message: String }
```

This is a useful compatibility base, but many unrelated failures use `validation` or `unknown` and
the frontend renders Vietnamese `message` directly.

Target wire shape:

```ts
type AppErrorPayload = {
  code: string;                    // stable, namespaced
  params?: Record<string, string | number | boolean>;
  message?: string;                // temporary safe fallback
};
```

Examples:

```json
{"code":"work_item.task_too_long","params":{"max":500}}
{"code":"backup.file_too_large","params":{"maxMiB":20}}
{"code":"backup.version_newer","params":{"version":2,"supportedVersion":1}}
```

Migration strategy:

1. Add specific codes and optional params while retaining the safe `message`.
2. Add a frontend exhaustive code-to-key map with `errors.messages.unknown` fallback.
3. Migrate one command family at a time.
4. Stop rendering backend messages after all supported commands have stable codes.
5. Keep internal SQL/path detail in debug logs only.

Rust does not need the active locale in the initial phases. It validates and returns stable codes;
React localizes. Native file-dialog labels are supplied by localized frontend/application code.

## 14. Theme names and descriptions

Current theme preset names/descriptions are constants. Persisted preferences contain
`selectedPresetId` and colors, not displayed names/descriptions. Change the registry contract to:

```ts
interface ThemePreset {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  // palette data...
}
```

This matches the Day Theme specification. IDs and backup theme data remain unchanged. Custom theme
does not require a translated persisted display name unless a future user-naming feature is added.

Motivation prompts follow the same resource-data pattern: store arrays of translation keys per
locale/feature, and make any daily selection deterministic from a locale-independent index. Do not
persist a translated sentence as domain state.

### Theme copy rules

- Theme ID is a stable internal value and is never translated.
- A display name may be localized, but it should remain short, memorable and recognizably the same
  concept in both locales.
- A description should express atmosphere or feeling rather than merely list colors. Keep it to
  one short sentence that reads naturally inside the theme picker.
- Vietnamese and English may differ structurally, but they must preserve the same concept and
  emotional tone.
- Do not promise improved productivity, mood or health; avoid exaggerated or promotional copy.
- Never persist localized names/descriptions. Persist only the preset ID and existing theme data.

| Avoid | Prefer |
|---|---|
| `Brown theme.` | `A warm, quiet space inspired by coffee tones.` |
| `This theme will make you more productive.` | `Warm tones for a calm, focused journal.` |
| `Pink color theme.` | `Soft spring tones with a gentle, airy feel.` |

This documentation task does not change preset IDs, palettes, persisted theme data or backup data.

## 15. Category seed policy

Category names are editable records, included in backup and therefore user data after insertion.
Existing Vietnamese rows (“Công việc cơ quan”, “Dự án cá nhân”, “Học tập”) must never be silently
translated or rewritten when locale changes.

No database migration to a stable seed identity is justified today because:

- the schema has no seed identity;
- users can edit/archive/reorder categories;
- behavior does not depend on the displayed name;
- translating an edited category would destroy user intent.

For fresh installs after i18n, create localized initial category names once using the resolved
locale, then treat them as user data. If reliable fresh-install locale is not available in Rust,
I18N-1 may keep Vietnamese seeds temporarily rather than pass locale through every backend command.
An optional “create recommended categories” feature can be designed later.

The virtual null-category group “Việc khác” is UI text and is translated at render time.

## 16. Backup and restore

Backup v1 domain values and field names remain locale-independent. Existing backups stay valid.
User-entered category and journal text is preserved verbatim.

Locale preference is not added to backup v1 during I18N-1 because the v1 schemas deny unknown
fields and changing the allow-list would require a deliberate compatibility/version decision.
Restore should not unexpectedly switch the UI language while the user is reviewing warnings.

Provisional policy:

- theme behavior remains as currently documented;
- locale stays installation-local in I18N-1;
- a future backup v2 may include optional `preferences.locale`;
- importing an old backup never changes locale;
- if locale is added later, Merge requires an explicit “apply language preference” choice and
  Replace must show the language change before confirmation.

Backend preview warnings must become stable `{code, params}` entries before full English backup UI
support.

## 17. Accessibility

Translate every `aria-label`, `title`, dialog name, screen-reader-only column name and dynamic
accessible description. Visible label and accessible name should use the same semantic key when
their meaning is identical.

Dynamic accessible messages interpolate user/category names but never translate those values.
Changing locale must preserve focus, open-dialog state and keyboard behavior. Do not use a
translated string as a selector, React key, persisted ID or business condition.

## 18. Testing strategy

### Unit

- all eight namespaces exist for both `vi` and `en`;
- normalize supported and unsupported locale tags;
- fallback and missing-key behavior;
- `vi` and `en` date/time/number/percentage formatters;
- plural one/other behavior;
- stable status-to-key mapping;
- error-code-to-key/params mapping;
- theme `nameKey`/`descriptionKey` completeness.

Resource completeness tests/tooling must detect:

- keys present in only one of `vi` or `en`;
- empty or whitespace-only translations;
- duplicate keys within a namespace;
- interpolation-variable sets that differ across locales;
- missing plural variants required by i18next;
- missing call-site keys when typed resources can prove them;
- forbidden HTML in translations;
- raw translation keys rendered in a production core flow;
- developer-only identifiers/internal field names accidentally exposed in UI copy;
- missing theme `nameKey`/`descriptionKey` targets;
- stable backend codes without a localized mapping or safe fallback;
- resources that cannot parse or initialize;
- stable internal identifiers appearing in copy without documented reason.

Interpolation variables may change order but not identity. For example, resources that use
`{{completed}}` and `{{total}}` in Vietnamese must use the same set in English; replacing them with
`{{count}}` is invalid. When a key uses `count`, every locale must provide the variants required by
i18next. English must include at least `_one` and `_other` where applicable. Vietnamese variants
may contain identical text, but the resource structure must remain valid.

### Integration/component

- provider initializes from persisted locale;
- existing-install missing preference resolves to Vietnamese;
- locale switch persists and updates visible/accessibility text without touching journal data;
- Today, History, Settings and Backup render once in `vi` and once in `en`;
- native dialog adapter receives localized title/filter labels;
- unknown backend code displays a safe localized fallback.

Prefer semantic roles/test IDs for behavior. It is acceptable to assert localized text in focused
resource/rendering tests, but behavior tests should not be globally coupled to Vietnamese copy.
Avoid large snapshots.

### Rust

- assert stable error codes and structured params;
- keep database/backup enum tests locale-independent;
- verify errors omit SQL and absolute paths;
- do not run the same repository tests per locale because Rust is locale-neutral.

### Native review

Review `vi` and `en` at supported viewport sizes, including long English text, Windows native file
dialogs, light/dark/custom themes, focus order and screen-reader labels.

## 19. Missing keys and diagnostics

Production:

- fall back through the configured chain;
- never show raw key text for primary journal workflows;
- emit at most one deduplicated diagnostic per missing key;
- use a safe localized generic message if both locale resources are missing.

Development/test:

- log namespace/key and active locale;
- fail a resource-completeness test when `en` and `vi` key sets differ;
- reject empty/whitespace translations, interpolation mismatches, invalid plural variants and
  forbidden HTML;
- optionally display a conspicuous marker only in development.

Unused-key detection should start as a report. It becomes blocking only after typed dynamic keys,
registries and allow-lists keep false positives under control. Dynamic keys must pass through a
typed registry or explicit allow-list; `t(variableFromUserInput)` is forbidden.

Do not send translation diagnostics over the network; Done Today is local-first.

## 20. Localization visual review checklist

Native Windows review is required for both `vi` and `en`.

### Surfaces and states

- [ ] App Shell and navigation
- [ ] Today heading, date controls and statistics
- [ ] Work table, table headers, editor and status selector
- [ ] Autosave saving/saved/error states
- [ ] Empty Today state
- [ ] History list and empty/loading/error states
- [ ] Settings and Language Settings
- [ ] Category Settings
- [ ] Theme Settings and Floating Theme Customizer
- [ ] Backup export and native save dialog
- [ ] Backup import preview and native open dialog
- [ ] Merge and Replace confirmations
- [ ] Backup warnings, validation errors and generic errors
- [ ] Loading and empty states
- [ ] Tooltips and accessibility labels
- [ ] Light mode, dark mode and a custom theme/preset

### Checks for every applicable screen

- [ ] No text clipping or horizontal clipping in dialogs/primary buttons
- [ ] Button widths remain usable
- [ ] Dialog content fits and scrolls safely
- [ ] Table columns tolerate English text pressure
- [ ] Line wrapping and heading hierarchy remain clear
- [ ] Placeholders fit without replacing labels
- [ ] Tooltips are positioned and readable
- [ ] Accessible names are direct and accurate
- [ ] Keyboard focus, focus order and Tab navigation remain correct
- [ ] Screen-reader-only text is verified where tooling permits
- [ ] Small, medium and large windows are reviewed
- [ ] Light, dark and custom themes are reviewed
- [ ] Error, empty, loading, disabled and destructive states are reviewed

Passing tests/builds does not replace native visual review. Screenshots do not prove keyboard or
screen-reader behavior. English copy requires special attention because it is often longer.
Prefer flexible shared layout over locale-specific layout. Do not reduce font size merely to fit a
translation, shorten copy until business meaning is lost or accept clipping. A common responsive
table adjustment is allowed, but the table must not be redesigned only for English. Native file
dialog titles and filters require separate review because they are outside the React DOM.

## 21. Adding a locale

1. Add locale to `AppLocale` and normalization rules.
2. Copy the full reference key set.
3. Translate all namespaces, accessibility text and error mappings.
4. Add plural/date/number formatter tests.
5. Review long text at all supported window sizes.
6. Review status, categories, theme names and native dialogs.
7. Verify backup/domain values remain unchanged.
8. Add locale to the selector only after completeness and native review pass.

## 22. Rules for Codex/AI

When implementing i18n, Codex must:

1. read this document and the string inventory;
2. inspect current source/migrations/tests rather than trust stale prose;
3. never translate or rewrite user data;
4. never replace stable domain values with display labels;
5. add keys to both `vi` and `en`;
6. use semantic keys and namespace ownership;
7. use formatter utilities instead of locale-specific string assembly;
8. preserve ARIA, focus and keyboard behavior;
9. migrate backend errors by command family, retaining safe compatibility fallback;
10. run typecheck, lint, Vitest, Rust fmt/clippy/tests and frontend build;
11. report native visual review gaps honestly;
12. avoid database/backup migrations unless the sprint explicitly authorizes them;
13. never commit or push unless requested.

## 23. Acceptance criteria

The i18n foundation is accepted only when:

- `vi` and `en` resources have identical typed key sets;
- every locale provides all eight resource namespaces;
- no resource value is empty or whitespace-only;
- interpolation variable sets match between locales;
- plural variants are valid for each locale;
- all theme `nameKey`, `descriptionKey` and color-label keys resolve;
- resource-completeness lint runs in CI;
- core UI never renders a raw translation key;
- unknown backend codes render a localized, safe fallback;
- resource values contain no forbidden HTML;
- existing users remain Vietnamese after upgrade;
- locale choice persists in SQLite;
- formatters use the selected locale;
- stable domain/database/backup values are unchanged;
- user data is unchanged across locale switches;
- unknown/missing keys and backend codes fail safely;
- Today core flow works in both locales;
- accessibility labels are localized;
- baseline tests remain green and new i18n tests pass;
- native Windows review covers long English strings and file dialogs.

I18N-1 rollout acceptance additionally requires that an existing installation is never switched
automatically from `vi`. If `localization.locale` is missing and reliable fresh-install metadata
does not exist, the compatibility policy resolves `vi` without inspecting journal content,
category names, row counts, theme preferences or any other user data, then persists the resolved
locale.

If reliable fresh-install detection is deferred to I18N-5, that sprint is accepted only when a
fresh install can be identified by explicit installation metadata, the Windows locale is detected
and normalized to a supported regional locale, an unsupported locale resolves to `en`, and an
existing persisted locale is always retained.

## 24. Non-goals

- translating existing journal/category content;
- machine translation;
- locale-dependent database schema or enum values;
- server-side translation service;
- changing backup v1 in I18N-1;
- adding timezone selection;
- changing UI layout/design as part of translation;
- localizing product name, IDs, file extensions or checksum format;
- implementing Day Theme persistence in i18n sprints.

## 25. Migration plan

### I18N-1 — Foundation (M)

Scope: dependencies, typed locale model, provider, all eight bundled resource namespaces, SQLite
persistence, locale initialization policy, formatters, missing-key diagnostics and language setting.

Main files: new `src/i18n/**`, provider, locale repository/application service, `app_settings`
command path and focused tests.

Risks: distinguishing existing/fresh installs, initial-language flash, adding a general setting
command without exposing arbitrary keys.

Acceptance: existing installations are not switched automatically from `vi`; an explicit `vi` or
`en` persists; a missing preference follows the compatibility policy without user-content
heuristics and the resolved locale is persisted; formatter/resource tests pass; no journal or
backup changes.

### I18N-2 — App shell and Today (M)

Scope: navigation, date controls, Today header/stats/table, status labels, placeholders, row actions,
save states and motivation messages.

Main files: `src/app/App.tsx`, Today/domain display adapters and `common/today` resources.

Risks: English width, plural summaries, accessibility interpolation, tests coupled to Vietnamese.

Acceptance: complete Today workflow in vi/en; stable status values; no autosave/reorder regression.

### I18N-3 — History, Settings, Categories and Theme customization (L)

Scope: History summaries, general settings, category management, appearance UI, theme metadata
`nameKey`/`descriptionKey` and floating customizer.

Main files: Settings features, theme preset contract/resources, History components.

Risks: 33 theme field labels, existing category seed semantics, long English settings copy.

Acceptance: both locales cover every screen; existing category names untouched; theme persistence
and preset IDs unchanged.

### I18N-4 — Backup, backend error codes and hardening (L)

Scope: backup UI/native dialogs, structured Rust error codes/params, preview warning codes,
accessibility audit, resource completeness and native Windows regression.

Main files: backup React/application/infrastructure files, `src-tauri/src/lib.rs`,
`src-tauri/src/backup.rs`, error adapters and tests.

Risks: cross-language Rust/TS contract, keeping fallback compatibility, destructive-flow clarity.

Acceptance: backup/restore works in vi/en; frontend never depends on Vietnamese backend messages;
errors expose no SQL/path; backup v1 remains compatible.

### Optional I18N-5 — Fresh-install detection and backup preference policy (S/M)

Only if I18N-1 cannot safely distinguish fresh from existing installs or product research chooses to
include locale in backup. This sprint must explicitly decide installation marker semantics and
backup-version compatibility before changing either contract.

Acceptance for fresh-install detection: an explicit, reliable installation marker distinguishes a
fresh install; Windows locale detection normalizes regional variants to a supported locale;
unsupported locales resolve to `en`; and any existing persisted locale remains authoritative.

## 26. Open questions and provisional decisions

| Question | Evidence | Provisional decision |
|---|---|---|
| What is the rollout fallback versus the final fresh-install fallback? | No persisted install-generation marker exists today, so a missing preference is ambiguous. | Current rollout fallback: `vi` for compatibility. Final fresh-install fallback: `en` after reliable installation metadata and OS-locale detection exist. |
| Does Rust need locale? | Rust performs validation/storage and frontend owns display. | No for initial phases; return codes/params. |
| Should existing seed categories be migrated? | Names are editable, backed up and behavior uses IDs/positions. | No migration; they are user data. |
| Should locale be in backup v1? | v1 is strict and allow-lists theme only. | No; consider explicit optional preference in backup v2. |
| Are theme names persisted? | Only preset ID/colors are persisted. | Replace constant display strings with translation keys safely. |
| Are documented streak and multiple motivation prompts implemented? | Current UI exposes one prompt and no streak field in statistics. | Do not invent keys/logic until implementation exists; docs are aspirational here. |
