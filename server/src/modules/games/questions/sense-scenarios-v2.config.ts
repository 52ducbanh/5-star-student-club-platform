/**
 * Official STARPRINT v2 SENSE scenario bank.
 *
 * 3 scenarios — each with 5 options (A–E).
 * No right/wrong answer.
 *
 * Internal tendency labels: CARE | ACT | ALIGN | ADAPT | REFLECT
 * Options may map to multiple tendencies with weights.
 *
 * Observed traits: Connection, Initiative, Adaptation, Insight, Precision, Sharpness, Persistence
 * (All 7 traits observed — none are null for SENSE)
 *
 * Response time boundary:
 *   0 <= t < 3000ms   → fast
 *   3000 <= t < 7000ms → neutral
 *   7000 <= t <= 10000ms → deliberative
 *
 * PROVISIONAL — awaiting final BA scenario content approval.
 * Content version: starprint-content-v2
 */

export const CONTENT_VERSION_SENSE_V2 = 'starprint-content-v2' as const;

export type SenseTendency = 'CARE' | 'ACT' | 'ALIGN' | 'ADAPT' | 'REFLECT';

export interface SenseTendencyWeight {
  tendency: SenseTendency;
  weight: number;
}

export interface SenseOptionV2 {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  /**
   * Tendency weights.
   * One option can activate multiple tendencies with fractional weights (must sum to 1.0).
   */
  tendencies: SenseTendencyWeight[];
}

export interface SenseScenarioV2 {
  id: string;
  category: string;
  situation: string;
  options: SenseOptionV2[];
}

/**
 * Maps option tendency weights to 7-trait contribution vectors.
 * Scoring uses this table to derive per-trait signal from tendency activations.
 *
 * Each tendency contributes to the 7 official traits with canonical weights.
 * Weights are relative factors (0–1), applied per-trait across all activated tendencies.
 */
export const TENDENCY_TO_TRAIT_MAP: Record<SenseTendency, Record<string, number>> = {
  CARE: {
    connection: 0.85,
    adaptation: 0.40,
    persistence: 0.30,
    insight: 0.25,
    precision: 0.10,
    sharpness: 0.05,
    initiative: 0.05,
  },
  ACT: {
    initiative: 0.90,
    sharpness: 0.50,
    adaptation: 0.35,
    persistence: 0.30,
    precision: 0.15,
    insight: 0.10,
    connection: 0.10,
  },
  ALIGN: {
    connection: 0.70,
    insight: 0.60,
    precision: 0.50,
    adaptation: 0.30,
    persistence: 0.25,
    initiative: 0.15,
    sharpness: 0.10,
  },
  ADAPT: {
    adaptation: 0.90,
    initiative: 0.45,
    sharpness: 0.40,
    insight: 0.35,
    persistence: 0.20,
    connection: 0.15,
    precision: 0.10,
  },
  REFLECT: {
    insight: 0.85,
    precision: 0.65,
    persistence: 0.50,
    adaptation: 0.25,
    connection: 0.20,
    sharpness: 0.15,
    initiative: 0.05,
  },
};

export const SENSE_SCENARIOS_V2: SenseScenarioV2[] = [
  {
    id: 'sv2-s1',
    category: 'team-collaboration',
    situation:
      'Nhóm bạn đang gấp hoàn thiện dự án. Bạn phát hiện một lỗi nghiêm trọng nhưng sửa nó sẽ mất vài giờ và có thể lỡ deadline. Bạn sẽ làm gì?',
    options: [
      {
        id: 'A',
        text: 'Ngay lập tức báo cả nhóm và cùng tìm giải pháp nhanh nhất',
        tendencies: [{ tendency: 'ACT', weight: 0.7 }, { tendency: 'CARE', weight: 0.3 }],
      },
      {
        id: 'B',
        text: 'Tự mình âm thầm cố gắng sửa trước khi báo nhóm',
        tendencies: [{ tendency: 'REFLECT', weight: 0.6 }, { tendency: 'ACT', weight: 0.4 }],
      },
      {
        id: 'C',
        text: 'Hỏi ý kiến từng thành viên rồi quyết định theo đa số',
        tendencies: [{ tendency: 'ALIGN', weight: 0.7 }, { tendency: 'CARE', weight: 0.3 }],
      },
      {
        id: 'D',
        text: 'Đánh giá nhanh mức độ nghiêm trọng rồi quyết định có nên sửa không',
        tendencies: [{ tendency: 'ADAPT', weight: 0.6 }, { tendency: 'REFLECT', weight: 0.4 }],
      },
      {
        id: 'E',
        text: 'Ghi lại lỗi để cải thiện ở phiên bản tiếp theo, nộp đúng hạn trước',
        tendencies: [{ tendency: 'REFLECT', weight: 0.5 }, { tendency: 'ADAPT', weight: 0.5 }],
      },
    ],
  },
  {
    id: 'sv2-s2',
    category: 'leadership-pressure',
    situation:
      'Bạn được giao dẫn dắt một hoạt động CLB lần đầu tiên. Buổi sáng diễn ra, một thành viên chủ chốt bỗng báo bị ốm không tham gia được. Bạn:',
    options: [
      {
        id: 'A',
        text: 'Phân chia lại vai trò cho các thành viên còn lại ngay lập tức',
        tendencies: [{ tendency: 'ACT', weight: 0.8 }, { tendency: 'ADAPT', weight: 0.2 }],
      },
      {
        id: 'B',
        text: 'Hỏi thành viên bị ốm xem họ có thể hỗ trợ từ xa hay không',
        tendencies: [{ tendency: 'CARE', weight: 0.6 }, { tendency: 'ALIGN', weight: 0.4 }],
      },
      {
        id: 'C',
        text: 'Điều chỉnh lịch chương trình để phù hợp với nhân lực hiện có',
        tendencies: [{ tendency: 'ADAPT', weight: 0.7 }, { tendency: 'REFLECT', weight: 0.3 }],
      },
      {
        id: 'D',
        text: 'Tổ chức họp nhanh cả nhóm để cùng đưa ra phương án',
        tendencies: [{ tendency: 'ALIGN', weight: 0.6 }, { tendency: 'CARE', weight: 0.4 }],
      },
      {
        id: 'E',
        text: 'Tự mình đảm nhận thêm phần việc của người vắng mặt',
        tendencies: [{ tendency: 'ACT', weight: 0.5 }, { tendency: 'REFLECT', weight: 0.5 }],
      },
    ],
  },
  {
    id: 'sv2-s3',
    category: 'learning-adaptation',
    situation:
      'Bạn đang học một kỹ năng mới quan trọng cho công việc nhóm. Sau 2 buổi, bạn cảm thấy mình tiến bộ chậm hơn đồng đội. Bạn:',
    options: [
      {
        id: 'A',
        text: 'Nhờ đồng đội tiến bộ hơn giải thích và hướng dẫn thêm cho mình',
        tendencies: [{ tendency: 'CARE', weight: 0.5 }, { tendency: 'ALIGN', weight: 0.5 }],
      },
      {
        id: 'B',
        text: 'Tự tìm tài liệu, dành thêm thời gian luyện tập ngoài giờ',
        tendencies: [{ tendency: 'REFLECT', weight: 0.6 }, { tendency: 'ACT', weight: 0.4 }],
      },
      {
        id: 'C',
        text: 'Phân tích xem mình đang thiếu hụt ở điểm nào cụ thể',
        tendencies: [{ tendency: 'REFLECT', weight: 0.7 }, { tendency: 'ADAPT', weight: 0.3 }],
      },
      {
        id: 'D',
        text: 'Thay đổi phương pháp học, thử cách tiếp cận khác',
        tendencies: [{ tendency: 'ADAPT', weight: 0.8 }, { tendency: 'REFLECT', weight: 0.2 }],
      },
      {
        id: 'E',
        text: 'Tăng tốc độ học bằng cách thực hành nhiều hơn dù chưa chắc chắn',
        tendencies: [{ tendency: 'ACT', weight: 0.7 }, { tendency: 'ADAPT', weight: 0.3 }],
      },
    ],
  },
];

/** Lookup map for O(1) validation */
export const SENSE_SCENARIO_MAP_V2 = new Map(
  SENSE_SCENARIOS_V2.map((s) => [s.id, s]),
);
