import { SOLVE_QUESTIONS_BY_ID } from '@5ss/contracts'

export interface ClientSolveOption {
  id: 'a' | 'b' | 'c' | 'd' | 'e' | 'A' | 'B' | 'C' | 'D' | 'E'
  text: string
}

export interface ClientSolveQuestion {
  id: string
  category: string
  categoryLabel: string
  question: string
  options: ClientSolveOption[]
  correctOptionId: string
  explanation?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  pattern_sequence: 'Quy luật & Dãy số',
  'pattern-sequence': 'Quy luật & Dãy số',
  visual_precision: 'Độ chính xác thị giác',
  'visual-precision': 'Độ chính xác thị giác',
  quick_logic: 'Suy luận nhanh',
  'quick-logic': 'Suy luận nhanh',
  rule_shift: 'Chuyển dịch quy tắc',
  'rule-shift': 'Chuyển dịch quy tắc',
  general_5ss: 'Kiến thức 5SS & Xã hội',
  'general-5ss': 'Kiến thức 5SS & Xã hội',
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
    correctOptionId: 'C',
    explanation: 'Quy luật nhân 2 (×2): 24 × 2 = 48.',
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
    correctOptionId: 'B',
    explanation: 'Ký tự B xuất hiện 4 lần (A: 3 lần, B: 4 lần, C: 3 lần).',
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
    correctOptionId: 'C',
    explanation: 'Theo tam đoạn luận: Mọi sinh viên tham gia CLB, Nam là SV => Nam tham gia CLB.',
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
    correctOptionId: 'A',
    explanation: 'Theo quy tắc: ⬛ đánh bại 🔺.',
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
    correctOptionId: 'B',
    explanation: '5SS là viết tắt của 5-Star Student – Phong trào Sinh viên 5 Tốt (SV5T).',
  },
]

export function getSolveQuestionsForSession(assignedIds?: string[]): ClientSolveQuestion[] {
  if (assignedIds && assignedIds.length === 5) {
    const questions: ClientSolveQuestion[] = []
    for (const id of assignedIds) {
      const q = SOLVE_QUESTIONS_BY_ID.get(id)
      if (q) {
        questions.push({
          id: q.id,
          category: q.category,
          categoryLabel: CATEGORY_LABELS[q.category] || q.categoryName,
          question: q.question,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
          })),
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
        })
      }
    }
    if (questions.length === 5) {
      return questions
    }
  }
  return SOLVE_QUESTIONS_CLIENT
}
