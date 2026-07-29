# Day Theme Checkpoint 4 — Calendar & History — Worklog

Ngày thực hiện: 2026-07-29

Repository: `C:\dev\done-today`

Branch: `master`

Trạng thái: **Implementation complete — native Windows acceptance pending**

## A. Preflight

- Repository root: `C:/dev/done-today`.
- Branch: `master`.
- Baseline HEAD: `b27476c0f03a76185b3641ca274f0ed67e99a706`.
- `origin`: `https://github.com/Ronn-G/Done-Today`.
- Working tree ban đầu: clean.
- `git fetch origin --prune` đạt sau khi chạy lại ngoài filesystem sandbox; `master` bằng
  `origin/master`, merge-base ancestor check trả exit code 0.
- Đây là main checkout: git dir là `.git`; worktree list trỏ `C:/dev/done-today` tới
  `refs/heads/master`.
- Toolchain: Node `v24.17.0`, npm `11.13.0`, rustc `1.97.1`, cargo `1.97.1`.
- Không tìm thấy `AGENTS.md`.

## B. Prompt preservation

- Task gốc được byte-copy nguyên vẹn vào
  `docs/prompts/DAY-THEME-CHECKPOINT-04-CALENDAR-HISTORY.md`.
- SHA-256 của attachment và bản lưu trong repository khớp nhau.
- Commit:
  `119f5fdac8640d9b2651ba166c16f81afd572ee1`
  (`docs: record day theme checkpoint 4 task`).

## C. Baseline verification

Baseline trước thay đổi đạt toàn bộ gate:

- frontend format check: pass;
- i18n: 2 locale files / 48 tests: pass;
- typecheck và lint: pass;
- frontend: 45 test files / 390 tests: pass;
- production build: 1,738 modules, 654 ms;
- Rust format, clippy `-D warnings`: pass;
- Rust: 67 tests: pass;
- `git diff --check`: pass.

Baseline bundle:

| Chunk | Raw | Gzip |
| --- | ---: | ---: |
| CSS | 52.68 kB | 10.43 kB |
| main | 446.80 kB | 133.64 kB |
| picker | 4.92 kB | 1.77 kB |
| Coffee motif | 0.61 kB | 0.31 kB |
| Rainy motif | 0.61 kB | 0.31 kB |
| Sakura motif | 0.77 kB | 0.37 kB |

## D. Existing-flow audit

- History trước checkpoint chỉ có paginated list, chưa có month calendar.
- History SQL đã aggregate summary nhưng chạy thêm preview query theo từng card; đây là N+1 cần
  loại bỏ.
- Streak/activity query có semantics khác Calendar Day Theme nên không được tái sử dụng.
- Route `#/day/<date>`, `DayThemeScope`, `DayCover` và date stale guard hiện hữu được giữ nguyên.
- Day Theme registry đã là nguồn authoritative cho `calendar.indicatorColor`, localized name và
  symbol của Sakura/Coffee/Rainy. Default được bổ sung symbol trung tính.
- Migration/index hiện hữu đủ cho range summary; không thêm schema, migration hay dependency.
- Không phát hiện mâu thuẫn giữa task contract và tài liệu authoritative.

## E. Data/query implementation

- Thêm `CalendarDaySummary` runtime schema và typed contract xuyên suốt
  application/repository/Tauri.
- Range là nửa mở `[startDate, endDateExclusive)`; Rust kiểm tra cả hai đầu là `NaiveDate` hợp lệ và
  đầu cuối tăng dần.
- Query Calendar chỉ đọc `log_date`, `day_theme_id`, `day_theme_version`, dùng range predicate trên
  index `daily_logs.log_date`, ordered theo ngày; không tải daily log đầy đủ và không tạo ngày giả.
- History summary bổ sung theme ID/version và đưa entry preview vào cùng một SQL statement, loại bỏ
  N+1 query.
- Test bao phủ query shape, range validation, query-plan/index, `NULL`, known/unknown metadata,
  malformed IPC và History metadata.
- Commit:
  `10bac7c9a49897cdee2d2e1c4915da0605ecf5fc`
  (`feat: add day theme calendar summaries`).

## F. Calendar UI

- Thêm compact month calendar ngay dưới History header và trước list.
- Có previous/next month, month/year và weekday labels theo active locale bằng `Intl`.
- Chỉ render ngày thuộc tháng đang xem; future dates vẫn mở được.
- Today và selected day có semantic/style riêng; chọn ngày bằng click, Enter hoặc Space mở đúng
  route ngày.
- Roving focus hỗ trợ Arrow Left/Right/Up/Down, Home/End và chuyển focus qua biên tháng.
- Loading/error/Retry độc lập với History list; request sequence và unmount guard chặn stale result.
- Indicator chỉ dùng registry accent/symbol/localized name; không đưa full cover/motif vào calendar.

## G. History integration

- History card hiển thị accent, symbol và localized Day Theme name từ cùng registry metadata.
- `NULL`, unknown ID/version hoặc lookup failure dùng fallback Default an toàn.
- Pagination, load-more và deep-link mở ngày giữ nguyên.
- UI/i18n/calendar/history commit:
  `d9cc0db049fe3f4bd3af7f9fa33d2c1517e02fa2`
  (`feat: show day themes in calendar and history`).

## H. Accessibility và i18n

- `vi`/`en` có resource parity cho Calendar.
- Month/year, weekday và full-date labels dùng locale formatter, không hard-code.
- Calendar day có accessible full-date label, selected state và today state; controls có accessible
  name.
- Day Theme không truyền đạt chỉ bằng màu: symbol và localized name vẫn hiện diện.
- Forced-colors có rule riêng; global reduced-motion policy hiện hữu không bị thay đổi.
- Automated/source evidence không đồng nghĩa screen-reader hoặc Accessibility tree acceptance.

## I. Compatibility/regression

- Regression test xác nhận Sakura/Coffee/Rainy mở từ Calendar và History đều khôi phục đúng
  `DayThemeScope`; app shell nằm ngoài scope.
- `NULL`/unknown fallback không thay đổi.
- Stale async completion không ghi đè tháng/ngày mới.
- Source-boundary test xác nhận Calendar/History không import motif hay full cover.
- Commit:
  `24b821bf7dfb6f1b21ee133e1050f36573875028`
  (`test: verify day theme calendar and history compatibility`).

## J. Automated verification

Gate cuối trước documentation:

- frontend format check: pass;
- i18n: 2 locale files / 48 tests: pass;
- typecheck và lint: pass;
- frontend: 47 test files / 420 tests: pass;
- production build: 1,739 modules, 590 ms;
- Rust format và clippy `-D warnings`: pass;
- Rust: 70 tests: pass;
- `git diff --check`: pass.

Một lệnh tổng hợp đã gọi `cargo` nhầm từ repository root và nhận lỗi không tìm thấy
`Cargo.toml`; đây là lỗi working directory của lệnh kiểm tra, không phải lỗi source. Ba Rust gate
được chạy lại ngay tại `C:\dev\done-today\src-tauri` và đều đạt.

Final bundle trước documentation:

| Chunk | Baseline raw/gzip | Final raw/gzip | Delta raw/gzip |
| --- | ---: | ---: | ---: |
| CSS | 52.68 / 10.43 kB | 55.68 / 10.93 kB | +3.00 / +0.50 kB |
| main | 446.80 / 133.64 kB | 453.13 / 135.22 kB | +6.33 / +1.58 kB |
| picker | 4.92 / 1.77 kB | 4.92 / 1.77 kB | 0 / 0 |

Coffee/Rainy/Sakura motif chunks giữ nguyên `0.61/0.61/0.77 kB` raw và
`0.31/0.31/0.37 kB` gzip. Calendar không làm full motif đi vào startup path.

## K. Documentation

Đã cập nhật:

- `docs/00-DOCUMENT-STATUS.md`;
- `docs/02-TECHNICAL-DESIGN.md`;
- `docs/05-ROADMAP.md`;
- `docs/17-DAY-THEME-AND-PERSONALIZATION.md`;
- `docs/audits/I18N-STRING-INVENTORY.md`;
- worklog này.

Các tài liệu ghi rõ Checkpoint 4 mới hoàn tất implementation, chưa đạt native Windows acceptance.

## L. Git/commit discipline

Các commit checkpoint:

1. `119f5fdac8640d9b2651ba166c16f81afd572ee1` — preserve task prompt.
2. `10bac7c9a49897cdee2d2e1c4915da0605ecf5fc` — data/query contract.
3. `d9cc0db049fe3f4bd3af7f9fa33d2c1517e02fa2` — Calendar và History UI.
4. `24b821bf7dfb6f1b21ee133e1050f36573875028` — compatibility/regression.
5. Documentation commit dùng message `docs: record day theme checkpoint 4 implementation`; hash
   đầy đủ được báo trong handoff cuối. Không thể nhúng hash của chính commit vào nội dung commit đó
   mà không tạo self-reference.

Không push, không tạo release/installer, không commit generated build artifact.

## M. Deferred/out of scope

- Native Windows visual/keyboard/accessibility acceptance.
- Checkpoint 5+ personalization, theme packs và release packaging.
- Screen-reader/Accessibility tree testing.
- Installer/portable artifact và artifact smoke test.

## N. Exact status

```text
Day Theme Checkpoint 1 — Foundation:
Completed

Day Theme Checkpoint 2 — First Themes:
Completed

Day Theme Checkpoint 3 — Theme Picker:
Completed

Day Theme Checkpoint 4 — Calendar & History:
Implementation complete — native Windows acceptance pending

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 5+:
Not started
```

## O. Native Windows handoff

Chạy:

```powershell
Set-Location "C:\dev\done-today"
$env:CARGO_TARGET_DIR = "C:\dev\done-today-target"
$configPath = Join-Path $env:TEMP "done-today-day-theme-cp4.json"
[System.IO.File]::WriteAllText(
  $configPath,
  '{"build":{"beforeDevCommand":"npm.cmd run dev -- --host 127.0.0.1","devUrl":"http://127.0.0.1:1420"}}',
  [System.Text.UTF8Encoding]::new($false)
)
npm.cmd run tauri -- dev --config $configPath
```

Checklist cần xác nhận thủ công trên Windows:

1. History hiển thị Calendar đúng ở `vi` và `en`, tại 900×600, default và maximize.
2. Previous/next month, weekday/month labels, today và selected states đúng, không overflow.
3. Click/Enter/Space và Arrow/Home/End mở/focus đúng ngày, kể cả biên tháng và future date.
4. Sakura/Coffee/Rainy/Default/unknown hiển thị indicator dễ phân biệt, không chỉ dựa vào màu.
5. Từ Calendar và History card, ngày đích mở đúng cover/theme; app shell không bị Day Theme scope.
6. Loading/error/Retry không làm mất History list; đổi tháng nhanh không để kết quả cũ ghi đè.
7. Light/dark/custom App Theme, forced/high contrast và reduced motion vẫn đọc/điều khiển được.
8. History pagination/load-more, Today editor/autosave, status/statistics, Categories và reorder không
   regression.
9. Không có raw translation key hoặc layout vỡ với copy dài ở cả hai locale.

Sau khi dừng app:

```powershell
Remove-Item -LiteralPath $configPath -ErrorAction SilentlyContinue
Remove-Item Env:CARGO_TARGET_DIR -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "C:\dev\done-today-target" -Recurse -Force
```

Chỉ sau khi người dùng xác nhận checklist mới được đổi trạng thái Checkpoint 4 thành native
acceptance passed.
