import type { StarEffect, StarPalette } from "../starprints";

export interface SkyStar {
  id: string;
  baseColor: string;
  palette: StarPalette;
  type: string;
  effect: StarEffect;
  nickname: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface SkyStarCreatedEvent {
  star: SkyStar;
}
