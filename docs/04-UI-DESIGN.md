# UI Design

**Document status:** Superseded — reference only
**Document version:** 1.0
**Superseded by:** `16-DESIGN-SYSTEM.md` for all normative UI decisions
**Last verified against commit:** `eca9f76d2e6445a353e0adf90abb7bcd65dcab46` (2026-07-23)

> Tài liệu này chỉ giữ lại định hướng bố cục và cảm giác sản phẩm ban đầu. Khi có khác biệt
> về token, màu sắc, typography, spacing, component, accessibility hoặc theme compatibility,
> `16-DESIGN-SYSTEM.md` là nguồn authoritative.

## 1. Phong cách

- Tối giản.
- Hiện đại.
- Ấm áp.
- Không quá nhiều màu.
- Không tạo cảm giác như phần mềm quản lý doanh nghiệp.

## 2. Bố cục desktop

### Sidebar nhỏ

- Today.
- History.
- Settings.

Sidebar có thể thu gọn.

### Main content

- Header ngày.
- Câu gợi ý.
- Thống kê nhanh.
- Bảng nhật ký.
- Nút thêm dòng.

## 3. Bảng

- Header nền nhẹ.
- Mỗi dòng có chiều cao tối thiểu 56 px.
- Ô hỗ trợ nhiều dòng.
- Không hiển thị border đậm ở mọi ô.
- Dùng đường phân cách nhẹ.
- Hover làm nổi dòng.
- Khi focus, ô có viền accent rõ nhưng tinh tế.

Tỷ lệ cột đề xuất:

- Việc đã làm: 30%.
- Kết quả: 30%.
- Bước tiếp theo: 25%.
- Trạng thái: 12%.
- Hành động: 3% hoặc chiều rộng cố định.

## 4. Màu sắc

Không khóa cứng màu trong tài liệu. Có thể chọn một trong các hướng:

- Xanh sage.
- Xanh indigo dịu.
- Cam đất nhẹ.

Yêu cầu:

- Tương phản đủ đọc.
- Trạng thái chỉ dùng màu nền nhẹ.
- Dark mode không dùng nền đen tuyệt đối.

## 5. Typography

- Font sans-serif hiện đại.
- Ưu tiên Inter hoặc font hệ thống.
- Nội dung bảng từ 14 đến 16 px.
- Tiêu đề ngày từ 24 đến 32 px.

## 6. Micro-interactions

- Thêm dòng: fade hoặc slide nhẹ 150 đến 250 ms.
- Hoàn thành: dấu tích xuất hiện nhẹ.
- Xóa: yêu cầu xác nhận nếu dòng có nội dung.
- Autosave: hiển thị nhỏ, không dùng toast liên tục.
- Không dùng âm thanh mặc định.

## 7. Responsive

Phiên bản 1.0 ưu tiên desktop Windows.

Khi cửa sổ hẹp:

- Cho phép cuộn ngang bảng.
- Không chuyển bảng thành card phức tạp.
- Giữ khả năng chỉnh sửa trực tiếp.
