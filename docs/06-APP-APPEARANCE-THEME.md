# App Appearance Theme

**Document status:** Authoritative
**Document version:** 1.1
**Last verified against commit:** `eca9f76d2e6445a353e0adf90abb7bcd65dcab46` (2026-07-23)

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
