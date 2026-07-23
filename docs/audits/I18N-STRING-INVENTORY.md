# I18N string inventory

Audit date: 2026-07-23  
Scope: Sprint I18N-0, repository state `eb17d1d`.

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

## Frontend: application shell, Today and History

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/app/App.tsx:47,77-78` | “Đã có lỗi xảy ra. Vui lòng thử lại.”; “Không thể lưu giao diện.”; reset-theme confirmation | ui / validation | Yes | `common.error.generic`, `theme.error.save`, `theme.confirmReset` | P0 | Confirmation and thrown fallback currently share literal text. |
| `src/app/App.tsx:83-85` | “Hôm nay”; “Lịch sử”; “Cài đặt” | ui | Yes | `nav.today`, `nav.history`, `nav.settings` | P0 | Navigation labels and accessible names come from the same nodes. |
| `src/app/App.tsx:132` | Delete-row confirmation | ui | Yes | `today.item.confirmDelete` | P0 | Must preserve warning strength. |
| `src/app/App.tsx:146-148` | “Hôm nay”; “Nhật ký theo ngày”; page heading, motivation subtitle, old-day subtitle | ui | Yes | `today.eyebrow.today`, `today.eyebrow.archive`, `today.heading.prompt`, `today.subtitle.today`, `today.subtitle.past` | P0 | Motivation content should be resource data, not component literals. |
| `src/app/App.tsx:150-154` | Previous/next date, choose date, today, customize appearance | accessibility / ui | Yes | `date.previous`, `date.next`, `date.choose`, `date.today`, `theme.openCustomizer` | P0 | Used in visible text, `title` and `aria-label`. |
| `src/app/App.tsx:156-158` | Daily statistics, total, completed, completion rate, retry | ui / accessibility | Yes | `today.stats.label`, `today.stats.total`, `today.stats.completed`, `today.stats.completionRate`, `common.retry` | P0 | Percentage must move to `Intl.NumberFormat`. |
| `src/app/App.tsx:159-166` | Loading data; six table headers; empty-state title/body; add-row label/select option; “Việc khác”; autosave shortcut | ui / accessibility | Yes | `today.loading`, `today.table.columns.*`, `today.empty.title`, `today.empty.body`, `today.add.label`, `today.add.chooseCategory`, `category.other`, `today.autosaveHint` | P0 | Empty state is UI, not user data. `category.other` is a virtual group. |
| `src/app/App.tsx:161` | Hidden marker; “x/y hoàn thành”; add/collapse/expand group labels | ui / accessibility | Yes | `category.hidden`, `category.completedCount`, `category.addItem`, `category.expand`, `category.collapse` | P0 | Interpolate category name and use plural rules for count. |
| `src/app/App.tsx:201-205` | Move up/down; editor labels and placeholders; status label | accessibility / ui | Yes | `common.moveUp`, `common.moveDown`, `today.fields.task`, `today.fields.result`, `today.fields.nextAction`, `today.fields.*Placeholder`, `status.label` | P0 | User-entered editor values must never be translated. |
| `src/app/App.tsx:217-218` | Untitled fallback; work-item action label; move-to-category heading; Other; delete task | accessibility / ui | Yes | `today.item.untitled`, `today.item.actions`, `category.moveTo`, `category.other`, `today.item.delete` | P0 | Interpolated user text must be escaped normally by React. |
| `src/app/App.tsx:222-224` | Saving, saved, save failed, retry | ui | Yes | `save.saving`, `save.saved`, `save.failed`, `common.retry` | P0 | Do not translate internal `SaveState` values. |
| `src/app/App.tsx:243-252` | History eyebrow/title/subtitle/loading/error/empty state; “x việc · y hoàn thành · z%”; load more | ui | Yes | `history.eyebrow`, `history.title`, `history.subtitle`, `history.loading`, `history.empty.*`, `history.summary`, `history.loadMore`, `history.loadingMore` | P0 | Summary requires plural and percentage formatters. |
| `src/app/App.tsx:256` | Settings eyebrow/title | ui | Yes | `settings.eyebrow`, `settings.title` | P0 | — |

## Frontend: categories, themes and floating customizer

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/features/settings/CategorySettings.tsx:11-15` | Four category load/create/update/reorder errors | validation / ui | Yes | `category.error.load`, `category.error.invalid`, `category.error.update`, `category.error.reorder` | P0 | Frontend currently discards backend detail for these flows. |
| `src/features/settings/CategorySettings.tsx:16-19` | Heading/body; new-name/color/HEX labels; create; loading; per-category move/show/hide labels; visible/hidden; retry | ui / accessibility | Yes | `category.settings.*`, `category.create.*`, `category.loading`, `category.item.*`, `common.retry` | P0 | `${category.name}` is user data and is interpolation only. |
| `src/domain/journal/categories.ts:4-5` | Category color/name schema validation | validation | Yes | `validation.category.colorHex`, `validation.category.nameRequired`, `validation.category.nameMax` | P1 | Zod schema currently owns Vietnamese messages; future schema should emit codes/metadata. |
| `src/domain/journal/categories.ts:20-27` | Virtual name “Việc khác” | ui | Yes | `category.other` | P0 | Must not be persisted as a category translation. |
| `src/features/settings/ThemeSettings.tsx:7-14` | Five section titles and 33 color-field labels | ui | Yes | `theme.groups.*`, `theme.colors.<ThemeColorKey>` | P1 | Keep typed `ThemeColorKey`; translate only label. |
| `src/features/settings/ThemeSettings.tsx:19-21` | HEX validation and color/HEX accessibility suffixes | validation / accessibility | Yes | `validation.color.hex`, `theme.color.choose`, `theme.color.hexCode` | P1 | Interpolate translated field label. |
| `src/features/settings/ThemeSettings.tsx:27-36` | Display mode, presets, customize colors, light/dark palette tabs, contrast warning, radius labels, reset and save states | ui / validation | Yes | `theme.mode.*`, `theme.presets.*`, `theme.customize.*`, `theme.contrastWarning`, `theme.radius.*`, `theme.reset`, `save.*` | P0 | Contrast warning currently exposes internal field keys; map keys to translated labels. |
| `src/features/settings/ThemeSettings.tsx:42` | Settings tip and version | ui | Yes | `theme.settingsTip`, `settings.version` | P1 | Version number is not translated. |
| `src/features/settings/FloatingThemeCustomizer.tsx:14-37` | Customizer label/header; reset position; expand/collapse; close | accessibility / ui | Yes | `theme.floating.label`, `theme.floating.dragHandle`, `theme.floating.resetPosition`, `common.expand`, `common.collapse`, `common.close` | P0 | Persisted panel coordinates/open state are locale-independent. |
| `src/domain/theme/presets.ts:18-24` | Six preset names and descriptions | ui | Yes | `theme.preset.<id>.name`, `theme.preset.<id>.description` | P1 | Names/descriptions are constants today; persisted theme contains ID/colors, not these strings. Move to `nameKey`/`descriptionKey` as required by design spec. |

## Frontend: backup and restore

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/features/backup/BackupSettings.tsx:8` | Generic fallback error | ui | Yes | `common.error.generic` | P0 | Backend `message` is otherwise displayed directly. |
| `src/features/backup/BackupSettings.tsx:15,17` | Export success and restore success summaries | ui | Yes | `backup.export.success`, `backup.import.success`, `backup.import.remapped` | P0 | Multiple counts require pluralization; file name is interpolation. |
| `src/features/backup/BackupSettings.tsx:19-22` | Backup heading/body/privacy warning; export/import buttons; preparing/restoring; close | ui | Yes | `backup.settings.*`, `backup.privacyWarning`, `backup.export.action`, `backup.import.action`, `backup.preparing`, `backup.restoring`, `common.close` | P0 | — |
| `src/features/backup/BackupSettings.tsx:34-45` | Preview heading and labels; checksum state; data/dry-run summaries; import modes; confirmations; apply theme; cancel/import | ui / validation | Yes | `backup.preview.*`, `backup.mode.merge`, `backup.mode.replace`, `backup.confirm.*`, `backup.applyTheme`, `common.cancel`, `backup.import.submit` | P0 | Backend warnings are currently already-localized strings. |
| `src/features/backup/BackupSettings.tsx:35,40` | `toLocaleString('vi-VN')` for export/import timestamps | ui | Yes, via formatter | `format.dateTime` policy | P0 | Locale is hard-coded. |
| `src/infrastructure/backup/tauriBackupRepository.ts:16-21` | Export/import native dialog titles and filter name | ui | Yes | `backup.dialog.exportTitle`, `backup.dialog.importTitle`, `backup.dialog.filterName` | P0 | Dialog adapter must receive translated labels from application/UI; repository should not import translator singleton. |
| `src/infrastructure/backup/tauriBackupRepository.ts:16` | `done-today-backup-<UTC stamp>.json` | file name | Usually no translation | `backup.file.defaultName` only if policy changes | P2 | Stable ASCII file name is portable. Stamp is UTC compact digits, not user-facing date prose. |

## Frontend: date, status, validation and domain-facing text

| Location | Current strings | Type | Translate | Proposed key(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src/shared/date.ts:12-22` | “Ngày không hợp lệ”; `Intl.DateTimeFormat('vi-VN', …)` | validation / ui | Yes | `validation.date.invalid`; locale-aware formatter | P0 | Rename `vietnameseDate`/`shortVietnameseDate` during migration; local-date parsing remains locale-independent. |
| `src/domain/journal/statistics.ts:2-4` | Four status labels | ui | Yes | `status.completed`, `status.inProgress`, `status.postponed`, `status.cancelled` | P0 | Domain values remain `completed`, `in_progress`, `postponed`, `cancelled`. |
| `src/application/journal/journalService.ts:21-22` | Invalid page/page-size errors | validation / internal-user-facing | Yes if surfaced | `validation.pagination.page`, `validation.pagination.pageSize` | P1 | Currently can reach generic frontend error handling. Prefer coded application errors. |
| `src/domain/backup/models.ts` | Backup schema parse messages: invalid/newer format, duplicate IDs/dates, missing references | validation | Yes | `backup.error.*` | P1 | Some tests assert Vietnamese fragments. Avoid duplicating frontend and Rust message catalogs long term. |
| `src/domain/theme/colors.ts` | Invalid HEX validation text | validation | Yes | `validation.color.hex` | P1 | Consolidate with theme/category validation where parameters allow. |

## Rust/Tauri user-facing messages

All entries below are returned through serialized `AppError { code, message }` or through
`ImportPreview.warnings`; the frontend currently renders `message`/warning directly.

| Location | Current strings | Type | Translate | Proposed stable code(s) | Priority | Notes / risk |
|---|---|---|---|---|---|---|
| `src-tauri/src/lib.rs:62-82` | Not found; database unavailable | backend-user-facing | Yes, in frontend | `data.not_found`, `database.unavailable` | P0 | Existing codes are `not_found` and `database`. SQLite detail is only logged in debug, which is good. |
| `src-tauri/src/lib.rs:198-329` | Invalid/oversized/corrupt theme preferences; invalid/incomplete palette; invalid HEX; unsupported theme schema | backend-user-facing | Yes, in frontend | `theme.invalid`, `theme.too_large`, `theme.schema_unsupported`, `theme.palette_invalid`, `theme.palette_incomplete`, `theme.color_invalid`, `theme.stored_corrupt` | P1 | Current code collapses all to `validation`; introduce specific codes incrementally. |
| `src-tauri/src/lib.rs:411-430` | Invalid date; task/result/next-action length; invalid status | backend-user-facing | Yes, in frontend | `date.invalid`, `work_item.task_too_long`, `work_item.result_too_long`, `work_item.next_action_too_long`, `work_item.status_invalid` | P0 | Length limits should be numeric params, not embedded localized digits. |
| `src-tauri/src/lib.rs:560-747` | Category name/color invalid; category/item reorder invalid or empty; pagination invalid | backend-user-facing | Yes, in frontend | `category.name_invalid`, `category.color_invalid`, `category.reorder_invalid`, `work_item.reorder_empty`, `work_item.reorder_invalid`, `history.pagination_invalid` | P1 | Do not expose SQL or paths. |
| `src-tauri/src/backup.rs:150-294` | Create/read/size/JSON/version/shape/date/timestamp/checksum/reference/duplicate validation errors | backend-user-facing | Yes, in frontend | `backup.create_failed`, `backup.file_read_failed`, `backup.file_too_large`, `backup.json_invalid`, `backup.version_missing`, `backup.version_newer`, `backup.version_unsupported`, `backup.structure_invalid`, `backup.format_invalid`, `backup.timestamp_invalid`, `backup.checksum_mismatch`, `backup.reference_invalid`, `backup.duplicate_id` | P0 | Existing specific codes exist only for a subset. Add structured params such as `{maxMiB:20}`. |
| `src-tauri/src/backup.rs:363-450` | Stored theme invalid; destination invalid; write/create failed | backend-user-facing | Yes, in frontend | `backup.theme_invalid`, `backup.destination_invalid`, `backup.file_write_failed`, `backup.create_failed` | P0 | No absolute path is returned; preserve this behavior. |
| `src-tauri/src/backup.rs:506-576` | Unsafe merge; missing mapping; app-version warning; previously-imported warning | backend-user-facing | Yes, in frontend | `backup.merge_unsafe`, `backup.mapping_missing`, `backup.warning.app_version`, `backup.warning.previously_imported` | P0 | Warnings should become `{code, params}` rather than localized strings. |
| `src-tauri/src/backup.rs:685-732` | Reimport confirmation required; invalid theme; receipt write failed | backend-user-facing | Yes, in frontend | `backup.reimport_confirmation_required`, `backup.theme_invalid`, `backup.receipt_write_failed` | P0 | Keep conflict semantics stable while changing presentation. |
| `src-tauri/src/lib.rs:367-369` | Development seed journal content | user-data seed | No translation after persistence | N/A | P2 | Debug-only records become user data. New localized seeds are optional; never translate existing content. |
| `src-tauri/src/lib.rs:384-386` | “Công việc cơ quan”; “Dự án cá nhân”; “Học tập” | user-data seed | Do not translate existing rows | Future `seed.category.*` only at creation | P1 | Editable and backed up. No bulk migration. See policy in spec 18. |

## Stable internal and serialized values

| Location | Values | Type | Translate | Priority | Notes |
|---|---|---|---|---|---|
| `src/domain/journal/models.ts`, migration 001, Rust `STATUSES` | `completed`, `in_progress`, `postponed`, `cancelled` | internal/domain | No | P0 | Stable across database, backup, sorting and validation. |
| `src/domain/theme/models.ts` | `light`, `dark`, `system`; `square`, `subtle`, `rounded`, `soft` | internal/domain | No | P0 | Translate only labels. |
| `src/domain/theme/presets.ts` | `done-today`, `forest`, `ocean`, `lavender`, `warm-sand`, `monochrome`, `custom` | internal/domain | No | P0 | Stable preset IDs. |
| `src/domain/backup/*`, `src-tauri/src/backup.rs` | `done-today-backup`, version `1`, `merge`, `replace`, checksum and camelCase field names | serialized/backup | No | P0 | Backup format must remain locale-independent. |
| `src-tauri/src/lib.rs` | `appearance.themePreferences` | setting key | No | P0 | Proposed locale key: `localization.locale`. |
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
| Current repository | No rendered React UI tests or snapshots | test-only | N/A | Add focused provider/formatter/component tests; avoid large localized snapshots. | P2 |

## Approximate totals

The source contains 117 frontend TS/TSX lines and 72 Rust lines with accented Vietnamese
literals. After grouping interpolation variants and excluding tests/user-data seeds, the runtime
migration surface is approximately:

- 105–125 frontend visible/accessibility/validation messages;
- 45–55 backend user-facing errors and warnings;
- 6 theme preset names plus 6 descriptions;
- 3 persisted category seed labels and 3 debug journal seed values that must be treated as user data;
- 4 stable work-status values with 4 translated display labels;
- 6 test assertions/fixtures directly coupled to Vietnamese text.

Counts are deliberately approximate because one JSX line can contain many messages and a single
message can serve visible text, `title` and `aria-label`.
