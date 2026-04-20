// Canonical score-band system for BrandMirror.
//
// A score (0-100) maps to one of four bands. The band has a colour, a verdict
// label, and a pair of threshold bounds. The colour reads as a vital sign — how
// alive the brand signal is — not as a single traffic-light red.
//
// This module is the single source of truth. First-read, full-report, and the
// PDF generator all import from here so the vocabulary cannot drift.

export type BandKey = "flatlining" | "unstable" | "stable" | "leading";

export type Band = {
  readonly key: BandKey;
  readonly label: "FLATLINING" | "UNSTABLE" | "STABLE" | "LEADING";
  readonly color: string;
  readonly lo: number;
  readonly hi: number;
};

export const BANDS: readonly Band[] = [
  { key: "flatlining", label: "FLATLINING", color: "#F2495C", lo: 0, hi: 40 },
  { key: "unstable", label: "UNSTABLE", color: "#E8B04C", lo: 40, hi: 70 },
  { key: "stable", label: "STABLE", color: "#6FE0C2", lo: 70, hi: 85 },
  { key: "leading", label: "LEADING", color: "#2FDCA0", lo: 85, hi: 100 },
] as const;

// Intervals are closed on the low side, open on the high side, except the top
// band which is closed on both sides. This guarantees every integer 0-100 maps
// to exactly one band.
export function bandFor(score: number): Band {
  if (!Number.isFinite(score)) return BANDS[0];
  if (score < 40) return BANDS[0];
  if (score < 70) return BANDS[1];
  if (score < 85) return BANDS[2];
  return BANDS[3];
}

// Human-facing verdict string for a score. Returned value is suitable for
// rendering directly — ALL CAPS, no punctuation. This is what `scoreBand`
// holds in BrandReadResult and BrandReport from now on.
export function scoreBandLabel(score: number): Band["label"] {
  return bandFor(score).label;
}

// Narrative modifier that pairs with a band. Used downstream for poster copy
// and any place that wants a one-line commercial implication of the band.
// Kept minimal on purpose — the heavy copy still comes from the model.
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
