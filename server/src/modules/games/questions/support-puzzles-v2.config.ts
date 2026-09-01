/**
 * Official STARPRINT v2 SUPPORT puzzle definitions.
 *
 * Cut-the-Rope style — 3 predefined deterministic puzzles.
 * Each puzzle: 1 object, 1 target, 2–4 ropes.
 * Player taps/clicks ropes in the correct order to deliver object to target.
 *
 * Server defines the valid cut sequences and optimal sequences.
 * "Wrong cut" → invalid-state event → client auto-resets same puzzle.
 * Timer continues through resets. No full-stage retry.
 *
 * Puzzle anatomy:
 *   - puzzleId: stable identifier
 *   - ropes: all ropes in scene (IDs)
 *   - validSequences: all sequences of rope cuts that successfully deliver object
 *   - optimalCutCount: minimum cuts in a valid solution
 *   - timeLimitMs: 10000 (10s per puzzle)
 *
 * PROVISIONAL — awaiting final BA puzzle layout/asset approval.
 * Content version: starprint-content-v2
 *
 * Observed traits: Insight, Precision, Adaptation, Persistence, Sharpness, Initiative
 * Unobserved: Connection (structural null)
 */

export const CONTENT_VERSION_SUPPORT_V2 = 'starprint-content-v2' as const;

export interface SupportRopeDefinition {
  ropeId: string;
  /** Human-readable label for debugging / layout generation */
  label: string;
}

export interface SupportPuzzleDefinition {
  puzzleId: string;
  ropes: SupportRopeDefinition[];
  /**
   * All sequences that lead to "completed" state.
   * A sequence is an ordered array of ropeIds to cut.
   * Order matters — cutting out-of-order triggers invalid-state.
   *
   * The client state machine checks: does current cut sequence match
   * the prefix of any validSequence? If not → invalid-state → auto-reset.
   */
  validSequences: string[][];
  /** Minimum number of cuts in any valid solution */
  optimalCutCount: number;
  timeLimitMs: number;
}

export const SUPPORT_PUZZLES_V2: SupportPuzzleDefinition[] = [
  // Puzzle 1 — simple 2-rope, single valid sequence
  {
    puzzleId: 'support-puzzle-1-v2',
    ropes: [
      { ropeId: 'p1-rope-a', label: 'Rope A (top-left)' },
      { ropeId: 'p1-rope-b', label: 'Rope B (top-right)' },
      { ropeId: 'p1-rope-c', label: 'Rope C (side)' },
    ],
    validSequences: [
      ['p1-rope-a', 'p1-rope-b'],   // correct: cut A first, then B
    ],
    optimalCutCount: 2,
    timeLimitMs: 10000,
  },
  // Puzzle 2 — 3 ropes, two valid orderings
  {
    puzzleId: 'support-puzzle-2-v2',
    ropes: [
      { ropeId: 'p2-rope-x', label: 'Rope X (left anchor)' },
      { ropeId: 'p2-rope-y', label: 'Rope Y (center)' },
      { ropeId: 'p2-rope-z', label: 'Rope Z (right anchor)' },
    ],
    validSequences: [
      ['p2-rope-x', 'p2-rope-z'],   // cut both anchors in either order
      ['p2-rope-z', 'p2-rope-x'],
    ],
    optimalCutCount: 2,
    timeLimitMs: 10000,
  },
  // Puzzle 3 — 4 ropes, one specific valid 3-cut sequence
  {
    puzzleId: 'support-puzzle-3-v2',
    ropes: [
      { ropeId: 'p3-rope-1', label: 'Rope 1 (upper-left)' },
      { ropeId: 'p3-rope-2', label: 'Rope 2 (upper-right)' },
      { ropeId: 'p3-rope-3', label: 'Rope 3 (lower)' },
      { ropeId: 'p3-rope-4', label: 'Rope 4 (guide)' },
    ],
    validSequences: [
      ['p3-rope-1', 'p3-rope-2', 'p3-rope-3'],   // release top, then lower
      ['p3-rope-2', 'p3-rope-1', 'p3-rope-3'],
    ],
    optimalCutCount: 3,
    timeLimitMs: 10000,
  },
];

export const SUPPORT_PUZZLE_MAP_V2 = new Map(
  SUPPORT_PUZZLES_V2.map((p) => [p.puzzleId, p]),
);

/**
 * Checks whether the given cut sequence is a valid prefix of any
 * declared valid solution for the puzzle. Returns:
 *   'valid-prefix' — can continue cutting
 *   'complete'     — cut sequence matches a complete valid solution
 *   'invalid'      — cut sequence doesn't match any valid solution prefix
 */
export function validateCutSequence(
  puzzleId: string,
  cuts: string[],
): 'valid-prefix' | 'complete' | 'invalid' {
  const puzzle = SUPPORT_PUZZLE_MAP_V2.get(puzzleId);
  if (!puzzle) return 'invalid';

  for (const seq of puzzle.validSequences) {
    // Check if cuts matches seq fully
    if (cuts.length === seq.length) {
      if (cuts.every((c, i) => c === seq[i])) return 'complete';
    }
    // Check if cuts is a valid prefix of seq
    if (cuts.length < seq.length) {
      if (cuts.every((c, i) => c === seq[i])) return 'valid-prefix';
    }
  }
  return 'invalid';
}
