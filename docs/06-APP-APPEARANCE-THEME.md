# App Appearance Theme

**Document status:** Authoritative
**Document version:** 1.2
**Last verified against commit:** `b219761dacf4de687c6615780c9a9d86594f43df` (2026-07-30)

## Phạm vi và quan hệ với Day Theme

Tài liệu này định nghĩa **App Theme** toàn cục: app shell, sidebar, navigation, dialog,
toast, nền toàn ứng dụng, light/dark mode và các semantic token dùng chung. App Theme
giữ nguyên khi người dùng chuyển giữa các ngày.

`17-DAY-THEME-AND-PERSONALIZATION.md` định nghĩa **Day Theme** gắn với một `daily_log`.
Day Theme chỉ được áp dụng bên trong day content container và không được ghi đè app shell,
navigation, dialog, toast hoặc global accessibility.

Quan hệ authoritative:

- `16-DESIGN-SYSTEM.md`: semantic design language và accessibility chung.
- Tài liệu 06 này: App Theme và `ThemePreferences` lưu trong `app_settings`.
- `17-DAY-THEME-AND-PERSONALIZATION.md`: Day Theme/Day Style lưu theo từng ngày.

Tên preset có thể trùng giữa App Theme và Day Theme nhưng không cùng identity, scope hoặc
persistence. Code và tài liệu phải luôn ghi rõ `App Theme` hay `Day Theme`, không dùng từ
`Theme` đơn lẻ khi quyết định có thể gây nhầm.

## Kiến trúc

App Theme là domain typed độc lập với React. `ThemePreferences` schema version 2 chứa preset
đang chọn, hai bảng màu light/dark, mức bo góc và thời điểm cập nhật. UI gọi application
coordinator, coordinator gọi `ThemeRepository`, implementation Tauri gọi command typed
và lưu JSON vào SQLite.

## Lưu trữ

- Bảng: `app_settings`, tạo bởi migration `002_app_settings.sql`.
- Key: `appearance.themePreferences`.
- Ghi bằng upsert parameterized.
- Frontend kiểm tra bằng Zod; Rust kiểm tra schema version, đầy đủ 33 token, độ dài JSON
  và định dạng `#RRGGBB`.

## An toàn

Input chỉ nhận `#RGB` hoặc `#RRGGBB`; dạng ngắn được chuẩn hóa. Tên CSS variable lấy từ
whitelist trong source code, không lấy từ input. Theme lỗi hoặc phiên bản lạ fallback về
Done Today và không làm ứng dụng crash.

## Preset

Done Today, Forest, Ocean, Lavender, Warm Sand và Monochrome là constants immutable.
Chỉnh một token tạo theme `custom` mà không mutate preset.

Schema v1 được nâng tự động lên v2: sáu token stats panel được suy ra từ card, border,
primary/secondary text, progress track và accent cũ. Các màu tùy chỉnh còn lại được giữ nguyên.

Stats panel có background, border, primary/secondary text, progress track và progress fill
riêng. Sidebar mặc định dùng surface xanh xám sáng/dịu hơn để main content giữ vai trò trọng tâm.

## Semantic ownership và CSS variables

Mỗi persisted color key map một-một qua whitelist typed sang một semantic CSS variable. Component
chỉ consume variable, không đọc `ThemePreferences` hoặc preset ID trực tiếp.

Các token dễ nhầm có mapping và ownership bắt buộc:

| App Theme token | CSS variable | Surface owner |
| --- | --- | --- |
| `accent` | `--accent` | focus/accent indicators, active/selected emphasis và các bề mặt general accent |
| `tableHeaderBackground` | `--bg-table-header` | nền `thead th`; độc lập với Accent |
| `statsPanelBackground` | `--stats-bg` | nền Today statistics |
| `statsPanelBorder` | `--stats-border` | viền panel và divider Today statistics |
| `statsPanelPrimaryText` | `--stats-text-primary` | số/giá trị chính |
| `statsPanelSecondaryText` | `--stats-text-secondary` | label/supporting text |
| `statsPanelProgressTrack` | `--stats-progress-track` | progress track trong Today statistics |
| `statsPanelProgressFill` | `--stats-progress-fill` | progress fill trong Today statistics |

Specialized token luôn thắng generic token: Table header không alias sang Accent; sáu Stats token
không alias runtime sang Card, Border, generic text, generic progress track hoặc Accent. Alias từ
generic token chỉ được dùng một lần trong chính sách nâng schema v1 lên v2 để tạo giá trị persisted
ban đầu.

Day Theme có thể đổi page, journal surface/text/border/accent và editor interaction trong
`.day-theme-scope`, nhưng không được redefine `--bg-table-header` hoặc sáu `--stats-*` variables.
Các specialized App Theme variables phải được inherit vào Today để giữ ownership toàn cục.

Khi chỉnh màu, draft typed cập nhật React state và active light/dark palette được apply ngay để
preview. Cùng payload v2 đầy đủ được autosave vào `appearance.themePreferences`; bootstrap/reload
validate rồi apply lại. Chọn preset/reset tạo palette mới từ immutable constants; chỉnh một token
tạo `custom` và không mutate preset hoặc token còn lại.
