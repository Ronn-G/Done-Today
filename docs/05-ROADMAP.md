# Roadmap

**Document status:** Authoritative for delivery status
**Document version:** 2.6
**Last verified against baseline commit:** `455a974c39cdb57085b32082dee8e4518ba5039a` (2026-07-28)

## 1. Cách đọc trạng thái

- **Completed:** đã triển khai và nằm trong commit được xác minh gần nhất.
- **In progress — uncommitted:** đã triển khai trong working tree nhưng chưa thuộc commit được xác minh.
- **In progress — checkpoint complete:** ít nhất một checkpoint độc lập đã hoàn thành, nhưng feature chưa đạt toàn bộ acceptance criteria.
- **Specified:** đặc tả đã có; chưa được coi là implementation hoàn thành.
- **Planned:** chưa bắt đầu hoặc chưa có bằng chứng hoàn thành.
- **Release gate:** chỉ thực hiện khi chuẩn bị phát hành, không phải development gate.

Mốc `Last verified against commit` không tự thay thế code audit. Trạng thái dưới đây dựa trên
bộ tài liệu và báo cáo quality gate gần nhất; thay đổi chưa commit luôn được ghi riêng.

## 2. Trạng thái hiện tại

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Foundation | Completed | React, TypeScript, Vite, Tauri, SQLite, migration runner và test nền tảng |
| Daily Table | Completed | CRUD, inline editing, bốn trạng thái và autosave |
| Navigation and History | Completed | Điều hướng theo ngày, route ngày và lịch sử có phân trang |
| Motivation UI | Completed | Thống kê, progress, current journal streak, câu gợi ý, light/dark và empty states; streak được hoàn tất qua regression closure ngày 2026-07-24 |
| App Appearance Theme | Completed | App Theme toàn cục; xem tài liệu 06 |
| Work Categories | Completed | Quản lý nhóm, archive, sorting, completed bucket và reorder |
| Backup/Restore v1 | Completed | Canonical checksum, export, dry-run preview, Merge, Replace all và receipts |
| Design System | Specified | Tài liệu 16 là chuẩn bắt buộc cho UI mới và UI được sửa |
| Day Theme & Personalization | In progress — checkpoint complete | Checkpoint 1 — Foundation đã Completed sau native Windows acceptance ngày 2026-07-28; Theme Picker và các phase sau chưa bắt đầu |
| I18N-1 | Completed | Commit `eca9f76d`; 43 file, review cuối không có blocking finding, working tree sạch |
| I18N-2 | Completed | App shell + Today đã hoàn tất workflow `vi`/`en` qua bốn checkpoint; stable domain values và dữ liệu người dùng không đổi |
| I18N-3 | Completed | History, Settings shell + Categories và toàn bộ App Theme customization đã hoàn tất workflow `vi`/`en` qua bốn checkpoint; checkpoint 4 khép lại Custom colors + Floating Theme Customizer |
| I18N-4 | Completed | Backup/Restore presentation, structured Rust errors/warnings, typed exhaustive frontend mapping và native Windows visual/keyboard/accessibility acceptance đã hoàn tất cho `vi`/`en` |
| I18N-5 | Completed | Fresh-install detection, atomic locale bootstrap và Backup v1 preference exclusion đã hoàn tất automated gate và native Windows acceptance ngày 2026-07-28 |
| Release packaging | Release gate | Chưa phải đầu ra của development task hiện tại |

## 3. Các checkpoint đã hoàn thành

### Foundation

- Khởi tạo application shell, routing và database connection.
- Migration runner chạy lặp lại an toàn.
- Có test migration và quality tooling.

### Daily Table

- Tạo/lấy daily log theo ngày.
- Thêm, sửa, xóa và đổi trạng thái work item.
- Autosave có saving/saved/error/retry.
- Đóng và mở lại app không mất dữ liệu.

### Navigation, History và Motivation

- Chuyển ngày trước/sau và quay về Today.
- Mở ngày cũ từ History.
- Phân trang lịch sử.
- Thống kê, progress, câu gợi ý và empty states đã có trước regression closure.
- Roadmap trước đây đã ghi gộp streak là Completed dù source chưa có implementation.
- Regression closure ngày 2026-07-24 bổ sung current journal streak end-to-end: pure domain rule, activity-date query, Tauri contract, Today UI, i18n Việt/Anh và regression tests.

### App Appearance Theme

- App Theme typed, có preset và custom preference.
- Persistence trong `app_settings`.
- Light/dark palette và fallback an toàn.
- App Theme không được nhầm với Day Theme.

### Work Categories

- Quản lý nhóm, màu, archive và thứ tự.
- Section nhóm trong bảng Today.
- Completed bucket ở cuối từng nhóm và reorder trong bucket.

### Backup/Restore v1

- Backup JSON v1 với canonical SHA-256.
- Export, dry-run preview, Merge và Replace all trong transaction.
- Receipt cảnh báo nhập lặp và UI xác nhận an toàn.
- Schema authoritative chỉ nằm trong `08-BACKUP-RESTORE.md`.

### I18N-4 checkpoint 1

- Backup/Restore UI dùng resource `backup`/`common` cho visible và accessibility copy ở `vi`/`en`.
- Timestamp, số đếm, plural và success/preview summary dùng formatter theo active locale.
- Presentation boundary truyền title/filter đã dịch vào native Save/Open dialog; filename ASCII và
  hành vi JSON/cancel không đổi.
- Backup envelope v1, checksum, planner, Merge/Replace, receipt và transaction không đổi.
- Native Windows acceptance được chuyển sang checkpoint cuối.

### I18N-4 checkpoint 2

- Toàn bộ Tauri command families hiện hành dùng error code namespaced và scalar `params`; safe
  compatibility `message` không còn được frontend dùng để hiển thị hay quyết định behavior.
- Backup preview warnings dùng `{code, params}`; app-version và previously-imported conditions,
  receipt semantics và re-import confirmation không đổi.
- Frontend có runtime normalizer, typed exhaustive error/warning registries và shared Rust/TypeScript
  contract matrix; unknown/malformed payload luôn dùng localized safe fallback.
- Resources được đặt theo namespace Today, History, Settings/Categories, Theme, Backup và shared
  Errors; đổi locale dịch lại payload đang hiển thị mà không chạy lại command.
- Backup v1, checksum, planner, Merge/Replace, transaction, database schema và business rules không
  đổi.
- Automated gates đã đạt; I18N-4 vẫn `In progress — checkpoint complete` cho tới khi native
  Windows/accessibility regression được người dùng nghiệm thu.

### I18N-4 final acceptance

- Checkpoint 1 nằm trong commit `c0f56fd7c88a980e3c7bc71575020146d4c7f7dc`; checkpoint 2 nằm
  trong commit `0155154a4db633aa0b4f7bc65f2abeaae515e14c`; regression autosave liên quan nằm trong commit
  `c5d787b718032edb078a5c5b11056df466843041`.
- Final hardening giữ error/warning params trong allow-list scalar, chặn `appVersion` không hợp lệ
  trước presentation boundary, và hoàn thiện semantic error announcement cùng keyboard/focus
  contract cho Backup preview dialog.
- Targeted tests và toàn bộ frontend/Rust quality gates đã đạt. Backup v1, checksum,
  canonicalization, Merge/Replace, receipt, transaction, database schema và business rules không
  đổi.
- Người dùng xác nhận native Windows acceptance ngày 2026-07-27 cho `vi`/`en`, native Open/Save
  dialog, localized errors/warnings, locale switch giữ state, Merge/Replace/re-import, light/dark/
  custom theme, cửa sổ nhỏ/vừa/lớn và keyboard/focus.
- Accessibility được xác minh bằng source audit, automated keyboard tests và native keyboard/
  visual review. Không tuyên bố đã kiểm tra bằng screen-reader tooling.
- I18N-4 được đánh dấu **Completed**. I18N-5, Day Theme và release packaging không thuộc checkpoint
  này và không được đánh dấu hoàn thành.

### I18N-5 final acceptance

- Fresh boundary được capture tại native database path trước `open/migrate`: chỉ file database chưa
  tồn tại trong bootstrap hiện tại là `fresh`; database đã tồn tại hoặc không phân loại an toàn là
  `legacyOrUnclassified`.
- `installation.bootstrap` version 1 và `localization.locale` dùng `app_settings`. Một native
  initialization operation serialize các lời gọi, resolve và persist transactionally/idempotently.
- Locale `vi`/`en` đã persist luôn authoritative. Fresh dùng locale ưu tiên đầu tiên từ WebView/
  Windows (`vi`, `vi-VN` và case/underscore variants -> `vi`; English/unsupported/API failure ->
  `en`); legacy thiếu preference dùng compatibility `vi`.
- Marker thiếu/hỏng/version lạ fail closed cho database cũ. Transaction failure không để partial
  marker/locale; retry và concurrent initialization giữ state nhất quán.
- Backup v1 không đổi envelope, payload, checksum hoặc version. Locale/marker không export/import;
  Merge và Replace giữ cả hai preference; receipt/re-import semantics không đổi.
- Targeted frontend/Rust regressions và full automated gate đã đạt trong hai checkpoint
  `98c59f4` và `febacf0`.
- Người dùng xác nhận native Windows acceptance ngày 2026-07-28 bằng profile/database thử nghiệm
  tách biệt cho fresh `vi`/`en`, unsupported fallback `en`, legacy missing-locale fallback `vi`,
  persisted locale precedence, runtime switch/reopen, Export/Merge/Replace, App Theme, light/dark/
  custom theme, cửa sổ 900×600/default/maximize, không raw key/flash/clipping và keyboard/focus.
- Accessibility evidence gồm automated/source audit và native keyboard/focus/Accessibility tree.
  Không tuyên bố đã kiểm tra bằng screen-reader tooling.
- I18N-5 được đánh dấu **Completed**. Day Theme không thuộc I18N-5 và được theo dõi riêng bên dưới;
  release packaging chưa bắt đầu.

### Day Theme Checkpoint 1 — Foundation

- React-independent typed contract, validation, immutable registry và fallback chain đã có.
- Registry production có đúng một built-in `done-today-default` version 1, mode adaptive, với
  resource vi/en và scoped semantic CSS variables chỉ trong day content container.
- Migration 005 để dữ liệu cũ `NULL/NULL`; typed repository/native command ghi-clear pair atomically.
- Backup v1 không bump version: legacy fixture/checksum còn hợp lệ; explicit metadata round-trip;
  Merge dùng daily-log winner rule hiện hành; Replace/receipt/rollback và device-local locale giữ nguyên.
- Automated targeted gates đạt tại hai commit implementation `a4f3698`, `81b3276`; integration
  regressions và tài liệu implementation nằm trong `455a974`.
- Người dùng xác nhận native Windows acceptance đạt ngày 2026-07-28 cho default Day Theme trên
  Today/ngày cũ, local scope không ảnh hưởng app shell, App Theme light/dark/custom, `vi`/`en`,
  cửa sổ 900×600/default/maximize, journal table/editor/autosave/chuyển ngày và keyboard/focus.
- Accessibility evidence gồm source audit, automated tests và native keyboard/focus/visual review.
  Không tuyên bố đã kiểm tra bằng Accessibility tree hoặc screen-reader tooling.
- Day Theme Checkpoint 1 — Foundation được đánh dấu **Completed**. Toàn bộ Day Theme &
  Personalization vẫn **In progress — checkpoint complete**.
- Theme Picker, Day Cover mới, theme thứ hai, Calendar/History integration, personalization,
  theme packs và release packaging chưa bắt đầu.

## 4. I18N-1 đã hoàn thành

### I18N-1

I18N-1 đã được review ngắn và commit ngày 2026-07-23:

- Commit: `eca9f76d2e6445a353e0adf90abb7bcd65dcab46`.
- Commit message: `feat: add internationalization foundation`.
- Phạm vi: 43 file, 1.289 insertions, 7 deletions.
- `i18n:lint`: 47/47 pass trong review cuối.
- `git diff --cached --check`: pass trước commit.
- Không có Critical, Major hoặc Minor trong phạm vi review.
- Working tree sạch sau commit; chưa push tại thời điểm xác minh.

Các hardening mới không ảnh hưởng production hiện tại phải đưa vào backlog, không mở lại I18N-1.
Installer và portable không được build ở checkpoint này.

## 5. Feature sau I18N-1

Feature tiếp theo chỉ được bắt đầu khi:

- baseline vẫn bao gồm commit I18N-1 `eca9f76d`;
- task contract đã được đóng băng;
- feature được chia thành checkpoint có thể kiểm thử và commit độc lập;
- acceptance criteria và manual/visual checks đã rõ.

Day Theme & Personalization vẫn là **In progress — checkpoint complete**; Checkpoint 2 và các phase
sau không phải công việc mặc định kế tiếp nếu chưa có quyết định ưu tiên.

## 6. Release packaging

Release packaging là một giai đoạn riêng:

- rà soát accessibility và hiển thị của release candidate;
- chạy toàn bộ quality gate;
- viết/cập nhật README sử dụng;
- build Windows installer có version;
- build portable ZIP có version;
- smoke test hai artifact trên Windows, ưu tiên máy sạch khi có thể.

Không build installer hoặc portable sau mỗi feature, bug fix, review finding hay checkpoint.
