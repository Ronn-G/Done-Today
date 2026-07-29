# Technical Design

**Document status:** Authoritative
**Document version:** 1.2
**Last verified against implementation commit:** `9243c5b36f2093e52fdf7ca63cf06084d75ca0e1` (2026-07-29)

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

## 6. Development completion

Một development task được coi là hoàn tất khi đạt đúng acceptance criteria của task và các
quality gate theo phạm vi, thường gồm targeted tests, full frontend tests trước final commit,
typecheck, lint, development build và kiểm tra thủ công/visual khi có thay đổi UI.

Development completion không mặc định yêu cầu tạo installer hoặc portable ZIP.

## 7. Engineering quality boundary

- `tsconfig.app.json` và `tsconfig.node.json` phải bật TypeScript `strict`; không dùng suppression
  để làm gate đi qua.
- Mọi phản hồi từ Tauri `invoke` phải được kiểm tra runtime bằng schema tại infrastructure
  boundary. Generic type argument hoặc type assertion không phải runtime validation.
- Schema phản hồi phải mô tả rõ record, array, nullable và void. Phản hồi sai contract được chuẩn
  hóa thành lỗi `unknown` an toàn; diagnostics development chỉ được ghi command và issue
  code/path, không ghi args, payload, SQL hay đường dẫn nhạy cảm.
- Application/domain phát sinh lỗi có khả năng tới UI bằng structured error code và scalar params.
  Presentation boundary chịu trách nhiệm dịch; không ném raw Vietnamese user-facing error.
- Gate canonical cho frontend là `format:check`, `i18n:lint`, `typecheck`, `lint`, `test:run` và
  `build`. Gate Rust là `cargo fmt --all -- --check`,
  `cargo clippy --all-targets --all-features -- -D warnings` và
  `cargo test --all-targets --all-features`.
- Prettier quản lý source/config/workflow được liệt kê trong `package.json`; lockfile, migration,
  backup fixture, generated output và motif asset được loại trừ để tránh thay đổi contract hoặc
  dữ liệu kiểm thử ngoài ý muốn. Text files dùng canonical LF, được enforce nhất quán qua
  `.gitattributes` và Prettier `endOfLine`.
- `.github/workflows/ci.yml` chạy cùng các gate trên Windows. Initial remote run thất bại ở frontend
  formatting do checkout CRLF khi repository chưa có line-ending policy; fix đã được kiểm tra ở
  local và clean checkout, còn next remote run pending push.

## 8. Release packaging

Release packaging là gate riêng, chỉ chạy khi chuẩn bị phát hành hoặc prompt yêu cầu rõ:

- Windows installer.
- Portable ZIP.
- Tên artifact có version.
- Smoke test artifact trên Windows; ưu tiên máy sạch khi có thể.
- Không commit file build vào Git nếu không có lý do rõ ràng.

Chi tiết quy trình và mức gate xem
`QUY-TRINH-PHAT-TRIEN-TOI-UU-DONE-TODAY.md`.
