export default {
  foundation:{ready:'Sẵn sàng'},
  heading:{
    eyebrow:'Nhìn lại hành trình',
    title:'Lịch sử',
    subtitle:'Mỗi ngày đã ghi lại là một dấu mốc nhỏ.',
  },
  status:{loading:'Đang tải lịch sử…',loadingMore:'Đang tải…'},
  errors:{load:'Không thể tải lịch sử.'},
  emptyState:{
    title:'Chưa có ngày nhật ký nào.',
    body:'Những ngày bạn ghi lại sẽ xuất hiện tại đây.',
  },
  summary:{
    daily_other:'{{count, integer}} việc · {{completed, integer}} hoàn thành · {{percentage}}',
  },
  actions:{goToToday:'Đi đến Hôm nay',loadMore:'Tải thêm'},
  accessibility:{
    list:'Danh sách ngày nhật ký',
    openDay:'Mở {{date}}: {{summary}}',
    completionRateForDay:'Tỷ lệ hoàn thành của {{date}}',
  },
} as const;
