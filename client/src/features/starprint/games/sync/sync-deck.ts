/**
 * Client-side STARPRINT v2 SYNC semantic deck (20 cards / 10 pairs).
 * Matches server definitions in sync-deck-v2.config.ts.
 */

export const SYNC_DECK_ID = 'sync-deck-semantic-v2-provisional' as const;

export interface ClientSyncCard {
  cardId: string;
  pairId: string;
  displayType: 'text' | 'emoji' | 'concept';
  display: string;
}

export const SYNC_CARDS_CLIENT: ClientSyncCard[] = [
  // Pair 1: Cause & Effect
  { cardId: 'sc-p1-a', pairId: 'sc-p1', displayType: 'concept', display: 'Nguyên nhân' },
  { cardId: 'sc-p1-b', pairId: 'sc-p1', displayType: 'concept', display: 'Kết quả' },
  // Pair 2: Question & Answer
  { cardId: 'sc-p2-a', pairId: 'sc-p2', displayType: 'emoji', display: '❓' },
  { cardId: 'sc-p2-b', pairId: 'sc-p2', displayType: 'emoji', display: '💡' },
  // Pair 3: Input & Output
  { cardId: 'sc-p3-a', pairId: 'sc-p3', displayType: 'concept', display: 'Đầu vào' },
  { cardId: 'sc-p3-b', pairId: 'sc-p3', displayType: 'concept', display: 'Đầu ra' },
  // Pair 4: Seed & Tree
  { cardId: 'sc-p4-a', pairId: 'sc-p4', displayType: 'emoji', display: '🌱' },
  { cardId: 'sc-p4-b', pairId: 'sc-p4', displayType: 'emoji', display: '🌳' },
  // Pair 5: Problem & Solution
  { cardId: 'sc-p5-a', pairId: 'sc-p5', displayType: 'concept', display: 'Vấn đề' },
  { cardId: 'sc-p5-b', pairId: 'sc-p5', displayType: 'concept', display: 'Giải pháp' },
  // Pair 6: Goal & Path
  { cardId: 'sc-p6-a', pairId: 'sc-p6', displayType: 'emoji', display: '🎯' },
  { cardId: 'sc-p6-b', pairId: 'sc-p6', displayType: 'emoji', display: '🗺️' },
  // Pair 7: Curiosity & Discovery
  { cardId: 'sc-p7-a', pairId: 'sc-p7', displayType: 'concept', display: 'Thắc mắc' },
  { cardId: 'sc-p7-b', pairId: 'sc-p7', displayType: 'concept', display: 'Khám phá' },
  // Pair 8: Individual & Team
  { cardId: 'sc-p8-a', pairId: 'sc-p8', displayType: 'emoji', display: '👤' },
  { cardId: 'sc-p8-b', pairId: 'sc-p8', displayType: 'emoji', display: '👥' },
  // Pair 9: Effort & Achievement
  { cardId: 'sc-p9-a', pairId: 'sc-p9', displayType: 'concept', display: 'Nỗ lực' },
  { cardId: 'sc-p9-b', pairId: 'sc-p9', displayType: 'concept', display: 'Thành tựu' },
  // Pair 10: Spark & Star
  { cardId: 'sc-p10-a', pairId: 'sc-p10', displayType: 'emoji', display: '✨' },
  { cardId: 'sc-p10-b', pairId: 'sc-p10', displayType: 'emoji', display: '⭐' },
];

/**
 * Deterministically shuffle deck based on a session seed string.
 * This guarantees server and client have the exact same deck order.
 */
export function shuffleDeckWithSeed(cards: ClientSyncCard[], seed: string): ClientSyncCard[] {
  const arr = [...cards];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  // Simple LCG pseudo-random shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    h = (Math.imul(1103515245, h) + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
