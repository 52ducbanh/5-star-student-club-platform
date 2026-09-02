/**
 * Client-side STARPRINT v2 SPRINT track definitions (Track A, B, C).
 * Matches server definitions in sprint-tracks-v2.config.ts exactly.
 */

export type SprintLane = 0 | 1 | 2;

export interface ClientTrackEvent {
  id: string;
  type: 'obstacle-blocker' | 'obstacle-barrier' | 'collectible-star';
  atMs: number;
  lane: SprintLane;
}

export interface ClientTrackDefinition {
  trackId: string;
  expectedDurationMs: number;
  hardCapMs: number;
  events: ClientTrackEvent[];
}

export const SPRINT_TRACK_A: ClientTrackDefinition = {
  trackId: 'sprint-track-a-v2',
  expectedDurationMs: 26000,
  hardCapMs: 30000,
  events: [
    { id: 'ta-b1', type: 'obstacle-blocker', atMs: 2500, lane: 1 },
    { id: 'ta-s1', type: 'collectible-star', atMs: 3600, lane: 0 },
    { id: 'ta-b2', type: 'obstacle-barrier', atMs: 5000, lane: 1 },
    { id: 'ta-s2', type: 'collectible-star', atMs: 6400, lane: 2 },
    { id: 'ta-b3', type: 'obstacle-blocker', atMs: 7800, lane: 0 },
    { id: 'ta-b4', type: 'obstacle-barrier', atMs: 9200, lane: 2 },
    { id: 'ta-s3', type: 'collectible-star', atMs: 10400, lane: 1 },
    { id: 'ta-b5', type: 'obstacle-blocker', atMs: 11800, lane: 1 },
    { id: 'ta-b6', type: 'obstacle-barrier', atMs: 13200, lane: 0 },
    { id: 'ta-s4', type: 'collectible-star', atMs: 14400, lane: 0 },
    { id: 'ta-b7', type: 'obstacle-blocker', atMs: 15800, lane: 2 },
    { id: 'ta-b8', type: 'obstacle-barrier', atMs: 17200, lane: 1 },
    { id: 'ta-s5', type: 'collectible-star', atMs: 18400, lane: 2 },
    { id: 'ta-b9', type: 'obstacle-blocker', atMs: 19800, lane: 0 },
    { id: 'ta-b10', type: 'obstacle-barrier', atMs: 21200, lane: 2 },
    { id: 'ta-s6', type: 'collectible-star', atMs: 22400, lane: 1 },
    { id: 'ta-b11', type: 'obstacle-blocker', atMs: 23800, lane: 1 },
    { id: 'ta-s7', type: 'collectible-star', atMs: 24800, lane: 0 },
  ],
};

export const SPRINT_TRACK_B: ClientTrackDefinition = {
  trackId: 'sprint-track-b-v2',
  expectedDurationMs: 26200,
  hardCapMs: 30000,
  events: [
    { id: 'tb-b1', type: 'obstacle-barrier', atMs: 2400, lane: 1 },
    { id: 'tb-s1', type: 'collectible-star', atMs: 3400, lane: 2 },
    { id: 'tb-b2', type: 'obstacle-blocker', atMs: 4800, lane: 0 },
    { id: 'tb-b3', type: 'obstacle-blocker', atMs: 6200, lane: 2 },
    { id: 'tb-s2', type: 'collectible-star', atMs: 7400, lane: 1 },
    { id: 'tb-b4', type: 'obstacle-barrier', atMs: 8800, lane: 1 },
    { id: 'tb-b5', type: 'obstacle-blocker', atMs: 10200, lane: 0 },
    { id: 'tb-s3', type: 'collectible-star', atMs: 11400, lane: 2 },
    { id: 'tb-b6', type: 'obstacle-barrier', atMs: 12800, lane: 2 },
    { id: 'tb-b7', type: 'obstacle-blocker', atMs: 14200, lane: 1 },
    { id: 'tb-s4', type: 'collectible-star', atMs: 15400, lane: 0 },
    { id: 'tb-b8', type: 'obstacle-barrier', atMs: 16800, lane: 0 },
    { id: 'tb-b9', type: 'obstacle-blocker', atMs: 18200, lane: 2 },
    { id: 'tb-s5', type: 'collectible-star', atMs: 19400, lane: 1 },
    { id: 'tb-b10', type: 'obstacle-barrier', atMs: 20800, lane: 1 },
    { id: 'tb-b11', type: 'obstacle-blocker', atMs: 22200, lane: 0 },
    { id: 'tb-s6', type: 'collectible-star', atMs: 23200, lane: 2 },
    { id: 'tb-b12', type: 'obstacle-barrier', atMs: 24200, lane: 2 },
    { id: 'tb-s7', type: 'collectible-star', atMs: 25100, lane: 1 },
  ],
};

export const SPRINT_TRACK_C: ClientTrackDefinition = {
  trackId: 'sprint-track-c-v2',
  expectedDurationMs: 26500,
  hardCapMs: 30000,
  events: [
    { id: 'tc-b1', type: 'obstacle-blocker', atMs: 2400, lane: 1 },
    { id: 'tc-s1', type: 'collectible-star', atMs: 3400, lane: 0 },
    { id: 'tc-b2', type: 'obstacle-barrier', atMs: 4600, lane: 2 },
    { id: 'tc-b3', type: 'obstacle-blocker', atMs: 5800, lane: 0 },
    { id: 'tc-s2', type: 'collectible-star', atMs: 6800, lane: 2 },
    { id: 'tc-b4', type: 'obstacle-barrier', atMs: 8000, lane: 1 },
    { id: 'tc-b5', type: 'obstacle-blocker', atMs: 9400, lane: 2 },
    { id: 'tc-s3', type: 'collectible-star', atMs: 10400, lane: 0 },
    { id: 'tc-b6', type: 'obstacle-barrier', atMs: 11600, lane: 0 },
    { id: 'tc-b7', type: 'obstacle-blocker', atMs: 13000, lane: 1 },
    { id: 'tc-s4', type: 'collectible-star', atMs: 14000, lane: 2 },
    { id: 'tc-b8', type: 'obstacle-barrier', atMs: 15200, lane: 2 },
    { id: 'tc-b9', type: 'obstacle-blocker', atMs: 16600, lane: 0 },
    { id: 'tc-s5', type: 'collectible-star', atMs: 17600, lane: 1 },
    { id: 'tc-b10', type: 'obstacle-barrier', atMs: 18800, lane: 1 },
    { id: 'tc-b11', type: 'obstacle-blocker', atMs: 20200, lane: 2 },
    { id: 'tc-s6', type: 'collectible-star', atMs: 21200, lane: 0 },
    { id: 'tc-b12', type: 'obstacle-barrier', atMs: 22400, lane: 0 },
    { id: 'tc-b13', type: 'obstacle-blocker', atMs: 23800, lane: 1 },
    { id: 'tc-s7', type: 'collectible-star', atMs: 24800, lane: 2 },
  ],
};

export const SPRINT_TRACKS = [SPRINT_TRACK_A, SPRINT_TRACK_B, SPRINT_TRACK_C];
