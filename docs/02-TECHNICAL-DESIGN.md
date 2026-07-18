# Technical Design

## 1. Công nghệ

- React.
- TypeScript.
- Vite.
- Tauri 2.
- SQLite.
- Tailwind CSS.
- shadcn/ui hoặc Radix UI.
- React Router.
- Zustand.
- Zod.
- Vitest.
- React Testing Library.

Không sử dụng backend server trong phiên bản đầu.

## 2. Kiến trúc thư mục

```text
src/
├── app/
│   ├── router/
│   ├── shell/
│   └── providers/
├── features/
│   ├── daily-log/
│   ├── history/
│   ├── backup/
│   └── settings/
├── domain/
│   ├── daily-log/
│   └── backup/
├── infrastructure/
│   ├── database/
│   │   ├── migrations/
│   │   ├── repositories/
│   │   └── connection/
│   ├── backup/
│   └── filesystem/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── tests/
```

## 3. Quy tắc kiến trúc

- Component React không truy vấn SQLite trực tiếp.
- UI gọi use case hoặc repository thông qua interface rõ ràng.
- Business logic phải có thể kiểm thử mà không cần render UI.
- Migrations phải có version tăng dần.
- Truy vấn SQL phải dùng parameterized query.
- Không nối chuỗi dữ liệu người dùng vào SQL.
- Các thao tác import và replace phải chạy trong transaction.
- Không lưu dữ liệu quan trọng trong localStorage.
- localStorage chỉ được dùng cho tùy chọn giao diện không quan trọng nếu cần.

## 4. State management

Zustand chỉ quản lý:

- Ngày đang xem.
- Theme.
- Trạng thái UI tạm thời.
- Toast và dialog.

Dữ liệu nhật ký phải lấy từ database và được cache có kiểm soát.

## 5. Autosave

Quy tắc:

1. Khi người dùng thay đổi ô, cập nhật UI ngay.
2. Debounce 600 ms.
3. Gọi repository để lưu.
4. Hiển thị `Saving...`.
5. Thành công hiển thị `Saved` ngắn gọn.
6. Thất bại giữ dữ liệu trên UI và cung cấp Retry.
7. Không tạo nhiều request ghi trùng nhau cho cùng một dòng.

## 6. Build

Yêu cầu đầu ra:

- Windows installer.
- Portable ZIP.
- Tên file có version.
- Không commit file build vào Git nếu không có lý do rõ ràng.
