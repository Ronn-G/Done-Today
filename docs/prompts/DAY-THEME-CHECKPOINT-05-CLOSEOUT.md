DONE TODAY — DAY THEME CHECKPOINT 5 CLOSEOUT

Bạn đang chạy trong Codex Desktop trên Windows và phải làm việc trực tiếp trong repository chính:

C:\dev\done-today

Mục tiêu duy nhất của nhiệm vụ này:

Ghi nhận native Windows acceptance của:

Day Theme Checkpoint 5 — Light Personalization

Cập nhật tài liệu canonical và worklog từ trạng thái:

Implementation complete — native Windows acceptance pending

thành:

Completed — native Windows acceptance passed

Tạo các commit tài liệu nhỏ, rõ ràng.

Không sửa source code, test, workflow, dependency, migration, database hoặc business rule.

Không bắt đầu Checkpoint 6.

Không push.

1. Trạng thái implementation đã biết

Repository chính:

C:\dev\done-today

Branch:

master

Baseline trước Checkpoint 5:

fd71c06732cf45527d4b4ac40ce8f14e35d854d9
docs: complete day theme calendar and history

Các commit Checkpoint 5:

3ba74f671ffcff8a8ceaddf4d8d9a6ff30bf5be3
docs: record day theme checkpoint 5 task

6a1e6be07074280d6c20028e00339f45ba5b2f88
feat: persist light day personalization

39d966ac5ff45824ab4405d38602ce15dbf7db5c
feat: add light day personalization

287799840b2f389bfe7fb865c6159d2df91b23ec
feat: apply day personalization across journal views

bcbd6b95da8bbd933cd13bc3c7c37ef0d5225f8c
test: verify light personalization compatibility

ba1c67516f34f33771a5965f6b3288fbb657dc95
docs: record day theme checkpoint 5 implementation

cb8d3e87e7d7bb0b222c1e8d56b4bc22402c180e
docs: normalize checkpoint 5 worklog formatting

Final implementation HEAD đã biết:

cb8d3e87e7d7bb0b222c1e8d56b4bc22402c180e

Implementation đã được xác minh trước native acceptance:

Format: pass
I18N: 2 files, 48 tests
Typecheck: pass
ESLint: pass, 0 warnings/errors
Frontend: 50 files, 443 tests
Production build: pass, 1,742 modules
Cargo format: pass
Cargo clippy -D warnings: pass
Rust: 72 tests
git diff --check: pass
Working tree: clean

Bundle đã biết:

CSS: 57.99 kB raw / 11.24 kB gzip
Main: 364.41 kB raw / 110.71 kB gzip
Day Theme Picker: 5.01 kB raw / 1.81 kB gzip
Lazy Personalization dialog: 5.66 kB raw / 1.90 kB gzip

Motif Sakura/Coffee/Rainy vẫn là dynamic chunks riêng.

Các contract đã được giữ nguyên:

migration mới chỉ là 006_day_personalization.sql;

không thêm bảng, foreign key hoặc index mới;

không thêm dependency, font asset hoặc network font;

không bump Backup v1;

không đổi checksum algorithm;

không đổi Merge/Replace/receipt semantics;

không đổi App Theme light/dark/custom;

không đổi Day Theme IDs/version/order;

không đổi Theme Picker;

không đổi Calendar/History pagination/deep-link;

không đổi autosave/editor save queue;

không đổi Categories/status/statistics/reorder/streak;

không tạo installer, portable hoặc release artifact.

2. Native Windows acceptance do người dùng xác nhận

Người dùng đã chạy ứng dụng native trên Windows và xác nhận:

Đã test và mọi thứ ok.

Ngày ghi nhận:

2026-07-29

Được phép ghi nhận native acceptance cho các hành vi sau.

2.1. Entry point và dialog

Nút/action Personalize this day hiển thị đúng.

Dialog mở bằng mouse và keyboard.

vi/en hiển thị đúng, không raw translation key.

Focus trap và focus restore hoạt động.

Escape và click backdrop/outside close rollback preview.

Hoạt động tại 900×600, kích thước mặc định và maximize.

Không clipping hoặc overflow đáng kể trong phạm vi sử dụng bình thường.

2.2. Cover variant

Đã kiểm tra:

Theme default
Minimal

Native acceptance ghi nhận:

Theme default giữ behavior cũ.

Minimal giữ layout/chiều cao Day Cover.

Minimal không hiển thị motif/full cover asset.

Default, Sakura, Coffee và Rainy đều đọc rõ.

App Theme light/dark/custom vẫn độc lập.

2.3. Day symbol

Đã kiểm tra đủ:

Theme default
None
Sparkle
Focus
Growth
Calm
Celebrate

Native acceptance ghi nhận:

Day Cover hiển thị đúng.

Calendar hiển thị đúng.

History hiển thị đúng.

None ẩn symbol tùy biến nhưng vẫn giữ theme/accent identity.

Theme default dùng symbol của theme.

Các lựa chọn có visible label, không chỉ dựa vào màu.

2.4. Journal font

Đã kiểm tra:

Theme default
Clean UI
Classic Serif

Native acceptance ghi nhận:

tiếng Việt có dấu hiển thị đúng;

tiếng Anh hiển thị đúng;

journal/editor content đọc được;

Day Cover text hoạt động;

controls, table headers, status labels, dialog chrome và app shell không bị đổi sang serif;

không có layout jump nghiêm trọng trong luồng sử dụng bình thường.

2.5. Preview, Cancel, Reset và Apply

Native acceptance ghi nhận:

preview hoạt động;

Cancel rollback;

Escape rollback;

backdrop/outside close rollback;

Reset chỉ thay draft cho đến khi Apply;

Reset rồi Cancel không persist;

Apply persist đúng;

reload app khôi phục đúng;

đổi ngày khi dialog mở không mang preview/draft sang ngày mới;

duplicate click Apply không tạo duplicate save trong luồng sử dụng bình thường;

Saving/success state hoạt động;

editor draft/content không bị mất.

2.6. Persistence theo ngày

Native acceptance ghi nhận:

nhiều ngày có personalization khác nhau được lưu độc lập;

mở lại từ Today/Calendar/History khôi phục đúng;

reset personalization không xóa Day Theme hoặc nội dung;

non-default personalization trên ngày trống không tạo work item;

all-default behavior không làm xuất hiện dữ liệu ngoài mong đợi trong luồng UI;

migration 006 hoạt động trong profile native đã thử.

2.7. Compatibility

Native acceptance ghi nhận không có regression đáng chú ý trong:

Theme Picker;

Default/Sakura/Coffee/Rainy;

Calendar;

History;

old-day restoration;

editor/autosave;

Categories;

status;

statistics;

reorder;

streak;

Backup smoke trong phạm vi người dùng đã kiểm tra;

vi/en;

900×600;

default window;

maximize;

App Theme light/dark/custom.

2.8. Accessibility và giới hạn tuyên bố

Được phép ghi nhận:

native keyboard review đã đạt;

native focus/visual review trong phạm vi người dùng kiểm tra đã đạt;

automated/source evidence cho radiogroup semantics, focus trap, aria-checked, alert/live state, forced-colors, reduced-motion, unknown fallback và stale guards vẫn đạt.

Không được tự tuyên bố:

đã kiểm tra bằng screen reader thật;

đã kiểm tra Accessibility Tree;

đã phá thủ công database để thử unknown/corrupt metadata native;

đã thực hiện native failure injection đầy đủ cho mọi error/Retry path;

đã kiểm tra mọi tổ hợp theme × cover × symbol × font.

Đối với các khu vực không được thử native trực tiếp, chỉ ghi:

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

báo đường dẫn, HEAD và branch/detached state;

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
git log --oneline --decorate -25
git remote -v
git status --branch --short

git merge-base --is-ancestor 3ba74f671ffcff8a8ceaddf4d8d9a6ff30bf5be3 HEAD
git merge-base --is-ancestor 6a1e6be07074280d6c20028e00339f45ba5b2f88 HEAD
git merge-base --is-ancestor 39d966ac5ff45824ab4405d38602ce15dbf7db5c HEAD
git merge-base --is-ancestor 287799840b2f389bfe7fb865c6159d2df91b23ec HEAD
git merge-base --is-ancestor bcbd6b95da8bbd933cd13bc3c7c37ef0d5225f8c HEAD
git merge-base --is-ancestor ba1c67516f34f33771a5965f6b3288fbb657dc95 HEAD
git merge-base --is-ancestor cb8d3e87e7d7bb0b222c1e8d56b4bc22402c180e HEAD

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

cả bảy commit Checkpoint 5 đều là ancestor của HEAD;

không có divergence nguy hiểm;

không có AGENTS.md chưa đọc.

Nếu HEAD mới hơn cb8d3e87:

đọc tất cả commit mới hơn;

xác định chúng hợp lệ và không xung đột closeout;

dùng HEAD thực tế làm baseline;

không quay lùi lịch sử.

Nếu thiếu bất kỳ commit Checkpoint 5 nào:

dừng và báo.

6. Lưu prompt closeout vào repository

Để không phụ thuộc lịch sử Codex Desktop, lưu toàn bộ nhiệm vụ này vào:

docs/prompts/DAY-THEME-CHECKPOINT-05-CLOSEOUT.md

Nếu file đã tồn tại:

so sánh nội dung;

không ghi đè nội dung không rõ nguồn gốc;

báo blocker nếu khác đáng kể.

Sau khi lưu, tạo một commit chỉ chứa prompt:

docs: record day theme checkpoint 5 closeout task

Trước commit:

git add -- docs/prompts/DAY-THEME-CHECKPOINT-05-CLOSEOUT.md
git diff --cached --stat
git diff --cached --check
git diff --cached

Commit:

git commit -m "docs: record day theme checkpoint 5 closeout task"

Sau commit:

git show --stat --oneline HEAD
git status --short

Không sửa source trong commit này.

7. Đọc tài liệu authoritative

Đọc tối thiểu:

docs/00-DOCUMENT-STATUS.md
docs/02-TECHNICAL-DESIGN.md
docs/03-DATABASE-DESIGN.md
docs/05-ROADMAP.md
docs/08-BACKUP-RESTORE.md
docs/16-DESIGN-SYSTEM.md
docs/17-DAY-THEME-AND-PERSONALIZATION.md
docs/18-INTERNATIONALIZATION-AND-LOCALIZATION.md
docs/audits/I18N-STRING-INVENTORY.md
docs/worklogs/DAY-THEME-CHECKPOINT-05-RESULT.md
README.md

Tuân thủ precedence trong:

docs/00-DOCUMENT-STATUS.md

Tìm toàn bộ trạng thái liên quan:

rg -n -i `
  "Checkpoint 5|Light Personalization|native Windows acceptance|native acceptance pending|Implementation complete|Checkpoint 6|Day Theme & Personalization" `
  README.md docs

Không thay hàng loạt mọi từ pending.

Chỉ sửa nội dung liên quan trực tiếp Checkpoint 5 và trạng thái tổng thể tương ứng.

8. Audit implementation trước closeout

Không sửa source. Chỉ xác minh các commit và code hiện hành vẫn phản ánh đúng báo cáo:

migration 006_day_personalization.sql;

ba nullable columns;

atomic apply command;

all-null trên ngày trống không tạo log;

non-default trên ngày trống tạo đúng minimal log;

Reset giữ Day Theme và nội dung;

Backup v1 optional fields;

old backup/legacy fixture/checksum;

unknown IDs round-trip tại data/Backup boundary;

curated cover/symbol/font contracts;

lazy dialog;

draft/preview/persisted state tách biệt;

Cancel/Escape/backdrop/unmount/date-change rollback;

duplicate Apply lock;

Saving/error/Retry;

vi/en;

minimal cover không gọi motif loader;

personalized symbol trên Cover/Calendar/History;

none behavior;

unknown fallback;

font scoped trong DayThemeScope;

controls/app shell giữ UI font;

no N+1/full log/motif loading;

App Theme/Theme Picker/Calendar/History/autosave compatibility.

Dùng git show, rg, source và test hiện hành.

Nếu implementation không khớp báo cáo:

không sửa source trong closeout;

báo blocker;

dừng.

Nếu khớp, tiếp tục.

9. Cập nhật tài liệu

9.1. docs/05-ROADMAP.md

Cập nhật trạng thái:

Day Theme Checkpoint 5 — Light Personalization:
Completed — native Windows acceptance passed

Ghi nhận:

ngày acceptance: 2026-07-29;

Cover Theme default/Minimal;

đủ bảy trạng thái Day symbol;

đủ ba trạng thái Journal font;

preview/Cancel/Escape/backdrop/Reset/Apply/reload;

persistence theo ngày;

Calendar/History integration;

vi/en;

App Theme light/dark/custom;

900×600/default/maximize;

Today/History/Categories/status/statistics/reorder/autosave regression checks;

Backup smoke trong phạm vi native người dùng đã thực hiện;

automated/source evidence cho unknown fallback, stale guards, forced-colors, reduced-motion và failure/Retry paths;

không tuyên bố screen reader hoặc Accessibility Tree.

Giữ:

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 6+:
Not started

Không đánh dấu toàn feature Completed.

Chỉ thay các dòng pending thuộc Checkpoint 5.

9.2. docs/17-DAY-THEME-AND-PERSONALIZATION.md

Cập nhật implementation/acceptance record:

Checkpoint 5 — Light Personalization:
Completed — native Windows acceptance passed

Ghi rõ:

acceptance date;

phạm vi native đã kiểm tra;

Cover variant;

Day symbol;

Journal font;

preview/apply/reset;

persistence theo ngày;

Calendar/History integration;

App Theme boundary;

Backup v1 compatibility;

performance/asset-loading invariants;

automated/source-only evidence;

giới hạn không tuyên bố screen reader/Accessibility Tree;

non-goals vẫn giữ nguyên.

Giữ mọi phase sau là Not started.

Không biến display title/accent/freeform/stickers thành implementation.

9.3. docs/worklogs/DAY-THEME-CHECKPOINT-05-RESULT.md

Cập nhật mục native acceptance:

trạng thái từ pending sang passed;

ngày 2026-07-29;

checklist đã đạt;

automated/source-only areas;

accessibility limits;

Final status chính xác.

Không xóa bằng chứng implementation cũ.

9.4. docs/00-DOCUMENT-STATUS.md

Chỉ cập nhật nếu file theo dõi delivery status, native acceptance hoặc last verified implementation commit.

Nếu có trường:

Last verified against implementation commit

thì dùng:

cb8d3e87e7d7bb0b222c1e8d56b4bc22402c180e

hoặc commit implementation mới hơn đã audit.

Không dùng commit closeout tài liệu làm implementation commit nếu field mang nghĩa implementation.

9.5. docs/03-DATABASE-DESIGN.md

Chỉ sửa nếu có dòng nói migration 006 hoặc Checkpoint 5 vẫn pending.

Không thay schema nội dung đã đúng.

Không tạo migration mới.

9.6. docs/08-BACKUP-RESTORE.md

Chỉ sửa nếu có trạng thái Checkpoint 5/native pending cần đồng bộ.

Không đổi Backup v1 contract.

9.7. docs/02-TECHNICAL-DESIGN.md

Chỉ sửa nếu có acceptance table hoặc dòng trạng thái native pending trực tiếp.

Không biến Technical Design thành changelog dài.

9.8. I18N inventory và README

Chỉ sửa khi có trạng thái Checkpoint 5 pending trực tiếp cần đồng bộ.

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
Implementation evidence remains 50 frontend files / 443 tests, 72 Rust tests, production build pass, plus native Windows acceptance on 2026-07-29.

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

Checkpoint 6+ vẫn Not started;

không tuyên bố screen reader/Accessibility Tree;

không đánh dấu toàn Day Theme & Personalization Completed;

không làm thay đổi Backup v1/schema contract.

13. Commit closeout

Tạo commit closeout:

docs: complete light day personalization

Stage chính xác:

git add -- <chỉ các file tài liệu đã audit>
git diff --cached --stat
git diff --cached --check
git diff --cached

Không dùng git add . nếu có file ngoài phạm vi.

Commit:

git commit -m "docs: complete light day personalization"

Sau commit:

git status --short
git log --oneline --decorate -15
git show --stat --oneline HEAD
git log origin/master..master --oneline

Working tree cuối phải sạch.

Không push.

14. Ngoài phạm vi tuyệt đối

Không:

bắt đầu Checkpoint 6;

thêm display title;

thêm accent variant;

thêm freeform editor;

thêm custom cover/symbol/font;

thêm font asset;

thêm sticker;

thêm custom CSS;

thêm theme pack;

thêm reminder;

thêm CSV/Markdown export;

thêm sync/cloud/mobile/AI;

sửa Personalization dialog;

sửa migration 006;

sửa Backup implementation;

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

migration 006;

persistence/atomic apply;

minimal-log rules;

Backup v1;

curated contracts;

dialog/state;

Day Cover;

Calendar/History;

font boundary;

asset loading;

compatibility;

blocker hoặc none.

D. Native acceptance recorded

date;

entry/dialog;

Cover variants;

seven symbol states;

three font states;

preview/cancel/reset/apply;

persistence theo ngày;

Calendar/History;

App Theme;

vi/en;

900×600/default/maximize;

regression checks;

automated/source-only evidence;

accessibility limits.

E. Documentation

file đã sửa;

trạng thái cũ;

trạng thái mới;

implementation commit pointer;

Checkpoint 6+ vẫn Not started;

Day Theme & Personalization vẫn In progress.

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

Day Theme Checkpoint 5 — Light Personalization:
Completed — native Windows acceptance passed

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 6+:
Not started

Dừng sau closeout.

Không bắt đầu Checkpoint 6 trong cùng task.