/**
 * Client-side STARPRINT v2 SYNC semantic deck (20 cards / 10 pairs).
 * Matches server definitions in sync-deck-v2.config.ts.
 */

export const SYNC_DECK_ID = 'sync-deck-deck1-v2' as const;

export interface ClientSyncCard {
  cardId: string;
  pairId: string;
  displayType: 'text' | 'emoji' | 'concept' | 'image';
  display: string;
  imageUrl?: string;
}

export const SYNC_CARDS_CLIENT: ClientSyncCard[] = [
  // Pair 1: Landmark ↔ City (Tháp Eiffel ↔ Paris)
  { cardId: 'sc-p1-a', pairId: 'sc-p1', displayType: 'image', display: 'Tháp Eiffel', imageUrl: '/assets/sync/eiffel.jpg' },
  { cardId: 'sc-p1-b', pairId: 'sc-p1', displayType: 'concept', display: 'Paris' },

  // Pair 2: Food ↔ Local (Bún bò ↔ Huế)
  { cardId: 'sc-p2-a', pairId: 'sc-p2', displayType: 'image', display: 'Bún bò', imageUrl: '/assets/sync/bun_bo.jpeg' },
  { cardId: 'sc-p2-b', pairId: 'sc-p2', displayType: 'concept', display: 'Huế' },

  // Pair 3: Culture ↔ Event (Vũ công Samba ↔ Carnaval)
  { cardId: 'sc-p3-a', pairId: 'sc-p3', displayType: 'image', display: 'Vũ công Samba', imageUrl: '/assets/sync/samba.jpg' },
  { cardId: 'sc-p3-b', pairId: 'sc-p3', displayType: 'concept', display: 'Carnaval' },

  // Pair 4: Concept ↔ Domain (Hello World! ↔ Lập trình)
  { cardId: 'sc-p4-a', pairId: 'sc-p4', displayType: 'concept', display: 'Hello World!' },
  { cardId: 'sc-p4-b', pairId: 'sc-p4', displayType: 'concept', display: 'Lập trình' },

  // Pair 5: Brand ↔ Origin (Lego ↔ Đan Mạch)
  { cardId: 'sc-p5-a', pairId: 'sc-p5', displayType: 'concept', display: 'Lego' },
  { cardId: 'sc-p5-b', pairId: 'sc-p5', displayType: 'concept', display: 'Đan Mạch' },

  // Pair 6: Script ↔ Country (Chữ Hangul ↔ Cờ Hàn Quốc)
  { cardId: 'sc-p6-a', pairId: 'sc-p6', displayType: 'image', display: 'Chữ Hangul: 한글', imageUrl: '/assets/sync/hangeul.png' },
  { cardId: 'sc-p6-b', pairId: 'sc-p6', displayType: 'image', display: 'Hàn Quốc', imageUrl: '/assets/sync/korea.png' },

  // Pair 7: Landmark ↔ City (Tượng Merlion ↔ Cờ Singapore)
  { cardId: 'sc-p7-a', pairId: 'sc-p7', displayType: 'image', display: 'Tượng Merlion', imageUrl: '/assets/sync/merlion.png' },
  { cardId: 'sc-p7-b', pairId: 'sc-p7', displayType: 'image', display: 'Singapore', imageUrl: '/assets/sync/singapore.png' },

  // Pair 8: Food ↔ Country (Bánh Taco ↔ Cờ Mexico)
  { cardId: 'sc-p8-a', pairId: 'sc-p8', displayType: 'image', display: 'Bánh Taco', imageUrl: '/assets/sync/taco.png' },
  { cardId: 'sc-p8-b', pairId: 'sc-p8', displayType: 'image', display: 'Mexico', imageUrl: '/assets/sync/mexico.webp' },

  // Pair 9: Symbol ↔ Meaning (Icon WiFi ↔ Kết nối Internet)
  { cardId: 'sc-p9-a', pairId: 'sc-p9', displayType: 'image', display: 'Icon WiFi', imageUrl: '/assets/sync/wifi.jpg' },
  { cardId: 'sc-p9-b', pairId: 'sc-p9', displayType: 'concept', display: 'Kết nối Internet' },

  // Pair 10: Clothing ↔ Country (Váy Kilt ↔ Scotland)
  { cardId: 'sc-p10-a', pairId: 'sc-p10', displayType: 'image', display: 'Váy Kilt', imageUrl: '/assets/sync/kilt.avif' },
  { cardId: 'sc-p10-b', pairId: 'sc-p10', displayType: 'concept', display: 'Scotland' },
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
