# 16-DESIGN-SYSTEM.md

# Done Today Design System

**Phiên bản:** 1.0  
**Trạng thái:** Tài liệu chuẩn bắt buộc  
**Phạm vi:** Toàn bộ giao diện desktop của Done Today  
**Đối tượng sử dụng:** Product owner, designer, Codex/AI triển khai, reviewer và người bảo trì mã nguồn

---

## 0. Cách sử dụng tài liệu

Tài liệu này là nguồn sự thật chính cho mọi quyết định liên quan đến giao diện của Done Today.

Các từ khóa được hiểu như sau:

- **MUST / BẮT BUỘC:** Không được vi phạm.
- **SHOULD / NÊN:** Chỉ được làm khác khi có lý do rõ ràng và được ghi nhận.
- **MAY / CÓ THỂ:** Tùy chọn, không phải yêu cầu.
- **NON-GOAL / KHÔNG PHẢI MỤC TIÊU:** Không được mở rộng phạm vi theo hướng đó trong giai đoạn hiện tại.

Khi một đặc tả sprint mâu thuẫn với tài liệu này, phải dừng triển khai và yêu cầu làm rõ. Không được tự suy diễn rồi làm khác design system.

---

# 1. Các quy tắc không được vi phạm

1. **Done Today phải đẹp ngay ở trạng thái mặc định.**
2. **Tùy biến là lựa chọn, không phải điều kiện để giao diện trở nên đẹp.**
3. **Khả năng sử dụng luôn quan trọng hơn trang trí.**
4. **Không hard-code màu sắc, khoảng cách, bo góc hoặc shadow trực tiếp trong component nếu đã có token tương ứng.**
5. **Theme không được thay đổi cấu trúc, thứ tự hoặc vị trí của các thao tác chính.**
6. **Nội dung nhật ký và bảng công việc luôn phải có độ tương phản dễ đọc.**
7. **Không sử dụng hiệu ứng chuyển động chỉ để gây ấn tượng.**
8. **Mọi trạng thái tương tác phải có đủ: default, hover, focus, active, disabled, loading và error khi phù hợp.**
9. **Mọi thao tác chính phải sử dụng được bằng bàn phím.**
10. **Không dùng icon thay cho chữ nếu hành động có thể gây nhầm lẫn.**
11. **Không làm giao diện dày đặc chỉ để hiển thị nhiều dữ liệu hơn.**
12. **Không thêm thành phần trang trí che nội dung hoặc làm giảm khả năng tập trung.**
13. **Không để một theme riêng lẻ tự định nghĩa CSS ngoài hệ thống token.**
14. **Mọi thay đổi UI phải được kiểm tra ở kích thước cửa sổ nhỏ, trung bình và lớn.**
15. **Mọi màn hình mới phải trông như cùng một sản phẩm, không phải một ứng dụng khác.**

---

# 2. Triết lý thiết kế

## 2.1. Beautiful by default

Người dùng mở Done Today lần đầu phải thấy một sản phẩm hoàn chỉnh, tinh tế và dễ chịu. Họ không cần chọn theme, font hoặc màu để “sửa” giao diện mặc định.

Giao diện mặc định phải:

- đủ đẹp để dùng lâu dài;
- đủ trung tính để phù hợp với nhiều người;
- không quá lạnh như một công cụ doanh nghiệp;
- không quá trang trí như một ứng dụng scrapbook;
- không tạo cảm giác phải học cách sử dụng.

## 2.2. Productivity first

Done Today là nơi ghi lại tiến bộ trong ngày. Mọi quyết định thẩm mỹ phải phục vụ ba hành động cốt lõi:

1. Ghi nhanh.
2. Nhìn lại dễ.
3. Cảm nhận được tiến bộ.

Nếu một hiệu ứng đẹp nhưng làm chậm nhập liệu, che nội dung, giảm tương phản hoặc khiến người dùng phân tâm, hiệu ứng đó phải bị loại bỏ.

## 2.3. Calm, warm, personal

Sản phẩm phải mang ba phẩm chất:

- **Calm:** Không gây căng thẳng hoặc quá tải thị giác.
- **Warm:** Có cảm giác gần gũi hơn một bảng quản lý công việc thuần túy.
- **Personal:** Có không gian để mỗi ngày mang dấu ấn riêng.

## 2.4. Consistency over novelty

Người dùng không được phải học lại giao diện khi chuyển màn hình, đổi theme hoặc mở một ngày cũ.

Tính mới lạ chỉ được thể hiện qua:

- màu sắc;
- cover;
- texture nhẹ;
- hình minh họa;
- icon chủ đề;
- sắc thái typography đã được kiểm soát.

Tính mới lạ không được thể hiện bằng cách thay đổi layout hoặc vị trí điều khiển.

---

# 3. Tính cách thương hiệu

Done Today nên được cảm nhận như:

- điềm tĩnh;
- tử tế;
- rõ ràng;
- có chiều sâu;
- khuyến khích nhưng không phán xét;
- đẹp nhưng không phô trương;
- cá nhân nhưng không trẻ con.

Done Today không nên giống:

- dashboard doanh nghiệp;
- công cụ quản trị dự án;
- ứng dụng game hóa quá mức;
- mạng xã hội;
- trình chỉnh sửa thiết kế;
- ứng dụng ghi chú quá kỹ thuật.

---

# 4. Ngôn ngữ thị giác

## 4.1. Hình khối

- Ưu tiên hình chữ nhật bo góc nhẹ.
- Tránh bo tròn quá mức khiến giao diện giống ứng dụng trẻ em.
- Không dùng quá nhiều lớp card lồng nhau.
- Viền nên nhẹ, shadow vừa đủ để phân tầng.
- Các vùng chức năng chính phải có ranh giới thị giác rõ ràng.

## 4.2. Mật độ

Mật độ mặc định ở mức thoáng vừa phải:

- đủ khoảng trắng để đọc lâu;
- không lãng phí diện tích;
- không ép quá nhiều dòng vào một màn hình;
- bảng có thể compact hơn card nhật ký nhưng vẫn phải dễ quét mắt.

## 4.3. Hình minh họa

Hình minh họa phải:

- hỗ trợ không khí;
- không mang thông tin chức năng quan trọng;
- không che văn bản;
- không làm nền quá tương phản;
- có fallback khi asset không tải được.

## 4.4. Texture

Texture chỉ được dùng rất nhẹ, ví dụ:

- giấy;
- hạt mịn;
- gradient;
- hiệu ứng mờ.

Texture không được:

- làm chữ khó đọc;
- gây nhiễu;
- tạo dung lượng asset lớn không cần thiết;
- làm scrolling giật.

---

# 5. Hệ thống layout

## 5.1. App shell

App shell gồm:

1. Sidebar hoặc navigation rail.
2. Main content.
3. Optional utility area.
4. Global overlays như dialog, toast, command palette.

App shell phải ổn định giữa mọi theme và mọi màn hình.

## 5.2. Chiều rộng nội dung

- Nội dung không nên kéo quá rộng trên màn hình lớn.
- Trang đọc/nhật ký dài nên có max-width để giữ độ dài dòng dễ đọc.
- Bảng dữ liệu có thể rộng hơn nhưng không được làm mất khả năng quét mắt.
- Căn lề nội dung phải nhất quán giữa các màn hình.

## 5.3. Grid

Grid cơ bản dùng hệ 4 px.

Mọi khoảng cách phải là bội số của 4, trừ các trường hợp kỹ thuật đặc biệt như border 1 px.

## 5.4. Breakpoints tham chiếu

- **Small:** dưới 900 px
- **Medium:** 900–1279 px
- **Large:** 1280–1599 px
- **XL:** từ 1600 px

Không được giả định người dùng luôn chạy app toàn màn hình.

## 5.5. Responsive behavior

Ở cửa sổ nhỏ:

- sidebar có thể thu gọn;
- cover có thể giảm chiều cao;
- bảng có thể chuyển sang scroll ngang hoặc layout phù hợp;
- thao tác chính vẫn phải nhìn thấy;
- không được ẩn thông tin quan trọng mà không có cách truy cập thay thế.

---

# 6. Spacing system

Sử dụng các token:

| Token | Giá trị |
|---|---:|
| `space-0` | 0 px |
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

Quy tắc:

- Khoảng cách nội bộ component nhỏ: 4–12 px.
- Padding input/button: 8–16 px.
- Padding card: 16–24 px.
- Khoảng cách giữa section: 24–48 px.
- Không tự thêm giá trị lẻ như 13 px, 18 px, 27 px nếu không có lý do rõ ràng.

---

# 7. Typography

## 7.1. Nguyên tắc

Typography phải:

- dễ đọc trong thời gian dài;
- hỗ trợ tiếng Việt đầy đủ;
- hiển thị tốt ở Windows;
- không dùng quá nhiều font;
- giữ hierarchy rõ ràng.

## 7.2. Font roles

Tối đa ba vai trò:

1. **UI font:** navigation, button, label, table.
2. **Journal font:** nội dung nhật ký dài.
3. **Display font tùy chọn:** tiêu đề cover hoặc theme đặc biệt.

Mặc định nên chỉ cần UI font và journal font. Display font chỉ dùng trong theme được kiểm soát.

## 7.3. Type scale tham chiếu

| Token | Cỡ | Line-height | Công dụng |
|---|---:|---:|---|
| `text-xs` | 12 px | 16 px | metadata |
| `text-sm` | 14 px | 20 px | label, phụ chú |
| `text-md` | 16 px | 24 px | body mặc định |
| `text-lg` | 18 px | 28 px | section title nhỏ |
| `text-xl` | 22 px | 30 px | section title |
| `text-2xl` | 28 px | 36 px | page title |
| `text-3xl` | 36 px | 44 px | cover title |

## 7.4. Quy tắc nội dung dài

- Độ dài dòng lý tưởng: 55–80 ký tự.
- Không dùng chữ quá nhạt cho đoạn dài.
- Không dùng font display cho body.
- Không dùng chữ in hoa toàn bộ cho tiêu đề dài.
- Placeholder phải nhẹ hơn body nhưng vẫn đọc được.

---

# 8. Color system

## 8.1. Semantic tokens

Component chỉ được sử dụng semantic token:

```text
color.page
color.surface
color.surfaceRaised
color.surfaceMuted
color.text
color.textMuted
color.textSubtle
color.border
color.borderStrong
color.accent
color.accentHover
color.accentSoft
color.success
color.warning
color.danger
color.info
color.focusRing
```

Không sử dụng tên màu vật lý như `pink500`, `brown200` trực tiếp trong component.

## 8.2. Trạng thái

Màu trạng thái phải có:

- foreground;
- background nhẹ;
- border;
- icon;
- hover nếu có tương tác.

Không truyền tải trạng thái chỉ bằng màu. Phải có ít nhất một yếu tố bổ sung như icon, label hoặc pattern.

## 8.3. Tương phản

- Body text: tối thiểu WCAG AA.
- Large text: tối thiểu WCAG AA cho large text.
- Placeholder không được nhạt đến mức khó đọc.
- Disabled state có thể giảm độ nổi bật nhưng vẫn phải nhận biết được.
- Focus ring phải thấy rõ trên mọi theme.

## 8.4. Day theme compatibility

Theme có thể thay palette, nhưng phải map đầy đủ về semantic token. Không component nào được tự kiểm tra `themeId` để đổi màu riêng.

Sai:

```ts
if (themeId === "sakura") {
  return "#f7a3bd";
}
```

Đúng:

```ts
return tokens.color.accent;
```

---

# 9. Radius và border

## 9.1. Radius tokens

| Token | Giá trị |
|---|---:|
| `radius-sm` | 6 px |
| `radius-md` | 10 px |
| `radius-lg` | 14 px |
| `radius-xl` | 20 px |
| `radius-pill` | 999 px |

## 9.2. Sử dụng

- Input/button: `radius-md`
- Card: `radius-lg`
- Cover lớn: `radius-xl`
- Badge/chip: `radius-pill`

Không dùng mọi thành phần đều bo tròn lớn.

## 9.3. Border

- Border mặc định: 1 px.
- Border phải đủ rõ để phân tách nhưng không quá nặng.
- Focus không được dùng border thay cho focus ring nếu gây layout shift.

---

# 10. Shadow và elevation

## 10.1. Các mức elevation

| Token | Dùng cho |
|---|---|
| `shadow-none` | phần tử phẳng |
| `shadow-sm` | card nhẹ |
| `shadow-md` | popover, floating control |
| `shadow-lg` | dialog |
| `shadow-focus` | focus ring hoặc glow kiểm soát |

## 10.2. Quy tắc

- Không dùng shadow tối, dày hoặc nhiều lớp quá mức.
- Shadow phải phù hợp cả nền sáng và tối.
- Không dùng shadow để thay thế border khi cần phân tách rõ.
- Theme có thể thay sắc thái shadow, không thay mức elevation.

---

# 11. Iconography

## 11.1. Phong cách

- Outline icon.
- Stroke nhất quán.
- Hình đơn giản.
- Không trộn nhiều bộ icon.
- Không dùng emoji làm icon chức năng chính.

## 11.2. Kích thước

- 16 px: metadata.
- 18–20 px: button hoặc table.
- 24 px: navigation.
- 32 px trở lên: empty state hoặc decorative.

## 11.3. Label

Các hành động có rủi ro như xóa, thay thế, ghi đè phải có text label hoặc tooltip rõ ràng.

---

# 12. Button specification

## 12.1. Biến thể

- Primary
- Secondary
- Ghost
- Destructive
- Icon-only
- Link-style

## 12.2. Chiều cao

- Small: 32 px
- Medium: 40 px
- Large: 48 px

## 12.3. Quy tắc

- Mỗi khu vực chỉ nên có một primary action nổi bật.
- Không đặt hai nút primary cạnh nhau.
- Destructive action không dùng làm primary mặc định.
- Icon-only button bắt buộc có tooltip và accessible label.
- Loading state phải giữ nguyên chiều rộng để tránh layout shift.

---

# 13. Input, textarea và editor

## 13.1. Input

Phải có:

- label hoặc accessible name;
- placeholder tùy chọn;
- helper text khi cần;
- error message;
- focus state rõ ràng;
- disabled và read-only khác nhau.

## 13.2. Textarea

Textarea là thành phần quan trọng của Done Today.

Yêu cầu:

- tự mở rộng trong giới hạn hợp lý hoặc có scroll rõ ràng;
- không giật layout khi autosave;
- giữ con trỏ ổn định;
- trạng thái lưu không che nội dung;
- resize behavior có chủ ý;
- hỗ trợ nhập tiếng Việt tốt;
- không giới hạn ký tự mà không hiển thị phản hồi.

## 13.3. Autosave state

Trạng thái autosave nên có bốn mức:

- Đang chỉnh sửa/chưa lưu.
- Đang lưu.
- Đã lưu.
- Lưu thất bại.

Không dùng toast cho mỗi lần autosave thành công.

---

# 14. Card và section

## 14.1. Card

Card chỉ dùng khi cần nhóm nội dung có ranh giới rõ.

Không dùng card cho mọi thứ.

Card phải có:

- tiêu đề rõ khi cần;
- padding nhất quán;
- action đặt cố định;
- background và border phù hợp theme.

## 14.2. Section

Section có thể dùng khoảng trắng thay vì card.

Ưu tiên:

- heading;
- mô tả ngắn;
- nội dung;
- action phụ.

---

# 15. Table và danh sách công việc

## 15.1. Mục tiêu

Bảng phải ưu tiên:

- quét nhanh;
- chỉnh sửa nhanh;
- trạng thái rõ;
- không quá dày;
- không tạo cảm giác spreadsheet nặng nề.

## 15.2. Header

- Sticky nếu bảng dài.
- Typography rõ.
- Không quá tương phản so với body.
- Có thể dùng background nhẹ.

## 15.3. Row

- Hover rất nhẹ.
- Focus row rõ khi dùng bàn phím.
- Trạng thái không chỉ bằng màu.
- Action nguy hiểm không được nổi bật thường trực.
- Row height đủ cho textarea và touch target.

## 15.4. Empty state

Không hiển thị bảng rỗng vô nghĩa. Phải có lời dẫn và hành động bắt đầu.

---

# 16. Calendar

Calendar là nơi người dùng nhìn lại tiến trình và dấu ấn của từng ngày.

Yêu cầu:

- ngày hiện tại phải rõ;
- ngày được chọn phải rõ;
- ngày có dữ liệu và ngày trống phải phân biệt được;
- day theme chỉ được thể hiện bằng indicator nhẹ;
- không biến calendar thành mosaic quá nhiều màu;
- có tooltip hoặc legend khi cần;
- keyboard navigation đầy đủ.

Indicator theme ưu tiên:

1. chấm màu;
2. icon nhỏ;
3. dải màu nhẹ;
4. thumbnail chỉ khi đã chứng minh không gây rối.

---

# 17. Dialog, popover và toast

## 17.1. Dialog

Dialog chỉ dùng khi:

- cần xác nhận rủi ro;
- cần tập trung vào một thao tác;
- không thể xử lý tốt inline.

Không dùng dialog cho mọi thiết lập nhỏ.

## 17.2. Popover

Popover phải:

- neo đúng vị trí;
- đóng bằng Escape;
- giữ focus hợp lý;
- không tràn khỏi viewport.

## 17.3. Toast

Toast dùng cho:

- kết quả thao tác đáng chú ý;
- lỗi cần biết;
- hành động hoàn tất không có chỗ hiển thị inline.

Không dùng toast cho autosave thành công liên tục.

---

# 18. Empty, loading, error và success states

## 18.1. Empty state

Empty state phải:

- giải thích ngắn;
- không phán xét;
- có một hành động chính;
- không dùng minh họa quá lớn.

## 18.2. Loading

- Ưu tiên skeleton nếu cấu trúc đã biết.
- Spinner chỉ dùng cho vùng nhỏ hoặc thời gian ngắn.
- Không khóa toàn màn hình nếu chỉ một phần đang tải.

## 18.3. Error

Thông báo lỗi phải:

- nói điều gì đã xảy ra;
- nói người dùng có thể làm gì;
- không lộ stack trace hoặc mã kỹ thuật;
- giữ dữ liệu người dùng nếu có thể.

## 18.4. Success

Success state nên kín đáo. Done Today không cần confetti cho thao tác thông thường.

---

# 19. Motion

## 19.1. Duration

| Token | Giá trị |
|---|---:|
| `motion-fast` | 120 ms |
| `motion-normal` | 180 ms |
| `motion-slow` | 240 ms |

## 19.2. Easing

Dùng easing nhẹ, tự nhiên. Không bounce trừ trường hợp đặc biệt được thiết kế có chủ ý.

## 19.3. Quy tắc

Motion chỉ được dùng để:

- giải thích chuyển trạng thái;
- duy trì ngữ cảnh;
- làm thao tác mượt hơn;
- nhấn phản hồi.

Không dùng motion để:

- gây bất ngờ;
- kéo dài chờ đợi;
- làm nội dung di chuyển liên tục;
- tạo nền động gây phân tâm.

Phải tôn trọng `prefers-reduced-motion`.

---

# 20. Accessibility

## 20.1. Keyboard

Mọi thao tác chính phải:

- tab tới được;
- có focus visible;
- dùng Enter/Space hợp lý;
- đóng overlay bằng Escape;
- giữ focus sau khi thao tác.

## 20.2. Screen reader

- Icon button có accessible label.
- Input có label.
- Error gắn với field.
- Trạng thái autosave có live region phù hợp nhưng không gây spam.
- Bảng có semantic structure.

## 20.3. Touch target

Dù là desktop app, vùng bấm chính nên tối thiểu khoảng 36–40 px.

## 20.4. Color blindness

Không dùng chỉ màu để thể hiện trạng thái, mức độ hoặc phân loại.

---

# 21. Theme compatibility

Mọi component phải render đúng trong:

- Default light.
- Default dark nếu hỗ trợ.
- Day theme sáng.
- Day theme tối.
- High contrast hoặc accessibility mode trong tương lai.

Component không được:

- dùng ảnh nền cố định ngoài token;
- tự lấy màu từ asset;
- đổi DOM structure theo theme;
- phụ thuộc vào một palette cụ thể.

---

# 22. Asset rules

## 22.1. Định dạng

Ưu tiên:

- SVG cho icon và minh họa đơn giản;
- WebP/AVIF cho ảnh raster;
- PNG chỉ khi cần transparency đặc biệt.

## 22.2. Dung lượng

Asset theme phải được tối ưu. Không chấp nhận ảnh cover dung lượng lớn chỉ để tạo hiệu ứng nhẹ.

## 22.3. Fallback

Nếu asset lỗi:

- background màu vẫn đẹp;
- text vẫn đọc được;
- layout không vỡ;
- không hiện biểu tượng ảnh hỏng.

---

# 23. Localization

Giao diện phải hỗ trợ tiếng Việt và tiếng Anh.

Quy tắc:

- không đặt chiều rộng cố định quá hẹp cho button text;
- không cắt câu quan trọng;
- date/time format theo locale;
- font hỗ trợ đầy đủ dấu tiếng Việt;
- không hard-code câu chữ trong component nếu hệ thống i18n đã tồn tại.

---

# 24. Performance UI

- Không để theme gây re-render toàn app không cần thiết.
- Không dùng blur lớn trên vùng cuộn dài.
- Không dùng nhiều shadow nặng.
- Không tải toàn bộ theme asset khi chưa cần.
- Không để animation làm giảm khả năng nhập liệu.
- Không trì hoãn hiển thị nội dung cốt lõi để chờ asset trang trí.

---

# 25. Design tokens kỹ thuật

Khuyến nghị cấu trúc:

```ts
interface DesignTokens {
  color: {
    page: string;
    surface: string;
    surfaceRaised: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    border: string;
    borderStrong: string;
    accent: string;
    accentHover: string;
    accentSoft: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    focusRing: string;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  typography: {
    fontUi: string;
    fontJournal: string;
    fontDisplay?: string;
  };
  motion: {
    fast: string;
    normal: string;
    slow: string;
  };
}
```

Có thể triển khai bằng CSS variables, theme provider hoặc kết hợp cả hai. Dù dùng cách nào, semantic token phải là API duy nhất mà component tiêu thụ.

---

# 26. Quy tắc triển khai cho Codex/AI

Khi làm UI, Codex phải:

1. Đọc các mục liên quan của tài liệu này.
2. Kiểm tra component hiện có trước khi tạo component mới.
3. Không tạo token mới nếu token hiện tại đã đáp ứng.
4. Không hard-code visual value trong JSX/TSX nếu có thể đưa vào token.
5. Không thay đổi layout ngoài phạm vi sprint.
6. Không “cải tiến” giao diện không được yêu cầu.
7. Giữ tương thích với theme hiện tại.
8. Viết hoặc cập nhật test khi thay đổi behavior.
9. Chạy lint, typecheck, test và build.
10. Báo cáo rõ mọi điểm chưa thể nghiệm thu bằng test tự động.
11. Chụp hoặc yêu cầu kiểm tra thủ công các màn hình chính.
12. Không tuyên bố “giao diện đẹp” chỉ vì build pass.

---

# 27. UI review checklist

## 27.1. Visual

- [ ] Spacing dùng đúng token.
- [ ] Typography đúng hierarchy.
- [ ] Không có màu hard-code không cần thiết.
- [ ] Border, radius và shadow nhất quán.
- [ ] Layout không bị dày hoặc rỗng bất thường.
- [ ] Không có thành phần trang trí che nội dung.
- [ ] Giao diện mặc định vẫn đẹp khi không có tùy biến.

## 27.2. Interaction

- [ ] Hover rõ nhưng không quá mạnh.
- [ ] Focus visible.
- [ ] Disabled khác read-only.
- [ ] Loading không gây layout shift.
- [ ] Error có cách khắc phục.
- [ ] Keyboard navigation hoạt động.
- [ ] Escape đóng overlay phù hợp.

## 27.3. Theme

- [ ] Default theme hoạt động.
- [ ] Theme khác không làm vỡ layout.
- [ ] Tương phản đạt yêu cầu.
- [ ] Missing asset có fallback.
- [ ] Không có điều kiện `themeId` trong component trừ theme infrastructure.

## 27.4. Responsive

- [ ] Small window.
- [ ] Medium window.
- [ ] Large window.
- [ ] Nội dung không bị cắt.
- [ ] Action chính vẫn dễ truy cập.

## 27.5. Quality

- [ ] TypeScript pass.
- [ ] Lint pass.
- [ ] Tests pass.
- [ ] Build pass.
- [ ] Không có regression đã biết.
- [ ] Có ghi chú những phần cần kiểm tra thủ công.

---

# 28. Acceptance criteria toàn cục

Một thay đổi UI chỉ được coi là hoàn tất khi:

1. Đúng phạm vi yêu cầu.
2. Không phá luồng thao tác hiện có.
3. Dùng design token.
4. Hoạt động với theme mặc định.
5. Có trạng thái hover/focus/disabled/error cần thiết.
6. Hỗ trợ bàn phím.
7. Không giảm tương phản.
8. Không tạo layout shift đáng kể.
9. Chạy qua toàn bộ kiểm tra kỹ thuật bắt buộc.
10. Được kiểm tra trực quan ở ít nhất ba kích thước cửa sổ.
11. Không có tổ hợp giao diện xấu do tùy biến.
12. Reviewer có thể truy vết quyết định về tài liệu hoặc đặc tả sprint.

---

# 29. Non-goals

Tài liệu này không nhằm biến Done Today thành:

- công cụ thiết kế tự do;
- trình tạo layout tùy chỉnh;
- nền tảng kéo-thả widget;
- clone của Notion;
- scrapbook editor;
- ứng dụng mạng xã hội;
- hệ thống theme cho phép người dùng chỉnh từng màu không giới hạn.

Done Today có thể cho phép cá nhân hóa, nhưng phải luôn giữ chất lượng thiết kế do sản phẩm kiểm soát.

---

# 30. Chính sách mở rộng

Khi cần thêm token, component hoặc pattern mới:

1. Kiểm tra xem đã có cách giải quyết tương đương chưa.
2. Chứng minh nhu cầu xuất hiện ở nhiều hơn một nơi hoặc có giá trị lâu dài.
3. Định nghĩa semantic meaning, không chỉ giá trị trực quan.
4. Cập nhật tài liệu trước hoặc cùng commit.
5. Bổ sung ví dụ sử dụng và non-example nếu dễ nhầm.
6. Không thay đổi token hiện có theo cách phá theme cũ mà không có migration.

---

# 31. Tóm tắt định hướng

Done Today phải mang lại cảm giác:

> Một không gian yên tĩnh, đẹp và đáng tin cậy để người dùng ghi lại những điều mình đã làm, nhìn thấy tiến bộ và lưu giữ dấu ấn của từng ngày.

Thiết kế không được tranh giành sự chú ý với nội dung. Thiết kế phải giúp nội dung trở nên dễ ghi, dễ đọc và đáng nhớ hơn.

**Giao diện mặc định phải hoàn chỉnh. Theme phải làm giàu trải nghiệm. Tùy biến phải luôn là lựa chọn.**
