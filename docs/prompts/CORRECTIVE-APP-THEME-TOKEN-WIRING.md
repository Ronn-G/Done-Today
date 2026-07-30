Bạn đang chạy trong Codex Desktop trên Windows và phải làm việc trực tiếp trong repository chính:

C:\dev\done-today

Tên authoritative của nhiệm vụ:

Corrective Checkpoint — App Theme Token Wiring

Mục tiêu duy nhất:

Điều tra và sửa lỗi tùy chỉnh màu App Theme.

Bảo đảm từng semantic color token điều khiển đúng bề mặt đã định nghĩa.

Sửa riêng các lỗi người dùng đã tái hiện:

chỉnh Table header nhưng giao diện không đổi;

chỉnh Accent lại làm thay đổi Table header;

chỉnh các màu Today statistics nhưng giao diện không đổi.

Bổ sung regression tests để lỗi không tái diễn.

Giữ nguyên schema ThemePreferences v2, 33 token, database, migration và business rules.

Không tiếp tục Visual Fidelity/UI Polish trong cùng task.

Không build installer, portable hoặc release.

Không push.

Đây là bug fix, không phải feature mới hoặc phần đang chờ trong roadmap.

1. Báo cáo lỗi từ người dùng

Người dùng đã tái hiện trực tiếp trên native Windows:

1. Khi chỉnh màu Table header, không có gì thay đổi.
2. Khi chỉnh màu Accent, Table header lại thay đổi theo Accent.
3. Khi chỉnh các màu Today statistics, không thấy giao diện thay đổi.

Ngày ghi nhận:

2026-07-30

Kết quả đúng phải là:

Table header:
chỉ phản ứng với semantic token dành cho Table header.

Accent:
chỉ phản ứng tại các vị trí accent được contract định nghĩa;
không điều khiển Table header nếu đã có token Table header riêng.

Today statistics:
phản ứng độc lập với sáu semantic token:
- background;
- border;
- primary text;
- secondary text;
- progress track;
- progress fill.

Không được “sửa” bằng cách xóa các controls đang không hoạt động hoặc gộp token Table header vào Accent.

2. Baseline đã biết

Repository:

C:\dev\done-today

Branch:

master

Checkpoint 5 closeout commit đã biết:

bc1a4334d25e3eef3631163a132e7274f9fb451e
docs: complete light day personalization

Trạng thái chức năng đã biết:

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

ThemePreferences hiện được kỳ vọng:

schema version 2
33 color tokens
light palette
dark palette
selected preset
radius
updated timestamp

Stats panel được kỳ vọng có sáu token riêng:

background
border
primary text
secondary text
progress track
progress fill

Không được dựa riêng vào thông tin trong prompt. Phải audit source và tài liệu canonical hiện hành.

3. Workspace guard bắt buộc

Trước khi đọc sâu hoặc sửa bất kỳ file nào, chạy:

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

Nếu repository root khác, đặc biệt:

C:\Users\long\Documents\Làm app nhật ký hàng ngày

thì:

không sửa file;

không tạo commit;

dừng.

Nếu Codex Desktop đang dùng isolated worktree hoặc detached HEAD:

không sửa;

báo path, HEAD và trạng thái;

dừng.

Mọi commit phải xuất hiện trực tiếp trong:

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

Không dùng git add . nếu có file ngoài phạm vi.

Không xóa hoặc ghi đè thay đổi không thuộc task.

Không push.

Không tạo tag/release.

Không build installer/portable.

Nếu working tree ban đầu không sạch:

liệt kê chính xác file;

dừng.

5. Preflight đầy đủ

Chạy:

Set-Location C:\dev\done-today

git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -25
git remote -v

git fetch origin
git status --branch --short
git log origin/master..master --oneline
git log master..origin/master --oneline

git merge-base --is-ancestor bc1a4334d25e3eef3631163a132e7274f9fb451e HEAD

node --version
npm.cmd --version
rustc --version
cargo --version

Tìm AGENTS.md:

Get-ChildItem -Path C:\dev\done-today -Filter AGENTS.md -Recurse -Force

Điều kiện tiếp tục:

đúng repository;

branch master;

tree sạch;

không behind/diverged;

CP5 closeout là ancestor;

đọc mọi AGENTS.md áp dụng.

Nếu local ahead origin vì commit hợp lệ đã biết:

báo danh sách;

không push;

chỉ tiếp tục khi các commit không liên quan không làm mơ hồ baseline.

Nếu origin ahead hoặc divergence:

không pull/merge/rebase;

dừng.

6. Prompt preservation

Sau preflight hợp lệ, lưu toàn bộ nhiệm vụ này vào:

docs/prompts/CORRECTIVE-APP-THEME-TOKEN-WIRING.md

Tạo commit chỉ chứa prompt:

docs: record app theme token wiring fix

Trước commit:

git add -- docs/prompts/CORRECTIVE-APP-THEME-TOKEN-WIRING.md
git diff --cached --stat
git diff --cached --check
git diff --cached

Sau commit:

git show --stat --oneline HEAD
git status --short

Không stage source trong commit này.

7. Tài liệu authoritative phải đọc

Đọc bản hiện hành trong repository:

docs/00-DOCUMENT-STATUS.md
docs/00-PROJECT-OVERVIEW.md
docs/01-PRODUCT-REQUIREMENTS.md
docs/02-TECHNICAL-DESIGN.md
docs/03-DATABASE-DESIGN.md
docs/05-ROADMAP.md
docs/06-APP-APPEARANCE-THEME.md
docs/16-DESIGN-SYSTEM.md
docs/17-DAY-THEME-AND-PERSONALIZATION.md
docs/18-INTERNATIONALIZATION-AND-LOCALIZATION.md
docs/audits/I18N-STRING-INVENTORY.md
README.md

Tuân thủ precedence trong:

docs/00-DOCUMENT-STATUS.md

Không dùng tài liệu superseded để ghi đè contract hiện hành.

Tìm:

rg -n -i `
  "ThemePreferences|schema version 2|33 token|table header|statistics|stats panel|progress track|progress fill|accent|CSS variable|custom theme|preset|appearance" `
  docs src src-tauri

Nếu tài liệu canonical thực tế nói rằng Table header hoặc Stats không có token độc lập:

không tự đổi contract;

báo mâu thuẫn với Settings UI và bug report;

dừng để người dùng quyết định.

Nếu tài liệu xác nhận token độc lập, tiếp tục sửa.

8. Baseline quality gates

Trước source edits, chạy:

npm.cmd run format:check
npm.cmd run i18n:lint
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build

Push-Location src-tauri
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features
Pop-Location

git diff --check

Ghi:

từng gate;

frontend test files/tests;

Rust tests;

build modules/time;

CSS/main bundle;

warnings.

Nếu baseline fail:

phân loại;

không sửa đại trà;

dừng nếu không giải thích được.

9. Audit token wiring bắt buộc

Không chỉnh CSS ngay.

Tạo:

docs/audits/APP-THEME-TOKEN-WIRING-AUDIT.md

9.1. Lập inventory đầy đủ 33 token

Đối với từng token, lập bảng:

Token ID
Settings label
Light preference path
Dark preference path
Preset source
Zod schema
Rust validation
CSS variable name
Variable whitelist entry
Apply-theme mapping
Primary UI consumers
Fallback
Preview behavior
Persist/reload behavior
Tests
Finding

Không chỉ audit ba token đang lỗi. Cần kiểm tra toàn bộ 33 token để phát hiện mapping chéo hoặc token chết.

9.2. Truy vết end-to-end

Với Table header và sáu Stats token, truy vết:

Settings color input
→ draft preference key
→ coordinator/update action
→ custom theme normalization
→ persisted ThemePreferences JSON
→ restore/bootstrap
→ CSS variable mapping
→ CSS variable được gắn vào DOM
→ component/CSS consumer
→ specificity/cascade
→ light/dark/custom behavior

9.3. Kiểm tra các nguyên nhân có thể

Phải xác minh, không đoán:

Settings control ghi nhầm key.

Token có trong schema nhưng thiếu trong CSS-variable whitelist.

Token có trong whitelist nhưng mapping sang sai variable.

Table header dùng trực tiếp Accent.

Table header có token đúng nhưng bị class/Tailwind/hard-coded color ghi đè.

Stats panel dùng card tokens thay vì stats tokens.

Stats variables được tạo nhưng không component nào consume.

DayThemeScope ghi đè App Theme variables.

Light/dark palette chọn sai.

Preview state khác persisted state.

Preset-to-custom conversion mất token.

Schema v1 → v2 migration sinh đúng token nhưng runtime mapping sai.

CSS specificity làm custom values không có hiệu lực.

Một token Settings tồn tại nhưng là dead control.

9.4. DOM/computed-style evidence

Nếu test tooling/native environment cho phép, ghi bằng chứng:

CSS variable value on root/theme host
Computed background-color of Table header
Computed colors/border/progress values of Stats panel

Không bắt buộc cài browser automation mới.

Không thêm Playwright/Chromatic/dependency.

9.5. Kết luận audit

Phân loại mỗi finding:

Root cause
Affected tokens
Affected surfaces
Severity
Fix location
Regression risk
Required tests

Tạo commit audit-only:

docs: audit app theme token wiring

Không source trong commit này.

Nếu audit phát hiện cần migration/database change:

dừng;

vì lỗi này phải sửa trong schema v2 hiện hành, không migration mới.

10. Contract sửa lỗi đã khóa

10.1. Table header

Table header phải đọc token semantic dành riêng cho Table header.

Không được:

Table header background = Accent

trừ khi canonical contract thực tế chỉ định alias này. Nếu có control Table header riêng thì alias sang Accent là không hợp lệ.

Khi người dùng đổi Table header:

preview phải thay đổi ngay;

cả light và dark palette phải dùng đúng bảng đang active;

save/reload phải giữ;

preset reset phải khôi phục;

đổi Accent không làm Table header đổi;

đổi Table header không làm Accent surfaces đổi.

Nếu có nhiều table header:

audit xem token áp dụng cho work table, Settings table và History table theo contract;

không tự mở rộng sang bề mặt không phải table header.

10.2. Accent

Accent chỉ điều khiển các bề mặt semantic được contract định nghĩa, ví dụ:

focus/accent indicators;

active markers;

progress fill mặc định nếu không có token riêng;

selected emphasis;

nhưng phải nhường cho token chuyên biệt khi token chuyên biệt tồn tại.

Không thay toàn bộ UI bằng Accent.

Không làm Table header, Stats background hoặc Stats text phụ thuộc Accent nếu chúng có token riêng.

10.3. Today statistics

Sáu Stats token phải được consume độc lập:

Stats background
Stats border
Stats primary text
Stats secondary text
Stats progress track
Stats progress fill

Kết quả:

đổi background chỉ đổi nền panel;

đổi border chỉ đổi border/dividers theo contract;

đổi primary text chỉ đổi số/giá trị chính;

đổi secondary text chỉ đổi labels/supporting text;

đổi progress track chỉ đổi track;

đổi progress fill chỉ đổi fill;

không cần reload để preview;

save/reload giữ đúng;

light/dark/custom đúng;

Day Theme không ghi đè Stats App Theme ngoài scope đã định nghĩa.

Nếu Stats panel dùng icon màu riêng:

giữ behavior hiện hành nếu không có token riêng;

không tự thêm token thứ 34.

10.4. 33-token integrity

Giữ:

ThemePreferences schema version 2
đúng 33 token

Không thêm, xóa hoặc rename persisted token nếu không có migration/versioning plan.

Không bump schema.

Không đổi database key:

appearance.themePreferences

Không thay presets immutable.

Không mutate preset khi chỉnh một token.

11. Implementation discipline

Ưu tiên sửa tại đúng seam:

domain token definitions;

preference control mapping;

CSS-variable whitelist/mapping;

reusable semantic styles;

component consumers;

tests.

Không vá bằng:

inline hard-coded color
!important hàng loạt
component đọc trực tiếp ThemePreferences
theme ID condition trong component
duplicate CSS variable
JS querySelector để ép style

Component không được biết preset ID để chọn màu.

Màu phải đi qua semantic CSS variables.

Không thay layout hoặc visual polish ngoài mức cần thiết để token có hiệu lực.

12. Automated tests bắt buộc

12.1. Domain/schema

Test:

ThemePreferences v2 có đúng 33 token.

Mỗi token có light/dark value.

Preset immutable.

Edit một token tạo custom theme.

Các token khác giữ nguyên.

v1 → v2 migration sinh sáu Stats token đúng policy.

invalid/missing token fallback an toàn.

color normalization #RGB → #RRGGBB.

Rust validation đủ 33 token.

12.2. Mapping integrity

Tạo test table-driven cho tất cả token nếu architecture cho phép:

preference token
→ expected CSS variable

Yêu cầu:

one-to-one mapping;

không duplicate variable ngoài alias được tài liệu cho phép;

không token thiếu;

không CSS variable dead;

whitelist và apply mapping đồng bộ.

Đặc biệt assert:

Table header token != Accent token
Stats background != generic card background mapping
Stats border != generic border mapping
Stats primary/secondary != generic text mapping
Stats progress track/fill map đúng variables riêng

Không so sánh value preset vì hai token có thể tình cờ cùng mã màu. So sánh semantic key/variable mapping.

12.3. Settings UI

Test:

Table header control update đúng draft key.

Accent control update đúng draft key.

Mỗi Stats control update đúng draft key.

Preview được gọi với đúng payload.

Save persist đúng.

Cancel rollback.

Reset preset.

locale switch không làm mất draft.

light/dark tab/palette đúng.

không raw key.

12.4. Component/style consumers

Test:

work table header dùng Table header variable.

không dùng Accent variable cho table header.

Stats panel background dùng stats background variable.

border/dividers dùng stats border.

values dùng stats primary.

labels dùng stats secondary.

track/fill dùng đúng variables.

DayThemeScope không override các App Theme variables ngoài contract.

custom theme preview thay đổi class/style source đúng.

Ưu tiên assertions vào semantic variable/class, tránh snapshot toàn HTML.

12.5. Persistence/reload

Test:

custom Table header round-trip.

Accent round-trip độc lập.

sáu Stats tokens round-trip.

light/dark values độc lập.

app bootstrap áp dụng persisted values.

invalid stored theme fallback.

preset reset.

no preset mutation.

12.6. Regression

Giữ pass:

App Theme presets;

custom colors;

Day Theme Default/Sakura/Coffee/Rainy;

Personalization;

Today editor/autosave;

History/Calendar;

Categories;

status/statistics/reorder/streak;

Backup;

i18n;

strict mode.

Không giảm test count mà không giải thích.

13. Native diagnostic color matrix

Cung cấp native handoff dùng các màu cố tình khác biệt.

Dùng giá trị:

Accent:
#00FF00

Table header:
#FF00FF

Stats background:
#111111

Stats border:
#FF0000

Stats primary text:
#FFFFFF

Stats secondary text:
#FFFF00

Stats progress track:
#444444

Stats progress fill:
#00FFFF

Nếu contrast validation của app không cho phép một giá trị:

dùng màu khác có contrast hợp lệ nhưng vẫn phân biệt mạnh;

ghi giá trị thực tế.

Expected:

Table header:
magenta

Accent surfaces:
green

Stats background:
near black

Stats border:
red

Stats values:
white

Stats labels:
yellow

Stats progress track:
dark gray

Stats progress fill:
cyan

Kiểm tra:

preview;

save;

reload;

light;

dark;

custom;

reset preset;

chuyển preset rồi quay custom;

Day Theme Default/Sakura/Coffee/Rainy;

Table header không đổi khi chỉ đổi Accent;

Stats không đổi theo generic Card/Accent nếu token riêng đã đặt.

Không dùng màu chẩn đoán làm preset mặc định.

14. Commit sequence

Phase A — Prompt preservation

docs: record app theme token wiring fix

Phase B — Audit

docs: audit app theme token wiring

Phase C — Code + focused tests

Sửa mapping và consumers, cùng các test trực tiếp bảo vệ fix.

Commit:

fix: wire app theme surface tokens

Commit phải pass targeted tests.

Phase D — Full regression tests

Nếu có test bổ sung tách biệt:

test: verify app theme token independence

Không bắt buộc tạo commit riêng nếu tests gắn chặt với fix.

Phase E — Documentation/worklog

Tạo:

docs/worklogs/CORRECTIVE-APP-THEME-TOKEN-WIRING-RESULT.md

Cập nhật docs canonical khi cần.

Commit:

docs: record app theme token wiring correction

Không tạo commit rỗng.

Không amend.

15. Commit discipline

Trước mỗi commit:

git status --short
git diff --stat
git diff --check

git add -- <chỉ file thuộc commit>
git diff --cached --stat
git diff --cached --check
git diff --cached

Sau mỗi commit:

git show --stat --oneline HEAD
git status --short
git log --oneline --decorate -12

Không dùng git add . nếu có file ngoài phạm vi.

Không push.

16. Documentation

Cập nhật khi thực sự cần:

docs/00-DOCUMENT-STATUS.md
docs/02-TECHNICAL-DESIGN.md
docs/05-ROADMAP.md
docs/06-APP-APPEARANCE-THEME.md
docs/16-DESIGN-SYSTEM.md
docs/18-INTERNATIONALIZATION-AND-LOCALIZATION.md
docs/audits/I18N-STRING-INVENTORY.md

Không sửa database/Backup docs nếu contract không đổi.

16.1. App Appearance Theme

Ghi rõ:

Table header token độc lập Accent.

Stats có sáu tokens riêng.

mapping semantic token → CSS variable.

precedence của specialized token so với general Accent/Card token.

preview/persist/reload.

light/dark/custom.

Không ghi implementation details quá sâu nếu file là normative spec.

16.2. Design System

Chỉ cập nhật nếu cần làm rõ semantic ownership:

specialized surface token wins over generic accent/card token

16.3. Roadmap/status

Không biến bug fix thành feature roadmap lớn.

Có thể ghi:

Corrective Checkpoint — App Theme Token Wiring:
Implementation complete — native Windows acceptance pending

Không thay trạng thái CP1–5.

Không bắt đầu Visual Fidelity.

16.4. Worklog

Worklog gồm:

bug report;

preflight;

baseline;

33-token audit;

root cause;

exact mappings sửa;

tests;

build/bundle;

commits;

native diagnostic checklist;

final status.

17. Ngoài phạm vi tuyệt đối

Không:

tiếp tục Visual Fidelity;

thêm reference images;

đổi layout;

làm Day Cover đẹp hơn;

thêm Theme Packs;

thêm preset mới;

thêm token thứ 34;

rename persisted token;

bump schema;

migration/database change;

Backup change;

dependency upgrade;

npm audit fix;

App.tsx/lib.rs đại refactor;

installer/portable;

release;

version bump;

push.

Nếu audit phát hiện lỗi khác ngoài token wiring:

ghi Deferred;

không sửa trừ khi cần thiết trực tiếp để ba lỗi này hoạt động đúng và regression pass.

18. Final verification

Sau implementation:

npm.cmd run format:check
npm.cmd run i18n:lint
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build

Push-Location src-tauri
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features
Pop-Location

git diff --check

Ghi:

all gates;

frontend test files/tests;

Rust tests;

production build;

module count/time;

CSS/main bundle;

warnings;

bundle delta;

working tree sạch sau final commit;

không installer/portable/release.

19. Native Windows acceptance handoff

Không tự đánh dấu corrective checkpoint Completed.

Cung cấp lệnh profile cô lập theo pattern project hiện hành:

Set-Location C:\dev\done-today

$env:CARGO_TARGET_DIR = Join-Path $env:TEMP 'done-today-theme-token-fix-target'
$configPath = Join-Path $env:TEMP 'done-today-theme-token-fix.json'

[System.IO.File]::WriteAllText(
  $configPath,
  '{"identifier":"com.donetoday.desktop.themetokenfix"}',
  [System.Text.UTF8Encoding]::new($false)
)

npm.cmd run tauri -- dev --config $configPath

Nếu project cần build.beforeDevCommand/devUrl override, dùng pattern đã được worklog hiện hành chứng minh.

Native checklist

Table header

đổi riêng Table header;

preview ngay;

save;

reload;

light;

dark;

reset;

đổi Accent không làm Table header đổi.

Accent

đổi riêng Accent;

kiểm tra đúng accent surfaces;

Table header giữ nguyên;

Stats specialized surfaces giữ nguyên.

Today statistics

Kiểm tra riêng từng token:

background;

border;

primary text;

secondary text;

track;

fill.

Mỗi lần chỉ đổi một token để xác minh independence.

Sau đó áp dụng diagnostic matrix đầy đủ.

Presets/custom

Done Today;

Forest;

Ocean;

Lavender;

Warm Sand;

Monochrome;

custom;

preset constants không bị mutate;

chuyển preset/custom/reload.

Theme boundaries

App Theme light/dark/custom;

Day Theme Default/Sakura/Coffee/Rainy;

Today;

History;

Settings;

Table header;

Stats.

Regression

editor/autosave;

Categories;

History/Calendar;

Theme Picker;

Personalization;

vi/en;

900×600/default/maximize.

Evidence limits

Được phép báo native visual/token acceptance sau khi người dùng xác nhận.

Không tuyên bố screen reader/Accessibility Tree nếu chưa test.

Cleanup:

$profilePath = Join-Path $env:APPDATA 'com.donetoday.desktop.themetokenfix'

if (Test-Path -LiteralPath $profilePath) {
  Remove-Item -LiteralPath $profilePath -Recurse -Force
}

Remove-Item -LiteralPath $configPath -Force -ErrorAction SilentlyContinue

Không xóa profile chính.

Dừng và chờ người dùng nghiệm thu.

Không closeout trong cùng task.

20. Final status bắt buộc

Kết thúc với:

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
Implementation complete — native Windows acceptance pending

Release Readiness Checkpoint 1 — Visual Fidelity & Final UI Polish:
Not started / paused until corrective checkpoint passes native acceptance

Không bắt đầu Visual Fidelity trong task này.

21. Báo cáo cuối bắt buộc

Báo cáo trong chat và:

docs/worklogs/CORRECTIVE-APP-THEME-TOKEN-WIRING-RESULT.md

Cấu trúc:

A. Workspace/preflight

path;

repository;

branch;

initial HEAD;

origin relation;

tree;

ancestor;

toolchain;

AGENTS;

main checkout.

B. Prompt preservation

path;

commit.

C. Baseline

gates;

tests;

build;

bundle.

D. 33-token audit

inventory;

dead/missing/duplicate mappings;

Table header;

Accent;

six Stats tokens.

E. Root cause

exact files/functions/variables;

cascade/specificity;

preview/persistence;

affected surfaces.

F. Fix

domain/mapping;

Settings controls;

CSS variables;

consumers;

no schema change;

commit.

G. Tests

mapping integrity;

Settings;

consumers;

persistence;

regression;

counts.

H. Theme boundaries

light/dark/custom;

presets;

Day Theme;

no preset mutation.

I. Verification

commands;

build;

bundle;

diff check.

J. Documentation/worklog

files;

status;

implementation pointer.

K. Git

full commit hashes/messages;

stats;

final HEAD;

origin relation;

clean tree;

no push/release.

L. Native handoff

command;

diagnostic colors;

checklist;

cleanup;

pending statement.

M. Deferred

findings ngoài phạm vi.

Dừng sau báo cáo.
