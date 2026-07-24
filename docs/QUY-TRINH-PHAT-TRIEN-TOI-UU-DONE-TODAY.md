# QUY TRÌNH PHÁT TRIỂN TỐI ƯU — DONE TODAY

**Document status:** Authoritative
**Document version:** 1.1
**Last verified against commit:** `eca9f76d2e6445a353e0adf90abb7bcd65dcab46` (2026-07-23)

**Trạng thái:** Quy trình chuẩn đang áp dụng; I18N-1 đã hoàn thành tại commit `eca9f76d`
**Mục tiêu:** Giữ chất lượng cao nhưng giảm số vòng sửa, lượng token, việc chạy lại kiểm thử và rủi ro làm việc trên một working tree quá lớn.

---

## 1. Nguyên tắc điều hành

1. Mỗi thời điểm chỉ có **một task đang triển khai**.
2. Mỗi task phải được **đóng băng contract trước khi code**.
3. Task lớn phải chia thành các **vertical slice/checkpoint có thể kiểm thử và commit độc lập**.
4. Review theo rủi ro; không xử lý mọi nhận xét như lỗi nghiêm trọng.
5. Chỉ chạy full quality gate ở thời điểm có giá trị quyết định.
6. Không để nhiều chục file untracked tồn tại qua nhiều vòng review.
7. Development build và release packaging là hai giai đoạn khác nhau.
8. Yêu cầu mới phát hiện sau khi code xong phải được phân loại là:
   - defect so với contract đã chốt; hoặc
   - hardening/feature mới cho backlog.
9. Không mở rộng phạm vi trong lượt review sửa lỗi.
10. Báo cáo ngắn, có bằng chứng; không lặp lại toàn bộ prompt.

---

## 2. Nguồn sự thật và thứ tự ưu tiên

`DOCUMENT-STATUS.md` là registry authoritative cho trạng thái, version, precedence và tài liệu
đã bị thay thế. Đọc file đó trước khi lập task hoặc triển khai feature.

1. Task specification đã được chốt cho lượt hiện tại.
2. Tài liệu domain authoritative chuyên biệt được registry xác định.
3. Design System cho UI, accessibility và semantic token.
4. Technical Design và Database Design.
5. Product Requirements.
6. Project Overview.
7. Tài liệu reference/superseded chỉ dùng để tham khảo.

Nếu hai tài liệu mâu thuẫn:

- Nếu mâu thuẫn làm thay đổi dữ liệu, schema, migration, backup, hành vi người dùng hoặc kiến trúc: dừng trước khi code và yêu cầu quyết định.
- Nếu chỉ là cách diễn đạt hoặc ví dụ cũ, ưu tiên tài liệu chuyên biệt mới nhất và ghi rõ giả định trong preflight.
- Không tự kết hợp hai contract thành một contract mới.

Mỗi tài liệu chuẩn phải có metadata tối thiểu:

```text
Status: authoritative | reference | superseded
Owner:
Last verified against commit:
Supersedes:
Related documents:
```

---

## 3. Chuẩn bị task trước khi giao Codex

Mỗi task chỉ cần một file `TASK.md` hoặc một prompt ngắn có đúng các phần sau:

### 3.1. Mục tiêu

Một đến ba câu mô tả giá trị người dùng cần đạt.

### 3.2. Phạm vi

Liệt kê thành phần được phép sửa. Không liệt kê toàn bộ repository nếu không cần.

### 3.3. Ngoài phạm vi

Chỉ ghi những phần dễ bị nhầm hoặc có rủi ro bị sửa lan sang. Không lặp lại danh sách cấm chung của dự án.

### 3.4. Contract phải giữ

Chỉ ghi các invariant quan trọng như:

- schema và migration;
- transaction/rollback;
- backup compatibility;
- stable IDs;
- locale/theme persistence;
- user-entered content;
- security hoặc accessibility bắt buộc.

### 3.5. Acceptance criteria

Tối đa khoảng 5–10 điều kiện có thể quan sát hoặc kiểm thử. Mỗi điều kiện phải là tiêu chí thực sự chặn hoàn thành.

### 3.6. Verification

Chia thành:

- targeted automated tests;
- integration tests cần thiết;
- manual/visual checks;
- full gate trước checkpoint cuối.

### 3.7. Quyền Git và đầu ra

Ghi rõ cho từng task:

- có được commit hay không;
- có được push hay không;
- có cần installer/portable hay không.

Không mặc định cấm rồi lại yêu cầu Codex đoán.

---

## 4. Quy trình triển khai chuẩn

### Bước 1 — Preflight ngắn

Chạy:

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
```

Chỉ chạy baseline test nếu:

- working tree sạch và cần chứng minh baseline;
- task đụng vùng có lịch sử lỗi;
- hoặc chưa có baseline xanh gần đây.

Không chạy toàn bộ suite chỉ để bắt đầu một thay đổi nhỏ nếu đã có baseline đáng tin cậy.

### Bước 2 — Contract check

Codex tóm tắt tối đa:

- mục tiêu;
- phạm vi;
- 3–5 invariant quan trọng;
- điểm mâu thuẫn thực sự nếu có.

Nếu không có blocker, bắt đầu triển khai. Không yêu cầu một báo cáo preflight dài.

### Bước 3 — Chia checkpoint

Task chạm trên khoảng 10–15 file hoặc nhiều hơn hai lớp kiến trúc phải chia checkpoint.

Ví dụ:

```text
Checkpoint A: domain + persistence
Checkpoint B: application/runtime behavior
Checkpoint C: UI + accessibility
Checkpoint D: validators/integration gate
```

Mỗi checkpoint phải:

- có phạm vi rõ;
- chạy targeted tests;
- được review nhanh;
- commit trước khi chuyển sang checkpoint tiếp theo.

### Bước 4 — Triển khai và targeted tests

Trong lúc code chỉ chạy:

- test của module vừa sửa;
- typecheck/lint cục bộ nếu có;
- integration test trực tiếp liên quan.

Không chạy full frontend + Rust + build sau mỗi thay đổi nhỏ.

### Bước 5 — Manual/visual check đúng thời điểm

Nếu task có UI:

1. Chạy app sau khi targeted tests xanh.
2. Kiểm tra trực quan trước full suite.
3. Kiểm tra tối thiểu:
   - tương phản;
   - trạng thái hover/focus/disabled;
   - keyboard navigation;
   - text overflow;
   - kích thước cửa sổ chính;
   - light/dark hoặc theme liên quan;
   - ngôn ngữ liên quan nếu có.
4. Chụp ảnh màn hình cho reviewer khi thay đổi đáng kể.

Không dùng build pass để thay thế visual review.

### Bước 6 — Full gate một lần

Chạy full gate khi:

- checkpoint cuối đã hoàn thành;
- manual review đã xử lý xong;
- chuẩn bị commit cuối của task;
- hoặc chuẩn bị release.

Gate cụ thể phụ thuộc phạm vi:

| Phạm vi thay đổi | Gate mặc định |
|---|---|
| TypeScript logic nhỏ | targeted tests, typecheck, lint |
| Frontend feature hoàn chỉnh | full Vitest, typecheck, lint, build |
| Rust/backend | cargo test, check, fmt check, clippy |
| Database/migration/backup | frontend liên quan + toàn bộ Rust gate |
| UI/theme | frontend gate + manual visual check |
| Release | toàn bộ gate + installer/portable + clean-machine smoke test |

Nếu Rust không đổi và đã có baseline xanh gần nhất, không bắt buộc chạy lại Rust cho một sửa đổi TypeScript thuần. Báo cáo chỉ cần dẫn baseline.

### Bước 7 — Review theo rủi ro

Reviewer phải giới hạn review vào:

- contract đã chốt;
- diff của checkpoint/task;
- regression trực tiếp do thay đổi tạo ra.

Reviewer không mở rộng sang feature mới hoặc hardening giả định rồi gọi đó là defect của task.

### Bước 8 — Sửa finding có mục tiêu

Prompt sửa chỉ gồm:

1. finding cần sửa;
2. expected behavior;
3. file/phạm vi liên quan;
4. targeted regression tests;
5. gate tối thiểu cần chạy;
6. yêu cầu không mở rộng phạm vi.

Không chép lại toàn bộ đặc tả feature.

### Bước 9 — Commit checkpoint

Khi targeted gate xanh và không còn finding chặn:

```powershell
git status --short
git diff --check
git diff --stat
git add <các file đúng phạm vi>
git commit -m "<type>: <mô tả checkpoint>"
```

Sau commit:

```powershell
git status --short
git log -1 --oneline
```

Push chỉ khi task cho phép hoặc người dùng yêu cầu.

---

## 5. Phân loại finding và quyết định chặn

| Mức độ | Định nghĩa | Xử lý |
|---|---|---|
| Critical | Mất dữ liệu, lỗ hổng bảo mật nghiêm trọng, app không dùng được, migration/backup phá hỏng dữ liệu | Dừng; sửa ngay; full review phần ảnh hưởng |
| Major | Sai hành vi production chính, vi phạm contract đã chốt, regression đáng kể | Sửa trước commit; targeted review; chạy gate theo phạm vi |
| Minor — production | Lỗi nhỏ có thể xảy ra trong code/path đang dùng | Sửa nếu nhỏ; targeted test; không mở full audit |
| Minor — hardening | Edge case giả định, syntax chưa dùng, tăng độ chắc chắn của tooling/test | Đưa backlog; không mặc định chặn commit |
| Suggestion | Style, naming, refactor tùy chọn, kiến trúc tốt hơn nhưng behavior hiện tại đúng | Không chặn; chỉ làm trong task riêng |

Quy tắc:

- Chỉ Critical và Major mặc định chặn commit.
- Minor production chỉ chặn nếu ảnh hưởng hành vi hiện tại hoặc sửa rất nhỏ, rõ ràng.
- Minor hardening không được kéo dài task hiện tại nếu acceptance criteria đã đạt.
- Sau lượt sửa, reviewer chỉ xác minh finding đã giao và regression trực tiếp.
- Finding mới ngoài contract được đưa backlog, trừ khi là Critical.

---

## 6. Quy tắc review sau sửa

Review sau sửa phải ngắn và trả một trong ba kết quả:

### A. Pass

```text
Không còn Critical/Major trong phạm vi review.
Các finding được giao đã đóng.
Đủ điều kiện commit.
```

### B. Pass with backlog

```text
Không còn Critical/Major.
Có hardening/suggestion không chặn: <danh sách ngắn>.
Đủ điều kiện commit; đưa các mục trên vào backlog.
```

### C. Changes required

Chỉ dùng khi còn Critical/Major hoặc Minor production thực sự ảnh hưởng path hiện tại. Phải nêu:

- bằng chứng;
- hành vi expected/actual;
- file/vị trí;
- regression test tối thiểu.

Không yêu cầu lại toàn bộ full suite nếu finding chỉ nằm trong một validator hoặc module độc lập.

---

## 7. Chiến lược kiểm thử để giảm token và thời gian

### Trong khi triển khai

- Chạy targeted tests nhiều lần nếu cần.
- Chỉ báo tên command, số test pass/fail và lỗi gốc.
- Không dán log dài khi command pass.

### Trước checkpoint commit

- Targeted tests.
- Typecheck/lint phù hợp.
- `git diff --check`.

### Trước final task commit

- Full frontend suite nếu frontend bị ảnh hưởng.
- Full Rust suite nếu Rust/backend/schema bị ảnh hưởng.
- Build production.
- Manual visual review nếu có UI.

### Trước release

- Toàn bộ automated gate.
- Installer.
- Portable ZIP.
- Smoke test trên môi trường Windows sạch/phù hợp.
- Kiểm tra backup/restore nếu release chạm persistence.

Portable ZIP và installer **không phải đầu ra mặc định của mỗi lần sửa code**.

---

## 8. Chuẩn báo cáo tối giản

Báo cáo triển khai chỉ cần:

```text
1. Kết quả
   - Hoàn thành/chưa hoàn thành.
   - Hành vi chính đã đạt.

2. Thay đổi
   - File hoặc nhóm file.
   - Mục đích.

3. Verification
   - command: pass/fail, số test;
   - manual check: pass/fail;
   - gate không chạy và lý do.

4. Git
   - branch;
   - HEAD;
   - working tree;
   - commit/push có hay không.

5. Residual risk/backlog
   - chỉ các mục thực sự còn lại.
```

Không lặp lại:

- toàn bộ acceptance criteria;
- toàn bộ non-goals;
- danh sách file ban đầu nếu không thay đổi;
- log command đã pass;
- cùng một xác nhận ở nhiều mục.

---

## 9. Cách viết prompt Codex từ nay

Prompt chuẩn nên ngắn theo mẫu:

```text
Repository: C:\dev\done-today

Task: <mục tiêu>

Đọc:
- <TASK.md hoặc tài liệu chuyên biệt>
- <tối đa vài tài liệu trực tiếp liên quan>

Phạm vi:
- <được sửa>

Không làm:
- <chỉ các phần dễ bị sửa nhầm>

Acceptance:
1. ...
2. ...
3. ...

Verification:
- <targeted tests>
- <gate cuối cần thiết>
- <manual check nếu có>

Git:
- <có/không commit>
- <có/không push>
- <có/không packaging>

Bắt đầu bằng preflight ngắn. Nếu không có blocker thật sự, triển khai luôn.
Báo cáo theo mẫu tối giản của quy trình dự án.
```

Không lặp cùng một yêu cầu ở ba phần “yêu cầu”, “verification” và “điều kiện hoàn thành”.

---

## 10. Quy trình riêng cho tài liệu

Trước feature lớn tiếp theo, thực hiện một task tài liệu riêng:

1. Tạo `DOCUMENT-STATUS.md`.
2. Đánh dấu tài liệu authoritative/reference/superseded.
3. Đồng bộ Roadmap với trạng thái code hiện tại.
4. Xóa hoặc đánh dấu rõ ví dụ backup cũ; chỉ giữ một backup contract chính thức.
5. Phân biệt rõ:
   - App Appearance Theme;
   - Day Theme.
6. Ghi rõ tài liệu Design System mới thay thế phần màu/token cũ nào.
7. Tách development completion khỏi release packaging.
8. Thêm `Last verified against commit`.

Đây là task tài liệu, không kết hợp với feature code mới.

---

## 11. Hồ sơ kết thúc I18N-1

Kết quả đã xác minh:

- Ba finding Minor đã được sửa đúng phạm vi.
- Targeted validators/resources/LanguageSettings: 51/51 pass.
- `i18n:lint`: 47/47 pass.
- Full frontend Vitest: 169/169 pass.
- Typecheck, lint, build và `git diff --check`: pass.
- Review cuối không còn Critical/Major/Minor trong đúng ba finding.
- Rust không đổi thêm; baseline gần nhất vẫn xanh.
- I18N-1 đã được commit tại `eca9f76d2e6445a353e0adf90abb7bcd65dcab46`.
- Commit gồm 43 file; working tree sạch sau commit.

Các bước sau đây được giữ làm hồ sơ quyết định đã áp dụng:

1. Reviewer kiểm tra đúng ba regression:
   - ordinary plural-like suffix không bị false positive nhưng true orphan vẫn fail;
   - translator resolve theo lexical binding và import thật;
   - renamed-catalog regression đi qua production scanner thật.
2. Không audit lại coordinator, persistence, backup, formatter hoặc I18N-2–I18N-5.
3. Nếu không có Critical/Major:
   - kết luận đủ điều kiện commit;
   - mọi hardening mới không ảnh hưởng production hiện tại đưa backlog.
4. Commit toàn bộ I18N-1 trong một commit vì đây là working tree lịch sử chưa được chia checkpoint.
5. Không build installer hoặc portable ở bước này.
6. Sau commit, bắt đầu áp dụng checkpoint commits cho task tiếp theo.

### Tiêu chí dừng I18N-1

I18N-1 đã kết thúc vì:

- ba regression vừa sửa được reviewer xác nhận;
- quality gate hiện có vẫn xanh;
- không còn Critical/Major trong phạm vi I18N-1;
- toàn bộ file I18N-1 đã được commit tại `eca9f76d`;
- working tree đã được xác nhận sạch.

Không tiếp tục kéo dài I18N-1 vì edge case syntax chưa xuất hiện trong production.

---

## 12. Quy tắc chống lặp vòng sửa

1. Không thay acceptance criteria sau khi code bắt đầu, trừ defect rõ ràng hoặc Critical risk.
2. Không biến hardening mới thành lý do từ chối task cũ.
3. Không chạy full suite hai lần liên tiếp nếu giữa hai lần chỉ sửa test/docs không ảnh hưởng runtime; chọn gate phù hợp.
4. Không review lại vùng không đổi.
5. Không để báo cáo trở thành đặc tả mới.
6. Không giao một prompt sửa dài hơn phạm vi finding.
7. Không giữ file untracked qua nhiều feature.
8. Không build release artifact trong development task.
9. Không xem “không còn bất kỳ suggestion nào” là điều kiện commit.
10. Không hi sinh test hoặc bỏ qua lỗi thật để tiết kiệm token; tối ưu bằng phạm vi và thời điểm kiểm tra.

---

## 13. Chỉ số theo dõi hiệu quả quy trình

Sau mỗi task, ghi ngắn:

- số checkpoint/commit;
- số vòng review;
- số Critical/Major/Minor;
- số lần chạy full suite;
- số finding mới do requirement xuất hiện muộn;
- số file untracked còn lại;
- có manual visual check đúng thời điểm hay không.

Mục tiêu:

- phần lớn task chỉ cần một vòng implementation review;
- finding fix chỉ cần một targeted re-review;
- full suite thường chỉ chạy một lần trước final commit;
- working tree sạch sau mỗi checkpoint;
- hardening mới không làm trì hoãn feature đã đạt contract.
