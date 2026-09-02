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
    name: 'The Navigator',
    description: 'Sharp logical thinking, clear goal-setting, and always finding optimal solutions in learning and research.',
    effect: 'flow',
    dominant: 'focus',
  },
  EXPLORER: {
    id: 'explorer',
    name: 'The Explorer',
    description: 'A curious spirit passionate about expanding knowledge and discovering new frontiers in tech.',
    effect: 'shimmer',
    dominant: 'explore',
  },
  CATALYST: {
    id: 'catalyst',
    name: 'The Catalyst',
    description: 'Full of energy, resilience, and ready to break physical and mental boundaries in all activities.',
    effect: 'spark',
    dominant: 'energy',
  },
  CONNECTOR: {
    id: 'connector',
    name: 'The Connector',
    description: 'Deep empathy, strong community bonding, and dedication to humanistic values and voluntary initiatives.',
    effect: 'orbit',
    dominant: 'social',
  },
  VISIONARY: {
    id: 'visionary',
    name: 'The Visionary',
    description: 'Exceptional adaptability, cross-cultural collaboration, and a 21st-century global student mindset.',
    effect: 'pulse',
    dominant: 'adapt',
  },
};
