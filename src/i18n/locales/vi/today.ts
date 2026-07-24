export default {
  foundation:{ready:'Sẵn sàng'},
  eyebrow:{today:'Hôm nay',archive:'Nhật ký theo ngày'},
  heading:{prompt:'Hôm nay bạn đã tạo ra điều gì?'},
  subtitle:{
    today:'Ghi lại một ngày bình thường — vì đó là cách tiến bộ được tạo nên.',
    past:'Bạn có thể xem và chỉnh sửa ngày cũ bằng cùng một bảng.',
  },
  dateControls:{previous:'Ngày trước',next:'Ngày sau',choose:'Chọn ngày',today:'Hôm nay'},
  stats:{label:'Thống kê trong ngày',total:'Tổng số việc',completed:'Hoàn thành',completionRate:'Tỷ lệ hoàn thành'},
  status:{loading:'Đang đọc dữ liệu…'},
  table:{
    label:'Bảng công việc trong ngày',
    columns:{order:'Thứ tự',task:'Việc đã làm',result:'Kết quả',nextAction:'Bước tiếp theo',status:'Trạng thái',actions:'Hành động'},
  },
  categories:{
    other:'Việc khác',
    hidden:'Đã ẩn',
    completedCount_other:'Đã hoàn thành {{completed}}/{{count}} việc',
    addItem:'Thêm việc vào {{category}}',
    expand:'Mở rộng {{category}}',
    collapse:'Thu gọn {{category}}',
  },
  emptyState:{title:'Chưa có việc nào.',body:'Chọn một nhóm bên dưới để bắt đầu ghi lại ngày hôm nay.'},
  addItem:{label:'Thêm dòng vào',chooseCategory:'Chọn nhóm…',accessibility:{chooseCategory:'Chọn nhóm cho dòng mới'}},
  autosave:{hint:'Ctrl + Enter để thêm dòng · Thay đổi được tự động lưu'},
} as const;
