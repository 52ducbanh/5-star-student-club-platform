/**
 * Official STARPRINT v2 SYNC semantic deck.
 *
 * 20 cards = 10 semantic pairs.
 * Each card has exactly one unambiguous semantic partner.
 * Board assignment is shuffled per-session (server determines shuffle seed / order).
 *
 * Card anatomy:
 *   - cardId: stable identifier
 *   - pairId: shared with semantic partner
 *   - displayType: 'text' | 'emoji' | 'concept'
 *   - display: shown to player (emoji or short text/concept label)
 *   - semanticLabel: human-readable pair description (server only, never shown to player)
 *
 * PROVISIONAL — awaiting final BA content / asset approval.
 * Content version: starprint-content-v2
 *
 * Observed traits: Precision, Sharpness, Adaptation, Persistence, Insight
 * Unobserved: Initiative, Connection (structural null)
 */

export const CONTENT_VERSION_SYNC_V2 = 'starprint-content-v2' as const;
export const SYNC_DECK_ID_V2 = 'sync-deck-semantic-v2-provisional' as const;

export interface SyncCardDefinition {
  cardId: string;
  pairId: string;
  displayType: 'text' | 'emoji' | 'concept';
  display: string;
  semanticLabel: string;
}

/** 10 semantic pairs = 20 cards */
export const SYNC_CARDS_V2: SyncCardDefinition[] = [
  // Pair 1: Cause & Effect
  { cardId: 'sc-p1-a', pairId: 'sc-p1', displayType: 'concept', display: 'Nguyên nhân', semanticLabel: 'Cause ↔ Effect' },
  { cardId: 'sc-p1-b', pairId: 'sc-p1', displayType: 'concept', display: 'Kết quả', semanticLabel: 'Cause ↔ Effect' },
  // Pair 2: Question & Answer
  { cardId: 'sc-p2-a', pairId: 'sc-p2', displayType: 'emoji', display: '❓', semanticLabel: 'Question ↔ Answer' },
  { cardId: 'sc-p2-b', pairId: 'sc-p2', displayType: 'emoji', display: '💡', semanticLabel: 'Question ↔ Answer' },
  // Pair 3: Input & Output
  { cardId: 'sc-p3-a', pairId: 'sc-p3', displayType: 'concept', display: 'Đầu vào', semanticLabel: 'Input ↔ Output' },
  { cardId: 'sc-p3-b', pairId: 'sc-p3', displayType: 'concept', display: 'Đầu ra', semanticLabel: 'Input ↔ Output' },
  // Pair 4: Seed & Tree
  { cardId: 'sc-p4-a', pairId: 'sc-p4', displayType: 'emoji', display: '🌱', semanticLabel: 'Seed ↔ Tree' },
  { cardId: 'sc-p4-b', pairId: 'sc-p4', displayType: 'emoji', display: '🌳', semanticLabel: 'Seed ↔ Tree' },
  // Pair 5: Problem & Solution
  { cardId: 'sc-p5-a', pairId: 'sc-p5', displayType: 'concept', display: 'Vấn đề', semanticLabel: 'Problem ↔ Solution' },
  { cardId: 'sc-p5-b', pairId: 'sc-p5', displayType: 'concept', display: 'Giải pháp', semanticLabel: 'Problem ↔ Solution' },
  // Pair 6: Goal & Path
  { cardId: 'sc-p6-a', pairId: 'sc-p6', displayType: 'emoji', display: '🎯', semanticLabel: 'Goal ↔ Path' },
  { cardId: 'sc-p6-b', pairId: 'sc-p6', displayType: 'emoji', display: '🗺️', semanticLabel: 'Goal ↔ Path' },
  // Pair 7: Question & Exploration
  { cardId: 'sc-p7-a', pairId: 'sc-p7', displayType: 'concept', display: 'Thắc mắc', semanticLabel: 'Curiosity ↔ Discovery' },
  { cardId: 'sc-p7-b', pairId: 'sc-p7', displayType: 'concept', display: 'Khám phá', semanticLabel: 'Curiosity ↔ Discovery' },
  // Pair 8: Individual & Team
  { cardId: 'sc-p8-a', pairId: 'sc-p8', displayType: 'emoji', display: '👤', semanticLabel: 'Individual ↔ Team' },
  { cardId: 'sc-p8-b', pairId: 'sc-p8', displayType: 'emoji', display: '👥', semanticLabel: 'Individual ↔ Team' },
  // Pair 9: Effort & Result
  { cardId: 'sc-p9-a', pairId: 'sc-p9', displayType: 'concept', display: 'Nỗ lực', semanticLabel: 'Effort ↔ Achievement' },
  { cardId: 'sc-p9-b', pairId: 'sc-p9', displayType: 'concept', display: 'Thành tựu', semanticLabel: 'Effort ↔ Achievement' },
  // Pair 10: Spark & Star
  { cardId: 'sc-p10-a', pairId: 'sc-p10', displayType: 'emoji', display: '✨', semanticLabel: 'Spark ↔ Star' },
  { cardId: 'sc-p10-b', pairId: 'sc-p10', displayType: 'emoji', display: '⭐', semanticLabel: 'Spark ↔ Star' },
];

export const SYNC_CARD_MAP_V2 = new Map(
  SYNC_CARDS_V2.map((c) => [c.cardId, c]),
);

export const SYNC_PAIR_IDS_V2 = [
  ...new Set(SYNC_CARDS_V2.map((c) => c.pairId)),
];

/** Derive pair partners for server-side match validation */
export function getCardPairId(cardId: string): string | null {
  return SYNC_CARD_MAP_V2.get(cardId)?.pairId ?? null;
}

export function doCardsMatch(cardIdA: string, cardIdB: string): boolean {
  const a = SYNC_CARD_MAP_V2.get(cardIdA);
  const b = SYNC_CARD_MAP_V2.get(cardIdB);
  if (!a || !b || cardIdA === cardIdB) return false;
  return a.pairId === b.pairId;
}
