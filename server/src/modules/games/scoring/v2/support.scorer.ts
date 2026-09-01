/**
 * STARPRINT v2 SUPPORT scorer (Cut-the-Rope puzzle).
 *
 * Observed traits: Insight, Precision, Adaptation, Persistence, Sharpness, Initiative
 * Connection = null (structurally unobserved)
 *
 * Scoring signals from per-puzzle evidence:
 *   - Completion within time → Insight, Precision
 *   - Optimal cut sequence (no invalid cuts, no auto-resets) → Precision, Sharpness
 *   - Number of invalid/wrong cuts (resets) → negative for Precision, positive for Adaptation via recovery
 *   - Recovery after wrong cut (still completing) → Persistence, Adaptation
 *   - Completion time within 10s → Initiative
 *   - Completion across all 3 puzzles → Persistence
 *
 * Timer continuity: timer does not reset across auto-resets.
 * Auto-reset is a game event, not a full puzzle restart.
 */

import type { SupportRawResultV2 } from '@5ss/contracts';
import type { LocalTraitContributionInput } from '../v2/hidden-profile.engine';
import { SUPPORT_PUZZLE_MAP_V2 } from '../../questions/support-puzzles-v2.config';

const PUZZLE_TIME_LIMIT_MS = 10000;

interface PuzzleMetrics {
  completed: boolean;
  timedOut: boolean;
  durationMs: number;
  invalidCuts: number;
  autoResets: number;
  totalCuts: number;
  optimalCutCount: number;
  completionRatio: number; // durationMs relative to timeLimitMs
}

function extractPuzzleMetrics(
  puzzle: SupportRawResultV2['puzzles'][number],
): PuzzleMetrics {
  const def = SUPPORT_PUZZLE_MAP_V2.get(puzzle.puzzleId);
  const optimalCutCount = def?.optimalCutCount ?? 2;

  let invalidCuts = 0;
  let autoResets = 0;
  let totalCuts = 0;

  for (const event of puzzle.events) {
    if (event.type === 'rope-cut') {
      totalCuts++;
    } else if (event.type === 'invalid-state') {
      invalidCuts++;
    } else if (event.type === 'auto-reset') {
      autoResets++;
    }
  }

  const durationMs = Math.min(puzzle.durationMs, PUZZLE_TIME_LIMIT_MS);
  const completionRatio = 1 - durationMs / PUZZLE_TIME_LIMIT_MS;

  return {
    completed: puzzle.completed,
    timedOut: puzzle.timedOut,
    durationMs,
    invalidCuts,
    autoResets,
    totalCuts,
    optimalCutCount,
    completionRatio,
  };
}

export function scoreSupportV2(rawResult: SupportRawResultV2): LocalTraitContributionInput {
  const { puzzles } = rawResult;

  const raw: Record<string, number> = {
    sharpness: 0,
    insight: 0,
    precision: 0,
    initiative: 0,
    adaptation: 0,
    persistence: 0,
  };
  const max: Record<string, number> = {
    sharpness: 0,
    insight: 0,
    precision: 0,
    initiative: 0,
    adaptation: 0,
    persistence: 0,
  };

  let puzzlesCompleted = 0;
  let totalPuzzles = puzzles.length;

  for (const puzzleResult of puzzles) {
    const m = extractPuzzleMetrics(puzzleResult);

    if (m.completed) puzzlesCompleted++;

    // --- Insight: understanding which rope to cut (completion + low resets) ---
    const insightOpportunity = 0.3;
    max.insight += insightOpportunity;
    if (m.completed) {
      const resetPenalty = Math.min(m.autoResets * 0.05, 0.15);
      raw.insight += insightOpportunity - resetPenalty;
    }

    // --- Precision: optimal cut sequence (minimal invalid/resets) ---
    const precisionOpportunity = 0.4;
    max.precision += precisionOpportunity;
    if (m.completed) {
      const inefficiency = m.totalCuts > m.optimalCutCount
        ? (m.totalCuts - m.optimalCutCount) / Math.max(m.totalCuts, 1)
        : 0;
      const resetRatio = m.autoResets / Math.max(m.totalCuts + 1, 1);
      raw.precision += precisionOpportunity * (1 - inefficiency * 0.5 - resetRatio * 0.3);
    } else if (!m.timedOut) {
      raw.precision += precisionOpportunity * 0.05; // small partial for attempting
    }

    // --- Sharpness: identifying correct cut quickly ---
    const sharpnessOpportunity = 0.2;
    max.sharpness += sharpnessOpportunity;
    if (m.completed && m.autoResets === 0) {
      raw.sharpness += sharpnessOpportunity * (0.5 + m.completionRatio * 0.5);
    } else if (m.completed) {
      raw.sharpness += sharpnessOpportunity * 0.3;
    }

    // --- Initiative: completing faster → taking decisive action ---
    const initiativeOpportunity = 0.2;
    max.initiative += initiativeOpportunity;
    if (m.completed) {
      raw.initiative += initiativeOpportunity * m.completionRatio;
    }

    // --- Adaptation: recovering from invalid cuts to still complete ---
    const adaptationOpportunity = 0.2;
    max.adaptation += adaptationOpportunity;
    if (m.completed && m.autoResets > 0) {
      // Recovered after mistakes → strong adaptation signal
      raw.adaptation += adaptationOpportunity * 0.9;
    } else if (m.completed) {
      raw.adaptation += adaptationOpportunity * 0.6;
    } else if (!m.timedOut && m.totalCuts > 0) {
      // Tried but didn't complete → some adaptation for ongoing effort
      raw.adaptation += adaptationOpportunity * 0.2;
    }

    // --- Persistence: continuing despite resets ---
    const persistenceOpportunity = 0.1;
    max.persistence += persistenceOpportunity;
    if (m.totalCuts > 0) {
      // Any engagement = persistence (even timed out)
      const engagementFactor = m.completed ? 1.0 : (m.totalCuts > 0 ? 0.5 : 0.0);
      raw.persistence += persistenceOpportunity * engagementFactor;
    }
  }

  // Persistence across all puzzles: completion rate
  const allPuzzlesPersistenceMax = 0.2;
  max.persistence += allPuzzlesPersistenceMax;
  raw.persistence += (puzzlesCompleted / Math.max(totalPuzzles, 1)) * allPuzzlesPersistenceMax;

  return {
    sharpness:
      max.sharpness > 0
        ? { rawContribution: raw.sharpness, maximumAvailableContribution: max.sharpness }
        : null,
    insight:
      max.insight > 0
        ? { rawContribution: raw.insight, maximumAvailableContribution: max.insight }
        : null,
    precision:
      max.precision > 0
        ? { rawContribution: raw.precision, maximumAvailableContribution: max.precision }
        : null,
    initiative:
      max.initiative > 0
        ? { rawContribution: raw.initiative, maximumAvailableContribution: max.initiative }
        : null,
    connection: null,
    adaptation:
      max.adaptation > 0
        ? { rawContribution: raw.adaptation, maximumAvailableContribution: max.adaptation }
        : null,
    persistence:
      max.persistence > 0
        ? { rawContribution: raw.persistence, maximumAvailableContribution: max.persistence }
        : null,
  };
}
