export default {
  foundation: { ready: 'Sẵn sàng' },
  heading: {
    eyebrow: 'Nhìn lại hành trình',
    title: 'Lịch sử',
    subtitle: 'Mỗi ngày đã ghi lại là một dấu mốc nhỏ.',
  },
  status: { loading: 'Đang tải lịch sử…', loadingMore: 'Đang tải…' },
  errors: { load: 'Không thể tải lịch sử.' },
  calendar: {
    previousMonth: 'Tháng trước',
    nextMonth: 'Tháng sau',
    loading: 'Đang tải lịch tháng…',
    loadError: 'Không thể tải lịch tháng.',
    accessibility: {
      openLoggedDay: 'Mở {{date}}. Có nhật ký. Chủ đề ngày: {{theme}}.',
      openEmptyDay: 'Mở {{date}}. Chưa có nhật ký.',
    },
  },
  emptyState: {
    title: 'Chưa có ngày nhật ký nào.',
    body: 'Những ngày bạn ghi lại sẽ xuất hiện tại đây.',
  },
  summary: {
    daily_other:
      '{{count, integer}} việc · {{completed, integer}} hoàn thành · {{percentage}}',
  },
  themeIdentity: 'Chủ đề ngày: {{theme}}',
  actions: { goToToday: 'Đi đến Hôm nay', loadMore: 'Tải thêm' },
  accessibility: {
    list: 'Danh sách ngày nhật ký',
    openDay: 'Mở {{date}}: {{summary}}. Chủ đề ngày: {{theme}}.',
    completionRateForDay: 'Tỷ lệ hoàn thành của {{date}}',
  },
  backendErrors: {
    paginationInvalid: 'Trang lịch sử được yêu cầu không hợp lệ.',
  },
} as const;
