# Theme customization

## Kiến trúc

Theme là domain typed độc lập với React. `ThemePreferences` schema version 2 chứa preset
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
