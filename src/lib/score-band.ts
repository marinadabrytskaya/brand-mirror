// Canonical score system for BrandMirror.
//
// Two things live in this file and nowhere else:
//   1. The 4-tier color-banded indicator system (FLATLINING / UNSTABLE /
//      STABLE / LEADING) that encodes a numeric score as a vital sign.
//   2. The 5-axis dimension model — positioningClarity, offerSpecificity,
//      toneCoherence (used as AI discoverability), visualCredibility,
//      conversionReadiness — with
//      canonical labels and rendering order.
//
// Every surface (first-read, full-report, PDF generator) imports from here
// so the vocabulary cannot drift across the product.

// ---------------------------------------------------------------------------
// Bands
// ---------------------------------------------------------------------------

export type BandKey = "flatlining" | "unstable" | "stable" | "leading";

export type Band = {
  readonly key: BandKey;
  readonly label: "FLATLINING" | "UNSTABLE" | "STABLE" | "LEADING";
  readonly color: string;
  readonly lo: number;
  readonly hi: number;
  readonly blurb: string;
};

export const BANDS: readonly Band[] = [
  {
    key: "flatlining",
    label: "FLATLINING",
    color: "#F2495C",
    lo: 0,
    hi: 40,
    blurb: "Something is wrong. People leave before they understand what you sell.",
  },
  {
    key: "unstable",
    label: "UNSTABLE",
    color: "#E8B04C",
    lo: 40,
    hi: 70,
    blurb: "It works in bursts. The site wins people over, then loses them again.",
  },
  {
    key: "stable",
    label: "STABLE",
    color: "#6FE0C2",
    lo: 70,
    hi: 85,
    blurb: "It works. The page holds attention — there is just room to push harder.",
  },
  {
    key: "leading",
    label: "LEADING",
    color: "#2FDCA0",
    lo: 85,
    hi: 100,
    blurb: "It sells. The page does the hard work before the copy has to explain.",
  },
] as const;

// Intervals are closed on the low side, open on the high side, except the top
// band which is closed on both sides.
export function bandFor(score: number): Band {
  if (!Number.isFinite(score)) return BANDS[0];
  if (score < 40) return BANDS[0];
  if (score < 70) return BANDS[1];
  if (score < 85) return BANDS[2];
  return BANDS[3];
}

export function scoreBandLabel(score: number): Band["label"] {
  return bandFor(score).label;
}

export function bandModifier(score: number): string {
  const band = bandFor(score);
  switch (band.key) {
    case "flatlining":
      return "The signal is not landing. The page is losing the buyer before the offer gets a chance.";
    case "unstable":
      return "The signal fires in bursts. Trust builds and then breaks within the same scroll.";
    case "stable":
      return "The signal holds. The page earns attention, but still has room to tighten the ask.";
    case "leading":
      return "The signal commands the room. The page converts before the copy has to explain itself.";
  }
}

// ---------------------------------------------------------------------------
// 5-axis dimension model
// ---------------------------------------------------------------------------

export type DimensionKey =
  | "positioningClarity"
  | "offerSpecificity"
  | "toneCoherence"
  | "visualCredibility"
  | "conversionReadiness";

export type Dimension = {
  readonly key: DimensionKey;
  readonly label: string;          // PDF + full-report human label
  readonly shortLabel: string;     // compact label for first-read sub-scores
  readonly summary: string;        // one-line description of what this axis measures
};

// The ORDER of this array is canonical — this is the order in which sub-scores
// appear everywhere: first-read score-breakdown, full-report dashboard, PDF.
export const DIMENSIONS: readonly Dimension[] = [
  {
    key: "positioningClarity",
    label: "Positioning clarity",
    shortLabel: "POSITIONING",
    summary: "Can a first-time visitor say what you do in ten seconds?",
  },
  {
    key: "offerSpecificity",
    label: "Offer specificity",
    shortLabel: "OFFER",
    summary: "Is it obvious what you sell, to whom, and why it matters?",
  },
  {
    key: "toneCoherence",
    label: "AI discoverability",
    shortLabel: "AI DISCOVERY",
    summary: "Could AI confidently discover and recommend this business?",
  },
  {
    key: "visualCredibility",
    label: "Visual credibility",
    shortLabel: "VISUAL",
    summary: "Does the design look like it deserves the price you charge?",
  },
  {
    key: "conversionReadiness",
    label: "Conversion readiness",
    shortLabel: "CONVERSION",
    summary: "When a buyer is ready, is there a clear next step for them?",
  },
] as const;

// Overall readiness — average of all five dimensions, rounded to integer.
// Kept as a function instead of inline arithmetic so anyone changing the
// weighting policy (flat mean vs. worst-link-sensitive) changes it here.
export function computeOverallScore(scores: Record<DimensionKey, number>): number {
  const values = DIMENSIONS.map((d) => scores[d.key] ?? 0);
  const sum = values.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
  return Math.round(sum / values.length);
}
