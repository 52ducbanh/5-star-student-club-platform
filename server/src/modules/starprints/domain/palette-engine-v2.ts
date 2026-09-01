/**
 * STARPRINT v2 OKLCH Wing Palette Engine.
 *
 * Generates a deterministic 5-color WingPalette from a base Signature Color + 5 stage Local Profiles.
 * One wing color per game stage (SOLVE, SENSE, SPRINT, SUPPORT, SYNC).
 *
 * Stage phases:
 *   SOLVE   = -0.12
 *   SENSE   = -0.06
 *   SPRINT  =  0
 *   SUPPORT = +0.06
 *   SYNC    = +0.12
 *
 * Formula:
 *   ΔHue       = projection * 220°
 *   ΔLightness = projection * 0.24
 *   ΔChroma    = projection * 0.16
 *
 * For COLOR TRANSFORM ONLY:
 *   unobserved trait → neutral 0.5 (does NOT change scoring semantics)
 *
 * Guards:
 *   - Lightness roughly 0.30–0.85
 *   - Gamut/chroma protection (sRGB [0, 1])
 *   - Similar-color guard: if ΔE_OK < 0.06 between adjacent wings, shift later hue +18° deterministically.
 *   - Achromatic Signature Color: wing colors add chroma deterministically so they remain vivid.
 */

import type { LocalTraitProfile, TraitId, WingPalette } from '@5ss/contracts';

const STAGE_PHASES = [-0.12, -0.06, 0, 0.06, 0.12] as const;

const TRAITS: TraitId[] = [
  'sharpness',
  'insight',
  'precision',
  'initiative',
  'connection',
  'adaptation',
  'persistence',
];

// ---------------------------------------------------------------------------
// sRGB ↔ Linear RGB conversion
// ---------------------------------------------------------------------------
function srgbToLinear(c: number): number {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ---------------------------------------------------------------------------
// Linear RGB ↔ OKLab
// ---------------------------------------------------------------------------
function linearRgbToOklab(
  r: number,
  g: number,
  b: number,
): { L: number; a: number; b_: number } {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b_: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToLinearRgb(
  L: number,
  a: number,
  b_: number,
): { r: number; g: number; b: number } {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b_;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

// ---------------------------------------------------------------------------
// OKLab ↔ OKLCH
// ---------------------------------------------------------------------------
function oklabToOklch(
  L: number,
  a: number,
  b_: number,
): { L: number; C: number; H: number } {
  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToOklab(
  L: number,
  C: number,
  H: number,
): { L: number; a: number; b_: number } {
  const hRad = (H * Math.PI) / 180;
  return { L, a: C * Math.cos(hRad), b_: C * Math.sin(hRad) };
}

// ---------------------------------------------------------------------------
// Delta E in OKLab
// ---------------------------------------------------------------------------
function deltaE_OK(
  lab1: { L: number; a: number; b_: number },
  lab2: { L: number; a: number; b_: number },
): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b_ - lab2.b_;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// ---------------------------------------------------------------------------
// Hex utilities
// ---------------------------------------------------------------------------
function hexToRgb01(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) =>
    Math.round(Math.max(0, Math.min(255, c * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates stage projection scalar from LocalTraitProfile and stage phase.
 * Unobserved trait values (null) are treated as neutral 0.5 for color transform.
 */
function calculateStageProjection(
  stageIndex: number,
  profile?: LocalTraitProfile | null,
): number {
  const phase = STAGE_PHASES[stageIndex];
  if (!profile) return phase;

  let sum = 0;
  for (const trait of TRAITS) {
    const rawVal = profile[trait];
    // Unobserved trait -> neutral 0.5
    const val = rawVal === null ? 0.5 : rawVal;
    sum += val - 0.5; // Deviation from neutral [-0.5, 0.5]
  }

  // Mean trait deviation + stage phase
  const meanDeviation = sum / TRAITS.length;
  return meanDeviation + phase;
}

/**
 * Generates the deterministic 5-wing OKLCH palette.
 */
export function generateOklchWingPalette(
  signatureColorHex: string,
  localProfiles?: Array<LocalTraitProfile | null>,
): WingPalette {
  const rgb01 = hexToRgb01(signatureColorHex);
  if (!rgb01) {
    const fallback = '#ffd467';
    return [fallback, fallback, fallback, fallback, fallback] as unknown as WingPalette;
  }

  const linearRgb = {
    r: srgbToLinear(rgb01.r),
    g: srgbToLinear(rgb01.g),
    b: srgbToLinear(rgb01.b),
  };
  const baseOklab = linearRgbToOklab(linearRgb.r, linearRgb.g, linearRgb.b);
  const baseOklch = oklabToOklch(baseOklab.L, baseOklab.a, baseOklab.b_);

  // Achromatic fallback: if chroma is nearly 0, provide a rich cosmic hue & chroma
  const isAchromatic = baseOklch.C < 0.005;
  const baseHue = isAchromatic ? 210 : baseOklch.H;
  const baseChroma = isAchromatic ? 0.12 : Math.max(0.06, baseOklch.C);
  const baseLightness = Math.max(0.35, Math.min(0.80, baseOklch.L));

  const generatedOklabs: Array<{ L: number; a: number; b_: number }> = [];
  const wingHexColors: string[] = [];

  for (let stageIdx = 0; stageIdx < 5; stageIdx++) {
    const profile = localProfiles ? localProfiles[stageIdx] : null;
    const projection = calculateStageProjection(stageIdx, profile);

    // Apply official formula:
    // ΔHue = projection * 220°
    // ΔLightness = projection * 0.24
    // ΔChroma = projection * 0.16
    let wingHue = ((baseHue + projection * 220) % 360 + 360) % 360;
    let wingLightness = Math.max(0.30, Math.min(0.85, baseLightness + projection * 0.24));
    let wingChroma = Math.max(0.05, Math.min(0.32, baseChroma + projection * 0.16));

    let oklab = oklchToOklab(wingLightness, wingChroma, wingHue);

    // Similar-color guard: if ΔE_OK < 0.06 with previous wing, shift +18° deterministically
    if (generatedOklabs.length > 0) {
      let retries = 0;
      while (retries < 10) {
        const prevOklab = generatedOklabs[generatedOklabs.length - 1];
        const de = deltaE_OK(oklab, prevOklab);
        if (de >= 0.06) break;
        // Shift later color hue +18°
        wingHue = (wingHue + 18) % 360;
        oklab = oklchToOklab(wingLightness, wingChroma, wingHue);
        retries++;
      }
    }

    generatedOklabs.push(oklab);

    // Convert to sRGB and clamp
    const linear = oklabToLinearRgb(oklab.L, oklab.a, oklab.b_);
    const r = linearToSrgb(linear.r);
    const g = linearToSrgb(linear.g);
    const b = linearToSrgb(linear.b);

    wingHexColors.push(rgbToHex(r, g, b));
  }

  return wingHexColors as unknown as WingPalette;
}

/**
 * Facade function used by starprints service.
 */
export function computeWingPalette(
  signatureColorHex: string,
  localProfiles?: Array<LocalTraitProfile | null>,
): WingPalette {
  return generateOklchWingPalette(signatureColorHex, localProfiles);
}
