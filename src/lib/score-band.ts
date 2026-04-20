// Canonical score system for BrandMirror.
//
// Two things live in this file and nowhere else:
//   1. The 4-tier color-banded indicator system (FLATLINING / UNSTABLE /
//      STABLE / LEADING) that encodes a numeric score as a vital sign.
//   2. The 5-axis dimension model — positioningClarity, toneCoherence,
//      visualCredibility, offerSpecificity, conversionReadiness — with
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
    blurb: "Signal is weak. The page is losing trust before the offer lands.",
  },
  {
    key: "unstable",
    label: "UNSTABLE",
    color: "#E8B04C",
    lo: 40,
    hi: 70,
    blurb: "Signal fires in bursts. Trust builds and breaks within the same scroll.",
  },
  {
    key: "stable",
    label: "STABLE",
    color: "#6FE0C2",
    lo: 70,
    hi: 85,
    blurb: "Signal holds. The page earns attention, with room to tighten the ask.",
  },
  {
    key: "leading",
    label: "LEADING",
    color: "#2FDCA0",
    lo: 85,
    hi: 100,
    blurb: "Signal commands the room. The page converts before copy explains.",
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
  | "toneCoherence"
  | "visualCredibility"
  | "offerSpecificity"
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
    summary: "How quickly the offer becomes legible on the homepage.",
  },
  {
    key: "toneCoherence",
    label: "Tone coherence",
    shortLabel: "TONE",
    summary: "Whether the written voice supports the visual impression.",
  },
  {
    key: "visualCredibility",
    label: "Visual credibility",
    shortLabel: "VISUAL",
    summary: "Whether the design signals quality and category trust.",
  },
  {
    key: "offerSpecificity",
    label: "Offer specificity",
    shortLabel: "OFFER",
    summary: "How directly the page states what is sold and to whom.",
  },
  {
    key: "conversionReadiness",
    label: "Conversion readiness",
    shortLabel: "CONVERSION",
    summary: "Whether the page has earned a confident next step.",
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
