DONE TODAY — DAY THEME CHECKPOINT 5 — LIGHT PERSONALIZATION

Bạn đang chạy trong Codex Desktop trên Windows và phải làm việc trực tiếp trong repository chính:

C:\dev\done-today

Mục tiêu của nhiệm vụ này là triển khai:

Day Theme Checkpoint 5 — Light Personalization

Checkpoint này chỉ bổ sung ba tùy chọn cá nhân hóa nhẹ, có kiểm soát cho từng ngày:

Cover variant: Theme default hoặc Minimal.

Day symbol: Theme default, None hoặc một symbol curated.

Journal font: Theme default, Clean UI hoặc Classic Serif.

Không triển khai freeform editor, sticker, custom CSS, display title, accent variant, theme pack hoặc bất kỳ hệ thống tùy biến nâng cao nào.

1. Trạng thái dự án đã biết

Repository chính:

C:\dev\done-today

Branch:

master

Checkpoint 4 closeout commit đã biết:

fd71c06732cf45527d4b4ac40ce8f14e35d854d9
docs: complete day theme calendar and history

Các trạng thái đã hoàn thành:

Engineering Hardening Checkpoint 1:
Completed — local and remote CI verification passed

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

Các built-in Day Theme hiện hành theo curated registry order:

done-today-default@1
sakura@1
coffee@1
rainy@1

Database hiện đã có tối thiểu:

daily_logs.theme_id
daily_logs.theme_version

Không được mặc định implementation chính xác chỉ từ prompt này. Phải audit source và tài liệu canonical hiện hành trước khi sửa.

2. Workspace guard bắt buộc cho Codex Desktop

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
hoặc Git hiển thị tương đương C:/dev/done-today

Branch:
master

Working tree:
clean

Remote origin:
https://github.com/Ronn-G/Done-Today

Nếu repository root khác C:\dev\done-today, đặc biệt nếu đang ở:

C:\Users\long\Documents\Làm app nhật ký hàng ngày

thì:

không sửa file;

không tạo commit;

không chuyển branch;

dừng và báo người dùng mở đúng workspace.

Nếu Codex Desktop tự tạo isolated worktree hoặc detached HEAD:

không triển khai;

báo rõ đường dẫn worktree, HEAD và branch/detached state;

dừng.

Mọi commit của nhiệm vụ phải xuất hiện trực tiếp trong:

C:\dev\done-today\master

Không được chỉ để thay đổi trong Codex-managed review thread, snapshot hoặc isolated workspace.

3. Quy tắc Git an toàn

Không được chạy:

git reset
git reset --hard
git clean
git checkout
git switch
git restore
git stash
git stash pop
git rebase
git merge
git cherry-pick
git commit --amend
git push
git branch -D
git worktree remove
git gc
git prune

Không xóa hoặc ghi đè thay đổi không thuộc nhiệm vụ.

Không dùng git add . khi có file ngoài phạm vi.

Không push.

Không build installer, portable ZIP hoặc release artifact.

Nếu working tree ban đầu không sạch:

liệt kê chính xác file thay đổi;

không sửa gì;

dừng.

4. Lưu prompt và worklog để không phụ thuộc lịch sử Codex Desktop

Ngay sau khi preflight hợp lệ và trước khi sửa source:

Tạo thư mục nếu chưa có:

docs/prompts
docs/worklogs

Lưu toàn bộ nhiệm vụ này vào:

docs/prompts/DAY-THEME-CHECKPOINT-05-LIGHT-PERSONALIZATION.md

Tạo commit đầu tiên chỉ chứa prompt:

docs: record day theme checkpoint 5 task

Trước commit:

git add -- docs/prompts/DAY-THEME-CHECKPOINT-05-LIGHT-PERSONALIZATION.md
git diff --cached --stat
git diff --cached --check
git diff --cached

Sau commit:

git show --stat --oneline HEAD
git status --short

Trong quá trình triển khai, commit từng phần hoàn chỉnh.

Trước khi kết thúc, lưu báo cáo cuối vào:

docs/worklogs/DAY-THEME-CHECKPOINT-05-RESULT.md

Báo cáo trong file phải chứa cùng bằng chứng với câu trả lời cuối.

5. Preflight đầy đủ

Sau workspace guard, chạy:

Set-Location C:\dev\done-today

git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -25
git remote -v
git status --branch --short

git merge-base --is-ancestor fd71c06732cf45527d4b4ac40ce8f14e35d854d9 HEAD

git fetch origin
git status --branch --short
git log origin/master..master --oneline

node --version
npm.cmd --version
rustc --version
cargo --version

Tìm mọi AGENTS.md áp dụng:

Get-ChildItem -Path C:\dev\done-today -Filter AGENTS.md -Recurse -Force

Báo ngắn:

repository;

branch;

initial HEAD;

local/remote relation;

working tree;

ancestor result;

Node/npm/Rust/Cargo;

AGENTS.md.

Nếu HEAD mới hơn fd71c06:

đọc toàn bộ commit mới hơn;

xác minh chúng hợp lệ và không xung đột;

dùng HEAD thực tế làm baseline;

không quay lùi lịch sử.

Nếu HEAD không chứa fd71c06:

dừng và báo.

6. Nguồn authoritative phải đọc

Đọc bản hiện hành trong repository, không dựa riêng vào nội dung prompt.

Tối thiểu:

docs/00-DOCUMENT-STATUS.md
docs/00-PROJECT-OVERVIEW.md
docs/01-PRODUCT-REQUIREMENTS.md
docs/02-TECHNICAL-DESIGN.md
docs/03-DATABASE-DESIGN.md
docs/05-ROADMAP.md
docs/06-APP-APPEARANCE-THEME.md
docs/07-WORK-CATEGORIES.md
docs/08-BACKUP-RESTORE.md
docs/16-DESIGN-SYSTEM.md
docs/17-DAY-THEME-AND-PERSONALIZATION.md
docs/18-INTERNATIONALIZATION-AND-LOCALIZATION.md
docs/audits/I18N-STRING-INVENTORY.md
docs/worklogs/DAY-THEME-CHECKPOINT-04-RESULT.md
README.md

Tuân thủ precedence trong:

docs/00-DOCUMENT-STATUS.md

Nguồn sự thật:

05-ROADMAP.md: trạng thái delivery.

17-DAY-THEME-AND-PERSONALIZATION.md: Day Theme và Personalization.

16-DESIGN-SYSTEM.md: UI, responsive, accessibility.

06-APP-APPEARANCE-THEME.md: App Theme toàn cục.

08-BACKUP-RESTORE.md: Backup v1.

18-INTERNATIONALIZATION-AND-LOCALIZATION.md: i18n.

02-TECHNICAL-DESIGN.md: kiến trúc và quality gates.

Không dùng tài liệu superseded để ghi đè contract hiện hành.

Tìm các phần liên quan:

rg -n -i `
  "Checkpoint 5|Phase 5|Personalization nhẹ|Light Personalization|cover_variant|cover variant|day_symbol|day symbol|journal font|journalFont|Day Style|freeform" `
  docs src src-tauri

Nếu tài liệu hiện hành mâu thuẫn với implementation hoặc với phạm vi prompt:

không tự chọn phương án thuận tiện;

dừng và báo blocker cụ thể.

7. Baseline verification bắt buộc

Trước khi sửa source, chạy đầy đủ:

npm.cmd run format:check
npm.cmd run i18n:lint
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build

cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features

git diff --check

Nếu Cargo phải chạy trong src-tauri, dùng đúng working directory và ghi rõ.

Ghi:

pass/fail từng command;

số test file frontend;

số test frontend;

số test Rust;

production build;

main bundle;

Day Theme picker chunk;

Calendar/History bundle nếu có;

motif chunks;

warning/error.

Nếu baseline fail:

xác định lỗi tồn tại từ baseline hay do môi trường;

không sửa đại trà;

chỉ tiếp tục khi failure được giải thích chắc chắn hoặc thuộc đúng phạm vi.

Không được tuyên bố baseline pass nếu chưa chạy.

8. Audit implementation hiện hành trước khi thiết kế

Audit source thực tế, tối thiểu:

8.1. Day Theme và Day Style

typed contract;

registry;

validation;

exact/latest/default/emergency fallback;

current theme metadata;

DayThemeScope;

DayCover;

motif/asset resolver;

Theme Picker;

Calendar/History summary;

Backup v1 theme fields;

current migration version;

minimal daily-log creation;

stale-date guards;

save/retry coordinator patterns.

Xác định rõ liệu source đã có:

coverVariant
daySymbol
journalFontRole

hoặc contract tương đương ở bất kỳ tầng nào.

Không tạo duplicate contract nếu đã tồn tại.

8.2. Current Day Cover actions

Xác định:

Theme Picker mở từ đâu;

action surface hiện có;

có overflow hoặc secondary action pattern không;

kích thước và responsive behavior;

focus restoration;

lazy-loading boundaries.

Ưu tiên thêm một secondary action:

Personalize this day

gần Theme Picker nhưng không cạnh tranh với primary workflow.

Nếu UI hiện hành không có đủ chỗ hoặc tạo quá nhiều action, được phép mở Personalization từ một action phụ bên trong Theme Picker, nhưng phải ghi lý do và không biến dialog thành layout phức tạp.

Không thêm sidebar item hoặc route mới.

8.3. Persistence và Backup

Audit:

daily_logs;

migration mechanism;

Rust structs;

Tauri commands;

frontend repository;

runtime Zod validation;

Backup v1 canonical payload;

old backup fixture;

checksum;

Merge;

Replace;

receipt;

null/optional serialization;

conflict rules.

Checkpoint 5 cần persistence theo ngày. Nếu schema hiện chưa có ba field, migration mới có thể cần thiết.

Chỉ được thêm migration tối thiểu theo mục 12 của prompt này.

Không bump Backup version.

8.4. Calendar và History

Xác định cách:

Calendar lấy symbol từ theme registry;

History hiển thị symbol;

summary query hiện hành;

null/unknown fallback;

no-N+1 contract.

Personalized day symbol phải có thể xuất hiện trong Calendar/History mà không tải full log hoặc motif.

8.5. Typography

Audit:

CSS font tokens/stacks;

theme typography mapping;

Windows/Vietnamese support;

table/control font boundaries;

textarea/editor styles;

Day Cover title styles.

Không tải font từ mạng.

Không thêm font package hoặc font binary.

8.6. UI primitives

Audit:

dialog;

radio group;

segmented controls;

tooltip;

focus trap;

loading/error/Retry;

visually-hidden utility;

forced-colors;

reduced-motion;

responsive dialog/panel layout.

Báo ngắn kết luận audit và kế hoạch implementation trước khi code.

9. Phạm vi sản phẩm đã khóa

Checkpoint 5 chỉ gồm:

A. Cover variant
B. Day symbol
C. Curated journal font

Không triển khai:

display title
accent variant
custom colors
custom font upload
freeform theme editor
sticker
layout builder
custom CSS
theme pack

9.1. Cover variant

Phiên bản đầu chỉ có:

Theme default
Minimal

Quy tắc:

NULL trong database = Theme default.

"minimal" = Minimal.

Không lưu "default".

Minimal giữ nguyên chiều cao và cấu trúc Day Cover.

Minimal không tải/render motif hoặc full cover asset.

Minimal dùng fallback gradient/treatment từ resolved theme.

Date, title, controls và contrast không đổi.

Minimal không làm thay đổi Calendar/History layout.

Không thêm per-theme asset mới cho Checkpoint 5.

9.2. Day symbol

Day symbol là lựa chọn curated theo ngày.

Persistence values phải là stable logical IDs, không lưu emoji hoặc asset path.

Bộ curated ban đầu:

NULL        = Theme default symbol
none        = Không hiển thị personalized symbol
sparkle     = Dấu ấn / khoảnh khắc nổi bật
focus       = Tập trung
growth      = Tiến bộ
calm        = Bình yên
celebrate   = Hoàn thành / ăn mừng

Tên ID có thể điều chỉnh theo naming convention hiện hành, nhưng:

phải ổn định;

phải typed;

phải validate ở frontend và Rust;

phải có vi/en label;

không hard-code mapping trong Calendar/History/DayCover component;

phải dùng một curated registry/module làm nguồn sự thật;

ưu tiên icon library đã có trong project;

không thêm dependency;

không lưu SVG/emoji/path vào database.

Runtime rules:

NULL: dùng theme registry symbol hiện hành.

none: ẩn symbol tùy biến; Calendar/History vẫn giữ has-log/theme semantics cần thiết.

curated ID: dùng symbol được người dùng chọn.

unknown stored ID: giữ dữ liệu gốc, fallback về theme default, không tự sửa database.

Calendar và History:

dùng personalized symbol nếu có;

nếu none, không hiển thị symbol nhưng vẫn giữ accent/theme accessible name;

nếu NULL, dùng theme default symbol;

không tải motif/full cover;

no N+1.

9.3. Curated journal font

Persistence:

NULL      = Theme default
ui        = Clean UI
journal   = Classic Serif

Tên ID có thể điều chỉnh theo convention hiện hành, nhưng phải có đúng ba lựa chọn người dùng:

Theme default
Clean
Classic Serif

Quy tắc:

không lưu "default";

không tải font từ mạng;

không thêm font file;

dùng system/local fallback stack hỗ trợ tiếng Việt và Windows;

ui dùng stack UI hiện hành;

journal dùng curated serif stack an toàn, ví dụ Georgia/Times New Roman/serif với fallback phù hợp;

không dùng font display khó đọc;

không đổi font của app shell, sidebar, buttons, dialogs, table headers, status labels hoặc navigation;

chỉ áp dụng trong Day Theme scope cho:

Day Cover title/subtitle phù hợp;

user journal text/editable work content nếu readability được giữ;

section text được định nghĩa là journal content;

không áp dụng vào control chrome;

không làm layout nhảy mạnh;

vi/en và dấu tiếng Việt phải hiển thị đúng;

unknown stored ID fallback về Theme default, giữ metadata gốc.

Nếu audit cho thấy áp dụng serif vào editable table content làm giảm khả năng đọc hoặc phá layout, giới hạn journal font vào Day Cover title và user-entered text, giữ labels/headers/UI bằng font UI. Ghi quyết định thực tế trong worklog.

10. Definition of Done

Sau checkpoint này, người dùng phải có thể:

Mở Personalization từ Day Cover.

Chọn Cover:

Theme default;

Minimal.

Chọn Day symbol:

Theme default;

None;

Sparkle;

Focus;

Growth;

Calm;

Celebrate.

Chọn Journal font:

Theme default;

Clean;

Classic Serif.

Preview thay đổi ngay trên ngày hiện tại nhưng chưa persist.

Cancel, Close, Escape, outside close, unmount và đổi ngày rollback preview.

Apply persist atomically cho đúng ngày.

Duplicate Apply bị khóa.

Saving/success/error/Retry rõ ràng.

Stale completion của ngày trước không cập nhật ngày mới.

Reset personalization không reset Day Theme, nội dung hoặc App Theme.

Tất cả default values normalize về NULL.

Mở/preview/cancel không tạo daily log.

Apply tất cả default trên ngày trống không tạo daily log.

Apply ít nhất một personalization non-default trên ngày trống tạo đúng một minimal daily log trong transaction.

Theme metadata và personalization metadata được merge vào log hiện hành mà không làm mất editor draft/autosave.

Mở lại app khôi phục đúng personalization theo ngày.

Calendar/History dùng personalized symbol nhẹ mà không N+1/full log.

Backup/restore round-trip ba field mới.

Backup cũ không có ba field vẫn import được.

Existing data với tất cả field NULL export canonical như trước hoặc theo policy hiện hành mà không phá legacy fixture/checksum tests.

vi/en không raw translation key.

Keyboard/focus/accessibility/responsive đạt automated/source evidence.

App Theme và Day Theme boundary không đổi.

Không regression Theme Picker, Calendar, History, Today, autosave, categories, status, statistics, reorder.

Kết thúc implementation ở trạng thái:

Day Theme Checkpoint 5 — Light Personalization:
Implementation complete — native Windows acceptance pending

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 6+:
Not started

Không tự đánh dấu Checkpoint 5 là Completed trước native acceptance của người dùng.

11. UI/UX đã khóa

11.1. Entry point

Ưu tiên một secondary action trong Day Cover:

Personalize this day

Yêu cầu:

icon + accessible name;

secondary priority;

không cạnh tranh với Add Row hoặc core journal actions;

không làm Day Cover cao hơn đáng kể;

focus visible;

lazy-load dialog/panel.

Nếu action density không phù hợp, đặt trong cùng secondary action cluster với Theme Picker hoặc bên trong Theme Picker dưới một control rõ ràng. Không thêm route mới.

11.2. Dialog/panel

Tạo component typed tương đương:

DayPersonalizationDialog

Lazy-load từ Day Cover.

Nội dung gồm ba section/radiogroup:

Cover
Day symbol
Journal font

Mỗi lựa chọn phải có:

label;

selected state;

text/checkmark hoặc semantic state, không chỉ màu;

keyboard operation;

accessible description khi cần.

Footer:

Reset to theme defaults
Cancel
Apply

Quy tắc:

Reset to theme defaults chỉ thay draft trong dialog, chưa persist cho đến Apply.

Reset không đổi Day Theme.

Reset không xóa journal content.

Cancel rollback toàn bộ preview.

Apply atomically persist ba giá trị.

Dialog có name/description.

Focus trap.

Escape/outside close.

Focus restore.

Không để raw translation key.

11.3. Live preview

Preview phải áp dụng vào Day Theme scope của ngày đang xem:

cover minimal/default;

day symbol;

journal font.

Preview không:

ghi database;

reload route;

làm mất editor draft;

flush sai autosave;

thay App Theme;

thay Calendar/History persisted state trước Apply;

tạo daily log.

Khi đổi ngày trong lúc dialog mở:

đóng dialog;

rollback preview;

không mang draft sang ngày mới;

request cũ không được apply vào ngày mới.

11.4. Responsive

Dialog/panel:

desktop có thể dùng 2 cột nếu hợp lý;

900×600 phải không clipping;

viewport hẹp chuyển 1 cột;

footer luôn truy cập được;

không horizontal scroll;

vi/en không overflow.

Không tạo thumbnail nặng.

12. Persistence và migration

Nếu audit xác nhận schema chưa có ba field, tạo migration tiếp theo theo sequence hiện hành, dự kiến:

006_day_personalization.sql

Tên thực tế phải theo naming convention repository.

Chỉ thêm ba nullable columns:

cover_variant TEXT NULL
day_symbol TEXT NULL
journal_font_role TEXT NULL

Không thêm bảng mới.

Không thêm foreign key.

Không thêm persisted display title hoặc accent variant.

12.1. Validation

Allowed values:

cover_variant:
NULL | minimal

day_symbol:
NULL | none | sparkle | focus | growth | calm | celebrate

journal_font_role:
NULL | ui | journal

Có thể dùng CHECK constraint nếu migration pattern và SQLite version hiện hành hỗ trợ an toàn. Nếu repository không dùng CHECK cho optional enum mới, validate chặt tại Rust/application/persistence boundary và ghi lý do.

Rules:

null/default consistency;

unknown imported value phải được xử lý theo Backup policy hiện hành;

direct app writes chỉ chấp nhận allowed values;

không xóa daily log nếu metadata invalid;

transaction-safe;

migration idempotent theo migrator;

upgrade test từ schema 005;

data cũ giữ nguyên;

rollback test nếu framework hiện hành hỗ trợ.

Nếu migration mới xung đột với authoritative docs hoặc migration mechanism:

dừng và hỏi người dùng;

không tự thiết kế schema khác.

12.2. Atomic apply

Tạo command/use case typed tương đương:

apply_day_personalization

hoặc mở rộng command metadata hiện hành nếu an toàn và cohesive.

Yêu cầu:

validate date và values;

update đúng daily log;

explicit non-default personalization trên ngày trống tạo đúng một minimal daily log;

all-default/null trên ngày trống không tạo log;

existing log update không mất theme, timestamps/business data;

transaction;

duplicate/stale protections frontend;

response runtime-validated;

no bare as T.

Không dùng ba request độc lập cho ba fields.

13. Backup v1 compatibility

Không bump backup version.

Mở rộng Backup v1 bằng optional fields:

coverVariant
daySymbol
journalFontRole

Quy tắc:

backup cũ thiếu fields vẫn hợp lệ;

restore/merge/replace round-trip fields;

malformed values được xử lý theo validation/error architecture hiện hành;

unknown future fields policy giữ nguyên;

checksum algorithm không đổi;

canonicalization deterministic;

import receipt behavior không đổi;

existing legacy fixture vẫn pass;

existing records với ba field null không bị biến thành explicit defaults nếu policy hiện hành omit optional nulls;

không làm thay đổi checksum kỳ vọng của legacy fixture chỉ vì thêm optional null fields;

personalized data phải ảnh hưởng checksum đúng;

Merge conflict dùng cùng source-of-truth rule của daily log/theme metadata hiện hành;

không tạo duplicate record chỉ vì personalization khác.

Nếu Backup v1 architecture không thể thêm optional fields mà không bump version, dừng và báo thay vì tự tạo Backup v2.

14. Domain và registry

Tạo typed domain contract tương đương:

interface DayPersonalization {
  coverVariant: CoverVariant | null;
  daySymbol: DaySymbolId | null;
  journalFontRole: JournalFontRole | null;
}

Yêu cầu:

immutable curated definitions;

stable IDs;

Zod schemas;

Rust validation;

fallback helpers;

labels/descriptions qua i18n;

no component hard-code IDs;

no asset paths in persistence;

no emoji persistence.

Tạo curated registry/module cho day symbols:

ID
icon/component token
labelKey
descriptionKey

Không lưu React component trong pure domain nếu vi phạm architecture; có thể tách logical registry và presentation icon mapping theo layer hiện hành.

Cover variant và font role cũng phải có typed definitions và presentation metadata.

15. Day Cover rendering

15.1. Cover variant

Theme default:

behavior hiện hành không đổi.

Minimal:

giữ layout/height;

không render motif/full cover asset;

dùng resolved theme fallback gradient;

giữ overlay/text tone/contrast;

giữ date/title/actions;

không tạo broken image;

không tải dynamic motif chunk chỉ vì Minimal đang active.

Switch preview/apply phải không reload.

15.2. Day symbol

Render vị trí nhẹ trong Day Cover, không làm hero rối.

Rules:

theme default uses resolved theme symbol behavior;

none hides optional symbol;

curated symbol uses current icon system;

accessible label không đọc lặp vô ích;

symbol decorative thì aria-hidden, còn state được mô tả ở personalization control;

không dùng symbol để thay thế status.

15.3. Journal font

Apply CSS variable/class scoped trong DayThemeScope.

Không sửa global document.body font.

Không thay App shell.

Không làm controls/dialogs/buttons dùng serif.

Không làm table headers/status labels dùng serif.

User-entered journal content và cover text phải đọc được ở vi/en.

16. Calendar và History integration

Mở rộng lightweight summaries chỉ khi cần:

daySymbol

Không cần trả:

coverVariant
journalFontRole

cho Calendar/History nếu UI không sử dụng.

Query:

cùng SQL hiện hành;

không N+1;

no full log;

indexed range/pagination giữ nguyên;

nullable field;

unknown stored ID preserved at data layer;

frontend fallback.

Presentation:

personalized symbol ưu tiên hơn theme default symbol;

none không hiện symbol;

theme accent/name vẫn giữ identity;

accessible labels phân biệt theme và personalized symbol nếu có giá trị;

không tải motif/full cover;

không làm Calendar cell/card layout nhảy mạnh.

Existing CP4 keyboard/navigation/pagination/stale behavior phải pass.

17. State, concurrency và error behavior

Tách rõ:

persisted personalization
draft personalization
temporary preview

Mọi đường đóng phải rollback preview:

Cancel;

Close button;

Escape;

outside close;

unmount;

route/date change.

Apply:

khóa duplicate request;

saving;

success;

error;

Retry;

stale-date guard;

stale completion không update ngày mới;

retry dùng payload đúng ngày ban đầu chỉ khi ngày vẫn hợp lệ theo coordinator contract;

không log journal content hoặc raw payload nhạy cảm.

Nếu command fail:

persisted state giữ nguyên;

preview rollback hoặc giữ draft theo UX pattern hiện hành;

editor content không mất;

user có Retry;

no raw Rust/SQLite/Zod error.

18. Accessibility

Automated/source requirements:

dialog name/description;

section headings;

radiogroup/radio semantics;

checked/selected state;

không chỉ dựa vào màu;

keyboard Tab/Shift+Tab;

Arrow keys trong radio group nếu primitive hỗ trợ;

Enter/Space;

Escape;

outside close;

focus trap;

focus restore;

saving/error aria-live phù hợp;

forced-colors;

reduced-motion;

visible focus;

font previews có text label, không chỉ mẫu chữ.

Day symbol choices:

icon không phải accessible name duy nhất;

vi/en labels;

none và theme default phân biệt rõ.

Journal font choices:

preview text hỗ trợ tiếng Việt;

label vẫn dùng UI font để đọc ổn định;

font choice không làm control layout thay đổi.

Không tuyên bố screen reader/Accessibility Tree/native visual pass trước nghiệm thu người dùng.

19. i18n

Mọi visible/accessibility copy mới phải có vi/en.

Có thể cần key cho:

Personalize this day
Personalization dialog title/description
Cover
Theme default
Minimal
Day symbol
None
Sparkle
Focus
Growth
Calm
Celebrate
Journal font
Clean
Classic Serif
Reset to theme defaults
Saving
Saved
Retry
Personalization save error

Tái sử dụng common keys khi phù hợp.

Không dịch:

stable IDs;

database values;

user content;

route dates.

Dùng typed resources và parity tests hiện hành.

Cập nhật I18N inventory.

Không raw translation key.

20. Rust/Tauri/TypeScript contract

Nếu thêm command hoặc response:

Rust structs typed;

serde camelCase theo convention;

structured namespaced errors;

scalar params only;

parameterized SQL;

repository interface;

Tauri repository implementation;

Zod runtime response schema;

invoke boundary hiện hành;

no bare cast;

tests invalid response;

null/default/unknown behavior.

Không trả raw database error ra UI.

Không sửa command không liên quan.

21. Testing bắt buộc

21.1. Domain

Test:

cover variant validation;

day symbol registry;

journal font validation;

null/default normalization;

unknown fallback;

theme default symbol resolution;

none;

personalized symbol precedence;

immutable curated registry;

no hard-coded UI mapping.

21.2. Migration/Rust

Test:

migration 005 → new schema;

existing data unchanged;

nullable fields;

allowed values;

invalid app write rejected;

atomic apply;

empty day + all defaults = no log;

empty day + non-default = one minimal log;

existing log merge preserves theme/content;

reset personalization preserves theme;

repeated apply idempotent/does not duplicate;

transaction rollback on failure if testable.

21.3. Backup

Test:

old backup without fields imports;

legacy fixture checksum remains valid;

null fields canonical behavior;

personalized export/import;

Merge;

Replace;

receipt;

checksum changes when personalized values change;

malformed values rejected/normalized according to policy;

unknown theme plus personalization fallback;

no Backup version bump.

21.4. Infrastructure/IPC

Test:

valid record;

valid null fields;

invalid enum;

invalid primitive;

unknown extra fields policy;

transport error;

normalized error;

no raw Zod output.

21.5. Dialog/UI

Test:

lazy open from Day Cover;

initial persisted values;

all options vi/en;

radio semantics;

preview cover;

preview symbol;

preview font;

Reset draft;

Cancel rollback;

Escape rollback;

outside close rollback;

unmount/date change rollback;

Apply;

duplicate Apply lock;

Saving/success/error/Retry;

stale completion guard;

focus trap/restore;

900×600 responsive source behavior;

forced-colors/reduced-motion classes.

21.6. Day Cover

Test:

default unchanged;

minimal keeps layout and gradient;

minimal does not load motif/full cover;

symbol default/none/custom;

journal font scoped;

App shell unaffected;

controls remain UI font;

Vietnamese text rendering stack is present.

21.7. Calendar/History

Test:

null uses theme symbol;

none hides symbol;

curated symbol displayed;

unknown falls back;

no N+1;

no full motif import;

click/keyboard old-day behavior unchanged;

pagination/stale/loading/error unchanged.

21.8. Compatibility

Giữ pass:

Day Theme Picker;

preview/apply/cancel;

Default NULL/NULL;

CP4 Calendar;

CP4 History;

old-day restoration;

App Theme;

autosave/editor;

categories;

status;

statistics;

reorder;

streak;

i18n;

strict mode;

formatting;

CI-equivalent local gates.

Không giảm test count mà không giải thích.

22. Implementation sequence và commits

Phase A — Prompt preservation

Commit:

docs: record day theme checkpoint 5 task

Phase B — Persistence, migration và Backup

migration;

Rust structs/validation;

atomic apply;

repository/Tauri;

Zod response;

Backup v1 optional fields;

migration/backup tests.

Commit:

feat: persist light day personalization

Phase C — Domain and Personalization UI

typed contracts;

curated symbols/fonts/cover options;

lazy dialog;

preview/apply/cancel/reset;

i18n;

accessibility;

tests.

Commit:

feat: add light day personalization

Phase D — Day Cover, Calendar và History integration

cover variant rendering;

symbol rendering;

font scoping;

Calendar/History symbol precedence;

asset loading;

regression tests.

Commit:

feat: apply day personalization across journal views

Nếu Phase C/D hợp lý hơn khi tách khác, được phép đổi commit boundary nhưng phải giữ commits cohesive và có message rõ.

Phase E — Compatibility closure

full targeted regression;

Backup compatibility;

stale/date guards;

bundle/source asset evidence;

accessibility tests.

Commit:

test: verify light personalization compatibility

Phase F — Documentation/worklog

Cập nhật docs, lưu worklog, native pending.

Commit:

docs: record day theme checkpoint 5 implementation

Không tạo commit rỗng.

23. Commit discipline

Trước mỗi commit:

git status --short
git diff --stat
git diff --check

git add -- <chỉ các file thuộc commit>
git diff --cached --stat
git diff --cached --check
git diff --cached

Không dùng git add . nếu có file ngoài phạm vi.

Sau mỗi commit:

git show --stat --oneline HEAD
git status --short
git log --oneline --decorate -10

Không amend.

Không squash.

Không rebase.

Không push.

Mọi full commit hash phải ghi vào worklog và báo cáo cuối.

24. Documentation

Sau implementation, cập nhật khi cần:

docs/00-DOCUMENT-STATUS.md
docs/02-TECHNICAL-DESIGN.md
docs/03-DATABASE-DESIGN.md
docs/05-ROADMAP.md
docs/08-BACKUP-RESTORE.md
docs/17-DAY-THEME-AND-PERSONALIZATION.md
docs/18-INTERNATIONALIZATION-AND-LOCALIZATION.md
docs/audits/I18N-STRING-INVENTORY.md

Chỉ sửa file thật sự cần đồng bộ.

24.1. Roadmap

Cập nhật:

Day Theme Checkpoint 5 — Light Personalization:
Implementation complete — native Windows acceptance pending

Ghi:

cover variant;

day symbol;

curated journal font;

migration/Backup v1;

tests;

local verification;

native pending.

Giữ:

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 6+:
Not started

24.2. Day Theme specification

Ghi implementation record:

exact scope;

stable IDs;

null/default rules;

persistence;

Backup;

preview/apply;

font boundary;

Calendar/History symbol behavior;

accessibility;

native pending;

non-goals.

Không thêm display title/accent variant vào implementation.

24.3. Database Design

Nếu migration mới được thêm:

columns;

null/default semantics;

validation;

no new table/FK;

migration number;

compatibility.

24.4. Backup

Ghi optional fields và backward compatibility.

Không đổi Backup v1 version.

24.5. Worklog

Tạo:

docs/worklogs/DAY-THEME-CHECKPOINT-05-RESULT.md

Gồm:

workspace/preflight;

prompt preservation;

baseline;

audit;

migration/data;

Backup;

UI;

Day Cover;

Calendar/History;

accessibility;

tests;

bundle;

commits;

native checklist;

final status.

25. Compatibility invariants

Không được thay đổi behavior hoặc persisted contract ngoài ba optional fields mới:

Migration 001–current
Existing columns
Backup v1 version
Canonical checksum algorithm
Legacy backup fixture behavior
Merge
Replace
Import receipts
Locale bootstrap/persistence
App Theme light/dark/custom
App Theme custom values
Day Theme IDs/versions/order
Theme Picker
Theme preview/apply/cancel
Default theme NULL/NULL
Minimal daily-log rules ngoài extension đã định nghĩa
Autosave debounce
Editor save queue
Work Categories
Completed bucket
Reorder
Status
Statistics
Streak
Calendar range query
History pagination
Old-day restoration
User journal content

Không thêm bảng mới.

Không thêm dependency.

Không đổi theme asset paths.

Không preload assets.

26. Ngoài phạm vi tuyệt đối

Không triển khai:

display title;

accent variant;

custom cover upload;

custom symbol upload;

emoji picker tự do;

font upload;

font download;

custom CSS;

freeform editor;

sticker;

drag-drop;

layout builder;

theme pack;

Midnight;

Forest;

marketplace;

premium/lock flow;

reminder;

CSV/Markdown export;

cloud sync;

mobile;

AI feature;

App.tsx modularization;

lib.rs modularization;

generic coordinator refactor;

CSP hardening;

installer icon;

dependency vulnerability upgrade;

npm audit fix;

release packaging;

installer;

portable ZIP;

version bump;

release;

push.

Nếu phát hiện vấn đề ngoài phạm vi, ghi ngắn trong Deferred; không sửa.

27. Final verification

Sau tất cả implementation, chạy:

npm.cmd run format:check
npm.cmd run i18n:lint
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build

cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features

git diff --check

Nếu Cargo cần chạy trong src-tauri, dùng đúng thư mục.

Ghi:

format;

i18n count;

frontend test file count;

frontend test count;

Rust test count;

build modules/time;

main bundle;

CSS;

Theme Picker;

Personalization dialog chunk;

Calendar/History chunk;

motif chunks;

warnings;

no installer/portable/release.

Đặc biệt xác minh:

Personalization dialog lazy-loaded;

Minimal không kéo motif;

motif chunks vẫn dynamic;

Calendar/History không tải full motif;

no N+1;

existing CI-equivalent gates pass;

working tree sạch sau commit cuối.

28. Native Windows acceptance handoff

Không tự đánh dấu Checkpoint 5 Completed.

Sau automated implementation, cung cấp lệnh chạy profile cô lập.

Dùng pattern:

Set-Location C:\dev\done-today

$env:CARGO_TARGET_DIR = Join-Path $env:TEMP 'done-today-day-theme-cp5-target'
$configPath = Join-Path $env:TEMP 'done-today-day-theme-cp5.json'

[System.IO.File]::WriteAllText(
  $configPath,
  '{"identifier":"com.donetoday.desktop.daythemecp5"}',
  [System.Text.UTF8Encoding]::new($false)
)

npm.cmd run tauri -- dev --config $configPath

Nếu project cần build.beforeDevCommand/devUrl override theo pattern CP4, dùng config đã được worklog hiện hành chứng minh hoạt động và ghi rõ.

Checklist native:

Entry and dialog

Personalize action rõ nhưng không cạnh tranh primary workflow.

Dialog mở bằng mouse/keyboard.

vi/en.

focus trap/restore.

Escape/outside close.

900×600/default/maximize.

không clipping/overflow.

Cover variant

Theme default giữ behavior cũ.

Minimal giữ chiều cao/layout.

Minimal không hiện motif/full asset.

Default/Sakura/Coffee/Rainy đều đọc rõ.

light/dark/custom App Theme.

Day symbol

Theme default.

None.

Sparkle.

Focus.

Growth.

Calm.

Celebrate.

Day Cover.

Calendar.

History.

accessible labels.

không chỉ dựa vào màu.

Journal font

Theme default.

Clean.

Classic Serif.

tiếng Việt có dấu.

tiếng Anh.

editor content dễ đọc.

controls/table headers/app shell không đổi font.

không layout jump đáng kể.

Preview/apply

preview rồi Cancel.

Escape.

outside close.

Reset draft rồi Cancel.

Apply.

reload app.

đổi ngày khi dialog mở.

stale completion không xuất hiện trong luồng bình thường.

duplicate click Apply.

Saving/success.

Persistence

ngày A Minimal + Focus + Serif.

ngày B Default cover + None + Clean.

ngày C Theme default personalization.

mở lại từ Today/Calendar/History.

theme và personalization đúng.

Reset personalization không reset Day Theme/content.

Apply all defaults trên ngày trống không tạo log nếu có thể quan sát qua UI behavior.

non-default trên ngày trống tạo log mà không thêm work item.

Compatibility

Theme Picker.

Sakura/Coffee/Rainy.

Calendar.

History.

old-day restoration.

autosave/editor.

categories/status/statistics/reorder.

Backup export/import smoke nếu checklist hiện hành yêu cầu.

vi/en.

900×600/default/maximize.

Accessibility limits

keyboard/focus/visual review.

không tuyên bố screen reader/Accessibility Tree nếu chưa thực hiện.

failure/Retry và unknown/corrupt metadata có thể ghi automated/source evidence nếu không phá database native.

Cleanup:

$profilePath = Join-Path $env:APPDATA 'com.donetoday.desktop.daythemecp5'

if (Test-Path -LiteralPath $profilePath) {
  Remove-Item -LiteralPath $profilePath -Recurse -Force
}

Remove-Item -LiteralPath $configPath -Force -ErrorAction SilentlyContinue

Không xóa profile chính.

Sau khi cung cấp checklist, dừng và chờ người dùng nghiệm thu.

Không tạo closeout commit trong cùng nhiệm vụ.

29. Báo cáo cuối bắt buộc

Báo cáo trong câu trả lời và trong:

docs/worklogs/DAY-THEME-CHECKPOINT-05-RESULT.md

Dùng cấu trúc:

A. Workspace and preflight

current Codex path;

repository;

branch;

initial HEAD;

origin relation;

working tree ban đầu;

ancestor;

toolchain;

AGENTS.md;

không isolated worktree.

B. Prompt preservation

path;

full commit hash/message;

nằm trực tiếp trong master.

C. Baseline

all gates;

test counts;

build/bundle.

D. Audit and design decisions

existing contracts;

migration need;

UI entry;

font boundary;

Backup strategy;

blockers/none.

E. Persistence and migration

migration;

fields;

validation;

atomic apply;

minimal-log rules;

tests;

commit.

F. Backup v1

optional fields;

old fixture;

checksum;

merge/replace/receipt;

tests.

G. Personalization domain/UI

cover options;

symbol registry;

font roles;

dialog;

preview/apply/reset;

concurrency/error;

i18n;

commit.

H. Rendering integration

Day Cover;

Minimal asset behavior;

symbol precedence;

font scoping;

Calendar/History;

no N+1/assets;

commit.

I. Accessibility

semantics;

keyboard;

focus;

not-color-only;

forced-colors;

reduced-motion;

automated/source evidence;

native limits.

J. Compatibility

Theme Picker;

App Theme;

Day Theme;

Backup;

autosave;

categories/status/statistics/reorder;

Calendar/History;

old-day restoration.

K. Verification

every command;

test counts;

build;

bundle/chunks;

warnings;

git diff --check.

L. Documentation/worklog

files;

status;

implementation pointer;

i18n inventory;

worklog;

docs commit.

M. Git

every full commit hash/message;

diff stat;

git log origin/master..master --oneline;

final HEAD;

working tree clean;

no push/release artifact.

N. Deferred

Chỉ liệt kê ngoài phạm vi.

O. Final status

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
Implementation complete — native Windows acceptance pending

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 6+:
Not started

P. Native acceptance

run command;

checklist;

cleanup;

không tuyên bố pass trước phản hồi người dùng.

30. Điều kiện dừng

Dừng và hỏi trước khi sửa nếu:

workspace không phải C:\dev\done-today;

isolated worktree/detached HEAD;

branch không phải master;

working tree không sạch;

HEAD không chứa fd71c06;

authoritative docs mâu thuẫn nghiêm trọng;

Backup v1 không thể mở rộng optional fields;

cần Backup v2;

cần bảng mới;

cần dependency/font asset mới;

font role không thể áp dụng mà không đổi global App Theme;

migration sequence không rõ;

test baseline fail không giải thích được;

có nguy cơ mất dữ liệu;

cần push/release để tiếp tục.

Không mở rộng phạm vi để né blocker.

Dừng sau implementation, commits, worklog và native handoff.

Không bắt đầu Checkpoint 6.