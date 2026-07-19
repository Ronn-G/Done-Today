# Roadmap

> Ghi chú triển khai: các lượt phát triển sau foundation được tách chi tiết hơn.
> CRUD/autosave và điều hướng/history hiện đã hoàn thành. Backup vẫn thuộc sprint
> sau và chưa được triển khai.

## Sprint Backup/Restore — hoàn thành

- Backup JSON v1 có canonical SHA-256.
- Export atomic, preview dry-run, Merge và Replace all trong transaction.
- Receipt chống nhập nhầm lặp lại và UI xác nhận an toàn.

## Sprint 0 — Foundation

- Khởi tạo React, TypeScript, Vite và Tauri.
- Thiết lập ESLint, Prettier và Vitest.
- Tạo App Shell và routing.
- Tạo database connection.
- Tạo migration runner.
- Viết test migration.

Điều kiện hoàn thành:

- App mở được.
- Database được tạo tự động.
- Migration chạy đúng khi mở app nhiều lần.

## Sprint 1 — Daily Table

- Tạo màn hình Today.
- Tạo hoặc lấy daily log theo ngày.
- Thêm work item.
- Sửa trực tiếp trong bảng.
- Xóa work item.
- Thay đổi trạng thái.
- Autosave.

Điều kiện hoàn thành:

- Đóng và mở lại app không mất dữ liệu.
- Không có thao tác Save thủ công.

## Sprint 2 — Navigation and History

- Chuyển ngày trước và sau.
- Nút Today.
- Màn hình History.
- Thống kê số việc và số hoàn thành theo ngày.

Trạng thái: hoàn thành, bao gồm route theo ngày và phân trang lịch sử.

## Sprint 3 — Motivation UI

- Thanh tiến độ.
- Chuỗi ngày ghi nhật ký.
- Câu gợi ý theo ngày.
- Light mode và dark mode.
- Hoàn thiện animation và empty state.

## Sprint 4 — Backup

- Export JSON.
- Validate file import.
- Preview dữ liệu.
- Replace all trong transaction.
- Test rollback khi lỗi.

## Sprint 5 — Release

- Rà soát accessibility.
- Rà soát lỗi hiển thị.
- Viết README sử dụng.
- Build installer.
- Build portable ZIP.
- Kiểm thử trên máy Windows sạch nếu có thể.

## Sprint — Nhóm công việc

- Quản lý nhóm, màu, archive và thứ tự.
- Section nhóm trong bảng Hôm nay.
- Completed bucket ở cuối từng nhóm và reorder trong bucket.

Trạng thái: đã triển khai.
