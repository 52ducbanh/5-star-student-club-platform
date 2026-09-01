import type { LegacyStarEffect, LegacyStarPalette } from "../starprints";

export interface SkyStar {
  id: string;
  baseColor: string;
  palette: LegacyStarPalette;
  type: string;
  effect: LegacyStarEffect;
  nickname: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface SkyStarCreatedEvent {
  star: SkyStar;
}
