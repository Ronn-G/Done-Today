# Corrective App Theme Token Wiring — Result

**Implementation date:** 2026-07-30
**Native acceptance date:** 2026-08-02
**Authoritative task:** Corrective Checkpoint — App Theme Token Wiring
**Final status:** Completed — native Windows acceptance passed

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

Corrective implementation history:

1. `57b9b99c19ee0e680f6987a16a904e6a9e308a8d docs: record app theme token wiring fix`
   — 1 file, 1,417 insertions.
2. `e70b6174a405bfa86c69b920d3ccad2f97f85838 docs: audit app theme token wiring`
   — 1 file, 197 insertions.
3. `b219761dacf4de687c6615780c9a9d86594f43df fix: wire app theme surface tokens`
   — 9 files, 255 insertions, 19 deletions.
4. `e87267accd7e2bdb9c910ee2bc452c8f090d1f33 docs: record app theme token wiring correction`
   — implementation/result documentation pointer audited for this closeout.

Closeout prompt preservation:

- `07bb1c400de3a4d5ecb35d45609edbaf2e975b7f docs: record app theme token wiring closeout task`.

The final closeout documentation commit uses message
`docs: complete app theme token wiring correction`. Its own hash cannot be embedded in the file it
hashes; the final report and `git log` provide that hash and final HEAD. The implementation pointer
remains `e87267accd7e2bdb9c910ee2bc452c8f090d1f33`, not either closeout documentation commit.

No push, tag, release, merge, rebase or prohibited destructive Git command was run. Final local
origin relation is expected to be six valid task commits ahead of `origin/master`, with no push.

## L. Native Windows acceptance

The user confirmed native Windows acceptance passed on **2026-08-02**.

Diagnostic matrix:

| Token | Value | Accepted observation |
| --- | --- | --- |
| Accent | `#00FF00` | green accent surfaces only |
| Table header | `#FF00FF` | magenta table header only |
| Stats background | `#111111` | near-black panel |
| Stats border | `#FF0000` | red panel border/dividers |
| Stats primary text | `#FFFFFF` | white values |
| Stats secondary text | `#FFFF00` | yellow labels |
| Stats progress track | `#444444` | dark-gray track |
| Stats progress fill | `#00FFFF` | cyan fill |

- Table header changed when edited directly and remained unchanged when only Accent changed.
  Preview, save/apply, reload and reset preset all behaved correctly in light/dark/custom.
- Accent affected only its semantically owned accent surfaces. Table header and specialized Today
  statistics surfaces did not follow Accent.
- Stats background, border, primary text, secondary text, progress track and progress fill each
  changed independently.
- Preset reset and switching did not mutate preset constants.
- Day Theme Default, Sakura, Coffee and Rainy no longer shadowed Table header or the six Stats
  tokens; App Theme and Day Theme boundaries remained correct.
- No clear regression was observed in Today, History, Settings, Theme Picker, Personalization,
  editor/autosave, Categories, status/statistics/reorder, Calendar/History, `vi`/`en`, or at
  900×600/default/maximize.
- Acceptance evidence is limited to the user-confirmed native visual/behavioral checks above plus
  the existing automated/source evidence. No screen-reader or Accessibility Tree pass is claimed.

## M. Deferred

- Screen reader and Accessibility Tree acceptance are not claimed.
- Visual Fidelity/UI Polish, reference images, layout changes, Day Cover polish, Theme Packs,
  new presets/tokens, installer/portable/release and version bump remain outside this task.
- Release Readiness Checkpoint 1 — Visual Fidelity & Final UI Polish is not started; only its
  corrective token wiring blocker is cleared.

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
Completed — native Windows acceptance passed

Release Readiness Checkpoint 1 — Visual Fidelity & Final UI Polish:
Not started — corrective token wiring blocker cleared
