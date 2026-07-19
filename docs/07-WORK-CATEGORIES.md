# Nhóm công việc

## Mô hình dữ liệu

`work_categories` lưu tên, màu HEX, thứ tự, trạng thái active và timestamps. `work_items.category_id`
là khóa ngoại nullable, dùng `ON DELETE SET NULL`. Migration `003_work_categories.sql` chỉ bổ sung
schema; dữ liệu cũ giữ nguyên nội dung, trạng thái, vị trí và có `category_id = NULL`.

`category_id = NULL` được hiển thị dưới nhóm ảo **Việc khác**. Nhóm này không phải record trong
SQLite, vì vậy dữ liệu cũ không cần được phân loại hoặc ghi lại.

## Active và archive

Ẩn nhóm đặt `is_active = 0`, không xóa cứng. Nhóm inactive không xuất hiện trong lựa chọn cho item
mới, nhưng vẫn hiện đúng tên trong các ngày đang có item thuộc nhóm đó. First run tạo ba nhóm:
Công việc cơ quan, Dự án cá nhân và Học tập; seed chỉ chạy khi chưa có category nào.

## Thứ tự và bucket

Section active theo `category.position`, sau đó là inactive đang được dùng, cuối cùng là Việc khác.
Trong mỗi section, non-completed (`in_progress`, `postponed`, `cancelled`) đứng trước `completed`.
Mỗi bucket giữ `position` riêng. Khi status đi qua ranh giới completed, item nhận position cuối bucket
đích. Reorder chỉ nhận toàn bộ ID trong cùng daily log, category và completed bucket.

## UI state

Collapse là tùy chọn cục bộ schema version 1 trong `localStorage`, keyed theo category ID; ID không
còn tồn tại được bỏ qua. Đây không phải journal data và không nằm trong SQLite.
