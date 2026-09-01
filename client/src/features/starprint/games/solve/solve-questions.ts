/**
 * Client-side STARPRINT v2 SOLVE questions.
 * Exactly 5 questions, one from each category, 5 options A–E.
 * Note: correctOptionId is server-authoritative and NOT present here.
 */

export interface ClientSolveOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface ClientSolveQuestion {
  id: string;
  category: 'pattern-sequence' | 'visual-precision' | 'quick-logic' | 'rule-shift' | 'general-5ss';
  categoryLabel: string;
  question: string;
  options: ClientSolveOption[];
}

export const SOLVE_QUESTIONS_CLIENT: ClientSolveQuestion[] = [
  {
    id: 'sv2-q1',
    category: 'pattern-sequence',
    categoryLabel: 'Quy luật & Dãy số',
    question: 'Dãy số: 3, 6, 12, 24, ?',
    options: [
      { id: 'A', text: '36' },
      { id: 'B', text: '42' },
      { id: 'C', text: '48' },
      { id: 'D', text: '56' },
      { id: 'E', text: '32' },
    ],
  },
  {
    id: 'sv2-q2',
    category: 'visual-precision',
    categoryLabel: 'Độ chính xác thị giác',
    question: 'Trong chuỗi: A B C B A C B A B C — ký tự nào xuất hiện nhiều nhất?',
    options: [
      { id: 'A', text: 'A (3 lần)' },
      { id: 'B', text: 'B (4 lần)' },
      { id: 'C', text: 'C (3 lần)' },
      { id: 'D', text: 'B và A đều 4 lần' },
      { id: 'E', text: 'Cả 3 đều bằng nhau' },
    ],
  },
  {
    id: 'sv2-q3',
    category: 'quick-logic',
    categoryLabel: 'Suy luận nhanh',
    question: 'Nếu mọi sinh viên đều tham gia CLB, và Nam là sinh viên, thì:',
    options: [
      { id: 'A', text: 'Nam không tham gia CLB' },
      { id: 'B', text: 'Không xác định được' },
      { id: 'C', text: 'Nam tham gia CLB' },
      { id: 'D', text: 'Nam có thể tham gia CLB' },
      { id: 'E', text: 'Nam tham gia nếu muốn' },
    ],
  },
  {
    id: 'sv2-q4',
    category: 'rule-shift',
    categoryLabel: 'Chuyển dịch quy tắc',
    question: 'Quy tắc: ⬛ đánh bại ⬜, ⬜ đánh bại 🔺, 🔺 đánh bại ⬛. Đối thủ vừa đổi sang 🔺. Bạn nên chọn gì?',
    options: [
      { id: 'A', text: '⬛ (giữ nguyên)' },
      { id: 'B', text: '⬜ (đánh bại 🔺)' },
      { id: 'C', text: '🔺 (hòa)' },
      { id: 'D', text: 'Không đủ thông tin' },
      { id: 'E', text: 'Bất kỳ – kết quả như nhau' },
    ],
  },
  {
    id: 'sv2-q5',
    category: 'general-5ss',
    categoryLabel: 'Kiến thức 5SS UET',
    question: '5SS UET là viết tắt của phong trào nào dưới đây?',
    options: [
      { id: 'A', text: 'Sinh viên 5 Sao' },
      { id: 'B', text: 'Sinh viên 5 Tốt' },
      { id: 'C', text: 'Sinh viên 5 Tầm' },
      { id: 'D', text: 'Sinh viên 5 Tiêu chí' },
      { id: 'E', text: 'Sinh viên 5 Thành tích' },
    ],
  },
];
