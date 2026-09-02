import { SOLVE_50_QUESTIONS, SolveQuestionV2Def } from '@5ss/contracts';

export const CONTENT_VERSION_SOLVE_V2 = 'starprint-content-v2' as const;

export type SolveQuestionCategory =
  | 'pattern-sequence'
  | 'visual-precision'
  | 'quick-logic'
  | 'rule-shift'
  | 'general-5ss'
  | 'pattern_sequence'
  | 'visual_precision'
  | 'quick_logic'
  | 'rule_shift'
  | 'general_5ss';

export interface SolveOptionV2 {
  id: 'a' | 'b' | 'c' | 'd' | 'e' | 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface SolveQuestionV2 {
  id: string;
  category: SolveQuestionCategory;
  question: string;
  options: SolveOptionV2[];
  correctOptionId: 'a' | 'b' | 'c' | 'd' | 'e' | 'A' | 'B' | 'C' | 'D' | 'E';
}

// Fallback provisional questions preserved for test stability
export const PROVISIONAL_SOLVE_QUESTIONS: SolveQuestionV2[] = [
  {
    id: 'sv2-q1',
    category: 'pattern-sequence',
    question: 'Dãy số: 3, 6, 12, 24, ?',
    options: [
      { id: 'A', text: '36' },
      { id: 'B', text: '42' },
      { id: 'C', text: '48' },
      { id: 'D', text: '56' },
      { id: 'E', text: '32' },
    ],
    correctOptionId: 'C',
  },
  {
    id: 'sv2-q2',
    category: 'visual-precision',
    question: 'Trong dãy ký tự: A B C B A C B A B C — ký tự nào xuất hiện nhiều nhất?',
    options: [
      { id: 'A', text: 'A (3 lần)' },
      { id: 'B', text: 'B (4 lần)' },
      { id: 'C', text: 'C (3 lần)' },
      { id: 'D', text: 'B và A đều 4 lần' },
      { id: 'E', text: 'Cả 3 đều bằng nhau' },
    ],
    correctOptionId: 'B',
  },
  {
    id: 'sv2-q3',
    category: 'quick-logic',
    question: 'Nếu mọi sinh viên đều tham gia CLB, và Nam là sinh viên, thì:',
    options: [
      { id: 'A', text: 'Nam không tham gia CLB' },
      { id: 'B', text: 'Không xác định được' },
      { id: 'C', text: 'Nam tham gia CLB' },
      { id: 'D', text: 'Nam có thể tham gia CLB' },
      { id: 'E', text: 'Nam tham gia nếu muốn' },
    ],
    correctOptionId: 'C',
  },
  {
    id: 'sv2-q4',
    category: 'rule-shift',
    question:
      'Trong trò chơi mới: ⬛ đánh bại ⬜, ⬜ đánh bại 🔺, 🔺 đánh bại ⬛. Bạn đang chơi ⬛. Đối thủ đổi sang 🔺. Bạn nên chọn gì?',
    options: [
      { id: 'A', text: '⬛ (giữ nguyên)' },
      { id: 'B', text: '⬜ (đánh bại 🔺)' },
      { id: 'C', text: '🔺 (hòa)' },
      { id: 'D', text: 'Không đủ thông tin' },
      { id: 'E', text: 'Bất kỳ – kết quả như nhau' },
    ],
    correctOptionId: 'B',
  },
  {
    id: 'sv2-q5',
    category: 'general-5ss',
    question: '5SS UET là viết tắt của phong trào nào dưới đây?',
    options: [
      { id: 'A', text: 'Sinh viên 5 Sao' },
      { id: 'B', text: 'Sinh viên 5 Tốt' },
      { id: 'C', text: 'Sinh viên 5 Tầm' },
      { id: 'D', text: 'Sinh viên 5 Tiêu chí' },
      { id: 'E', text: 'Sinh viên 5 Thành tích' },
    ],
    correctOptionId: 'B',
  },
];

// Combine the 50 official questions from contracts + provisional fallbacks
export const SOLVE_QUESTIONS_V2: SolveQuestionV2[] = [
  ...SOLVE_50_QUESTIONS.map((q: SolveQuestionV2Def) => ({
    id: q.id,
    category: q.category as SolveQuestionCategory,
    question: q.question,
    options: q.options as SolveOptionV2[],
    correctOptionId: q.correctOptionId as 'a' | 'b' | 'c' | 'd' | 'e',
  })),
  ...PROVISIONAL_SOLVE_QUESTIONS,
];

/** Lookup map for O(1) answer validation */
export const SOLVE_QUESTION_MAP_V2 = new Map<string, SolveQuestionV2>(
  SOLVE_QUESTIONS_V2.map((q) => [q.id, q]),
);
