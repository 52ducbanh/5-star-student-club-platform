/**
 * STARPRINT v2 Star Type Classifier.
 *
 * Classifies a 7D GlobalHiddenProfile into one of the 5 official star types
 * using cosine similarity against archetype template vectors.
 *
 * Star Types and Archetype Vectors (canonical order: sharpness, insight, precision, initiative, connection, adaptation, persistence):
 *   STRATEGIST → [0.45, 1.00, 0.95, 0.45, 0.35, 0.55, 0.80]
 *   SPARK      → [1.00, 0.45, 0.35, 1.00, 0.45, 0.70, 0.40]
 *   SYNERGIST  → [0.50, 0.45, 0.50, 0.65, 1.00, 0.85, 0.60]
 *   SEEKER     → [0.75, 0.85, 0.40, 0.60, 0.50, 1.00, 0.45]
 *   SUSTAINER  → [0.40, 0.55, 0.85, 0.40, 0.60, 0.55, 1.00]
 *
 * Tie-breaking:
 *   Δ < 0.005 → use Euclidean distance (smaller = better)
 *   Still tied → priority order: STRATEGIST → SPARK → SYNERGIST → SEEKER → SUSTAINER
 *
 * Star Type → Star Effect mapping:
 *   STRATEGIST → SHIMMER
 *   SPARK      → SPARK
 *   SYNERGIST  → ORBIT
 *   SEEKER     → FLOW
 *   SUSTAINER  → PULSE
 *
 * All-zero profile is valid and will be classified (cosine similarity handles it gracefully by
 * defaulting to 0 for all types → priority-order tie-break → STRATEGIST).
 */

import type {
  GlobalHiddenProfile,
  StarTypeId,
  StarEffect,
  TraitId,
  StarprintTypeV2,
} from '@5ss/contracts';
import { starTypeIds } from '@5ss/contracts';

/** Canonical trait order for vector operations */
const TRAIT_ORDER: TraitId[] = [
  'sharpness',
  'insight',
  'precision',
  'initiative',
  'connection',
  'adaptation',
  'persistence',
];

/** Archetype template vectors in canonical trait order */
const ARCHETYPE_VECTORS: Record<StarTypeId, readonly number[]> = {
  STRATEGIST: [0.45, 1.00, 0.95, 0.45, 0.35, 0.55, 0.80],
  SPARK:      [1.00, 0.45, 0.35, 1.00, 0.45, 0.70, 0.40],
  SYNERGIST:  [0.50, 0.45, 0.50, 0.65, 1.00, 0.85, 0.60],
  SEEKER:     [0.75, 0.85, 0.40, 0.60, 0.50, 1.00, 0.45],
  SUSTAINER:  [0.40, 0.55, 0.85, 0.40, 0.60, 0.55, 1.00],
};

/** Effect mapping for each star type */
const STAR_TYPE_EFFECTS: Record<StarTypeId, StarEffect> = {
  STRATEGIST: 'SHIMMER',
  SPARK: 'SPARK',
  SYNERGIST: 'ORBIT',
  SEEKER: 'FLOW',
  SUSTAINER: 'PULSE',
};

/** Star type metadata */
export const STAR_TYPE_DEFINITIONS: Record<StarTypeId, StarprintTypeV2> = {
  STRATEGIST: {
    id: 'STRATEGIST',
    name: 'The Strategist',
    tagline: 'Think with purpose.',
    description:
      'Combining analytical reasoning and long-term vision. Transforming information into structured and impactful action plans.',
    coreTraits: ['insight', 'precision', 'persistence'],
    effect: 'SHIMMER',
  },
  SPARK: {
    id: 'SPARK',
    name: 'The Spark',
    tagline: 'Turn energy into action.',
    description:
      'Dynamic, decisive, and relentlessly creative. The catalyst who takes initiative and energizes the entire team.',
    coreTraits: ['sharpness', 'initiative', 'adaptation'],
    effect: 'SPARK',
  },
  SYNERGIST: {
    id: 'SYNERGIST',
    name: 'The Synergist',
    tagline: 'Connect to create more.',
    description:
      'A natural bridge builder between people and ideas. Every connection you forge becomes an opportunity for collaborative impact.',
    coreTraits: ['connection', 'adaptation', 'initiative'],
    effect: 'ORBIT',
  },
  SEEKER: {
    id: 'SEEKER',
    name: 'The Seeker',
    tagline: 'Stay curious. Keep moving.',
    description:
      'Driven by endless curiosity and a passion for learning. Leading by exploring new frontiers and adapting swiftly to change.',
    coreTraits: ['sharpness', 'insight', 'adaptation'],
    effect: 'FLOW',
  },
  SUSTAINER: {
    id: 'SUSTAINER',
    name: 'The Sustainer',
    tagline: 'Keep the light going.',
    description:
      'The steadfast anchor of every team. Resilient, precise, and unwavering under pressure.',
    coreTraits: ['precision', 'persistence', 'connection'],
    effect: 'PULSE',
  },
};

/** Tie-breaking priority order */
const TIEBREAK_ORDER: StarTypeId[] = [
  'STRATEGIST',
  'SPARK',
  'SYNERGIST',
  'SEEKER',
  'SUSTAINER',
];

function profileToVector(profile: GlobalHiddenProfile): number[] {
  return TRAIT_ORDER.map((trait) => profile[trait]);
}

function dotProduct(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function magnitude(v: readonly number[]): number {
  return Math.sqrt(dotProduct(v, v));
}

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

function euclideanDistance(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

interface ClassificationResult {
  type: StarTypeId;
  effect: StarEffect;
  cosineSimilarities: Record<StarTypeId, number>;
  euclideanDistances: Record<StarTypeId, number>;
  /** How the winner was determined */
  tiebreakMethod: 'cosine' | 'euclidean' | 'priority';
  definition: StarprintTypeV2;
}

const COSINE_TIE_THRESHOLD = 0.005;

export function classifyStarType(profile: GlobalHiddenProfile): ClassificationResult {
  const profileVector = profileToVector(profile);

  const cosines: Record<StarTypeId, number> = {} as Record<StarTypeId, number>;
  const distances: Record<StarTypeId, number> = {} as Record<StarTypeId, number>;

  for (const typeId of starTypeIds) {
    const archetype = ARCHETYPE_VECTORS[typeId];
    cosines[typeId] = cosineSimilarity(profileVector, archetype);
    distances[typeId] = euclideanDistance(profileVector, archetype);
  }

  // Zero-norm edge case: if all traits are zero, cosine is undefined (0/0).
  // Compare Euclidean distances directly to templates; lowest wins; exact tie uses official order.
  const norm = magnitude(profileVector);
  if (norm === 0) {
    const sortedZero = [...starTypeIds].sort((a, b) => {
      const diff = distances[a] - distances[b];
      if (Math.abs(diff) < 1e-6) {
        return TIEBREAK_ORDER.indexOf(a) - TIEBREAK_ORDER.indexOf(b);
      }
      return diff;
    });
    const winnerZero = sortedZero[0];
    return {
      type: winnerZero,
      effect: STAR_TYPE_EFFECTS[winnerZero],
      cosineSimilarities: cosines,
      euclideanDistances: distances,
      tiebreakMethod: 'euclidean',
      definition: STAR_TYPE_DEFINITIONS[winnerZero],
    };
  }

  // Sort by cosine similarity descending
  const sortedTypes = [...starTypeIds].sort(
    (a, b) => cosines[b] - cosines[a],
  );

  const winner = sortedTypes[0];
  const runnerUp = sortedTypes[1];
  let tiebreakMethod: ClassificationResult['tiebreakMethod'] = 'cosine';
  let finalType = winner;

  if (
    runnerUp &&
    Math.abs(cosines[winner] - cosines[runnerUp]) < COSINE_TIE_THRESHOLD
  ) {
    // Euclidean tiebreak: smaller distance wins
    if (distances[runnerUp] < distances[winner]) {
      finalType = runnerUp;
      tiebreakMethod = 'euclidean';
    } else if (distances[runnerUp] === distances[winner]) {
      // Priority-order tiebreak
      finalType = TIEBREAK_ORDER.find(
        (t) => t === winner || t === runnerUp,
      )!;
      tiebreakMethod = 'priority';
    } else {
      tiebreakMethod = 'euclidean'; // still won by euclidean after check
    }
  }

  return {
    type: finalType,
    effect: STAR_TYPE_EFFECTS[finalType],
    cosineSimilarities: cosines,
    euclideanDistances: distances,
    tiebreakMethod,
    definition: STAR_TYPE_DEFINITIONS[finalType],
  };
}

export { STAR_TYPE_EFFECTS };
