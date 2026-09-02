import {
  SENSE_15_SCENARIOS,
  SenseScenarioV2Def,
  TENDENCY_TRAIT_MATRIX,
  SenseTendency as ContractSenseTendency,
} from '@5ss/contracts';

export const CONTENT_VERSION_SENSE_V2 = 'starprint-content-v2' as const;

export type SenseTendency = ContractSenseTendency;

export interface SenseTendencyWeight {
  tendency: SenseTendency;
  weight: number;
}

export interface SenseOptionV2 {
  id: string;
  optionId?: string;
  text: string;
  tendencies: SenseTendencyWeight[];
}

export interface SenseScenarioV2 {
  id: string;
  category: string;
  title?: string;
  situation: string;
  options: SenseOptionV2[];
}

/**
 * Official BA Tendency -> Hidden Trait Matrix
 * Source: spec SENSE section 2.6 / Google Sheet GID 1683291018
 */
export const TENDENCY_TO_TRAIT_MAP: Record<SenseTendency, Record<string, number>> = TENDENCY_TRAIT_MATRIX;

/** Official 15 scenarios from BA Google Sheet */
export const OFFICIAL_SENSE_SCENARIOS_V2: SenseScenarioV2[] = SENSE_15_SCENARIOS.map(
  (s: SenseScenarioV2Def) => ({
    id: s.id,
    category: s.groupName,
    title: s.title,
    situation: s.situation,
    options: s.options.map((opt) => ({
      id: opt.id,
      optionId: opt.optionId,
      text: opt.text,
      tendencies: [
        { tendency: opt.primaryTendency, weight: opt.weightPrimary },
        ...(opt.secondaryTendency
          ? [{ tendency: opt.secondaryTendency, weight: opt.weightSecondary }]
          : []),
      ],
    })),
  }),
);

export const PROVISIONAL_SENSE_SCENARIOS_V2: SenseScenarioV2[] = [
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
        text: 'Đề xuất lùi deadline với ban tổ chức để sửa triệt để',
        tendencies: [{ tendency: 'CARE', weight: 0.7 }, { tendency: 'ALIGN', weight: 0.3 }],
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

export const SENSE_SCENARIOS_V2: SenseScenarioV2[] = [
  ...OFFICIAL_SENSE_SCENARIOS_V2,
  ...PROVISIONAL_SENSE_SCENARIOS_V2,
];

/** Lookup map for O(1) validation */
export const SENSE_SCENARIO_MAP_V2 = new Map<string, SenseScenarioV2>(
  SENSE_SCENARIOS_V2.map((s) => [s.id, s]),
);
