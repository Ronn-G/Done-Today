# Prompt triển khai Done Today

Bạn là kỹ sư phần mềm chính chịu trách nhiệm triển khai ứng dụng desktop Windows tên **Done Today**.

Hãy đọc toàn bộ tài liệu trong thư mục dự án trước khi chỉnh sửa code, đặc biệt:

- `00-PROJECT-OVERVIEW.md`
- `01-PRODUCT-REQUIREMENTS.md`
- `02-TECHNICAL-DESIGN.md`
- `03-DATABASE-DESIGN.md`
- `04-UI-DESIGN.md`
- `05-ROADMAP.md`

## Mục tiêu

Xây dựng ứng dụng desktop local-first dạng bảng để người dùng ghi lại hằng ngày:

- Việc đã làm.
- Kết quả.
- Bước tiếp theo.
- Trạng thái.

Ứng dụng phải đẹp, nhanh, dễ nhập liệu, không yêu cầu tài khoản và không phụ thuộc Internet.

## Công nghệ bắt buộc

- React.
- TypeScript strict mode.
- Vite.
- Tauri 2.
- SQLite.
- Tailwind CSS.
- Zod.
- Vitest.

Có thể dùng shadcn/ui, Radix UI và Zustand khi thực sự cần.

## Nguyên tắc triển khai

1. Không tự ý mở rộng phạm vi ngoài tài liệu.
2. UI không được truy vấn SQLite trực tiếp.
3. Tất cả truy vấn SQL phải dùng parameterized query.
4. Migration phải idempotent và có test.
5. Autosave phải debounce và xử lý lỗi rõ ràng.
6. Không làm mất dữ liệu khi app bị đóng hoặc thao tác import thất bại.
7. Không lưu dữ liệu nhật ký quan trọng trong localStorage.
8. Không để warning TypeScript, ESLint hoặc test thất bại.
9. Giao diện phải có empty state, loading state và error state.
10. Không tuyên bố hoàn thành nếu chưa chạy kiểm tra thực tế.

## Quy trình làm việc

Thực hiện từng sprint trong `05-ROADMAP.md`.

Trước mỗi sprint:

- Kiểm tra Git status.
- Ghi lại branch và commit hiện tại.
- Đọc tài liệu liên quan.
- Nêu ngắn gọn kế hoạch triển khai.

Sau mỗi sprint:

- Chạy typecheck.
- Chạy lint.
- Chạy test.
- Chạy build frontend.
- Chạy kiểm tra Tauri phù hợp.
- Tóm tắt file đã thay đổi.
- Đối chiếu từng điều kiện nghiệm thu.
- Nêu rõ phần chưa hoàn thành hoặc rủi ro còn lại.
- Không tự commit nếu chưa được yêu cầu.

## Yêu cầu cho bản phát hành

Khi hoàn tất Sprint 5:

- Build Windows installer.
- Tạo bản portable ZIP.
- Gắn version rõ ràng vào tên file.
- Ghi lại chính xác đường dẫn file build.
- Không chỉ build frontend rồi gọi đó là bản portable.

## Nhiệm vụ đầu tiên

Bắt đầu từ Sprint 0.

Hãy:

1. Kiểm tra repository hiện tại.
2. Nếu repository trống, khởi tạo cấu trúc dự án phù hợp.
3. Thiết lập React, TypeScript, Vite và Tauri 2.
4. Thiết lập SQLite và migration runner.
5. Tạo migration đầu tiên theo `03-DATABASE-DESIGN.md`.
6. Viết test cho migration.
7. Tạo App Shell tối thiểu với ba mục Today, History và Settings.
8. Chạy toàn bộ kiểm tra.
9. Báo cáo kết quả theo từng điều kiện nghiệm thu của Sprint 0.

Không chuyển sang Sprint 1 trong cùng lượt trừ khi tôi yêu cầu.
