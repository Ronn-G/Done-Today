# Document Status — Done Today

**Document status:** Authoritative registry
**Document version:** 1.10
**Last verified against implementation commit:** `b219761dacf4de687c6615780c9a9d86594f43df` (2026-07-30)

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
| `00-DOCUMENT-STATUS.md` | Registry và precedence | 1.10 | `b219761` |
| `00-PROJECT-OVERVIEW.md` | Mục tiêu và phạm vi sản phẩm | 1.1 | `eca9f76d` |
| `01-PRODUCT-REQUIREMENTS.md` | Yêu cầu chức năng và tiêu chí MVP | 1.2 | `eca9f76d` |
| `02-TECHNICAL-DESIGN.md` | Kiến trúc và quy tắc kỹ thuật | 1.5 | `bcbd6b9` |
| `03-DATABASE-DESIGN.md` | Schema và quy tắc dữ liệu | 1.4 | `bcbd6b9` |
| `05-ROADMAP.md` | Trạng thái triển khai và thứ tự công việc | 2.15 | `b219761` |
| `06-APP-APPEARANCE-THEME.md` | App Theme toàn cục | 1.2 | `b219761` |
| `07-WORK-CATEGORIES.md` | Domain nhóm công việc | 1.0 | `eca9f76d` |
| `08-BACKUP-RESTORE.md` | Envelope, payload và semantics backup | 1.3 | `bcbd6b9` |
| `16-DESIGN-SYSTEM.md` | Chuẩn UI, component, token và accessibility | 1.1 | `b219761` |
| `17-DAY-THEME-AND-PERSONALIZATION.md` | Day Theme/Day Style theo từng ngày | 1.7 | `cb8d3e8` |
| `18-INTERNATIONALIZATION-AND-LOCALIZATION.md` | Kiến trúc locale, resource và presentation boundary | 1.4 | `cb8d3e8` |
| `QUY-TRINH-PHAT-TRIEN-TOI-UU-DONE-TODAY.md` | Quy trình triển khai, review, test và release | 1.1 | `eca9f76d` |

## 4. Tài liệu tham khảo

| Tài liệu | Vai trò | Last verified against implementation commit |
| --- | --- | --- |
| `audits/I18N-STRING-INVENTORY.md` | Audit/reference inventory; không ghi đè I18N architecture spec | `cb8d3e8` |

Nội dung lịch sử còn hữu ích của `04-UI-DESIGN.md` được giữ lại trong chính file đã bị thay thế,
nhưng không có quyền quyết định normative.

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

## 8. Tài liệu I18N

`18-INTERNATIONALIZATION-AND-LOCALIZATION.md` đã được đọc toàn văn, đối chiếu implementation và
đăng ký là domain architecture specification authoritative. `audits/I18N-STRING-INVENTORY.md` là
bằng chứng audit/reference: dùng để truy vết string, code và trạng thái migration nhưng không ghi
đè architecture spec, Roadmap hoặc domain docs.

Engineering Hardening Checkpoint 1 không thay đổi resource count, locale policy, stable error-code
matrix hoặc Backup v1. JournalService tái sử dụng `history.pagination_invalid`; malformed Tauri
response dùng safe fallback hiện hữu.

## 9. Day Theme Checkpoint 5

Light Personalization đã hoàn tất implementation và documentation audit ở `cb8d3e8`: đúng ba optional per-day fields
`cover_variant`, `day_symbol`, `journal_font_role`; migration 006; atomic Tauri write; Backup v1
optional-field compatibility; dialog lazy-load; Day Cover, Calendar và History integration; vi/en,
keyboard/focus và automated compatibility gates. Người dùng xác nhận native Windows acceptance
đạt ngày 2026-07-29 cho entry/dialog, Cover Theme default/Minimal, đủ bảy symbol states, đủ ba font
states, preview/rollback/reset/apply/reload, persistence theo ngày, Calendar/History, App Theme
light/dark/custom, `vi`/`en`, các kích thước 900×600/default/maximize và normal-flow regressions.
Backup smoke đạt trong phạm vi người dùng kiểm tra.

Trạng thái chuẩn: Checkpoint 1–2 Completed; Checkpoint 3–4 Completed — native Windows acceptance
passed; Checkpoint 5 Completed — native Windows acceptance passed; Checkpoint 6+ Not started. Toàn
bộ Day Theme & Personalization là **In progress — checkpoint complete**. Unknown/corrupt metadata,
stale guards, forced-colors, reduced-motion và failure/Retry paths tiếp tục dựa trên
automated/source evidence khi không được thử native trực tiếp; không tuyên bố screen reader thật,
Accessibility Tree hoặc mọi tổ hợp theme × cover × symbol × font đã được kiểm tra.

## 10. Corrective Checkpoint — App Theme Token Wiring

Implementation `b219761` sửa cascade khiến Table header bỏ qua token riêng, bị Accent tác động
gián tiếp, và sáu Today statistics tokens không tới được consumer. Mapping/schema/persistence ban
đầu đúng; root cause là `.day-theme-scope` redefine bảy specialized App Theme variables.

Automated gates đạt 51 frontend files/455 tests và 74 Rust tests; production build đạt. Schema
`ThemePreferences` vẫn version 2/33 token, key `appearance.themePreferences` và database/migration/
Backup/business rules không đổi. Trạng thái chuẩn:
**Implementation complete — native Windows acceptance pending**. Visual Fidelity/UI Polish chưa
bắt đầu và bị pause cho tới khi người dùng nghiệm thu corrective checkpoint.

## 11. Quy tắc bảo trì

Mỗi lần tài liệu thay đổi:

1. cập nhật version khi contract hoặc cấu trúc thay đổi;
2. cập nhật `Last verified against commit` bằng commit thực tế đã kiểm tra;
3. cập nhật Roadmap nếu delivery status thay đổi;
4. cập nhật registry nếu thêm, đổi tên hoặc thay thế tài liệu;
5. không ghi một feature là Completed khi thay đổi vẫn chưa commit;
6. không giữ hai ví dụ hoặc hai schema authoritative cho cùng một contract.
