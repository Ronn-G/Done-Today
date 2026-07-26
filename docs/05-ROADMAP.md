# Roadmap

**Document status:** Authoritative for delivery status
**Document version:** 2.3
**Last verified against baseline commit:** `c0f56fd7c88a980e3c7bc71575020146d4c7f7dc` (2026-07-26)

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
| Day Theme & Personalization | Specified | Tài liệu 17 đã có; không được suy ra là implementation đã hoàn thành |
| I18N-1 | Completed | Commit `eca9f76d`; 43 file, review cuối không có blocking finding, working tree sạch |
| I18N-2 | Completed | App shell + Today đã hoàn tất workflow `vi`/`en` qua bốn checkpoint; stable domain values và dữ liệu người dùng không đổi |
| I18N-3 | Completed | History, Settings shell + Categories và toàn bộ App Theme customization đã hoàn tất workflow `vi`/`en` qua bốn checkpoint; checkpoint 4 khép lại Custom colors + Floating Theme Customizer |
| I18N-4 | In progress — checkpoint complete | Checkpoint 1 hoàn tất Backup/Restore presentation; checkpoint 2 hoàn tất structured Rust errors/warnings và typed exhaustive frontend mapping cho `vi`/`en`; native Windows/accessibility acceptance cuối còn lại |
| I18N-5 | Planned | Fresh-install detection và backup preference policy chỉ thực hiện sau quyết định contract riêng |
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

Day Theme vẫn là **Specified**, không phải feature mặc định kế tiếp nếu chưa có quyết định ưu tiên.

## 6. Release packaging

Release packaging là một giai đoạn riêng:

- rà soát accessibility và hiển thị của release candidate;
- chạy toàn bộ quality gate;
- viết/cập nhật README sử dụng;
- build Windows installer có version;
- build portable ZIP có version;
- smoke test hai artifact trên Windows, ưu tiên máy sạch khi có thể.

Không build installer hoặc portable sau mỗi feature, bug fix, review finding hay checkpoint.
