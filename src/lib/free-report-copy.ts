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

function brandSubject(result: BrandReadResult) {
  return cleanSentence(result.brandName, "This brand");
}

function buyerCostFor(key: DimensionKey) {
  if (key === "toneCoherence") {
    return "AI-assisted discovery becomes easier for cleaner competitors than for this brand";
  }
  if (key === "offerSpecificity") {
    return "good buyers have to infer the offer before they can want it";
  }
  if (key === "conversionReadiness") {
    return "interested visitors can leave before the next step feels safe enough";
  }
  if (key === "visualCredibility") {
    return "the page asks the copy to defend trust the visual layer should already be earning";
  }
  return "buyers can understand the category before they understand the difference";
}

function strengthLead(key: DimensionKey, brand: string, strongest: string) {
  if (key === "visualCredibility") {
    return `${brand} already creates a visual expectation: ${strongest}. That matters because the first impression is doing some trust work before the copy begins.`;
  }
  if (key === "toneCoherence") {
    return `${brand} is easiest to understand where the language becomes concrete: ${strongest}. That is the material AI systems and buyers can start to repeat.`;
  }
  if (key === "offerSpecificity") {
    return `${brand} has an offer signal worth naming: ${strongest}. When that signal becomes explicit, the brand stops sounding like the category and starts sounding like a choice.`;
  }
  if (key === "conversionReadiness") {
    return `${brand} already gives interested buyers a route forward: ${strongest}. The opportunity is to make that route feel safer and more obvious.`;
  }
  return `${brand} is not starting from zero. ${strongest}. The useful work now is to make that difference easier to recognize in one read.`;
}

function frictionLead(key: DimensionKey, friction: string) {
  if (key === "toneCoherence") {
    return `The weak point is the AI-readable layer. ${friction}. If category nouns, metadata, schema, and proof language stay too soft, external systems struggle to repeat the brand confidently.`;
  }
  if (key === "offerSpecificity") {
    return `The weak point is naming. ${friction}. Buyers should not have to translate atmosphere or category language into a concrete thing they can buy.`;
  }
  if (key === "conversionReadiness") {
    return `The weak point is the decision path. ${friction}. A page can create interest and still lose the click if the next action feels vague, early, or unsupported.`;
  }
  if (key === "visualCredibility") {
    return `The weak point is trust speed. ${friction}. The visual layer needs to prove the promise before the buyer starts comparing alternatives.`;
  }
  return `The weak point is category ownership. ${friction}. A cold buyer needs to see the difference before the brand asks for attention.`;
}

export function buildLiveScanTagline(result: Pick<BrandReadResult, DimensionKey | "tagline" | "mainFriction" | "gap">) {
  const ranked = DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    value: safeNumber(result[dimension.key]),
  })).sort((a, b) => a.value - b.value);

  const weakest = ranked[0]?.key;
  const second = ranked[1]?.key;

  if (weakest === "toneCoherence" && second === "offerSpecificity") {
    return "AI can find fragments. The offer still needs language it can repeat.";
  }
  if (weakest === "offerSpecificity" && second === "toneCoherence") {
    return "The buyer senses value. AI still cannot name the offer cleanly.";
  }
  if (weakest === "offerSpecificity" && second === "conversionReadiness") {
    return "The offer lands late, so the next step asks for trust too early.";
  }
  if (weakest === "conversionReadiness" && second === "offerSpecificity") {
    return "Interest is present. The page has not made the decision feel safe.";
  }
  if (weakest === "visualCredibility" && second === "conversionReadiness") {
    return "The page asks for action before the visual proof has done enough work.";
  }
  if (weakest === "visualCredibility") {
    return "The promise is visible, but the visual proof is not carrying enough trust.";
  }
  if (weakest === "toneCoherence") {
    return "The brand exists, but AI still needs cleaner signals to recommend it.";
  }
  if (weakest === "offerSpecificity") {
    return "The value is there. The exact offer is still too hard to repeat.";
  }
  if (weakest === "conversionReadiness") {
    return "The page creates interest before the next step feels earned.";
  }
  if (weakest === "positioningClarity") {
    return "The category is visible. The difference still needs to arrive faster.";
  }

  return result.tagline || "The signal is present. The page is still making buyers work.";
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

export function buildScopeLine(scanLabel: string, locale: "en" | "es" | "ru" = "en") {
  if (locale === "es") {
    return `Análisis realizado: ${scanLabel} | Alcance: texto de la página principal, visibilidad en IA, jerarquía visual, claridad de la oferta y camino de conversión.`;
  }

  if (locale === "ru") {
    return `Скан проведён: ${scanLabel} | Охват: текст главной страницы, видимость в ИИ, визуальная иерархия, ясность предложения и путь к действию.`;
  }

  return `Scan conducted: ${scanLabel} | Scope: homepage copy, AI visibility, visual hierarchy, offer clarity, conversion path.`;
}

export function buildBrandReadParagraphs(result: BrandReadResult) {
  const brand = brandSubject(result);
  const strongest = cleanSentence(
    result.strongestSignal || result.strength,
    "There is already a real signal worth keeping",
  );
  const friction = cleanSentence(
    result.mainFriction || result.gap,
    "The page still makes the buyer work too hard before the offer becomes clear",
  );
  const ranked = rankedDimensions(result);
  const weakest = ranked[0];
  const strongestAxis = ranked[ranked.length - 1]?.key ?? "positioningClarity";
  const consequence = scoreConsequence(weakest.key, weakest.value);

  return [
    strengthLead(strongestAxis, brand, strongest),
    frictionLead(weakest.key, friction),
    `At a ${weakest.label} score of ${weakest.value}, this is not a cosmetic issue. ${consequence} In practical terms, ${buyerCostFor(weakest.key)}.`,
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
    const ranked = rankedDimensions(result);
    const strongestAxis = ranked[ranked.length - 1]?.key ?? "positioningClarity";
    const axisContext =
      strongestAxis === "visualCredibility"
        ? "because visual confidence is already creating a reason to stay"
        : strongestAxis === "toneCoherence"
          ? "because repeatable language is already giving AI systems something to hold"
          : strongestAxis === "offerSpecificity"
            ? "because the offer has material that can become more ownable"
            : strongestAxis === "conversionReadiness"
              ? "because the path forward already exists and can be sharpened"
              : "because the category signal is already visible enough to build on";

    return [
      `${brand}'s strongest signal is not generic polish. It is this: ${strongest}.`,
      `That matters ${axisContext}. Most brands in a category sound interchangeable until the strongest signal is protected and named.`,
      "The full report turns this into the KEEP layer, so the fixes sharpen the signal instead of flattening what is already earning trust.",
    ].join("\n\n");
  }

  const weakest = rankedDimensions(result)[0];
  const consequence = lowerFirst(scoreConsequence(weakest.key, weakest.value));
  return [
    frictionLead(weakest.key, friction),
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
  "\u2726 3 actionable findings this week — or a full refund. No questions asked.";
