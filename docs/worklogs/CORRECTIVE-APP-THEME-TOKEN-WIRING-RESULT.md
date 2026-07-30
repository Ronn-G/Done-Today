# Corrective App Theme Token Wiring — Result

**Date:** 2026-07-30
**Authoritative task:** Corrective Checkpoint — App Theme Token Wiring
**Implementation status:** Complete; native Windows acceptance pending

## A. Workspace/preflight

- Main checkout/repository path: `C:\dev\done-today`.
- Git top-level: `C:/dev/done-today`.
- Branch: `master`; not detached and not an isolated worktree.
- Initial HEAD: `bc1a4334d25e3eef3631163a132e7274f9fb451e`
  (`docs: complete light day personalization`).
- Origin: `https://github.com/Ronn-G/Done-Today`.
- Initial tree: clean.
- `git fetch origin` completed; initial `master` matched `origin/master` with no ahead/behind or
  divergence.
- CP5 closeout `bc1a4334d25e3eef3631163a132e7274f9fb451e` was an ancestor of HEAD.
- Toolchain: Node `v24.17.0`, npm `11.13.0`, rustc `1.97.1`, cargo `1.97.1`.
- Recursive search found no `AGENTS.md` in the repository.
- All edits/commits were made directly in the main `C:\dev\done-today` checkout.

## B. Prompt preservation

- Full task: `docs/prompts/CORRECTIVE-APP-THEME-TOKEN-WIRING.md`.
- Commit:
  `57b9b99c19ee0e680f6987a16a904e6a9e308a8d docs: record app theme token wiring fix`.
- Commit contains only the prompt file.

## C. Baseline

All pre-source-edit gates passed:

| Gate | Baseline result |
| --- | --- |
| `npm.cmd run format:check` | pass |
| `npm.cmd run i18n:lint` | 2 files / 48 tests pass |
| `npm.cmd run typecheck` | pass |
| `npm.cmd run lint` | pass |
| `npm.cmd run test:run` | 50 files / 443 tests pass |
| `npm.cmd run build` | pass; 1,742 modules; 727 ms |
| `cargo fmt --all -- --check` | pass |
| `cargo clippy --all-targets --all-features -- -D warnings` | pass |
| `cargo test --all-targets --all-features` | 72 tests pass |
| `git diff --check` | pass |

Baseline production bundle:

- CSS: `57.99 kB`, gzip `11.24 kB`.
- Main JS: `364.41 kB`, gzip `110.71 kB`.
- No frontend or Rust warning.

## D. 33-token audit

The full inventory is in `docs/audits/APP-THEME-TOKEN-WIRING-AUDIT.md`, committed as:

`e70b6174a405bfa86c69b920d3ccad2f97f85838 docs: audit app theme token wiring`.

Results:

- Zod schema: 33 required keys per palette.
- Settings translated-label registry: all 33.
- Settings control groups: all 33, no duplicate control key.
- Rust `THEME_COLOR_KEYS`: all 33.
- apply whitelist: 33 keys to 33 unique CSS variables, no missing/duplicate mapping.
- preset construction: complete light/dark palettes; immutable preset objects.
- persisted/reload path: full schema-v2 payload under `appearance.themePreferences`.
- no database or migration correction required.

Table header, Accent and six Stats tokens were correct through Settings, domain update, preview
effect, persistence, restore and root apply. The defect was between root variables and Today
consumers.

## E. Root cause

Exact source:

- `src/styles.css`, `.day-theme-scope`.
- `src/domain/day-theme/definitions.ts`, default Day Theme aliases.
- `src/domain/theme/applyTheme.ts`, correct root mapping.
- `src/app/App.tsx`, correct active-palette preview/bootstrap path.

The Day Theme scope locally redefined:

- `--bg-table-header`;
- `--stats-bg`;
- `--stats-border`;
- `--stats-text-primary`;
- `--stats-text-secondary`;
- `--stats-progress-track`;
- `--stats-progress-fill`.

Custom properties inherit from the closest declaration, so these seven local values shadowed the
root App Theme values. `thead th` and the Stats CSS consumers used correct specialized variable
names but received the Day Theme replacements.

For Default Day Theme, Table header resolved through
`--day-surface-raised -> --app-day-surface-raised -> --surface-raised`, and `--surface-raised`
mixes Card with Accent. This explains both observed behaviors:

- changing Table header had no visible effect;
- changing Accent changed Table header indirectly.

Stats similarly resolved to generic Day Theme surface/border/text/accent values, so all six
Settings controls appeared dead.

No separate preview/persist bug, wrong palette, control-key mismatch, preset conversion loss,
schema issue, Rust validation gap, hard-coded consumer color, Tailwind override or database issue
was found.

## F. Fix

Implementation commit:

`b219761dacf4de687c6615780c9a9d86594f43df fix: wire app theme surface tokens`.

Changes:

- removed only the seven invalid specialized-variable declarations from `.day-theme-scope`;
- retained intended Day Theme ownership of page, journal surface/text/border/accent, row/editor
  interaction and focus variables;
- exported the typed 33-token `themeColorVariables` mapping for integrity tests;
- exported the Settings control groups so schema/control parity is testable;
- kept existing Table/Stats component consumers unchanged because they already used the right
  semantic variables.

No inline color, bulk `!important`, selector scripting, preset-ID component condition, duplicate
CSS variable or direct component access to `ThemePreferences` was added.

Unchanged:

- ThemePreferences schema version 2;
- exactly 33 tokens;
- `appearance.themePreferences`;
- migrations/database/Backup;
- preset IDs and values;
- domain/business rules;
- layout and visual design.

## G. Tests

Focused evidence:

- 5 frontend test files / 57 tests pass.
- 20 Rust theme-related tests pass.

Added/strengthened coverage:

- exact 33 Zod keys ↔ 33 unique CSS variable mappings;
- no missing or duplicate mapping;
- Table header mapping differs from Accent;
- six Stats mappings differ from generic Card/Border/Text/Track/Accent mappings;
- all 33 Settings keys are present exactly once;
- event-level Settings tests for Accent, Table header and each of six Stats controls update only
  the selected light-palette key;
- diagnostic colors round-trip independently in both light/dark palettes;
- Rust asserts exactly 33 unique keys in each v2 palette and SQLite round-trip of all eight
  diagnostic colors;
- `thead th` consumes `--bg-table-header`;
- Stats background, border/dividers, values, labels, track and fill consume their six specialized
  variables;
- `.day-theme-scope` is forbidden from redefining the seven specialized App Theme variables.

Final full regression:

- frontend: 51 files / 455 tests, up from 50/443;
- Rust: 74 tests, up from 72;
- no test count reduction.

Existing App Theme presets/custom colors, Day Theme Default/Sakura/Coffee/Rainy, Personalization,
Today/editor/autosave, History/Calendar, Categories, status/statistics/reorder/streak, Backup, i18n
and strict-mode suites remain green.

## H. Theme boundaries

- Light/dark/custom use the active App Theme palette and preview immediately.
- Save/reload persists the same full v2 payload.
- selecting/resetting a preset returns fresh palette copies; preset constants are not mutated.
- App Theme Table header and six Stats tokens now inherit into Today independently.
- Day Theme Default/Sakura/Coffee/Rainy still controls only its documented page/journal/cover/
  accent/editor scope.
- Day Theme does not override the seven specialized App Theme variables.
- Journal font personalization remains scoped as before; controls/table headers/status/app shell
  retain UI font.

## I. Verification

Final commands all passed:

```powershell
npm.cmd run format:check
npm.cmd run i18n:lint
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build

Push-Location src-tauri
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features
Pop-Location

git diff --check
```

Final build:

- 1,742 modules;
- build time `1.11 s`;
- CSS `57.71 kB`, gzip `11.20 kB`;
- main JS `364.41 kB`, gzip `110.71 kB`;
- no warning.

Bundle delta from baseline:

- CSS: `-0.28 kB` raw, `-0.04 kB` gzip;
- main JS: unchanged at reported precision;
- module count unchanged.

No installer, portable, release artifact or version bump was produced.

## J. Documentation/worklog

Updated:

- `docs/00-DOCUMENT-STATUS.md`;
- `docs/05-ROADMAP.md`;
- `docs/06-APP-APPEARANCE-THEME.md`;
- `docs/16-DESIGN-SYSTEM.md`;
- this result worklog.

Created earlier:

- `docs/prompts/CORRECTIVE-APP-THEME-TOKEN-WIRING.md`;
- `docs/audits/APP-THEME-TOKEN-WIRING-AUDIT.md`.

Database, Backup and i18n canonical documents were not changed because their contracts/resources
did not change.

## K. Git

Commits before this documentation commit:

1. `57b9b99c19ee0e680f6987a16a904e6a9e308a8d docs: record app theme token wiring fix`
   — 1 file, 1,417 insertions.
2. `e70b6174a405bfa86c69b920d3ccad2f97f85838 docs: audit app theme token wiring`
   — 1 file, 197 insertions.
3. `b219761dacf4de687c6615780c9a9d86594f43df fix: wire app theme surface tokens`
   — 9 files, 255 insertions, 19 deletions.

The final documentation commit uses message
`docs: record app theme token wiring correction`. Its own hash cannot be embedded in the file it
hashes; the final chat report and `git log` provide that hash and final HEAD.

No push, tag, release, merge, rebase or prohibited destructive Git command was run. Final local
origin relation is expected to be four valid task commits ahead of `origin/master`, with no push.

## L. Native Windows acceptance handoff

Run with an isolated target/profile:

```powershell
Set-Location C:\dev\done-today

$env:CARGO_TARGET_DIR = Join-Path $env:TEMP 'done-today-theme-token-fix-target'
$configPath = Join-Path $env:TEMP 'done-today-theme-token-fix.json'

[System.IO.File]::WriteAllText(
  $configPath,
  '{"identifier":"com.donetoday.desktop.themetokenfix"}',
  [System.Text.UTF8Encoding]::new($false)
)

npm.cmd run tauri -- dev --config $configPath
```

Diagnostic matrix:

| Token | Value | Expected |
| --- | --- | --- |
| Accent | `#00FF00` | green accent surfaces only |
| Table header | `#FF00FF` | magenta table header only |
| Stats background | `#111111` | near-black panel |
| Stats border | `#FF0000` | red panel border/dividers |
| Stats primary text | `#FFFFFF` | white values |
| Stats secondary text | `#FFFF00` | yellow labels |
| Stats progress track | `#444444` | dark-gray track |
| Stats progress fill | `#00FFFF` | cyan fill |

Checklist:

1. Change one token at a time and verify instant preview.
2. Verify Table header save/reload in light and dark; changing Accent must not change it.
3. Verify Accent surfaces change while Table header and six specialized Stats surfaces remain.
4. Verify each Stats token changes only its owned sub-surface.
5. Save/reload; reset preset; switch preset then return to custom.
6. Check Done Today, Forest, Ocean, Lavender, Warm Sand, Monochrome and custom.
7. Check Day Theme Default, Sakura, Coffee and Rainy.
8. Check Today, History, Settings, Calendar, editor/autosave, Categories, status, reorder, streak,
   Backup smoke, `vi`/`en`, and 900×600/default/maximize.
9. Do not mark this checkpoint Completed until the user confirms native results.

Cleanup only the isolated profile/config:

```powershell
$profilePath = Join-Path $env:APPDATA 'com.donetoday.desktop.themetokenfix'

if (Test-Path -LiteralPath $profilePath) {
  Remove-Item -LiteralPath $profilePath -Recurse -Force
}

Remove-Item -LiteralPath $configPath -Force -ErrorAction SilentlyContinue
```

Do not delete the main application profile.

## M. Deferred

- Native visual/token acceptance is pending user confirmation.
- Screen reader and Accessibility Tree acceptance are not claimed.
- Visual Fidelity/UI Polish, reference images, layout changes, Day Cover polish, Theme Packs,
  new presets/tokens, installer/portable/release and version bump remain outside this task.

## Final status

Day Theme Checkpoint 1:
Completed

Day Theme Checkpoint 2:
Completed

Day Theme Checkpoint 3:
Completed — native Windows acceptance passed

Day Theme Checkpoint 4:
Completed — native Windows acceptance passed

Day Theme Checkpoint 5:
Completed — native Windows acceptance passed

Corrective Checkpoint — App Theme Token Wiring:
Implementation complete — native Windows acceptance pending

Release Readiness Checkpoint 1 — Visual Fidelity & Final UI Polish:
Not started / paused until corrective checkpoint passes native acceptance
