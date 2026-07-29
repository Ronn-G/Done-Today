# Day Theme Checkpoint 4 — Calendar & History — Worklog

Ngày thực hiện: 2026-07-29

Repository: `C:\dev\done-today`

Branch: `master`

Trạng thái: **Completed — native Windows acceptance passed**

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

Các tài liệu implementation ban đầu ghi Checkpoint 4 hoàn tất implementation và chờ native
acceptance. Closeout ngày 2026-07-29 cập nhật trạng thái sau khi người dùng xác nhận đã test ổn.

## L. Git/commit discipline

Các commit checkpoint:

1. `119f5fdac8640d9b2651ba166c16f81afd572ee1` — preserve task prompt.
2. `10bac7c9a49897cdee2d2e1c4915da0605ecf5fc` — data/query contract.
3. `d9cc0db049fe3f4bd3af7f9fa33d2c1517e02fa2` — Calendar và History UI.
4. `24b821bf7dfb6f1b21ee133e1050f36573875028` — compatibility/regression.
5. `d7cf6ca291ec52da01150fb79545f1b2e830412c` — documentation và worklog implementation.
6. `10533b56a22bf51673bd8e17292047dc60b52d8b` — preserve closeout prompt.
7. Closeout documentation dùng message `docs: complete day theme calendar and history`; hash đầy
   đủ được báo trong closeout handoff. Không thể nhúng hash của chính commit vào nội dung commit đó
   mà không tạo self-reference.

Không push, không tạo release/installer, không commit generated build artifact.

## M. Deferred/out of scope

- Checkpoint 5+ personalization, theme packs và release packaging.
- Screen-reader/Accessibility tree testing.
- Deliberate native corrupt/unknown database metadata và native loading failure/Retry injection.
- Installer/portable artifact và artifact smoke test.

## N. Exact status

```text
Day Theme Checkpoint 1 — Foundation:
Completed

Day Theme Checkpoint 2 — First Themes:
Completed

Day Theme Checkpoint 3 — Theme Picker:
Completed — native Windows acceptance passed

Day Theme Checkpoint 4 — Calendar & History:
Completed — native Windows acceptance passed

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 5+:
Not started
```

## O. Native Windows acceptance

Người dùng xác nhận “Đã test ổn” ngày 2026-07-29. Native acceptance ghi nhận:

1. Compact Calendar trong History, previous/next month, `vi`/`en`, today/selected state, ngày có
   log và indicator Default/Sakura/Coffee/Rainy hiển thị đúng, không che số ngày và không chỉ dựa
   vào màu.
2. Click, Enter/Space, Arrow keys, Home/End và điều hướng qua biên tháng hoạt động; đổi tháng không
   để stale result ghi đè trong luồng sử dụng thông thường.
3. History card giữ bố cục nhẹ, symbol/accent/localized name đúng; pagination, loading, empty state,
   navigation và mở đúng ngày không regression trong luồng sử dụng thông thường.
4. Mở ngày cũ từ Calendar/History và reload khôi phục đúng per-day Day Theme/Day Cover; app shell
   không bị Day Theme scope ghi đè.
5. App Theme light/dark/custom, Theme Picker, Today editor/autosave, Categories,
   status/statistics/reorder, History và date navigation tiếp tục hoạt động.
6. Không có raw translation key ở `vi`/`en`; cửa sổ 900×600, kích thước mặc định và maximize sử
   dụng được.
7. Native keyboard review và native focus/visual review trong phạm vi người dùng kiểm tra đã đạt.

Các vùng không được tuyên bố là đã thử native trực tiếp:

- unknown/corrupt database theme metadata;
- native failure injection cho loading/error/Retry;
- forced-colors và reduced-motion ngoài automated/source evidence.

Các vùng trên là **Covered by automated/source evidence**. Không tuyên bố screen-reader thật hoặc
Accessibility Tree testing. Closeout không ghi nhận thêm profile-cleanup assertion vì người dùng
không cung cấp bằng chứng riêng và cleanup không cần để xác nhận các hành vi đã nêu.
