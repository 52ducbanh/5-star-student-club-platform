/**
 * Central version catalogue for the incremental STARPRINT migration.
 *
 * `legacyV1` identifies the currently active provisional 5D flow.
 * `officialV2` reserves the identifiers used by the approved 7D model. The
 * presence of a v2 identifier does not mean every v2 subsystem is active yet.
 */
export const STARPRINT_VERSIONS = {
  legacyV1: {
    rawPayload: "starprint-raw-legacy-v1",
    content: "starprint-content-legacy-v1",
    scoring: "starprint-scoring-legacy-5d-v1",
    profileModel: "starprint-profile-legacy-5d-v1",
    paletteAlgorithm: "starprint-palette-legacy-hsl-v1",
  },
  officialV2: {
    rawPayload: "starprint-raw-v2",
    content: "starprint-content-v2",
    scoring: "starprint-scoring-7d-v2",
    profileModel: "starprint-profile-7d-v2",
    paletteAlgorithm: "starprint-palette-oklch-v2",
  },
} as const;

/**
 * Existing rows and requests predate version fields. During the incremental
 * migration, an absent payload version is always routed to legacy v1 and must
 * never be inferred as official v2 from payload shape alone.
 */
export const STARPRINT_UNVERSIONED_PAYLOAD_FAMILY = "legacyV1" as const;

export type StarprintVersionFamily = keyof typeof STARPRINT_VERSIONS;
export type StarprintVersionSet = (typeof STARPRINT_VERSIONS)[StarprintVersionFamily];
export type RawPayloadVersion = StarprintVersionSet["rawPayload"];
export type ContentVersion = StarprintVersionSet["content"];
export type ScoringVersion = StarprintVersionSet["scoring"];
export type ProfileModelVersion = StarprintVersionSet["profileModel"];
export type PaletteAlgorithmVersion = StarprintVersionSet["paletteAlgorithm"];
