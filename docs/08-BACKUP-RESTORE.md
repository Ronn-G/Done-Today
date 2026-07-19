# Backup và restore

## Envelope v1

Định dạng chính là JSON UTF-8 độc lập với SQLite:

```json
{"format":"done-today-backup","version":1,"exportedAt":"2026-07-19T00:00:00Z","appVersion":"0.1.0","payload":{"dailyLogs":[],"workItems":[],"workCategories":[],"themePreferences":null},"checksum":"sha256:..."}
```

Version backup không phụ thuộc migration database. Bộ đọc xác định phiên bản envelope trước rồi
normalize về model import; adapter phiên bản sau có thể được thêm mà không đổi v1.

## Canonical checksum

SHA-256 được tính trên payload, không gồm checksum. Object key được sắp theo tên; daily log theo
`logDate,id`, work item theo `dailyLogId,position,id`, category theo `position,id`. Chuỗi canonical
không có whitespace và được băm dạng UTF-8 nên thứ tự object đầu vào và line ending file không ảnh hưởng.

## Phạm vi

Bao gồm daily log, work item, category và theme theo allow-list. Không gồm database/path app-data,
receipt, seed metadata, route, vị trí cửa sổ/panel, trạng thái thu gọn, autosave tạm, cache, log,
artifact, OS hay biến môi trường.

## Export, validate và preview

Backend đọc snapshot trong read transaction, validate, tạo envelope/checksum rồi ghi bằng file tạm,
flush + fsync và rename. Native dialog quyết định đường dẫn; đóng dialog là hủy yên lặng.

File import tối đa 20 MiB. Backend kiểm tra JSON, format/version, field/enum/date/timestamp, màu
`#RRGGBB`, ID/date unique, tham chiếu, theme và checksum. Preview không ghi database, dùng cùng planner
với import; import chạy planner lại trong transaction để tránh preview cũ.

## Merge

- Log mới giữ ID. Cùng `logDate` nhưng ID khác dùng log hiện tại và remap item. Cùng ID nhưng ngày khác
  bị từ chối.
- Work item tương đương là no-op. Cùng ID nhưng khác nội dung nhận UUID mới và giữ cả hai.
- Category tương đương là no-op. Cùng ID nhưng khác nội dung nhận UUID mới và item được remap. Không tự
  merge chỉ vì trùng tên.
- Theme hiện tại được giữ trừ khi người dùng chọn áp dụng theme từ backup.

## Replace all

UI yêu cầu xác nhận rõ. Một transaction xóa item, log, category và custom theme theo thứ tự khóa ngoại,
sau đó chèn snapshot với ID gốc. Theme null xóa custom theme để dùng mặc định. Schema/migration metadata
không bị xóa. Mọi lỗi đều rollback.

## Receipt, consistency và riêng tư

Migration 004 tạo `backup_import_receipts` và index checksum. Receipt chỉ ghi trong transaction thành
công, không export. Preview cảnh báo file từng nhập và yêu cầu xác nhận nếu nhập lại.

UI flush journal/theme saves trước export/import. Sau import, journal, category, History và theme được
invalidate/nạp lại. Boundary lỗi không trả SQL, stack hoặc database path.

Backup không mã hóa, không upload và không telemetry. File có thể chứa nội dung cá nhân; hãy lưu an toàn.
