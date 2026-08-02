Bạn đang chạy trong Codex Desktop trên Windows và phải làm việc trực tiếp trong repository:

C:\dev\done-today

Mục tiêu duy nhất:

Ghi nhận native Windows acceptance của:

Corrective Checkpoint — App Theme Token Wiring

Cập nhật tài liệu từ:

Implementation complete — native Windows acceptance pending

thành:

Completed — native Windows acceptance passed

Tạo commit tài liệu closeout.

Không sửa source, tests, config, dependency, schema, migration, database, Backup hoặc business rule.

Không tiếp tục Visual Fidelity trong cùng task.

Không push.

1. Trạng thái implementation đã biết

Baseline trước corrective checkpoint:

bc1a4334d25e3eef3631163a132e7274f9fb451e
docs: complete light day personalization

Các commit corrective checkpoint:

57b9b99c19ee0e680f6987a16a904e6a9e308a8d
docs: record app theme token wiring fix

e70b6174a405bfa86c69b920d3ccad2f97f85838
docs: audit app theme token wiring

b219761dacf4de687c6615780c9a9d86594f43df
fix: wire app theme surface tokens

e87267accd7e2bdb9c910ee2bc452c8f090d1f33
docs: record app theme token wiring correction

Root cause:

.day-theme-scope
→ shadow --bg-table-header
→ shadow six --stats-* variables

Implementation đã sửa:

Table header:
chỉ dùng tableHeaderBackground.

Accent:
không còn điều khiển Table header.

Today statistics:
sáu token điều khiển độc lập:
- background;
- border;
- primary text;
- secondary text;
- progress track;
- progress fill.

Contract giữ nguyên:

ThemePreferences schema v2;

đúng 33 token;

DB key appearance.themePreferences;

không migration;

không database change;

không Backup change;

presets immutable;

không dependency;

không business-rule change.

Quality evidence gần nhất:

Frontend: 51 files / 455 tests
Rust: 74 tests
Format: pass
I18N lint: pass
Typecheck: pass
ESLint: pass
Cargo fmt: pass
Cargo clippy -D warnings: pass
Production build: pass, 1,742 modules
CSS: 57.71 kB / 11.20 kB gzip
Main JS: 364.41 kB / 110.71 kB gzip
git diff --check: pass
Working tree: clean

2. Native acceptance do người dùng xác nhận

Người dùng đã xác nhận:

Native test đạt.

Ngày ghi nhận:

2026-08-02

Được phép ghi nhận:

Table header

Chỉnh riêng Table header có hiệu lực.

Preview, save và reload đúng.

Light/dark/custom đúng.

Reset preset đúng.

Đổi Accent không làm Table header đổi.

Default/Sakura/Coffee/Rainy không còn shadow sai Table header.

Accent

Accent chỉ tác động các accent surfaces đúng semantic ownership.

Table header không đổi theo Accent.

Today statistics không đổi theo Accent khi đã có specialized tokens.

Today statistics

Sáu token hoạt động độc lập:

Stats background
Stats border
Stats primary text
Stats secondary text
Stats progress track
Stats progress fill

Diagnostic matrix:

Accent: #00FF00
Table header: #FF00FF
Stats background: #111111
Stats border: #FF0000
Stats primary text: #FFFFFF
Stats secondary text: #FFFF00
Stats progress track: #444444
Stats progress fill: #00FFFF

Persistence và boundaries

Preview đúng.

Apply đúng.

Reload đúng.

Reset preset đúng.

Preset không bị mutate.

Light/dark/custom hoạt động.

App Theme và Day Theme không còn ghi đè sai semantic tokens.

Regression

Không có regression rõ ràng ở:

Today;

History;

Settings;

Theme Picker;

Personalization;

editor/autosave;

Categories;

status/statistics/reorder;

Calendar/History;

vi/en;

900×600/default/maximize.

Không được tuyên bố screen reader hoặc Accessibility Tree pass nếu không có bằng chứng.

3. Workspace guard

Trước khi sửa file, chạy:

Get-Location
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git remote -v
git status --branch --short

Chỉ tiếp tục khi:

Repository root: C:\dev\done-today hoặc C:/dev/done-today
Branch: master
Working tree: clean
Remote origin: https://github.com/Ronn-G/Done-Today

Nếu repository khác, isolated worktree hoặc detached HEAD:

không sửa;

không commit;

dừng và báo.

Mọi commit phải xuất hiện trực tiếp trong:

C:\dev\done-today\master

4. Quy tắc Git an toàn

Không chạy:

git reset
git clean
git checkout
git switch
git restore
git stash
git merge
git rebase
git cherry-pick
git commit --amend
git push
git branch -D
git worktree remove
git gc
git prune

Không dùng git add . nếu có file ngoài phạm vi.

Không build installer, portable hoặc release.

Nếu working tree ban đầu không sạch, dừng.

5. Preflight bắt buộc

Chạy:

Set-Location C:\dev\done-today

git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -20
git remote -v
git status --branch --short

git merge-base --is-ancestor 57b9b99c19ee0e680f6987a16a904e6a9e308a8d HEAD
git merge-base --is-ancestor e70b6174a405bfa86c69b920d3ccad2f97f85838 HEAD
git merge-base --is-ancestor b219761dacf4de687c6615780c9a9d86594f43df HEAD
git merge-base --is-ancestor e87267accd7e2bdb9c910ee2bc452c8f090d1f33 HEAD

git fetch origin
git status --branch --short
git log origin/master..master --oneline
git log master..origin/master --oneline

node --version
npm.cmd --version
rustc --version
cargo --version

Tìm AGENTS.md:

Get-ChildItem -Path C:\dev\done-today -Filter AGENTS.md -Recurse -Force

Nếu thiếu bất kỳ commit corrective checkpoint nào, origin ahead/diverged hoặc tree không sạch, dừng.

6. Lưu prompt closeout

Lưu toàn bộ nhiệm vụ này vào:

docs/prompts/CORRECTIVE-APP-THEME-TOKEN-WIRING-CLOSEOUT.md

Tạo commit chỉ chứa prompt:

docs: record app theme token wiring closeout task

Trước commit:

git add -- docs/prompts/CORRECTIVE-APP-THEME-TOKEN-WIRING-CLOSEOUT.md
git diff --cached --stat
git diff --cached --check
git diff --cached

Sau commit:

git show --stat --oneline HEAD
git status --short

7. Đọc tài liệu authoritative

Đọc:

docs/00-DOCUMENT-STATUS.md
docs/02-TECHNICAL-DESIGN.md
docs/05-ROADMAP.md
docs/06-APP-APPEARANCE-THEME.md
docs/16-DESIGN-SYSTEM.md
docs/17-DAY-THEME-AND-PERSONALIZATION.md
docs/18-INTERNATIONALIZATION-AND-LOCALIZATION.md
docs/audits/APP-THEME-TOKEN-WIRING-AUDIT.md
docs/audits/I18N-STRING-INVENTORY.md
docs/worklogs/CORRECTIVE-APP-THEME-TOKEN-WIRING-RESULT.md
README.md

Tìm trạng thái liên quan:

rg -n -i `
  "Corrective Checkpoint|App Theme Token Wiring|native acceptance pending|Implementation complete|Visual Fidelity|Table header|Today statistics|33 token" `
  README.md docs

Không thay hàng loạt mọi từ pending.

8. Audit implementation trước closeout

Không sửa source.

Xác minh:

.day-theme-scope không shadow sai --bg-table-header;

.day-theme-scope không shadow sai sáu --stats-*;

Table header dùng semantic Table header token;

Accent không điều khiển Table header;

Stats dùng đúng sáu variables riêng;

33→33 mapping đầy đủ;

Settings payload đúng;

persistence round-trip đúng;

schema v2 giữ nguyên;

presets immutable;

light/dark/custom đúng;

Day Theme boundary đúng;

không migration/database/Backup change.

Nếu implementation không khớp báo cáo, dừng và báo blocker.

9. Cập nhật tài liệu

docs/05-ROADMAP.md

Cập nhật:

Corrective Checkpoint — App Theme Token Wiring:
Completed — native Windows acceptance passed

Ghi:

acceptance date 2026-08-02;

Table header độc lập Accent;

sáu Stats tokens độc lập;

preview/apply/reload/reset;

light/dark/custom;

Default/Sakura/Coffee/Rainy boundary;

regression checks;

evidence limits.

Cập nhật Visual Fidelity thành:

Release Readiness Checkpoint 1 — Visual Fidelity & Final UI Polish:
Not started — corrective token wiring blocker cleared

hoặc wording canonical tương đương.

Không bắt đầu Visual Fidelity.

docs/06-APP-APPEARANCE-THEME.md

Nếu có tracking section, ghi:

App Theme Token Wiring:
Completed — native Windows acceptance passed

Giữ contract:

Table header token độc lập;

specialized token thắng generic Accent/Card token;

sáu Stats tokens riêng;

33-token schema v2;

preview/persist/reload;

presets immutable.

docs/worklogs/CORRECTIVE-APP-THEME-TOKEN-WIRING-RESULT.md

Cập nhật:

pending → passed;

ngày 2026-08-02;

native checklist;

diagnostic matrix;

regression;

evidence limits;

final status.

docs/00-DOCUMENT-STATUS.md

Chỉ cập nhật nếu file theo dõi trạng thái/acceptance.

Implementation pointer phải là:

e87267accd7e2bdb9c910ee2bc452c8f090d1f33

hoặc implementation commit mới hơn đã audit.

Không dùng closeout docs commit làm implementation pointer.

Các file khác

Chỉ sửa docs/16-DESIGN-SYSTEM.md, docs/02-TECHNICAL-DESIGN.md, i18n docs hoặc README nếu có dòng pending trực tiếp cần đồng bộ.

Không thêm translation key hoặc visible product copy.

10. Không sửa source/config

Chỉ được sửa:

docs/**
README.md

Không sửa:

src/**
src-tauri/**
.github/**
package.json
package-lock.json
tsconfig*.json
vite.config.*
eslint.config.*

Nếu cần sửa source/config, dừng.

11. Verification

Vì closeout chỉ là docs, chạy:

npm.cmd run format:check
npm.cmd run i18n:lint
npm.cmd run typecheck
npm.cmd run lint
git diff --check

Không bắt buộc chạy lại full frontend/Rust suites nếu diff chỉ là docs.

Báo rõ:

Full frontend and Rust suites were not rerun because closeout changes documentation only.

Implementation evidence remains:
- 51 frontend files / 455 tests;
- 74 Rust tests;
- production build pass;
- native Windows acceptance passed on 2026-08-02.

12. Review diff

Chạy:

git status --short
git diff --stat
git diff -- README.md docs
git diff --check

Xác minh:

chỉ prompt/docs/worklog;

không source/config;

không build artifact;

không database/profile;

không thay schema v2;

không thêm token;

không bắt đầu Visual Fidelity;

không tuyên bố screen reader/Accessibility Tree.

13. Commit closeout

Tạo commit:

docs: complete app theme token wiring correction

Stage chính xác:

git add -- <chỉ các file tài liệu đã audit>
git diff --cached --stat
git diff --cached --check
git diff --cached

Sau commit:

git status --short
git log --oneline --decorate -15
git show --stat --oneline HEAD
git log origin/master..master --oneline

Working tree cuối phải sạch.

Không push.

14. Ngoài phạm vi

Không:

tiếp tục Visual Fidelity;

thêm reference images;

sửa layout;

thêm Theme Pack/preset/token;

sửa schema/migration/database;

sửa Backup;

nâng dependency;

chạy npm audit fix;

sửa CI;

build installer/portable;

tạo release;

bump version;

push.

15. Báo cáo cuối bắt buộc

Báo cáo theo cấu trúc:

A. Workspace and preflight

path;

repository;

branch;

initial HEAD;

origin relation;

tree;

ancestor results;

toolchain;

AGENTS;

main checkout.

B. Closeout prompt preservation

path;

commit hash/message;

trực tiếp trên master.

C. Implementation audit

root cause;

Table header;

Accent;

six Stats tokens;

33-token mapping;

persistence;

boundaries;

blocker/none.

D. Native acceptance recorded

date;

Table header;

Accent;

six Stats tokens;

diagnostic matrix;

preview/apply/reload/reset;

light/dark/custom;

Day Theme matrix;

regression;

evidence limits.

E. Documentation

files;

old status;

new status;

implementation pointer;

Visual Fidelity blocker cleared;

no implementation started.

F. Verification

format;

i18n;

typecheck;

lint;

diff check;

reason full suites not rerun;

implementation/native evidence.

G. Git

closeout commits;

full hashes/messages;

diff stats;

final HEAD;

origin relation;

clean tree;

no push/release.

H. Final status

Ghi chính xác:

Day Theme Checkpoint 1:
Completed

Day Theme Checkpoint 2:
Completed

Day Theme Checkpoint 3:
Completed — native Windows acceptance passed

Day Theme Checkpoint 4:
Completed — native Windows acceptance passed

Day Theme Checkpoint 5:
Completed — native Windows acceptance passed

Corrective Checkpoint — App Theme Token Wiring:
Completed — native Windows acceptance passed

Release Readiness Checkpoint 1 — Visual Fidelity & Final UI Polish:
Not started — corrective token wiring blocker cleared

Dừng sau closeout.

Không bắt đầu Visual Fidelity trong cùng task.
