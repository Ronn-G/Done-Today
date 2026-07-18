# Done Today

Ứng dụng nhật ký công việc hằng ngày local-first cho Windows, xây dựng bằng
Tauri 2, React, TypeScript, Vite, SQLite và Tailwind CSS.

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
