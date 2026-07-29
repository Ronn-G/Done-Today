# I18N string inventory

Audit date: 2026-07-29
Scope: completed I18N-4 and I18N-5, plus completed Day Theme Checkpoint 1, Checkpoint 2 and
Checkpoint 3.
Checkpoint update: checkpoint 1 (`c0f56fd`) localized Backup/Restore; checkpoint 2 (`0155154`)
localized all current Tauri error families, converted Backup preview warnings to structured
payloads and added exhaustive `vi`/`en` mapping. The final checkpoint completed hardening and native
Windows visual/keyboard/accessibility acceptance. Screen-reader tooling was not claimed.
I18N-5 adds no translation key or user-facing string: it adds native locale bootstrap metadata and
locks the existing Backup v1 preference exclusion. Native I18N-5 acceptance was confirmed on
2026-07-28; no inventory count or resource key changed.
Day Theme Checkpoint 1 adds `theme.dayTheme.doneTodayDefault.name`,
`theme.dayTheme.doneTodayDefault.description` and
`theme.backendErrors.dayThemeMetadataInvalid` in both locales. It does not reopen I18N-1–I18N-5
policy, change active locale or add locale to Backup v1.
Day Theme Checkpoint 2 adds only localized name/description pairs for Sakura, Coffee and Rainy in
both locales. The Day Cover reuses existing Today date, subtitle, navigation and App Theme action
copy; decorative motifs expose no accessible text.
Day Theme Checkpoint 3 adds the picker and explicit App Theme/Day Theme labels in the `theme`
namespace. Stable theme IDs, database metadata and Backup v1 remain locale-independent.

## Method and exclusions

The audit inspected TS/TSX text nodes, attributes, interpolated messages, validation schemas,
Tauri dialog configuration, Rust `AppError` construction, backup warnings, migrations and tests.
Source and migrations take precedence over prose documentation.

The table groups strings when they share one semantic key family and one migration rule. Exact
variants are listed in the “Current strings” column so every group remains traceable to source.

Excluded from translation:

- user-entered journal fields and category names;
- stable identifiers, enum values, setting keys, CSS variables and backup field names;
- SQL, test descriptions, developer-only logs and comments;
- product name `Done Today`, file extensions and checksum/format identifiers;
- documentation prose (tracked as documentation rather than runtime UI).

Priority means: P0 blocks a usable English locale; P1 is required before calling the feature
fully localized; P2 is developer/test/documentation hardening.

Frontend translation keys follow `<namespace>.<area>.<semanticName>` with lower-camel-case
segments. `common` is reserved for genuinely shared actions, states and errors. Backend stable
codes are a separate, locale-independent snake_case wire contract; the frontend maps them
exhaustively to translation keys and never passes a raw backend code to `t(...)`.

## Frontend: application shell, Today and History

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/app/App.tsx` | Generic Tauri error, Theme save error; reset-theme confirmation | ui / validation | Completed for backend errors | `errors.messages.unknown`, `theme.backendErrors.*`, `theme.actions.resetConfirmation` | P0 | Structured payload is retained in state and localized during render. No backend message is rendered. Native visual review remains. |
| `src/app/App.tsx:83-85` | “Hôm nay”; “Lịch sử”; “Cài đặt” | ui | Yes | `nav.today`, `nav.history`, `nav.settings` | P0 | Navigation labels and accessible names come from the same nodes. |
| `src/app/App.tsx:132` | Delete-row confirmation | ui | Yes | `today.item.confirmDelete.title`, `today.item.confirmDelete.body` | P0 | Must preserve warning strength. Copy review required; native visual review required for the dialog. |
| `src/app/App.tsx:146-148` | “Hôm nay”; “Nhật ký theo ngày”; page heading, motivation subtitle, old-day subtitle | ui | Yes | `today.eyebrow.today`, `today.eyebrow.archive`, `today.heading.prompt`, `today.subtitle.today`, `today.subtitle.past` | P0 | Motivation content should be resource data, not component literals. |
| `src/app/App.tsx:150-154` | Previous/next date, choose date, today, customize appearance | accessibility / ui | Yes | `today.dateControls.previous`, `today.dateControls.next`, `today.dateControls.choose`, `today.dateControls.today`, `theme.customizer.open` | P0 | Used in visible text, `title` and `aria-label`. Copy review required for accessibility text. |
| `src/app/App.tsx` Today overview | Daily statistics, total, completed, completion rate, journal streak, retry | ui / accessibility | Yes | `today.stats.label`, `today.stats.total`, `today.stats.completed`, `today.stats.completionRate`, `today.stats.streak`, `today.stats.streakValue`, `common.actions.retry` | P0 | Percentage uses `Intl.NumberFormat`; journal streak uses locale plural rules (`day`/`days`, `ngày`). Copy review remains required for accessibility text and the retry label. |
| `src/app/App.tsx:159-166` | Loading data; six table headers; empty-state title/body; add-row label/select option; “Việc khác”; autosave shortcut | ui / accessibility | Yes | `today.status.loading`, `today.table.columns.*`, `today.emptyState.title`, `today.emptyState.body`, `today.addItem.label`, `today.addItem.chooseCategory`, `today.categories.other`, `today.autosave.hint` | P0 | Empty state is UI, not user data. `today.categories.other` is a virtual group. Copy review required for table headers and button labels; native visual review required. |
| `src/app/App.tsx:161` | Hidden marker; “x/y hoàn thành”; add/collapse/expand group labels | ui / accessibility | Yes | `today.categories.hidden`, `today.categories.completedCount`, `today.categories.addItem`, `today.categories.expand`, `today.categories.collapse` | P0 | Interpolate category name and use plural rules for count. Copy review required for accessibility text. |
| `src/app/App.tsx:201-205` | Move up/down; editor labels and placeholders; status label | accessibility / ui | Yes | `common.actions.moveUp`, `common.actions.moveDown`, `today.fields.task.label`, `today.fields.result.label`, `today.fields.nextAction.label`, `today.fields.task.placeholder`, `today.fields.result.placeholder`, `today.fields.nextAction.placeholder`, `today.fields.status.label` | P0 | User-entered editor values must never be translated. Copy review required for labels, placeholders and accessibility text. |
| `src/app/App.tsx:217-218` | Untitled fallback; work-item action label; move-to-category heading; Other; delete task | accessibility / ui | Yes | `today.item.untitled`, `today.item.actions`, `today.categories.moveTo`, `today.categories.other`, `today.item.delete` | P0 | Interpolated user text must be escaped normally by React. Copy review required for action and accessibility text. |
| `src/app/App.tsx:222-224` | Saving, saved, save failed, retry | ui | Yes | `today.autosave.saving`, `today.autosave.saved`, `today.autosave.failed`, `common.actions.retry` | P0 | Do not translate internal `SaveState` values. |
| `src/app/App.tsx:243-252` | History eyebrow/title/subtitle/loading/error/empty state; “x việc · y hoàn thành · z%”; load more | ui | Yes | `history.heading.eyebrow`, `history.heading.title`, `history.heading.subtitle`, `history.status.loading`, `history.errors.load`, `history.emptyState.*`, `history.summary.daily`, `history.actions.loadMore`, `history.status.loadingMore` | P0 | Summary requires plural and percentage formatters. Copy review required for the button label; native visual review required. |
| `src/app/App.tsx:256` | Settings eyebrow/title | ui | Yes | `settings.heading.eyebrow`, `settings.heading.title` | P0 | — |

## Frontend: categories, themes and floating customizer

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/features/settings/CategorySettings.tsx` | Category load/create/update/reorder failures | validation / ui | Completed | `settings.categories.backendErrors.*`, `errors.messages.unknown` | P0 | Backend failures retain normalized structured payloads; local form validation remains localized separately. |
| `src/features/settings/CategorySettings.tsx:16-19` | Heading/body; new-name/color/HEX labels; create; loading; per-category move/show/hide labels; visible/hidden; retry | ui / accessibility | Yes | `settings.categories.*`, `settings.categories.create.*`, `settings.categories.status.loading`, `settings.categories.item.*`, `common.actions.retry` | P0 | `${category.name}` is user data and is interpolation only. Copy review required for button labels and accessibility text; native visual review required. |
| `src/domain/journal/categories.ts:4-5` | Category color/name schema validation | validation | Yes | `settings.categories.validation.colorHex`, `settings.categories.validation.nameRequired`, `settings.categories.validation.nameMax` | P1 | Zod schema currently owns Vietnamese messages; future schema should emit codes/metadata. |
| `src/domain/journal/categories.ts:20-27` | Virtual name “Việc khác” | ui | Yes | `today.categories.other` | P0 | Must not be persisted as a category translation. |
| `src/features/settings/ThemeSettings.tsx` | Five section titles and 33 color-field labels | ui | Completed | `theme.groups.*`, `theme.colors.<themeColorKey>` | P1 | I18N-3 checkpoint 4 uses an exhaustive typed `ThemeColorKey` registry; only translated labels are rendered. Native visual review remains required. |
| `src/features/settings/ThemeSettings.tsx` | HEX validation and color/HEX accessibility suffixes | validation / accessibility | Completed | `theme.validation.colorHex`, `theme.colorPicker.choose`, `theme.colorPicker.hexCode` | P1 | The translated field label is interpolated into natural vi/en accessible names. |
| `src/features/settings/ThemeSettings.tsx` | Display mode, presets, customize colors, light/dark palette tabs, contrast warning, radius labels, reset and save states | ui / validation | Completed | `theme.mode.*`, `theme.preset.*`, `theme.customize.*`, `theme.warnings.contrast`, `theme.radius.*`, `theme.actions.reset`, `theme.status.*` | P0 | Contrast warnings translate both members of each locale-neutral domain pair and no longer expose internal field keys. |
| `src/features/settings/ThemeSettings.tsx` | Settings tip and version | ui | Completed | `theme.settings.tip`, `settings.about.version` | P1 | Version number remains stable; only its label is translated. |
| `src/features/settings/FloatingThemeCustomizer.tsx` | Customizer label/header; reset position; expand/collapse; close | accessibility / ui | Completed | `theme.floating.*`, `common.actions.expand`, `common.actions.collapse`, `common.actions.close` | P0 | Visible copy, tooltips and accessible names are localized; persisted panel coordinates/open/collapsed state remain locale-independent. |
| `src/domain/theme/presets.ts:18-24` | Six preset names and descriptions | ui | Yes | `theme.preset.<presetId>.name`, `theme.preset.<presetId>.description` | P1 | Names/descriptions are constants today; persisted theme contains ID/colors, not these strings. Move to `nameKey`/`descriptionKey` as required by design spec. Copy review required; native visual review required. |
| `src/domain/day-theme/definitions.ts`, `src/domain/day-theme/firstThemes.ts` | Four built-in Day Theme names and descriptions | ui | Completed | `theme.dayTheme.doneTodayDefault.*`, `theme.dayTheme.sakura.*`, `theme.dayTheme.coffee.*`, `theme.dayTheme.rainy.*` | P1 | Stable ID/version remain locale-independent; registry stores typed keys only. Native Windows visual review passed through Checkpoint 3. |

## Frontend: backup and restore

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/features/backup/BackupSettings.tsx` | Known and generic backend failures | ui | Completed | `backup.backendErrors.*`, `errors.messages.unknown` | P0 | Known stable codes ignore compatibility messages. Unknown/malformed failures use localized safe fallback and never render raw code/message/SQL/path. |
| `src/features/backup/BackupSettings.tsx` | Export and restore success summaries | ui | Completed | `backup.export.success`, `backup.import.success`, `backup.import.summary.remapped` | P0 | Counts use i18next plural forms and integer formatting; list order is locale-aware and the stable file name is interpolation. |
| `src/features/backup/BackupSettings.tsx` | Heading/body/privacy warning; export/import actions; preparing/restoring; close | ui / accessibility | Completed | `backup.settings.*`, `backup.export.*`, `backup.import.*`, `backup.status.*`, `common.actions.close` | P0 | Visible labels, status live regions, region/dialog names and decorative icon semantics are localized. Native visual review passed for `vi`/`en`. |
| `src/features/backup/BackupSettings.tsx` | Preview metadata/checksum/summaries; warnings; Merge/Replace; confirmations; apply theme; cancel/import | ui / validation / accessibility | Completed | `backup.preview.*`, `backup.backendWarnings.*`, `backup.mode.*`, `backup.confirm.*`, `backup.options.*`, `common.actions.cancel` | P0 | Warnings are `{code, params}` and localized at render. Focus entry/trap/return and Escape behavior are regression-tested; stable `merge`/`replace` values and confirmation behavior are unchanged. |
| `src/features/backup/BackupSettings.tsx` | Export/import and prior-import timestamps | ui | Completed via formatter | `formatDateTime` policy | P0 | Uses the active locale with explicit `Intl` formatters; stored RFC3339 values are unchanged. |
| `src/application/backup/backupRepository.ts`, `src/infrastructure/backup/tauriBackupRepository.ts` | Native Save/Open title and filter label | ui | Completed | `backup.dialog.exportTitle`, `backup.dialog.importTitle`, `backup.dialog.filterName` | P0 | A typed presentation object crosses the application/infrastructure boundary. Infrastructure imports neither React hooks nor a translator singleton; native Windows review passed and Cancel remains a non-error. |
| `src/infrastructure/backup/tauriBackupRepository.ts` | `done-today-backup-<UTC stamp>.json` | file name | No | N/A | Stable ASCII filename, UTC compact stamp, `.json` extension and cancel behavior remain unchanged. |

## Frontend: date, status, validation and domain-facing text

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/shared/date.ts:12-22` | “Ngày không hợp lệ”; `Intl.DateTimeFormat('vi-VN', …)` | validation / ui | Yes | `common.validation.invalidDate`; locale-aware formatter | P0 | Rename `vietnameseDate`/`shortVietnameseDate` during migration; local-date parsing remains locale-independent. |
| `src/domain/journal/statistics.ts:2-4` | Four status labels | ui | Yes | `today.status.completed`, `today.status.inProgress`, `today.status.postponed`, `today.status.cancelled` | P0 | Domain values remain `completed`, `in_progress`, `postponed`, `cancelled`. |
| `src/application/journal/journalService.ts:21-22` | Invalid page/page-size errors | validation / internal-user-facing | Yes if surfaced | `history.validation.page`, `history.validation.pageSize` | P1 | Currently can reach generic frontend error handling. Prefer coded application errors. |
| `src/domain/backup/models.ts` | Backup schema parse messages: invalid/newer format, duplicate IDs/dates, missing references | validation | Yes | `backup.errors.*` | P1 | Some tests assert Vietnamese fragments. Avoid duplicating frontend and Rust message catalogs long term. |
| `src/domain/theme/colors.ts` | Invalid HEX validation text | validation | Completed | `theme.validation.colorHex` | P1 | Domain contrast logic now emits only a locale-neutral internal error; Custom colors renders localized validation copy. |

## Rust/Tauri user-facing messages

Checkpoint 2 completed the entries below. Errors serialize as
`AppError { code, params, message? }`; preview warnings serialize as `{code, params}`. The frontend
never renders compatibility `message` or warning text from Rust.

| Location | Current strings | Type | Translate | Proposed stable code(s) | Mapped frontend translation key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|---|
| `src-tauri/src/lib.rs` | Not found; database unavailable | backend-user-facing | Completed | `data.not_found`, `database.unavailable` | `errors.messages.dataNotFound`, `errors.messages.databaseUnavailable` | P0 | Old generic codes are removed. SQLite detail remains debug-only. |
| `src-tauri/src/lib.rs` | Invalid/oversized/corrupt theme preferences; invalid/incomplete palette; invalid HEX; unsupported theme schema | backend-user-facing | Completed | `theme.invalid`, `theme.too_large`, `theme.schema_unsupported`, `theme.palette_invalid`, `theme.palette_incomplete`, `theme.color_invalid`, `theme.stored_corrupt` | `theme.backendErrors.*` | P1 | Specific codes are active; limits/schema versions use numeric params. |
| `src-tauri/src/lib.rs` | Invalid date; task/result/next-action length; invalid status | backend-user-facing | Completed | `date.invalid`, `work_item.task_too_long`, `work_item.result_too_long`, `work_item.next_action_too_long`, `work_item.status_invalid` | `errors.messages.dateInvalid`, `today.backendErrors.*` | P0 | Length limits are numeric params. |
| `src-tauri/src/lib.rs` | Invalid/incomplete Day Theme metadata pair | backend-user-facing | Completed | `day_theme.metadata_invalid` | `theme.backendErrors.dayThemeMetadataInvalid` | P1 | Safe structured error; no SQL/path. Unknown structurally valid Day Theme IDs remain accepted. |
| `src-tauri/src/lib.rs` | Category name/color invalid; category/item reorder invalid or empty; pagination invalid | backend-user-facing | Completed | `category.name_invalid`, `category.color_invalid`, `category.reorder_invalid`, `work_item.reorder_empty`, `work_item.reorder_invalid`, `history.pagination_invalid` | `settings.categories.backendErrors.*`, `today.backendErrors.*`, `history.backendErrors.paginationInvalid` | P1 | Structured errors expose no SQL or paths. |
| `src-tauri/src/backup.rs` | Create/read/size/JSON/version/shape/date/timestamp/checksum/reference/duplicate validation errors | backend-user-facing | Completed | `backup.create_failed`, `backup.file_read_failed`, `backup.file_too_large`, `backup.json_invalid`, `backup.version_missing`, `backup.version_newer`, `backup.version_unsupported`, `backup.structure_invalid`, `backup.format_invalid`, `backup.timestamp_invalid`, `backup.checksum_mismatch`, `backup.reference_invalid`, `backup.duplicate_id` | `backup.backendErrors.*` | P0 | Active params include `{maxMiB:20}` and numeric version pairs. |
| `src-tauri/src/backup.rs` | Stored theme invalid; destination invalid; write/create failed | backend-user-facing | Completed | `backup.theme_invalid`, `backup.destination_invalid`, `backup.file_write_failed`, `backup.create_failed` | `backup.backendErrors.*` | P0 | No absolute path is returned. |
| `src-tauri/src/backup.rs` | Unsafe merge; missing mapping; app-version warning; previously-imported warning | backend-user-facing | Completed | `backup.merge_unsafe`, `backup.mapping_missing`, `backup.warning.app_version`, `backup.warning.previously_imported` | `backup.backendErrors.*`, `backup.backendWarnings.*` | P0 | Warnings are `{code, params}`; receipt/re-import behavior uses typed fields, not wording. |
| `src-tauri/src/backup.rs` | Reimport confirmation required; invalid theme; receipt write failed | backend-user-facing | Completed | `backup.reimport_confirmation_required`, `backup.theme_invalid`, `backup.receipt_write_failed` | `backup.backendErrors.*` | P0 | Confirmation and receipt semantics are unchanged. |
| `src-tauri/src/lib.rs:367-369` | Development seed journal content | user-data seed | No translation after persistence | N/A | N/A | P2 | Debug-only records become user data. New localized seeds are optional; never translate existing content. |
| `src-tauri/src/lib.rs:384-386` | “Công việc cơ quan”; “Dự án cá nhân”; “Học tập” | user-data seed | Do not translate existing rows | Future `seed.category.*` only at creation | N/A | P1 | Editable and backed up. No bulk migration. See policy in spec 18. |

## Stable internal and serialized values

| Location | Values | Type | Translate | Priority | Notes |
|---|---|---|---|---|---|
| `src/domain/journal/models.ts`, migration 001, Rust `STATUSES` | `completed`, `in_progress`, `postponed`, `cancelled` | internal/domain | No | P0 | Stable across database, backup, sorting and validation. |
| `src/domain/theme/models.ts` | `light`, `dark`, `system`; `square`, `subtle`, `rounded`, `soft` | internal/domain | No | P0 | Translate only labels. |
| `src/domain/theme/presets.ts` | `done-today`, `forest`, `ocean`, `lavender`, `warm-sand`, `monochrome`, `custom` | internal/domain | No | P0 | Stable preset IDs. |
| `src/domain/day-theme/definitions.ts`, migration 005 | `done-today-default`, version `1`, nullable `theme_id`/`theme_version` | internal/domain | No | P0 | Day Theme is distinct from App Theme; fallback never rewrites persisted metadata. |
| `src/domain/backup/*`, `src-tauri/src/backup.rs` | `done-today-backup`, version `1`, `merge`, `replace`, checksum and camelCase field names | serialized/backup | No | P0 | Backup format must remain locale-independent. |
| `src-tauri/src/lib.rs` | `appearance.themePreferences`, `localization.locale`, `installation.bootstrap` | setting keys | No | P0 | Locale and typed/versioned bootstrap marker are device-local metadata; valid persisted locale is authoritative. |
| migrations and repositories | UUIDs, ISO/RFC3339 timestamps, `YYYY-MM-DD`, colors, positions | internal/domain | No | P0 | Format for display only at UI boundary. |
| journal/category fields | task, result, next action, category name | user-data | Never | P0 | Preserve verbatim through locale changes and backup/restore. |

## Tests

| Location | Current dependency | Type | Translate | Proposed action | Priority |
|---|---|---|---|---|---|
| `src/domain/journal/statistics.test.ts:12` | Exact Vietnamese `statusLabels` object | test-only | N/A | Replace with translation-resource tests and stable status-key mapping in I18N-1/2. | P1 |
| `src/domain/journal/categories.test.ts:10` | Expects virtual label “Việc khác” | test-only | N/A | Assert virtual group identity (`id === null`) rather than locale text. | P1 |
| `src/domain/backup/canonical.test.ts:10` | `toThrow(/mới hơn/)` | test-only | N/A | Assert stable error code/issue type. | P1 |
| `src/shared/date.test.ts` | Local date mechanics only | test-only | No | Keep and add vi/en formatter matrix. | P1 |
| Rust tests | Primarily assert stable error codes and data | test-only | No | Continue code assertions; add params and ensure fallback message contains no sensitive details. | P1 |
| Current repository | Focused mapper, provider and rendered component tests | test-only | N/A | Keep focused semantic tests and avoid large localized snapshots. | P2 |

## Completed I18N-4 result

- 42 stable error codes and 2 stable warning codes are shared through the reviewed contract fixture.
- No current Tauri command family relies on a raw backend message for frontend presentation.
- Remaining Vietnamese Rust literals are editable category seed data, not UI/error copy, and are
  intentionally outside translation/migration scope.
- Resource, formatter, Rust/TypeScript contract, destructive-flow and accessibility audits have no
  blocking finding.
- The user confirmed native Windows acceptance on 2026-07-27 for `vi`/`en`, native dialogs,
  structured errors/warnings, locale-preserved state, Merge/Replace/re-import, themes, responsive
  window sizes and keyboard/focus behavior.
- Accessibility evidence is source audit, automated keyboard regression and native keyboard/visual
  review. No screen-reader tooling result is claimed.
- I18N-4 is **Completed**; I18N-5, Day Theme and release packaging remain outside this checkpoint.

## Completed I18N-5 result

- Fresh/legacy classification uses explicit database-existence evidence at the native bootstrap
  boundary, never journal/category/theme/receipt content or timestamps.
- Windows/WebView preferred-locale input is normalized and resolved in a typed native operation;
  persisted `vi`/`en` remains authoritative.
- `installation.bootstrap` and `localization.locale` are written transactionally and idempotently;
  concurrent calls are serialized and transaction failure leaves no partial pair.
- Backup v1 payload/checksum/version remain unchanged. Export excludes locale/marker, preview does
  not apply them, and Merge/Replace preserve them.
- The user confirmed native Windows acceptance on 2026-07-28 for fresh vi/en/unsupported, legacy
  and persisted locale behavior, runtime switch/reopen, Backup Merge/Replace, themes, supported
  window sizes, raw-key/flash/clipping checks and keyboard/focus.
- Accessibility evidence is automated/source audit and native keyboard/focus/Accessibility tree.
  No screen-reader testing is claimed.
- I18N-5 is **Completed**. Day Theme and release packaging remain outside this checkpoint.

## Day Theme Checkpoint 1 localization result

- Both locales contain the built-in Day Theme name/description and safe metadata validation error.
- Resource parity, interpolation validation and static error-code mapping remain exhaustive.
- Stable Day Theme ID/version, database fields and Backup v1 JSON field names are never translated.
- Locale remains device-local and is neither exported nor changed by Merge/Replace.
- I18N-1–I18N-5 remain Completed and are not reopened.
- The user confirmed native Windows acceptance on 2026-07-28 for the default Day Theme on
  Today/older days, local scope, App Theme light/dark/custom, `vi`/`en`, supported window sizes,
  journal editing/autosave/date switching and keyboard/focus behavior.
- Accessibility evidence is source audit, automated tests and native keyboard/focus/visual review.
  No Accessibility tree or screen-reader tooling result is claimed.
- Day Theme Checkpoint 1 — Foundation is **Completed**. Day Theme & Personalization remains
  **In progress**.

## Day Theme Checkpoint 2 localization result

- Both locales contain natural name/description pairs for Sakura, Coffee and Rainy.
- Day Cover introduces no new visible or accessibility copy; it reuses existing Today resources.
- Motif and overlay layers are decorative-only and hidden from the accessibility tree.
- Resource parity/interpolation checks remain exhaustive; stable theme IDs, asset IDs and Backup v1
  fields are never translated.
- I18N-1–I18N-5 and Checkpoint 1 remain Completed and are not reopened.
- The user confirmed native Windows acceptance on 2026-07-28 for all four built-in themes in
  `vi`/`en`, App Theme light/dark/custom, supported window sizes, date switching, editor/autosave
  and keyboard/focus, without raw translation keys.
- Accessibility evidence is automated/source audit and native keyboard/focus/visual review;
  decorative motif/overlay did not obstruct the tested interactions. No Accessibility tree or
  screen-reader testing is claimed.
- Checkpoint 2 is **Completed**. Checkpoint 3 completion is documented below; later phases are
  **Not started**. Overall Day Theme & Personalization remains **In progress — checkpoint
  complete**.

## Day Theme Checkpoint 3 localization result

- Both locales contain `theme.dayTheme.picker.*` for the visible trigger, dialog
  title/description, options label, current/preview semantics, Default, Apply, Saving, success,
  failure and Close. Shared Cancel/Retry reuse `common.actions.*`.
- `theme.customizer.open` is now the unambiguous App Theme accessible name
  `Giao diện ứng dụng` / `App appearance`; the visible Day Theme trigger remains
  `Chủ đề của ngày` / `Day theme`.
- Theme item name/description lookup uses an explicit typed/static allow-list required by the
  production source validator. Stable IDs/version and user-entered journal/category data are not
  translated.
- Changing locale while the picker is open re-renders presentation copy and preserves the current
  draft/preview without invoking persistence.
- Resource parity, interpolation, raw-key and production call-site validation remain blocking.
- Automated/source accessibility evidence covers dialog name/description, radiogroup/radio state,
  selected text/checkmark, focus trap/restore, Escape/outside close and forced-colors CSS.
- The user confirmed native Windows acceptance on 2026-07-29 for `vi`/`en`, long
  Vietnamese/English copy, supported viewport sizes, light/dark/custom App Theme,
  mouse/keyboard/focus and picker behavior without raw translation keys. Automated/source
  accessibility evidence and native keyboard/focus/visual review passed; no screen-reader or
  Accessibility tree result is claimed.
- Checkpoint 3 is **Completed — native Windows acceptance passed**. Checkpoint 4 and later phases
  are **Not started**; overall Day Theme & Personalization remains **In progress — checkpoint
  complete**.
