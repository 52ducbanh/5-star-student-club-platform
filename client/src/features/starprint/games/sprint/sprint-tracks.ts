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
  expectedDurationMs: 16000,
  hardCapMs: 20000,
  events: [
    { id: 'ta-b1', type: 'obstacle-blocker', atMs: 2000, lane: 1 },
    { id: 'ta-s1', type: 'collectible-star', atMs: 2800, lane: 0 },
    { id: 'ta-b2', type: 'obstacle-barrier', atMs: 4200, lane: 1 },
    { id: 'ta-b3', type: 'obstacle-blocker', atMs: 5500, lane: 0 },
    { id: 'ta-s2', type: 'collectible-star', atMs: 6200, lane: 2 },
    { id: 'ta-b4', type: 'obstacle-barrier', atMs: 7800, lane: 2 },
    { id: 'ta-b5', type: 'obstacle-blocker', atMs: 9000, lane: 1 },
    { id: 'ta-s3', type: 'collectible-star', atMs: 9700, lane: 0 },
    { id: 'ta-b6', type: 'obstacle-blocker', atMs: 11200, lane: 2 },
    { id: 'ta-b7', type: 'obstacle-barrier', atMs: 12500, lane: 0 },
    { id: 'ta-s4', type: 'collectible-star', atMs: 13300, lane: 1 },
    { id: 'ta-b8', type: 'obstacle-blocker', atMs: 14800, lane: 1 },
  ],
};

export const SPRINT_TRACK_B: ClientTrackDefinition = {
  trackId: 'sprint-track-b-v2',
  expectedDurationMs: 15500,
  hardCapMs: 20000,
  events: [
    { id: 'tb-b1', type: 'obstacle-barrier', atMs: 1800, lane: 1 },
    { id: 'tb-s1', type: 'collectible-star', atMs: 2600, lane: 2 },
    { id: 'tb-b2', type: 'obstacle-blocker', atMs: 3800, lane: 0 },
    { id: 'tb-b3', type: 'obstacle-blocker', atMs: 5000, lane: 2 },
    { id: 'tb-s2', type: 'collectible-star', atMs: 5700, lane: 1 },
    { id: 'tb-b4', type: 'obstacle-barrier', atMs: 7000, lane: 1 },
    { id: 'tb-b5', type: 'obstacle-blocker', atMs: 8100, lane: 0 },
    { id: 'tb-s3', type: 'collectible-star', atMs: 9000, lane: 2 },
    { id: 'tb-b6', type: 'obstacle-barrier', atMs: 10300, lane: 0 },
    { id: 'tb-b7', type: 'obstacle-blocker', atMs: 11500, lane: 2 },
    { id: 'tb-s4', type: 'collectible-star', atMs: 12400, lane: 1 },
    { id: 'tb-b8', type: 'obstacle-barrier', atMs: 14200, lane: 1 },
  ],
};

export const SPRINT_TRACK_C: ClientTrackDefinition = {
  trackId: 'sprint-track-c-v2',
  expectedDurationMs: 17000,
  hardCapMs: 20000,
  events: [
    { id: 'tc-b1', type: 'obstacle-blocker', atMs: 2200, lane: 1 },
    { id: 'tc-s1', type: 'collectible-star', atMs: 3000, lane: 0 },
    { id: 'tc-b2', type: 'obstacle-barrier', atMs: 4000, lane: 2 },
    { id: 'tc-b3', type: 'obstacle-blocker', atMs: 5200, lane: 0 },
    { id: 'tc-s2', type: 'collectible-star', atMs: 6000, lane: 2 },
    { id: 'tc-b4', type: 'obstacle-barrier', atMs: 7000, lane: 0 },
    { id: 'tc-b5', type: 'obstacle-blocker', atMs: 8300, lane: 1 },
    { id: 'tc-s3', type: 'collectible-star', atMs: 9200, lane: 0 },
    { id: 'tc-b6', type: 'obstacle-barrier', atMs: 10500, lane: 2 },
    { id: 'tc-b7', type: 'obstacle-blocker', atMs: 11800, lane: 0 },
    { id: 'tc-s4', type: 'collectible-star', atMs: 12700, lane: 1 },
    { id: 'tc-b8', type: 'obstacle-barrier', atMs: 14100, lane: 1 },
    { id: 'tc-b9', type: 'obstacle-blocker', atMs: 15500, lane: 2 },
    { id: 'tc-s5', type: 'collectible-star', atMs: 16200, lane: 0 },
  ],
};

export const SPRINT_TRACKS = [SPRINT_TRACK_A, SPRINT_TRACK_B, SPRINT_TRACK_C];
