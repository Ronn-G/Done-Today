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
  fields:{
    task:{label:'Việc đã làm',placeholder:'Bạn đã làm gì?'},
    result:{label:'Kết quả',placeholder:'Kết quả ra sao?'},
    nextAction:{label:'Bước tiếp theo',placeholder:'Tiếp theo cần làm gì?'},
    status:{label:'Trạng thái'},
  },
  status:{
    loading:'Đang đọc dữ liệu…',
    options:{completed:'Hoàn thành',inProgress:'Đang làm',postponed:'Bị hoãn',cancelled:'Đã hủy'},
  },
  table:{
    label:'Bảng công việc trong ngày',
    columns:{order:'Thứ tự',task:'Việc đã làm',result:'Kết quả',nextAction:'Bước tiếp theo',status:'Trạng thái',actions:'Hành động'},
  },
  categories:{
    other:'Việc khác',
    hidden:'Đã ẩn',
    completedCount_other:'Đã hoàn thành {{completed}}/{{count}} việc',
    addItem:'Thêm việc vào {{category}}',
    moveTo:'Chuyển sang nhóm',
    expand:'Mở rộng {{category}}',
    collapse:'Thu gọn {{category}}',
  },
  item:{
    untitled:'chưa có tên',
    delete:'Xóa công việc',
    accessibility:{actionsForTask:'Hành động cho công việc {{task}}'},
    confirmDelete:{
      title:'Xóa công việc này?',
      body:'Nội dung đã nhập sẽ không thể khôi phục.',
      confirm:'Xóa công việc',
    },
    errors:{
      delete:'Không thể xóa công việc. Hãy thử lại.',
      move:'Không thể chuyển nhóm công việc. Hãy thử lại.',
      reorder:'Không thể thay đổi thứ tự công việc. Hãy thử lại.',
    },
  },
  emptyState:{title:'Chưa có việc nào.',body:'Chọn một nhóm bên dưới để bắt đầu ghi lại ngày hôm nay.'},
  addItem:{label:'Thêm dòng vào',chooseCategory:'Chọn nhóm…',accessibility:{chooseCategory:'Chọn nhóm cho dòng mới'}},
  autosave:{hint:'Ctrl + Enter để thêm dòng · Thay đổi được tự động lưu'},
} as const;
