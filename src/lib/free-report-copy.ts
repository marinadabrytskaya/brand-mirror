import { type BrandReadResult } from "@/lib/brand-read";
import { bandFor, DIMENSIONS, type DimensionKey } from "@/lib/score-band";

type RankedDimension = {
  key: DimensionKey;
  label: string;
  shortLabel: string;
  value: number;
};

function cleanSentence(value: unknown, fallback = "") {
  const text = typeof value === "string" ? value.trim() : fallback;
  return text.replace(/\s+/g, " ").replace(/[.?!]+$/, "");
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function lowerFirst(value: string) {
  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

export function rankedDimensions(result: BrandReadResult): RankedDimension[] {
  return DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    shortLabel: dimension.shortLabel,
    value: safeNumber(result[dimension.key]),
  })).sort((a, b) => a.value - b.value);
}

export function scoreConsequence(key: DimensionKey, score: number) {
  const band = bandFor(score);
  if (key === "toneCoherence") {
    if (score < 70) return "Below the threshold where AI tools can confidently find, describe, and recommend the brand.";
    if (score < 85) return "AI can read the brand, but still needs cleaner category language and proof signals.";
    return "AI-readable signals are strong enough to support discovery and recommendation.";
  }
  if (key === "offerSpecificity") {
    if (score < 70) return "Buyers still have to work too hard to repeat what is sold and why it matters.";
    if (score < 85) return "The offer is understandable, but the sharpest commercial reason to choose it can land faster.";
    return "The offer is specific enough for buyers to repeat without a sales call.";
  }
  if (key === "conversionReadiness") {
    if (score < 70) return "Interest is present, but the page has not made the next step obvious or safe enough.";
    if (score < 85) return "The path to action exists, but proof and CTA order can still reduce hesitation.";
    return "The page gives interested buyers a clear route to act.";
  }
  if (key === "visualCredibility") {
    if (score < 70) return "The visual layer is not earning enough trust before the buyer evaluates the offer.";
    if (score < 85) return "The brand looks credible, with room to make hierarchy and proof work harder.";
    return "The visual system is already creating trust before the copy has to defend it.";
  }
  if (score < 70) return "The category and difference are still not legible fast enough for a cold buyer.";
  if (score < 85) return "The positioning is clear, but not yet differentiated enough to create preference.";
  return band.key === "leading"
    ? "The positioning is sharp enough to sell before the page explains."
    : "The positioning is clear enough to build trust and sharpen.";
}

export function buildScopeLine(scanLabel: string) {
  return `Scan conducted: ${scanLabel} | Scope: homepage copy, AI visibility, visual hierarchy, offer clarity, conversion path.`;
}

export function buildBrandReadParagraphs(result: BrandReadResult) {
  const brand = cleanSentence(result.brandName, "This brand");
  const strongest = cleanSentence(
    result.strongestSignal || result.strength,
    "There is already a real signal worth keeping",
  );
  const friction = cleanSentence(
    result.mainFriction || result.gap,
    "The page still makes the buyer work too hard before the offer becomes clear",
  );
  const weakest = rankedDimensions(result)[0];
  const consequence = scoreConsequence(weakest.key, weakest.value);
  const buyerCost =
    weakest.key === "toneCoherence"
      ? "AI-assisted discovery becomes easier for cleaner competitors than for this brand"
      : weakest.key === "offerSpecificity"
        ? "good buyers have to infer the offer before they can want it"
        : weakest.key === "conversionReadiness"
          ? "interested visitors can leave before the next step feels safe enough"
          : weakest.key === "visualCredibility"
            ? "the page asks the copy to defend trust the visual layer should already be earning"
            : "buyers can understand the category before they understand the difference";

  return [
    `${brand} has a real advantage: ${strongest}. That signal can create commercial weight when a cold buyer can repeat it quickly.`,
    `But the page does not yet make the buying reason unmistakable. ${friction}. The brand is creating interest before it has fully earned certainty.`,
    `At a ${weakest.label} score of ${weakest.value}, this is not a cosmetic issue. ${consequence} In practical terms, ${buyerCost}.`,
  ];
}

export function buildExpandedSignal(result: BrandReadResult, kind: "strongest" | "friction") {
  const brand = cleanSentence(result.brandName, "This brand");
  const strongest = cleanSentence(
    result.strongestSignal || result.strength,
    "The brand already has a signal worth protecting",
  );
  const friction = cleanSentence(
    result.mainFriction || result.gap,
    "The page still makes the buyer work too hard before the offer becomes clear",
  );

  if (kind === "strongest") {
    return [
      `${brand}'s strongest commercial asset is already visible: ${strongest}.`,
      "That matters because most brands in a category sound interchangeable until they name what they can do differently.",
      "The full report turns this into the KEEP layer, so the fixes sharpen the signal instead of flattening what is already earning trust.",
    ].join("\n\n");
  }

  const weakest = rankedDimensions(result)[0];
  const consequence = lowerFirst(scoreConsequence(weakest.key, weakest.value));
  return [
    `The main friction is not a small copy problem. ${friction}.`,
    `That matters because ${consequence}`,
    "The full report names the exact first correction, where it belongs, and what should happen after it lands.",
  ].join("\n\n");
}

export function buildNextMoveCliffhanger(result: BrandReadResult) {
  const weakestKeys = rankedDimensions(result).slice(0, 2).map((item) => item.key);
  const hasAI = weakestKeys.includes("toneCoherence");
  const hasOffer = weakestKeys.includes("offerSpecificity");
  const hasConversion = weakestKeys.includes("conversionReadiness");
  const hasVisual = weakestKeys.includes("visualCredibility");

  let reframe = "make the offer unmistakable before the page asks for trust";
  if (hasAI && hasOffer) {
    reframe = "name the offer in language both buyers and AI tools can repeat";
  } else if (hasOffer && hasConversion) {
    reframe = "turn the vague next step into a specific buying action";
  } else if (hasAI) {
    reframe = "make the brand easier for AI systems to classify, cite, and recommend";
  } else if (hasConversion) {
    reframe = "make the route to book, buy, enquire, or register feel obvious";
  } else if (hasVisual) {
    reframe = "move proof and hierarchy into the places where trust is currently leaking";
  }

  return [
    "The problem is not the product. It is the announcement.",
    `The first move is a single reframe: ${reframe}. It does not require a rebrand. It requires the right sentence in the right place.`,
    "The exact sentence, where to place it, how to carry it into the homepage and AI-readable assets, and what competitors are making easier to understand is inside the Full Report.",
  ];
}

export const fullReportIncludes = [
  "Fix Now: the highest-impact blocker, named and solved.",
  "Fix Next: the secondary priority with implementation steps.",
  "Keep: what is already earning trust and should not be flattened.",
  "3 named competitors: where they are easier to find, explain, or choose.",
  "AI Visibility audit: what AI tools cannot understand yet and how to break the next threshold.",
  "Commercial impact estimate: what can change after the fixes land.",
  "One-page brand brief: sharper headline, support line, and CTA direction.",
  "16-page shareable PDF with competitor intelligence and implementation playbook.",
];

export const refundLine =
  "If the full report does not surface at least 3 things you can action this week, reply and we will refund it.";
