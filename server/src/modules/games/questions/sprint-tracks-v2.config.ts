/**
 * Official STARPRINT v2 SPRINT track definitions.
 *
 * Finite 3-lane runner — deterministic predefined track pool (A, B, C).
 * No uncontrolled Math.random() spawning.
 *
 * Track anatomy:
 *   - trackId: stable identifier; server assigns on session creation
 *   - lanes: 0 (left), 1 (center), 2 (right)
 *   - events: ordered sequence of encounters at given ms timestamps
 *
 * Obstacle types:
 *   - 'blocker': lane blocker (player must move away)
 *   - 'barrier': low barrier (player must jump)
 *
 * Collectible: 'star'
 *
 * Expected duration: 15–18s; hard cap 20s.
 * Player starts in center lane (lane 1).
 *
 * PROVISIONAL — awaiting final BA tuning of obstacle timing and placement.
 * Content version: starprint-content-v2
 *
 * Observed traits: Sharpness, Initiative, Adaptation, Persistence, Precision
 * Unobserved: Connection (structural null)
 */

export const CONTENT_VERSION_SPRINT_V2 = 'starprint-content-v2' as const;

export type SprintLane = 0 | 1 | 2;

export type SprintTrackEventType =
  | 'obstacle-blocker'
  | 'obstacle-barrier'
  | 'collectible-star';

export interface SprintTrackEvent {
  id: string;
  type: SprintTrackEventType;
  atMs: number;
  lane: SprintLane;
}

export interface SprintTrackDefinition {
  trackId: string;
  expectedDurationMs: number;
  hardCapMs: number;
  events: SprintTrackEvent[];
}

/** Track A — balanced, even spacing, 16s expected duration */
const TRACK_A: SprintTrackDefinition = {
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

/** Track B — requires more lane switching, 15.5s expected duration */
const TRACK_B: SprintTrackDefinition = {
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

/** Track C — denser obstacles, more collectibles, 17s expected duration */
const TRACK_C: SprintTrackDefinition = {
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

export const SPRINT_TRACKS_V2: SprintTrackDefinition[] = [TRACK_A, TRACK_B, TRACK_C];

export const SPRINT_TRACK_MAP_V2 = new Map(
  SPRINT_TRACKS_V2.map((t) => [t.trackId, t]),
);

/** All valid obstacle IDs per track for server-side event validation */
export function getTrackObstacleIds(trackId: string): Set<string> {
  const track = SPRINT_TRACK_MAP_V2.get(trackId);
  if (!track) return new Set();
  return new Set(
    track.events
      .filter(
        (e) =>
          e.type === 'obstacle-blocker' || e.type === 'obstacle-barrier',
      )
      .map((e) => e.id),
  );
}

export function getTrackCollectibleIds(trackId: string): Set<string> {
  const track = SPRINT_TRACK_MAP_V2.get(trackId);
  if (!track) return new Set();
  return new Set(
    track.events
      .filter((e) => e.type === 'collectible-star')
      .map((e) => e.id),
  );
}
