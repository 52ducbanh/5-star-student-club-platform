export const SENSE_SCENARIOS = [
  {
    id: 's1',
    situation: 'Bạn nhận ra đồng đội đang mắc lỗi nhỏ trong bài thuyết trình quan trọng. Bạn sẽ?',
    options: [
      { id: 'a', text: 'Nhắn tin riêng ngay để sửa kịp', vector: { focus:0.8, explore:0.3, energy:0.5, social:0.7, adapt:0.5 } },
      { id: 'b', text: 'Chờ sau buổi nói với đồng đội', vector: { focus:0.4, explore:0.3, energy:0.2, social:0.8, adapt:0.7 } },
      { id: 'c', text: 'Ghi chú giúp đội rút kinh nghiệm sau', vector: { focus:0.6, explore:0.7, energy:0.3, social:0.5, adapt:0.6 } },
    ],
  },
  {
    id: 's2',
    situation: 'Nhóm dự án bất đồng về hướng đi. Bạn làm gì?',
    options: [
      { id: 'a', text: 'Đề xuất vote nhanh để tiếp tục', vector: { focus:0.5, explore:0.4, energy:0.8, social:0.5, adapt:0.7 } },
      { id: 'b', text: 'Nghe từng quan điểm rồi tổng hợp', vector: { focus:0.7, explore:0.5, energy:0.3, social:0.9, adapt:0.6 } },
      { id: 'c', text: 'Đề xuất thử nghiệm nhỏ cả hai hướng', vector: { focus:0.4, explore:0.9, energy:0.5, social:0.6, adapt:0.8 } },
    ],
  },
  {
    id: 's3',
    situation: 'Có deadline cấp bách nhưng đồng đội cần giúp đỡ. Bạn?',
    options: [
      { id: 'a', text: 'Dành 10 phút hỗ trợ ngắn, sau đó tập trung lại', vector: { focus:0.7, explore:0.4, energy:0.6, social:0.7, adapt:0.8 } },
      { id: 'b', text: 'Hoàn thành phần mình trước rồi hỗ trợ', vector: { focus:0.9, explore:0.3, energy:0.5, social:0.4, adapt:0.5 } },
      { id: 'c', text: 'Cùng ưu tiên lại để cả nhóm xử lý', vector: { focus:0.5, explore:0.5, energy:0.4, social:0.9, adapt:0.7 } },
    ],
  },
];
