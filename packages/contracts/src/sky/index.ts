import type { LegacyStarEffect, LegacyStarPalette, StarEffect, WingPalette } from "../starprints";

export interface SkyStar {
  id: string;
  baseColor: string;
  palette: LegacyStarPalette | WingPalette;
  wingPalette?: WingPalette | null;
  type: string;
  effect: LegacyStarEffect | StarEffect;
  nickname: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface SkyStarCreatedEvent {
  star: SkyStar;
}
