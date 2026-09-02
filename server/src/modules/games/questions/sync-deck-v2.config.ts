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
export const SYNC_DECK_ID_V2 = 'sync-deck-deck1-v2' as const;

export interface SyncCardDefinition {
  cardId: string;
  pairId: string;
  displayType: 'text' | 'emoji' | 'concept' | 'image';
  display: string;
  imageUrl?: string;
  semanticLabel: string;
}

/** 10 semantic pairs = 20 cards (Official Deck 1) */
export const SYNC_CARDS_V2: SyncCardDefinition[] = [
  // Pair 1: Landmark ↔ City (Tháp Eiffel ↔ Paris)
  { cardId: 'sc-p1-a', pairId: 'sc-p1', displayType: 'image', display: 'Tháp Eiffel', imageUrl: '/assets/sync/eiffel.jpg', semanticLabel: 'Landmark ↔ City' },
  { cardId: 'sc-p1-b', pairId: 'sc-p1', displayType: 'concept', display: 'Paris', semanticLabel: 'Landmark ↔ City' },

  // Pair 2: Food ↔ Local (Bún bò ↔ Huế)
  { cardId: 'sc-p2-a', pairId: 'sc-p2', displayType: 'image', display: 'Bún bò', imageUrl: '/assets/sync/bun_bo.jpeg', semanticLabel: 'Food ↔ Local' },
  { cardId: 'sc-p2-b', pairId: 'sc-p2', displayType: 'concept', display: 'Huế', semanticLabel: 'Food ↔ Local' },

  // Pair 3: Culture ↔ Event (Vũ công Samba ↔ Carnaval)
  { cardId: 'sc-p3-a', pairId: 'sc-p3', displayType: 'image', display: 'Vũ công Samba', imageUrl: '/assets/sync/samba.jpg', semanticLabel: 'Culture ↔ Event' },
  { cardId: 'sc-p3-b', pairId: 'sc-p3', displayType: 'concept', display: 'Carnaval', semanticLabel: 'Culture ↔ Event' },

  // Pair 4: Concept ↔ Domain (Hello World! ↔ Lập trình)
  { cardId: 'sc-p4-a', pairId: 'sc-p4', displayType: 'concept', display: 'Hello World!', semanticLabel: 'Concept ↔ Domain' },
  { cardId: 'sc-p4-b', pairId: 'sc-p4', displayType: 'concept', display: 'Lập trình', semanticLabel: 'Concept ↔ Domain' },

  // Pair 5: Brand ↔ Origin (Lego ↔ Đan Mạch)
  { cardId: 'sc-p5-a', pairId: 'sc-p5', displayType: 'concept', display: 'Lego', semanticLabel: 'Brand ↔ Origin' },
  { cardId: 'sc-p5-b', pairId: 'sc-p5', displayType: 'concept', display: 'Đan Mạch', semanticLabel: 'Brand ↔ Origin' },

  // Pair 6: Script ↔ Country (Chữ Hangul ↔ Cờ Hàn Quốc)
  { cardId: 'sc-p6-a', pairId: 'sc-p6', displayType: 'image', display: 'Chữ Hangul: 한글', imageUrl: '/assets/sync/hangeul.png', semanticLabel: 'Script ↔ Country' },
  { cardId: 'sc-p6-b', pairId: 'sc-p6', displayType: 'image', display: 'Hàn Quốc', imageUrl: '/assets/sync/korea.png', semanticLabel: 'Script ↔ Country' },

  // Pair 7: Landmark ↔ City (Tượng Merlion ↔ Cờ Singapore)
  { cardId: 'sc-p7-a', pairId: 'sc-p7', displayType: 'image', display: 'Tượng Merlion', imageUrl: '/assets/sync/merlion.png', semanticLabel: 'Landmark ↔ City' },
  { cardId: 'sc-p7-b', pairId: 'sc-p7', displayType: 'image', display: 'Singapore', imageUrl: '/assets/sync/singapore.png', semanticLabel: 'Landmark ↔ City' },

  // Pair 8: Food ↔ Country (Bánh Taco ↔ Cờ Mexico)
  { cardId: 'sc-p8-a', pairId: 'sc-p8', displayType: 'image', display: 'Bánh Taco', imageUrl: '/assets/sync/taco.png', semanticLabel: 'Food ↔ Country' },
  { cardId: 'sc-p8-b', pairId: 'sc-p8', displayType: 'image', display: 'Mexico', imageUrl: '/assets/sync/mexico.webp', semanticLabel: 'Food ↔ Country' },

  // Pair 9: Symbol ↔ Meaning (Icon WiFi ↔ Kết nối Internet)
  { cardId: 'sc-p9-a', pairId: 'sc-p9', displayType: 'image', display: 'Icon WiFi', imageUrl: '/assets/sync/wifi.jpg', semanticLabel: 'Symbol ↔ Meaning' },
  { cardId: 'sc-p9-b', pairId: 'sc-p9', displayType: 'concept', display: 'Kết nối Internet', semanticLabel: 'Symbol ↔ Meaning' },

  // Pair 10: Clothing ↔ Country (Váy Kilt ↔ Scotland)
  { cardId: 'sc-p10-a', pairId: 'sc-p10', displayType: 'image', display: 'Váy Kilt', imageUrl: '/assets/sync/kilt.avif', semanticLabel: 'Clothing ↔ Country' },
  { cardId: 'sc-p10-b', pairId: 'sc-p10', displayType: 'concept', display: 'Scotland', semanticLabel: 'Clothing ↔ Country' },
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
