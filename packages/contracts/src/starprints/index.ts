export type StarEffect = "flow" | "shimmer" | "spark" | "orbit" | "pulse";

export type StarPalette = string[];

export interface StarprintType {
  id: string;
  name: string;
  description: string;
}

export interface GenerateStarprintRequest {
  sessionId: string;
  baseColor: string;
}

export interface PublishStarprintRequest {
  consentName: boolean;
  consentPhoto: boolean;
}

export interface StarprintResponse {
  id: string;
  sessionId: string;
  nickname: string;
  photoUrl: string | null;
  type: StarprintType;
  effect: StarEffect;
  palette: StarPalette;
  baseColor: string;
  isPublic: boolean;
}
