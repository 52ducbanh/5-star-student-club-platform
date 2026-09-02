export const traitIds = [
  "sharpness",
  "insight",
  "precision",
  "initiative",
  "connection",
  "adaptation",
  "persistence",
] as const;

export type TraitId = (typeof traitIds)[number];

/**
 * `null` means the game is structurally not designed to observe that trait.
 * Timeout, incorrect performance, or zero positive signal after valid
 * observation opportunities must be represented by numeric `0`, never null.
 */
export type LocalTraitProfile = Readonly<Record<TraitId, number | null>>;

/** A finalized profile exists only after every trait has numeric evidence. */
export type GlobalHiddenProfile = Readonly<Record<TraitId, number>>;

export const starTypeIds = [
  "STRATEGIST",
  "SPARK",
  "SYNERGIST",
  "SEEKER",
  "SUSTAINER",
] as const;

export type StarTypeId = (typeof starTypeIds)[number];

export const starEffects = ["SHIMMER", "SPARK", "ORBIT", "FLOW", "PULSE"] as const;

export type StarEffect = (typeof starEffects)[number];

/** Exactly one deterministic wing color for each of the five game stages. */
export type WingPalette = readonly [string, string, string, string, string];

export function isWingPalette(value: unknown): value is WingPalette {
  return Array.isArray(value) && value.length === 5 && value.every((color) => typeof color === "string");
}

// Explicit legacy contracts keep the currently active demo isolated from v2.
export const legacyStarTypeIds = [
  "navigator",
  "explorer",
  "catalyst",
  "connector",
  "visionary",
] as const;

export type LegacyStarTypeId = (typeof legacyStarTypeIds)[number];

export const legacyStarEffects = ["flow", "shimmer", "spark", "orbit", "pulse"] as const;

export type LegacyStarEffect = (typeof legacyStarEffects)[number];
export type LegacyStarPalette = string[];

/** @deprecated Active v1 response alias. New v2 code should use `WingPalette`. */
export type StarPalette = LegacyStarPalette;

export interface StarprintType {
  id: string;
  name: string;
  tagline?: string;
  description: string;
}

/** Forward-compatible metadata contract; classification is implemented later. */
export interface StarprintTypeV2 {
  id: StarTypeId;
  name: string;
  tagline: string;
  description: string;
  coreTraits: TraitId[];
  effect: StarEffect;
}

export interface GenerateStarprintRequest {
  sessionId: string;
  baseColor: string;
}

export interface PublishStarprintRequest {
  sessionId: string;
  consentName?: boolean;
  consentPhoto?: boolean;
  physicalCardRequested?: boolean;
  mediaPermission?: boolean;
}

export interface StarprintResponse {
  id: string;
  sessionId: string;
  nickname: string;
  photoUrl: string | null;
  type: StarprintType;
  effect: LegacyStarEffect | StarEffect;
  palette: LegacyStarPalette | WingPalette;
  wingPalette?: WingPalette | null;
  baseColor: string;
  signatureColor?: string;
  publicStarId?: string | null;
  globalProfile7D?: GlobalHiddenProfile | null;
  isPublic: boolean;
  publishedToSky?: boolean;
  physicalCardRequested?: boolean;
  mediaPermission?: boolean;
  eventId?: string | null;
  eventEdition?: string | null;
}
