# Done Today

Ứng dụng nhật ký công việc hằng ngày local-first cho Windows, xây dựng bằng
Tauri 2, React, TypeScript, Vite, SQLite và Tailwind CSS.

## Chức năng hiện có

- Bảng chỉnh sửa trực tiếp với autosave, trạng thái lưu và thử lại khi lỗi.
- Thêm, sửa, xóa, đổi trạng thái và sắp xếp dòng.
- Điều hướng ngày trước/sau, chọn ngày và quay về hôm nay.
- Route theo ngày, hỗ trợ back/forward và giữ ngày khi refresh.
- Lịch sử tổng hợp, phân trang 20 ngày và mở lại ngày cũ để chỉnh sửa.
- Light, dark và system theme.

## Phím tắt

- `Tab` / `Shift + Tab`: chuyển giữa các ô theo thứ tự chuẩn.
- `Ctrl + Enter`: thêm dòng mới.
- `Escape`: bỏ focus khỏi ô đang nhập mà không xóa nội dung.

## Yêu cầu môi trường

- Node.js 20 trở lên và npm.
- Rust stable với Cargo.
- Windows: Microsoft C++ Build Tools và WebView2.

## Cài đặt

```powershell
npm install
```

## Phát triển

Chạy giao diện trong trình duyệt:

```powershell
npm run dev
```

Chạy ứng dụng desktop (SQLite chỉ khả dụng trong Tauri):

```powershell
npm run tauri dev
```

Database được tạo tại thư mục application data do Tauri cung cấp, với tên
`done-today.sqlite3`. Bản debug tự tạo đúng một dòng mẫu cho ngày hiện tại nếu
ngày đó chưa có dữ liệu.

## Kiểm tra

```powershell
npm run typecheck
npm run lint
npm run test:run
cargo test --manifest-path ./src-tauri/Cargo.toml
```

## Build

Frontend:

```powershell
npm run build
```

Ứng dụng Windows:

```powershell
npm run tauri build
```

Artifact Tauri nằm trong `src-tauri/target/release/bundle/`.
