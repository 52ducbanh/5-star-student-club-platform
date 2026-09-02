import type { SupportLevelConfig } from '../engine/support-types'

export const SUPPORT_LEVELS: SupportLevelConfig[] = [
  {
    puzzleId: 'support-puzzle-1-v2',
    title: 'Câu đố 1: Cân bằng trọng lực',
    instruction: 'Cắt các dây hỗ trợ theo đúng thứ tự để đưa Ngôi Sao đến Cổng Năng Lượng.',
    objectPos: { x: 50, y: 35 },
    targetPos: { x: 50, y: 80 },
    ropes: [
      { ropeId: 'p1-rope-a', label: 'Dây Trái (A)', x1: 25, y1: 15, x2: 48, y2: 33 },
      { ropeId: 'p1-rope-b', label: 'Dây Phải (B)', x1: 75, y1: 15, x2: 52, y2: 33 },
      { ropeId: 'p1-rope-c', label: 'Dây Hãm (C)', x1: 85, y1: 45, x2: 53, y2: 37 },
    ],
    validSequences: [['p1-rope-a', 'p1-rope-b']],
    optimalCutCount: 2,
    timeLimitMs: 10000,
  },
  {
    puzzleId: 'support-puzzle-2-v2',
    title: 'Câu đố 2: Đòn bẩy phối hợp',
    instruction: 'Cắt neo đối xứng để giữ quỹ đạo thẳng vào tâm đích.',
    objectPos: { x: 50, y: 40 },
    targetPos: { x: 50, y: 82 },
    ropes: [
      { ropeId: 'p2-rope-x', label: 'Neo Trái (X)', x1: 20, y1: 20, x2: 47, y2: 38 },
      { ropeId: 'p2-rope-y', label: 'Dây Giữ (Y)', x1: 50, y1: 10, x2: 50, y2: 37 },
      { ropeId: 'p2-rope-z', label: 'Neo Phải (Z)', x1: 80, y1: 20, x2: 53, y2: 38 },
    ],
    validSequences: [
      ['p2-rope-x', 'p2-rope-z'],
      ['p2-rope-z', 'p2-rope-x'],
    ],
    optimalCutCount: 2,
    timeLimitMs: 10000,
  },
  {
    puzzleId: 'support-puzzle-3-v2',
    title: 'Câu đố 3: Chuỗi giải phóng liên hoàn',
    instruction: 'Cắt giải phóng 2 cánh trên trước, rồi cắt dây hạ để tiếp đất an toàn.',
    objectPos: { x: 50, y: 30 },
    targetPos: { x: 50, y: 85 },
    ropes: [
      { ropeId: 'p3-rope-1', label: 'Dây Đỉnh Trái (1)', x1: 30, y1: 12, x2: 48, y2: 28 },
      { ropeId: 'p3-rope-2', label: 'Dây Đỉnh Phải (2)', x1: 70, y1: 12, x2: 52, y2: 28 },
      { ropeId: 'p3-rope-3', label: 'Dây Dẫn Hạ (3)', x1: 50, y1: 52, x2: 50, y2: 33 },
      { ropeId: 'p3-rope-4', label: 'Dây Phụ (4)', x1: 15, y1: 45, x2: 46, y2: 31 },
    ],
    validSequences: [
      ['p3-rope-1', 'p3-rope-2', 'p3-rope-3'],
      ['p3-rope-2', 'p3-rope-1', 'p3-rope-3'],
    ],
    optimalCutCount: 3,
    timeLimitMs: 10000,
  },
]
