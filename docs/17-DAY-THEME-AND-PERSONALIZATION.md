# 17-DAY-THEME-AND-PERSONALIZATION.md

# Done Today — Day Theme & Personalization Specification

**Phiên bản:** 1.0  
**Trạng thái:** Tài liệu đặc tả sản phẩm và kỹ thuật bắt buộc  
**Phạm vi:** Theme theo từng ngày, cover, theme picker, calendar indicator, lịch sử, backup, migration và khả năng mở rộng theme pack  
**Đối tượng sử dụng:** Product owner, designer, Codex/AI triển khai, reviewer và người bảo trì mã nguồn

---

## 0. Cách sử dụng tài liệu

Tài liệu này định nghĩa cách Done Today hỗ trợ theme theo từng ngày mà không làm mất tính hữu dụng, tính nhất quán và khả năng đọc của ứng dụng.

Các từ khóa:

- **MUST / BẮT BUỘC:** Không được vi phạm.
- **SHOULD / NÊN:** Chỉ làm khác khi có lý do rõ ràng và được ghi nhận.
- **MAY / CÓ THỂ:** Tùy chọn.
- **NON-GOAL / KHÔNG PHẢI MỤC TIÊU:** Không được mở rộng sang hướng đó trong giai đoạn hiện tại.

Khi tài liệu này mâu thuẫn với `16-DESIGN-SYSTEM.md`, ưu tiên quy tắc có tính an toàn, accessibility và tính nhất quán cao hơn. Nếu vẫn không rõ, phải dừng triển khai và hỏi lại.

---

# 1. Tầm nhìn

Mỗi ngày trong Done Today phải có thể mang một bầu không khí riêng, giống như một trang riêng trong cuốn nhật ký.

Theme không tồn tại chỉ để làm đẹp. Theme giúp người dùng:

- gắn cảm xúc với ngày đó;
- nhận biết ký ức bằng thị giác;
- cảm thấy cuốn nhật ký là của riêng mình;
- thích mở ứng dụng và nhìn lại tiến trình;
- phân biệt các ngày mà không cần đọc toàn bộ nội dung.

Theme theo ngày phải làm giàu trải nghiệm, không được biến Done Today thành công cụ trang trí.

Thông điệp cốt lõi:

> Theme là dấu ấn cảm xúc của một ngày, không phải một lớp trang trí phủ lên toàn bộ ứng dụng.

---

# 2. Các quy tắc không được vi phạm

1. **Theme thuộc về từng ngày, không thay thế app theme toàn cục.**
2. **App shell, navigation và thao tác chính phải giữ nguyên giữa các theme.**
3. **Người dùng không bắt buộc chọn theme mỗi ngày.**
4. **Ngày không có theme riêng phải dùng fallback đẹp và hợp lệ.**
5. **Theme không được thay đổi cấu trúc, vị trí hoặc thứ tự của các control chính.**
6. **Theme không được làm giảm khả năng đọc của bảng công việc và nội dung nhật ký.**
7. **Không component nghiệp vụ nào được hard-code logic theo `theme_id`.**
8. **Mọi theme phải map vào semantic token chung.**
9. **Theme asset lỗi không được làm vỡ layout.**
10. **Calendar indicator phải nhẹ, không biến lịch thành mosaic rối mắt.**
11. **Theme phải được lưu, backup, restore và migrate an toàn.**
12. **Theme cũ phải mở được sau khi ứng dụng cập nhật.**
13. **Không cho phép tổ hợp tùy biến khiến giao diện xấu hoặc khó đọc.**
14. **Không tải toàn bộ asset của mọi theme khi khởi động app.**
15. **Không dùng animation nền liên tục gây phân tâm.**
16. **Không coi theme đã hoàn thành chỉ vì đổi được màu.**
17. **Theme phải được nghiệm thu bằng mắt ở màn hình Today, History và Calendar.**
18. **Missing theme phải fallback im lặng nhưng có log kỹ thuật phù hợp.**
19. **Theme picker không được cản trở luồng ghi chép.**
20. **Tùy biến nâng cao chỉ được thêm sau khi theme nền tảng ổn định.**

---

# 3. Phân biệt App Theme và Day Theme

## 3.1. App Theme

App Theme kiểm soát phần khung ứng dụng:

- sidebar;
- navigation;
- dialog;
- toast;
- global background;
- app chrome;
- trạng thái light/dark toàn cục nếu có.

App Theme có phạm vi toàn ứng dụng và giữ ổn định khi người dùng mở các ngày khác nhau.

## 3.2. Day Theme

Day Theme chỉ áp dụng cho vùng nội dung của một ngày:

- day cover;
- accent của trang;
- background mềm của journal area;
- divider;
- icon hoặc motif;
- typography mapping được kiểm soát;
- calendar indicator;
- history preview.

Day Theme không được:

- đổi navigation;
- đổi vị trí button;
- đổi table columns;
- đổi shortcut;
- thay app shell;
- làm lại toàn bộ dark/light mode.

## 3.3. Quy tắc kết hợp

App Theme và Day Theme phải kết hợp theo mô hình:

```text
App Theme
├── Global chrome
├── Navigation
├── Dialog
└── Global accessibility

Day Theme
├── Day cover
├── Day accent
├── Day background
├── Day motif
└── Calendar indicator
```

Day Theme không được ghi đè token toàn cục ngoài phạm vi day container.

---

# 4. Mô hình trải nghiệm

## 4.1. Luồng mặc định

Người dùng mở Today:

1. App hiển thị ngay giao diện mặc định đẹp.
2. Day Theme hiện tại được áp dụng nếu ngày đã có lựa chọn.
3. Nếu chưa có lựa chọn, dùng default day style.
4. Người dùng có thể bắt đầu ghi ngay.
5. Theme picker chỉ là hành động phụ.

Không được hiển thị modal bắt chọn theme khi mở ngày mới.

## 4.2. Luồng đổi theme

1. Người dùng mở theme picker.
2. Danh sách theme hiển thị preview nhanh.
3. Hover/focus có thể preview tạm thời.
4. Chỉ khi xác nhận, theme mới được lưu.
5. Đổi theme không reload toàn trang.
6. Autosave nội dung đang nhập không bị gián đoạn.
7. Undo hoặc quay về default phải dễ hiểu.

## 4.3. Luồng xem lại ngày cũ

1. Người dùng mở một ngày trong History hoặc Calendar.
2. App shell giữ nguyên.
3. Vùng nội dung ngày đó khôi phục đúng Day Theme.
4. Nếu theme không còn, dùng fallback.
5. Nội dung và layout vẫn giống cấu trúc hiện tại.

---

# 5. Khái niệm Day Style

Trong dữ liệu và sản phẩm, có thể dùng khái niệm `Day Style` để mô tả toàn bộ dấu ấn của một ngày.

Day Style phiên bản đầu gồm:

- `theme_id`;
- `theme_version`;
- optional `cover_variant`;
- optional `accent_variant`;
- optional `display_title`;
- optional `day_symbol`.

Không nên thêm quá nhiều trường ngay từ đầu.

## 5.1. Mục tiêu

Day Style phải:

- đủ đơn giản để lưu và backup;
- đủ ổn định để mở lại sau nhiều năm;
- không phụ thuộc vào file asset cụ thể;
- có fallback khi version thay đổi;
- mở rộng được trong tương lai.

## 5.2. Non-goal giai đoạn đầu

Chưa hỗ trợ:

- kéo-thả sticker tự do;
- đổi vị trí block;
- custom CSS;
- upload font tùy ý;
- chỉnh từng màu semantic;
- tạo theme bằng trình thiết kế;
- marketplace trực tuyến.

---

# 6. Theme contract

Khuyến nghị interface:

```ts
type ThemeMode = "light" | "dark" | "adaptive";

interface DayThemeDefinition {
  id: string;
  version: number;
  nameKey: string;
  descriptionKey: string;
  mode: ThemeMode;

  tokens: {
    pageBackground: string;
    daySurface: string;
    daySurfaceRaised: string;
    dayText: string;
    dayTextMuted: string;
    dayBorder: string;
    accent: string;
    accentHover: string;
    accentSoft: string;
    focusRing: string;
  };

  cover: {
    assetId?: string;
    fallbackGradient: string;
    overlay: string;
    textTone: "light" | "dark";
    motif?: string;
  };

  calendar: {
    indicatorColor: string;
    symbol?: string;
  };

  typography?: {
    journalFontRole?: "ui" | "journal" | "display";
    headingWeight?: number;
  };

  metadata: {
    category: "calm" | "warm" | "nature" | "night" | "seasonal" | "minimal";
    builtIn: boolean;
    premium?: boolean;
  };
}
```

## 6.1. Yêu cầu contract

- `id` ổn định, không đổi theo tên hiển thị.
- `version` là số nguyên tăng dần.
- `nameKey` và `descriptionKey` dùng i18n.
- `fallbackGradient` bắt buộc.
- `assetId` chỉ là tham chiếu logical, không phải đường dẫn tuyệt đối.
- `calendar.indicatorColor` phải đạt khả năng phân biệt trên nền lịch.
- Theme phải hợp lệ ngay cả khi mọi asset tùy chọn đều thiếu.

---

# 7. Theme Registry

## 7.1. Vai trò

Theme Registry là nguồn sự thật cho tất cả theme khả dụng.

Registry chịu trách nhiệm:

- tìm theme theo ID;
- resolve version;
- trả fallback;
- validate contract;
- cung cấp metadata cho picker;
- ánh xạ asset;
- hỗ trợ built-in theme và future theme pack.

## 7.2. Quy tắc

Không component nào được import trực tiếp một file theme riêng lẻ.

Sai:

```ts
import { sakuraTheme } from "./themes/sakura";
```

Đúng:

```ts
const theme = themeRegistry.resolve(themeId, themeVersion);
```

## 7.3. Fallback

Thứ tự fallback:

1. Exact `theme_id + theme_version`.
2. Latest compatible version của cùng `theme_id`.
3. Default built-in day theme.
4. Safe hardcoded emergency tokens trong infrastructure layer.

Fallback không được ném lỗi ra UI chỉ vì theme thiếu.

---

# 8. Versioning

## 8.1. Khi nào tăng version

Tăng `theme_version` khi:

- thay palette có thể ảnh hưởng cảm nhận rõ rệt;
- thay asset cover;
- thay semantic mapping;
- thay typography;
- thay motif;
- thay rule ảnh hưởng cách render.

Không cần tăng version cho:

- sửa typo mô tả;
- tối ưu nén asset không đổi hiển thị;
- sửa metadata không ảnh hưởng render.

## 8.2. Chính sách hiển thị ngày cũ

Ưu tiên giữ cảm giác cũ nhưng không nhất thiết giữ từng pixel.

Ứng dụng có thể:

- render exact version nếu asset còn;
- render compatible version nếu version cũ không còn;
- dùng fallback nếu theme đã bị gỡ.

## 8.3. Không phụ thuộc đường dẫn file

Database không lưu:

```text
/assets/themes/sakura/v1/cover.webp
```

Database chỉ lưu:

```text
theme_id = "sakura"
theme_version = 1
```

Registry tự resolve asset.

---

# 9. Dữ liệu và database

## 9.1. Mô hình đề xuất

Nếu `daily_logs` đã tồn tại, bổ sung:

```sql
ALTER TABLE daily_logs ADD COLUMN theme_id TEXT NULL;
ALTER TABLE daily_logs ADD COLUMN theme_version INTEGER NULL;
ALTER TABLE daily_logs ADD COLUMN cover_variant TEXT NULL;
ALTER TABLE daily_logs ADD COLUMN day_symbol TEXT NULL;
```

Có thể chỉ thêm hai trường đầu trong sprint đầu.

## 9.2. Quy tắc dữ liệu

- `theme_id` nullable.
- `theme_version` nullable khi `theme_id` null.
- Không foreign key cứng tới bảng theme nếu theme built-in nằm trong code.
- Validate ở application layer và persistence boundary.
- Không xóa daily log khi theme không hợp lệ.
- Không rollback nội dung nhật ký chỉ vì lỗi asset.

## 9.3. Default behavior

Ngày không có `theme_id`:

- sử dụng default day theme runtime;
- không nhất thiết ghi giá trị default xuống database;
- giúp default có thể thay đổi cho ngày mới trong tương lai mà không sửa ngày cũ.

## 9.4. Persist explicit selection

Khi người dùng chủ động chọn default theme, có thể lưu explicit ID nếu cần phân biệt:

- chưa từng chọn;
- đã chọn default có chủ ý.

Chỉ thêm trường trạng thái này nếu có use case rõ ràng. Không phức tạp hóa schema sớm.

---

# 10. Migration

## 10.1. Yêu cầu

Migration phải:

- transaction-safe;
- idempotent theo cơ chế migrator hiện có;
- không thay đổi dữ liệu daily log cũ;
- để theme fields null cho dữ liệu trước đó;
- có test upgrade từ schema trước;
- có test rollback khi migration lỗi.

## 10.2. Dữ liệu cũ

Mọi ngày cũ mặc định dùng `Default Day Theme`.

Không tự gán ngẫu nhiên theme cho lịch sử.

## 10.3. Future migration

Nếu format theme thay đổi:

- không rewrite toàn bộ daily log nếu registry có thể resolve;
- chỉ migrate khi dữ liệu cũ không thể đọc;
- giữ backup compatibility.

---

# 11. Day Cover

## 11.1. Vai trò

Day Cover là vùng biểu đạt chính của Day Theme.

Nó có thể chứa:

- ngày tháng;
- tiêu đề ngắn;
- quote hoặc prompt nhẹ;
- motif;
- illustration;
- nút mở theme picker;
- trạng thái ngày.

## 11.2. Không được biến thành hero marketing

Day Cover không được:

- quá cao;
- đẩy bảng công việc xuống xa;
- dùng ảnh quá rực;
- làm text khó đọc;
- chứa quá nhiều CTA;
- có animation nền liên tục.

## 11.3. Kích thước tham chiếu

- Large window: 160–220 px.
- Medium: 140–190 px.
- Small: 96–150 px.

Kích thước cụ thể phải theo thiết kế thực tế và được review bằng mắt.

## 11.4. Overlay

Cover có asset phải luôn có overlay hoặc text treatment bảo đảm tương phản.

Text tone phải được định nghĩa trong theme contract.

## 11.5. Fallback

Khi cover asset lỗi:

- dùng gradient;
- giữ title và date;
- không thay đổi height;
- không hiện broken image.

---

# 12. Theme Picker

## 12.1. Vị trí

Theme picker là action phụ, có thể đặt:

- trong day cover;
- trong overflow menu;
- trong panel personalization.

Không đặt ngang hàng với thao tác “Thêm dòng” nếu làm giảm ưu tiên nghiệp vụ.

## 12.2. Nội dung item

Mỗi theme item nên có:

- thumbnail;
- tên;
- mô tả ngắn;
- trạng thái selected;
- lock/premium indicator trong tương lai.

## 12.3. Preview

Preview có thể hoạt động khi hover/focus, nhưng:

- không được ghi database;
- phải hoàn nguyên khi đóng picker;
- không mất dữ liệu đang nhập;
- không gây re-render nặng;
- phải hỗ trợ bàn phím.

## 12.4. Apply

Khi apply:

1. Validate theme.
2. Update UI optimistic nếu an toàn.
3. Persist vào daily log.
4. Hiển thị saving state nhẹ.
5. Rollback UI nếu lưu thất bại.
6. Cho phép retry.

## 12.5. Reset

Có lựa chọn:

- Use default;
- Remove day-specific theme.

Copy phải rõ, tránh nhầm với xóa toàn bộ dữ liệu ngày.

---

# 13. Calendar Indicator

## 13.1. Mục tiêu

Calendar phải giúp người dùng nhìn nhanh “không khí” của tháng mà không làm mất khả năng đọc ngày và trạng thái dữ liệu.

## 13.2. Ưu tiên biểu đạt

Thứ tự ưu tiên:

1. Chấm màu semantic.
2. Dải nhỏ ở cạnh hoặc dưới ô ngày.
3. Symbol nhỏ.
4. Thumbnail chỉ dùng nếu đã thử nghiệm và không rối.

## 13.3. Quy tắc

- Indicator không che số ngày.
- Selected state và today state vẫn rõ hơn theme indicator.
- Không dùng full-cell background cho quá nhiều màu trong phiên bản đầu.
- Theme thiếu dùng indicator của fallback.
- Tooltip có thể hiện tên theme.
- Screen reader có accessible description khi cần.

## 13.4. Dữ liệu calendar

Calendar query chỉ cần lấy metadata nhẹ:

```ts
interface CalendarDaySummary {
  date: string;
  hasLog: boolean;
  completionSummary?: string;
  themeId?: string;
  themeVersion?: number;
}
```

Không tải full daily log chỉ để render indicator.

---

# 14. History View

## 14.1. Danh sách lịch sử

History item có thể thể hiện:

- accent line;
- symbol;
- cover thumbnail nhẹ;
- theme name trong metadata tùy chọn.

Không làm mỗi card quá khác nhau đến mức mất tính nhất quán.

## 14.2. Chi tiết ngày

Khi mở chi tiết:

- day cover render đúng theme;
- nội dung dùng semantic token;
- app shell giữ nguyên;
- control vẫn ở cùng vị trí;
- trạng thái read-only/edit giữ logic cũ.

## 14.3. Search

Theme có thể là filter trong tương lai, nhưng không phải yêu cầu của sprint đầu.

Ví dụ:

- tìm các ngày dùng Rainy;
- lọc các ngày thuộc nhóm warm.

Chỉ thêm khi có giá trị người dùng rõ ràng.

---

# 15. Theme Library khởi đầu

Không nên tạo quá nhiều theme trong phiên bản đầu.

Bộ khởi đầu đề xuất:

## 15.1. Done Today Default

Cảm giác:

- sạch;
- ấm nhẹ;
- trung tính;
- dùng lâu không mỏi.

## 15.2. Sakura

Cảm giác:

- nhẹ nhàng;
- tươi sáng;
- tinh tế;
- không quá “kẹo ngọt”.

Đặc điểm:

- hồng phấn kiểm soát;
- background sáng;
- motif hoa rất nhẹ;
- accent rõ nhưng không chói.

## 15.3. Coffee

Cảm giác:

- ấm;
- tập trung;
- quen thuộc;
- giống viết trong quán cà phê yên tĩnh.

Đặc điểm:

- giấy ngà;
- nâu ấm;
- shadow mềm;
- texture nhẹ.

## 15.4. Rainy

Cảm giác:

- chậm;
- trầm;
- phản tư;
- yên tĩnh.

Đặc điểm:

- xanh xám;
- contrast đủ cao;
- motif mưa tối giản;
- không làm toàn app u tối.

## 15.5. Midnight

Cảm giác:

- tập trung ban đêm;
- sâu;
- riêng tư.

Đặc điểm:

- nền tối;
- accent lạnh hoặc tím nhẹ;
- text contrast cao;
- tránh glow quá mức.

## 15.6. Forest

Cảm giác:

- tự nhiên;
- bình ổn;
- hồi phục.

Đặc điểm:

- xanh lá trầm;
- nền kem hoặc xanh nhạt;
- motif lá rất nhẹ.

Mỗi theme phải được review độc lập ở Today, Calendar và History.

---

# 16. Typography theo theme

Theme có thể thay đổi vai trò font, nhưng phải theo danh sách curated.

## 16.1. Cho phép

- đổi journal font giữa một số lựa chọn đã đóng gói;
- đổi heading weight;
- dùng display font cho cover title;
- thay letter spacing nhẹ.

## 16.2. Không cho phép

- user upload font tùy ý;
- dùng font display cho table;
- dùng font khó đọc cho nội dung dài;
- thay font làm layout nhảy mạnh;
- theme tự tải font từ mạng.

## 16.3. Fallback

Mọi font phải có fallback stack hỗ trợ tiếng Việt và Windows.

---

# 17. Asset Management

## 17.1. Asset ID

Registry dùng logical asset ID:

```text
theme.sakura.cover.primary
theme.coffee.texture.paper
theme.rainy.motif.cloud
```

Không để component biết file path.

## 17.2. Lazy loading

- Chỉ tải asset của theme hiện tại.
- Picker tải thumbnail nhỏ trước.
- Full cover tải khi theme được preview hoặc apply.
- Không preload toàn bộ theme pack.

## 17.3. Cache

Asset built-in có thể được cache bởi bundler/runtime.

Nếu tương lai có theme pack tải thêm:

- cache theo version;
- có checksum;
- có fallback;
- không block startup.

## 17.4. Security

Không render HTML/SVG không tin cậy từ theme pack tương lai nếu chưa sanitize.

---

# 18. Backup và Restore

## 18.1. Backup phải chứa

- `theme_id`;
- `theme_version`;
- optional day style metadata đã persist.

## 18.2. Backup không cần chứa

- built-in asset binary;
- thumbnail cache;
- generated preview;
- temporary theme state.

## 18.3. Restore

Khi restore:

1. Restore metadata.
2. Resolve theme bằng registry.
3. Nếu thiếu theme, dùng fallback.
4. Không fail toàn bộ import chỉ vì một theme không tồn tại.
5. Ghi warning trong import result nếu phù hợp.

## 18.4. Compatibility

Backup cũ không có theme fields vẫn hợp lệ.

---

# 19. Import, Merge và Conflict

Nếu app có merge backup:

- theme metadata đi cùng daily log;
- record mới hơn theo rule hiện có thắng nếu conflict;
- không tạo duplicate chỉ vì khác theme nếu nội dung cùng record;
- phải định nghĩa rõ source of truth;
- merge không được làm mất theme hiện có ngoài ý muốn.

Nếu chưa có timestamp đủ tin cậy cho theme change, dùng cùng chiến lược conflict của daily log hiện tại.

---

# 20. Accessibility

## 20.1. Contrast

Mọi theme phải đạt:

- body text WCAG AA;
- large text phù hợp;
- focus ring rõ;
- error/success phân biệt được;
- table text dễ đọc.

## 20.2. Reduced motion

Theme animation phải tắt hoặc giảm khi `prefers-reduced-motion`.

## 20.3. High contrast

Day Theme không được ghi đè high-contrast mode trong tương lai.

## 20.4. Screen reader

Tên theme không cần đọc lặp lại liên tục. Chỉ công bố khi:

- người dùng đổi theme;
- picker focus vào item;
- mở chi tiết nếu theme name thực sự có giá trị.

## 20.5. Color blindness

Calendar indicator không được chỉ dựa vào hue nếu theme distinction là thông tin quan trọng. Có thể kết hợp symbol hoặc pattern nhẹ.

---

# 21. Performance

## 21.1. Mục tiêu

Đổi theme phải cảm thấy tức thì.

Không được:

- reload route;
- query full history;
- tải toàn bộ asset;
- re-render app shell;
- block nhập liệu.

## 21.2. Rendering boundary

Nên giới hạn theme provider hoặc CSS scope ở day content container.

Ví dụ:

```tsx
<DayThemeScope theme={resolvedTheme}>
  <DayCover />
  <DailySummary />
  <DailyWorkTable />
</DayThemeScope>
```

## 21.3. Effects

Tránh:

- backdrop blur lớn;
- parallax;
- animated canvas;
- video background;
- nhiều layer gradient động.

---

# 22. Failure Modes

## 22.1. Theme ID không tồn tại

- Resolve fallback.
- UI tiếp tục hoạt động.
- Có log kỹ thuật.
- Không xóa giá trị gốc khỏi database tự động.

## 22.2. Version không tồn tại

- Dùng compatible latest version.
- Giữ metadata gốc.
- Có thể migrate sau.

## 22.3. Asset lỗi

- Dùng fallback gradient.
- Không làm vỡ cover.
- Không hiện broken image.

## 22.4. Persist thất bại

- Rollback preview đã apply.
- Hiển thị inline error hoặc trạng thái retry.
- Không mất nội dung daily log.

## 22.5. Theme contract lỗi

- Không đăng ký theme.
- Fallback registry.
- Fail test/build trong development nếu có thể.

---

# 23. Testing Strategy

## 23.1. Unit tests

- Registry resolve exact version.
- Registry fallback.
- Contract validation.
- Theme metadata serialization.
- Missing asset behavior.
- Calendar summary mapping.

## 23.2. Integration tests

- Chọn theme và persist.
- Mở lại ngày giữ theme.
- Backup/restore.
- Migration từ schema cũ.
- Theme missing không làm fail daily log.
- Preview không persist khi cancel.

## 23.3. UI tests

- Keyboard mở picker.
- Arrow navigation.
- Apply bằng Enter.
- Escape đóng.
- Focus restore.
- Loading/error state.
- Responsive behavior.

## 23.4. Visual review bắt buộc

Ít nhất:

- Default theme.
- Sakura.
- Coffee.
- Rainy hoặc Midnight.
- Today screen.
- Calendar.
- History detail.
- Small/medium/large window.

Build pass không thay thế visual review.

---

# 24. Acceptance Criteria cho sprint nền tảng

Sprint theme foundation chỉ hoàn tất khi:

1. Có theme contract rõ.
2. Có theme registry.
3. Component dùng semantic token.
4. Có default day theme.
5. Theme scope không ảnh hưởng app shell.
6. Có fallback.
7. Có migration fields tối thiểu.
8. Có test registry và persistence.
9. Không hard-code logic `themeId` trong component nghiệp vụ.
10. UI hiện tại không regression.

---

# 25. Acceptance Criteria cho Theme Picker

1. Mở được bằng mouse và keyboard.
2. Hiển thị thumbnail, tên và selected state.
3. Preview không persist.
4. Apply persist đúng ngày.
5. Cancel hoàn nguyên.
6. Đổi theme không reload.
7. Autosave nội dung không bị gián đoạn.
8. Persist fail có rollback và retry.
9. Accessibility label đầy đủ.
10. Không làm primary workflow chậm hơn.

---

# 26. Acceptance Criteria cho Calendar và History

1. Calendar query chỉ lấy metadata cần thiết.
2. Indicator nhẹ, không che số ngày.
3. Today/selected state vẫn rõ.
4. Mở ngày cũ render đúng theme.
5. Theme thiếu fallback an toàn.
6. History card không quá rối.
7. Keyboard navigation hoạt động.
8. Screen reader đọc được trạng thái cần thiết.
9. Không tải full theme asset cho toàn bộ tháng.
10. Visual review đạt yêu cầu.

---

# 27. Quy tắc triển khai cho Codex/AI

Khi triển khai phần theme, Codex phải:

1. Đọc các mục liên quan trong tài liệu này và `16-DESIGN-SYSTEM.md`.
2. Kiểm tra schema, backup và migration hiện có.
3. Không tự mở rộng sang sticker, marketplace hoặc custom theme editor.
4. Không đổi layout ngoài phạm vi.
5. Không thêm nhiều theme trước khi foundation ổn.
6. Dùng registry và semantic token.
7. Không nhúng asset path trực tiếp trong component.
8. Viết test cho fallback.
9. Chạy lint, typecheck, test, Rust test và build theo baseline dự án.
10. Báo cáo rõ phần cần nghiệm thu bằng mắt.
11. Không tuyên bố “giống mockup” nếu chưa có screenshot thực tế.
12. Không commit/push nếu prompt không yêu cầu.
13. Không phá dữ liệu cũ.
14. Cập nhật tài liệu khi contract hoặc schema thay đổi.
15. Dừng và hỏi nếu tài liệu mâu thuẫn với implementation hiện tại.

---

# 28. Checklist review theme

## 28.1. Product

- [ ] Theme có cảm xúc riêng.
- [ ] Theme không chỉ đổi màu.
- [ ] Giao diện mặc định vẫn đẹp.
- [ ] Theme picker là tùy chọn.
- [ ] Không làm người dùng phải cấu hình trước khi ghi.

## 28.2. Visual

- [ ] Cover không quá cao.
- [ ] Typography dễ đọc.
- [ ] Màu accent không chói.
- [ ] Texture đủ nhẹ.
- [ ] Table vẫn rõ.
- [ ] App shell không bị thay đổi.
- [ ] Theme khác nhau nhưng cùng một ngôn ngữ thiết kế.

## 28.3. Technical

- [ ] Registry resolve đúng.
- [ ] Fallback hoạt động.
- [ ] Database persist đúng.
- [ ] Backup/restore đúng.
- [ ] Migration có test.
- [ ] Missing asset không vỡ UI.
- [ ] Không hard-code `themeId`.
- [ ] Không tải asset thừa.

## 28.4. Accessibility

- [ ] Contrast đạt chuẩn.
- [ ] Focus visible.
- [ ] Keyboard usable.
- [ ] Reduced motion.
- [ ] Indicator không chỉ dựa vào màu.
- [ ] Text trên cover luôn đọc được.

---

# 29. Roadmap đề xuất

## Phase 1 — Foundation

- Theme contract.
- Theme registry.
- Default day theme.
- Theme scope.
- Database fields.
- Fallback.
- Tests.

## Phase 2 — First Themes

- Sakura.
- Coffee.
- Rainy hoặc Midnight.
- Visual review.
- Asset optimization.

## Phase 3 — Theme Picker

- Picker UI.
- Preview.
- Apply.
- Persist.
- Retry.
- Accessibility.

## Phase 4 — Calendar & History

- Indicator.
- History preview.
- Open old day with theme.
- Query optimization.

## Phase 5 — Personalization nhẹ

- Cover variant.
- Day symbol.
- Curated journal font.
- Không thêm freeform editor.

## Phase 6 — Theme Packs

Chỉ xem xét khi:

- core app ổn định;
- người dùng thực sự thích theme;
- có nhu cầu thương mại;
- license và distribution rõ ràng.

---

# 30. Non-goals

Trong giai đoạn hiện tại, Done Today không phải:

- Canva cho nhật ký;
- trình tạo theme tự do;
- scrapbook editor;
- app sticker;
- social theme marketplace;
- nền tảng custom CSS;
- page builder;
- clone của Notion;
- hệ thống widget kéo-thả.

Mục tiêu là tạo các theme đẹp được thiết kế sẵn, không phải trao toàn bộ quyền thiết kế cho người dùng.

---

# 31. Tóm tắt định hướng

Day Theme phải biến mỗi ngày thành một trang có dấu ấn riêng, nhưng không được phá vỡ tính quen thuộc của Done Today.

Người dùng phải có thể:

- mở app và ghi ngay;
- không chọn theme vẫn thấy đẹp;
- chọn theme khi muốn thể hiện cảm xúc;
- nhìn calendar và nhận ra bầu không khí của tháng;
- mở ngày cũ và cảm nhận lại không khí hôm đó;
- tin rằng dữ liệu và theme sẽ còn nguyên sau backup, restore và update.

Nguyên tắc cuối cùng:

> App shell giữ sự ổn định. Day Theme giữ ký ức. Nội dung luôn là trung tâm.
