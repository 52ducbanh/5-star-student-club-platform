import type { LegacyStarEffect, LegacyStarTypeId } from '@5ss/contracts';

export interface StarTypeDefinition {
  id: LegacyStarTypeId;
  name: string;
  description: string;
  effect: LegacyStarEffect;
  dominant: 'focus' | 'explore' | 'energy' | 'social' | 'adapt';
}

/**
 * MVP STARPRINT Personalities
 * TODO BUSINESS CONFIRMATION before finalizing personality model names & descriptions.
 */
export const STAR_TYPES: Record<string, StarTypeDefinition> = {
  NAVIGATOR: {
    id: 'navigator',
    name: 'The Navigator (Người Định Hướng)',
    description: 'Tư duy logic sắc bén, định hình mục tiêu rõ ràng và luôn tìm ra giải pháp tối ưu trong học tập và nghiên cứu.',
    effect: 'flow',
    dominant: 'focus',
  },
  EXPLORER: {
    id: 'explorer',
    name: 'The Explorer (Người Khám Phá)',
    description: 'Tinh thần ham học hỏi, đam mê mở rộng tri thức và khám phá những chân trời mới trong thế giới công nghệ.',
    effect: 'shimmer',
    dominant: 'explore',
  },
  CATALYST: {
    id: 'catalyst',
    name: 'The Catalyst (Người Truyền Lửa)',
    description: 'Tràn đầy năng lượng, bền bỉ và sẵn sàng bứt phá giới hạn thể lực lẫn tinh thần trong mọi hoạt động.',
    effect: 'spark',
    dominant: 'energy',
  },
  CONNECTOR: {
    id: 'connector',
    name: 'The Connector (Người Kết Nối)',
    description: 'Thấu hiểu, gắn kết cộng đồng và luôn sẵn lòng cống hiến vì những giá trị nhân văn và tinh thần tình nguyện.',
    effect: 'orbit',
    dominant: 'social',
  },
  VISIONARY: {
    id: 'visionary',
    name: 'The Visionary (Người Tiên Phong)',
    description: 'Khả năng thích ứng vượt trội, hòa nhập môi trường đa văn hóa và mang tư duy toàn cầu của sinh viên thế kỷ 21.',
    effect: 'pulse',
    dominant: 'adapt',
  },
};
