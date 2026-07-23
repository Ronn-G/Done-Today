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
`en-US`/`en-GB` to `en`). The fallback chain is:

1. selected locale;
2. base supported locale;
3. Vietnamese (`vi`) during the compatibility rollout;
4. a short built-in English emergency string only for catastrophic i18n initialization failure.

Vietnamese is the compatibility default in the first i18n release. English must not silently
replace Vietnamese for an existing installation.

### Existing users

If no persisted locale exists in a database created by a pre-i18n release, initialize
`localization.locale = "vi"` once. Do not infer from current OS locale during an upgrade.

### Fresh installations

The desired product policy is OS detection, not unconditional English:

- supported Vietnamese OS locale -> `vi`;
- supported English OS locale -> `en`;
- unsupported locale -> `en`.

Implementation must reliably distinguish a pre-existing database from a fresh installation before
using OS detection. If I18N-1 cannot prove that distinction without fragile heuristics, use `vi`
for every missing preference in that release and defer fresh-install detection. Never inspect
journal contents or Vietnamese category names to infer installation age.

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
4. If absent, apply the existing/fresh-install policy above and persist the resolved value.
5. Render the application after a small deterministic bootstrap/fallback state.

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
        │   ├── today.ts
        │   ├── history.ts
        │   ├── settings.ts
        │   ├── theme.ts
        │   └── backup.ts
        └── en/
            └── ...
```

The first implementation may use JSON or typed TypeScript resource objects. TypeScript resources
are preferred initially because the repository already compiles TS, resource keys can be checked
without another generation step, and messages remain bundled/offline.

## 6. Library evaluation and decision

No i18n dependency currently exists. A hand-written dictionary would be small at first, but the
audit already found more than 150 frontend/backend-facing messages, interpolation, plural counts,
fallback requirements and six feature namespaces. Reimplementing plural resolution, missing-key
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

Keys describe semantics, never the source sentence:

```text
today.empty.title
today.item.confirmDelete
status.inProgress
backup.error.fileTooLarge
theme.preset.ocean.description
```

Do not use English prose as a key. Do not include punctuation or current layout in a key.

Namespaces:

- `common`: shared actions, generic states and shared validation;
- `today`: Today screen, table, item actions and statistics;
- `history`: History screen;
- `settings`: general settings and categories;
- `theme`: appearance modes, color controls and theme presets;
- `backup`: export/import, preview and backup errors;
- `errors`: stable backend/application error-code mapping when not feature-local.

Avoid a deeply nested universal catalog. Feature ownership should remain obvious.

## 8. Interpolation and pluralization

Interpolation values are named and typed at call sites:

```ts
t('category.completedCount', { completed, total })
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

## 9. Date and time

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

## 10. Number and percentage formatting

Use memoized/cached `Intl.NumberFormat` instances:

- integer counts: `{ maximumFractionDigits: 0 }`;
- percentage: `{ style: 'percent', maximumFractionDigits: 0 }`;
- file sizes only when displayed: appropriate unit formatting.

The domain may continue returning integer `percentage` for compatibility, but UI must not append
`%` manually. Convert `67` to `0.67` at the formatter boundary.

## 11. Error-code localization

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
2. Add a frontend exhaustive code-to-key map with `errors.unknown` fallback.
3. Migrate one command family at a time.
4. Stop rendering backend messages after all supported commands have stable codes.
5. Keep internal SQL/path detail in debug logs only.

Rust does not need the active locale in the initial phases. It validates and returns stable codes;
React localizes. Native file-dialog labels are supplied by localized frontend/application code.

## 12. Theme names and descriptions

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

## 13. Category seed policy

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

## 14. Backup and restore

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

## 15. Accessibility

Translate every `aria-label`, `title`, dialog name, screen-reader-only column name and dynamic
accessible description. Visible label and accessible name should use the same semantic key when
their meaning is identical.

Dynamic accessible messages interpolate user/category names but never translate those values.
Changing locale must preserve focus, open-dialog state and keyboard behavior. Do not use a
translated string as a selector, React key, persisted ID or business condition.

## 16. Testing strategy

### Unit

- normalize supported and unsupported locale tags;
- fallback and missing-key behavior;
- `vi` and `en` date/time/number/percentage formatters;
- plural one/other behavior;
- stable status-to-key mapping;
- error-code-to-key/params mapping;
- theme `nameKey`/`descriptionKey` completeness.

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

## 17. Missing keys and diagnostics

Production:

- fall back through the configured chain;
- never show raw key text for primary journal workflows;
- emit at most one deduplicated diagnostic per missing key;
- use a safe localized generic message if both locale resources are missing.

Development/test:

- log namespace/key and active locale;
- fail a resource-completeness test when `en` and `vi` key sets differ;
- reject empty translations;
- optionally display a conspicuous marker only in development.

Do not send translation diagnostics over the network; Done Today is local-first.

## 18. Adding a locale

1. Add locale to `AppLocale` and normalization rules.
2. Copy the full reference key set.
3. Translate all namespaces, accessibility text and error mappings.
4. Add plural/date/number formatter tests.
5. Review long text at all supported window sizes.
6. Review status, categories, theme names and native dialogs.
7. Verify backup/domain values remain unchanged.
8. Add locale to the selector only after completeness and native review pass.

## 19. Rules for Codex/AI

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

## 20. Acceptance criteria

The i18n foundation is accepted only when:

- `vi` and `en` resources have identical typed key sets;
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

## 21. Non-goals

- translating existing journal/category content;
- machine translation;
- locale-dependent database schema or enum values;
- server-side translation service;
- changing backup v1 in I18N-1;
- adding timezone selection;
- changing UI layout/design as part of translation;
- localizing product name, IDs, file extensions or checksum format;
- implementing Day Theme persistence in i18n sprints.

## 22. Migration plan

### I18N-1 — Foundation (M)

Scope: dependencies, typed locale model, provider, bundled resources, SQLite persistence, locale
initialization policy, formatters, missing-key diagnostics and language setting.

Main files: new `src/i18n/**`, provider, locale repository/application service, `app_settings`
command path and focused tests.

Risks: distinguishing existing/fresh installs, initial-language flash, adding a general setting
command without exposing arbitrary keys.

Acceptance: existing users remain `vi`; explicit `vi`/`en` persists; formatter/resource tests pass;
no journal or backup changes.

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

## 23. Open questions and provisional decisions

| Question | Evidence | Provisional decision |
|---|---|---|
| Can fresh vs existing installs be distinguished today? | No persisted install-generation marker exists. | Preserve `vi` on missing key unless I18N-1 adds a reliable bootstrap marker. |
| Does Rust need locale? | Rust performs validation/storage and frontend owns display. | No for initial phases; return codes/params. |
| Should existing seed categories be migrated? | Names are editable, backed up and behavior uses IDs/positions. | No migration; they are user data. |
| Should locale be in backup v1? | v1 is strict and allow-lists theme only. | No; consider explicit optional preference in backup v2. |
| Are theme names persisted? | Only preset ID/colors are persisted. | Replace constant display strings with translation keys safely. |
| Are documented streak and multiple motivation prompts implemented? | Current UI exposes one prompt and no streak field in statistics. | Do not invent keys/logic until implementation exists; docs are aspirational here. |
