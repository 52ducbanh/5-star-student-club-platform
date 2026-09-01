/**
 * Client-side STARPRINT v2 SENSE scenarios.
 * 3 scenarios, each with 5 options A–E.
 * Tendency weights are server-authoritative and NOT exposed to client.
 */

export interface ClientSenseOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface ClientSenseScenario {
  id: string;
  categoryLabel: string;
  situation: string;
  options: ClientSenseOption[];
}

export const SENSE_SCENARIOS_CLIENT: ClientSenseScenario[] = [
  {
    id: 'sv2-s1',
    categoryLabel: 'Hợp tác đội nhóm',
    situation:
      'Nhóm bạn đang gấp hoàn thiện dự án. Bạn phát hiện một lỗi nghiêm trọng nhưng sửa nó sẽ mất vài giờ và có thể lỡ deadline. Bạn sẽ làm gì?',
    options: [
      { id: 'A', text: 'Ngay lập tức báo cả nhóm và cùng tìm giải pháp nhanh nhất' },
      { id: 'B', text: 'Tự mình âm thầm cố gắng sửa trước khi báo nhóm' },
      { id: 'C', text: 'Hỏi ý kiến từng thành viên rồi quyết định theo đa số' },
      { id: 'D', text: 'Đánh giá nhanh mức độ nghiêm trọng rồi quyết định có nên sửa không' },
      { id: 'E', text: 'Ghi lại lỗi để cải thiện ở phiên bản tiếp theo, nộp đúng hạn trước' },
    ],
  },
  {
    id: 'sv2-s2',
    categoryLabel: 'Áp lực dẫn dắt',
    situation:
      'Bạn được giao dẫn dắt một hoạt động CLB lần đầu tiên. Buổi sáng diễn ra, một thành viên chủ chốt bỗng báo bị ốm không tham gia được. Bạn:',
    options: [
      { id: 'A', text: 'Phân chia lại vai trò cho các thành viên còn lại ngay lập tức' },
      { id: 'B', text: 'Hỏi thành viên bị ốm xem họ có thể hỗ trợ từ xa hay không' },
      { id: 'C', text: 'Điều chỉnh lịch chương trình để phù hợp với nhân lực hiện có' },
      { id: 'D', text: 'Tổ chức họp nhanh cả nhóm để cùng đưa ra phương án' },
      { id: 'E', text: 'Tự mình đảm nhận thêm phần việc của người vắng mặt' },
    ],
  },
  {
    id: 'sv2-s3',
    categoryLabel: 'Thích ứng học hỏi',
    situation:
      'Bạn đang học một kỹ năng mới quan trọng cho công việc nhóm. Sau 2 buổi, bạn cảm thấy mình tiến bộ chậm hơn đồng đội. Bạn:',
    options: [
      { id: 'A', text: 'Nhờ đồng đội tiến bộ hơn giải thích và hướng dẫn thêm cho mình' },
      { id: 'B', text: 'Tự tìm tài liệu, dành thêm thời gian luyện tập ngoài giờ' },
      { id: 'C', text: 'Phân tích xem mình đang thiếu hụt ở điểm nào cụ thể' },
      { id: 'D', text: 'Thay đổi phương pháp học, thử cách tiếp cận khác' },
      { id: 'E', text: 'Tăng tốc độ học bằng cách thực hành nhiều hơn dù chưa chắc chắn' },
    ],
  },
];
