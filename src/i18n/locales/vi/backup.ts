export default {
  settings:{
    title:'Sao lưu và khôi phục',
    description:'Dữ liệu được lưu cục bộ. Tệp JSON có thể dùng để chuyển hoặc khôi phục nhật ký.',
    privacyWarning:'Tệp sao lưu có thể chứa nội dung nhật ký và dữ liệu cá nhân. Hãy lưu ở nơi an toàn.',
  },
  export:{
    action:'Xuất bản sao lưu',
    success:'Đã lưu {{fileName}}: {{summary}}.',
    summary:{
      dailyLogs_other:'{{count, integer}} ngày nhật ký',
      workItems_other:'{{count, integer}} công việc',
      workCategories_other:'{{count, integer}} nhóm',
      themeIncluded:'có cài đặt giao diện',
      themeExcluded:'không có cài đặt giao diện',
    },
  },
  import:{
    action:'Khôi phục từ bản sao lưu',
    submit:'Nhập bản sao lưu',
    submitting:'Đang nhập…',
    success:'Đã khôi phục {{summary}}.',
    summary:{
      dailyLogs_other:'{{count, integer}} ngày nhật ký',
      workItems_other:'{{count, integer}} công việc',
      remapped_other:'ánh xạ lại {{count, integer}} ID',
    },
  },
  preview:{
    title:'Xem trước bản sao lưu',
    metadata:{
      format:'Định dạng',
      exportedAt:'Ngày xuất',
      appVersion:'Phiên bản ứng dụng',
      checksum:'Checksum',
      data:'Dữ liệu',
      dryRun:'Xem trước thay đổi',
    },
    checksum:{valid:'Hợp lệ',invalid:'Không hợp lệ'},
    data:{
      dailyLogs_other:'{{count, integer}} ngày nhật ký',
      workItems_other:'{{count, integer}} công việc',
      workCategories_other:'{{count, integer}} nhóm',
      themeIncluded:'có cài đặt giao diện',
      themeExcluded:'không có cài đặt giao diện',
    },
    dryRun:{
      newRecords_other:'{{count, integer}} bản ghi mới',
      existingIds_other:'{{count, integer}} ID đã có',
      conflicts_other:'{{count, integer}} xung đột',
      unchanged_other:'{{count, integer}} bản ghi giữ nguyên',
    },
  },
  mode:{
    legend:'Chế độ khôi phục',
    merge:{
      label:'Hợp nhất (Merge)',
      description:'Giữ dữ liệu hiện tại và thêm dữ liệu không trùng từ bản sao lưu.',
    },
    replace:{
      label:'Thay thế toàn bộ (Replace all)',
      description:'Thay toàn bộ nhật ký, nhóm công việc và cài đặt giao diện hiện tại.',
    },
  },
  confirm:{
    reimport:'Tôi hiểu tệp này đã được nhập vào {{dateTime}} và muốn nhập lại.',
    replace:{
      title:'Xác nhận thay thế toàn bộ dữ liệu',
      body:'Tôi hiểu toàn bộ nhật ký, nhóm công việc và cài đặt giao diện hiện tại sẽ bị thay thế. Nếu có lỗi, không thay đổi nào được áp dụng.',
    },
  },
  options:{applyTheme:'Áp dụng cài đặt giao diện từ bản sao lưu'},
  status:{preparing:'Đang chuẩn bị…',restoring:'Đang khôi phục…'},
  dialog:{
    exportTitle:'Xuất bản sao lưu Done Today',
    importTitle:'Khôi phục từ bản sao lưu',
    filterName:'Bản sao lưu Done Today',
  },
} as const;
