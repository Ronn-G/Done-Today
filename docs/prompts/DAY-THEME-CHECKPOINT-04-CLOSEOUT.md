DONE TODAY — DAY THEME CHECKPOINT 4 CLOSEOUT

Bạn đang chạy trong Codex Desktop trên Windows và phải làm việc trực tiếp trong repository chính:

C:\dev\done-today

Mục tiêu duy nhất của nhiệm vụ này:

Ghi nhận native Windows acceptance của:

Day Theme Checkpoint 4 — Calendar & History

Cập nhật tài liệu canonical và worklog từ trạng thái:

Implementation complete — native Windows acceptance pending

thành:

Completed — native Windows acceptance passed

Tạo các commit tài liệu nhỏ, rõ ràng.

Không sửa source code, test, workflow, dependency, database hoặc business rule.

Không bắt đầu Checkpoint 5.

Không push.

1. Trạng thái implementation đã biết

Repository chính:

C:\dev\done-today

Branch:

master

Baseline trước Checkpoint 4:

b27476c0f03a76185b3641ca274f0ed67e99a706
docs: record initial CI success

Các commit Checkpoint 4:

119f5fdac8640d9b2651ba166c16f81afd572ee1
docs: record day theme checkpoint 4 task

10bac7c9a49897cdee2d2e1c4915da0605ecf5fc
feat: add day theme calendar summaries

d9cc0db049fe3f4bd3af7f9fa33d2c1517e02fa2
feat: show day themes in calendar and history

24b821bf7dfb6f1b21ee133e1050f36573875028
test: verify day theme calendar and history compatibility

d7cf6ca291ec52da01150fb79545f1b2e830412c
docs: record day theme checkpoint 4 implementation

Implementation đã được xác minh trước native acceptance:

Format:
pass

I18N:
2 files, 48 tests

Typecheck:
pass

ESLint:
pass

Frontend:
47 files, 420 tests

Production build:
pass, 1,739 modules

Cargo format:
pass

Cargo clippy -D warnings:
pass

Rust:
70 tests

git diff --check:
pass

Working tree:
clean

Các contract đã được giữ nguyên:

không migration mới;

không dependency mới;

không đổi database schema;

không đổi Backup v1;

không đổi canonical checksum;

không đổi Merge/Replace/receipt;

không đổi App Theme light/dark/custom;

không đổi Day Theme Picker;

không đổi Default NULL/NULL;

không đổi minimal daily-log creation;

không đổi autosave/editor save queue;

không đổi Work Categories;

không đổi status/statistics/reorder;

không đổi History pagination;

không tạo installer, portable hoặc release artifact.

2. Native Windows acceptance do người dùng xác nhận

Người dùng đã chạy ứng dụng native trên Windows và xác nhận:

Đã test ổn.

Ngày ghi nhận:

2026-07-29

Native acceptance được phép ghi nhận cho các hành vi thông thường trong checklist Checkpoint 4:

Calendar

Compact month Calendar hiển thị đúng trong History.

Chuyển tháng trước/sau hoạt động.

Nhãn tháng và thứ hoạt động trong vi/en.

Today state và selected state hiển thị rõ.

Ngày có nhật ký hiển thị đúng.

Default, Sakura, Coffee và Rainy có indicator đúng.

Indicator không che số ngày.

Theme identity không chỉ dựa vào màu.

Click ngày mở đúng ngày.

Enter và Space mở đúng ngày.

Arrow keys và Home/End hoạt động theo keyboard model đã triển khai.

Điều hướng qua biên tháng hoạt động.

Chuyển tháng không để kết quả cũ ghi đè kết quả mới trong luồng sử dụng bình thường.

History

History card hiển thị Day Theme identity nhẹ, không làm rối bố cục.

Symbol, accent và localized theme name hiển thị đúng.

Default, Sakura, Coffee và Rainy hiển thị đúng.

Pagination, loading, empty state và navigation không regression trong luồng sử dụng thông thường.

Mở History card vào đúng ngày.

Old-day restoration

Mở ngày cũ từ Calendar khôi phục đúng Day Theme và Day Cover.

Mở ngày cũ từ History khôi phục đúng Day Theme và Day Cover.

Sakura, Coffee và Rainy được khôi phục đúng theo từng ngày.

App shell không bị Day Theme scope ghi đè.

Reload ứng dụng vẫn khôi phục đúng dữ liệu/theme đã lưu.

Compatibility

App Theme light/dark/custom vẫn độc lập với Day Theme.

Theme Picker tiếp tục hoạt động.

Today editor và autosave không regression.

Categories, status, statistics và reorder không regression.

History và date navigation không regression.

vi/en không có raw translation key.

Cửa sổ 900×600, kích thước mặc định và maximize sử dụng được.

Accessibility và giới hạn tuyên bố

Được phép ghi nhận:

native keyboard review đã đạt;

native focus/visual review trong phạm vi người dùng kiểm tra đã đạt;

automated/source evidence cho accessible names, states, stale guards, fallback, forced-colors và reduced-motion vẫn đạt.

Không được tự tuyên bố:

đã kiểm tra bằng screen reader thật;

đã kiểm tra Accessibility Tree;

unknown/corrupt database theme metadata đã được phá thủ công để thử native;

native failure injection cho loading/error/Retry đã được thực hiện;

trừ khi repository hoặc worklog hiện có bằng chứng cụ thể.

Đối với các trường hợp không được thử native trực tiếp, chỉ ghi:

Covered by automated/source evidence.

3. Workspace guard bắt buộc

Trước khi đọc sâu tài liệu hoặc sửa bất kỳ file nào, chạy:

Get-Location
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git remote -v
git status --branch --short

Chỉ được tiếp tục khi:

Repository root:
C:\dev\done-today
hoặc C:/dev/done-today

Branch:
master

Working tree:
clean

Remote origin:
https://github.com/Ronn-G/Done-Today

Nếu repository root khác, đặc biệt nếu đang ở:

C:\Users\long\Documents\Làm app nhật ký hàng ngày

thì:

không sửa file;

không tạo commit;

dừng và báo người dùng mở đúng workspace.

Nếu Codex Desktop dùng isolated worktree hoặc detached HEAD:

không tiếp tục;

báo đường dẫn, branch/detached state và HEAD;

dừng.

Các commit closeout phải xuất hiện trực tiếp trong:

C:\dev\done-today\master

4. Quy tắc Git an toàn

Không được chạy:

git reset
git reset --hard
git clean
git checkout
git switch
git restore
git stash
git stash pop
git merge
git rebase
git cherry-pick
git commit --amend
git push
git branch -D
git worktree remove
git gc
git prune

Không xóa hoặc ghi đè dữ liệu.

Không dùng git add . khi có file ngoài phạm vi.

Không push.

Không build installer, portable ZIP hoặc release artifact.

Nếu working tree ban đầu không sạch:

liệt kê chính xác file thay đổi;

không sửa gì;

dừng.

5. Preflight bắt buộc

Chạy:

Set-Location C:\dev\done-today

git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -20
git remote -v
git status --branch --short

git merge-base --is-ancestor 119f5fdac8640d9b2651ba166c16f81afd572ee1 HEAD
git merge-base --is-ancestor 10bac7c9a49897cdee2d2e1c4915da0605ecf5fc HEAD
git merge-base --is-ancestor d9cc0db049fe3f4bd3af7f9fa33d2c1517e02fa2 HEAD
git merge-base --is-ancestor 24b821bf7dfb6f1b21ee133e1050f36573875028 HEAD
git merge-base --is-ancestor d7cf6ca291ec52da01150fb79545f1b2e830412c HEAD

git fetch origin
git status --branch --short
git log origin/master..master --oneline

node --version
npm.cmd --version
rustc --version
cargo --version

Tìm AGENTS.md:

Get-ChildItem -Path C:\dev\done-today -Filter AGENTS.md -Recurse -Force

Yêu cầu:

đúng repository;

branch master;

working tree sạch;

cả năm commit Checkpoint 4 là ancestor của HEAD;

không có divergence nguy hiểm;

không có AGENTS.md chưa đọc.

Nếu HEAD mới hơn d7cf6ca:

đọc tất cả commit mới hơn;

xác định chúng có hợp lệ và không xung đột closeout;

dùng HEAD thực tế làm baseline;

không quay lùi lịch sử.

Nếu thiếu bất kỳ commit Checkpoint 4 nào:

dừng và báo.

6. Lưu prompt closeout vào repository

Để không phụ thuộc lịch sử Codex Desktop, lưu toàn bộ nhiệm vụ này vào:

docs/prompts/DAY-THEME-CHECKPOINT-04-CLOSEOUT.md

Nếu file đã tồn tại:

so sánh nội dung;

không ghi đè nội dung không rõ nguồn gốc;

báo blocker nếu khác đáng kể.

Sau khi lưu, tạo một commit chỉ chứa prompt:

docs: record day theme checkpoint 4 closeout task

Trước commit:

git add -- docs/prompts/DAY-THEME-CHECKPOINT-04-CLOSEOUT.md
git diff --cached --stat
git diff --cached --check
git diff --cached

Commit:

git commit -m "docs: record day theme checkpoint 4 closeout task"

Sau commit:

git show --stat --oneline HEAD
git status --short

Không sửa source trong commit này.

7. Đọc tài liệu authoritative

Đọc tối thiểu:

docs/00-DOCUMENT-STATUS.md
docs/02-TECHNICAL-DESIGN.md
docs/05-ROADMAP.md
docs/16-DESIGN-SYSTEM.md
docs/17-DAY-THEME-AND-PERSONALIZATION.md
docs/18-INTERNATIONALIZATION-AND-LOCALIZATION.md
docs/audits/I18N-STRING-INVENTORY.md
docs/worklogs/DAY-THEME-CHECKPOINT-04-RESULT.md
README.md

Tuân thủ precedence trong:

docs/00-DOCUMENT-STATUS.md

Tìm toàn bộ trạng thái liên quan:

rg -n -i `
  "Checkpoint 4|Calendar & History|native Windows acceptance|native acceptance pending|Implementation complete|Checkpoint 5|Day Theme & Personalization" `
  README.md docs

Không thay hàng loạt mọi từ pending.

Chỉ sửa nội dung liên quan trực tiếp Checkpoint 4 và trạng thái tổng thể tương ứng.

8. Audit implementation trước closeout

Không sửa source. Chỉ xác minh các commit và code hiện hành vẫn phản ánh đúng báo cáo:

Calendar summary contract xuyên suốt Rust/Tauri/repository/application/frontend.

Calendar dùng indexed half-open date range query.

History preview không còn N+1 query.

Compact month Calendar nằm trong History.

vi/en.

Previous/next month.

Arrow/Home/End/Enter/Space.

Loading/error/Retry/stale-result guard.

Indicator lấy từ Day Theme registry.

NULL và unknown theme fallback an toàn.

History card có symbol, accent và localized theme name.

History pagination/deep-link không đổi.

Old-day route khôi phục đúng DayThemeScope.

App shell không nằm trong Day Theme scope.

Calendar/History không import full motif hoặc cover.

Không migration/dependency/schema mới.

Không đổi Backup v1 và business rules.

Dùng git show, rg, source và test hiện hành.

Nếu phát hiện implementation không khớp báo cáo:

không sửa source trong closeout;

báo blocker;

dừng.

Nếu khớp, tiếp tục.

9. Cập nhật tài liệu

9.1. docs/05-ROADMAP.md

Cập nhật trạng thái:

Day Theme Checkpoint 4 — Calendar & History:
Completed — native Windows acceptance passed

Ghi nhận:

ngày acceptance: 2026-07-29;

native Calendar/History/old-day restoration đã đạt;

vi/en;

keyboard;

App Theme light/dark/custom;

900×600/default/maximize;

Today/History/Categories regression checks;

automated/source evidence cho fallback, stale request, forced-colors, reduced-motion và failure/Retry paths;

không tuyên bố screen reader hoặc Accessibility Tree.

Giữ:

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 5+:
Not started

Không đánh dấu toàn feature Completed.

Loại bỏ hoặc thay đúng các dòng hiện hành nói:

native Windows acceptance pending
Implementation complete — native acceptance pending

chỉ trong phạm vi Checkpoint 4.

9.2. docs/17-DAY-THEME-AND-PERSONALIZATION.md

Cập nhật implementation/acceptance record:

Checkpoint 4 — Calendar & History:
Completed — native Windows acceptance passed

Ghi rõ:

acceptance date;

phạm vi native đã kiểm tra;

automated/source-only evidence;

giới hạn không tuyên bố screen reader/Accessibility Tree;

Calendar và History identity;

old-day restoration;

App Theme boundary;

performance/asset-loading invariants;

compatibility invariants.

Giữ mọi phase sau là Not started.

Không biến đề xuất Personalization thành implementation.

9.3. docs/worklogs/DAY-THEME-CHECKPOINT-04-RESULT.md

Cập nhật mục native acceptance:

trạng thái từ pending sang passed;

ngày 2026-07-29;

checklist đã đạt;

automated-only areas;

giới hạn accessibility;

cleanup/profile test nếu đã được người dùng thực hiện hoặc không cần tuyên bố.

Cập nhật Final status chính xác.

Không xóa bằng chứng implementation cũ.

9.4. docs/00-DOCUMENT-STATUS.md

Chỉ cập nhật nếu file này theo dõi:

delivery status;

native acceptance;

last verified implementation commit.

Không đổi precedence.

Nếu có trường:

Last verified against implementation commit

thì dùng commit implementation phù hợp:

d7cf6ca291ec52da01150fb79545f1b2e830412c

hoặc commit implementation mới hơn đã audit.

Không dùng commit closeout tài liệu làm “implementation commit” nếu field mang nghĩa implementation.

9.5. docs/02-TECHNICAL-DESIGN.md

Chỉ sửa nếu có dòng trạng thái native pending hoặc acceptance table cần đồng bộ.

Không biến Technical Design thành changelog dài.

9.6. I18N inventory và README

Chỉ sửa khi có trạng thái Checkpoint 4 pending trực tiếp cần đồng bộ.

Không thêm translation key mới.

Không thay visible product copy.

10. Không sửa source hoặc config

Closeout này chỉ được thay đổi:

docs/**
README.md

và chỉ khi cần.

Không sửa:

src/**
src-tauri/**
.github/**
package.json
package-lock.json
.prettierrc.json
.gitattributes
tsconfig*.json
vite.config.*
eslint.config.*

Nếu phát hiện cần sửa source/config:

không sửa;

báo blocker;

dừng.

11. Verification

Vì đây là documentation-only closeout, chạy:

npm.cmd run format:check
npm.cmd run i18n:lint
npm.cmd run typecheck
npm.cmd run lint
git diff --check

Markdown không thuộc official Prettier scope hiện hành, nên:

không format toàn bộ tài liệu legacy;

không chạy Prettier write trên toàn repository;

chỉ bảo đảm diff Markdown sạch và git diff --check pass.

Không bắt buộc chạy lại:

npm run test:run
npm run build
cargo fmt
cargo clippy
cargo test

nếu diff chỉ là tài liệu.

Báo rõ:

Full frontend and Rust suites were not rerun because closeout changes documentation only.
Implementation evidence remains 47 files / 420 frontend tests, 70 Rust tests, production build pass, plus native Windows acceptance on 2026-07-29.

Nếu source/config bị thay đổi ngoài dự kiến:

dừng và điều tra;

không commit.

12. Review diff

Chạy:

git status --short
git diff --stat
git diff -- README.md docs
git diff --check

Xác minh:

chỉ prompt/tài liệu/worklog cần thiết thay đổi;

không source/config/workflow thay đổi;

không build artifact;

không database/AppData/profile;

không file tạm;

Checkpoint 5+ vẫn Not started;

không tuyên bố screen reader/Accessibility Tree;

không đánh dấu toàn Day Theme & Personalization Completed.

13. Commit closeout

Tạo commit closeout:

docs: complete day theme calendar and history

Stage chính xác:

git add -- <chỉ các file tài liệu đã audit>
git diff --cached --stat
git diff --cached --check
git diff --cached

Không dùng git add . nếu có file ngoài phạm vi.

Commit:

git commit -m "docs: complete day theme calendar and history"

Sau commit:

git status --short
git log --oneline --decorate -12
git show --stat --oneline HEAD
git log origin/master..master --oneline

Working tree cuối phải sạch.

Không push.

14. Ngoài phạm vi tuyệt đối

Không:

bắt đầu Checkpoint 5;

thêm Personalization;

thêm cover/accent variant;

thêm display title/day symbol tùy biến;

thêm custom Day Theme editor;

thêm theme pack;

thêm reminder;

thêm CSV/Markdown export;

thêm cloud/mobile/AI;

sửa Calendar hoặc History;

refactor App.tsx/lib.rs;

sửa CSP;

sửa installer icon;

nâng dependency;

chạy npm audit fix;

sửa CI;

build installer;

build portable;

tạo release;

bump version;

push.

15. Báo cáo cuối bắt buộc

Báo cáo theo cấu trúc:

A. Workspace and preflight

Codex current path;

repository;

branch;

initial HEAD;

origin relation;

working tree ban đầu;

ancestor results;

Node/npm/Rust/Cargo;

AGENTS.md;

xác nhận không isolated worktree.

B. Closeout prompt preservation

prompt path;

prompt commit hash/message;

xác nhận commit nằm trực tiếp trong C:\dev\done-today\master.

C. Implementation audit

Calendar summary/query;

no N+1;

Calendar UI;

History identity;

old-day restoration;

fallback;

asset loading;

compatibility;

blocker hoặc none.

D. Native acceptance recorded

date;

Calendar;

History;

old-day restoration;

vi/en;

keyboard;

App Theme light/dark/custom;

900×600/default/maximize;

regression checks;

automated/source-only evidence;

accessibility limits.

E. Documentation

file đã sửa;

trạng thái cũ;

trạng thái mới;

implementation commit pointer;

Checkpoint 5+ vẫn Not started.

F. Verification

format;

i18n;

typecheck;

lint;

git diff --check;

lý do không chạy full suites;

implementation/native evidence được dẫn lại.

G. Git

toàn bộ commit mới trong closeout;

full hashes/messages;

diff stat;

final HEAD;

git log origin/master..master --oneline;

working tree cuối;

không push;

không installer/portable/release.

H. Final status

Ghi chính xác:

Day Theme Checkpoint 1 — Foundation:
Completed

Day Theme Checkpoint 2 — First Themes:
Completed

Day Theme Checkpoint 3 — Theme Picker:
Completed — native Windows acceptance passed

Day Theme Checkpoint 4 — Calendar & History:
Completed — native Windows acceptance passed

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 5+:
Not started

Dừng sau closeout.

Không bắt đầu Checkpoint 5 trong cùng task.
