// @ts-nocheck
import * as cheerio from "cheerio";
import { type SiteLocale } from "@/lib/site-i18n";
import { translateTexts } from "@/lib/text-translate";
import { scoreBandLabel, bandModifier } from "@/lib/score-band";

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const VISUAL_WORLDS = [
  "ruler",
  "sage",
  "magician",
  "creator",
  "lover",
  "caregiver",
  "hero",
  "rebel",
  "explorer",
  "everyman",
  "innocent",
  "jester",
] as const;

export type VisualWorld = (typeof VISUAL_WORLDS)[number];
export type ReadSymbol = "strategy" | "story" | "spectacle";

export type IndustryArchetypeHint = {
  world: VisualWorld;
  confidence: number;
  label: string;
};

export type WebsiteContext = {
  title: string;
  ogTitle: string;
  description: string;
  headings: string[];
  callsToAction: string[];
  visibleText: string;
  ogImage: string;
  icon: string;
};

export type BrandReadResult = {
  brandName: string;
  visualWorld: VisualWorld;
  symbol: ReadSymbol;
  title: string;
  genre: string;
  tagline: string;
  posterScore: number;
  scoreBand: string;
  scoreModifier: string;
  whatItDoes: string;
  summary: string;
  current: string;
  strength: string;
  gap: string;
  mismatch: string;
  voice: string;
  direction: string;
  amplify: string;
  drop: string;
  clarityScore: number;
  premiumScore: number;
  cohesionScore: number;
  strongestSignal: string;
  mainFriction: string;
  nextMove: string;
};

const LANGUAGE_NAMES: Record<SiteLocale, string> = {
  en: "English",
  es: "Spanish",
  ru: "Russian",
};

type VisualHints = {
  suggestedWorld: VisualWorld;
  adjacentWorld: VisualWorld;
  confidence: number;
  topSignals: Array<[string, number]>;
  industryHint: IndustryArchetypeHint;
};

type CategoryLens =
  | "kids"
  | "wellness"
  | "luxury"
  | "strategy"
  | "retail"
  | "events"
  | "performance"
  | "outdoors"
  | "default";

type RawBrandReadResult = Partial<BrandReadResult> & {
  visualWorld?: string;
  symbol?: string;
};

type TensionType =
  | "visibility gap"
  | "clarity gap"
  | "credibility gap"
  | "courage gap";

const SAMPLE_READS: BrandReadResult[] = [
  {
    brandName: "Your Brand",
    visualWorld: "sage",
    symbol: "strategy",
    title: "The Clearer Signal",
    genre: "Intellectual Mystery",
    tagline: "The brand looks strong. The promise needs sharper edges.",
    posterScore: 75,
    scoreBand: "STABLE",
    scoreModifier:
      "The audience can feel the quality. They still cannot say why the offer matters now.",
    whatItDoes:
      "This brand appears to offer a premium service with a strong visual point of view, aimed at buyers looking for clarity, quality, and trust.",
    summary:
      "The brand already feels considered, premium, and intelligent. The message still makes the buyer work a little too hard to understand exactly what is being offered.",
    current:
      "Right now, the brand signals confidence, aesthetic maturity, and good taste. The visual system makes a strong impression quickly. The commercial promise is less immediate. That gap slows trust for buyers who need clarity before they commit.",
    strength:
      "The strongest part is the overall sense of control. Typography, composition, and pacing suggest that the brand knows what it is doing. The experience feels curated rather than improvised.",
    gap:
      "What is missing is a faster expression of value. The site creates an atmosphere before it creates certainty. That makes the brand feel elevated, but slightly withheld.",
    mismatch:
      "The visual layer says premium and assured. The written layer occasionally sounds softer, broader, or more careful than the design implies. That creates a mild internal mismatch.",
    voice:
      "The tone is calm and polished. It now needs more decisiveness, more specificity, and less protective language if it wants to convert with the same force as the visuals.",
    direction:
      "Lead with the main promise earlier. Let the elegance remain, but make the value unmistakable in the first screen. The buyer should understand the offer before they admire the atmosphere.",
    amplify:
      "Amplify the restraint, the visual discipline, and the premium pacing. Those are already working in the brand's favor and should remain central.",
    drop:
      "Drop any copy that sounds decorative but vague. If a line contributes mood without adding meaning, it weakens the commercial read.",
    clarityScore: 72,
    premiumScore: 88,
    cohesionScore: 64,
    strongestSignal:
      "The brand already looks controlled, premium, and visually intentional.",
    mainFriction:
      "The first screen delays clarity around the actual offer and outcome.",
    nextMove:
      "Rewrite the opening promise so the value lands before the atmosphere fully takes over.",
  },
  {
    brandName: "Your Brand",
    visualWorld: "creator",
    symbol: "story",
    title: "Between the Lines",
    genre: "Auteur Art House",
    tagline: "The personality is there. The meaning wants firmer structure.",
    posterScore: 71,
    scoreBand: "STABLE",
    scoreModifier:
      "The point of view is clear. The commercial through-line still asks the audience to do extra work.",
    whatItDoes:
      "This brand appears to sell a creative or strategic offer built around taste, perspective, and a more authored way of working.",
    summary:
      "The brand has mood, personality, and a point of view. It needs a clearer line of meaning so the visitor understands not only the tone, but the actual offer.",
    current:
      "The current signal feels expressive, layered, and creatively self-aware. The visual world is memorable. The copy sometimes trails behind the confidence of the presentation. That creates beauty without enough immediate utility.",
    strength:
      "The strongest part is the emotional atmosphere. There is already identity here, and the visitor can feel that quickly. The brand does not look generic.",
    gap:
      "The missing piece is commercial precision. The viewer gets mood before message, and style before structure. That does not ruin trust, but it can delay action.",
    mismatch:
      "Some parts of the brand feel bold and authored. Others still sound cautious or overly broad. The result is a brand that looks distinctive but sometimes speaks too softly.",
    voice:
      "The tone has charm and texture. It needs more directness and clearer claims if it wants to feel as strong verbally as it does visually.",
    direction:
      "Keep the texture, but tighten the logic. Every major section should say what it does, who it is for, and why it matters without losing the brand's personality.",
    amplify:
      "Amplify the personality, the texture, and the authored feel. Those are the signals that make the brand memorable rather than interchangeable.",
    drop:
      "Drop copy that lingers in suggestion without commitment. If it sounds lovely but leaves the reader guessing, it is not earning its place.",
    clarityScore: 66,
    premiumScore: 79,
    cohesionScore: 68,
    strongestSignal:
      "The brand has a clear point of view and does not feel generic.",
    mainFriction:
      "The mood leads more clearly than the offer, which softens action.",
    nextMove:
      "Sharpen the top-line message so the visitor understands the value as fast as they feel the style.",
  },
  {
    brandName: "Your Brand",
    visualWorld: "lover",
    symbol: "spectacle",
    title: "The Soft Authority",
    genre: "Intimate Romance Drama",
    tagline: "The brand feels desirable. It now needs firmer commercial posture.",
    posterScore: 74,
    scoreBand: "STABLE",
    scoreModifier:
      "The mood is doing its job. The page still withholds the practical reason to say yes.",
    whatItDoes:
      "This brand appears to sell a refined, emotionally led offer where desirability matters as much as functional trust.",
    summary:
      "The brand carries beauty, intimacy, and polish very well. The message needs to become a little more exact so trust turns into action more easily.",
    current:
      "The current signal feels elevated, sensual, and carefully considered. There is obvious aesthetic intelligence here. The challenge is that the softer mood sometimes overtakes the harder value proposition. That can make the brand feel compelling, but not fully decisive.",
    strength:
      "The strongest part is desirability. The visual language draws attention naturally and creates an emotional response without forcing it.",
    gap:
      "The missing layer is stronger verbal certainty. The visitor should not have to infer the benefit from the atmosphere alone. Some of the clarity still sits one beat too far back.",
    mismatch:
      "The design suggests assurance and selectiveness. Parts of the message sound more tentative or generalized than that visual system deserves.",
    voice:
      "The tone is elegant and composed. It now needs a slightly firmer spine so it sounds as intentional as the aesthetic direction already looks.",
    direction:
      "Preserve the desirability and make the language more decisive. State the offer more directly, then let the visual world deepen the feeling rather than carry the entire burden.",
    amplify:
      "Amplify the emotional pull, the polish, and the sense of selectiveness. Those are the parts people will remember quickly.",
    drop:
      "Drop filler language and any sentence that softens the promise unnecessarily. If it reduces certainty, it reduces value.",
    clarityScore: 69,
    premiumScore: 91,
    cohesionScore: 61,
    strongestSignal:
      "The brand already feels desirable, composed, and visually premium.",
    mainFriction:
      "The message is softer than the aesthetic and does not claim value quickly enough.",
    nextMove:
      "Keep the elegance, but harden the first promise so the visitor knows why this brand matters immediately.",
  },
];

export function normalizeWhitespace(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeUrl(input?: string | null) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return null;
    }
  }
}

function truncate(value: string, maxLength: number) {
  if (!value) return "";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function pickSampleTemplate(value: string) {
  const normalized = value.trim().toLowerCase();
  let score = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    score += normalized.charCodeAt(index);
  }

  return SAMPLE_READS[score % SAMPLE_READS.length];
}

function pickSampleForWorld(world: VisualWorld) {
  return SAMPLE_READS.find((item) => item.visualWorld === world) || SAMPLE_READS[0];
}

function extractBrandName(url: string, websiteContext?: WebsiteContext) {
  const contextCandidates = [
    websiteContext?.ogTitle,
    websiteContext?.title,
    websiteContext?.description,
  ].filter(Boolean) as string[];

  for (const candidate of contextCandidates) {
    let cleaned = normalizeWhitespace(candidate)
      .replace(/\s*\|.*$/, "")
      .replace(/\s*[-–—].*$/, "")
      .replace(/\s*:\s.*$/, "")
      .trim();

    const sentenceParts = cleaned.split(". ").map((part) => part.trim()).filter(Boolean);
    if (sentenceParts.length > 1 && sentenceParts[0] && sentenceParts[0].length <= 18) {
      cleaned = sentenceParts[0];
    }

    if (cleaned && cleaned.length <= 42) {
      return cleaned;
    }
  }

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const root = hostname.split(".")[0] || "Your Brand";
    return root
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "Your Brand";
  }
}

function buildWhatItDoes(brandName: string, websiteContext: WebsiteContext) {
  const description = normalizeWhitespace(websiteContext.description || "");
  const title = normalizeWhitespace(websiteContext.title || "");
  const heading = normalizeWhitespace(websiteContext.headings[0] || "");

  const cleanedDescription = description
    .replace(new RegExp(`^${brandName}\\s+`, "i"), "")
    .replace(/\s*\|\s*.*$/, "")
    .trim();

  if (cleanedDescription && cleanedDescription.length >= 48) {
    return truncate(cleanedDescription, 240);
  }

  if (heading && title && !heading.toLowerCase().includes(title.toLowerCase())) {
    return truncate(
      `${brandName} appears to focus on ${heading.charAt(0).toLowerCase()}${heading.slice(1)}.`,
      220,
    );
  }

  if (heading) {
    return truncate(
      `${brandName} appears to offer ${heading.charAt(0).toLowerCase()}${heading.slice(1)}.`,
      220,
    );
  }

  if (title) {
    return truncate(
      `${brandName} appears to be positioned around ${title.charAt(0).toLowerCase()}${title.slice(1)}.`,
      220,
    );
  }

  return truncate(
    `${brandName} appears to offer a distinct product or service, but the site still needs to state that promise more plainly.`,
    220,
  );
}

function containsPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

function isUtilityCta(text: string) {
  const normalized = normalizeWhitespace(text).toLowerCase();
  const utilityPatterns = [
    "skip to main content",
    "find a store",
    "sign in",
    "log in",
    "join us",
    "help",
    "menu",
    "wishlist",
    "bag",
    "cart",
    "search",
    "country",
    "location",
    "customer service",
    "order status",
    "dispatch and delivery",
    "shipping",
    "returns",
    "faq",
    "contact us",
    "gift cards",
    "student discount",
    "feedback",
    "privacy policy",
    "terms of sale",
    "terms of use",
    "terms and conditions",
    "cookie",
    "legal",
  ];

  return utilityPatterns.some((pattern) => containsPhrase(normalized, pattern));
}

const INDUSTRY_ARCHETYPE_KEYWORDS: Record<VisualWorld, string[]> = {
  caregiver: [
    "psychology",
    "psychologist",
    "therapy",
    "therapist",
    "counselling",
    "counseling",
    "healing",
    "wellness",
    "care",
    "education",
    "school",
    "tutor",
    "learning",
  ],
  innocent: ["natural", "organic", "eco", "children", "kids", "baby"],
  hero: ["fitness", "gym", "training", "sport", "sports", "security", "performance"],
  rebel: ["anti", "outlaw", "disrupt", "liquidation", "demolition", "provocative"],
  lover: ["beauty", "perfume", "fragrance", "salon", "fashion", "photography", "luxury beauty"],
  creator: ["design agency", "creative bureau", "creative studio", "branding", "design", "music", "photography"],
  explorer: ["travel", "tour", "expedition", "adventure", "quest", "outdoor"],
  jester: ["event", "events", "show", "entertainment", "comedy", "festival"],
  magician: ["esoteric", "ritual", "mystic", "transformation", "awakening", "occult"],
  sage: ["consulting", "consultancy", "software", "it", "seo", "research", "analysis", "strategy"],
  ruler: [
    "bank",
    "banking",
    "finance",
    "insurance",
    "law",
    "legal",
    "diplomacy",
    "logistics",
    "executive",
    "business",
    "luxury goods",
  ],
  everyman: ["community", "smm", "club", "cooperative", "retail", "everyday", "household"],
};

export function inferIndustryArchetype(websiteContext: WebsiteContext): IndustryArchetypeHint {
  const combined = normalizeWhitespace(
    [
      websiteContext.title,
      websiteContext.ogTitle,
      websiteContext.description,
      ...websiteContext.headings,
      ...websiteContext.callsToAction,
      websiteContext.visibleText,
    ]
      .filter(Boolean)
      .join(" "),
  ).toLowerCase();

  const scored = Object.entries(INDUSTRY_ARCHETYPE_KEYWORDS).map(([world, keywords]) => {
    const score = keywords.reduce(
      (acc, keyword) =>
        acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
      0,
    );

    return [world as VisualWorld, score] as const;
  });

  const [world, confidence] =
    scored.sort((a, b) => b[1] - a[1])[0] || (["sage", 0] as const);

  return {
    world: confidence > 0 ? world : "sage",
    confidence,
    label: confidence > 0 ? `${world} industry pull` : "no clear industry pull",
  };
}

function buildHeuristicRead(url: string, websiteContext: WebsiteContext, hints: VisualHints) {
  const brandName = extractBrandName(url, websiteContext);
  const template = pickSampleForWorld(hints.suggestedWorld);
  const world = hints.suggestedWorld;
  const categoryLens = inferCategoryLens(websiteContext);

  const worldOverrides: Partial<Record<VisualWorld, Partial<BrandReadResult>>> = {
    hero: {
      summary:
        "The brand reads as energetic, disciplined, and performance-led. It already creates momentum quickly, but the commercial message still needs to land with the same force as the visual signal.",
      current:
        "Right now, the brand signals ambition, physical energy, and forward motion. It feels built for action rather than passivity. The strongest impression is drive. The risk is not weakness, but diffusion: if the offer is not stated precisely enough, the energy can run ahead of the message.",
      strength:
        "The strongest part is the sense of momentum. The brand already looks active, assertive, and designed to move people toward a decision. That gives it presence immediately.",
      gap:
        "What is still needed is sharper commercial framing. A performance brand should not only feel powerful, it should also make the benefit unmistakable. If the message trails the energy, clarity suffers.",
      mismatch:
        "The visual system suggests confidence and competitive focus. Any softer, more padded, or less specific copy will feel weaker than the brand looks.",
      voice:
        "The tone should sound direct, committed, and physically alive. When the voice becomes vague or overly careful, it breaks the performance logic of the brand.",
      direction:
        "Keep the drive, but make the promise more exact. Let the first screen say what this brand helps people do, become, or overcome before the visitor has to infer it.",
      amplify:
        "Amplify the movement, determination, and high-standard feel. Those are the signals that make the brand feel leader-like rather than merely stylish.",
      drop:
        "Drop language that softens the competitive edge or delays the core value proposition. If it slows the brand down, it should not lead.",
      clarityScore: 82,
      premiumScore: 88,
      cohesionScore: 84,
      strongestSignal:
        "The brand already feels driven, physical, and built around performance.",
      mainFriction:
        "The emotional force of the brand is stronger than the immediate commercial explanation.",
      nextMove:
        "State the performance promise with the same intensity the brand already projects visually.",
    },
  };

  return enrichPosterSystem(
    {
      ...template,
      ...worldOverrides[world],
      brandName,
      visualWorld: world,
      whatItDoes: buildWhatItDoes(brandName, websiteContext),
    },
    categoryLens,
  );
}

export function resolveWorldPoster(world: VisualWorld) {
  const fileMap: Record<VisualWorld, string> = {
    ruler: "/poster images/Ruler2.png",
    sage: "/poster images/Sage2.png",
    magician: "/poster images/Magician2.png",
    creator: "/poster images/Creator2.png",
    lover: "/poster images/Lover2.png",
    caregiver: "/poster images/Caregiver2.png",
    hero: "/poster images/Hero2.png",
    rebel: "/poster images/Rebel2.png",
    explorer: "/poster images/Explorer2.png",
    everyman: "/poster images/Everyman2.png",
    innocent: "/poster images/Innocent2.png",
    jester: "/poster images/Jester2.png",
  };

  return fileMap[world];
}

const GENRE_BY_ARCHETYPE: Record<VisualWorld, string> = {
  hero: "Epic War Drama",
  explorer: "Adventure / Road Film",
  ruler: "Political Thriller",
  rebel: "Revolution Thriller",
  innocent: "Coming-of-Age Fairy Tale",
  lover: "Intimate Romance Drama",
  sage: "Intellectual Mystery",
  magician: "Surrealist Sci-Fi",
  jester: "Dark Comedy",
  caregiver: "Intimate Family Epic",
  creator: "Auteur Art House",
  everyman: "Grounded Character Study",
};

const TITLE_PATTERN_BY_ARCHETYPE: Record<VisualWorld, string[]> = {
  hero: ["standard", "rise", "principle"],
  explorer: ["beyond", "inside", "road"],
  ruler: ["standard", "house", "code"],
  rebel: ["against", "revolt", "break"],
  innocent: ["light", "inside", "way"],
  lover: ["world", "inside", "language"],
  sage: ["code", "principle", "inside"],
  magician: ["alchemy", "beyond", "inside"],
  jester: ["game", "trick", "inside"],
  caregiver: ["way", "holds", "inside"],
  creator: ["world", "house", "method"],
  everyman: ["method", "choice", "way"],
};

function inferCategoryLens(websiteContext: WebsiteContext): CategoryLens {
  const combined = normalizeWhitespace(
    [
      websiteContext.title,
      websiteContext.ogTitle,
      websiteContext.description,
      ...websiteContext.headings,
      ...websiteContext.callsToAction,
      websiteContext.visibleText,
    ]
      .filter(Boolean)
      .join(" "),
  ).toLowerCase();

  const groups: Array<[CategoryLens, string[]]> = [
    ["kids", ["kids", "kid", "children", "child", "toy", "toys", "birthday", "party", "play"]],
    ["wellness", ["wellness", "healing", "therapy", "care", "ritual", "restore", "restore", "nurture"]],
    ["luxury", ["luxury", "premium", "exclusive", "elevated", "refined", "interior", "furniture", "heritage"]],
    ["strategy", ["strategy", "consulting", "studio", "positioning", "messaging", "analysis", "research", "editorial"]],
    ["retail", ["shop", "retail", "appliance", "appliances", "home", "household", "grocery", "everyday"]],
    ["events", ["event", "events", "party", "experience", "wedding", "celebration", "festival"]],
    ["performance", ["performance", "training", "sport", "sports", "athlete", "fitness", "endurance"]],
    ["outdoors", ["outdoor", "adventure", "travel", "journey", "trail", "roam", "explore"]],
  ];

  let best: [CategoryLens, number] = ["default", 0];
  for (const [lens, keywords] of groups) {
    const score = keywords.reduce(
      (acc, keyword) => acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
      0,
    );
    if (score > best[1]) {
      best = [lens, score];
    }
  }

  return best[1] > 0 ? best[0] : "default";
}

function formatTitlePattern(pattern: string, brandName: string) {
  switch (pattern) {
    case "house":
      return `The House of ${brandName}`;
    case "standard":
      return `The ${brandName} Standard`;
    case "code":
      return `The ${brandName} Code`;
    case "principle":
      return `The ${brandName} Principle`;
    case "rise":
      return `The Rise of ${brandName}`;
    case "beyond":
      return `Beyond ${brandName}`;
    case "inside":
      return `Inside ${brandName}`;
    case "road":
      return `The Road to ${brandName}`;
    case "against":
      return `Against ${brandName}`;
    case "revolt":
      return `The ${brandName} Revolt`;
    case "break":
      return `The ${brandName} Break`;
    case "light":
      return `The Light of ${brandName}`;
    case "way":
      return `The Way of ${brandName}`;
    case "world":
      return `The World of ${brandName}`;
    case "language":
      return `The Language of ${brandName}`;
    case "alchemy":
      return `The Alchemy of ${brandName}`;
    case "game":
      return `The ${brandName} Game`;
    case "trick":
      return `The ${brandName} Trick`;
    case "holds":
      return `What ${brandName} Holds`;
    case "method":
      return `The ${brandName} Method`;
    case "choice":
      return `The ${brandName} Choice`;
    default:
      return brandName;
  }
}

function pickTitlePattern(world: VisualWorld, lens: CategoryLens) {
  const patterns = [...TITLE_PATTERN_BY_ARCHETYPE[world]];

  if (world === "ruler" && (lens === "luxury" || lens === "strategy")) {
    return lens === "luxury" ? "house" : "code";
  }

  if (world === "creator" && lens === "luxury") {
    return "house";
  }

  if (world === "jester") {
    if (lens === "kids" || lens === "events") return "game";
    if (lens === "retail") return "inside";
  }

  if (world === "caregiver" && lens === "wellness") {
    return "way";
  }

  if (world === "everyman" && lens === "retail") {
    return "choice";
  }

  return patterns[0];
}

function buildPosterTitle(world: VisualWorld, brandName: string, lens: CategoryLens) {
  return truncate(formatTitlePattern(pickTitlePattern(world, lens), brandName), 64);
}

function buildPosterGenre(world: VisualWorld, lens: CategoryLens) {
  if (world === "jester") {
    if (lens === "kids") return "Playful Adventure";
    if (lens === "events") return "Celebration Comedy";
    return "Dark Comedy";
  }

  if (world === "caregiver" && lens === "wellness") return "Healing Story";
  if (world === "explorer" && lens === "outdoors") return "Adventure / Road Film";
  if (world === "explorer" && lens === "kids") return "Wonder Tale";
  if (world === "sage" && lens === "strategy") return "Intellectual Mystery";
  if (world === "ruler" && lens === "luxury") return "Political Thriller";
  if (world === "everyman" && lens === "retail") return "Everyday Drama";
  if (world === "innocent" && lens === "kids") return "Fairy Tale";

  return GENRE_BY_ARCHETYPE[world];
}

function determineTensionType(result: Pick<BrandReadResult, "clarityScore" | "premiumScore" | "cohesionScore" | "voice" | "drop" | "mainFriction">): TensionType {
  const lowest = Math.min(result.clarityScore, result.premiumScore, result.cohesionScore);
  const voiceSignal = `${result.voice} ${result.drop} ${result.mainFriction}`.toLowerCase();

  if (result.premiumScore >= 82 && result.clarityScore <= 72) {
    return "visibility gap";
  }

  if (lowest === result.clarityScore) {
    return "clarity gap";
  }

  if (lowest === result.premiumScore) {
    return "credibility gap";
  }

  if (
    lowest === result.cohesionScore ||
    /(safe|careful|generic|soft|cautious|polite|withheld|broad)/.test(voiceSignal)
  ) {
    return "courage gap";
  }

  return "clarity gap";
}

function buildTagline(world: VisualWorld, tension: TensionType, result: Pick<BrandReadResult, "brandName" | "clarityScore" | "premiumScore" | "cohesionScore" | "strongestSignal" | "mainFriction" | "direction" | "summary">) {
  const lowMetric =
    result.clarityScore <= result.premiumScore && result.clarityScore <= result.cohesionScore
      ? "clarity"
      : result.premiumScore <= result.cohesionScore
        ? "credibility"
        : "cohesion";

  const lines: Record<VisualWorld, Record<TensionType, string>> = {
    hero: {
      "visibility gap": "They have been moving for years. The signal still arrives late.",
      "clarity gap": "The pressure is visible. The next victory still needs a name.",
      "credibility gap": "The standard is felt first. The evidence still enters second.",
      "courage gap": "They know how to move. The language still flinches.",
    },
    explorer: {
      "visibility gap": "The horizon is calling. The route still hides in mist.",
      "clarity gap": "The destination is felt. The map still stays folded.",
      "credibility gap": "The journey feels real. The proof still travels light.",
      "courage gap": "The freedom is there. The claim still walks softly.",
    },
    ruler: {
      "visibility gap": "The standard is set. The room still has not named it.",
      "clarity gap": "The room already persuades. The invitation still does not.",
      "credibility gap": "The power is established. The proof still stays offstage.",
      "courage gap": "The authority is real. The wording still bows too early.",
    },
    rebel: {
      "visibility gap": "The break is visible. The new order still lacks a name.",
      "clarity gap": "The refusal is sharp. The proposition still hides in smoke.",
      "credibility gap": "The challenge lands. The evidence still arrives late.",
      "courage gap": "The instinct is right. The copy still obeys old rules.",
    },
    innocent: {
      "visibility gap": "The light is there. The value still waits offstage.",
      "clarity gap": "The feeling stays pure. The message drifts too softly.",
      "credibility gap": "The promise feels true. The reasons remain faint.",
      "courage gap": "The trust is offered. The claim still whispers.",
    },
    lover: {
      "visibility gap": "The pull is immediate. The value follows too quietly.",
      "clarity gap": "The attraction is instant. The meaning still arrives late.",
      "credibility gap": "The seduction works. The proof stays one step behind.",
      "courage gap": "The intimacy is there. The message still hesitates.",
    },
    sage: {
      "visibility gap": "The answer is there. The signal still hides in shadow.",
      "clarity gap": "The intelligence is obvious. The offer still goes unnamed.",
      "credibility gap": "The thinking is real. The evidence remains implied.",
      "courage gap": "The knowledge is there. The language still softens the point.",
    },
    magician: {
      "visibility gap": "The transformation is felt. The mechanism stays hidden.",
      "clarity gap": "The shift is visible. The meaning still slips away.",
      "credibility gap": "The spell works. The proof remains offstage.",
      "courage gap": "The change is real. The wording still hides the reveal.",
    },
    jester: {
      "visibility gap": "The spark is instant. The premise still dodges the spotlight.",
      "clarity gap": "The wit lands. The point still arrives late.",
      "credibility gap": "The angle is clever. The case still stays underbuilt.",
      "courage gap": "The brand sees it. The copy still refuses to say it cleanly.",
    },
    caregiver: {
      "visibility gap": "The care is evident. The offer still waits in the background.",
      "clarity gap": "The warmth is there. The promise needs firmer shape.",
      "credibility gap": "The reassurance lands. The proof still needs daylight.",
      "courage gap": "The devotion is clear. The message still overprotects itself.",
    },
    creator: {
      "visibility gap": "The craft is visible. The reason to choose it is not.",
      "clarity gap": "The world is authored. The through-line still takes too long.",
      "credibility gap": "The authorship is clear. The proof stays too quiet.",
      "courage gap": "The vision is strong. The claim still edits itself down.",
    },
    everyman: {
      "visibility gap": "The trust feels earned. The value still hides in plain sight.",
      "clarity gap": "The offer feels familiar. The reason to choose it does not.",
      "credibility gap": "The honesty lands. The proof still needs more weight.",
      "courage gap": "The brand feels real. The message still plays too safe.",
    },
  };

  const candidate = lines[world][tension];
  const trimmed = candidate.split(/\s+/).slice(0, 12).join(" ");
  if (trimmed.split(/\s+/).length >= 6) {
    return trimmed;
  }

  return lowMetric === "clarity"
    ? "The quality is visible. The offer still needs a sharper line."
    : lowMetric === "credibility"
      ? "The promise is here. The proof has not fully arrived."
      : "The impression is strong. The through-line still drifts.";
}

function computePosterScore(result: Pick<BrandReadResult, "clarityScore" | "premiumScore" | "cohesionScore">) {
  return Math.round((result.clarityScore + result.premiumScore + result.cohesionScore) / 3);
}

// Canonical 4-tier band name: FLATLINING / UNSTABLE / STABLE / LEADING.
// The previous 6-tier film-metaphor vocabulary was retired so that the text
// band and the color indicator never disagree.
function getScoreBand(score: number) {
  return scoreBandLabel(score);
}

function buildScoreModifier(result: Pick<BrandReadResult, "clarityScore" | "premiumScore" | "cohesionScore">) {
  // Weakest dimension gets the spotlight — the modifier should name the weakest
  // link, not the overall band. We use the lowest sub-score to pick a line,
  // then fall back to the canonical band modifier if somehow everything ties.
  const lowest = Math.min(result.clarityScore, result.premiumScore, result.cohesionScore);
  if (lowest === result.clarityScore) {
    return "They can feel the standard. The reason to step closer is still quieter than it should be.";
  }
  if (lowest === result.premiumScore) {
    return "The belief is there. The world around it has not fully caught up yet.";
  }
  if (lowest === result.cohesionScore) {
    return "The voice is strong. It still slips between versions of itself.";
  }
  return bandModifier(computePosterScore(result));
}

function enrichPosterSystem(result: BrandReadResult, lens: CategoryLens = "default"): BrandReadResult {
  const tension = determineTensionType(result);
  const posterScore = computePosterScore(result);

  return {
    ...result,
    title: buildPosterTitle(result.visualWorld, result.brandName, lens),
    genre: buildPosterGenre(result.visualWorld, lens),
    tagline: buildTagline(result.visualWorld, tension, result),
    posterScore,
    scoreBand: getScoreBand(posterScore),
    scoreModifier: buildScoreModifier(result),
  };
}

function inferVisualWorldHints(websiteContext: WebsiteContext): VisualHints {
  const combined = normalizeWhitespace(
    [
      websiteContext.title,
      websiteContext.ogTitle,
      websiteContext.description,
      ...(websiteContext.headings || []),
      ...(websiteContext.callsToAction || []),
      websiteContext.visibleText,
    ]
      .filter(Boolean)
      .join(" "),
  ).toLowerCase();

  const archetypeKeywords: Record<VisualWorld, string[]> = {
    ruler: [
      "luxury",
      "executive",
      "leadership",
      "exclusive",
      "elite",
      "premier",
      "authority",
      "command",
      "premium",
      "refined",
      "prestige",
      "elevated",
    ],
    sage: [
      "insight",
      "research",
      "knowledge",
      "intelligence",
      "expertise",
      "strategy",
      "positioning",
      "narrative",
      "messaging",
      "direction",
      "clarity",
      "analysis",
    ],
    magician: [
      "transform",
      "transformation",
      "alchemy",
      "ritual",
      "mystic",
      "magic",
      "awakening",
    ],
    creator: [
      "design",
      "creative",
      "studio",
      "craft",
      "innovation",
      "build",
      "create",
      "original",
      "editorial",
      "campaign",
      "campaigns",
      "film",
      "films",
      "art direction",
      "brand experience",
      "brand experiences",
      "digital product",
      "digital products",
    ],
    lover: [
      "beauty",
      "sensual",
      "romance",
      "desire",
      "fragrance",
      "aesthetic",
      "elegance",
      "intimacy",
    ],
    caregiver: [
      "care",
      "wellness",
      "healing",
      "safe",
      "comfort",
      "nurture",
      "restorative",
      "soothing",
    ],
    hero: [
      "performance",
      "strength",
      "power",
      "challenge",
      "train",
      "win",
      "endurance",
      "bold",
      "active",
      "athlete",
    ],
    rebel: [
      "disrupt",
      "break",
      "rebel",
      "radical",
      "defy",
      "unconventional",
      "rule-breaking",
      "provocative",
    ],
    explorer: [
      "discover",
      "journey",
      "adventure",
      "explore",
      "beyond",
      "freedom",
      "movement",
      "travel",
      "outdoor",
      "horizon",
      "cliff",
      "mountain",
      "trail",
      "wild",
      "escape",
      "roam",
    ],
    everyman: [
      "everyday",
      "daily",
      "simple",
      "easy",
      "for everyone",
      "affordable",
      "delivered",
      "convenience",
      "home",
      "family",
      "community",
      "shop",
      "grocery",
      "retail",
      "appliance",
      "appliances",
      "essentials",
    ],
    innocent: [
      "pure",
      "clean",
      "natural",
      "gentle",
      "light",
      "fresh",
      "goodness",
    ],
    jester: [
      "play",
      "fun",
      "joy",
      "humor",
      "cheeky",
      "witty",
      "lighthearted",
      "surprise",
    ],
  };

  const scores = Object.fromEntries(
    VISUAL_WORLDS.map((world) => [world, 0]),
  ) as Record<VisualWorld, number>;
  const industryHint = inferIndustryArchetype(websiteContext);

  for (const [world, keywords] of Object.entries(archetypeKeywords) as Array<
    [VisualWorld, string[]]
  >) {
    for (const keyword of keywords) {
      if (containsPhrase(combined, keyword) || combined.includes(keyword)) scores[world] += 1;
    }
  }

  const weightedSignals: Array<[VisualWorld, string[], number]> = [
    ["hero", ["nike", "athlete", "athletes", "sport", "sportswear", "run", "running", "training", "performance", "just do it"], 3],
    ["rebel", ["disrupt", "defy", "break the rules", "anti", "outsider"], 2],
    ["ruler", ["luxury", "heritage", "exclusive", "craftsmanship", "mastery"], 2],
    ["caregiver", ["caregiving", "therapy", "healing", "supportive", "safe space"], 2],
    ["explorer", ["outdoors", "expedition", "roam", "trail", "wander"], 2],
    [
      "creator",
      [
        "creative intelligence",
        "brand film",
        "brand films",
        "campaign direction",
        "art direction",
        "editorial",
        "design studio",
        "creative studio",
        "digital products",
        "brand experiences",
      ],
      3,
    ],
    [
      "sage",
      [
        "brand strategy",
        "positioning",
        "clarity",
        "signal",
        "audience",
        "narrative",
        "messaging",
        "find the real problem",
        "lock the direction",
      ],
      3,
    ],
    [
      "ruler",
      ["premium", "refined", "elevated", "authority", "selective"],
      2,
    ],
    [
      "sage",
      ["technology", "technical", "smart", "system", "systems", "platform", "precision", "diagnostic"],
      2,
    ],
    [
      "everyman",
      ["home", "household", "appliance", "appliances", "daily life", "everyday use", "for everyone"],
      2,
    ],
  ];

  for (const [world, phrases, weight] of weightedSignals) {
    for (const phrase of phrases) {
      if (containsPhrase(combined, phrase) || combined.includes(phrase)) {
        scores[world] += weight;
      }
    }
  }

  if (
    (containsPhrase(combined, "nike") ||
      containsPhrase(combined, "athletes") ||
      containsPhrase(combined, "performance")) &&
    scores.hero < 4
  ) {
    scores.hero = 4;
  }

  const studioStrategyBias = [
    "studio",
    "creative intelligence",
    "brand strategy",
    "positioning",
    "narrative",
    "messaging",
    "campaign",
    "editorial",
    "brand film",
    "brand films",
    "digital products",
    "brand experiences",
  ].reduce(
    (acc, keyword) =>
      acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
    0,
  );

  const caregiverBias = [
    "therapy",
    "healing",
    "wellness",
    "supportive",
    "safe space",
    "nurture",
    "comfort",
    "caregiving",
  ].reduce(
    (acc, keyword) =>
      acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
    0,
  );

  if (studioStrategyBias >= 3) {
    scores.creator += 3;
    scores.sage += 3;
  }

  if (studioStrategyBias >= 5) {
    scores.ruler += 2;
  }

  if (studioStrategyBias >= 3 && caregiverBias <= 2) {
    scores.caregiver = Math.max(0, scores.caregiver - 2);
    scores.everyman = Math.max(0, scores.everyman - 1);
  }

  if (industryHint.confidence >= 2) {
    scores[industryHint.world] += 2;
  }

  if (industryHint.confidence >= 4) {
    scores[industryHint.world] += 2;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let [topWorld, topScore] = ranked[0] as [VisualWorld, number];

  const explorerOutdoorBias = [
    "cliff",
    "mountain",
    "trail",
    "horizon",
    "outdoor",
    "travel",
    "journey",
    "explore",
    "adventure",
    "escape",
    "roam",
  ].reduce((acc, keyword) => acc + (combined.includes(keyword) ? 1 : 0), 0);

  if (explorerOutdoorBias >= 2 && scores.explorer >= scores.hero) {
    topWorld = "explorer";
    topScore = scores.explorer || explorerOutdoorBias;
  }

  const studioCandidates: VisualWorld[] = ["creator", "sage", "ruler"];
  const topStudioWorld = studioCandidates.sort((a, b) => scores[b] - scores[a])[0];

  if (studioStrategyBias >= 4 && scores[topStudioWorld] >= topScore - 1) {
    topWorld = topStudioWorld;
    topScore = scores[topStudioWorld];
  }

  const creativeStudioBias = [
    "creative",
    "design",
    "studio",
    "editorial",
    "art direction",
    "campaign",
    "film",
    "brand experience",
    "digital product",
  ].reduce(
    (acc, keyword) =>
      acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
    0,
  );

  const strategyBias = [
    "strategy",
    "positioning",
    "clarity",
    "narrative",
    "messaging",
    "direction",
    "audience",
    "signal",
    "intelligence",
    "analysis",
  ].reduce(
    (acc, keyword) =>
      acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
    0,
  );

  const authorityBias = [
    "premium",
    "luxury",
    "exclusive",
    "elevated",
    "prestige",
    "mastery",
    "refined",
  ].reduce(
    (acc, keyword) =>
      acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
    0,
  );

  const utilityBias = [
    "appliance",
    "appliances",
    "home",
    "household",
    "daily",
    "everyday",
    "simple",
    "affordable",
    "retail",
    "grocery",
  ].reduce(
    (acc, keyword) =>
      acc + (containsPhrase(combined, keyword) || combined.includes(keyword) ? 1 : 0),
    0,
  );

  if (creativeStudioBias >= 4 && creativeStudioBias >= strategyBias) {
    topWorld = "creator";
    topScore = scores.creator;
  } else if (strategyBias >= 5 && strategyBias >= creativeStudioBias) {
    topWorld = authorityBias >= 3 ? "ruler" : "sage";
    topScore = scores[topWorld];
  } else if (utilityBias >= 4 && utilityBias > caregiverBias) {
    topWorld = scores.sage >= scores.everyman + 2 ? "sage" : "everyman";
    topScore = scores[topWorld];
  }

  const rankedFinal = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const adjacentWorld = (
    rankedFinal.find(([world]) => world !== topWorld)?.[0] || topWorld
  ) as VisualWorld;

  return {
    suggestedWorld: topScore > 0 ? topWorld : "sage",
    adjacentWorld,
    confidence: topScore,
    topSignals: rankedFinal.filter(([, score]) => score > 0).slice(0, 3),
    industryHint,
  };
}

export async function fetchWebsiteContext(url: string): Promise<WebsiteContext> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Website fetch failed with status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, noscript, svg").remove();

    const title = normalizeWhitespace($("title").first().text());
    const description = normalizeWhitespace(
      $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "",
    );
    const ogTitle = normalizeWhitespace(
      $('meta[property="og:title"]').attr("content") || "",
    );
    const headings = $("h1, h2, h3")
      .map((_, element) => normalizeWhitespace($(element).text()))
      .get()
      .filter(Boolean)
      .slice(0, 10);
    const bodyBlocks = $("p, li")
      .map((_, element) => normalizeWhitespace($(element).text()))
      .get()
      .filter((text) => text && text.length > 18)
      .slice(0, 24);

    return {
      title: truncate(title, 180),
      ogTitle: truncate(ogTitle, 180),
      description: truncate(description, 320),
      headings,
      callsToAction: $("a, button")
        .map((_, element) => normalizeWhitespace($(element).text()))
        .get()
        .filter((text) => text && text.length >= 2 && text.length <= 42)
        .filter((text) => !isUtilityCta(text))
        .filter((text, index, array) => array.indexOf(text) === index)
        .slice(0, 8),
      visibleText: truncate(bodyBlocks.join("\n"), 3500),
      ogImage: normalizeWhitespace($('meta[property="og:image"]').attr("content") || ""),
      icon: normalizeWhitespace(
        $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href") ||
          $('link[rel="apple-touch-icon"]').attr("href") ||
          "",
      ),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("This website took too long to respond. Try again in a moment.");
    }

    const message = String((error as Error)?.message || "");
    if (message.includes("fetch failed")) {
      throw new Error("This website could not be reached. Check the URL and try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJson(text = "") {
  const cleaned = text.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return valid JSON");
    return JSON.parse(match[0]);
  }
}

function normalizeScore(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.min(100, Math.round(numeric)));
  }

  return fallback;
}

function normalizeResult(
  data: RawBrandReadResult,
  hints: VisualHints,
  websiteContext: WebsiteContext,
): BrandReadResult {
  const rawWorld = String(data.visualWorld || "").toLowerCase();
  const modelWorld = VISUAL_WORLDS.includes(rawWorld as VisualWorld)
    ? (rawWorld as VisualWorld)
    : "sage";
  const resolvedWorld = hints.confidence >= 2 ? hints.suggestedWorld : modelWorld;
  const symbol = ["strategy", "story", "spectacle"].includes(String(data.symbol))
    ? (String(data.symbol) as ReadSymbol)
    : "strategy";

  return enrichPosterSystem(
    {
      brandName: truncate(normalizeWhitespace(data.brandName || ""), 64) || "Your Brand",
      visualWorld: resolvedWorld,
      symbol,
      title: truncate(normalizeWhitespace(data.title || ""), 64) || "Untitled",
      genre: truncate(normalizeWhitespace(data.genre || ""), 34) || "Brand Drama",
      tagline:
        truncate(normalizeWhitespace(data.tagline || ""), 92) ||
        "A brand in search of a sharper signal.",
      posterScore: 0,
      scoreBand: "",
      scoreModifier: "",
      whatItDoes:
        truncate(normalizeWhitespace(data.whatItDoes || ""), 240) ||
        buildWhatItDoes(
          truncate(normalizeWhitespace(data.brandName || ""), 64) || "Your Brand",
          websiteContext,
        ),
      summary:
        truncate(normalizeWhitespace(data.summary || ""), 320) ||
        "The brand has a clear mood. Now the message needs to land with the same clarity.",
      current:
        truncate(normalizeWhitespace(data.current || ""), 900) ||
        "Right now, the brand looks considered and ambitious, but the offer is still not fully obvious on first glance.",
      strength:
        truncate(normalizeWhitespace(data.strength || ""), 760) ||
        "The strongest part is the mood. The brand already feels considered and visually self-aware.",
      gap:
        truncate(normalizeWhitespace(data.gap || ""), 900) ||
        "The look is doing one job and the message is doing another. They need to align more quickly.",
      mismatch:
        truncate(normalizeWhitespace(data.mismatch || ""), 760) ||
        "Some parts feel polished and confident, while others still feel softer or less sure of themselves.",
      voice:
        truncate(normalizeWhitespace(data.voice || ""), 900) ||
        "The tone should sound more confident, more direct, and more assured.",
      direction:
        truncate(normalizeWhitespace(data.direction || ""), 900) ||
        "Say the main promise faster, trim the fluff, and let one strong idea lead the whole brand.",
      amplify:
        truncate(normalizeWhitespace(data.amplify || ""), 760) ||
        "Amplify the parts that already feel distinct, clear, and memorable. That is where the brand feels strongest.",
      drop:
        truncate(normalizeWhitespace(data.drop || ""), 760) ||
        "Drop anything vague, padded, or over-explained. If it weakens the main impression, it should probably go.",
      clarityScore: normalizeScore(data.clarityScore, 71),
      premiumScore: normalizeScore(data.premiumScore, 84),
      cohesionScore: normalizeScore(data.cohesionScore, 67),
      strongestSignal:
        truncate(normalizeWhitespace(data.strongestSignal || ""), 220) ||
        "The brand already creates a considered, premium impression quickly.",
      mainFriction:
        truncate(normalizeWhitespace(data.mainFriction || ""), 220) ||
        "The homepage does not clarify the offer quickly enough.",
      nextMove:
        truncate(normalizeWhitespace(data.nextMove || ""), 220) ||
        "Sharpen the opening promise so the value lands faster.",
    },
    inferCategoryLens(websiteContext),
  );
}

async function requestGeminiBrandRead(
  url: string,
  websiteContext: WebsiteContext,
  language: SiteLocale,
) {
  const apiKey = process.env.GEMINI_API_KEY;
  const hints = inferVisualWorldHints(websiteContext);
  const targetLanguage = LANGUAGE_NAMES[language];

  if (!apiKey) {
    return buildHeuristicRead(url, websiteContext, hints);
  }

  const prompt = `
You are BrandMirror, a premium standalone brand diagnostic product built by SAHAR Studio.

Your task is to read a website homepage and produce:
1. A free first read that feels elegant, intelligent, and commercially useful.
2. A poster-like brand framing that feels cinematic but never silly.

Important rules:
- Be specific, not generic.
- Sound premium, editorial, and intelligent.
- Use plain English. Avoid consultant jargon and abstract waffle.
- Never mention archetypes, frameworks, AI, scraping, or missing data.
- Short sentences are better than grand speeches.
- The result should feel calm, observant, and commercially sharp.
- The free result should feel useful on its own, but not like the whole audit.
- Use scores only as directional signals, not scientific measurements.
- Infer one dominant visual world from this set only:
  ruler, sage, magician, creator, lover, caregiver, hero, rebel, explorer, everyman, innocent, jester
- Treat convenience, mass retail, accessible daily-use, family-oriented, and service brands as more likely everyman or caregiver than magician.
- Do not treat strategy-led studios, creative studios, editorial brands, or premium design businesses as caregiver by default. Those are more often creator, sage, or ruler.
- Only choose caregiver when the brand clearly centers care, therapy, healing, nurturing, or reassurance as its core emotional promise.
- Only choose magician when the brand genuinely signals transformation, ritual, mystery, or symbolic change as a core story.
- Match symbol choice to the same logic:
  strategy = controlled, foundational, clear
  story = unfolding, exploratory, layered
  spectacle = reveal, threshold, dramatic impact
- Write all user-facing values in ${targetLanguage}.
- Keep the JSON keys exactly as requested.
- Return ONLY valid JSON.

Website URL:
${url}

Extracted context:
- Title: ${websiteContext.title || "n/a"}
- OG title: ${websiteContext.ogTitle || "n/a"}
- Description: ${websiteContext.description || "n/a"}
- Headings:
${websiteContext.headings.map((item) => `  - ${item}`).join("\n") || "  - n/a"}
- Calls to action:
${websiteContext.callsToAction.map((item) => `  - ${item}`).join("\n") || "  - n/a"}
- Visible text:
${websiteContext.visibleText || "n/a"}

Likely dominant visual world based on lexical brand signals:
- Suggested world: ${hints.suggestedWorld}
- Confidence score: ${hints.confidence}
- Top signal worlds: ${hints.topSignals.map(([world, score]) => `${world}(${score})`).join(", ") || "none"}
- Likely industry archetype pull: ${hints.industryHint.world} (${hints.industryHint.confidence})

Scoring rubric. Each score is an integer 0-100. Anchor your numbers to the bands below, not to a gut feeling. A brand you would call "strong" usually lives in the 70-85 range, not 90+. 85+ is reserved for pages that already convert before the copy has to do any explaining.

clarityScore — how quickly the offer becomes legible on the homepage.
- 0-40   the visitor cannot say what this company does after 10 seconds of scrolling. Hero copy is mood-only or the promise is buried.
- 40-70  the visitor can guess the category but not the exact offer. The page relies on industry shorthand the new buyer may not have.
- 70-85  the visitor understands what is for sale and roughly who it is for before the first scroll.
- 85-100  the offer, audience, and reason-to-care are all readable inside the hero frame without a second read.

premiumScore — how strongly the brand signals quality, taste, and trust.
- 0-40   the visual system undercuts the price the brand wants to charge. Stock imagery, inconsistent type, template feel.
- 40-70  the design is competent but generic. Nothing says "category leader" visually.
- 70-85  the design signals considered, intentional, on-brand. A buyer would accept a premium price without flinching.
- 85-100  the visual system is already doing conversion work. Unmistakable, controlled, category-defining.

cohesionScore — whether the written voice and the visual impression agree on the same brand.
- 0-40   copy and design feel like two different brands. One is loud, the other polite, or vice versa.
- 40-70  they are in the same family but disagree on tempo. Visuals move faster than the sentences, or the other way around.
- 70-85  voice and visuals reinforce each other most of the time. Minor slips in specific sections.
- 85-100  voice and visuals sound like one clear point of view from first pixel to last word.

Return JSON with exactly these keys. Do not omit clarityScore, premiumScore, or cohesionScore under any circumstance — if you are genuinely uncertain, estimate to the nearest 5 and commit. Do not return "null", "0", or an empty string for any score.
{
  "brandName": "brand name as it should appear on the poster",
  "visualWorld": "one of the allowed visual worlds",
  "symbol": "strategy | story | spectacle",
  "title": "poster title",
  "genre": "poster genre, ideally 2-4 words",
  "tagline": "short elegant tagline, ideally 6-12 words",
  "whatItDoes": "1-2 plain-language sentences explaining what the company appears to do and for whom",
  "summary": "2 concise sentences in the requested language",
  "current": "what the brand currently signals, 4-6 sentences",
  "strength": "what already feels strong or convincing, 3-5 sentences",
  "gap": "what is missing or unclear, 4-6 sentences",
  "mismatch": "where the brand feels slightly out of sync with itself, 3-5 sentences",
  "voice": "how the tone compares to the visual world, 4-6 sentences",
  "direction": "what to do next, 4-6 sentences",
  "amplify": "what to lean into more, 3-5 sentences",
  "drop": "what to reduce, simplify, or remove, 3-5 sentences",
  "clarityScore": 72,
  "premiumScore": 84,
  "cohesionScore": 67,
  "strongestSignal": "one precise sentence in the requested language",
  "mainFriction": "one precise sentence in the requested language",
  "nextMove": "one precise sentence in the requested language"
}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    },
  ).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const text =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("") || "";

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return normalizeResult(extractJson(text), hints, websiteContext);
}

async function localizeBrandReadResult(
  result: BrandReadResult,
  language: SiteLocale,
) {
  if (language === "en") {
    return result;
  }
  const localizedValues = await translateTexts(
    [
      result.brandName,
      result.title,
      result.genre,
      result.tagline,
      result.scoreBand,
      result.scoreModifier,
      result.whatItDoes,
      result.summary,
      result.current,
      result.strength,
      result.gap,
      result.mismatch,
      result.voice,
      result.direction,
      result.amplify,
      result.drop,
      result.strongestSignal,
      result.mainFriction,
      result.nextMove,
    ],
    language,
  );
  const [
    brandName,
    title,
    genre,
    tagline,
    scoreBand,
    scoreModifier,
    whatItDoes,
    summary,
    current,
    strength,
    gap,
    mismatch,
    voice,
    direction,
    amplify,
    drop,
    strongestSignal,
    mainFriction,
    nextMove,
  ] = localizedValues;
  return {
    ...result,
    brandName: normalizeWhitespace(brandName || result.brandName),
    title: normalizeWhitespace(title || result.title),
    genre: normalizeWhitespace(genre || result.genre),
    tagline: normalizeWhitespace(tagline || result.tagline),
    scoreBand: normalizeWhitespace(scoreBand || result.scoreBand),
    scoreModifier: normalizeWhitespace(scoreModifier || result.scoreModifier),
    whatItDoes: normalizeWhitespace(whatItDoes || result.whatItDoes),
    summary: normalizeWhitespace(summary || result.summary),
    current: normalizeWhitespace(current || result.current),
    strength: normalizeWhitespace(strength || result.strength),
    gap: normalizeWhitespace(gap || result.gap),
    mismatch: normalizeWhitespace(mismatch || result.mismatch),
    voice: normalizeWhitespace(voice || result.voice),
    direction: normalizeWhitespace(direction || result.direction),
    amplify: normalizeWhitespace(amplify || result.amplify),
    drop: normalizeWhitespace(drop || result.drop),
    strongestSignal: normalizeWhitespace(strongestSignal || result.strongestSignal),
    mainFriction: normalizeWhitespace(mainFriction || result.mainFriction),
    nextMove: normalizeWhitespace(nextMove || result.nextMove),
  };
}

export async function generateBrandRead(url: string, language: SiteLocale = "en") {
  const normalizedUrl = normalizeUrl(url);

  if (!normalizedUrl) {
    throw new Error("Please enter a valid website URL.");
  }

  try {
    const websiteContext = await fetchWebsiteContext(normalizedUrl);
    const result = await requestGeminiBrandRead(normalizedUrl, websiteContext, language);
    const localizedResult =
      !process.env.GEMINI_API_KEY && language !== "en"
        ? await localizeBrandReadResult(result, language)
        : result;

    return {
      url: normalizedUrl,
      source: "website" as const,
      result: localizedResult,
    };
  } catch (error) {
    if (!process.env.GEMINI_API_KEY) {
      const fallback = pickSampleTemplate(normalizedUrl);
      return {
        url: normalizedUrl,
        source: "website" as const,
        result: await localizeBrandReadResult(fallback, language),
      };
    }

    throw error;
  }
}
