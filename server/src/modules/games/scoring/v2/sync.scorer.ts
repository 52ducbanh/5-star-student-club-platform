/**
 * STARPRINT v2 SYNC scorer (Memory + Semantic Matching).
 *
 * Observed traits: Precision, Sharpness, Adaptation, Persistence, Insight
 * Initiative = null (structurally unobserved)
 * Connection = null (structurally unobserved)
 *
 * 20 cards, 10 semantic pairs, 30s hard timer.
 * No retry.
 *
 * Scoring signals from event sequence:
 *   - Matches (correct pairs found) → Insight, Precision
 *   - Mismatches → negative for Precision; positive for Adaptation if still completing
 *   - Repeated mistakes (same pair mismatched > 1 time) → measures memory failure
 *   - Memory reuse: cards not re-flipped unnecessarily → Precision, Sharpness
 *   - Completion within 30s → Persistence
 *   - Matching speed (early completions) → Sharpness
 *   - Late performance: matching pairs in final 10s → Persistence
 */

import type { SyncRawResultV2 } from '@5ss/contracts';
import type { LocalTraitContributionInput } from '../v2/hidden-profile.engine';

const SYNC_TOTAL_PAIRS = 10;
const SYNC_TIME_LIMIT_MS = 30000;

interface SyncMetrics {
  totalMatches: number;
  totalMismatches: number;
  repeatedMistakes: number;
  unnecessaryReflips: number;
  completed: boolean;
  durationMs: number;
  pairsMatchedInFinalThird: number;
}

function extractSyncMetrics(rawResult: SyncRawResultV2): SyncMetrics {
  const { events, durationMs, completed } = rawResult;
  const finalThirdStartMs = SYNC_TIME_LIMIT_MS * (2 / 3);

  let totalMatches = 0;
  let totalMismatches = 0;
  let pairsMatchedInFinalThird = 0;

  // Track how many times each pair has been mismatched
  const pairMismatchCount: Record<string, number> = {};

  // Track revealed cards for unnecessaryReflips detection
  const revealedPairs = new Set<string>();

  for (const event of events) {
    if (event.type === 'pair-resolved') {
      if (event.matched) {
        totalMatches++;
        const pairKey = [event.firstCardId, event.secondCardId].sort().join('|');
        revealedPairs.add(pairKey);
        if (event.atMs >= finalThirdStartMs) {
          pairsMatchedInFinalThird++;
        }
      } else {
        totalMismatches++;
        // Track pair mismatch counts using sorted card IDs
        const pairKey = [event.firstCardId, event.secondCardId].sort().join('|');
        pairMismatchCount[pairKey] = (pairMismatchCount[pairKey] ?? 0) + 1;
      }
    }
  }

  // Repeated mistakes: pairs mismatched more than once
  const repeatedMistakes = Object.values(pairMismatchCount).filter((c) => c > 1).length;

  // Unnecessary reflips: cards already in matched pairs being selected again
  // (simplified: count card-selected events where card was already matched)
  let unnecessaryReflips = 0;
  const matchedCardIds = new Set<string>();
  for (const event of events) {
    if (event.type === 'pair-resolved' && event.matched) {
      matchedCardIds.add(event.firstCardId);
      matchedCardIds.add(event.secondCardId);
    }
    if (event.type === 'card-selected' && matchedCardIds.has(event.cardId)) {
      unnecessaryReflips++;
    }
  }

  return {
    totalMatches,
    totalMismatches,
    repeatedMistakes,
    unnecessaryReflips,
    completed,
    durationMs: Math.min(durationMs, SYNC_TIME_LIMIT_MS),
    pairsMatchedInFinalThird,
  };
}

export function scoreSyncV2(rawResult: SyncRawResultV2): LocalTraitContributionInput {
  const m = extractSyncMetrics(rawResult);

  const matchRatio = m.totalMatches / SYNC_TOTAL_PAIRS;
  const mismatchRatio = m.totalMismatches / Math.max(m.totalMatches + m.totalMismatches, 1);
  const timeRatio = m.durationMs / SYNC_TIME_LIMIT_MS;

  // --- Insight: semantic understanding → finding correct pairs ---
  const insightMax = 1.0;
  const insightRaw =
    matchRatio * 0.7 +
    (1 - Math.min(m.repeatedMistakes / SYNC_TOTAL_PAIRS, 1)) * 0.3;

  // --- Precision: accurate selections, low mismatch, minimal unnecessary flips ---
  const precisionMax = 1.0;
  const unnecessaryPenalty = Math.min(m.unnecessaryReflips / 10, 0.2);
  const precisionRaw =
    matchRatio * 0.5 +
    (1 - mismatchRatio) * 0.3 +
    (1 - unnecessaryPenalty) * 0.2;

  // --- Sharpness: quick recognition (completing matches early in session) ---
  const sharpnessMax = 1.0;
  // Earlier completion (lower durationMs for matched pairs) → higher sharpness
  const earlyCompletionBonus =
    m.completed
      ? Math.max(0, 1 - timeRatio) * 0.4
      : 0;
  const sharpnessRaw = matchRatio * 0.6 + earlyCompletionBonus;

  // --- Adaptation: continuing effectively after mismatches ---
  const adaptationMax = 1.0;
  const adaptationRaw =
    m.totalMismatches > 0
      ? matchRatio * 0.6 + (1 - m.repeatedMistakes / Math.max(m.totalMismatches, 1)) * 0.4
      : matchRatio * 0.8;

  // --- Persistence: staying through the 30s + late-game matching ---
  const persistenceMax = 1.0;
  const lateGameBonus =
    m.pairsMatchedInFinalThird > 0
      ? Math.min(m.pairsMatchedInFinalThird / 3, 1) * 0.3
      : 0;
  const persistenceRaw =
    matchRatio * 0.5 +
    (m.completed ? 0.2 : timeRatio * 0.2) +
    lateGameBonus;

  return {
    sharpness: { rawContribution: Math.min(sharpnessRaw, sharpnessMax), maximumAvailableContribution: sharpnessMax },
    insight: { rawContribution: Math.min(insightRaw, insightMax), maximumAvailableContribution: insightMax },
    precision: { rawContribution: Math.min(precisionRaw, precisionMax), maximumAvailableContribution: precisionMax },
    initiative: null,
    connection: null,
    adaptation: { rawContribution: Math.min(adaptationRaw, adaptationMax), maximumAvailableContribution: adaptationMax },
    persistence: { rawContribution: Math.min(persistenceRaw, persistenceMax), maximumAvailableContribution: persistenceMax },
  };
}
