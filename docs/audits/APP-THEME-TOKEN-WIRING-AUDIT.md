# App Theme Token Wiring Audit

**Audit date:** 2026-07-30
**Baseline:** `57b9b99` (`master`, one local prompt-preservation commit ahead of `origin/master`)
**Scope:** Corrective Checkpoint — App Theme Token Wiring
**Status:** Root cause confirmed; schema/database migration not required

## 1. Contract and precedence

`docs/00-DOCUMENT-STATUS.md` gives the current checkpoint contract highest precedence, followed by
the App Theme domain specification and the Design System. The current canonical sources agree:

- `ThemePreferences` is schema version 2 with exactly 33 colors in each light/dark palette.
- `tableHeaderBackground` is a dedicated App Theme token.
- the Today statistics panel owns six dedicated App Theme tokens.
- specialized tokens take precedence over generic Accent/Card tokens.
- Day Theme is local to the day content container and must not take ownership of unrelated App
  Theme surfaces.
- persistence remains `app_settings["appearance.themePreferences"]`; no database or migration
  change is needed.

## 2. Shared end-to-end path

All 33 controls use the same typed path:

1. `ThemeSettings.tsx` enumerates a `ThemeColorKey` in `groups`.
2. `ColorControl` passes that exact key to `onCommit`.
3. `updateThemeColor(preferences, editing, key, value)` updates only
   `lightColors[key]` or `darkColors[key]`, selects `custom`, and preserves the other palette and
   tokens.
4. `ThemeCustomizerController.commit` updates React state immediately and schedules the same full
   v2 payload in `ThemeSaveCoordinator`.
5. `App.tsx` calls `applyThemePreferences` whenever preferences or the active palette changes.
6. `TauriThemeRepository` runtime-validates load responses and saves the same typed payload.
7. Rust validates both complete palettes against `THEME_COLOR_KEYS`, upserts the JSON under the
   stable key, and upgrades v1 to v2 only with the existing six-token policy.
8. Bootstrap restores the payload; invalid/missing data falls back to immutable Done Today.

Inventory notation below:

- **Zod/Rust:** `C/R` means required by `themeColorsSchema` and `THEME_COLOR_KEYS`.
- **Whitelist/apply:** `W/A` means present in the typed `variables` whitelist and written by
  `applyThemeVariables`.
- **Preset:** `base` means `palette()` supplies both modes; `override` means one or more named
  presets override that base while retaining a complete palette.
- **Preview/persist:** `live/full` means the React effect applies the active palette immediately and
  the full v2 JSON round-trips through SQLite.
- **Fallback:** `DT` means the immutable Done Today light/dark value.

## 3. Complete 33-token inventory

| Token ID | Settings label (en / vi) | Light preference path | Dark preference path | Preset source | Zod schema | Rust validation | CSS variable name | Variable whitelist entry | Apply-theme mapping | Primary UI consumers | Fallback | Preview behavior | Persist/reload behavior | Tests | Finding |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pageBackground` | App background / Nền ứng dụng | `lightColors.pageBackground` | `darkColors.pageBackground` | base + override | C | R | `--bg-page` | W | A | body/app page; default Day Theme alias | DT | live | full | schema/preset/apply tests | Correct; Day Theme page override is contract-scoped. |
| `sidebarBackground` | Sidebar background / Nền sidebar | `lightColors.sidebarBackground` | `darkColors.sidebarBackground` | base + override | C | R | `--bg-sidebar` | W | A | `.sidebar` through `--surface-sidebar` | DT | live | full | schema/preset/apply tests | Correct; outside Day Theme scope. |
| `sidebarActiveBackground` | Selected sidebar item / Mục sidebar đang chọn | `lightColors.sidebarActiveBackground` | `darkColors.sidebarActiveBackground` | base + override | C | R | `--bg-sidebar-active` | W | A | active/hover navigation | DT | live | full | schema/preset/apply tests | Correct. |
| `cardBackground` | Cards and tables / Card và bảng | `lightColors.cardBackground` | `darkColors.cardBackground` | base | C | R | `--bg-card` | W | A | generic panels, settings, dialogs; default Day Theme alias | DT | live | full | schema/preset/apply tests | Correct; not a substitute for Stats. |
| `tableHeaderBackground` | Table header / Tiêu đề bảng | `lightColors.tableHeaderBackground` | `darkColors.tableHeaderBackground` | base | C | R | `--bg-table-header` | W | A | `thead th` | DT | root updates live but consumer is shadowed | full | domain, Settings, Today table tests | **Broken:** `.day-theme-scope` redefines the variable, making the App token dead on Today. |
| `editorHoverBackground` | Editor hover / Editor khi hover | `lightColors.editorHoverBackground` | `darkColors.editorHoverBackground` | base | C | R | `--bg-editor-hover` | W | A | editor/preset/form hover surfaces | DT | live | full | schema/preset/apply tests | Correct; Day Theme override is journal-interaction scope. |
| `primaryText` | Primary text / Chữ chính | `lightColors.primaryText` | `darkColors.primaryText` | base | C | R | `--text-primary` | W | A | headings, primary controls, generic panels | DT | live | full | contrast/schema/apply tests | Correct; Day Theme text override is journal-content scope. |
| `secondaryText` | Secondary text / Chữ phụ | `lightColors.secondaryText` | `darkColors.secondaryText` | base | C | R | `--text-secondary` | W | A | subtitles, table body, labels | DT | live | full | contrast/schema/apply tests | Correct; specialized Stats text must win. |
| `mutedText` | Muted text / Chữ gợi ý | `lightColors.mutedText` | `darkColors.mutedText` | base | C | R | `--text-muted` | W | A | placeholders and metadata | DT | live | full | schema/preset/apply tests | Correct. |
| `sidebarText` | Sidebar text / Chữ sidebar | `lightColors.sidebarText` | `darkColors.sidebarText` | base + override | C | R | `--text-on-sidebar` | W | A | inactive navigation | DT | live | full | contrast/schema/apply tests | Correct. |
| `sidebarActiveText` | Selected sidebar text / Chữ sidebar đang chọn | `lightColors.sidebarActiveText` | `darkColors.sidebarActiveText` | base + override | C | R | `--text-on-sidebar-active` | W | A | brand and active navigation | DT | live | full | contrast/schema/apply tests | Correct. |
| `border` | Border / Màu viền | `lightColors.border` | `darkColors.border` | base | C | R | `--border` | W | A | generic controls/panels; default Day Theme alias | DT | live | full | schema/preset/apply tests | Correct; not a substitute for Stats border. |
| `accent` | Accent / Màu nhấn | `lightColors.accent` | `darkColors.accent` | base + override | C | R | `--accent` | W | A | nav markers, focus/selection emphasis, default Day Theme accent | DT | live | full | custom/preset/apply tests | Mapping is correct, but the Day Theme cascade incorrectly lets it influence Table header via `--surface-raised`. |
| `focusRing` | Focus ring / Viền focus | `lightColors.focusRing` | `darkColors.focusRing` | base | C | R | `--focus-ring` | W | A | focus-visible and editor focus | DT | live | full | schema/preset/apply tests | Correct. |
| `progressTrack` | Progress track / Nền thanh tiến độ | `lightColors.progressTrack` | `darkColors.progressTrack` | base | C | R | `--progress-track` | W | A | History progress | DT | live | full | schema/preset/apply tests | Correct; not a substitute for Stats progress track. |
| `statsPanelBackground` | Statistics panel background / Nền khối thống kê | `lightColors.statsPanelBackground` | `darkColors.statsPanelBackground` | base + override | C | R | `--stats-bg` | W | A | `.stats` background | DT / v1 from Card | root updates live but consumer is shadowed | full | schema, migration, contrast, apply tests | **Broken:** Day Theme replaces it with `--day-surface-raised`. |
| `statsPanelBorder` | Statistics panel border / Viền khối thống kê | `lightColors.statsPanelBorder` | `darkColors.statsPanelBorder` | base + override | C | R | `--stats-border` | W | A | panel border and stat dividers | DT / v1 from Border | root updates live but consumer is shadowed | full | schema, migration, apply tests | **Broken:** Day Theme replaces it with `--day-border`. |
| `statsPanelPrimaryText` | Statistics panel primary text / Chữ chính khối thống kê | `lightColors.statsPanelPrimaryText` | `darkColors.statsPanelPrimaryText` | base + override | C | R | `--stats-text-primary` | W | A | statistic values and percent | DT / v1 from Primary | root updates live but consumer is shadowed | full | schema, migration, contrast, apply tests | **Broken:** Day Theme replaces it with `--day-text`. |
| `statsPanelSecondaryText` | Statistics panel secondary text / Chữ phụ khối thống kê | `lightColors.statsPanelSecondaryText` | `darkColors.statsPanelSecondaryText` | base + override | C | R | `--stats-text-secondary` | W | A | statistic labels/supporting text | DT / v1 from Secondary | root updates live but consumer is shadowed | full | schema, migration, contrast, apply tests | **Broken:** Day Theme replaces it with `--day-text-muted`. |
| `statsPanelProgressTrack` | Statistics progress track / Nền thanh tiến độ thống kê | `lightColors.statsPanelProgressTrack` | `darkColors.statsPanelProgressTrack` | base + override | C | R | `--stats-progress-track` | W | A | `.progress` track in Stats | DT / v1 from generic track | root updates live but consumer is shadowed | full | schema, migration, apply tests | **Broken:** Day Theme replaces it with `--day-border`. |
| `statsPanelProgressFill` | Statistics progress fill / Màu thanh tiến độ thống kê | `lightColors.statsPanelProgressFill` | `darkColors.statsPanelProgressFill` | base + override | C | R | `--stats-progress-fill` | W | A | `.progress i` in Stats | DT / v1 from Accent | root updates live but consumer is shadowed | full | schema, migration, apply tests | **Broken:** Day Theme replaces it with `--day-accent`. |
| `completedBackground` | Completed · background / Hoàn thành · nền | `lightColors.completedBackground` | `darkColors.completedBackground` | base | C | R | `--badge-done-bg` | W | A | completed badge/select/success | DT | live | full | schema/preset/apply tests | Correct. |
| `completedText` | Completed · text / Hoàn thành · chữ | `lightColors.completedText` | `darkColors.completedText` | base | C | R | `--badge-done-text` | W | A | completed badge/select/success | DT | live | full | contrast/schema/apply tests | Correct. |
| `completedBorder` | Completed · border / Hoàn thành · viền | `lightColors.completedBorder` | `darkColors.completedBorder` | base | C | R | `--badge-done-border` | W | A | completed select/success borders | DT | live | full | schema/preset/apply tests | Correct. |
| `inProgressBackground` | In progress · background / Đang làm · nền | `lightColors.inProgressBackground` | `darkColors.inProgressBackground` | base | C | R | `--badge-inprogress-bg` | W | A | in-progress badge/select/warning | DT | live | full | schema/preset/apply tests | Correct. |
| `inProgressText` | In progress · text / Đang làm · chữ | `lightColors.inProgressText` | `darkColors.inProgressText` | base | C | R | `--badge-inprogress-text` | W | A | in-progress badge/select/warning | DT | live | full | contrast/schema/apply tests | Correct. |
| `inProgressBorder` | In progress · border / Đang làm · viền | `lightColors.inProgressBorder` | `darkColors.inProgressBorder` | base | C | R | `--badge-inprogress-border` | W | A | in-progress select/warning borders | DT | live | full | schema/preset/apply tests | Correct. |
| `postponedBackground` | Postponed · background / Bị hoãn · nền | `lightColors.postponedBackground` | `darkColors.postponedBackground` | base | C | R | `--badge-postponed-bg` | W | A | postponed badge/select | DT | live | full | schema/preset/apply tests | Correct. |
| `postponedText` | Postponed · text / Bị hoãn · chữ | `lightColors.postponedText` | `darkColors.postponedText` | base | C | R | `--badge-postponed-text` | W | A | postponed badge/select | DT | live | full | contrast/schema/apply tests | Correct. |
| `postponedBorder` | Postponed · border / Bị hoãn · viền | `lightColors.postponedBorder` | `darkColors.postponedBorder` | base | C | R | `--badge-postponed-border` | W | A | postponed badge/select border | DT | live | full | schema/preset/apply tests | Correct. |
| `cancelledBackground` | Cancelled · background / Đã hủy · nền | `lightColors.cancelledBackground` | `darkColors.cancelledBackground` | base | C | R | `--badge-cancelled-bg` | W | A | cancelled badge/select | DT | live | full | schema/preset/apply tests | Correct. |
| `cancelledText` | Cancelled · text / Đã hủy · chữ | `lightColors.cancelledText` | `darkColors.cancelledText` | base | C | R | `--badge-cancelled-text` | W | A | cancelled badge/select | DT | live | full | contrast/schema/apply tests | Correct. |
| `cancelledBorder` | Cancelled · border / Đã hủy · viền | `lightColors.cancelledBorder` | `darkColors.cancelledBorder` | base | C | R | `--badge-cancelled-border` | W | A | cancelled badge/select border | DT | live | full | schema/preset/apply tests | Correct. |

Mechanical integrity check against `applyTheme.ts`: **33 keys, 33 unique CSS variables, no
duplicates**. `themeColorsSchema`, the translated-label registry, Settings controls, Rust
`THEME_COLOR_KEYS`, preset palettes and apply whitelist each contain all 33 tokens.

## 4. Focused end-to-end trace

### Table header

`tableHeaderBackground` is correctly wired through the control, draft key, custom conversion,
preview effect, v2 JSON, Rust validation, SQLite upsert/load, palette selection and
`--bg-table-header`. `thead th` also correctly consumes that variable.

The failure is later in the cascade. Every Today screen is wrapped by `.day-theme-scope`, whose
local declaration is closer to the table than the root declaration:

```css
.day-theme-scope {
  --bg-table-header: var(--day-surface-raised);
}
```

For the default Day Theme, `--day-surface-raised` resolves through
`--app-day-surface-raised` to `--surface-raised`, which is a mix of Card and Accent. Therefore:

- changing Table header updates the root variable but cannot reach the header;
- changing Accent changes `--surface-raised`, so it changes Table header indirectly;
- named Day Themes replace Table header with their own raised surface, also ignoring the App token.

There is no hard-coded/Tailwind `background` or higher-specificity rule overriding `thead th`;
the custom-property redefinition itself is the cause.

### Six Today statistics tokens

All six controls and mappings are correct until the same `.day-theme-scope` boundary redefines
their variables:

```css
--stats-bg: var(--day-surface-raised);
--stats-border: var(--day-border);
--stats-text-primary: var(--day-text);
--stats-text-secondary: var(--day-text-muted);
--stats-progress-track: var(--day-border);
--stats-progress-fill: var(--day-accent);
```

The `.stats`, `.stat`, `.progress`, and `.progress i` consumers correctly use the six specialized
variables. The controls are dead only because the local Day Theme declarations shadow the
App Theme values on every Today screen.

### Preview, save, reload, palette and preset conversion

- Preview and persisted state use the same `ThemePreferences` object; no split payload was found.
- Light/dark selection passes the active palette to `applyThemePreferences`.
- `updateThemeColor` preserves the untouched palette and all other tokens.
- preset selection returns fresh copies; presets remain frozen/immutable.
- v1-to-v2 conversion creates all six Stats tokens using the documented existing policy.
- restore validates with Zod and Rust; bootstrap applies the restored object.
- no migration/database change is involved.

## 5. Day Theme boundary and cascade evidence

Day Theme intentionally overrides journal page/surface/text/border/accent/editor interaction
variables inside `.day-theme-scope`. The App Theme contract, however, gives Table header and Stats
their own specialized tokens. Those seven specialized variables are outside the Day Theme token
contract and must inherit from the root.

A dependency-free source/CSSOM diagnostic using the repository's existing `jsdom` showed:

```text
root --bg-table-header: #FF00FF
day scope --bg-table-header: var(--day-surface-raised)
day scope --stats-bg: var(--day-surface-raised)
```

JSDOM does not resolve custom-property/color-mix chains into final `background-color`, so no claim
is made about browser/native computed color from that diagnostic. The native bug report supplies
the visual reproduction; CSS cascade and source tracing identify the exact override. Post-fix
native acceptance remains required.

## 6. Findings

| Classification | Root cause | Affected tokens | Affected surfaces | Severity | Fix location | Regression risk | Required tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Root cause | `.day-theme-scope` takes ownership of `--bg-table-header` even though Table header has a specialized App token. The default raised surface depends on Accent. | Table header; indirect Accent coupling | Today work-table header | High | `src/styles.css` Day Theme scope | Table could lose intended Day Theme styling if the contract were ambiguous; canonical contract resolves this in favor of App Theme ownership. | mapping identity; consumer rule; Day Theme non-override; light/dark/custom round-trip |
| Root cause | `.day-theme-scope` replaces all six specialized Stats variables with generic Day Theme surface/text/border/accent variables. | six Stats tokens | Today statistics panel, dividers, values, labels, track, fill | High | `src/styles.css` Day Theme scope | Existing Day Theme palettes will no longer recolor Stats; this is required by the App Theme contract and must be checked across all four Day Themes. | six consumer assertions; independence matrix; Day Theme boundary |
| Coverage gap | Existing apply test samples only four variables and does not prove one-to-one integrity for all 33. | all 33 | theme infrastructure | Medium | `applyTheme.ts`/theme tests | Mapping drift could recreate dead or crossed controls. | exported/read-only mapping table; table-driven 33-token equality/uniqueness |
| Coverage gap | Existing DayThemeScope test asserts the scope does not emit inline `--accent`, but does not inspect CSS for forbidden App Theme specialized overrides. | Table header + six Stats | Today | High | DayThemeScope/App tests | A future CSS edit could reintroduce shadowing. | explicit forbidden-variable assertions |
| Coverage gap | Existing Settings test covers live Table header mapping but not an all-token control-key mapping or the six Stats controls. | all 33, especially Stats | Settings/floating customizer | Medium | ThemeSettings tests | UI group/key drift could silently update the wrong token. | table-driven control inventory and targeted update assertions |

## 7. Required corrective seam

The minimal contract-correct fix is to remove the seven specialized App Theme variable
redefinitions from `.day-theme-scope`. No component should read `ThemePreferences`, no duplicate
variables or hard-coded colors are needed, and the existing consumers can remain unchanged.

Regression protection must:

- expose and assert the complete semantic `ThemeColorKey -> CSS variable` mapping;
- prove 33/33 presence and one-to-one uniqueness;
- prove Table header maps differently from Accent;
- prove all six Stats tokens map differently from generic Card/Border/Text/Track/Accent variables;
- prove `.day-theme-scope` does not redefine the seven specialized variables;
- prove `thead th` and each Stats sub-surface consume the dedicated variables;
- prove Settings renders and targets all 33 typed controls;
- preserve existing schema, v1 upgrade, persistence, presets, i18n and Day Theme tests.

## 8. Deferred

No additional out-of-scope functional defect was found during this audit. Visual fidelity, layout,
new presets/tokens, installer/portable/release and all Day Theme phase 6+ work remain deferred.
