# Document Status — Done Today

**Document status:** Authoritative registry
**Document version:** 1.2
**Last verified against commit:** `eca9f76d2e6445a353e0adf90abb7bcd65dcab46` (2026-07-23)

## 1. Mục đích

Tài liệu này là điểm vào đầu tiên khi đọc bộ tài liệu Done Today. Nó xác định tài liệu nào
được dùng làm nguồn authoritative, tài liệu nào chỉ để tham khảo, tài liệu nào đã bị thay thế,
và baseline commit gần nhất được dùng để đối chiếu.

`Last verified against commit` có nghĩa là tài liệu đã được đồng bộ với trạng thái được biết tại
commit đó. Nó không có nghĩa mọi dòng đã được code-audit trong lượt cập nhật tài liệu. Mọi thay đổi
trong working tree sau commit phải được ghi riêng trong Roadmap và không được mô tả như đã có trong
baseline.

## 2. Thứ tự ưu tiên

Khi tài liệu mâu thuẫn, áp dụng thứ tự sau:

1. Task contract/acceptance criteria đã được product owner chốt cho checkpoint hiện tại.
2. Tài liệu domain authoritative chuyên biệt.
3. `16-DESIGN-SYSTEM.md` cho quyết định UI, accessibility và semantic token.
4. Product Requirements và Technical Design.
5. Project Overview.
6. Tài liệu reference hoặc superseded chỉ dùng để hiểu lịch sử/ý tưởng.

Nếu hai tài liệu authoritative cùng cấp vẫn mâu thuẫn, dừng phần bị ảnh hưởng và yêu cầu làm rõ.
Không dùng tài liệu reference để ghi đè tài liệu authoritative.

## 3. Tài liệu authoritative

| Tài liệu canonical | Vai trò | Version | Last verified against commit |
| --- | --- | ---: | --- |
| `00-DOCUMENT-STATUS.md` | Registry và precedence | 1.2 | `eca9f76d` |
| `00-PROJECT-OVERVIEW.md` | Mục tiêu và phạm vi sản phẩm | 1.1 | `eca9f76d` |
| `01-PRODUCT-REQUIREMENTS.md` | Yêu cầu chức năng và tiêu chí MVP | 1.2 | `eca9f76d` |
| `02-TECHNICAL-DESIGN.md` | Kiến trúc và quy tắc kỹ thuật | 1.1 | `eca9f76d` |
| `03-DATABASE-DESIGN.md` | Schema và quy tắc dữ liệu | 1.1 | `eca9f76d` |
| `05-ROADMAP.md` | Trạng thái triển khai và thứ tự công việc | 2.2 | `eca9f76d` |
| `06-APP-APPEARANCE-THEME.md` | App Theme toàn cục | 1.1 | `eca9f76d` |
| `07-WORK-CATEGORIES.md` | Domain nhóm công việc | 1.0 | `eca9f76d` |
| `08-BACKUP-RESTORE.md` | Envelope, payload và semantics backup | 1.0 | `eca9f76d` |
| `16-DESIGN-SYSTEM.md` | Chuẩn UI, component, token và accessibility | 1.0 | `eca9f76d` |
| `17-DAY-THEME-AND-PERSONALIZATION.md` | Day Theme/Day Style theo từng ngày | 1.0 | `eca9f76d` |
| `QUY-TRINH-PHAT-TRIEN-TOI-UU-DONE-TODAY.md` | Quy trình triển khai, review, test và release | 1.1 | `eca9f76d` |

## 4. Tài liệu tham khảo

Hiện không có tài liệu reference độc lập trong bộ Phase 1. Nội dung lịch sử còn hữu ích của
`04-UI-DESIGN.md` được giữ lại trong chính file đã bị thay thế, nhưng không có quyền quyết định
normative.

## 5. Tài liệu và tên đã bị thay thế

| Tài liệu/tên cũ | Thay bằng | Quy tắc |
| --- | --- | --- |
| `04-UI-DESIGN.md` | `16-DESIGN-SYSTEM.md` | Chỉ tham khảo định hướng bố cục/cảm giác ban đầu |
| `06-THEME-CUSTOMIZATION.md` | `06-APP-APPEARANCE-THEME.md` | Tên cũ không phân biệt App Theme với Day Theme |
| Ví dụ JSON backup trong `03-DATABASE-DESIGN.md` | `08-BACKUP-RESTORE.md` | Không sao chép schema backup sang tài liệu database |
| “Sprint 4 — Backup” cũ trong Roadmap | Mục trạng thái Backup/Restore v1 hiện hành | Backup đã hoàn thành, không còn là sprint tương lai |
| Installer/portable như development completion | Release packaging gate | Không build artifact release sau mỗi task |

## 6. Quan hệ App Theme và Day Theme

| Khía cạnh | App Theme | Day Theme |
| --- | --- | --- |
| Nguồn authoritative | `06-APP-APPEARANCE-THEME.md` | `17-DAY-THEME-AND-PERSONALIZATION.md` |
| Scope | Toàn ứng dụng và app shell | Day content container của một ngày |
| Persistence | `app_settings` / `ThemePreferences` | Metadata gắn với `daily_log` |
| Thay đổi khi chuyển ngày | Không | Có thể |
| Được đổi navigation/dialog/toast | Có, qua semantic token chung | Không |
| Design language | `16-DESIGN-SYSTEM.md` | `16-DESIGN-SYSTEM.md` |

Tên preset trùng nhau không có nghĩa là cùng identity. Mọi task, code review và migration phải ghi
rõ `App Theme` hay `Day Theme`.

## 7. Development completion và release packaging

- **Development completion:** acceptance criteria của task, targeted tests, full gate theo phạm vi
  trước final commit, và manual/visual check khi cần.
- **Release packaging:** toàn bộ release gate, installer, portable ZIP và smoke test artifact.

Release packaging chỉ chạy khi chuẩn bị phát hành hoặc có yêu cầu rõ. Nó không phải đầu ra mặc định
của feature, bug fix, review finding hoặc checkpoint.

## 8. Tài liệu I18N ngoài bộ 13 file này

`18-INTERNATIONALIZATION-AND-LOCALIZATION.md` và `I18N-STRING-INVENTORY.md` đã được nhắc trong
quy trình I18N nhưng không có trong tập file được cung cấp cho lượt làm sạch này. I18N-1 đã được
commit tại `eca9f76d2e6445a353e0adf90abb7bcd65dcab46`; điều này không tự xác minh toàn văn hai tài
liệu I18N. Không chỉnh sửa hoặc suy diễn nội dung của chúng trong bộ 13 file này. Khi đưa chúng
vào registry:

1. đọc toàn văn;
2. phân loại authoritative/reference;
3. ghi version và `Last verified against commit`;
4. kiểm tra mâu thuẫn với Roadmap và các domain docs;
5. cập nhật bảng authoritative ở trên trong cùng thay đổi.

## 9. Quy tắc bảo trì

Mỗi lần tài liệu thay đổi:

1. cập nhật version khi contract hoặc cấu trúc thay đổi;
2. cập nhật `Last verified against commit` bằng commit thực tế đã kiểm tra;
3. cập nhật Roadmap nếu delivery status thay đổi;
4. cập nhật registry nếu thêm, đổi tên hoặc thay thế tài liệu;
5. không ghi một feature là Completed khi thay đổi vẫn chưa commit;
6. không giữ hai ví dụ hoặc hai schema authoritative cho cùng một contract.
