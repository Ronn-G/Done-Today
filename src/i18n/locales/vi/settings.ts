export default {
  heading:{
    eyebrow:'Tùy chỉnh trải nghiệm',
    title:'Cài đặt',
    subtitle:'Quản lý ngôn ngữ, nhóm công việc, sao lưu và giao diện.',
  },
  about:{version:'Phiên bản'},
  language:{label:'Ngôn ngữ',description:'Chọn ngôn ngữ hiển thị của ứng dụng.',option:{vi:'Tiếng Việt',en:'English'},status:{saving:'Đang lưu…',saved:'Đã lưu',error:'Không thể lưu ngôn ngữ. Hãy thử lại.'}},
  categories:{
    heading:{title:'Nhóm công việc',description:'Tạo và sắp xếp các nhóm hiển thị trong bảng Hôm nay.'},
    create:{
      nameLabel:'Tên nhóm mới',namePlaceholder:'Tên nhóm mới',colorLabel:'Màu nhóm mới',
      hexLabel:'Mã HEX nhóm mới',action:'Tạo nhóm',
    },
    status:{loading:'Đang tải nhóm…',active:'Đang hiện',inactive:'Đã ẩn'},
    item:{
      rowLabel:'Nhóm {{name}}',nameLabel:'Tên nhóm {{name}}',colorLabel:'Màu nhóm {{name}}',
      moveUp:'Di chuyển {{name}} lên',moveDown:'Di chuyển {{name}} xuống',
      hide:'Ẩn nhóm {{name}}',show:'Hiện nhóm {{name}}',
    },
    accessibility:{list:'Danh sách nhóm công việc'},
    validation:{
      nameRequired:'Tên nhóm không được để trống.',
      nameMax:'Tên nhóm tối đa 100 ký tự.',
      colorHex:'Màu nhóm phải dùng mã HEX #RRGGBB.',
    },
    errors:{
      load:'Không thể tải nhóm công việc.',
      invalid:'Tên hoặc màu nhóm không hợp lệ.',
      update:'Không thể cập nhật nhóm công việc.',
      reorder:'Không thể thay đổi thứ tự nhóm.',
    },
    backendErrors:{
      nameInvalid:'Tên danh mục phải có từ {{min}} đến {{max}} ký tự.',
      colorInvalid:'Hãy nhập màu danh mục ở định dạng mã hex hợp lệ.',
      reorderInvalid:'Thứ tự danh mục không hợp lệ. Hãy tải lại và thử lại.',
    },
  },
} as const;
