DONE TODAY — DAY THEME CHECKPOINT 4 — CALENDAR & HISTORY

Bạn đang chạy trong Codex Desktop trên Windows và phải làm việc trực tiếp trong repository chính:

C:\dev\done-today

Mục tiêu của nhiệm vụ này là triển khai:

Day Theme Checkpoint 4 — Calendar & History

Checkpoint này chỉ hoàn thiện nhận diện Day Theme trong Calendar và History, đồng thời bảo đảm khi mở ngày cũ thì đúng bầu không khí của ngày đó được khôi phục.

Không triển khai Personalization nhẹ, Theme Packs, reminder, release packaging hoặc các finding kỹ thuật ngoài phạm vi.

1. Trạng thái dự án đã biết

Baseline đã được người dùng xác minh:

Repository root:
C:\dev\done-today

Branch:
master

HEAD:
b27476c0f03a76185b3641ca274f0ed67e99a706

HEAD message:
docs: record initial CI success

Working tree:
clean

Remote:
origin https://github.com/Ronn-G/Done-Today

Các trạng thái đã hoàn thành:

Engineering Hardening Checkpoint 1:
Completed — local and remote CI verification passed

Day Theme Checkpoint 1 — Foundation:
Completed

Day Theme Checkpoint 2 — First Themes:
Completed

Day Theme Checkpoint 3 — Theme Picker:
Completed — native Windows acceptance passed

Day Theme & Personalization:
In progress — checkpoint complete

Day Theme Checkpoint 4+:
Not started

Các built-in Day Theme hiện hành theo curated registry order:

done-today-default@1
sakura@1
coffee@1
rainy@1

Database hiện đã có:

daily_logs.theme_id
daily_logs.theme_version

Không được giả định các chi tiết khác từ prompt. Phải audit source và tài liệu hiện hành trước khi sửa.

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

dừng để người dùng quyết định.

Mục tiêu của nhiệm vụ này là các commit phải xuất hiện trực tiếp trong:

C:\dev\done-today\master

Không được chỉ để thay đổi trong Codex-managed review thread, snapshot hoặc isolated workspace.

3. Quy tắc an toàn Git

Không được:

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

Nếu HEAD mới hơn b27476c:

đọc toàn bộ commit mới hơn;

xác minh chúng hợp lệ và không xung đột;

dùng HEAD thực tế làm baseline;

không quay lùi lịch sử.

Nếu HEAD cũ hơn hoặc không chứa b27476c:

dừng và báo.

4. Lưu prompt và worklog để không phụ thuộc lịch sử Codex Desktop

Ngay sau khi preflight hợp lệ và trước khi sửa source:

Tạo thư mục nếu chưa có:

docs/prompts
docs/worklogs

Lưu toàn bộ nhiệm vụ này vào:

docs/prompts/DAY-THEME-CHECKPOINT-04-CALENDAR-HISTORY.md

Tạo commit đầu tiên chỉ chứa prompt:

docs: record day theme checkpoint 4 task

Trước commit:

git add -- docs/prompts/DAY-THEME-CHECKPOINT-04-CALENDAR-HISTORY.md
git diff --cached --stat
git diff --cached --check
git diff --cached

Sau commit:

git show --stat --oneline HEAD
git status --short

Trong quá trình triển khai, commit từng phần hoàn chỉnh.

Trước khi kết thúc, lưu báo cáo cuối vào:

docs/worklogs/DAY-THEME-CHECKPOINT-04-RESULT.md

Báo cáo trong file phải chứa cùng bằng chứng với câu trả lời cuối.

5. Preflight đầy đủ

Sau workspace guard, chạy:

Set-Location C:\dev\done-today

git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -20
git remote -v

git merge-base --is-ancestor b27476c0f03a76185b3641ca274f0ed67e99a706 HEAD

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

origin/master có thể đang thiếu riêng commit closeout b27476c nếu người dùng chưa push. Trường hợp đó được phép tiếp tục khi:

local HEAD chính xác là b27476c;

working tree sạch;

không có divergence;

báo rõ local ahead remote.

Không tự push.

6. Nguồn authoritative phải đọc

Đọc bản hiện hành trong repository, không dựa riêng vào nội dung chép trong prompt.

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
docs/QUY-TRINH-PHAT-TRIEN-TOI-UU-DONE-TODAY.md
README.md

Tuân thủ precedence trong:

docs/00-DOCUMENT-STATUS.md

Quy tắc nguồn sự thật:

05-ROADMAP.md: trạng thái delivery.

17-DAY-THEME-AND-PERSONALIZATION.md: Day Theme.

16-DESIGN-SYSTEM.md: UI, component, responsive và accessibility.

06-APP-APPEARANCE-THEME.md: App Theme toàn cục.

08-BACKUP-RESTORE.md: Backup v1.

18-INTERNATIONALIZATION-AND-LOCALIZATION.md: i18n.

02-TECHNICAL-DESIGN.md: kiến trúc và quality gates.

06-THEME-CUSTOMIZATION.md là tài liệu superseded, không được dùng để ghi đè contract hiện hành.

Tìm các phần liên quan:

rg -n -i `
  "Checkpoint 4|Calendar Indicator|CalendarDaySummary|History View|Calendar & History|theme indicator|theme preview|open old day|query optimization" `
  docs

Nếu tài liệu hiện hành mâu thuẫn với implementation:

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

Ghi:

pass/fail từng command;

số test file frontend;

số test frontend;

số test Rust;

production build;

main bundle;

Day Theme picker chunk;

motif chunks;

warning/error.

Nếu baseline fail:

xác định lỗi có tồn tại từ baseline hay do môi trường;

không sửa đại trà;

chỉ tiếp tục khi failure được giải thích chắc chắn hoặc thuộc đúng phạm vi.

Không được tuyên bố baseline pass nếu chưa chạy.

8. Audit implementation hiện hành trước khi thiết kế

Audit source thực tế, tối thiểu:

8.1. Day Theme

typed contract;

validation;

immutable registry;

exact/latest/default/emergency fallback;

curated order;

calendar metadata hiện có;

theme name/description i18n;

DayThemeScope;

DayCover;

motif logical asset resolver;

lazy loading;

Theme Picker state;

per-day persistence;

stale date guard;

Default NULL/NULL;

minimal daily-log creation;

Backup v1 round-trip.

8.2. Calendar/date UI hiện hành

Xác định:

app đã có month calendar hay chưa;

date picker/date controls hiện nằm ở đâu;

History page có calendar hay chỉ paginated list;

activity-date query hiện dùng cho streak có thể tái sử dụng hay không;

route mở ngày hiện hành;

selected date/today/future-date rules;

keyboard behavior;

locale-aware weekday/month formatting.

Không tạo duplicate calendar nếu component phù hợp đã tồn tại.

Nếu chưa có month calendar, triển khai một compact month calendar trong History page, đặt trước danh sách lịch sử và không tạo navigation item hoặc route mới.

Không redesign toàn bộ History page.

8.3. History hiện hành

Xác định:

summary model;

SQL/query;

pagination;

card/item component;

loading/error/empty states;

route mở ngày cũ;

current theme restoration;

stale request protection;

response Zod validation tại Tauri boundary;

i18n resources;

tests.

8.4. Rust/SQLite

Xác định:

câu query History summaries;

query activity dates;

indexes hiện có;

cách map nullable theme_id/theme_version;

transaction/error conventions;

Tauri command naming;

runtime response schemas frontend.

Không thêm migration nếu query có thể dùng schema hiện tại.

8.5. UI primitives

Audit:

button;

tooltip;

popover/dialog nếu có;

loading;

error/Retry;

focus-visible;

roving focus hoặc calendar keyboard utilities;

visually-hidden/screen-reader utility;

forced-colors/reduced-motion CSS.

Báo ngắn kết luận audit và kế hoạch implementation trước khi code.

9. Mục tiêu và Definition of Done

Sau checkpoint này, người dùng phải có thể:

Mở History và nhìn thấy một compact month calendar.

Nhìn nhanh những ngày có nhật ký.

Nhận biết nhẹ nhàng Day Theme của từng ngày có log.

Phân biệt theme không chỉ bằng màu:

dùng semantic indicator;

dùng curated symbol hoặc hình dạng nhẹ nếu contract hỗ trợ;

có accessible text/tooltip chứa tên theme.

Calendar không che số ngày.

Today state và selected state rõ hơn theme indicator.

Chuyển tháng bằng chuột và bàn phím.

Chọn một ngày trong calendar để mở route ngày hiện hành.

History cards thể hiện Day Theme bằng accent nhẹ và tên theme hoặc metadata tương đương.

History cards vẫn có cấu trúc nhất quán; không biến thành các postcard lớn hoặc mosaic.

Mở ngày cũ từ Calendar hoặc History khôi phục đúng Day Cover và Day Theme.

Theme ID/version thiếu hoặc lạ fallback an toàn.

Calendar/History query chỉ lấy metadata nhẹ; không tải full daily logs hoặc motif/full cover cho cả tháng/list.

Không N+1 query theo từng ngày/card.

Loading/error/Retry/stale request behavior đúng.

vi/en hoạt động ngay, không raw translation key.

App Theme light/dark/custom vẫn độc lập.

900×600, default và maximize đều sử dụng được.

Keyboard, focus, forced-colors và reduced-motion không regression.

Backup v1, schema, migration, autosave, categories, status, statistics, reorder và existing History pagination không đổi contract.

Kết thúc implementation ở trạng thái:

Day Theme Checkpoint 4 — Calendar & History:
Implementation complete; native Windows acceptance pending

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 5+:
Not started

Không được tự đánh dấu Checkpoint 4 là Completed trước khi người dùng nghiệm thu native.

10. Quyết định sản phẩm và UX đã khóa

10.1. Vị trí Calendar

Nếu chưa có month calendar:

thêm compact month calendar vào đầu History page;

nằm dưới History header và trước paginated history list;

không thêm route mới;

không thêm sidebar item mới;

không thay thế History list;

không biến calendar thành màn hình chính mới.

Nếu calendar hiện hành đã tồn tại, mở rộng component đó thay vì tạo bản thứ hai.

10.2. Month navigation

Calendar cần:

previous month;

next month;

nhãn tháng/năm locale-aware;

control rõ ràng bằng accessible name;

không reload route;

không gọi full history query.

Nút “Today/Tháng hiện tại” chỉ thêm nếu phù hợp primitive và không làm UI rối.

Không thêm year picker, range picker hoặc advanced date filtering.

10.3. Day cells

Mỗi day cell phải ưu tiên:

số ngày;

selected state;

today state;

has-log state;

Day Theme indicator.

Không dùng full-cell theme background.

Không đưa motif SVG/full cover vào day cells.

Ngày ngoài tháng:

dùng behavior phù hợp với calendar hiện hành;

nếu render, phải muted và không gây nhầm;

không tự tải metadata ngoài range cần thiết trừ khi grid yêu cầu range cố định và query vẫn nhẹ.

Future dates phải giữ business rule hiện hành; không tự phát minh quy tắc disable mới.

10.4. Day Theme indicator

Ưu tiên:

semantic dot hoặc short accent bar
+ optional curated symbol
+ accessible theme name

Yêu cầu:

màu lấy từ resolved registry metadata;

không hard-code themeId trong Calendar/History component;

không import trực tiếp individual theme definition;

missing ID/version dùng registry fallback;

day có log nhưng theme_id/theme_version = NULL/NULL dùng Default runtime identity;

day không có log không cần theme indicator;

indicator không che number;

forced-colors vẫn nhận biết được;

tooltip hoặc title không thay thế accessible name;

không chỉ dùng hue nếu theme identity được trình bày là thông tin.

Nếu current contract đã có:

calendar.indicatorColor
calendar.symbol

thì tái sử dụng.

Nếu thiếu symbol cho built-ins và cần bổ sung để tránh color-only:

bổ sung ở Day Theme definition/contract, không persistence schema;

dùng curated semantic symbol nhỏ;

không dùng emoji có rendering quá khác nhau nếu ảnh hưởng visual consistency;

có test registry/validation;

không hard-code mapping trong UI.

10.5. History preview

History item/card chỉ thêm nhận diện nhẹ:

accent line/dot;

optional curated symbol;

localized theme name trong metadata.

Không:

tải motif/full cover;

dùng full-card theme background mạnh;

làm card Sakura/Coffee/Rainy có layout khác nhau;

thêm filter theo theme;

thêm search theo theme;

thêm thumbnail nặng.

Theme name phải lấy từ i18n resource qua registry metadata.

10.6. Mở ngày cũ

Khi click Calendar day hoặc History item:

dùng route/navigation hiện hành;

app shell giữ nguyên;

DayThemeScope resolve đúng theme_id/theme_version;

Day Cover render đúng theme;

editor/read-only logic giữ nguyên;

không flash kéo dài theme của ngày trước;

stale completion từ ngày trước không ghi đè ngày mới.

Nếu behavior này đã tồn tại từ Checkpoint 3, không viết lại; thêm regression evidence.

11. Data contract và query optimization

11.1. Calendar summary

Dùng typed contract tương đương:

interface CalendarDaySummary {
  date: string;
  hasLog: boolean;
  completionSummary?: string;
  themeId?: string | null;
  themeVersion?: number | null;
}

Điều chỉnh đúng convention source hiện hành.

Không bắt buộc giữ completionSummary nếu implementation hiện hành dùng counts/fields khác và tài liệu cho phép. Nhưng query phải đủ nhẹ để render:

ngày;

có log;

Day Theme metadata;

optional progress metadata đã có giá trị thực tế.

Không trả full work items.

Không trả motif asset hoặc theme tokens từ Rust/database.

Registry frontend resolve presentation metadata.

11.2. Range query

Ưu tiên query theo date range cho tháng hiện tại.

Yêu cầu:

parameterized SQL;

validate startDate/endDate;

inclusive/exclusive semantics rõ ràng;

deterministic ordering;

không N+1;

dùng index daily_logs.log_date hiện có;

chỉ aggregate work-item counts nếu UI thực sự dùng;

không tạo migration/index mới trừ khi EXPLAIN QUERY PLAN hoặc audit chứng minh cần thiết.

Nếu activity-date query hiện hành có thể mở rộng an toàn:

cân nhắc tái sử dụng;

không làm thay đổi streak contract ngoài ý muốn.

Nếu mở rộng command cũ có nguy cơ phá consumer, tạo command/repository method mới có tên rõ ràng.

11.3. History summary

Nếu History summary hiện chưa có theme metadata:

mở rộng summary SQL/model/command/response schema để trả themeId/themeVersion;

không query daily log riêng cho từng card;

giữ pagination total/page rules;

giữ ordering;

giữ existing errors;

runtime-validate Tauri response bằng boundary hiện hành;

không dùng bare as T.

11.4. Null/default/missing rules

Phân biệt:

NULL/NULL:
No explicit selection; render Default runtime identity.

Known theme ID/version:
Render exact or compatible registry identity.

Unknown ID/version:
Preserve original metadata in data layer; render fallback identity; do not mutate database automatically.

Không ghi default xuống database chỉ để Calendar hiển thị marker.

Không tạo minimal daily log chỉ vì người dùng mở Calendar/History.

Calendar query là read-only.

12. Loading, concurrency và error behavior

Calendar month query phải có:

loading state nhẹ;

localized safe error;

Retry;

stale request guard khi chuyển tháng nhanh;

unmount guard;

không cho kết quả tháng trước ghi đè tháng mới;

không xóa History list khi Calendar query lỗi nếu hai phần có thể hoạt động độc lập.

History pagination behavior hiện hành phải giữ nguyên.

Nếu Calendar và History dùng hai request:

lỗi Calendar không được biến toàn History page thành unusable nếu list vẫn tải được;

lỗi History list không được làm Calendar mất dữ liệu đã tải nếu không cần;

Retry đúng vùng.

Không log journal content hoặc payload nhạy cảm.

13. Accessibility

13.1. Calendar semantics

Ưu tiên semantic calendar grid/table phù hợp với component hiện hành.

Phải có:

localized month/year heading;

weekday headers;

accessible name cho previous/next month;

accessible day label gồm full date;

selected state;

today state;

has-log state khi có giá trị;

localized Day Theme name khi có log;

focus visible;

keyboard activation bằng Enter/Space.

13.2. Keyboard

Nếu dùng grid roving focus, hỗ trợ tối thiểu:

Arrow Left/Right:
previous/next day

Arrow Up/Down:
previous/next week

Home/End:
đầu/cuối tuần nếu phù hợp implementation

Enter/Space:
open selected date

Tab không cần dừng ở toàn bộ 30–42 day cells nếu roving tabindex được dùng.

Không tự tạo keyboard model phức tạp nếu primitive hiện hành đã có model chuẩn.

Có test cho:

focus entry;

arrows;

month boundary;

Enter/Space;

focus visible/restoration phù hợp;

locale label.

13.3. Không chỉ dựa vào màu

Calendar marker:

có hình dạng/symbol hoặc text state bổ sung;

accessible name chứa theme name;

selected/today không chỉ dựa vào màu;

forced-colors có border/outline/system color phù hợp.

History card:

hiển thị localized theme name hoặc accessible equivalent;

accent không phải thông tin duy nhất.

13.4. Reduced motion

Không thêm animation liên tục.

Month transition nếu có phải:

rất nhẹ;

tắt hoặc giảm trong prefers-reduced-motion.

Không bắt buộc animation.

13.5. Tuyên bố acceptance

Automated/source evidence có thể được báo.

Không được tuyên bố:

screen reader đã test;

Accessibility Tree đã test;

native visual acceptance đã pass;

nếu người dùng chưa thực hiện.

14. Responsive và visual hierarchy

Kiểm tra ít nhất:

900×600
default window
maximize

Yêu cầu:

calendar không đẩy History list xuống quá xa;

weekday/day cells không clipping;

month controls không wrap bất thường;

vi/en đều không overflow;

theme name trong History metadata có truncation/nowrap hợp lý;

selected/today/indicator vẫn rõ ở small window;

App Theme light/dark/custom đều đọc được;

Default/Sakura/Coffee/Rainy đều có marker phân biệt nhưng không chói;

History cards vẫn đồng nhất;

không có horizontal scroll không cần thiết.

Không tuyên bố visual review đạt nếu chưa chạy native.

15. Performance và asset loading

Không được:

tải full daily logs cho month calendar;

query từng ngày;

query từng History card;

import motif/full cover trong Calendar/History item;

preload tất cả Day Theme assets;

render 30–42 full DayCover;

thêm backdrop blur lớn;

thêm animation nặng;

re-render app shell khi chuyển tháng.

Dùng registry presentation metadata nhẹ.

Sau build, so sánh:

main bundle;

Day Theme picker chunk;

motif chunks;

chunk mới nếu có.

Nếu motif chunks bị kéo vào main hoặc Calendar/History bundle:

coi là regression;

sửa trước khi hoàn thành.

Có thể dùng source/bundle audit để chứng minh Calendar/History không import full motif resolver path ngoài nhu cầu.

16. i18n

Mọi visible/accessibility copy mới phải có vi/en.

Có thể cần key cho:

month calendar heading/region;

previous month;

next month;

open date;

has journal;

no journal nếu thực sự hiển thị;

Day Theme label trong History;

Calendar loading/error/retry;

fallback identity nếu user-facing.

Dùng locale-aware formatter hiện hành cho:

month/year;

full date;

weekday labels.

Không format date thủ công bằng chuỗi hardcoded.

Không dịch:

user journal content;

stable theme ID;

database status;

route date.

Chạy và cập nhật i18n inventory nếu key thay đổi.

Không raw translation key.

17. Rust/Tauri/TypeScript contract

Nếu thêm hoặc đổi command:

Rust request/response struct typed;

camelCase contract nhất quán;

structured namespaced error;

scalar params only;

parameterized SQL;

frontend repository interface;

Tauri repository implementation;

Zod runtime response schema;

invokeAndParse/boundary hiện hành;

no bare type assertion;

tests cho malformed response;

tests cho null/default/missing theme.

Không trả raw SQLite error hoặc raw ZodError ra UI.

Không đổi command/response không liên quan.

18. Testing bắt buộc

18.1. Domain/registry

Test tối thiểu:

exact theme resolve;

compatible fallback;

missing ID/version fallback;

default NULL/NULL identity;

calendar indicator metadata;

symbol/shape validation nếu bổ sung;

localized theme name mapping không hard-code theme ID trong UI.

18.2. Rust/query

Test tối thiểu:

date-range validation;

month range result;

ordered summaries;

no-log dates không tạo record giả ở DB layer;

daily log NULL theme;

known theme metadata;

unknown theme metadata được giữ nguyên;

History summary có theme metadata;

pagination/total không đổi;

parameterized boundaries;

invalid range error;

existing streak/activity-date behavior không regression.

Nếu có thể kiểm chứng query plan ổn định mà không tạo brittle test, ghi evidence; không bắt buộc snapshot EXPLAIN cứng.

18.3. Infrastructure/IPC

Test:

valid collection;

nullable fields;

invalid primitive;

invalid nested response;

unknown extra fields theo forward-compat policy;

transport error;

invalid response normalized an toàn.

18.4. Calendar UI

Test:

render month;

locale vi/en;

weekday labels;

previous/next month;

current month;

today;

selected date;

has-log;

Default/Sakura/Coffee/Rainy indicator;

missing theme fallback;

no full theme asset import behavior bằng source boundary hoặc mock phù hợp;

click/Enter/Space mở đúng route;

arrow keyboard;

stale response không ghi đè;

loading;

error;

Retry;

forced-colors class/semantics nếu testable;

accessible name/state.

18.5. History UI

Test:

card Default/Sakura/Coffee/Rainy;

localized theme name;

unknown theme fallback;

consistent structure;

no motif/full cover load;

click/keyboard mở old day;

existing pagination/loading/error/empty state không regression.

18.6. Old-day restoration

Regression test:

ngày A Sakura;

ngày B Coffee;

ngày C Rainy;

mở từ Calendar/History;

đúng theme/date được áp dụng;

app shell không đổi;

stale result ngày trước không ghi đè;

editor/autosave behavior không mất dữ liệu.

18.7. Compatibility

Giữ pass:

Backup v1 legacy fixture/checksum;

Merge;

Replace;

receipt;

Day Theme Picker;

Default NULL/NULL;

minimal-log rule;

App Theme;

Work Categories;

status/statistics/reorder;

current streak;

i18n;

strict mode;

formatting.

Không giảm test count mà không giải thích.

19. Implementation sequence

Triển khai theo thứ tự:

Phase A — Lightweight summary contracts and query

audit/reuse model;

add calendar range summary nếu cần;

extend History summary;

Rust SQL;

repository/service;

Tauri contract;

Zod response validation;

targeted tests.

Commit:

feat: add day theme calendar summaries

Phase B — Calendar UI

compact month calendar trong History nếu chưa có;

month navigation;

theme indicator;

keyboard;

loading/error/retry;

i18n;

responsive/forced-colors;

tests.

Không tải motif.

Phase C — History identity and old-day regression

lightweight card identity;

localized theme name;

fallback;

route old day;

stale guard;

tests;

preserve pagination.

Commit cho Phase B + C khi thay đổi liên kết chặt:

feat: show day themes in calendar and history

Nếu diff lớn và có seam rõ, được phép tách:

feat: add day theme calendar
feat: add day theme history identity

Phase D — Compatibility tests

full targeted regression;

bundle/source asset loading evidence;

accessibility tests;

compatibility closure.

Commit:

test: verify day theme calendar and history compatibility

Phase E — Documentation/worklog

update canonical docs;

save worklog;

do not mark native acceptance passed.

Commit:

docs: record day theme checkpoint 4 implementation

Không tạo commit rỗng.

20. Commit discipline

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
git log --oneline --decorate -8

Không amend.

Không squash.

Không rebase.

Không push.

Mọi commit hash phải được ghi vào worklog và báo cáo cuối.

21. Documentation

Sau implementation, cập nhật tối thiểu khi cần:

docs/05-ROADMAP.md
docs/17-DAY-THEME-AND-PERSONALIZATION.md
docs/audits/I18N-STRING-INVENTORY.md
docs/02-TECHNICAL-DESIGN.md

Chỉ sửa file có nội dung thực sự cần đồng bộ.

21.1. Roadmap

Cập nhật:

Day Theme Checkpoint 4 — Calendar & History:
Implementation complete; native Windows acceptance pending

Ghi:

commit implementation;

summary contract/query;

Calendar;

History identity;

fallback;

tests;

local verification;

native acceptance còn chờ.

Giữ:

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 5+:
Not started

Không đánh dấu toàn feature Completed.

21.2. Day Theme specification

Thêm implementation record cho Checkpoint 4:

decisions thực tế;

data/query boundary;

indicator;

History card identity;

old-day restoration;

asset loading;

accessibility evidence;

native pending;

non-goals giữ nguyên.

Không viết lại normative sections không cần thiết.

21.3. Technical Design

Chỉ cập nhật nếu có contract mới cần bảo trì:

calendar summary query;

no full-log/no N+1 rule;

IPC response validation.

Không biến Technical Design thành changelog dài.

21.4. I18N inventory

Cập nhật key/copy/audit nếu có string mới.

Giữ vi/en parity.

21.5. Worklog

Tạo:

docs/worklogs/DAY-THEME-CHECKPOINT-04-RESULT.md

Gồm:

preflight;

baseline;

audit;

implementation;

tests;

bundle;

commits;

native checklist;

final status.

22. Compatibility invariants

Không được thay đổi persisted contract hoặc behavior của:

Migration 001–005
Database schema
Backup v1
Canonical checksum
Legacy backup fixture
Merge
Replace all
Import receipts
Locale bootstrap/persistence
App Theme light/dark/custom
App Theme custom colors
Day Theme registry curated order
Day Theme Picker
Preview/apply/cancel/rollback/retry
Default NULL/NULL
Minimal daily-log creation
Autosave debounce
Editor draft/save queue
Work Categories
Completed bucket
Reorder
Status
Statistics
Current streak
History pagination rules
User journal content

Không tạo migration mới trừ khi audit chứng minh schema hiện tại không thể hoàn thành Checkpoint 4. Trong trường hợp đó:

không tự tạo migration;

dừng và hỏi người dùng.

Không bump Backup version.

Không thay checksum.

Không thêm dependency nếu không có lý do bắt buộc. Ưu tiên component/utilities hiện hành.

23. Ngoài phạm vi tuyệt đối

Không triển khai:

Checkpoint 5 Personalization nhẹ;

cover variant;

accent variant;

display title tùy biến;

day symbol do người dùng chọn;

journal font picker;

custom Day Theme editor;

sticker;

custom CSS;

layout builder;

Midnight;

Forest;

theme pack;

marketplace;

premium/lock flow;

theme search/filter;

export CSV/Markdown;

reminder/notification;

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

Nếu phát hiện vấn đề ngoài phạm vi, ghi ngắn trong mục Deferred; không sửa.

24. Final verification

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

Nếu repository có targeted script/smoke test authoritative, chạy thêm.

Ghi:

format;

i18n count;

frontend test file count;

frontend test count;

Rust test count;

build modules/time;

main bundle;

CSS;

Day Theme picker;

motif chunks;

Calendar/History chunk nếu có;

warnings;

production dependency audit chỉ khi đã có script/yêu cầu, không chạy fix.

Đặc biệt xác minh:

motif chunks vẫn dynamic;

Calendar/History không kéo motif vào main;

no installer/portable/release artifact;

working tree sạch sau commit cuối.

25. Native Windows acceptance handoff

Không tự đánh dấu Checkpoint 4 Completed.

Sau automated implementation, cung cấp lệnh chạy profile cô lập.

Dùng pattern:

Set-Location C:\dev\done-today

$env:CARGO_TARGET_DIR = Join-Path $env:TEMP 'done-today-day-theme-cp4-target'
$configPath = Join-Path $env:TEMP 'done-today-day-theme-cp4.json'

[System.IO.File]::WriteAllText(
  $configPath,
  '{"identifier":"com.donetoday.desktop.daythemecp4"}',
  [System.Text.UTF8Encoding]::new($false)
)

npm.cmd run tauri -- dev --config $configPath

Checklist native phải gồm:

Calendar

History có compact month calendar.

Previous/next month.

vi/en month and weekday labels.

Today và selected state rõ.

Ngày có log rõ.

Default/Sakura/Coffee/Rainy có indicator đúng.

Indicator không che số ngày.

Theme không chỉ phân biệt bằng màu.

Missing/unknown theme fallback an toàn nếu có fixture/test profile phù hợp.

Click day mở đúng ngày.

Enter/Space mở đúng ngày.

Arrow navigation đúng.

Chuyển tháng nhanh không hiện kết quả stale.

Loading/error/Retry UI hợp lý trong phạm vi có thể kiểm tra mà không phá database.

History

Card có identity nhẹ, không rối.

Theme name vi/en đúng.

Default/Sakura/Coffee/Rainy đúng.

Pagination/loading/error/empty state không regression.

Mở card vào đúng ngày/theme.

Không thấy motif/full cover tải hàng loạt hoặc scroll giật bất thường.

Old-day restore

Tạo/chọn ít nhất ba ngày:

Sakura;

Coffee;

Rainy.

Mở từ Calendar.

Mở từ History.

Day Cover đúng.

App shell không đổi.

App Theme light/dark/custom vẫn độc lập.

Default vẫn đúng.

Reload app vẫn đúng.

Compatibility

editor/autosave;

categories;

status;

statistics;

reorder;

current streak;

Theme Picker;

vi/en;

900×600;

default;

maximize.

Accessibility

Tab.

Shift+Tab.

Arrow keys.

Enter.

Space.

focus visible.

accessible names qua native accessibility inspection nếu người dùng thực hiện.

forced-colors/reduced-motion source behavior.

Không tuyên bố screen reader hoặc Accessibility Tree pass nếu chưa kiểm tra.

Sau khi đóng app bằng Ctrl+C, dọn profile:

$profilePath = Join-Path $env:APPDATA 'com.donetoday.desktop.daythemecp4'

if (Test-Path -LiteralPath $profilePath) {
  Remove-Item -LiteralPath $profilePath -Recurse -Force
}

Remove-Item -LiteralPath $configPath -Force -ErrorAction SilentlyContinue

Không xóa profile chính.

Sau khi cung cấp checklist, dừng và chờ người dùng nghiệm thu.

Không tạo closeout commit trong cùng nhiệm vụ.

26. Báo cáo cuối bắt buộc

Báo cáo trong câu trả lời và trong:

docs/worklogs/DAY-THEME-CHECKPOINT-04-RESULT.md

Dùng cấu trúc:

A. Workspace and preflight

current Codex path;

repository root;

branch;

initial HEAD;

origin/master relation;

working tree ban đầu;

ancestor checks;

Node/npm/Rust/Cargo;

AGENTS.md;

xác nhận không isolated worktree.

B. Prompt preservation

prompt file path;

prompt commit hash/message;

xác nhận nằm trong C:\dev\done-today\master.

C. Baseline

từng quality gate;

frontend/Rust test counts;

build and bundle.

D. Implementation audit

Calendar/date UI trước task;

History trước task;

query/contract;

existing old-day restore;

reused components/utilities;

blockers hoặc none.

E. Data/query implementation

contracts;

Rust SQL;

repository/service/Tauri;

range semantics;

no N+1/full log;

fallback/null;

tests;

commit.

F. Calendar

placement;

month navigation;

day cells;

theme indicator;

loading/error/retry/stale guard;

keyboard;

i18n;

responsive;

asset-loading evidence;

commit.

G. History

lightweight identity;

theme name;

fallback;

old-day navigation;

pagination compatibility;

asset-loading evidence;

commit.

H. Accessibility

semantics;

keyboard;

focus;

not-color-only;

forced-colors;

reduced-motion;

automated/source evidence;

native limits.

I. Compatibility

App Theme;

Theme Picker;

Default NULL/NULL;

minimal log;

Backup v1;

migration/schema;

categories/status/statistics/reorder;

autosave/editor;

streak;

history pagination.

J. Verification

every command;

test counts;

build;

bundle/chunks;

warnings;

git diff --check.

K. Documentation/worklog

files;

status wording;

last verified commit;

i18n inventory;

worklog;

docs commit.

L. Git

every full commit hash/message;

diff stat per commit;

git log origin/master..master --oneline;

final HEAD;

working tree clean;

no push;

no installer/portable/release.

M. Deferred

Chỉ liệt kê findings ngoài phạm vi, không sửa.

N. Final status

Ghi chính xác:

Day Theme Checkpoint 1 — Foundation:
Completed

Day Theme Checkpoint 2 — First Themes:
Completed

Day Theme Checkpoint 3 — Theme Picker:
Completed — native Windows acceptance passed

Day Theme Checkpoint 4 — Calendar & History:
Implementation complete — native Windows acceptance pending

Day Theme & Personalization:
In progress — checkpoint complete

Checkpoint 5+:
Not started

O. Native acceptance

run command;

checklist;

cleanup;

không tuyên bố pass trước phản hồi người dùng.

27. Điều kiện dừng

Dừng và hỏi trước khi sửa nếu:

workspace không phải C:\dev\done-today;

Codex đang ở isolated worktree/detached HEAD;

branch không phải master;

working tree không sạch;

baseline không chứa b27476c;

tài liệu mâu thuẫn nghiêm trọng;

cần migration/schema mới;

cần Backup v2;

cần thêm dependency lớn;

month calendar placement không thể xác định từ UI hiện hành;

History architecture không cho phép query nhẹ mà không đổi contract ngoài phạm vi;

full motif asset bắt buộc bị kéo vào Calendar/History;

test baseline fail không giải thích được;

có nguy cơ mất dữ liệu;

cần push hoặc release để tiếp tục.

Không tự giải quyết blocker bằng cách mở rộng phạm vi.

Dừng sau khi implementation, commits, worklog và native handoff hoàn tất.

Không bắt đầu Checkpoint 5.