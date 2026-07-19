# Product Requirements Document

## 1. Màn hình Today

### Header

Hiển thị:

- Tên app: Done Today.
- Ngày hiện tại.
- Nút chuyển ngày trước.
- Nút chuyển ngày sau.
- Nút quay về hôm nay.
- Nút chuyển giao diện sáng hoặc tối.

### Khối động lực

Hiển thị một câu ngắn, ví dụ:

- Hôm nay bạn đã tạo ra điều gì?
- Một ngày nhỏ cũng đáng được ghi lại.
- Tiến bộ thường trông rất bình thường.
- Đừng chỉ nhớ việc đã làm, hãy ghi lại kết quả.

### Thống kê nhanh

Hiển thị:

- Tổng số việc.
- Số việc hoàn thành.
- Tỷ lệ hoàn thành.
- Chuỗi ngày có ghi nhật ký.

### Bảng nhật ký

Các cột:

1. Việc đã làm.
2. Kết quả.
3. Bước tiếp theo.
4. Trạng thái.
5. Hành động.

Bảng phải hỗ trợ:

- Chỉnh sửa trực tiếp trong ô.
- Thêm dòng mới.
- Xóa dòng.
- Thay đổi trạng thái.
- Tự động lưu sau khi người dùng dừng nhập trong khoảng 500 đến 800 ms.
- Enter ở ô cuối có thể tạo dòng mới.
- Hiển thị trạng thái đang lưu, đã lưu hoặc lỗi lưu.

## 2. Trạng thái công việc

Các giá trị hợp lệ:

- `completed`: Hoàn thành.
- `in_progress`: Đang làm.
- `postponed`: Bị hoãn.
- `cancelled`: Đã hủy.

Quy tắc giao diện:

- Hoàn thành: nền xanh nhẹ, biểu tượng dấu tích.
- Đang làm: nền xanh dương hoặc vàng nhạt.
- Bị hoãn: nền cam nhạt.
- Hủy: nền xám, chữ giảm độ nổi bật.

## 3. Màn hình History

Hiển thị danh sách các ngày đã có dữ liệu.

Mỗi dòng gồm:

- Ngày.
- Tổng số việc.
- Số việc hoàn thành.
- Tỷ lệ hoàn thành.

Chức năng:

- Bấm vào một ngày để mở bảng ngày đó.
- Phân trang, mặc định mới nhất trước.
- Tìm kiếm và tùy chọn sắp xếp được để dành cho sprint sau.

## 4. Màn hình Settings

Bao gồm:

- Light mode, dark mode hoặc theo hệ thống.
- Chọn màu chủ đạo nếu dễ triển khai.
- Export backup.
- Import backup.
- Xem phiên bản ứng dụng.
- Xem vị trí thư mục dữ liệu.

## 5. Backup

### Export

- Xuất dữ liệu thành file JSON UTF-8.
- File chứa metadata, version và dữ liệu nhật ký.
- Không chứa đường dẫn tuyệt đối của máy.

### Import

- Kiểm tra cấu trúc file trước khi nhập.
- Hiển thị số ngày và số dòng sẽ được nhập.
- Hỗ trợ Replace all trong MVP.
- Toàn bộ thao tác phải chạy trong transaction.
- Nếu lỗi, database phải giữ nguyên.

## 6. Trải nghiệm sử dụng

- App mở nhanh.
- Mở app vào thẳng ngày hôm nay.
- Không xuất hiện màn hình chào mừng dài.
- Không cần bấm nút Save thủ công.
- Mọi thao tác thường dùng thực hiện được trong một hoặc hai lần bấm.
- Giao diện không giống bảng Excel thô.
- Bảng cần có khoảng trắng, bo góc và hiệu ứng hover nhẹ.

## 7. Tiêu chí hoàn thành MVP

MVP được coi là hoàn thành khi:

1. Có thể tạo nhiều dòng cho một ngày.
2. Đóng và mở lại app không mất dữ liệu.
3. Có thể chỉnh sửa trực tiếp tất cả nội dung.
4. Có thể xem lại dữ liệu của ngày cũ.
5. Thanh tiến độ tính đúng.
6. Chuỗi ngày tính đúng.
7. Import lỗi không làm hỏng dữ liệu.
8. Có test cho migration và repository chính.
9. Build được bản cài đặt Windows.
10. Build được bản portable.
