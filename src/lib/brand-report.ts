// @ts-nocheck
import PDFDocument from "pdfkit";
import * as fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { type SiteLocale } from "@/lib/site-i18n";
import { bandModifier, scoreBandLabel } from "@/lib/score-band";
import { translateTexts } from "@/lib/text-translate";
import {
  type BrandReadResult,
  type IndustryArchetypeHint,
  type VisualWorld,
  fetchWebsiteContext,
  generateBrandRead,
  inferIndustryArchetype,
  normalizeUrl,
  normalizeWhitespace,
  resolveWorldPoster,
  DEFAULT_MODEL,
} from "@/lib/brand-read";
import {
  captureWebsiteSurface,
  type SiteCapture,
  type SiteCaptureAnchor,
  type SiteCaptureAnchorZone,
  type SiteCaptureFrame,
} from "@/lib/site-capture";

const LANGUAGE_NAMES: Record<SiteLocale, string> = {
  en: "English",
  es: "Spanish",
  ru: "Russian",
};

type VisualFocusFrame = {
  label: string;
  title: string;
  body: string;
  focusX: number;
  focusY: number;
  imageUrl?: string;
};

type BrandWorldAlternative = {
  world: VisualWorld;
  title: string;
  tagline: string;
  note: string;
  posterUrl: string;
  isCurrent: boolean;
};

type AestheticDirection = {
  name: string;
  note: string;
};

type CulturalAssociations = {
  films: string[];
  eras: string[];
  art: string[];
  music: string[];
};

type VisualCodes = {
  palette: string[];
  textures: string[];
  symbols: string[];
  forms: string[];
};

type AudienceRead = {
  primaryAudience: string;
  whatTheyAreLookingFor: string[];
  whatTheyNeedToFeel: string[];
  whatTheyNeedToHear: string[];
};

type VerbalImage = {
  nameSignal: string;
  headlineSignal: string;
  firstScreenTone: string;
  risk: string;
};

type NamingFit = {
  verdict: string;
  roleMatch: string;
  risk: string;
  correction: string;
};

type HeadlineCorrection = {
  currentProblem: string;
  correctionLogic: string;
  rewrittenDirection: string;
};

type ArchetypeTest = {
  name: string;
  verdict: string;
};

export type BrandReport = {
  url: string;
  brandName: string;
  visualWorld: VisualWorld;
  title: string;
  genre: string;
  tagline: string;
  posterScore: number;
  scoreBand: string;
  scoreModifier: string;
  whatItDoes: string;
  snapshot: string;
  whatItSignals: string;
  whatIsMissing: string;
  whatToDoNext: string;
  whatToAmplify: string;
  whatToDrop: string;
  surfaceCaptures: Array<{
    label: string;
    kind: "website" | "social" | "brand-signal";
    imageUrl?: string;
    href?: string;
    note: string;
    captureMethod?: "browser" | "metadata" | "poster";
  }>;
  screenshotCallouts: Array<{
    zone: "hero-promise" | "proof-cta";
    title: string;
    body: string;
    x: number;
    y: number;
  }>;
  scorecard: Array<{ label: string; score: number; note: string }>;
  positioningRead: string;
  toneCheck: string;
  visualIdentityRead: string;
  aboveTheFold: string;
  conversionRead: string;
  strategicDirection: string;
  archetypeRead: {
    primary: string;
    secondary: string;
    rationale: string;
  };
  aestheticDirections: AestheticDirection[];
  culturalAssociations: CulturalAssociations;
  visualCodes: VisualCodes;
  toneOfVoice: string[];
  audienceRead: AudienceRead;
  verbalImage: VerbalImage;
  namingFit: NamingFit;
  headlineCorrection: HeadlineCorrection;
  brandKnownFor: string;
  industryFit: {
    expectedArchetype: string;
    assessment: string;
    leverage: string;
  };
  expectationGap: string[];
  archetypeTests: ArchetypeTest[];
  whatWorks: string[];
  whatsBroken: string[];
  whyNotConverting: string[];
  audienceMismatch: string[];
  brandMyth: string;
  mixedSignals: string;
  frictionMap: string[];
  trustGaps: string[];
  offerOpportunities: string[];
  positioningMoves: string[];
  messagingPriorities: string[];
  offerStrategy: string[];
  priorityFixes: {
    fixNow: string[];
    fixNext: string[];
    keep: string[];
  };
  campaignAngles: Array<{
    title: string;
    angle: string;
    whyItCouldWork: string;
  }>;
  rewriteSuggestions: {
    heroLine: string;
    subheadline: string;
    cta: string;
  };
  beforeAfterHero: {
    currentFrame: VisualFocusFrame;
    rewrittenFrame: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      cta: string;
      note: string;
      posterUrl: string;
    };
  };
  brandWorldAlternatives: BrandWorldAlternative[];
  proofGallery: VisualFocusFrame[];
  miniStoryboard: VisualFocusFrame[];
  actionPlan: {
    next7Days: string[];
    next30Days: string[];
  };
  strategicNextMove: string;
};

type RawBrandReport = Partial<BrandReport> & {
  surfaceCaptures?: Array<{
    label?: string;
    kind?: "website" | "social" | "brand-signal";
    imageUrl?: string;
    href?: string;
    note?: string;
    captureMethod?: "browser" | "metadata" | "poster";
  }>;
  screenshotCallouts?: Array<{
    zone?: "hero-promise" | "proof-cta";
    title?: string;
    body?: string;
    x?: number;
    y?: number;
  }>;
  scorecard?: Array<{ label?: string; score?: number; note?: string }>;
  archetypeRead?: {
    primary?: string;
    secondary?: string;
    rationale?: string;
  };
  aestheticDirections?: Array<Partial<AestheticDirection>>;
  culturalAssociations?: Partial<CulturalAssociations>;
  visualCodes?: Partial<VisualCodes>;
  toneOfVoice?: string[];
  audienceRead?: Partial<AudienceRead>;
  verbalImage?: Partial<VerbalImage>;
  namingFit?: Partial<NamingFit>;
  headlineCorrection?: Partial<HeadlineCorrection>;
  brandKnownFor?: string;
  industryFit?: {
    expectedArchetype?: string;
    assessment?: string;
    leverage?: string;
  };
  expectationGap?: string[];
  archetypeTests?: Array<Partial<ArchetypeTest>>;
  whatWorks?: string[];
  whatsBroken?: string[];
  whyNotConverting?: string[];
  audienceMismatch?: string[];
  brandMyth?: string;
  frictionMap?: string[];
  trustGaps?: string[];
  offerOpportunities?: string[];
  positioningMoves?: string[];
  messagingPriorities?: string[];
  offerStrategy?: string[];
  priorityFixes?: {
    fixNow?: string[];
    fixNext?: string[];
    keep?: string[];
  };
  campaignAngles?: Array<{
    title?: string;
    angle?: string;
    whyItCouldWork?: string;
  }>;
  rewriteSuggestions?: {
    heroLine?: string;
    subheadline?: string;
    cta?: string;
  };
  beforeAfterHero?: {
    currentFrame?: Partial<VisualFocusFrame>;
    rewrittenFrame?: {
      eyebrow?: string;
      headline?: string;
      subheadline?: string;
      cta?: string;
      note?: string;
      posterUrl?: string;
    };
  };
  brandWorldAlternatives?: Array<Partial<BrandWorldAlternative>>;
  proofGallery?: Array<Partial<VisualFocusFrame>>;
  miniStoryboard?: Array<Partial<VisualFocusFrame>>;
  actionPlan?: {
    next7Days?: string[];
    next30Days?: string[];
  };
};

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

const require = createRequire(import.meta.url);

function installPdfkitFontRedirect() {
  return () => {};
}

function clampScore(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.min(100, Math.round(numeric)));
  }

  return fallback;
}

function truncate(value = "", maxLength = 300) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loadPdfImageSource(imageUrl?: string) {
  if (!imageUrl) {
    return undefined;
  }

  if (imageUrl.startsWith("data:")) {
    const base64 = imageUrl.split(",")[1];
    return base64 ? Buffer.from(base64, "base64") : undefined;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return undefined;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return undefined;
    }
  }

  if (imageUrl.startsWith("/")) {
    const absolutePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }
  }

  return imageUrl;
}

function clampPercent(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function findCaptureAnchor(
  capture: SiteCapture | null | undefined,
  zone: SiteCaptureAnchorZone,
) {
  return capture?.anchors.find((item) => item.zone === zone);
}

function buildFocusFrame(
  label: string,
  title: string,
  body: string,
  imageUrl: string | undefined,
  point?: Pick<SiteCaptureAnchor, "x" | "y"> | Pick<SiteCaptureFrame, "x" | "y">,
  fallback?: { x: number; y: number },
): VisualFocusFrame {
  return {
    label,
    title,
    body: truncate(normalizeWhitespace(body), 220),
    imageUrl,
    focusX: clampPercent(point?.x ?? fallback?.x ?? 50, 8, 92),
    focusY: clampPercent(point?.y ?? fallback?.y ?? 50, 8, 92),
  };
}

const WORLD_ADJACENCY: Record<VisualWorld, [VisualWorld, VisualWorld]> = {
  ruler: ["hero", "lover"],
  sage: ["magician", "innocent"],
  magician: ["creator", "sage"],
  creator: ["magician", "lover"],
  lover: ["creator", "ruler"],
  caregiver: ["everyman", "innocent"],
  hero: ["ruler", "rebel"],
  rebel: ["hero", "explorer"],
  explorer: ["hero", "rebel"],
  everyman: ["caregiver", "jester"],
  innocent: ["caregiver", "sage"],
  jester: ["everyman", "rebel"],
};

function formatWorldName(world: VisualWorld) {
  return world.charAt(0).toUpperCase() + world.slice(1);
}

const WORLD_AESTHETICS: Record<VisualWorld, AestheticDirection[]> = {
  ruler: [
    { name: "Architectural luxury", note: "Stone, shadow, symmetry, and an expensive sense of control." },
    { name: "Editorial authority", note: "Severe typography, measured spacing, and restrained prestige." },
  ],
  sage: [
    { name: "Intellectual editorial", note: "Quiet grids, thoughtful whitespace, and a research-led calm." },
    { name: "Modern atelier", note: "Knowledge presented with polish rather than noise." },
  ],
  magician: [
    { name: "Ceremonial minimalism", note: "Dark thresholds, transformation cues, and symbolic contrast." },
    { name: "Mythic futurism", note: "A brand that feels like a portal rather than a brochure." },
  ],
  creator: [
    { name: "Art-directed studio", note: "Craft, composition, and authorship made visible." },
    { name: "Cinematic modernism", note: "Image-led storytelling with precision rather than clutter." },
  ],
  lover: [
    { name: "Sensual editorial", note: "Soft light, tactile surfaces, and selective intimacy." },
    { name: "Desire-led luxury", note: "Beauty used as persuasion rather than decoration." },
  ],
  caregiver: [
    { name: "Protective softness", note: "Warm surfaces, reassurance, and human-first accessibility." },
    { name: "Healing calm", note: "Gentle rhythm and nurturing visual cues." },
  ],
  hero: [
    { name: "Performance discipline", note: "Motion, intensity, and a body-in-action visual logic." },
    { name: "Competitive clarity", note: "Bold contrast and no wasted movement." },
  ],
  rebel: [
    { name: "Controlled provocation", note: "Sharp contrast, anti-polish edges, and deliberate friction." },
    { name: "Subculture energy", note: "A point of view that resists polite sameness." },
  ],
  explorer: [
    { name: "Wide horizon minimalism", note: "Distance, movement, and a sense of pursuit." },
    { name: "Expedition elegance", note: "Freedom framed with restraint rather than rugged chaos." },
  ],
  everyman: [
    { name: "Accessible utility", note: "Friendly hierarchy, legibility, and everyday trust." },
    { name: "Neighbourhood familiarity", note: "Warm competence without high-gloss distance." },
  ],
  innocent: [
    { name: "Luminous purity", note: "Lightness, freshness, and uncluttered optimism." },
    { name: "Gentle clarity", note: "Simple forms and a hopeful visual cleanliness." },
  ],
  jester: [
    { name: "Playful polish", note: "Charm, bounce, and surprise held inside a controlled system." },
    { name: "Expressive wit", note: "Color and rhythm used to make the brand feel alive." },
  ],
};

const WORLD_CULTURE: Record<VisualWorld, CulturalAssociations> = {
  ruler: {
    films: ["A Single Man", "Phantom Thread"],
    eras: ["Interwar modernism", "1980s executive minimalism"],
    art: ["Monumental sculpture", "Neo-classical editorial portraiture"],
    music: ["Orchestral chamber scores", "Sparse piano with tension"],
  },
  sage: {
    films: ["Arrival", "The Social Network"],
    eras: ["1960s editorial modernism", "Contemporary design journalism"],
    art: ["Gallery catalogues", "Conceptual photography"],
    music: ["Ambient piano", "Modern classical minimalism"],
  },
  magician: {
    films: ["Dune", "The Fall"],
    eras: ["Symbolist revival", "Future ritualism"],
    art: ["Light installations", "Surrealist set design"],
    music: ["Ethereal electronic", "Ritual percussion"],
  },
  creator: {
    films: ["In the Mood for Love", "Her"],
    eras: ["1990s art-house fashion", "Contemporary design cinema"],
    art: ["Editorial fashion photography", "Studio still lifes"],
    music: ["Dream pop", "Cinematic electronica"],
  },
  lover: {
    films: ["Atonement", "Call Me by Your Name"],
    eras: ["Belle Epoque glamour", "1970s soft-focus luxury"],
    art: ["Romantic portraiture", "Perfume campaign stills"],
    music: ["Velvet soul", "Slow-burning orchestral pop"],
  },
  caregiver: {
    films: ["Little Women", "Past Lives"],
    eras: ["Craft revival", "Soft contemporary domesticity"],
    art: ["Handmade ceramics", "Documentary portrait photography"],
    music: ["Warm acoustic", "Gentle piano"],
  },
  hero: {
    films: ["Creed", "Rush"],
    eras: ["1990s sports cinema", "Modern performance branding"],
    art: ["Athletic portraiture", "High-contrast action photography"],
    music: ["Percussive electronic", "Stadium tension builds"],
  },
  rebel: {
    films: ["Fight Club", "Trainspotting"],
    eras: ["Post-punk", "Underground digital culture"],
    art: ["Street photography", "Collage and xerox graphics"],
    music: ["Industrial", "Sharp-edged alt electronic"],
  },
  explorer: {
    films: ["The Secret Life of Walter Mitty", "Nomadland"],
    eras: ["Expedition photography", "Quiet travel editorial"],
    art: ["Landscape cinema", "Large-format outdoor photography"],
    music: ["Expansive indie", "Atmospheric folk"],
  },
  everyman: {
    films: ["Chef", "Julie & Julia"],
    eras: ["Warm lifestyle editorial", "2000s approachable digital"],
    art: ["Documentary lifestyle photography", "Community portraiture"],
    music: ["Acoustic pop", "Comfortable indie"],
  },
  innocent: {
    films: ["Marie Antoinette", "Amelie"],
    eras: ["Pastel modernity", "Clean Scandinavian softness"],
    art: ["Still-life florals", "Airy product photography"],
    music: ["Light chamber pop", "Bright ambient"],
  },
  jester: {
    films: ["The Grand Budapest Hotel", "Barbie"],
    eras: ["Pop maximalism", "Playful postmodernism"],
    art: ["Graphic illustration", "Set-piece color theatre"],
    music: ["Synth pop", "Playful disco"],
  },
};

const WORLD_VISUAL_CODES: Record<VisualWorld, VisualCodes> = {
  ruler: {
    palette: ["charcoal", "ivory", "burnished gold"],
    textures: ["stone", "satin matte paper", "brushed metal"],
    symbols: ["columns", "gates", "monograms"],
    forms: ["symmetry", "heavy verticals", "framed negative space"],
  },
  sage: {
    palette: ["ink", "bone", "soft stone"],
    textures: ["paper grain", "linen", "matte glass"],
    symbols: ["grids", "notes", "markers"],
    forms: ["calm columns", "quiet margins", "ordered rhythm"],
  },
  magician: {
    palette: ["midnight", "smoke", "muted bronze"],
    textures: ["fog", "gloss-dark lacquer", "velvet shadow"],
    symbols: ["portals", "halos", "thresholds"],
    forms: ["reveal arcs", "voids", "light cuts"],
  },
  creator: {
    palette: ["night blue", "warm ivory", "ink black"],
    textures: ["film grain", "silk matte", "paper collage"],
    symbols: ["frames", "stills", "editorial crops"],
    forms: ["asymmetry", "cinematic balance", "measured contrast"],
  },
  lover: {
    palette: ["oxblood", "cream", "rose ash"],
    textures: ["silk", "skin-soft blur", "polished stone"],
    symbols: ["curves", "petals", "mirrors"],
    forms: ["soft diagonals", "close crops", "breathing negative space"],
  },
  caregiver: {
    palette: ["warm oat", "sage", "soft clay"],
    textures: ["cotton", "ceramic", "paper pulp"],
    symbols: ["hands", "circles", "shelter"],
    forms: ["rounded edges", "gentle spacing", "steady rhythm"],
  },
  hero: {
    palette: ["graphite", "white", "signal red"],
    textures: ["sweat sheen", "rubber", "carbon weave"],
    symbols: ["strides", "streaks", "badges"],
    forms: ["forward diagonals", "compressed energy", "hard contrast"],
  },
  rebel: {
    palette: ["black", "acid white", "rust"],
    textures: ["concrete", "grain", "torn paper"],
    symbols: ["slashes", "marks", "collisions"],
    forms: ["broken grids", "staggered blocks", "hard cuts"],
  },
  explorer: {
    palette: ["storm blue", "sand", "pine"],
    textures: ["wind", "canvas", "weathered stone"],
    symbols: ["horizons", "trails", "maps"],
    forms: ["wide crops", "distance", "open framing"],
  },
  everyman: {
    palette: ["warm grey", "denim", "off-white"],
    textures: ["paper", "cotton", "wood"],
    symbols: ["homes", "tables", "neighbourhood cues"],
    forms: ["clear blocks", "friendly spacing", "straightforward hierarchy"],
  },
  innocent: {
    palette: ["cloud", "milk", "soft leaf"],
    textures: ["air", "powder", "clean cotton"],
    symbols: ["sunlight", "petals", "dew"],
    forms: ["soft edges", "open fields", "simple repetition"],
  },
  jester: {
    palette: ["ink", "butter", "unexpected orange"],
    textures: ["gloss", "paper cutouts", "plastic shine"],
    symbols: ["stars", "speech marks", "playful icons"],
    forms: ["bounce", "surprise offsets", "rhythmic repeats"],
  },
};

function buildArchetypeLayer(input: {
  brandName: string;
  visualWorld: VisualWorld;
  industryHint: IndustryArchetypeHint;
  toneCheck: string;
  messagingPriorities: string[];
  positioningMoves: string[];
  rewriteSuggestions: { heroLine: string };
}) {
  const primary = formatWorldName(input.visualWorld);
  const secondary = formatWorldName(WORLD_ADJACENCY[input.visualWorld][0]);

  return {
    archetypeRead: {
      primary,
      secondary,
      rationale:
        input.visualWorld === "creator"
          ? `${input.brandName} reads as ${primary} first: authored, image-led, and carefully composed. The secondary pull toward ${secondary} shows up in the strategic intelligence behind the mood.`
          : `${input.brandName} reads first as ${primary}, with a secondary pull toward ${secondary}. The brand is not just choosing a look; it is choosing a myth about how value should feel.`,
    },
    aestheticDirections: WORLD_AESTHETICS[input.visualWorld],
    culturalAssociations: WORLD_CULTURE[input.visualWorld],
    visualCodes: WORLD_VISUAL_CODES[input.visualWorld],
    toneOfVoice: [
      input.toneCheck,
      input.messagingPriorities[0] || input.positioningMoves[0],
      input.rewriteSuggestions.heroLine,
    ].map((item) => truncate(normalizeWhitespace(item), 180)),
    audienceRead: {
      primaryAudience: "",
      whatTheyAreLookingFor: [],
      whatTheyNeedToFeel: [],
      whatTheyNeedToHear: [],
    },
    verbalImage: {
      nameSignal: "",
      headlineSignal: "",
      firstScreenTone: "",
      risk: "",
    },
    namingFit: {
      verdict: "",
      roleMatch: "",
      risk: "",
      correction: "",
    },
    headlineCorrection: {
      currentProblem: "",
      correctionLogic: "",
      rewrittenDirection: "",
    },
    brandKnownFor: `${input.brandName} should be known for a sharper, more legible version of its ${primary.toLowerCase()} signal.`,
    industryFit: {
      expectedArchetype: formatWorldName(input.industryHint.world),
      assessment:
        input.industryHint.world === input.visualWorld
          ? `The brand is broadly aligned with its industry's natural ${formatWorldName(input.industryHint.world).toLowerCase()} pull.`
          : `The brand is pushing away from the industry's default ${formatWorldName(input.industryHint.world).toLowerCase()} pull and into a more distinct ${primary.toLowerCase()} story.`,
      leverage:
        input.industryHint.world === input.visualWorld
          ? "Use that fit to build trust faster, then sharpen the difference inside it."
          : "Do not hide the difference. Make it explicit so the audience understands what kind of alternative this brand is.",
    },
    expectationGap: [
      input.industryHint.world === input.visualWorld
        ? "The audience expects this category to behave in a familiar way. The job is to look clearer and stronger than the category average."
        : `The category trains people to expect a ${formatWorldName(input.industryHint.world).toLowerCase()} brand, but this one is trying to read as ${primary.toLowerCase()}.`,
      "That gap is only useful if the homepage explains the difference fast instead of leaving it implicit.",
      "If the role is unconventional, the page has to correct expectations on purpose through both visuals and copy.",
    ],
    archetypeTests: [],
    whatWorks: [],
    whatsBroken: [],
    whyNotConverting: [],
    audienceMismatch: [],
    brandMyth:
      input.visualWorld === "creator"
        ? `${input.brandName} feels like the brand that edits reality into something more composed, more cinematic, and more intentional. Its myth is not loud dominance but authorship: the belief that taste, structure, and narrative can change how value is perceived.`
        : `${input.brandName} is currently building a myth around ${primary.toLowerCase()} energy. The opportunity is to make that myth legible enough that the audience feels the story and understands the offer at the same time.`,
  };
}

function buildAudienceLayer(
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>,
  visualWorld: VisualWorld,
) {
  const combined = normalizeWhitespace(
    [
      websiteContext.title,
      websiteContext.description,
      ...websiteContext.headings,
      ...websiteContext.callsToAction,
      websiteContext.visibleText,
    ]
      .filter(Boolean)
      .join(" "),
  ).toLowerCase();

  let primaryAudience = "Founders, decision-makers, and buyers comparing premium options.";
  let whatTheyAreLookingFor = [
    "Fast clarity on what the brand does and why it matters.",
    "Proof that the quality is real, not just presented well.",
    "A next step that feels justified, not premature.",
  ];
  let whatTheyNeedToFeel = [
    "That the brand is intentional, credible, and in control.",
    "That this option is sharper than the generic market.",
    "That saying yes will reduce risk, not raise it.",
  ];
  let whatTheyNeedToHear = [
    "Who this is for and what changes because of it.",
    "Why this offer is different in a commercially meaningful way.",
    "What happens next if they move forward.",
  ];

  if (combined.includes("founder") || combined.includes("brand strategy") || combined.includes("narrative")) {
    primaryAudience =
      "Founders, brand-led businesses, and teams looking for sharper positioning and a more intelligent digital presence.";
    whatTheyAreLookingFor = [
      "A partner who can clarify the brand before more assets are made.",
      "A point of view that feels premium, strategic, and commercially aware.",
      "Creative work that actually changes how the business is perceived.",
    ];
    whatTheyNeedToFeel = [
      "That the brand is in highly selective hands.",
      "That the process will create clarity, not just prettier visuals.",
      "That taste and strategy are working together rather than competing.",
    ];
    whatTheyNeedToHear = [
      "What is worth owning in the market and how the brand will claim it.",
      "How story, website, and campaign direction will align into one system.",
      "Why this creative direction will make the business easier to trust and buy from.",
    ];
  } else if (visualWorld === "hero") {
    primaryAudience =
      "People who want performance, momentum, and a brand that feels built for action.";
    whatTheyAreLookingFor = [
      "Immediate clarity on the benefit and the edge.",
      "Proof of performance or results.",
      "A sense that this brand will help them move faster or better.",
    ];
    whatTheyNeedToFeel = [
      "Energised rather than confused.",
      "That the brand is competent, disciplined, and hard to beat.",
      "That the next step is clear and frictionless.",
    ];
    whatTheyNeedToHear = [
      "What this improves, strengthens, or unlocks.",
      "Why this option outperforms the alternatives.",
      "How to act now without having to decode the offer.",
    ];
  } else if (
    combined.includes("technology") ||
    combined.includes("system") ||
    combined.includes("platform") ||
    combined.includes("smart")
  ) {
    primaryAudience =
      "People comparing technical options who want simplicity, precision, and proof that the system works.";
    whatTheyAreLookingFor = [
      "Clear utility and obvious relevance to their situation.",
      "Evidence that the product is reliable and thoughtfully designed.",
      "An explanation that removes friction instead of adding complexity.",
    ];
    whatTheyNeedToFeel = [
      "That the product is precise, stable, and worth trusting.",
      "That the brand is intelligent without becoming cold or abstract.",
      "That choosing this would make life easier, not harder.",
    ];
    whatTheyNeedToHear = [
      "What the product does in real terms.",
      "Why it is better or clearer than the generic alternatives.",
      "How quickly they can understand the value and move forward.",
    ];
  } else if (visualWorld === "everyman") {
    primaryAudience =
      "Everyday buyers looking for ease, usefulness, and a brand they do not have to overthink.";
    whatTheyAreLookingFor = [
      "Immediate usefulness and affordability logic.",
      "A familiar, low-friction buying path.",
      "Confidence that the product fits naturally into daily life.",
    ];
    whatTheyNeedToFeel = [
      "Safe, oriented, and understood.",
      "That the brand is practical rather than performative.",
      "That the next step will be easy.",
    ];
    whatTheyNeedToHear = [
      "What this solves in ordinary life.",
      "Why it is simple to choose.",
      "What makes it dependable enough to buy now.",
    ];
  }

  return {
    primaryAudience,
    whatTheyAreLookingFor,
    whatTheyNeedToFeel,
    whatTheyNeedToHear,
  };
}

function buildAudienceMismatchLayer(audienceRead: AudienceRead) {
  const lookingFor =
    audienceRead.whatTheyAreLookingFor[0]?.replace(/\.$/, "").toLowerCase() ||
    "clarity";
  const needToFeel =
    audienceRead.whatTheyNeedToFeel[0]?.replace(/^that\s+/i, "").replace(/\.$/, "").toLowerCase() ||
    "certain";
  const needToHear =
    audienceRead.whatTheyNeedToHear[0]?.replace(/\.$/, "") ||
    "what this is for and why it matters";

  return [
    `They came looking for ${lookingFor}, but the page still makes them decode too much.`,
    `They need to feel ${needToFeel}, but the current journey still leans more elegant than convincing.`,
    `They need to hear ${needToHear}, and they need to hear it before the page starts asking for trust.`,
  ];
}

function buildKnownForLine(report: Pick<BrandReport, "brandName" | "whatWorks" | "priorityFixes">) {
  const strongest =
    report.whatWorks[0]?.replace(/\.$/, "") ||
    "clarity and stronger commercial self-definition";
  const fix =
    report.priorityFixes.fixNow[0]?.replace(/\.$/, "").toLowerCase() ||
    "state the offer faster";

  return `${report.brandName} should be known for ${strongest.toLowerCase()}, not for making the buyer work to understand the value. The next job is simple: ${fix}.`;
}

function buildVerbalImageLayer(input: {
  brandName: string;
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>;
  report: Pick<BrandReport, "aboveTheFold" | "toneCheck" | "positioningRead">;
}) {
  const heading =
    input.websiteContext.headings[0] ||
    input.websiteContext.ogTitle ||
    input.websiteContext.title ||
    input.brandName;

  return {
    nameSignal: `${input.brandName} sounds like a brand that should stand for one clear thing, not a broad category placeholder.`,
    headlineSignal: `The first headline is reading as "${truncate(normalizeWhitespace(heading), 80)}". It still sounds more atmospheric than useful.`,
    firstScreenTone: truncate(
      normalizeWhitespace(input.report.toneCheck || input.report.aboveTheFold),
      180,
    ),
    risk:
      "If the name, hero line, and first-screen tone are not pulling in the same direction, the brand feels polished but slightly unresolved.",
  };
}

function buildNamingFitLayer(input: {
  brandName: string;
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>;
  visualWorld: VisualWorld;
  industryHint: IndustryArchetypeHint;
}) {
  const name = normalizeWhitespace(input.brandName);
  const lowerName = name.toLowerCase();
  const genericTerms = [
    "studio",
    "agency",
    "creative",
    "consulting",
    "consultancy",
    "solutions",
    "systems",
    "digital",
    "labs",
    "collective",
    "group",
    "company",
    "services",
  ];
  const genericHits = genericTerms.filter((term) => lowerName.includes(term)).length;
  const words = name.split(/\s+/).filter(Boolean);
  const categorySignal =
    normalizeWhitespace(
      [
        input.websiteContext.title,
        input.websiteContext.description,
        ...input.websiteContext.headings.slice(0, 2),
      ]
        .filter(Boolean)
        .join(" "),
    ).toLowerCase();

  const soundsDistinct = genericHits === 0 && words.length <= 2;
  const verdict = soundsDistinct
    ? "Strong fit: the name feels ownable and can carry one sharp market role."
    : genericHits >= 2
      ? "Weak fit: the name leans too close to category language and loses memorability."
      : "Partial fit: the name is workable, but it still needs the homepage to sharpen what it stands for.";

  const roleMatch =
    input.industryHint.world === input.visualWorld
      ? `The name can support the ${formatWorldName(input.visualWorld).toLowerCase()} role the category is already primed to understand.`
      : `The name is being asked to carry a ${formatWorldName(input.visualWorld).toLowerCase()} role in a category that usually reads ${formatWorldName(input.industryHint.world).toLowerCase()}.`;

  const risk =
    genericHits >= 2
      ? "If the first screen stays broad, the name will read like a category placeholder rather than a differentiated brand."
      : categorySignal.includes("strategy") || categorySignal.includes("design") || categorySignal.includes("brand")
        ? "The name has enough signal, but it still needs the first screen to declare what kind of authority sits behind it."
        : "If the first screen stays soft, the name will not do enough to anchor expectation on its own.";

  const correction = soundsDistinct
    ? "Do not over-explain the name. Use the hero to lock it to one role, one audience, and one clear reason to care."
    : "Use the hero to turn the name from a broad label into a specific promise: who this is for, what changes, and why it is worth choosing now.";

  return {
    verdict,
    roleMatch,
    risk,
    correction,
  };
}

function buildHeadlineCorrectionLayer(input: {
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>;
  report: Pick<
    BrandReport,
    "rewriteSuggestions" | "priorityFixes" | "audienceRead" | "aboveTheFold" | "positioningRead"
  >;
}) {
  const currentHeadline =
    normalizeWhitespace(
      input.websiteContext.headings[0] ||
        input.websiteContext.ogTitle ||
        input.websiteContext.title ||
        "",
    ) || "the current headline";
  const audienceNeed =
    input.report.audienceRead.whatTheyNeedToHear[0] ||
    "who this is for and why it matters";

  return {
    currentProblem: `The current headline is reading as "${truncate(currentHeadline, 72)}". It is creating mood before it creates a reason to stay.`,
    correctionLogic: `The next headline has to say ${audienceNeed.toLowerCase()} in the first read. Put audience, value, and business outcome ahead of elegance.`,
    rewrittenDirection:
      input.report.rewriteSuggestions.heroLine ||
      input.report.priorityFixes.fixNow[0] ||
      "Rewrite the first line so the offer lands before the style does.",
  };
}

function extractOfferHeadlineCandidate(input: {
  brandName: string;
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>;
}) {
  const brandName = normalizeWhitespace(input.brandName);
  const sources = [
    input.websiteContext.ogTitle,
    input.websiteContext.title,
    input.websiteContext.description,
  ]
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean);

  const cleanedSegments = sources
    .flatMap((value) => value.split(/\s+[|—-]\s+|:\s+/))
    .map((segment) =>
      normalizeWhitespace(
        segment.replace(new RegExp(escapeRegExp(brandName), "ig"), ""),
      ),
    )
    .map((segment) => segment.replace(/^[|:,\-–—\s]+|[|:,\-–—\s]+$/g, ""))
    .filter((segment) => segment.length >= 18 && segment.length <= 88);

  const firstUseful = cleanedSegments.find(
    (segment) =>
      !/browse|shop online|payment plans|lay-by|finance available|join|sign in/i.test(segment),
  );

  if (!firstUseful) {
    return "";
  }

  return truncate(firstUseful.replace(/\.+$/, ""), 88);
}

function buildSharperRewriteSuggestions(input: {
  brandName: string;
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>;
  report: Pick<BrandReport, "rewriteSuggestions" | "headlineCorrection">;
}) {
  const offerCandidate = extractOfferHeadlineCandidate(input);
  const callsToAction = input.websiteContext.callsToAction.map((item) => item.toLowerCase());
  const strongerCta = callsToAction.includes("shop all")
    ? "Shop the collection"
    : callsToAction.includes("apply for credit")
      ? "Explore the range"
      : input.report.rewriteSuggestions.cta;

  if (!offerCandidate) {
    return null;
  }

  const genericHero =
    /helps clients understand the value faster|without losing the premium feel|clearer offer framing|the value faster/i.test(
      input.report.rewriteSuggestions.heroLine,
    ) ||
    normalizeWhitespace(input.report.rewriteSuggestions.heroLine) ===
      normalizeWhitespace(input.report.headlineCorrection.rewrittenDirection);

  if (!genericHero) {
    return null;
  }

  return {
    heroLine: offerCandidate,
    subheadline:
      input.websiteContext.description && input.websiteContext.description.length <= 180
        ? truncate(normalizeWhitespace(input.websiteContext.description), 180)
        : input.report.rewriteSuggestions.subheadline,
    cta: strongerCta,
  };
}

function buildArchetypeTests(input: {
  visualWorld: VisualWorld;
  report: Pick<BrandReport, "whatWorks" | "whatsBroken" | "priorityFixes" | "trustGaps" | "offerOpportunities">;
}) {
  const tests: ArchetypeTest[] = [
    {
      name: "Hero test",
      verdict:
        input.visualWorld === "hero" || input.report.priorityFixes.fixNow.length <= 2
          ? "Partially passes: there is enough force here to move, but the promise still needs to land faster."
          : "Weak: the brand does not yet turn its strongest signal into enough momentum or decision pressure.",
    },
    {
      name: "Ruler test",
      verdict:
        input.report.whatWorks[0]
          ? "Partially passes: the brand already has control and presence, but it still needs stronger hierarchy of proof."
          : "Weak: the brand does not yet look fully in command of its value story.",
    },
    {
      name: "Sage test",
      verdict:
        input.report.whatsBroken[0]
          ? "Weak: the page is still making the buyer work too hard for clarity."
          : "Partially passes: the reasoning layer is present, but it can be sharper.",
    },
    {
      name: "Creator test",
      verdict:
        input.visualWorld === "creator"
          ? "Passes visually, but not yet commercially: the authored point of view is visible, the offer logic still needs tightening."
          : "Partially passes: there is enough personality here, but not enough authored distinction yet.",
    },
  ];

  return tests;
}

function buildCommercialDiagnosis(input: {
  visualWorld: VisualWorld;
  priorityFixes: BrandReport["priorityFixes"];
  frictionMap: string[];
  trustGaps: string[];
  audienceRead: AudienceRead;
}) {
  return {
    whatWorks: [
      input.priorityFixes.keep[0] ||
        "The brand already has a point of view and does not disappear into category wallpaper.",
      input.priorityFixes.keep[1] ||
        "The visual system already signals quality without looking desperate for attention.",
      input.visualWorld === "hero"
        ? "The brand already creates momentum, which gives the page real forward pressure."
        : "There is already enough control here to make the page feel memorable on first contact.",
    ].slice(0, 3),
    whatsBroken: [
      input.frictionMap[0] || "The homepage still asks the visitor to infer too much before it earns that effort.",
      input.frictionMap[1] ||
        "The page builds mood before it states the offer with enough plainness.",
      input.trustGaps[0] ||
        "The CTA appears before enough certainty has been built to make the click feel easy.",
    ].slice(0, 3),
    whyNotConverting: [
      "The first screen creates intrigue faster than clarity.",
      "Proof, process, and specificity arrive too late to rescue the first impression.",
      "The brand looks more resolved than the offer sounds.",
    ],
    audienceMismatch: buildAudienceMismatchLayer(input.audienceRead),
  };
}

function buildBrandWorldAlternatives(report: BrandReport): BrandWorldAlternative[] {
  const adjacent = WORLD_ADJACENCY[report.visualWorld][0];
  const worlds: VisualWorld[] = [report.visualWorld, adjacent];

  return worlds.map((world, index) => ({
    world,
    title:
      index === 0
        ? `${report.brandName} currently reads as ${formatWorldName(world)}`
        : `${formatWorldName(world)} is the adjacent lane`,
    tagline:
      index === 0
        ? report.tagline
        : index === 1
          ? report.positioningMoves[0] || report.strategicDirection
          : report.offerStrategy[0] || report.mixedSignals,
    note:
      index === 0
        ? "This is the dominant visual archetype the current site is already reinforcing."
        : "This adjacent world would make the brand feel more expansive, strategic, or commercially precise without breaking the existing identity.",
    posterUrl: resolveWorldPoster(world),
    isCurrent: index === 0,
  }));
}

function buildProofGallery(
  report: BrandReport,
  imageUrl: string | undefined,
  capture: SiteCapture | null | undefined,
) {
  const frameBodies = [
    report.trustGaps[0] || report.conversionRead,
    report.offerOpportunities[0] || report.visualIdentityRead,
    report.priorityFixes.fixNow[1] || report.priorityFixes.fixNow[0] || report.aboveTheFold,
  ];

  const galleryFrames = capture?.galleryFrames?.slice(0, 3) || [];

  return galleryFrames.map((frame, index) => {
    const kind = "kind" in frame ? frame.kind : "image-block";
    const title =
      kind === "logo-cluster"
        ? "Proof cluster"
        : kind === "product-shot"
          ? "Offer imagery"
          : "Support surface";

    return buildFocusFrame(
      index === 0 ? "Trust evidence" : index === 1 ? "Offer evidence" : "Support evidence",
      title,
      frameBodies[index] || report.conversionRead,
      imageUrl,
      frame,
      { x: 28 + index * 24, y: 54 + index * 8 },
    );
  });
}

function buildMiniStoryboard(
  report: BrandReport,
  imageUrl: string | undefined,
  capture: SiteCapture | null | undefined,
) {
  const heroAnchor = findCaptureAnchor(capture, "hero-promise");
  const trustAnchor = findCaptureAnchor(capture, "trust-layer") || capture?.galleryFrames?.[0];
  const actionAnchor = findCaptureAnchor(capture, "action-layer") || findCaptureAnchor(capture, "proof-cta");

  return [
    buildFocusFrame(
      "Frame 01",
      "First impression",
      report.aboveTheFold,
      imageUrl,
      heroAnchor,
      { x: 18, y: 18 },
    ),
    buildFocusFrame(
      "Frame 02",
      "Trust layer",
      report.trustGaps[0] || report.conversionRead,
      imageUrl,
      trustAnchor,
      { x: 34, y: 56 },
    ),
    buildFocusFrame(
      "Frame 03",
      "Action layer",
      report.priorityFixes.fixNow[0] || report.conversionRead,
      imageUrl,
      actionAnchor,
      { x: 72, y: 70 },
    ),
  ];
}

function buildBeforeAfterHero(
  report: BrandReport,
  imageUrl: string | undefined,
  capture: SiteCapture | null | undefined,
) {
  const heroCallout = report.screenshotCallouts.find((item) => item.zone === "hero-promise");
  const heroAnchor = findCaptureAnchor(capture, "hero-promise");

  return {
    currentFrame: buildFocusFrame(
      "Before",
      heroCallout?.title || "Current hero",
      heroCallout?.body || report.aboveTheFold,
      imageUrl,
      heroAnchor || heroCallout,
      { x: 18, y: 18 },
    ),
    rewrittenFrame: {
      eyebrow: "After",
      headline: report.rewriteSuggestions.heroLine,
      subheadline: report.rewriteSuggestions.subheadline,
      cta: report.rewriteSuggestions.cta,
      note:
        report.messagingPriorities[0] ||
        report.positioningMoves[0] ||
        "The rewritten hero should land the value faster while keeping the brand's premium signal intact.",
      posterUrl: resolveWorldPoster(report.visualWorld),
    },
  };
}

function buildVisualArtifacts(
  report: BrandReport,
  capture: SiteCapture | null | undefined,
) {
  const imageUrl = report.surfaceCaptures.find((surface) => surface.kind === "website")?.imageUrl;

  return {
    beforeAfterHero: buildBeforeAfterHero(report, imageUrl, capture),
    brandWorldAlternatives: buildBrandWorldAlternatives(report),
    proofGallery: buildProofGallery(report, imageUrl, capture),
    miniStoryboard: buildMiniStoryboard(report, imageUrl, capture),
  };
}

function normalizeVisualFocusFrame(
  raw: Partial<VisualFocusFrame> | undefined,
  fallback: VisualFocusFrame,
) {
  return {
    label: truncate(normalizeWhitespace(raw?.label || fallback.label), 40) || fallback.label,
    title: truncate(normalizeWhitespace(raw?.title || fallback.title), 80) || fallback.title,
    body: truncate(normalizeWhitespace(raw?.body || fallback.body), 220) || fallback.body,
    imageUrl: raw?.imageUrl || fallback.imageUrl,
    focusX: clampPercent(Number(raw?.focusX ?? fallback.focusX), 8, 92),
    focusY: clampPercent(Number(raw?.focusY ?? fallback.focusY), 8, 92),
  };
}

function normalizeBrandWorldAlternative(
  raw: Partial<BrandWorldAlternative> | undefined,
  fallback: BrandWorldAlternative,
) {
  return {
    world: raw?.world || fallback.world,
    title: truncate(normalizeWhitespace(raw?.title || fallback.title), 90) || fallback.title,
    tagline:
      truncate(normalizeWhitespace(raw?.tagline || fallback.tagline), 220) || fallback.tagline,
    note: truncate(normalizeWhitespace(raw?.note || fallback.note), 180) || fallback.note,
    posterUrl: raw?.posterUrl || fallback.posterUrl,
    isCurrent: typeof raw?.isCurrent === "boolean" ? raw.isCurrent : fallback.isCurrent,
  };
}

function buildScreenshotCallouts(
  report: Pick<
    BrandReport,
    "aboveTheFold" | "conversionRead" | "trustGaps" | "priorityFixes"
  >,
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>,
  anchors?: SiteCaptureAnchor[],
) {
  const heroAnchor = anchors?.find((item) => item.zone === "hero-promise");
  const proofAnchor = anchors?.find((item) => item.zone === "proof-cta");
  const heroHeading = heroAnchor?.text || websiteContext.headings[0] || "";
  const ctaLabels = websiteContext.callsToAction.slice(0, 2);

  const heroBody = heroHeading
    ? `The first visible promise appears to be "${heroHeading}". ${report.aboveTheFold}`
    : report.aboveTheFold;

  const ctaLead =
    proofAnchor?.text
      ? `The current decision layer appears around "${proofAnchor.text}", but it is being asked to carry too much conversion work before enough certainty has been built.`
      : ctaLabels.length > 0
      ? `Calls to action like "${ctaLabels.join('" and "')}" are being asked to work before enough certainty has been built.`
      : report.trustGaps[0] || report.conversionRead;

  const proofBody = `${ctaLead} ${report.priorityFixes.fixNow[0] || report.conversionRead}`;

  return [
    {
      zone: "hero-promise" as const,
      title: "Hero promise",
      body: truncate(normalizeWhitespace(heroBody), 118),
      x: heroAnchor?.x ?? 12,
      y: heroAnchor?.y ?? 13,
    },
    {
      zone: "proof-cta" as const,
      title: "Proof and CTA zone",
      body: truncate(normalizeWhitespace(proofBody), 118),
      x: proofAnchor?.x ?? 57,
      y: proofAnchor?.y ?? 62,
    },
  ];
}

function buildFallbackReport(url: string, read: BrandReadResult): BrandReport {
  const safeVisualWorld =
    typeof read.visualWorld === "string" && read.visualWorld
      ? read.visualWorld
      : "sage";
  const safeBrandName = normalizeWhitespace(read.brandName || "Brand");
  const safeTitle = normalizeWhitespace(read.title || "The Clearer Signal");
  const safeGenre = normalizeWhitespace(read.genre || "Editorial Diagnosis");
  const safeTagline = normalizeWhitespace(
    read.tagline || "The brand has quality. The promise still needs sharper edges.",
  );
  const safeWhatItDoes = normalizeWhitespace(
    read.whatItDoes ||
      `${safeBrandName} appears to offer a premium service with a stronger strategic signal than the current copy fully explains.`,
  );
  const safeSummary = normalizeWhitespace(
    read.summary || "The brand looks credible. The offer still lands too softly.",
  );
  const safeCurrent = normalizeWhitespace(
    read.current ||
      "The visual signal feels capable, but the homepage still makes the visitor work too hard to understand the offer.",
  );
  const safeStrength = normalizeWhitespace(
    read.strength || "The strongest signal is visual control and overall premium intent.",
  );
  const safeGap = normalizeWhitespace(
    read.gap || "The missing layer is faster commercial clarity in the first screen.",
  );
  const safeMismatch = normalizeWhitespace(
    read.mismatch || "The visual standard and the commercial story are not fully aligned yet.",
  );
  const safeVoice = normalizeWhitespace(
    read.voice || "AI tools can partially describe the brand, but the homepage still leaves room for generic summaries.",
  );
  const safeDirection = normalizeWhitespace(
    read.direction || "Sharpen the hero so the category, buyer, and payoff land earlier.",
  );
  const safeAmplify = normalizeWhitespace(
    read.amplify || "Amplify the visual control and the sense of technical seriousness.",
  );
  const safeDrop = normalizeWhitespace(
    read.drop || "Drop broad language that softens the opening promise.",
  );
  const safeStrongestSignal = normalizeWhitespace(
    read.strongestSignal || "The brand already looks controlled, premium, and intentional.",
  );
  const safeMainFriction = normalizeWhitespace(
    read.mainFriction || "The first screen delays clarity around the actual offer and outcome.",
  );
  const safeNextMove = normalizeWhitespace(
    read.nextMove || "Tighten the opening promise so the value lands before the atmosphere takes over.",
  );
  const safePosterScore = clampScore(read.posterScore, 68);
  const safePositioning = clampScore(read.positioningClarity, 68);
  const safeAiDiscoverability = clampScore(read.toneCoherence, 70);
  const safeVisual = clampScore(read.visualCredibility, 74);
  const safeOffer = clampScore(read.offerSpecificity, 66);
  const safeConversion = clampScore(read.conversionReadiness, 64);
  const industryHint = {
    world: safeVisualWorld,
    confidence: 0,
    label: "no clear industry pull",
  } satisfies IndustryArchetypeHint;
  const baseAudienceRead: AudienceRead = {
    primaryAudience: "Founders, decision-makers, and buyers comparing premium options.",
    whatTheyAreLookingFor: [
      "A clear explanation of what the brand actually offers.",
      "Proof that the quality is real, not just styled.",
      "A next step that feels worth their attention and time.",
    ],
    whatTheyNeedToFeel: [
      "That the brand is intentional, trustworthy, and in control.",
      "That they are looking at something sharper than the generic market.",
      "That saying yes would reduce uncertainty rather than create more of it.",
    ],
    whatTheyNeedToHear: [
      "Who this is for and what changes because of it.",
      "Why this offer is different in a way that matters commercially.",
      "What happens next if they take the next step.",
    ],
  };

  return {
    url,
    brandName: safeBrandName,
    visualWorld: safeVisualWorld,
    title: safeTitle,
    genre: safeGenre,
    tagline: safeTagline,
    posterScore: safePosterScore,
    scoreBand: read.scoreBand || scoreBandLabel(safePosterScore),
    scoreModifier: read.scoreModifier || bandModifier(safePosterScore),
    whatItDoes: safeWhatItDoes,
    snapshot: safeSummary,
    whatItSignals: safeCurrent,
    whatIsMissing: safeGap,
    whatToDoNext: safeDirection,
    whatToAmplify: safeAmplify,
    whatToDrop: safeDrop,
    surfaceCaptures: [
      {
        label: "Current website",
        kind: "website",
        href: url,
        note: "Primary homepage surface used to form the first commercial impression.",
        captureMethod: "metadata",
      },
      {
        label: "Brand signal",
        kind: "brand-signal",
        imageUrl: resolveWorldPoster(safeVisualWorld),
        note: "Poster layer used to frame the dominant visual world the brand suggests.",
        captureMethod: "poster",
      },
    ],
    screenshotCallouts: [
      {
        zone: "hero-promise",
        title: "Hero promise",
        body: safeGap,
        x: 12,
        y: 13,
      },
      {
        zone: "proof-cta",
        title: "Proof and CTA zone",
        body: safeNextMove,
        x: 57,
        y: 62,
      },
    ],
    scorecard: [
      {
        label: "Positioning clarity",
        score: safePositioning,
        note: "How quickly the offer becomes legible on the homepage.",
      },
      {
        label: "AI discoverability",
        score: safeAiDiscoverability,
        note: "How accurately AI tools can find, describe, and recommend the brand.",
      },
      {
        label: "Visual credibility",
        score: safeVisual,
        note: "How strongly the visual system implies quality and trust.",
      },
      {
        label: "Offer specificity",
        score: safeOffer,
        note: "How directly the brand explains what it does and why it matters.",
      },
      {
        label: "Conversion readiness",
        score: safeConversion,
        note: "How prepared the page feels to turn interest into a confident next step.",
      },
    ],
    positioningRead: safeCurrent,
    toneCheck: safeVoice,
    visualIdentityRead: safeStrength,
    aboveTheFold: safeGap,
    conversionRead:
      "The site creates interest and aesthetic trust, but it still leaves too much of the buying logic implicit. A stronger sense of proof, process, and expected outcome would make the next step feel more justified.",
    strategicDirection:
      "This brand should not move toward louder marketing. It should move toward sharper commercial clarity inside the premium signal it already owns. The strategy is to keep the atmosphere, but make the promise, proof, and decision path far more explicit so the brand reads as both desirable and commercially precise.",
    ...buildArchetypeLayer({
      brandName: safeBrandName,
      visualWorld: safeVisualWorld,
      industryHint,
      toneCheck: safeVoice,
      messagingPriorities: [
        "Make the first line do more work: audience, outcome, and difference should all be visible quickly.",
      ],
      positioningMoves: [
        "Move from broad brand mood to a more explicit commercial claim that says who the offer is for and why it matters now.",
      ],
      rewriteSuggestions: {
        heroLine: `${safeBrandName} helps clients understand the value faster, without losing the premium feel.`,
      },
    }),
    audienceRead: baseAudienceRead,
    verbalImage: {
      nameSignal: `${safeBrandName} sounds like it should stand for a clear signal, not a vague category story.`,
      headlineSignal: "The opening line is still too soft for the level of visual control the brand already has.",
      firstScreenTone: "The first screen sounds considered, but not decisive enough.",
      risk: "If the first words stay softer than the first impression, the brand will look more confident than it sounds.",
    },
    namingFit: {
      verdict: "Partial fit: the name is strong enough to own a role, but the homepage still has to define that role faster.",
      roleMatch: `The name can support a ${formatWorldName(safeVisualWorld).toLowerCase()} position, but the page is not locking that role in quickly enough.`,
      risk: "If the opening stays broad, the name will carry style before it carries meaning.",
      correction: "Use the hero to tell people exactly what kind of brand this is and what commercial territory it owns.",
    },
    headlineCorrection: {
      currentProblem: "The current first line is still building mood before it states the offer in business terms.",
      correctionLogic: "The headline should do three things fast: identify who it is for, state what changes, and make the value legible without a second read.",
      rewrittenDirection: `${safeBrandName} helps clients understand the value faster, without losing the premium feel.`,
    },
    brandKnownFor: `${safeBrandName} should be known for the clarity of its signal, not just the taste of its presentation.`,
    industryFit: {
      expectedArchetype: safeVisualWorld.charAt(0).toUpperCase() + safeVisualWorld.slice(1),
      assessment: "The category pull is not yet explicit here, so the current archetype read is being led by the surface signal.",
      leverage: "Use that signal to sharpen positioning faster instead of diluting it with softer category language.",
    },
    expectationGap: [
      "The page still leaves too much of the role implicit, so the audience has to fill in the blanks.",
      "If the brand wants to look more premium or more selective than the category norm, it has to say so faster.",
      "The visual story is ahead of the role story, which is why trust takes longer to form.",
    ],
    archetypeTests: [
      { name: "Hero test", verdict: "Weak: the first screen still lacks enough force and decision pressure." },
      { name: "Ruler test", verdict: "Partially passes: the brand has control, but not enough authority in the value story." },
      { name: "Sage test", verdict: "Weak: the page still asks the buyer to work too hard for clarity." },
      { name: "Creator test", verdict: "Partially passes: the point of view is there, but it is not yet tight enough commercially." },
    ],
    whatWorks: [
      safeStrongestSignal,
      "The visual system already creates a premium first impression.",
      "There is already enough point of view here to feel distinct rather than generic.",
    ],
    whatsBroken: [
      safeMainFriction,
      "The homepage leans on atmosphere before a concrete commercial promise.",
      "The visitor still has to infer too much about the offer before feeling ready to act.",
    ],
    whyNotConverting: [
      "The first screen creates mood faster than it creates certainty.",
      "The CTA appears before enough proof, process, or offer clarity has been built.",
      "The brand looks more resolved than the commercial story feels.",
    ],
    audienceMismatch: buildAudienceMismatchLayer(baseAudienceRead),
    mixedSignals: safeMismatch,
    frictionMap: [
      safeMainFriction,
      "The homepage leans on atmosphere before a concrete commercial promise.",
      "The verbal system needs to work as hard as the visual system already does.",
      "The first scroll does not resolve the buyer's uncertainty quickly enough.",
      "The journey hints at quality without fully explaining what happens after the visitor says yes.",
    ],
    trustGaps: [
      "There is not enough proof early enough for a buyer who is already comparison-shopping.",
      "The current page gives limited clarity around process, delivery, or what working with the brand actually looks like.",
      "The CTA arrives before enough commercial certainty has been built.",
    ],
    offerOpportunities: [
      "State the offer in one line that combines audience, transformation, and business value.",
      "Introduce a proof layer earlier so the premium feel is backed by visible evidence.",
      "Make the first scroll resolve the buyer's biggest question before moving deeper into atmosphere or brand world.",
    ],
    positioningMoves: [
      "Move from broad brand mood to a more explicit commercial claim that says who the offer is for and why it matters now.",
      "Anchor the brand around one primary value proposition instead of letting multiple soft signals compete for attention.",
      "Use the premium aesthetic as evidence of judgement, not as a substitute for explaining the offer.",
    ],
    messagingPriorities: [
      "Make the first line do more work: audience, outcome, and difference should all be visible quickly.",
      "Reduce language that sounds tasteful but non-committal, especially in the hero and first supporting section.",
      "Build a stronger hierarchy of proof, so the visitor is not asked to trust the atmosphere alone.",
    ],
    offerStrategy: [
      "Package the core offer around a clearer before-and-after transformation, not only a process description.",
      "Introduce stronger signals of scope, deliverable, or method so the premium price logic feels easier to follow.",
      "Design the call to action as the next logical business step, not just a polite invitation to learn more.",
    ],
    priorityFixes: {
      fixNow: [
        safeNextMove,
        "Bring the core value proposition into the first screen.",
        "Add a visible proof or credibility cue before the midpoint of the page.",
      ],
      fixNext: [
        "Tighten section-level copy so each block earns its place.",
        "Introduce proof or specificity earlier in the homepage flow.",
        "Make the CTA language more outcome-led so it feels like a natural decision, not just an invitation.",
      ],
      keep: [
        safeStrongestSignal,
        "Preserve the visual restraint and premium pacing that already create trust.",
        "Keep the authored point of view and visual control, because that is part of what makes the brand memorable.",
      ],
    },
    campaignAngles: [
      {
        title: "Behind the brand signal",
        angle:
          "Turn the audit itself into a campaign idea: show people what their brand is communicating before they realise it. This leans into the intelligence of the offer rather than only its polish.",
        whyItCouldWork:
          "It makes the product feel diagnostic and strategic at the same time, which is exactly where BrandMirror should sit.",
      },
      {
        title: "Why premium brands still lose trust",
        angle:
          "Build a content or landing sequence around the gap between looking elevated and being immediately believable. Show where visual strength is not yet matched by commercial clarity.",
        whyItCouldWork:
          "This creates tension, authority, and a clear reason for the audience to care right now.",
      },
      {
        title: "From tasteful to trusted",
        angle:
          "Frame the brand shift as a move from beautiful presentation to sharper commercial performance. The story becomes less about style alone and more about what the sharpened signal changes.",
        whyItCouldWork:
          "It gives the brand a practical growth narrative rather than leaving the conversation in aesthetics.",
      },
    ],
    actionPlan: {
      next7Days: [
        "Rewrite the hero so the promise lands in one read without sacrificing tone.",
        "Add one proof element and one process cue above the fold or directly below it.",
        "Remove decorative copy that creates mood without clarifying the offer.",
      ],
      next30Days: [
        "Restructure the homepage around a clearer decision sequence: promise, audience, proof, method, and next step.",
        "Test a more specific CTA and a more commercially direct offer framing.",
        "Develop one campaign or content angle that reinforces the sharpened positioning outside the homepage.",
      ],
    },
    rewriteSuggestions: {
      heroLine: `${safeBrandName} helps clients understand the value faster, without losing the premium feel.`,
      subheadline:
        "A sharper headline, clearer offer framing, and more immediate certainty would make the current visual system convert more effectively.",
      cta: "See how it works",
    },
    beforeAfterHero: {
      currentFrame: {
        label: "Before",
        title: "Current hero",
        body: safeGap,
        focusX: 18,
        focusY: 18,
      },
      rewrittenFrame: {
        eyebrow: "After",
        headline: `${safeBrandName} helps clients understand the value faster, without losing the premium feel.`,
        subheadline:
          "A sharper headline, clearer offer framing, and more immediate certainty would make the current visual system convert more effectively.",
        cta: "See how it works",
        note:
          "The rewritten hero should increase clarity without flattening the cinematic feel that already makes the brand memorable.",
        posterUrl: resolveWorldPoster(safeVisualWorld),
      },
    },
    brandWorldAlternatives: [
      {
        world: safeVisualWorld,
        title: `${safeBrandName} currently reads as ${formatWorldName(safeVisualWorld)}`,
        tagline: safeTagline,
        note: "This is the dominant visual archetype the current site is already reinforcing.",
        posterUrl: resolveWorldPoster(safeVisualWorld),
        isCurrent: true,
      },
      ...WORLD_ADJACENCY[safeVisualWorld].map((world, index) => ({
        world,
        title: `${formatWorldName(world)} is the adjacent lane`,
        tagline: index === 0 ? safeDirection : safeMismatch,
        note:
          index === 0
            ? "This adjacent world would make the brand feel more decisive without losing control."
            : "This adjacent world shows the alternate direction the brand could lean into if it wants more heat, movement, or distinction.",
        posterUrl: resolveWorldPoster(world),
        isCurrent: false,
      })),
    ],
    proofGallery: [
      {
        label: "Trust evidence",
        title: "Proof cluster",
        body: "The report should surface the exact places where credibility is being built or delayed.",
        focusX: 32,
        focusY: 56,
      },
      {
        label: "Offer evidence",
        title: "Offer imagery",
        body: "The strongest commercial images should reinforce what the brand actually sells.",
        focusX: 56,
        focusY: 64,
      },
      {
        label: "Support evidence",
        title: "Decision support",
        body: "These supporting surfaces show whether the page helps the buyer trust the next step.",
        focusX: 76,
        focusY: 72,
      },
    ],
    miniStoryboard: [
      {
        label: "Frame 01",
        title: "First impression",
        body: safeGap,
        focusX: 18,
        focusY: 18,
      },
      {
        label: "Frame 02",
        title: "Trust layer",
        body: "The middle layer should turn atmosphere into evidence before the visitor starts to hesitate.",
        focusX: 34,
        focusY: 56,
      },
      {
        label: "Frame 03",
        title: "Action layer",
        body: safeNextMove,
        focusX: 72,
        focusY: 70,
      },
    ],
    strategicNextMove:
      "Once the homepage is sharpened, the wider brand system should follow the same logic: one clearer promise, stronger proof sequencing, and a more explicit path from attention to action.",
  };
}

export async function generateBrandReportPreviewFromRead(
  url: string,
  read: BrandReadResult,
) {
  const normalized = normalizeUrl(url) || url;
  return buildFallbackReport(normalized, read);
}

function normalizeReport(raw: RawBrandReport, fallback: BrandReport): BrandReport {
  const scorecardSource =
    raw.scorecard && raw.scorecard.length > 0 ? raw.scorecard : fallback.scorecard;

  return {
    url: fallback.url,
    brandName: truncate(normalizeWhitespace(raw.brandName || fallback.brandName), 80),
    visualWorld: fallback.visualWorld,
    title: truncate(normalizeWhitespace(raw.title || fallback.title), 80),
    genre: truncate(normalizeWhitespace(raw.genre || fallback.genre), 48),
    tagline: truncate(normalizeWhitespace(raw.tagline || fallback.tagline), 140),
    posterScore: clampScore(raw.posterScore, fallback.posterScore),
    scoreBand: truncate(normalizeWhitespace(raw.scoreBand || fallback.scoreBand), 72),
    scoreModifier: truncate(normalizeWhitespace(raw.scoreModifier || fallback.scoreModifier), 180),
    whatItDoes: truncate(normalizeWhitespace(raw.whatItDoes || fallback.whatItDoes), 280),
    snapshot: truncate(
      normalizeWhitespace(raw.snapshot || fallback.snapshot),
      520,
    ),
    whatItSignals: truncate(normalizeWhitespace(raw.whatItSignals || fallback.whatItSignals), 900),
    whatIsMissing: truncate(normalizeWhitespace(raw.whatIsMissing || fallback.whatIsMissing), 900),
    whatToDoNext: truncate(normalizeWhitespace(raw.whatToDoNext || fallback.whatToDoNext), 900),
    whatToAmplify: truncate(normalizeWhitespace(raw.whatToAmplify || fallback.whatToAmplify), 760),
    whatToDrop: truncate(normalizeWhitespace(raw.whatToDrop || fallback.whatToDrop), 760),
    surfaceCaptures:
      raw.surfaceCaptures && raw.surfaceCaptures.length > 0
        ? raw.surfaceCaptures.slice(0, 3).map((item, index) => ({
            label:
              truncate(
                normalizeWhitespace(
                  item.label || fallback.surfaceCaptures[index]?.label || "Surface",
                ),
                48,
              ) || fallback.surfaceCaptures[index]?.label || "Surface",
            kind:
              item.kind === "website" ||
              item.kind === "social" ||
              item.kind === "brand-signal"
                ? item.kind
                : fallback.surfaceCaptures[index]?.kind || "website",
            imageUrl: item.imageUrl || fallback.surfaceCaptures[index]?.imageUrl,
            href: item.href || fallback.surfaceCaptures[index]?.href,
            captureMethod:
              item.captureMethod === "browser" ||
              item.captureMethod === "metadata" ||
              item.captureMethod === "poster"
                ? item.captureMethod
                : fallback.surfaceCaptures[index]?.captureMethod,
            note:
              truncate(
                normalizeWhitespace(
                  item.note || fallback.surfaceCaptures[index]?.note || "",
                ),
                180,
              ) || fallback.surfaceCaptures[index]?.note || "",
          }))
        : fallback.surfaceCaptures,
    screenshotCallouts:
      raw.screenshotCallouts && raw.screenshotCallouts.length > 0
        ? raw.screenshotCallouts.slice(0, 2).map((item, index) => ({
            zone:
              item.zone === "hero-promise" || item.zone === "proof-cta"
                ? item.zone
                : fallback.screenshotCallouts[index]?.zone || "hero-promise",
            title:
              truncate(
                normalizeWhitespace(
                  item.title || fallback.screenshotCallouts[index]?.title || "Callout",
                ),
                48,
              ) || fallback.screenshotCallouts[index]?.title || "Callout",
            body:
              truncate(
                normalizeWhitespace(
                  item.body || fallback.screenshotCallouts[index]?.body || "",
                ),
                180,
              ) || fallback.screenshotCallouts[index]?.body || "",
            x: Math.max(8, Math.min(78, Number(item.x ?? fallback.screenshotCallouts[index]?.x ?? 16))),
            y: Math.max(10, Math.min(76, Number(item.y ?? fallback.screenshotCallouts[index]?.y ?? 16))),
          }))
        : fallback.screenshotCallouts,
    scorecard: scorecardSource.slice(0, 5).map((item, index) => ({
      label:
        truncate(
          normalizeWhitespace(item.label || fallback.scorecard[index]?.label || "Score"),
          48,
        ) || fallback.scorecard[index]?.label || "Score",
      score: clampScore(item.score, fallback.scorecard[index]?.score || 70),
      note:
        truncate(
          normalizeWhitespace(item.note || fallback.scorecard[index]?.note || ""),
          160,
        ) || fallback.scorecard[index]?.note || "",
    })),
    positioningRead: truncate(
      normalizeWhitespace(raw.positioningRead || fallback.positioningRead),
      900,
    ),
    toneCheck: truncate(
      normalizeWhitespace(raw.toneCheck || fallback.toneCheck),
      900,
    ),
    visualIdentityRead: truncate(
      normalizeWhitespace(raw.visualIdentityRead || fallback.visualIdentityRead),
      900,
    ),
    aboveTheFold: truncate(
      normalizeWhitespace(raw.aboveTheFold || fallback.aboveTheFold),
      900,
    ),
    conversionRead: truncate(
      normalizeWhitespace(raw.conversionRead || fallback.conversionRead),
      900,
    ),
    strategicDirection: truncate(
      normalizeWhitespace(raw.strategicDirection || fallback.strategicDirection),
      900,
    ),
    archetypeRead: {
      primary:
        truncate(
          normalizeWhitespace(raw.archetypeRead?.primary || fallback.archetypeRead.primary),
          40,
        ) || fallback.archetypeRead.primary,
      secondary:
        truncate(
          normalizeWhitespace(raw.archetypeRead?.secondary || fallback.archetypeRead.secondary),
          40,
        ) || fallback.archetypeRead.secondary,
      rationale:
        truncate(
          normalizeWhitespace(raw.archetypeRead?.rationale || fallback.archetypeRead.rationale),
          280,
        ) || fallback.archetypeRead.rationale,
    },
    aestheticDirections:
      raw.aestheticDirections && raw.aestheticDirections.length > 0
        ? raw.aestheticDirections.slice(0, 3).map((item, index) => ({
            name:
              truncate(
                normalizeWhitespace(item.name || fallback.aestheticDirections[index]?.name || "Direction"),
                48,
              ) || fallback.aestheticDirections[index]?.name || "Direction",
            note:
              truncate(
                normalizeWhitespace(item.note || fallback.aestheticDirections[index]?.note || ""),
                180,
              ) || fallback.aestheticDirections[index]?.note || "",
          }))
        : fallback.aestheticDirections,
    culturalAssociations: {
      films:
        raw.culturalAssociations?.films?.length
          ? raw.culturalAssociations.films.map((item) => truncate(normalizeWhitespace(item), 48)).slice(0, 4)
          : fallback.culturalAssociations.films,
      eras:
        raw.culturalAssociations?.eras?.length
          ? raw.culturalAssociations.eras.map((item) => truncate(normalizeWhitespace(item), 48)).slice(0, 4)
          : fallback.culturalAssociations.eras,
      art:
        raw.culturalAssociations?.art?.length
          ? raw.culturalAssociations.art.map((item) => truncate(normalizeWhitespace(item), 48)).slice(0, 4)
          : fallback.culturalAssociations.art,
      music:
        raw.culturalAssociations?.music?.length
          ? raw.culturalAssociations.music.map((item) => truncate(normalizeWhitespace(item), 48)).slice(0, 4)
          : fallback.culturalAssociations.music,
    },
    visualCodes: {
      palette:
        raw.visualCodes?.palette?.length
          ? raw.visualCodes.palette.map((item) => truncate(normalizeWhitespace(item), 36)).slice(0, 4)
          : fallback.visualCodes.palette,
      textures:
        raw.visualCodes?.textures?.length
          ? raw.visualCodes.textures.map((item) => truncate(normalizeWhitespace(item), 36)).slice(0, 4)
          : fallback.visualCodes.textures,
      symbols:
        raw.visualCodes?.symbols?.length
          ? raw.visualCodes.symbols.map((item) => truncate(normalizeWhitespace(item), 36)).slice(0, 4)
          : fallback.visualCodes.symbols,
      forms:
        raw.visualCodes?.forms?.length
          ? raw.visualCodes.forms.map((item) => truncate(normalizeWhitespace(item), 36)).slice(0, 4)
          : fallback.visualCodes.forms,
    },
    toneOfVoice:
      raw.toneOfVoice && raw.toneOfVoice.length > 0
        ? raw.toneOfVoice.map((item) => truncate(normalizeWhitespace(item), 180)).slice(0, 4)
        : fallback.toneOfVoice,
    audienceRead: {
      primaryAudience:
        truncate(
          normalizeWhitespace(
            raw.audienceRead?.primaryAudience || fallback.audienceRead.primaryAudience,
          ),
          180,
        ) || fallback.audienceRead.primaryAudience,
      whatTheyAreLookingFor:
        raw.audienceRead?.whatTheyAreLookingFor?.length
          ? raw.audienceRead.whatTheyAreLookingFor
              .map((item) => truncate(normalizeWhitespace(item), 160))
              .slice(0, 4)
          : fallback.audienceRead.whatTheyAreLookingFor,
      whatTheyNeedToFeel:
        raw.audienceRead?.whatTheyNeedToFeel?.length
          ? raw.audienceRead.whatTheyNeedToFeel
              .map((item) => truncate(normalizeWhitespace(item), 160))
              .slice(0, 4)
          : fallback.audienceRead.whatTheyNeedToFeel,
      whatTheyNeedToHear:
        raw.audienceRead?.whatTheyNeedToHear?.length
          ? raw.audienceRead.whatTheyNeedToHear
              .map((item) => truncate(normalizeWhitespace(item), 160))
              .slice(0, 4)
          : fallback.audienceRead.whatTheyNeedToHear,
    },
    verbalImage: {
      nameSignal:
        truncate(
          normalizeWhitespace(raw.verbalImage?.nameSignal || fallback.verbalImage.nameSignal),
          180,
        ) || fallback.verbalImage.nameSignal,
      headlineSignal:
        truncate(
          normalizeWhitespace(
            raw.verbalImage?.headlineSignal || fallback.verbalImage.headlineSignal,
          ),
          180,
        ) || fallback.verbalImage.headlineSignal,
      firstScreenTone:
        truncate(
          normalizeWhitespace(
            raw.verbalImage?.firstScreenTone || fallback.verbalImage.firstScreenTone,
          ),
          180,
        ) || fallback.verbalImage.firstScreenTone,
      risk:
        truncate(
          normalizeWhitespace(raw.verbalImage?.risk || fallback.verbalImage.risk),
          180,
        ) || fallback.verbalImage.risk,
    },
    namingFit: {
      verdict:
        truncate(
          normalizeWhitespace(raw.namingFit?.verdict || fallback.namingFit.verdict),
          180,
        ) || fallback.namingFit.verdict,
      roleMatch:
        truncate(
          normalizeWhitespace(raw.namingFit?.roleMatch || fallback.namingFit.roleMatch),
          180,
        ) || fallback.namingFit.roleMatch,
      risk:
        truncate(
          normalizeWhitespace(raw.namingFit?.risk || fallback.namingFit.risk),
          180,
        ) || fallback.namingFit.risk,
      correction:
        truncate(
          normalizeWhitespace(raw.namingFit?.correction || fallback.namingFit.correction),
          180,
        ) || fallback.namingFit.correction,
    },
    headlineCorrection: {
      currentProblem:
        truncate(
          normalizeWhitespace(
            raw.headlineCorrection?.currentProblem ||
              fallback.headlineCorrection.currentProblem,
          ),
          180,
        ) || fallback.headlineCorrection.currentProblem,
      correctionLogic:
        truncate(
          normalizeWhitespace(
            raw.headlineCorrection?.correctionLogic ||
              fallback.headlineCorrection.correctionLogic,
          ),
          180,
        ) || fallback.headlineCorrection.correctionLogic,
      rewrittenDirection:
        truncate(
          normalizeWhitespace(
            raw.headlineCorrection?.rewrittenDirection ||
              fallback.headlineCorrection.rewrittenDirection,
          ),
          180,
        ) || fallback.headlineCorrection.rewrittenDirection,
    },
    brandKnownFor: truncate(
      normalizeWhitespace(raw.brandKnownFor || fallback.brandKnownFor),
      220,
    ),
    industryFit: {
      expectedArchetype:
        truncate(
          normalizeWhitespace(
            raw.industryFit?.expectedArchetype || fallback.industryFit.expectedArchetype,
          ),
          40,
        ) || fallback.industryFit.expectedArchetype,
      assessment:
        truncate(
          normalizeWhitespace(
            raw.industryFit?.assessment || fallback.industryFit.assessment,
          ),
          220,
        ) || fallback.industryFit.assessment,
      leverage:
        truncate(
          normalizeWhitespace(
            raw.industryFit?.leverage || fallback.industryFit.leverage,
          ),
          180,
        ) || fallback.industryFit.leverage,
    },
    expectationGap:
      raw.expectationGap && raw.expectationGap.length > 0
        ? raw.expectationGap
            .map((item) => truncate(normalizeWhitespace(item), 180))
            .slice(0, 4)
        : fallback.expectationGap,
    archetypeTests:
      raw.archetypeTests && raw.archetypeTests.length > 0
        ? raw.archetypeTests.slice(0, 4).map((item, index) => ({
            name:
              truncate(
                normalizeWhitespace(
                  item.name || fallback.archetypeTests[index]?.name || "Test",
                ),
                40,
              ) || fallback.archetypeTests[index]?.name || "Test",
            verdict:
              truncate(
                normalizeWhitespace(
                  item.verdict || fallback.archetypeTests[index]?.verdict || "",
                ),
                180,
              ) || fallback.archetypeTests[index]?.verdict || "",
          }))
        : fallback.archetypeTests,
    whatWorks:
      raw.whatWorks && raw.whatWorks.length > 0
        ? raw.whatWorks.map((item) => truncate(normalizeWhitespace(item), 180)).slice(0, 4)
        : fallback.whatWorks,
    whatsBroken:
      raw.whatsBroken && raw.whatsBroken.length > 0
        ? raw.whatsBroken.map((item) => truncate(normalizeWhitespace(item), 180)).slice(0, 4)
        : fallback.whatsBroken,
    whyNotConverting:
      raw.whyNotConverting && raw.whyNotConverting.length > 0
        ? raw.whyNotConverting
            .map((item) => truncate(normalizeWhitespace(item), 180))
            .slice(0, 4)
        : fallback.whyNotConverting,
    audienceMismatch:
      raw.audienceMismatch && raw.audienceMismatch.length > 0
        ? raw.audienceMismatch
            .map((item) => truncate(normalizeWhitespace(item), 180))
            .slice(0, 4)
        : fallback.audienceMismatch,
    brandMyth: truncate(
      normalizeWhitespace(raw.brandMyth || fallback.brandMyth),
      320,
    ),
    mixedSignals: truncate(
      normalizeWhitespace(raw.mixedSignals || fallback.mixedSignals),
      900,
    ),
    frictionMap:
      raw.frictionMap && raw.frictionMap.length > 0
        ? raw.frictionMap.map((item) => truncate(normalizeWhitespace(item), 200)).slice(0, 6)
        : fallback.frictionMap,
    trustGaps:
      raw.trustGaps && raw.trustGaps.length > 0
        ? raw.trustGaps.map((item) => truncate(normalizeWhitespace(item), 200)).slice(0, 4)
        : fallback.trustGaps,
    offerOpportunities:
      raw.offerOpportunities && raw.offerOpportunities.length > 0
        ? raw.offerOpportunities
            .map((item) => truncate(normalizeWhitespace(item), 220))
            .slice(0, 4)
        : fallback.offerOpportunities,
    positioningMoves:
      raw.positioningMoves && raw.positioningMoves.length > 0
        ? raw.positioningMoves
            .map((item) => truncate(normalizeWhitespace(item), 220))
            .slice(0, 4)
        : fallback.positioningMoves,
    messagingPriorities:
      raw.messagingPriorities && raw.messagingPriorities.length > 0
        ? raw.messagingPriorities
            .map((item) => truncate(normalizeWhitespace(item), 220))
            .slice(0, 4)
        : fallback.messagingPriorities,
    offerStrategy:
      raw.offerStrategy && raw.offerStrategy.length > 0
        ? raw.offerStrategy
            .map((item) => truncate(normalizeWhitespace(item), 220))
            .slice(0, 4)
        : fallback.offerStrategy,
    priorityFixes: {
      fixNow:
        raw.priorityFixes?.fixNow?.length
          ? raw.priorityFixes.fixNow
              .map((item) => truncate(normalizeWhitespace(item), 180))
              .slice(0, 4)
          : fallback.priorityFixes.fixNow,
      fixNext:
        raw.priorityFixes?.fixNext?.length
          ? raw.priorityFixes.fixNext
              .map((item) => truncate(normalizeWhitespace(item), 180))
              .slice(0, 4)
          : fallback.priorityFixes.fixNext,
      keep:
        raw.priorityFixes?.keep?.length
          ? raw.priorityFixes.keep
              .map((item) => truncate(normalizeWhitespace(item), 180))
              .slice(0, 4)
          : fallback.priorityFixes.keep,
    },
    campaignAngles:
      raw.campaignAngles && raw.campaignAngles.length > 0
        ? raw.campaignAngles.slice(0, 3).map((item, index) => ({
            title:
              truncate(
                normalizeWhitespace(
                  item.title || fallback.campaignAngles[index]?.title || "Angle",
                ),
                60,
              ) || fallback.campaignAngles[index]?.title || "Angle",
            angle:
              truncate(
                normalizeWhitespace(
                  item.angle || fallback.campaignAngles[index]?.angle || "",
                ),
                260,
              ) || fallback.campaignAngles[index]?.angle || "",
            whyItCouldWork:
              truncate(
                normalizeWhitespace(
                  item.whyItCouldWork ||
                    fallback.campaignAngles[index]?.whyItCouldWork ||
                    "",
                ),
                220,
              ) || fallback.campaignAngles[index]?.whyItCouldWork || "",
          }))
        : fallback.campaignAngles,
    rewriteSuggestions: {
      heroLine:
        truncate(
          normalizeWhitespace(
            raw.rewriteSuggestions?.heroLine || fallback.rewriteSuggestions.heroLine,
          ),
          160,
        ) || fallback.rewriteSuggestions.heroLine,
      subheadline:
        truncate(
          normalizeWhitespace(
            raw.rewriteSuggestions?.subheadline ||
              fallback.rewriteSuggestions.subheadline,
          ),
          220,
        ) || fallback.rewriteSuggestions.subheadline,
      cta:
        truncate(
          normalizeWhitespace(raw.rewriteSuggestions?.cta || fallback.rewriteSuggestions.cta),
          60,
        ) || fallback.rewriteSuggestions.cta,
    },
    beforeAfterHero: {
      currentFrame: normalizeVisualFocusFrame(
        raw.beforeAfterHero?.currentFrame,
        fallback.beforeAfterHero.currentFrame,
      ),
      rewrittenFrame: {
        eyebrow:
          truncate(
            normalizeWhitespace(
              raw.beforeAfterHero?.rewrittenFrame?.eyebrow ||
                fallback.beforeAfterHero.rewrittenFrame.eyebrow,
            ),
            30,
          ) || fallback.beforeAfterHero.rewrittenFrame.eyebrow,
        headline:
          truncate(
            normalizeWhitespace(
              raw.beforeAfterHero?.rewrittenFrame?.headline ||
                fallback.beforeAfterHero.rewrittenFrame.headline,
            ),
            180,
          ) || fallback.beforeAfterHero.rewrittenFrame.headline,
        subheadline:
          truncate(
            normalizeWhitespace(
              raw.beforeAfterHero?.rewrittenFrame?.subheadline ||
                fallback.beforeAfterHero.rewrittenFrame.subheadline,
            ),
            240,
          ) || fallback.beforeAfterHero.rewrittenFrame.subheadline,
        cta:
          truncate(
            normalizeWhitespace(
              raw.beforeAfterHero?.rewrittenFrame?.cta ||
                fallback.beforeAfterHero.rewrittenFrame.cta,
            ),
            60,
          ) || fallback.beforeAfterHero.rewrittenFrame.cta,
        note:
          truncate(
            normalizeWhitespace(
              raw.beforeAfterHero?.rewrittenFrame?.note ||
                fallback.beforeAfterHero.rewrittenFrame.note,
            ),
            220,
          ) || fallback.beforeAfterHero.rewrittenFrame.note,
        posterUrl:
          raw.beforeAfterHero?.rewrittenFrame?.posterUrl ||
          fallback.beforeAfterHero.rewrittenFrame.posterUrl,
      },
    },
    brandWorldAlternatives:
      raw.brandWorldAlternatives && raw.brandWorldAlternatives.length > 0
        ? raw.brandWorldAlternatives
            .slice(0, 3)
            .map((item, index) =>
              normalizeBrandWorldAlternative(
                item,
                fallback.brandWorldAlternatives[index] ||
                  fallback.brandWorldAlternatives[0],
              ),
            )
        : fallback.brandWorldAlternatives,
    proofGallery:
      raw.proofGallery && raw.proofGallery.length > 0
        ? raw.proofGallery
            .slice(0, 3)
            .map((item, index) =>
              normalizeVisualFocusFrame(
                item,
                fallback.proofGallery[index] || fallback.proofGallery[0],
              ),
            )
        : fallback.proofGallery,
    miniStoryboard:
      raw.miniStoryboard && raw.miniStoryboard.length > 0
        ? raw.miniStoryboard
            .slice(0, 3)
            .map((item, index) =>
              normalizeVisualFocusFrame(
                item,
                fallback.miniStoryboard[index] || fallback.miniStoryboard[0],
              ),
            )
        : fallback.miniStoryboard,
    actionPlan: {
      next7Days:
        raw.actionPlan?.next7Days?.length
          ? raw.actionPlan.next7Days
              .map((item) => truncate(normalizeWhitespace(item), 190))
              .slice(0, 4)
          : fallback.actionPlan.next7Days,
      next30Days:
        raw.actionPlan?.next30Days?.length
          ? raw.actionPlan.next30Days
              .map((item) => truncate(normalizeWhitespace(item), 190))
              .slice(0, 4)
          : fallback.actionPlan.next30Days,
    },
    strategicNextMove: truncate(
      normalizeWhitespace(raw.strategicNextMove || fallback.strategicNextMove),
      300,
    ),
  };
}

async function requestGeminiBrandReport(
  url: string,
  firstRead: BrandReadResult,
  websiteContext: Awaited<ReturnType<typeof fetchWebsiteContext>>,
  language: SiteLocale,
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const targetLanguage = LANGUAGE_NAMES[language];

  const prompt = `
You are BrandMirror, a premium standalone brand diagnostic product built by SAHAR Studio.

Your task is to expand a first-read result into a fuller paid report.

Important rules:
- Be commercially useful, not generic.
- Sound calm, premium, editorial, and intelligent.
- Use plain English. Avoid consultant jargon.
- Sound like a sharp human strategist, not compliance copy.
- Do not mention AI, scraping, frameworks, or missing information.
- Keep each section specific enough to justify a paid report.
- Make the report feel like a practical paid diagnostic, not a clever summary.
- Prioritize concrete audit observations, commercially meaningful fixes, and usable next moves.
- For whatWorks, whatsBroken, whyNotConverting, audienceMismatch, priorityFixes, and toneOfVoice: write short, hard, commercially direct lines.
- Avoid soft framing like "could", "might", "appears to", "it seems", or "there is an opportunity to" unless uncertainty is genuinely unavoidable.
- Prefer verdict language over poetic language in the top half of the report.
- Use concrete nouns from the actual site where possible: the buyer, the page, the headline, the offer, the click, the proof.
- Use friction, trust, and desire language the way a good strategist would in conversation, not the way a corporate PDF does.
- If a sentence sounds like a memo, rewrite it until it sounds like an observation a smart person would actually say aloud.
- A good line should make the reader feel seen, slightly exposed, and clear on what to do next.
- The writing should move like this: attention -> interest -> trust -> action.
- Match descriptive vocabulary to the brand's actual category. This matters for every prose field.
  - For financial, investment, legal, advisory, consulting, or B2B-service brands: use discipline, rigor, conviction, judgment, authority, restraint, fluency. Do NOT use performance, athletic, physical, driven, muscular, or kinetic language.
  - For performance, sport, outdoor, or athletic brands: use drive, pressure, stamina, physicality. Do NOT use clinical, advisory, or academic vocabulary.
  - For wellness, therapy, health, or care brands: use steadiness, warmth, attention, competence. Do NOT use combative or performance vocabulary.
  - For luxury, lifestyle, fashion, or hospitality brands: use taste, composure, desirability, selectiveness. Do NOT use technical or clinical vocabulary.
  - For creative studios, editorial, design, or cultural brands: use point of view, authorship, intelligence, taste. Do NOT use SaaS or growth-hack vocabulary.
  - When in doubt about industry, default to neutral language (considered, intentional, controlled) rather than borrowing energy from the wrong category.
- Write every user-facing sentence in ${targetLanguage}.
- Keep structural enums and machine-readable fields stable:
  - Keep screenshotCallouts.zone values in English.
  - Keep surfaceCaptures.kind and captureMethod values in English.
  - Keep scorecard labels exactly as: Positioning clarity, AI discoverability, Visual credibility, Offer specificity, Conversion readiness.
- Return only valid JSON.

Website URL:
${url}

Existing first-read:
- Brand name: ${firstRead.brandName}
- Poster title: ${firstRead.title}
- Tagline: ${firstRead.tagline}
- Summary: ${firstRead.summary}
- Current signal: ${firstRead.current}
- Strength: ${firstRead.strength}
- Gap: ${firstRead.gap}
- Mismatch: ${firstRead.mismatch}
- AI discoverability read: ${firstRead.voice}
- Next move: ${firstRead.direction}
- Strongest signal: ${firstRead.strongestSignal}
- Main friction: ${firstRead.mainFriction}
- Clarity score (positioning): ${firstRead.positioningClarity}
- Visual credibility: ${firstRead.visualCredibility}
- AI discoverability: ${firstRead.toneCoherence}
- Offer specificity: ${firstRead.offerSpecificity}
- Conversion readiness: ${firstRead.conversionReadiness}

Website context:
- Title: ${websiteContext.title || "n/a"}
- OG title: ${websiteContext.ogTitle || "n/a"}
- Description: ${websiteContext.description || "n/a"}
- OG image: ${websiteContext.ogImage || "n/a"}
- Icon: ${websiteContext.icon || "n/a"}
- Headings:
${websiteContext.headings.map((item) => `  - ${item}`).join("\n") || "  - n/a"}
- Calls to action:
${websiteContext.callsToAction.map((item) => `  - ${item}`).join("\n") || "  - n/a"}
- Visible text:
${websiteContext.visibleText || "n/a"}

Scorecard rules. The scorecard MUST contain exactly five items, in this order: Positioning clarity, AI discoverability, Visual credibility, Offer specificity, Conversion readiness. Do not omit any item. Do not add any item. Do not reorder. Each score is an integer 0-100.

Scoring rubric. Anchor every score to the bands below rather than going on feel. The bands are: 0-30 FLATLINING, 30-50 FRAGILE, 50-70 DEVELOPING, 70-85 STABLE, 85-100 LEADING. A brand most people would call "strong" usually lives in 70-85. 85+ is reserved for pages that already convert before the copy does any explaining.

CALIBRATION GUARDS — apply these before every score.
- 85-100 is rare. Reserved for brands visually indistinguishable from a top-10 player in their category (Stripe, Linear, Aesop, Arc, Hermès, Apple). A WordPress theme, Squarespace template, generic dark-gradient SaaS hero, or stock-photo-heavy B2B page caps at 75.
- Do not place more than ONE axis above 85 unless at least three other axes are already comfortably above 75. A brand cannot be "leading" on one thing while being ordinary on the rest.
- Default to 60-80 for most brands. If your instinct says "this feels solid", that is STABLE (70-85), not LEADING. Move the number down if you catch yourself being generous.

Positioning clarity — how quickly the homepage makes the offer legible to a first-time visitor.
- 0-30   the visitor cannot say what this company does after 10 seconds. Hero is mood-only, abstract, or buried.
- 30-50  the category is vaguely guessable but the exact offer is unclear. Insider jargon or mood-first design.
- 50-70  category is clear, exact offer takes effort. Page leans on shorthand the buyer must decode.
- 70-85  offer and audience are legible inside the hero frame.
- 85-100  offer, audience, and reason-to-care all land before the first scroll.

AI discoverability — whether AI tools (ChatGPT, Gemini, Perplexity, Google AI Overviews) can find, accurately describe, and recommend this brand.
- 0-30   AI tools cannot find or describe the brand at all. Completely invisible to AI search.
- 30-50  AI tools find the domain but cannot accurately describe what the brand does. Generic or misleading summaries.
- 50-70  AI tools find the brand and get the category right but miss specifics. Some meta descriptions exist but lack precision.
- 70-85  AI tools can accurately describe what the brand does and for whom. Clear meta descriptions, some structured data.
- 85-100  Brand is fully optimized for AI discovery. Rich structured data, comprehensive FAQ, consistent naming, clear claims AI can quote.

Visual credibility — whether the design signals quality, control, and category trust.
- 0-30   amateur feel, broken layout, stock imagery mismatched to brand. Design actively repels trust.
- 30-50  template feel is obvious. Generic theme with minimal customization. Design undercuts the price.
- 50-70  competent but generic. Nothing marks this as category-leader.
- 70-85  considered, intentional, on-brand. A buyer would accept a premium price without flinching.
- 85-100  unmistakable. Visual system does conversion work before copy has to help.

Offer specificity — how directly the page explains what exactly is sold, to whom, and why it matters now.
- 0-30   offer is never stated. Reader leaves unable to say what they would be buying.
- 30-50  offer is implied through mood or vague language. "We help businesses grow" level of specificity.
- 50-70  the what is present but the for-whom and why-now are vague.
- 70-85  what / who / why are on the page, even if the reader has to move past the hero to find them.
- 85-100  the first screen states the offer concretely, with who it is for and what it resolves.

Conversion readiness — whether the page has earned a confident next step by the time a motivated buyer looks for one.
- 0-30   no clear next step exists, or only a generic "contact us" buried at the bottom. No proof, no path.
- 30-50  a CTA exists but is disconnected from the value proposition. No social proof nearby, vague commitment.
- 50-70  CTAs exist but are underpowered — weak proof, vague value, mismatched commitment.
- 70-85  next step is clear and earned for the most likely buyer; minor friction on edge cases.
- 85-100  the CTA is obvious, proof is within reach, and the commitment level matches the page's promise.

Return JSON with exactly these keys. Do not omit any scorecard item under any circumstance — if you are genuinely uncertain, estimate to the nearest 5 and commit. Do not return "null", "0", or an empty string for any score.
{
  "brandName": "string",
  "title": "string",
  "tagline": "string",
  "snapshot": "2 blunt commercial sentences",
  "surfaceCaptures": [
    {
      "label": "Current website",
      "kind": "website | social | brand-signal",
      "imageUrl": "optional image url if one exists",
      "href": "surface url",
      "captureMethod": "browser | metadata | poster",
      "note": "what this surface is communicating"
    }
  ],
  "screenshotCallouts": [
    { "zone": "hero-promise", "title": "string", "body": "1-2 sentences", "x": 12, "y": 13 },
    { "zone": "proof-cta", "title": "string", "body": "1-2 sentences", "x": 57, "y": 62 }
  ],
  "scorecard": [
    { "label": "Positioning clarity", "score": 78, "note": "short note" },
    { "label": "AI discoverability", "score": 82, "note": "short note" },
    { "label": "Visual credibility", "score": 86, "note": "short note" },
    { "label": "Offer specificity", "score": 71, "note": "short note" },
    { "label": "Conversion readiness", "score": 74, "note": "short note" }
  ],
  "positioningRead": "2-4 sentences, specific and human",
  "toneCheck": "2-4 sentences, specific and human",
  "visualIdentityRead": "2-4 sentences, specific and human",
  "aboveTheFold": "2-4 sentences, specific and human",
  "conversionRead": "2-4 sentences, specific and human",
  "strategicDirection": "2-4 sentences, specific and human",
  "archetypeRead": {
    "primary": "string",
    "secondary": "string",
    "rationale": "2-4 sentences"
  },
  "aestheticDirections": [
    { "name": "string", "note": "1-2 sentences" }
  ],
  "culturalAssociations": {
    "films": ["item", "item"],
    "eras": ["item", "item"],
    "art": ["item", "item"],
    "music": ["item", "item"]
  },
  "visualCodes": {
    "palette": ["item", "item", "item"],
    "textures": ["item", "item", "item"],
    "symbols": ["item", "item", "item"],
    "forms": ["item", "item", "item"]
  },
  "toneOfVoice": ["short hard line", "short hard line", "short hard line"],
  "audienceRead": {
    "primaryAudience": "string",
    "whatTheyAreLookingFor": ["item", "item", "item"],
    "whatTheyNeedToFeel": ["item", "item", "item"],
    "whatTheyNeedToHear": ["item", "item", "item"]
  },
  "verbalImage": {
    "nameSignal": "short hard line",
    "headlineSignal": "short hard line",
    "firstScreenTone": "short hard line",
    "risk": "short hard line"
  },
  "namingFit": {
    "verdict": "short hard line",
    "roleMatch": "short hard line",
    "risk": "short hard line",
    "correction": "short hard line"
  },
  "headlineCorrection": {
    "currentProblem": "short hard line",
    "correctionLogic": "short hard line",
    "rewrittenDirection": "short hard line"
  },
  "brandKnownFor": "2 short sentences answering what this brand should be known for",
  "industryFit": {
    "expectedArchetype": "string",
    "assessment": "2-3 hard lines",
    "leverage": "1-2 hard lines"
  },
  "expectationGap": ["short hard line", "short hard line", "short hard line"],
  "archetypeTests": [
    { "name": "Hero test", "verdict": "short hard line" },
    { "name": "Ruler test", "verdict": "short hard line" }
  ],
  "whatWorks": ["short hard line", "short hard line", "short hard line"],
  "whatsBroken": ["short hard line", "short hard line", "short hard line"],
  "whyNotConverting": ["short hard line", "short hard line", "short hard line"],
  "audienceMismatch": ["short hard line", "short hard line", "short hard line"],
  "brandMyth": "2-3 sentences",
  "mixedSignals": "2-4 sentences",
  "frictionMap": ["item", "item", "item", "item"],
  "trustGaps": ["item", "item", "item"],
  "offerOpportunities": ["item", "item", "item"],
  "positioningMoves": ["item", "item", "item"],
  "messagingPriorities": ["item", "item", "item"],
  "offerStrategy": ["item", "item", "item"],
  "priorityFixes": {
    "fixNow": ["item", "item", "item"],
    "fixNext": ["item", "item", "item"],
    "keep": ["item", "item", "item"]
  },
  "campaignAngles": [
    {
      "title": "string",
      "angle": "1-2 concrete sentences",
      "whyItCouldWork": "1 concrete sentence"
    }
  ],
  "actionPlan": {
    "next7Days": ["item", "item", "item"],
    "next30Days": ["item", "item", "item"]
  },
  "rewriteSuggestions": {
    "heroLine": "string",
    "subheadline": "string",
    "cta": "string"
  },
  "strategicNextMove": "2 blunt, useful sentences"
}
`;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a brand strategist. Always respond with valid JSON only, no markdown fences.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content || "";

  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }

  return extractJson(text) as RawBrandReport;
}

async function localizeBrandReport(report: BrandReport, language: SiteLocale) {
  if (language === "en") {
    return report;
  }
  const translated = await translateTexts(
    [
      report.title,
      report.genre,
      report.tagline,
      report.scoreBand,
      report.scoreModifier,
      report.snapshot,
      ...report.surfaceCaptures.flatMap((item) => [item.label, item.note]),
      ...report.screenshotCallouts.flatMap((item) => [item.title, item.body]),
      ...report.scorecard.map((item) => item.note),
      report.positioningRead,
      report.toneCheck,
      report.visualIdentityRead,
      report.aboveTheFold,
      report.conversionRead,
      report.strategicDirection,
      report.archetypeRead.rationale,
      ...report.aestheticDirections.flatMap((item) => [item.name, item.note]),
      ...report.culturalAssociations.films,
      ...report.culturalAssociations.eras,
      ...report.culturalAssociations.art,
      ...report.culturalAssociations.music,
      ...report.visualCodes.palette,
      ...report.visualCodes.textures,
      ...report.visualCodes.symbols,
      ...report.visualCodes.forms,
      ...report.toneOfVoice,
      report.audienceRead.primaryAudience,
      ...report.audienceRead.whatTheyAreLookingFor,
      ...report.audienceRead.whatTheyNeedToFeel,
      ...report.audienceRead.whatTheyNeedToHear,
      report.verbalImage.nameSignal,
      report.verbalImage.headlineSignal,
      report.verbalImage.firstScreenTone,
      report.verbalImage.risk,
      report.namingFit.verdict,
      report.namingFit.roleMatch,
      report.namingFit.risk,
      report.namingFit.correction,
      report.headlineCorrection.currentProblem,
      report.headlineCorrection.correctionLogic,
      report.headlineCorrection.rewrittenDirection,
      report.brandKnownFor,
      report.industryFit.expectedArchetype,
      report.industryFit.assessment,
      report.industryFit.leverage,
      ...report.expectationGap,
      ...report.archetypeTests.flatMap((item) => [item.name, item.verdict]),
      ...report.whatWorks,
      ...report.whatsBroken,
      ...report.whyNotConverting,
      ...report.audienceMismatch,
      report.brandMyth,
      report.mixedSignals,
      ...report.frictionMap,
      ...report.trustGaps,
      ...report.offerOpportunities,
      ...report.positioningMoves,
      ...report.messagingPriorities,
      ...report.offerStrategy,
      ...report.priorityFixes.fixNow,
      ...report.priorityFixes.fixNext,
      ...report.priorityFixes.keep,
      ...report.campaignAngles.flatMap((item) => [item.title, item.angle, item.whyItCouldWork]),
      report.rewriteSuggestions.heroLine,
      report.rewriteSuggestions.subheadline,
      report.rewriteSuggestions.cta,
      report.beforeAfterHero.currentFrame.label,
      report.beforeAfterHero.currentFrame.title,
      report.beforeAfterHero.currentFrame.body,
      report.beforeAfterHero.rewrittenFrame.eyebrow,
      report.beforeAfterHero.rewrittenFrame.headline,
      report.beforeAfterHero.rewrittenFrame.subheadline,
      report.beforeAfterHero.rewrittenFrame.cta,
      report.beforeAfterHero.rewrittenFrame.note,
      ...report.brandWorldAlternatives.flatMap((item) => [item.title, item.tagline, item.note]),
      ...report.proofGallery.flatMap((item) => [item.label, item.title, item.body]),
      ...report.miniStoryboard.flatMap((item) => [item.label, item.title, item.body]),
      ...report.actionPlan.next7Days,
      ...report.actionPlan.next30Days,
      report.strategicNextMove,
    ],
    language,
  );

  let index = 0;
  const next = () => translated[index++] || "";

  return {
    ...report,
    title: next(),
    genre: next(),
    tagline: next(),
    scoreBand: next(),
    scoreModifier: next(),
    snapshot: next(),
    surfaceCaptures: report.surfaceCaptures.map((item) => ({
      ...item,
      label: next(),
      note: next(),
    })),
    screenshotCallouts: report.screenshotCallouts.map((item) => ({
      ...item,
      title: next(),
      body: next(),
    })),
    scorecard: report.scorecard.map((item) => ({
      ...item,
      note: next(),
    })),
    positioningRead: next(),
    toneCheck: next(),
    visualIdentityRead: next(),
    aboveTheFold: next(),
    conversionRead: next(),
    strategicDirection: next(),
    archetypeRead: {
      ...report.archetypeRead,
      rationale: next(),
    },
    aestheticDirections: report.aestheticDirections.map(() => ({
      name: next(),
      note: next(),
    })),
    culturalAssociations: {
      films: report.culturalAssociations.films.map(() => next()),
      eras: report.culturalAssociations.eras.map(() => next()),
      art: report.culturalAssociations.art.map(() => next()),
      music: report.culturalAssociations.music.map(() => next()),
    },
    visualCodes: {
      palette: report.visualCodes.palette.map(() => next()),
      textures: report.visualCodes.textures.map(() => next()),
      symbols: report.visualCodes.symbols.map(() => next()),
      forms: report.visualCodes.forms.map(() => next()),
    },
    toneOfVoice: report.toneOfVoice.map(() => next()),
    audienceRead: {
      primaryAudience: next(),
      whatTheyAreLookingFor: report.audienceRead.whatTheyAreLookingFor.map(() => next()),
      whatTheyNeedToFeel: report.audienceRead.whatTheyNeedToFeel.map(() => next()),
      whatTheyNeedToHear: report.audienceRead.whatTheyNeedToHear.map(() => next()),
    },
    verbalImage: {
      nameSignal: next(),
      headlineSignal: next(),
      firstScreenTone: next(),
      risk: next(),
    },
    namingFit: {
      verdict: next(),
      roleMatch: next(),
      risk: next(),
      correction: next(),
    },
    headlineCorrection: {
      currentProblem: next(),
      correctionLogic: next(),
      rewrittenDirection: next(),
    },
    brandKnownFor: next(),
    industryFit: {
      expectedArchetype: next(),
      assessment: next(),
      leverage: next(),
    },
    expectationGap: report.expectationGap.map(() => next()),
    archetypeTests: report.archetypeTests.map(() => ({
      name: next(),
      verdict: next(),
    })),
    whatWorks: report.whatWorks.map(() => next()),
    whatsBroken: report.whatsBroken.map(() => next()),
    whyNotConverting: report.whyNotConverting.map(() => next()),
    audienceMismatch: report.audienceMismatch.map(() => next()),
    brandMyth: next(),
    mixedSignals: next(),
    frictionMap: report.frictionMap.map(() => next()),
    trustGaps: report.trustGaps.map(() => next()),
    offerOpportunities: report.offerOpportunities.map(() => next()),
    positioningMoves: report.positioningMoves.map(() => next()),
    messagingPriorities: report.messagingPriorities.map(() => next()),
    offerStrategy: report.offerStrategy.map(() => next()),
    priorityFixes: {
      fixNow: report.priorityFixes.fixNow.map(() => next()),
      fixNext: report.priorityFixes.fixNext.map(() => next()),
      keep: report.priorityFixes.keep.map(() => next()),
    },
    campaignAngles: report.campaignAngles.map(() => ({
      title: next(),
      angle: next(),
      whyItCouldWork: next(),
    })),
    rewriteSuggestions: {
      heroLine: next(),
      subheadline: next(),
      cta: next(),
    },
    beforeAfterHero: {
      currentFrame: {
        ...report.beforeAfterHero.currentFrame,
        label: next(),
        title: next(),
        body: next(),
      },
      rewrittenFrame: {
        ...report.beforeAfterHero.rewrittenFrame,
        eyebrow: next(),
        headline: next(),
        subheadline: next(),
        cta: next(),
        note: next(),
      },
    },
    brandWorldAlternatives: report.brandWorldAlternatives.map((item) => ({
      ...item,
      title: next(),
      tagline: next(),
      note: next(),
    })),
    proofGallery: report.proofGallery.map((item) => ({
      ...item,
      label: next(),
      title: next(),
      body: next(),
    })),
    miniStoryboard: report.miniStoryboard.map((item) => ({
      ...item,
      label: next(),
      title: next(),
      body: next(),
    })),
    actionPlan: {
      next7Days: report.actionPlan.next7Days.map(() => next()),
      next30Days: report.actionPlan.next30Days.map(() => next()),
    },
    strategicNextMove: next(),
  };
}

export async function generateBrandReport(
  urlInput: string,
  language: SiteLocale = "en",
) {
  const normalized = normalizeUrl(urlInput);
  if (!normalized) {
    throw new Error("Please enter a valid website URL.");
  }

  const firstReadPayload = await generateBrandRead(normalized, language);
  const websiteContext = await fetchWebsiteContext(normalized).catch(() => ({
    title: "",
    ogTitle: "",
    description: "",
    headings: [],
    callsToAction: [],
    visibleText: "",
    ogImage: "",
    icon: "",
  }));
  const industryHint = inferIndustryArchetype(websiteContext);

  const fallback = buildFallbackReport(normalized, firstReadPayload.result);
  const websiteCapture = await captureWebsiteSurface(normalized);

  if (websiteCapture) {
    fallback.surfaceCaptures = [
      {
        label: "Live website capture",
        kind: "website",
        imageUrl: websiteCapture.dataUrl,
        href: normalized,
        captureMethod: "browser",
        note: `Above-the-fold browser capture of the homepage at ${websiteCapture.viewport.width}px, used as the primary visual evidence layer in the report.`,
      },
      ...fallback.surfaceCaptures.slice(1),
    ];
  } else if (websiteContext.ogImage) {
    fallback.surfaceCaptures = [
      {
        label: "Current website",
        kind: "website",
        imageUrl: websiteContext.ogImage,
        href: normalized,
        captureMethod: "metadata",
        note: "Primary homepage surface used to form the first visual and commercial impression.",
      },
      ...fallback.surfaceCaptures.slice(1),
    ];
  } else if (websiteContext.icon) {
    fallback.surfaceCaptures = [
      {
        label: "Current website",
        kind: "website",
        imageUrl: websiteContext.icon.startsWith("http")
          ? websiteContext.icon
          : new URL(websiteContext.icon, normalized).toString(),
        href: normalized,
        captureMethod: "metadata",
        note: "Primary homepage surface used to form the first impression.",
      },
      ...fallback.surfaceCaptures.slice(1),
    ];
  }
  const modelReport = await requestGeminiBrandReport(
    normalized,
    firstReadPayload.result,
    websiteContext,
    language,
  ).catch(() => null);

  const report = normalizeReport(modelReport || {}, fallback);
  const primarySurface = {
    ...fallback.surfaceCaptures[0],
    note: report.surfaceCaptures[0]?.note || fallback.surfaceCaptures[0].note,
  };

  const secondarySurfaces = report.surfaceCaptures
    .slice(1)
    .filter((surface) => surface.label !== primarySurface.label)
    .slice(0, 2);

  report.surfaceCaptures = [
    primarySurface,
    ...secondarySurfaces,
    ...fallback.surfaceCaptures
      .slice(1)
      .filter(
        (surface) =>
          !secondarySurfaces.some((item) => item.label === surface.label),
      ),
  ].slice(0, 3);

  report.screenshotCallouts = buildScreenshotCallouts(
    report,
    websiteContext,
    websiteCapture?.anchors,
  );

  const visualArtifacts = buildVisualArtifacts(report, websiteCapture);
  report.beforeAfterHero = visualArtifacts.beforeAfterHero;
  report.brandWorldAlternatives = visualArtifacts.brandWorldAlternatives;
  report.proofGallery = visualArtifacts.proofGallery;
  report.miniStoryboard = visualArtifacts.miniStoryboard;

  const archetypeLayer = buildArchetypeLayer({
    brandName: report.brandName,
    visualWorld: report.visualWorld,
    industryHint,
    toneCheck: report.toneCheck,
    messagingPriorities: report.messagingPriorities,
    positioningMoves: report.positioningMoves,
    rewriteSuggestions: report.rewriteSuggestions,
  });
  report.archetypeRead = report.archetypeRead?.primary ? report.archetypeRead : archetypeLayer.archetypeRead;
  report.aestheticDirections =
    report.aestheticDirections.length > 0 ? report.aestheticDirections : archetypeLayer.aestheticDirections;
  report.culturalAssociations =
    report.culturalAssociations.films.length > 0 ? report.culturalAssociations : archetypeLayer.culturalAssociations;
  report.visualCodes =
    report.visualCodes.palette.length > 0 ? report.visualCodes : archetypeLayer.visualCodes;
  report.toneOfVoice =
    report.toneOfVoice.length > 0 ? report.toneOfVoice : archetypeLayer.toneOfVoice;
  report.audienceRead =
    report.audienceRead?.primaryAudience
      ? report.audienceRead
      : buildAudienceLayer(websiteContext, report.visualWorld);
  report.verbalImage =
    report.verbalImage?.nameSignal
      ? report.verbalImage
      : buildVerbalImageLayer({
          brandName: report.brandName,
          websiteContext,
          report,
        });
  report.namingFit =
    report.namingFit?.verdict
      ? report.namingFit
      : buildNamingFitLayer({
          brandName: report.brandName,
          websiteContext,
          visualWorld: report.visualWorld,
          industryHint,
        });
  report.headlineCorrection =
    report.headlineCorrection?.currentProblem
      ? report.headlineCorrection
      : buildHeadlineCorrectionLayer({
          websiteContext,
          report,
        });
  const sharperRewrite = buildSharperRewriteSuggestions({
    brandName: report.brandName,
    websiteContext,
    report,
  });
  if (sharperRewrite) {
    report.rewriteSuggestions = {
      ...report.rewriteSuggestions,
      ...sharperRewrite,
    };
    report.headlineCorrection = {
      ...report.headlineCorrection,
      rewrittenDirection: sharperRewrite.heroLine,
    };
  }
  report.brandKnownFor =
    report.brandKnownFor?.length > 0 ? report.brandKnownFor : buildKnownForLine(report);
  report.industryFit =
    report.industryFit?.expectedArchetype
      ? report.industryFit
      : {
          expectedArchetype:
            industryHint.world.charAt(0).toUpperCase() + industryHint.world.slice(1),
          assessment:
            industryHint.world === report.visualWorld
              ? `This brand is broadly aligned with the category's natural ${industryHint.world} pull.`
              : `The category leans ${industryHint.world}, but this brand is trying to read as ${report.visualWorld}.`,
          leverage:
            industryHint.world === report.visualWorld
              ? "Use that fit to build trust faster, then sharpen the difference inside it."
              : "Correct the audience's expectation early, or the difference will look like confusion instead of distinction.",
        };
  report.expectationGap =
    report.expectationGap.length > 0
      ? report.expectationGap
      : [
          `People in this category are primed to expect a ${industryHint.world} brand story.`,
          `This brand is presenting a ${report.visualWorld} story instead.`,
          "That only works if the page explains the difference immediately.",
        ];
  report.archetypeTests =
    report.archetypeTests.length > 0
      ? report.archetypeTests
      : buildArchetypeTests({
          visualWorld: report.visualWorld,
          report,
        });
  const commercialDiagnosis = buildCommercialDiagnosis({
    visualWorld: report.visualWorld,
    priorityFixes: report.priorityFixes,
    frictionMap: report.frictionMap,
    trustGaps: report.trustGaps,
    audienceRead: report.audienceRead,
  });
  report.whatWorks = report.whatWorks.length > 0 ? report.whatWorks : commercialDiagnosis.whatWorks;
  report.whatsBroken =
    report.whatsBroken.length > 0 ? report.whatsBroken : commercialDiagnosis.whatsBroken;
  report.whyNotConverting =
    report.whyNotConverting.length > 0
      ? report.whyNotConverting
      : commercialDiagnosis.whyNotConverting;
  report.audienceMismatch =
    report.audienceMismatch.length > 0
      ? report.audienceMismatch
      : commercialDiagnosis.audienceMismatch;
  report.brandMyth = report.brandMyth || archetypeLayer.brandMyth;

  if (!modelReport && language !== "en") {
    return localizeBrandReport(report, language);
  }

  return report;
}

export async function generateBrandReportPdf(
  report: BrandReport,
  language: SiteLocale = "en",
) {
  const websiteSurface = report.surfaceCaptures.find((surface) => surface.kind === "website");
  const websiteImageSource = await loadPdfImageSource(websiteSurface?.imageUrl);
  const archetypePosterSource = await loadPdfImageSource(resolveWorldPoster(report.visualWorld));
  const heroCallout = report.screenshotCallouts.find((item) => item.zone === "hero-promise");
  const ctaCallout = report.screenshotCallouts.find((item) => item.zone === "proof-cta");
  const includeWebsiteEvidencePage = Boolean(websiteImageSource);

  return new Promise<Buffer>((resolve, reject) => {
    const restorePdfkitRead = installPdfkitFontRedirect();
    const fontDir = path.join(process.cwd(), "src/assets/fonts");

    const doc = new PDFDocument({
      autoFirstPage: false,
      size: "A4",
      margins: { top: 56, bottom: 56, left: 56, right: 56 },
      font: path.join(fontDir, "Arial.ttf"),
      info: {
        Title: `${report.brandName} BrandMirror Report`,
        Author: "BrandMirror",
        Subject: "BrandMirror Report",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      restorePdfkitRead();
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", (error) => {
      restorePdfkitRead();
      reject(error);
    });

    const colors = {
      dark: "#0A0B0F",
      darkSoft: "#121620",
      panel: "#18191F",
      panelSoft: "#1E222C",
      textOnDark: "#F5F5F3",
      mutedOnDark: "#B8BCC8",
      textMuted: "#8E95A3",
      accent: "#D4C4DC",
      terracotta: "#C17B6F",
      amber: "#E8B04C",
      mint: "#7FD9C8",
      success: "#8BA888",
      rule: "#2B3342",
      darkRule: "#2B3342",
    };

    doc.registerFont("Helvetica", path.join(fontDir, "Arial.ttf"));
    doc.registerFont("Helvetica-Oblique", path.join(fontDir, "Arial Italic.ttf"));
    doc.registerFont("Times-Roman", path.join(fontDir, "Times New Roman.ttf"));
    doc.registerFont("Times-Bold", path.join(fontDir, "Times New Roman Bold.ttf"));

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const contentLeft = 56;
    const contentRight = 539;
    const contentWidth = contentRight - contentLeft;
    const totalPages = 16;
    let pageNumber = 0;
    const overallScore = Math.round(
      report.scorecard.reduce((sum, item) => sum + item.score, 0) / Math.max(report.scorecard.length, 1),
    );
    const pdfCopy = {
      en: {
        coverSub: "YOUR BRANDMIRROR REPORT",
        powered: "Powered by SAHAR / saharstudio.com",
        footer: "Your brand is already speaking. This is what it is saying.",
        whatThisIsLabel: "WHAT WE MEASURE",
        whatThisIsTitle:
          "Five commercial signals that decide whether the brand gets understood, trusted, and chosen",
        whatThisIsIntro: [
          `BrandMirror reads the brand the way a sharp buyer reads the first screen: before the copy has fully explained itself, before the proof has earned trust, before the click has happened.`,
          "This report measures five signals that shape that decision: clarity, discoverability, credibility, specificity, and readiness to act.",
          "The goal is not to score taste. The goal is to show where the page is helping the sale, where it is slowing it down, and what to fix first.",
        ],
        reportSnapshot: "REPORT SNAPSHOT",
        overallReadiness: "Overall brand readiness",
        scoreDashboardLabel: "SCORE DASHBOARD",
        scoreDashboardTitle:
          "See exactly what is working, what is broken, and why clients still hesitate",
        scoreSentence: `Your brand scores ${overallScore}/100.`,
        scoreSub:
          "The visual layer is already doing heavy lifting. The commercial layer still needs to catch up.",
        methodologyLabel: "HOW BRANDMIRROR SCORES YOUR BRAND",
        methodologyTitle: "What each score is measuring and why the numbers are there",
        roiLabel: "COMMERCIAL IMPACT",
        roiTitle: "What the upside can look like across three realistic scenarios",
        roiIntro:
          "Based on your current brand scores and industry profile, these scenarios model how clearer positioning, specificity, and conversion flow can translate into commercial lift.",
        roiRecommended: "RECOMMENDED FOR YOUR BRAND",
        roiConservative: "CONSERVATIVE",
        roiRealistic: "REALISTIC",
        roiOptimistic: "OPTIMISTIC",
        roiScale1: "New / small",
        roiScale2: "Typical",
        roiScale3: "Established",
        roiVisitors: "Monthly Visitors",
        roiAov: "Average Order Value",
        roiCurrentRevenue: "Current Revenue/mo",
        roiProjectedLift: "PROJECTED LIFT",
        roiMonthlyLift: "Monthly Revenue Lift",
        roiAnnualLift: "Annual Revenue Lift",
        roiImplementation: "IMPLEMENTATION",
        roiCost: "Estimated Cost",
        roiPayback: "Payback Period",
        roiAnnualRoi: "Annual ROI",
        roiFootnote:
          "Modeled estimate based on current scores, category benchmarks, and the priority fixes in this report. Actual performance depends on implementation quality, market conditions, and offer fit.",
        websiteEvidenceLabel: "CURRENT WEBSITE SURFACE",
        websiteEvidenceTitle:
          "What the buyer sees before the copy has earned trust",
        websiteEvidenceCaption:
          "This is the current above-the-fold surface BrandMirror is diagnosing.",
        heroCalloutLabel: "HERO PROMISE",
        ctaCalloutLabel: "PROOF AND CTA ZONE",
        methodologyBullets: [
          "Positioning Clarity measures how quickly the homepage makes the offer legible.",
          "AI Discoverability measures whether AI tools can find, summarize, and recommend the brand accurately.",
          "Visual Credibility measures whether the design signals quality and control.",
          "Offer Specificity measures how directly the page explains what it does and why it matters.",
          "Conversion Readiness measures whether the page has earned a confident next step.",
        ],
        readingScale: "READING THE SCALE",
        legend: [
          { title: "0-30", body: "Flatlining. The signal is broken, absent, or actively costing trust." },
          { title: "30-50", body: "Fragile. A base exists, but it does not hold trust under pressure." },
          { title: "50-70", body: "Developing. The signal works in parts, but it still leaks confidence." },
          { title: "70-85", body: "Stable. The page holds clarity and trust, with room to sharpen." },
          { title: "85-100", body: "Leading. The brand is structured strongly enough to sell before it explains." },
        ],
        whatScoreTells: "What this score is telling us",
        revealingLine: "MOST REVEALING LINE",
        forBrand: `FOR ${report.brandName.toUpperCase()}`,
        benchmark: "PRACTICAL READ",
        archetypeLabel: "BRAND ARCHETYPE",
        archetypeTitle: `${report.archetypeRead.primary} with ${report.archetypeRead.secondary} pull`,
        archetypeExpect: "What buyers expect from this role",
        archetypeSoWhat: "SO WHAT DOES THIS MEAN COMMERCIALLY?",
        gapLabel: "SIGNAL READ",
        gapTitle:
          "What is missing, where the signal drifts, and what the AI layer can actually understand",
        brandPromises: "WHAT IS MISSING",
        pageDelivers: "MIXED SIGNALS",
        commercialCost: "AI DISCOVERABILITY CHECK",
        fixesLabel: "PRIORITY FIX STACK",
        fixesTitle:
          "What to fix now, what can wait, and what is already earning trust",
        fixNow: "FIX NOW",
        fixNext: "FIX NEXT",
        keep: "KEEP",
        plan7Label: "FIRST READ",
        plan7Title:
          "What the company does, what it signals, and how the page lands before trust is earned",
        day: "DAY",
        headlineCorrection: "HEADLINE CORRECTION",
        plan30Label: "30-DAY ACTION PLAN",
        plan30Title: "Your roadmap for the next 30 days",
        next30: "Next 30 days",
        campaignDirection: "Campaign direction",
        directionCues: "WHAT COMES NEXT",
        nextLabel: "WHAT COMES NEXT",
        nextTitle: "Three ways to act on this report while the diagnosis is still fresh",
        nextCards: [
          { icon: "DIY", title: "Do it yourself", body: "Use the fix stack and action plan in this report as your roadmap.", price: "Included" },
          { icon: "REVIEWED", title: "BrandMirror - Reviewed", body: "Get a guided Loom walkthrough of the diagnosis and the next moves.", price: "$197" },
          { icon: "SAHAR", title: "Work with Sahar", body: "Turn the diagnosis into a full website and brand rebuild.", price: "Project-based" },
        ],
        backCover:
          "Your brand is already speaking.\nThis is what it is saying.",
      },
      es: {
        coverSub: "TU REPORTE BRANDMIRROR",
        powered: "Powered by SAHAR / saharstudio.com",
        footer: "Tu marca ya está hablando. Esto es lo que está diciendo.",
        whatThisIsLabel: "QUÉ MEDIMOS",
        whatThisIsTitle:
          "Cinco señales comerciales que deciden si la marca se entiende, se confía y se elige",
        whatThisIsIntro: [
          `BrandMirror lee la marca como la lee un comprador agudo en la primera pantalla: antes de que el copy termine de explicarse, antes de que la prueba gane confianza, antes del clic.`,
          "Este reporte mide cinco señales que modelan esa decisión: claridad, discoverability, credibilidad, especificidad y preparación para convertir.",
          "La meta no es puntuar gusto. La meta es mostrar dónde la página ayuda a la venta, dónde la frena y qué corregir primero.",
        ],
        reportSnapshot: "RESUMEN DEL REPORTE",
        overallReadiness: "Preparación general de la marca",
        scoreDashboardLabel: "PANEL DE SCORES",
        scoreDashboardTitle:
          "Mira exactamente qué funciona, qué está roto y por qué los clientes todavía dudan",
        scoreSentence: `Tu marca obtiene ${overallScore}/100.`,
        scoreSub:
          "La capa visual ya está haciendo mucho trabajo. La capa comercial todavía tiene que alcanzarla.",
        methodologyLabel: "CÓMO BRANDMIRROR PUNTÚA TU MARCA",
        methodologyTitle: "Qué mide cada score y por qué esos números importan",
        roiLabel: "IMPACTO COMERCIAL",
        roiTitle: "Cómo puede verse el upside en tres escenarios realistas",
        roiIntro:
          "Según los scores actuales de la marca y el perfil del sector, estos escenarios modelan cómo una mejor claridad, especificidad y conversión pueden traducirse en impacto comercial.",
        roiRecommended: "RECOMENDADO PARA TU MARCA",
        roiConservative: "CONSERVADOR",
        roiRealistic: "REALISTA",
        roiOptimistic: "OPTIMISTA",
        roiScale1: "Nueva / pequeña",
        roiScale2: "Típica",
        roiScale3: "Establecida",
        roiVisitors: "Visitantes mensuales",
        roiAov: "Valor medio",
        roiCurrentRevenue: "Ingreso actual/mes",
        roiProjectedLift: "LIFT PROYECTADO",
        roiMonthlyLift: "Lift mensual",
        roiAnnualLift: "Lift anual",
        roiImplementation: "IMPLEMENTACIÓN",
        roiCost: "Coste estimado",
        roiPayback: "Recuperación",
        roiAnnualRoi: "ROI anual",
        roiFootnote:
          "Estimación modelada basada en los scores actuales, benchmarks del sector y los priority fixes de este reporte. El resultado real depende de la implementación, del mercado y del encaje de la oferta.",
        websiteEvidenceLabel: "SUPERFICIE ACTUAL DEL SITIO",
        websiteEvidenceTitle:
          "Lo que ve el comprador antes de que el copy haya ganado confianza",
        websiteEvidenceCaption:
          "Esta es la superficie above-the-fold actual que BrandMirror está diagnosticando.",
        heroCalloutLabel: "PROMESA HERO",
        ctaCalloutLabel: "ZONA DE PRUEBA Y CTA",
        methodologyBullets: [
          "Positioning Clarity mide qué tan rápido la homepage hace legible la oferta.",
          "AI Discoverability mide si las herramientas de IA pueden encontrar, resumir y recomendar la marca con precisión.",
          "Visual Credibility mide si el diseño comunica calidad y control.",
          "Offer Specificity mide qué tan directo es el sitio al explicar lo que hace y por qué importa.",
          "Conversion Readiness mide si la página ya ganó el derecho a pedir el siguiente paso.",
        ],
        readingScale: "CÓMO LEER LA ESCALA",
        legend: [
          { title: "0-30", body: "Flatlining. La señal está rota, ausente o destruye confianza." },
          { title: "30-50", body: "Fragile. Hay base, pero no sostiene la confianza." },
          { title: "50-70", body: "Developing. Funciona por momentos, pero sigue perdiendo impulso." },
          { title: "70-85", body: "Stable. La página sostiene claridad y confianza, con margen para afilar." },
          { title: "85-100", body: "Leading. La marca vende antes de tener que explicarse." },
        ],
        whatScoreTells: "Qué nos está diciendo este score",
        revealingLine: "LÍNEA MÁS REVELADORA",
        forBrand: `PARA ${report.brandName.toUpperCase()}`,
        benchmark: "LECTURA PRÁCTICA",
        archetypeLabel: "ARQUETIPO DE MARCA",
        archetypeTitle: `${report.archetypeRead.primary} con un pull hacia ${report.archetypeRead.secondary}`,
        archetypeExpect: "Qué espera el comprador de este rol",
        archetypeSoWhat: "¿QUÉ SIGNIFICA ESTO COMERCIALMENTE?",
        gapLabel: "LECTURA DE LA SEÑAL",
        gapTitle:
          "Qué falta, dónde se mezcla la señal y qué puede entender de verdad la capa de IA",
        brandPromises: "QUÉ FALTA",
        pageDelivers: "SEÑALES MEZCLADAS",
        commercialCost: "CHEQUEO DE AI DISCOVERABILITY",
        fixesLabel: "STACK DE FIXES PRIORITARIOS",
        fixesTitle:
          "Qué arreglar ahora, qué puede esperar y qué ya está trabajando a favor de la marca",
        fixNow: "ARREGLAR AHORA",
        fixNext: "ARREGLAR DESPUÉS",
        keep: "MANTENER",
        plan7Label: "FIRST READ",
        plan7Title:
          "Qué hace la empresa, qué está señalando y cómo se lee antes de que exista confianza",
        day: "DÍA",
        headlineCorrection: "CORRECCIÓN DEL HEADLINE",
        plan30Label: "PLAN DE 30 DÍAS",
        plan30Title: "Los cambios estructurales que hacen la marca más fácil de elegir",
        next30: "Próximos 30 días",
        campaignDirection: "Dirección de campaña",
        directionCues: "PISTAS DE DIRECCIÓN",
        nextLabel: "QUÉ VIENE DESPUÉS",
        nextTitle: "Tres formas de actuar sobre este reporte mientras el diagnóstico sigue fresco",
        nextCards: [
          { icon: "DIY", title: "Hazlo tú", body: "Usa el stack de fixes y el plan de acción de este reporte como hoja de ruta.", price: "Incluido" },
          { icon: "REVIEWED", title: "BrandMirror - Reviewed", body: "Recibe un Loom guiado con el diagnóstico y los siguientes pasos.", price: "$197" },
          { icon: "SAHAR", title: "Trabaja con Sahar", body: "Convierte el diagnóstico en una reconstrucción completa de marca y web.", price: "Proyecto" },
        ],
        backCover:
          "Tu marca ya está hablando.\nEsto es lo que está diciendo.",
      },
      ru: {
        coverSub: "ТВОЙ ОТЧЁТ BRANDMIRROR",
        powered: "Powered by SAHAR / saharstudio.com",
        footer: "Твой бренд уже говорит. Вот что он говорит.",
        whatThisIsLabel: "ЧТО МЫ ИЗМЕРЯЕМ",
        whatThisIsTitle:
          "Пять коммерческих сигналов, которые решают, поймут ли бренд, поверят ли ему и выберут ли его",
        whatThisIsIntro: [
          `BrandMirror читает бренд так, как его читает внимательный покупатель на первом экране: до того, как текст всё объяснил, до того, как proof заслужил доверие, до клика.`,
          "Этот отчёт измеряет пять сигналов, которые формируют это решение: clarity, discoverability, credibility, specificity и readiness to act.",
          "Задача не в том, чтобы оценить вкус. Задача — показать, где страница помогает продаже, где тормозит её и что чинить первым.",
        ],
        reportSnapshot: "СНИМОК ОТЧЁТА",
        overallReadiness: "Общая готовность бренда",
        scoreDashboardLabel: "ПАНЕЛЬ SCORES",
        scoreDashboardTitle:
          "Увидь точно, что работает, что сломано и почему клиент всё ещё сомневается",
        scoreSentence: `Твой бренд получает ${overallScore}/100.`,
        scoreSub:
          "Визуальный слой уже делает много работы. Коммерческий слой всё ещё должен его догнать.",
        methodologyLabel: "КАК BRANDMIRROR ОЦЕНИВАЕТ БРЕНД",
        methodologyTitle: "Что измеряет каждый score и почему этим цифрам можно доверять",
        roiLabel: "КОММЕРЧЕСКИЙ ЭФФЕКТ",
        roiTitle: "Как может выглядеть upside в трёх реалистичных сценариях",
        roiIntro:
          "На основе текущих scores бренда и профиля категории эти сценарии показывают, как более ясное positioning, specificity и conversion flow могут превратиться в коммерческий результат.",
        roiRecommended: "РЕКОМЕНДОВАНО ДЛЯ ВАШЕГО БРЕНДА",
        roiConservative: "КОНСЕРВАТИВНЫЙ",
        roiRealistic: "РЕАЛИСТИЧНЫЙ",
        roiOptimistic: "ОПТИМИСТИЧНЫЙ",
        roiScale1: "Новый / маленький",
        roiScale2: "Типичный",
        roiScale3: "Устоявшийся",
        roiVisitors: "Посетители в месяц",
        roiAov: "Средний чек",
        roiCurrentRevenue: "Текущая выручка/мес",
        roiProjectedLift: "ПРОГНОЗИРУЕМЫЙ РОСТ",
        roiMonthlyLift: "Рост в месяц",
        roiAnnualLift: "Рост в год",
        roiImplementation: "ВНЕДРЕНИЕ",
        roiCost: "Оценка стоимости",
        roiPayback: "Окупаемость",
        roiAnnualRoi: "ROI за год",
        roiFootnote:
          "Это модельная оценка на основе текущих scores, benchmarks категории и priority fixes из отчёта. Реальный результат зависит от качества внедрения, рынка и fit вашего offer.",
        websiteEvidenceLabel: "ТЕКУЩАЯ ПОВЕРХНОСТЬ САЙТА",
        websiteEvidenceTitle:
          "Что видит покупатель до того, как текст успевает заслужить доверие",
        websiteEvidenceCaption:
          "Это текущая above-the-fold поверхность, которую BrandMirror использует как главный визуальный слой диагноза.",
        heroCalloutLabel: "HERO-ОБЕЩАНИЕ",
        ctaCalloutLabel: "ЗОНА PROOF И CTA",
        methodologyBullets: [
          "Positioning Clarity измеряет, насколько быстро homepage делает оффер понятным.",
          "AI Discoverability измеряет, могут ли AI tools найти бренд, точно описать его и рекомендовать его.",
          "Visual Credibility измеряет, сигналит ли дизайн качество и контроль.",
          "Offer Specificity измеряет, насколько прямо страница объясняет, что она делает и почему это важно.",
          "Conversion Readiness измеряет, заслужила ли страница право попросить следующий шаг.",
        ],
        readingScale: "КАК ЧИТАТЬ ШКАЛУ",
        legend: [
          { title: "0-30", body: "Flatlining. Сигнал сломан, отсутствует или уже ломает доверие." },
          { title: "30-50", body: "Fragile. Основа есть, но она не держит доверие." },
          { title: "50-70", body: "Developing. Что-то работает, но уверенность всё ещё утекает." },
          { title: "70-85", body: "Stable. Страница держит ясность и доверие, но её можно усилить." },
          { title: "85-100", body: "Leading. Бренд продаёт ещё до того, как начинает объяснять." },
        ],
        whatScoreTells: "Что нам говорит этот score",
        revealingLine: "САМАЯ ПОКАЗАТЕЛЬНАЯ ЛИНИЯ",
        forBrand: `ДЛЯ ${report.brandName.toUpperCase()}`,
        benchmark: "ПРАКТИЧЕСКОЕ ЧТЕНИЕ",
        archetypeLabel: "АРХЕТИП БРЕНДА",
        archetypeTitle: `${report.archetypeRead.primary} с тягой к ${report.archetypeRead.secondary}`,
        archetypeExpect: "Что покупатель ждёт от этой роли",
        archetypeSoWhat: "И ЧТО ЭТО ЗНАЧИТ КОММЕРЧЕСКИ?",
        gapLabel: "ЧТЕНИЕ СИГНАЛА",
        gapTitle:
          "Чего не хватает, где сигнал распадается и что вообще может понять AI-слой",
        brandPromises: "ЧЕГО НЕ ХВАТАЕТ",
        pageDelivers: "СМЕШАННЫЕ СИГНАЛЫ",
        commercialCost: "AI DISCOVERABILITY CHECK",
        fixesLabel: "СТЕК ПРИОРИТЕТНЫХ FIXES",
        fixesTitle:
          "Что исправить сейчас, что может подождать и что уже работает на бренд",
        fixNow: "ИСПРАВИТЬ СЕЙЧАС",
        fixNext: "ИСПРАВИТЬ СЛЕДОМ",
        keep: "ОСТАВИТЬ",
        plan7Label: "FIRST READ",
        plan7Title:
          "Что делает компания, что она сигналит и как страница считывается до того, как заслужено доверие",
        day: "ДЕНЬ",
        headlineCorrection: "КОРРЕКЦИЯ HEADLINE",
        plan30Label: "ПЛАН НА 30 ДНЕЙ",
        plan30Title: "Структурные изменения, которые делают бренд легче для выбора",
        next30: "Следующие 30 дней",
        campaignDirection: "Направление кампании",
        directionCues: "DIRECTION CUES",
        nextLabel: "ЧТО ДАЛЬШЕ",
        nextTitle: "Три пути, как использовать этот отчёт, пока диагноз ещё свежий",
        nextCards: [
          { icon: "DIY", title: "Сделать самому", body: "Используй stack fixes и action plan из этого отчёта как дорожную карту.", price: "Включено" },
          { icon: "REVIEWED", title: "BrandMirror - Reviewed", body: "Получи guided Loom-разбор диагноза и следующих шагов.", price: "$197" },
          { icon: "SAHAR", title: "Работать с Sahar", body: "Преврати диагноз в полноценную пересборку бренда и сайта.", price: "По проекту" },
        ],
        backCover:
          "Твой бренд уже говорит.\nВот что он говорит.",
      },
    }[language];

    const today = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
    const reportId = `BM-${report.brandName
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 3)
      .padEnd(3, "X")}-${new Date().getFullYear()}-001`;
    const uniqueItems = (items: string[], max = items.length) =>
      Array.from(
        new Set(
          items
            .map((item) => normalizeWhitespace(item))
            .filter(Boolean),
        ),
      ).slice(0, max);

    const truncate = (text: string, length = 180) => {
      const clean = normalizeWhitespace(text);
      if (clean.length <= length) {
        return clean;
      }
      const sliced = clean.slice(0, Math.max(0, length - 1));
      const lastSpace = sliced.lastIndexOf(" ");
      return `${(lastSpace > 60 ? sliced.slice(0, lastSpace) : sliced).trim()}...`;
    };

    const firstSentence = (text: string, fallback = "") => {
      const clean = normalizeWhitespace(text);
      if (!clean) {
        return fallback;
      }
      const sentence = clean.split(/(?<=[.!?])\s+/)[0]?.trim();
      return sentence || clean || fallback;
    };

    const bodyCopy = (text: string) =>
      normalizeWhitespace(text)
        .replace(/\s+/g, " ")
        .trim();

    const addBasePage = () => {
      pageNumber += 1;
      doc.addPage();
      doc.rect(0, 0, pageWidth, pageHeight).fill(colors.dark);
      doc.fillColor(colors.accent)
        .font("Helvetica")
        .fontSize(9)
        .text("BRANDMIRROR", contentLeft, 36, { characterSpacing: 2.4 });
      doc.fillColor(colors.mutedOnDark)
        .font("Helvetica")
        .fontSize(9)
        .text(`${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`, contentRight - 56, 36, {
          width: 56,
          align: "right",
          characterSpacing: 1.2,
        });
      doc.moveTo(contentLeft, 760)
        .lineTo(contentRight, 760)
        .strokeColor(colors.darkRule)
        .lineWidth(0.8)
        .stroke();
      doc.fillColor(colors.mutedOnDark)
        .font("Helvetica")
        .fontSize(8)
        .text(pdfCopy.footer, contentLeft, 772, {
          width: 280,
        });
    };

    const fitHeading = (
      text: string,
      width: number,
      maxHeight: number,
      startSize = 30,
      minSize = 22,
      lineGap = -1,
      font: "Times-Bold" | "Times-Roman" | "Helvetica" = "Times-Bold",
    ) => {
      const clean = bodyCopy(text);
      let size = startSize;
      while (size >= minSize) {
        doc.font(font).fontSize(size);
        if (doc.heightOfString(clean, { width, lineGap }) <= maxHeight) {
          return { text: clean, size, lineGap, font };
        }
        size -= 1;
      }
      return { text: clean, size: minSize, lineGap, font };
    };

    const drawPageLabel = (
      label: string,
      title: string,
      options?: {
        width?: number;
        maxHeight?: number;
        maxFont?: number;
        minFont?: number;
        x?: number;
      },
    ) => {
      const x = options?.x ?? contentLeft;
      const width = options?.width ?? contentWidth - 40;
      doc.fillColor(colors.accent)
        .font("Helvetica")
        .fontSize(10)
        .text(label, x, 72, { characterSpacing: 2 });
      const fitted = fitHeading(
        title,
        width,
        options?.maxHeight ?? 96,
        options?.maxFont ?? 30,
        options?.minFont ?? 22,
      );
      doc.fillColor(colors.textOnDark)
        .font(fitted.font)
        .fontSize(fitted.size)
        .text(fitted.text, x, 102, {
          width,
          lineGap: fitted.lineGap,
        });
      return doc.y;
    };

    const drawParagraph = (
      text: string,
      x: number,
      y: number,
      width: number,
      fontSize = 11,
      lineGap = 5,
    ) => {
      doc.fillColor(colors.mutedOnDark)
        .font("Helvetica")
        .fontSize(fontSize)
        .text(bodyCopy(text), x, y, { width, lineGap });
      return doc.y;
    };

    const fitTextToBox = (
      text: string,
      width: number,
      height: number,
      startSize = 11.5,
      minSize = 9.5,
      lineGap = 5,
      font: "Helvetica" | "Times-Roman" | "Times-Bold" = "Helvetica",
    ) => {
      let clean = bodyCopy(text);
      let size = startSize;
      while (size >= minSize) {
        doc.font(font).fontSize(size);
        if (doc.heightOfString(clean, { width, lineGap }) <= height) {
          return { text: clean, size, lineGap, font };
        }
        size -= 0.3;
      }

      while (clean.length > 80) {
        clean = `${clean.slice(0, -12).trim().replace(/[ ,.;:]+$/, "")}...`;
        doc.font(font).fontSize(minSize);
        if (doc.heightOfString(clean, { width, lineGap }) <= height) {
          return { text: clean, size: minSize, lineGap, font };
        }
      }

      return { text: clean, size: minSize, lineGap, font };
    };

    const drawBulletBlock = (
      heading: string,
      items: string[],
      x: number,
      y: number,
      width: number,
      max = items.length,
    ) => {
      doc.fillColor(colors.textOnDark)
        .font("Times-Bold")
        .fontSize(18)
        .text(heading, x, y, { width });
      let nextY = y + 28;
      for (const item of uniqueItems(items, max)) {
        doc.fillColor(colors.mutedOnDark)
          .font("Helvetica")
          .fontSize(11)
          .text(`- ${item}`, x, nextY, { width, lineGap: 5 });
        nextY = doc.y + 8;
      }
      return nextY;
    };

    const focusToAlignment = (focusPercent?: number) => {
      if (typeof focusPercent !== "number") return "center";
      if (focusPercent <= 35) return undefined;
      if (focusPercent >= 65) return "right";
      return "center";
    };

    const focusToVerticalAlignment = (focusPercent?: number) => {
      if (typeof focusPercent !== "number") return "center";
      if (focusPercent <= 35) return undefined;
      if (focusPercent >= 65) return "bottom";
      return "center";
    };

    const drawRoundedImage = (
      source: Buffer | string | undefined,
      x: number,
      y: number,
      width: number,
      height: number,
      radius = 14,
      focus?: { x?: number; y?: number },
    ) => {
      if (!source) {
        return false;
      }

      doc.save();
      try {
        doc.roundedRect(x, y, width, height, radius).clip();
        doc.image(source, x, y, {
          cover: [width, height],
          align: focusToAlignment(focus?.x),
          valign: focusToVerticalAlignment(focus?.y),
        });
        return true;
      } catch {
        return false;
      } finally {
        doc.restore();
      }
    };

    const drawScoreMeter = (x: number, y: number, width: number, score: number) => {
      doc.roundedRect(x, y, width, 8, 4).fill(colors.rule);
      doc.roundedRect(x, y, Math.max(8, width * (score / 100)), 8, 4).fill(
        score >= 85
          ? colors.accent
          : score >= 70
            ? colors.mint
            : score >= 50
              ? colors.amber
              : colors.terracotta,
      );
      [0, 30, 50, 70, 85, 100].forEach((tick) => {
        const tickX = x + width * (tick / 100);
        doc.moveTo(tickX, y + 12).lineTo(tickX, y + 18).strokeColor(colors.mutedOnDark).stroke();
      });
      doc.fillColor(colors.mutedOnDark)
        .font("Helvetica")
        .fontSize(8)
        .text("0", x - 2, y + 20);
      doc.text("30", x + width * 0.3 - 6, y + 20);
      doc.text("50", x + width * 0.5 - 6, y + 20);
      doc.text("70", x + width * 0.7 - 6, y + 20);
      doc.text("85", x + width * 0.85 - 6, y + 20);
      doc.text("100", x + width - 14, y + 20);
    };

    const bandColor = (score: number) =>
      score >= 85
        ? colors.accent
        : score >= 70
          ? colors.mint
          : score >= 50
            ? colors.amber
            : score >= 30
              ? colors.terracotta
              : "#B65C5C";

    const getBandForScore = (score: number) =>
      score >= 85
        ? "LEADING"
        : score >= 70
          ? "STABLE"
          : score >= 50
            ? "DEVELOPING"
            : score >= 30
              ? "FRAGILE"
              : "FLATLINING";

    const drawPanel = (x: number, y: number, width: number, height: number, fill = colors.panel) => {
      doc.roundedRect(x, y, width, height, 16).fill(fill);
    };

    const drawSectionTag = (text: string, x: number, y: number, color = colors.accent) => {
      doc.fillColor(color)
        .font("Helvetica")
        .fontSize(8.5)
        .text(text, x, y, { characterSpacing: 1.5 });
    };

    const drawTextCard = ({
      x,
      y,
      width,
      height,
      label,
      title,
      body,
      fill = colors.panel,
      labelColor = colors.accent,
      bodyFont = "Helvetica" as "Helvetica" | "Times-Roman" | "Times-Bold",
      bodySize = 10.4,
      bodyMin = 9.2,
      titleFont = "Times-Bold" as "Helvetica" | "Times-Roman" | "Times-Bold",
      titleSize = 18,
      titleMin = 14,
      bodyTopOffset = 70,
      titleTopOffset = 38,
    }) => {
      drawPanel(x, y, width, height, fill);
      if (label) {
        drawSectionTag(label, x + 18, y + 18, labelColor);
      }
      let bodyTop = y + 20;
      if (title) {
        const fittedTitle = fitTextToBox(title, width - 36, 54, titleSize, titleMin, 3, titleFont);
        doc.fillColor(colors.textOnDark)
          .font(fittedTitle.font)
          .fontSize(fittedTitle.size)
          .text(fittedTitle.text, x + 18, y + titleTopOffset, {
            width: width - 36,
            lineGap: fittedTitle.lineGap,
          });
        bodyTop = Math.max(bodyTop, doc.y + 12);
      } else {
        bodyTop = y + bodyTopOffset;
      }
      const bodyHeight = height - (bodyTop - y) - 18;
      const fittedBody = fitTextToBox(body, width - 36, Math.max(36, bodyHeight), bodySize, bodyMin, 5, bodyFont);
      drawParagraph(fittedBody.text, x + 18, bodyTop, width - 36, fittedBody.size, fittedBody.lineGap);
    };

    const scoreByLabel = (label: string) =>
      report.scorecard.find((item) => item.label.toLowerCase() === label.toLowerCase());

    const scorePages = [
      {
        label: "Positioning clarity",
        title: "Positioning Clarity",
        diagnosis: report.positioningRead,
        quote: report.whatsBroken[0] || report.aboveTheFold,
        implication: report.headlineCorrection.currentProblem,
      },
      {
        label: "AI discoverability",
        title: "AI Discoverability",
        diagnosis: report.toneCheck,
        quote: report.audienceMismatch[1] || report.toneCheck,
        implication: report.verbalImage.firstScreenTone,
      },
      {
        label: "Visual credibility",
        title: "Visual Credibility",
        diagnosis: report.visualIdentityRead,
        quote: report.whatWorks[0] || report.visualIdentityRead,
        implication: report.mixedSignals,
      },
      {
        label: "Offer specificity",
        title: "Offer Specificity",
        diagnosis: report.aboveTheFold,
        quote: report.namingFit.correction,
        implication: report.offerOpportunities[0] || report.whatsBroken[1] || report.aboveTheFold,
      },
      {
        label: "Conversion readiness",
        title: "Conversion Readiness",
        diagnosis: report.conversionRead,
        quote: report.whyNotConverting[1] || report.conversionRead,
        implication: report.priorityFixes.fixNow[0] || report.conversionRead,
      },
    ].map((item) => ({
      ...item,
      score: scoreByLabel(item.label) ?? { label: item.label, score: overallScore, note: "" },
    }));

    const archetypeSoWhat = [
      `As a ${report.archetypeRead.primary} brand, buyers expect confidence, clarity, and a point of view they can trust quickly.`,
      `That means the CTA should feel like a guided next step, not a vague invitation.`,
      `Stop letting atmosphere carry the opening alone. The first screen has to explain the commercial shift this brand creates.`,
    ];

    const promiseBullets = uniqueItems(
      [
        report.whatWorks[0],
        firstSentence(report.visualIdentityRead),
        firstSentence(report.archetypeRead.rationale),
      ],
      3,
    );
    const deliverBullets = uniqueItems(
      [
        report.whatsBroken[0],
        report.whyNotConverting[0],
        report.audienceMismatch[0],
      ],
      3,
    );

    const metricCards = [
      "Positioning Clarity - does the buyer know what you are within one read?",
      "AI Discoverability - can AI tools find, describe, and recommend the brand accurately?",
      "Visual Credibility - does the design earn the price and the promise?",
      "Offer Specificity - could someone repeat what you sell without your help?",
      "Conversion Readiness - when someone is ready, is there a door to walk through?",
    ];

    const aiRubric = [
      "0-40: AI tools cannot find or describe the brand at all.",
      "40-70: AI tools find the brand but summarize it generically or incorrectly.",
      "70-85: AI tools can accurately describe and recommend the brand.",
      "85-100: The brand is structured for AI with clear claims, naming, and data.",
    ];

    const practicalMoves = {
      "Positioning Clarity": {
        low: "Rewrite the first screen so it states what you do, for whom, and why it matters in one read. Remove mood-first language that delays meaning.",
        mid: "Pull the strongest proof point above the fold so the promise lands faster and with more authority.",
      },
      "AI Discoverability": {
        low: "Add clearer category language, explicit service nouns, and metadata that AI tools can quote without guessing.",
        mid: "Tighten naming consistency across headline, metadata, and supporting copy so AI summaries stop flattening the offer.",
      },
      "Visual Credibility": {
        low: "Replace template cues and generic imagery. The page has to look as controlled as the price point it implies.",
        mid: "Sharpen spacing, imagery hierarchy, and proof placement so the visual layer does more commercial work.",
      },
      "Offer Specificity": {
        low: "Name the actual deliverable. Replace broad category language with a concrete commercial offer a buyer can repeat.",
        mid: "Clarify who the offer is for and what changes after someone buys. The transformation still lands too late.",
      },
      "Conversion Readiness": {
        low: "Create one clear next step near the promise and keep the proof close to it. The page still hides the door.",
        mid: "Make the CTA more specific and more earned. Reduce friction between interest, trust, and the click.",
      },
    } as const;

    const mapGenreToCategory = (genre: string) => {
      const lower = bodyCopy(genre).toLowerCase();
      if (lower.includes("saas") || lower.includes("software")) return "B2B SaaS";
      if (lower.includes("e-commerce") || lower.includes("retail") || lower.includes("shop")) return "E-commerce";
      if (lower.includes("agency") || lower.includes("studio")) return "Agency";
      return "B2B Services";
    };

    const getIndustryBenchmarks = (category: string) => {
      const map: Record<string, { avgTraffic: number; avgBounce: number; avgConversion: number; avgAov: number }> = {
        "B2B Services": { avgTraffic: 3200, avgBounce: 58, avgConversion: 1.2, avgAov: 2400 },
        "B2B SaaS": { avgTraffic: 5200, avgBounce: 54, avgConversion: 1.4, avgAov: 1200 },
        "E-commerce": { avgTraffic: 14000, avgBounce: 52, avgConversion: 1.6, avgAov: 70 },
        Agency: { avgTraffic: 2400, avgBounce: 60, avgConversion: 1.1, avgAov: 3200 },
      };
      return map[category] || map["B2B Services"];
    };

    const estimateLift = (
      visitors: number,
      bounceRate: number,
      conversionRate: number,
      aov: number,
      scoreMultiplier: number,
    ) => {
      const currentQualified = visitors * (1 - bounceRate / 100);
      const currentConversions = currentQualified * (conversionRate / 100);
      const currentRevenue = currentConversions * aov;
      const projectedBounce = Math.max(42, bounceRate - (3 + scoreMultiplier * 2));
      const projectedConversion = conversionRate + (0.12 + scoreMultiplier * 0.18);
      const projectedQualified = visitors * (1 - projectedBounce / 100);
      const projectedConversions = projectedQualified * (projectedConversion / 100);
      const projectedRevenue = projectedConversions * aov;
      const monthlyLift = Math.max(0, projectedRevenue - currentRevenue);
      const implementationCost = 3200;
      const annualLift = monthlyLift * 12;
      const roi = implementationCost > 0 ? annualLift / implementationCost : 0;
      const paybackMonths = monthlyLift > 0 ? implementationCost / monthlyLift : 999;
      const payback =
        paybackMonths < 0.5 ? "1-2 weeks" :
        paybackMonths < 1 ? "2-4 weeks" :
        paybackMonths < 2 ? "1-2 months" :
        `${Math.ceil(paybackMonths)} months`;
      return {
        currentRevenue: Math.round(currentRevenue),
        monthlyLift: Math.round(monthlyLift),
        annualLift: Math.round(annualLift),
        cost: implementationCost,
        payback,
        roi: Math.max(1, Math.round(roi)),
      };
    };

    const category = mapGenreToCategory(report.genre);
    const benchmark = getIndustryBenchmarks(category);
    const scoreAverage =
      scorePages.reduce((sum, item) => sum + item.score.score, 0) / Math.max(scorePages.length, 1);
    const recommendationReason =
      scoreAverage < 65
        ? "Your current scores suggest a conservative commercial upside until the foundational fixes land."
        : scoreAverage < 78
          ? "Your current scores point to a realistic mid-market upside if the top fixes are implemented well."
          : "Your current scores suggest the stronger scenario is credible once the brand sharpens its highest-friction points.";
    const recommendedScenario = scoreAverage < 65 ? "Conservative" : scoreAverage < 78 ? "Realistic" : "Optimistic";
    const roiScenarios = [
      {
        label: pdfCopy.roiConservative,
        description: pdfCopy.roiScale1,
        assumptions: {
          visitors: Math.round(benchmark.avgTraffic * 0.65),
          aov: Math.round(benchmark.avgAov * 0.8),
          bounce: benchmark.avgBounce + 9,
          conversion: benchmark.avgConversion * 0.82,
        },
        ...estimateLift(
          Math.round(benchmark.avgTraffic * 0.65),
          benchmark.avgBounce + 9,
          benchmark.avgConversion * 0.82,
          Math.round(benchmark.avgAov * 0.8),
          Math.max(0.08, (scoreAverage - 52) / 95),
        ),
      },
      {
        label: pdfCopy.roiRealistic,
        description: pdfCopy.roiScale2,
        assumptions: {
          visitors: Math.round(benchmark.avgTraffic * 1.1),
          aov: Math.round(benchmark.avgAov),
          bounce: benchmark.avgBounce + 6,
          conversion: benchmark.avgConversion * 0.95,
        },
        ...estimateLift(
          Math.round(benchmark.avgTraffic * 1.1),
          benchmark.avgBounce + 6,
          benchmark.avgConversion * 0.95,
          Math.round(benchmark.avgAov),
          Math.max(0.12, (scoreAverage - 55) / 72),
        ),
      },
      {
        label: pdfCopy.roiOptimistic,
        description: pdfCopy.roiScale3,
        assumptions: {
          visitors: Math.round(benchmark.avgTraffic * 1.6),
          aov: Math.round(benchmark.avgAov * 1.15),
          bounce: benchmark.avgBounce + 3,
          conversion: benchmark.avgConversion * 1.05,
        },
        ...estimateLift(
          Math.round(benchmark.avgTraffic * 1.6),
          benchmark.avgBounce + 3,
          benchmark.avgConversion * 1.05,
          Math.round(benchmark.avgAov * 1.15),
          Math.max(0.18, (scoreAverage - 58) / 60),
        ),
      },
    ];

    const displayUrl = report.url.replace(/^https?:\/\//, "");

    // Page 1: Cover
    pageNumber += 1;
    doc.addPage();
    doc.rect(0, 0, pageWidth, pageHeight).fill(colors.dark);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text("BRANDMIRROR / FULL REPORT", contentLeft, 42, {
      characterSpacing: 2.3,
    });
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9).text(displayUrl, contentRight - 170, 42, {
      width: 170,
      align: "right",
    });
    const coverTitle = fitHeading(report.brandName, contentWidth - 92, 108, 44, 32, -3);
    doc.fillColor(colors.textOnDark).font(coverTitle.font).fontSize(coverTitle.size).text(coverTitle.text, 102, 110, {
      width: contentWidth - 92,
      lineGap: coverTitle.lineGap,
      align: "center",
    });
    doc.fillColor(colors.accent).font("Helvetica").fontSize(10.5).text(pdfCopy.coverSub, 96, 214, {
      width: contentWidth - 80,
      align: "center",
      characterSpacing: 1.9,
    });
    const coverTagline = fitTextToBox(
      truncate(report.tagline || pdfCopy.footer.replace("\n", " "), 160),
      contentWidth - 168,
      48,
      16.5,
      13,
      5,
      "Times-Roman",
    );
    doc.fillColor(colors.mutedOnDark).font(coverTagline.font).fontSize(coverTagline.size).text(coverTagline.text, 140, 252, {
      width: contentWidth - 168,
      align: "center",
      lineGap: coverTagline.lineGap,
    });
    if (archetypePosterSource) {
      drawRoundedImage(archetypePosterSource, 94, 326, contentWidth - 76, 246, 22);
      doc.save();
      doc.fillOpacity(0.62);
      doc.rect(94, 326, contentWidth - 76, 246).fill(colors.dark);
      doc.restore();
    }
    drawPanel(140, 596, pageWidth - 280, 82, colors.panel);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(8.5).text("REPORT ID", 156, 682, {
      characterSpacing: 1.5,
    });
    doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(15).text(reportId, 156, 654);
    doc.text(`${report.posterScore}/100  ${report.scoreBand}`, 156, 624, {
      width: pageWidth - 312,
      align: "left",
      characterSpacing: 0.4,
    });
    doc.moveTo(contentLeft, 744).lineTo(contentRight, 744).strokeColor(colors.rule).stroke();
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(8.5).text(pdfCopy.powered, contentLeft, 758, {
      width: 220,
    });
    doc.text(today, contentRight - 120, 758, { width: 120, align: "right" });

    // Page 2: What We Measure
    addBasePage();
    const page2TitleBottom = drawPageLabel(pdfCopy.whatThisIsLabel, "What the report measures and how to use the read", {
      width: 284,
      maxFont: 24,
      minFont: 20,
      maxHeight: 96,
    });
    let page2Y = Math.max(page2TitleBottom + 20, 186);
    for (const paragraph of pdfCopy.whatThisIsIntro) {
      page2Y = drawParagraph(paragraph, contentLeft, page2Y, 230, 11, 6) + 16;
    }
    const page2CardY = 188;
    drawPanel(318, page2CardY, 221, 186);
    drawSectionTag("FIVE AXES", 338, page2CardY + 22);
    let metricY = page2CardY + 42;
    for (const item of metricCards) {
      metricY = drawParagraph(`- ${item}`, 338, metricY, 183, 9.2, 4) + 6;
    }
    drawPanel(contentLeft, 434, contentWidth, 118, colors.panelSoft);
    doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(18).text("How to use this report", contentLeft + 22, 456);
    drawParagraph(
      "Start with the First Read and Score Dashboard. Then move into the Signal Read, the deep-dive axes, and the Priority Fix Stack. The Action Plan is there to turn diagnosis into movement.",
      contentLeft + 22,
      482,
      contentWidth - 44,
      11,
      6,
    );
    doc.fillColor(colors.accent).font("Times-Roman").fontSize(17).text(
      "A score. A diagnosis. A fix stack. One clear answer about what to sharpen first.",
      92,
      612,
      { width: contentWidth - 72, align: "center", lineGap: 5 },
    );

    // Page 3: First Read
    addBasePage();
    const page3TitleBottom = drawPageLabel("FIRST READ", "What the company does, what it signals, and how the page lands before trust is earned", { width: 330, maxFont: 24, minFont: 20, maxHeight: 106 });
    const page3Top = Math.max(page3TitleBottom + 18, 176);
    drawSectionTag("WHAT IT DOES", contentLeft, page3Top);
    const whatItDoesBox = fitTextToBox(report.whatItDoes, 256, 86, 11.6, 10.2, 6);
    let firstReadY = drawParagraph(whatItDoesBox.text, contentLeft, page3Top + 24, 256, whatItDoesBox.size, 6) + 22;
    drawSectionTag("FIRST DIAGNOSIS", contentLeft, firstReadY);
    const snapshotBox = fitTextToBox(report.snapshot, 256, 86, 12.2, 10.8, 6, "Times-Roman");
    firstReadY = drawParagraph(snapshotBox.text, contentLeft, firstReadY + 24, 256, snapshotBox.size, 6) + 22;
    drawSectionTag("CURRENT STATE", contentLeft, firstReadY);
    const currentBox = fitTextToBox(report.whatItSignals, 256, 130, 11.2, 10, 6);
    drawParagraph(currentBox.text, contentLeft, firstReadY + 24, 256, currentBox.size, 6);
    drawTextCard({
      x: 344,
      y: Math.max(page3Top + 10, 214),
      width: 195,
      height: 296,
      label: pdfCopy.reportSnapshot,
      body: truncate(report.scoreModifier, 120),
      bodySize: 9.6,
      bodyMin: 9.2,
      bodyTopOffset: 168,
    });
    drawSectionTag("CURRENT READ", 364, 240, colors.mint);
    const currentReadBox = fitTextToBox(firstSentence(report.snapshot), 159, 58, 10.3, 9.3, 4);
    drawParagraph(currentReadBox.text, 364, 264, 159, currentReadBox.size, 4);
    doc.fillColor(bandColor(overallScore)).font("Helvetica").fontSize(16).text(report.scoreBand, 364, 340, {
      width: 159,
      characterSpacing: 0.6,
    });
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(10).text(pdfCopy.overallReadiness, 364, 368, {
      width: 159,
    });
    doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(30).text(`${overallScore}/100`, 364, 394);

    // Page 4: Score Dashboard
    addBasePage();
    const page4TitleBottom = drawPageLabel(pdfCopy.scoreDashboardLabel, "Scanner readout across the five commercial signals", {
      width: 340,
      maxFont: 24,
      minFont: 20,
      maxHeight: 92,
    });
    drawTextCard({
      x: 128,
      y: Math.max(page4TitleBottom + 18, 182),
      width: 356,
      height: 116,
      label: "OVERALL",
      title: `${overallScore}/100`,
      body: report.scoreBand,
      bodySize: 11,
      bodyMin: 10.5,
      titleSize: 40,
      titleMin: 24,
      titleTopOffset: 28,
      bodyTopOffset: 78,
      bodyFont: "Helvetica",
      fill: colors.panelSoft,
    });
    const axisY = 342;
    const axisWidth = 88;
    const axisGap = 12;
    scorePages.forEach((item, index) => {
      const x = contentLeft + index * (axisWidth + axisGap);
      drawPanel(x, axisY, axisWidth, 126, index % 2 === 0 ? colors.panel : colors.panelSoft);
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(7.2).text(
        item.title.replace(" ", "\n").toUpperCase(),
        x + 10,
        axisY + 14,
        { width: axisWidth - 20, align: "center", characterSpacing: 0.8, lineGap: 2 },
      );
      doc.fillColor(bandColor(item.score.score)).font("Times-Bold").fontSize(26).text(String(item.score.score), x + 10, axisY + 56, {
        width: axisWidth - 20,
        align: "center",
      });
      doc.fillColor(bandColor(item.score.score)).font("Helvetica").fontSize(7.8).text(getBandForScore(item.score.score), x + 10, axisY + 92, {
        width: axisWidth - 20,
        align: "center",
        characterSpacing: 1.1,
      });
    });

    // Page 5: Commercial Impact
    addBasePage();
    const page5TitleBottom = drawPageLabel(pdfCopy.roiLabel, pdfCopy.roiTitle, {
      width: 360,
      maxFont: 24,
      minFont: 20,
      maxHeight: 96,
    });
    drawParagraph(pdfCopy.roiIntro, contentLeft, Math.max(page5TitleBottom + 18, 178), contentWidth - 20, 11, 6);
    drawPanel(96, 214, 420, 66, colors.panelSoft);
    drawSectionTag(pdfCopy.roiRecommended, 116, 232, colors.textMuted);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(16).text(`${recommendedScenario} Scenario`, 116, 248);
    drawParagraph(recommendationReason, 286, 228, 198, 9.2, 4);

    const tableX = contentLeft;
    const tableY = 294;
    const tableW = contentWidth;
    const labelCol = 142;
    const dataCol = (tableW - labelCol) / 3;
    const headerH = 46;
    drawPanel(tableX, tableY, tableW, headerH, colors.panelSoft);
    doc.fillColor(colors.textMuted).font("Helvetica").fontSize(8.2).text(pdfCopy.roiConservative, tableX + labelCol + 8, tableY + 12, { width: dataCol - 16, align: "center", characterSpacing: 1.1 });
    doc.text(pdfCopy.roiRealistic, tableX + labelCol + dataCol + 8, tableY + 12, { width: dataCol - 16, align: "center", characterSpacing: 1.1 });
    doc.text(pdfCopy.roiOptimistic, tableX + labelCol + dataCol * 2 + 8, tableY + 12, { width: dataCol - 16, align: "center", characterSpacing: 1.1 });
    doc.font("Helvetica").fontSize(7.8).fillColor(colors.mutedOnDark).text(pdfCopy.roiScale1, tableX + labelCol + 8, tableY + 26, { width: dataCol - 16, align: "center" });
    doc.text(pdfCopy.roiScale2, tableX + labelCol + dataCol + 8, tableY + 26, { width: dataCol - 16, align: "center" });
    doc.text(pdfCopy.roiScale3, tableX + labelCol + dataCol * 2 + 8, tableY + 26, { width: dataCol - 16, align: "center" });

    const roiRows = [
      { label: pdfCopy.roiVisitors, values: roiScenarios.map((s) => s.assumptions.visitors.toLocaleString()) },
      { label: pdfCopy.roiAov, values: roiScenarios.map((s) => `$${s.assumptions.aov.toLocaleString()}`) },
      { label: pdfCopy.roiCurrentRevenue, values: roiScenarios.map((s) => `$${s.currentRevenue.toLocaleString()}`) },
      { label: pdfCopy.roiProjectedLift, values: ["", "", ""], header: true },
      { label: pdfCopy.roiMonthlyLift, values: roiScenarios.map((s) => `+$${s.monthlyLift.toLocaleString()}`), accent: true },
      { label: pdfCopy.roiAnnualLift, values: roiScenarios.map((s) => `$${s.annualLift.toLocaleString()}`) },
      { label: pdfCopy.roiImplementation, values: ["", "", ""], header: true },
      { label: pdfCopy.roiCost, values: roiScenarios.map((s) => `$${s.cost.toLocaleString()}`) },
      { label: pdfCopy.roiPayback, values: roiScenarios.map((s) => s.payback), accent: true },
    ];
    let rowY = tableY + headerH + 6;
    roiRows.forEach((row) => {
      const height = row.header ? 28 : 32;
      drawPanel(tableX, rowY, tableW, height, row.header ? colors.panel : colors.panelSoft);
      doc.fillColor(row.header ? colors.accent : colors.textMuted).font("Helvetica").fontSize(row.header ? 8.2 : 8.8).text(row.label, tableX + 14, rowY + (row.header ? 10 : 11), {
        width: labelCol - 18,
        characterSpacing: row.header ? 1.1 : 0,
      });
      if (!row.header) {
        row.values.forEach((value, idx) => {
          doc.fillColor(row.accent ? colors.accent : colors.textOnDark).font("Helvetica").fontSize(9.2).text(
            value,
            tableX + labelCol + dataCol * idx + 8,
            rowY + 10,
            { width: dataCol - 16, align: "center" },
          );
        });
      }
      rowY += height + 6;
    });
    drawParagraph(pdfCopy.roiFootnote, contentLeft, 708, contentWidth, 8.8, 4);

    // Page 6: Signal Read Part 1
    addBasePage();
    const page6TitleBottom = drawPageLabel("SIGNAL READ", "What is missing, where the signal drifts, and what the AI layer can actually understand", {
      width: 360,
      maxFont: 28,
      minFont: 22,
      maxHeight: 118,
    });
    const signalCardWidth = (contentWidth - 18) / 2;
    drawTextCard({
      x: contentLeft,
      y: page6TitleBottom + 10,
      width: contentWidth,
      height: 156,
      label: pdfCopy.commercialCost,
      body: report.toneCheck,
      bodySize: 11.2,
      bodyMin: 9.8,
      labelColor: colors.mint,
      bodyTopOffset: 52,
      fill: colors.panelSoft,
    });
    drawTextCard({
      x: contentLeft,
      y: page6TitleBottom + 206,
      width: signalCardWidth,
      height: 184,
      label: pdfCopy.brandPromises,
      body: report.whatIsMissing || report.whatsBroken.join(" "),
      bodySize: 10.8,
      bodyMin: 9.6,
      bodyTopOffset: 50,
    });
    drawTextCard({
      x: contentLeft + signalCardWidth + 18,
      y: page6TitleBottom + 206,
      width: signalCardWidth,
      height: 184,
      label: pdfCopy.pageDelivers,
      body: report.mixedSignals,
      bodySize: 10.8,
      bodyMin: 9.6,
      bodyTopOffset: 50,
    });

    // Page 7: Signal Read Part 2
    addBasePage();
    const page7TitleBottom = drawPageLabel("SIGNAL READ", "What to do next, what to amplify, and what to stop protecting", {
      width: 390,
      maxFont: 28,
      minFont: 22,
      maxHeight: 114,
    });
    drawTextCard({
      x: contentLeft,
      y: page7TitleBottom + 10,
      width: contentWidth,
      height: 154,
      label: "WHAT TO DROP",
      body: report.whatToDrop,
      bodySize: 11.2,
      bodyMin: 10,
      labelColor: colors.terracotta,
      bodyTopOffset: 52,
      fill: colors.panelSoft,
    });
    drawTextCard({
      x: contentLeft,
      y: page7TitleBottom + 212,
      width: signalCardWidth,
      height: 204,
      label: "WHAT TO DO NEXT",
      body: report.whatToDoNext,
      bodySize: 11.2,
      bodyMin: 9.6,
      bodyTopOffset: 50,
    });
    drawTextCard({
      x: contentLeft + signalCardWidth + 18,
      y: page7TitleBottom + 212,
      width: signalCardWidth,
      height: 204,
      label: "WHAT TO AMPLIFY",
      body: report.whatToAmplify,
      bodySize: 11.2,
      bodyMin: 9.6,
      bodyTopOffset: 50,
    });

    // Page 8: Website Surface
    addBasePage();
    const page8TitleBottom = drawPageLabel(pdfCopy.websiteEvidenceLabel, pdfCopy.websiteEvidenceTitle, {
      width: 320,
      maxFont: 24,
      minFont: 20,
      maxHeight: 92,
    });
    const page8ImageY = Math.max(page8TitleBottom + 22, 178);
    if (websiteImageSource) {
      drawRoundedImage(websiteImageSource, contentLeft, page8ImageY, contentWidth, 294, 18, {
        x: heroCallout?.x,
        y: heroCallout?.y,
      });
    } else {
      drawPanel(contentLeft, page8ImageY, contentWidth, 294);
      doc.fillColor(colors.textMuted).font("Helvetica").fontSize(13).text("Website capture unavailable for this run.", contentLeft, page8ImageY + 136, {
        width: contentWidth,
        align: "center",
      });
    }
    const websiteCalloutWidth = (contentWidth - 18) / 2;
    [
      {
        label: pdfCopy.heroCalloutLabel,
        title: heroCallout?.title || "Hero promise",
        body: heroCallout?.body || report.aboveTheFold,
      },
      {
        label: pdfCopy.ctaCalloutLabel,
        title: ctaCallout?.title || "Proof and CTA zone",
        body: ctaCallout?.body || report.conversionRead,
      },
    ].forEach((item, index) => {
      const x = contentLeft + index * (websiteCalloutWidth + 18);
      drawTextCard({
        x,
        y: page8ImageY + 316,
        width: websiteCalloutWidth,
        height: 112,
        label: item.label,
        title: item.title,
        body: item.body,
        bodySize: 9.8,
        bodyMin: 9,
        titleSize: 16,
        titleMin: 13,
      });
    });
    drawParagraph(pdfCopy.websiteEvidenceCaption, contentLeft, page8ImageY + 444, contentWidth, 10.4, 5);

    // Pages 9-13: axis deep dives
    scorePages.forEach((item, index) => {
      addBasePage();
      doc.fillColor(colors.accent).font("Helvetica").fontSize(10).text(item.title.toUpperCase(), contentLeft, 72, {
        characterSpacing: 2,
      });
      const deepTitle = fitHeading(item.title, 280, 48, 28, 22, -1);
      doc.fillColor(colors.textOnDark).font(deepTitle.font).fontSize(deepTitle.size).text(deepTitle.text, contentLeft, 106);
      doc.fillColor(bandColor(item.score.score)).font("Helvetica").fontSize(42).text(String(item.score.score), contentRight - 64, 92, {
        width: 64,
        align: "right",
      });
      drawTextCard({
        x: contentLeft,
        y: 156,
        width: contentWidth,
        height: 102,
        label: item.score.score < 60 ? "PRACTICAL FIX" : "NEXT LEVEL MOVE",
        body:
          (item.score.score < 60
            ? practicalMoves[item.title as keyof typeof practicalMoves]?.low
            : practicalMoves[item.title as keyof typeof practicalMoves]?.mid) ||
          (item.score.score >= 70
            ? "This axis is already helping the brand. The next move is to make it do even more commercial work."
            : "This axis needs a more explicit correction if the page is going to convert with less resistance."),
        bodySize: 10.8,
        bodyMin: 9.6,
        labelColor: item.score.score < 60 ? colors.terracotta : colors.mint,
        bodyTopOffset: 50,
        fill: colors.panelSoft,
      });
      doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(18).text(pdfCopy.whatScoreTells, contentLeft, 292);
      const diagnosisText = fitTextToBox(item.diagnosis, 248, 182, 11.1, 10, 5);
      drawParagraph(diagnosisText.text, contentLeft, 320, 248, diagnosisText.size, diagnosisText.lineGap);
      drawPanel(332, 320, 207, 236);
      if (item.title === "Visual Credibility" && websiteImageSource) {
        drawRoundedImage(
          websiteImageSource,
          352,
          392,
          167,
          88,
          12,
          { x: report.beforeAfterHero.currentFrame.focusX, y: report.beforeAfterHero.currentFrame.focusY },
        );
        drawSectionTag(pdfCopy.revealingLine, 352, 344);
        const revealVisual = fitTextToBox(truncate(firstSentence(item.quote), 155), 167, 44, 12.2, 10.2, 4, "Times-Roman");
        doc.fillColor(colors.textOnDark).font("Times-Roman").fontSize(revealVisual.size).text(revealVisual.text, 352, 364, {
          width: 167,
          lineGap: revealVisual.lineGap,
        });
        drawSectionTag(pdfCopy.forBrand, 352, 492, colors.textMuted);
        const implicationVisual = fitTextToBox(item.implication, 167, 44, 10.2, 9, 4);
        drawParagraph(implicationVisual.text, 352, 512, 167, implicationVisual.size, implicationVisual.lineGap);
      } else {
        drawSectionTag(pdfCopy.revealingLine, 352, 344);
        const revealText = fitTextToBox(truncate(firstSentence(item.quote), 155), 167, 66, 12.8, 10.8, 4, "Times-Roman");
        doc.fillColor(colors.textOnDark).font("Times-Roman").fontSize(revealText.size).text(revealText.text, 352, 364, {
          width: 167,
          lineGap: revealText.lineGap,
        });
        drawSectionTag(pdfCopy.forBrand, 352, 470, colors.textMuted);
        const implicationText = fitTextToBox(item.implication, 167, 62, 10, 9, 4);
        drawParagraph(implicationText.text, 352, 490, 167, implicationText.size, implicationText.lineGap);
      }
      drawScoreMeter(contentLeft, 598, contentWidth, item.score.score);
      doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(16).text(pdfCopy.benchmark, contentLeft, 566);
      if (index === 4) {
        // no-op, keeps page count readable
      }
    });

    // Page 14: Brand Archetype + Poster
    addBasePage();
    const page14TitleBottom = drawPageLabel(pdfCopy.archetypeLabel, pdfCopy.archetypeTitle, {
      width: 350,
      maxFont: 24,
      minFont: 20,
      maxHeight: 92,
    });
    const page14Top = Math.max(page14TitleBottom + 18, 176);
    drawSectionTag("ARCHETYPE READ", contentLeft, page14Top);
    drawParagraph(report.archetypeRead.rationale, contentLeft, page14Top + 24, 242, 11, 6);
    drawSectionTag(pdfCopy.archetypeExpect, contentLeft, page14Top + 178);
    let expectY = page14Top + 204;
    for (const item of uniqueItems([
      report.industryFit.assessment,
      report.industryFit.leverage,
      ...report.expectationGap,
    ], 3)) {
      expectY = drawParagraph(`- ${item}`, contentLeft, expectY, 242, 10.6, 5) + 8;
    }
    drawPanel(324, page14Top, 215, 338);
    if (archetypePosterSource) {
      drawRoundedImage(archetypePosterSource, 344, page14Top + 20, 175, 182, 14);
    }
    doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(18).text(report.title, 344, page14Top + 224, {
      width: 175,
      align: "center",
    });
    drawParagraph(firstSentence(report.tagline), 356, page14Top + 258, 151, 9.6, 4);
    drawSectionTag(pdfCopy.archetypeSoWhat, contentLeft, 596);
    const implicationWidth = (contentWidth - 24) / 3;
    archetypeSoWhat.forEach((line, index) => {
      const x = contentLeft + index * (implicationWidth + 12);
      drawTextCard({
        x,
        y: 618,
        width: implicationWidth,
        height: 98,
        body: line,
        bodySize: 10,
        bodyMin: 9,
        bodyTopOffset: 26,
        fill: colors.panelSoft,
      });
    });

    // Page 15: Priority Fix Stack
    addBasePage();
    drawPageLabel(pdfCopy.fixesLabel, pdfCopy.fixesTitle, {
      width: 360,
      maxFont: 27,
      minFont: 22,
      maxHeight: 114,
    });
    const bands = [
      { title: pdfCopy.fixNow, items: report.priorityFixes.fixNow, color: colors.terracotta },
      { title: pdfCopy.fixNext, items: report.priorityFixes.fixNext, color: colors.amber },
      { title: pdfCopy.keep, items: report.priorityFixes.keep, color: colors.success },
    ];
    let bandTop = 214;
    bands.forEach((band) => {
      drawPanel(contentLeft, bandTop, contentWidth, 108);
      doc.roundedRect(contentLeft, bandTop, 122, 108, 16).fill(band.color);
      doc.fillColor(band.title === pdfCopy.keep ? colors.dark : colors.textOnDark).font("Helvetica").fontSize(12).text(band.title, contentLeft + 18, bandTop + 43, {
        characterSpacing: 1.8,
      });
      let itemY = bandTop + 18;
      band.items.slice(0, 3).forEach((text) => {
        itemY = drawParagraph(`- ${text}`, contentLeft + 148, itemY, 312, 10.4, 5) + 6;
      });
      bandTop += 124;
    });
    const weakestAxes = [...scorePages].sort((a, b) => a.score.score - b.score.score).slice(0, 2);
    drawPanel(contentLeft, 604, contentWidth, 118, colors.panelSoft);
    drawSectionTag("WHERE TO START", contentLeft + 18, 628, colors.mint);
    let weakestY = 650;
    weakestAxes.forEach((axis) => {
      const fix =
        axis.score.score < 60
          ? practicalMoves[axis.title as keyof typeof practicalMoves]?.low
          : practicalMoves[axis.title as keyof typeof practicalMoves]?.mid;
      weakestY = drawParagraph(
        `${axis.title} (${axis.score.score}/100): ${fix}`,
        contentLeft + 18,
        weakestY,
        contentWidth - 36,
        9.8,
        4,
      ) + 6;
    });

    // Page 16: 30-Day Action Plan + Back Cover
    addBasePage();
    drawPageLabel(pdfCopy.plan30Label, pdfCopy.plan30Title, {
      width: 360,
      maxFont: 27,
      minFont: 22,
      maxHeight: 112,
    });
    drawSectionTag(pdfCopy.next30, contentLeft, 196, colors.mint);
    let actionY = 222;
    report.actionPlan.next30Days.slice(0, 5).forEach((item) => {
      actionY = drawParagraph(`- ${item}`, contentLeft, actionY, 244, 10.8, 6) + 8;
    });
    drawTextCard({
      x: 332,
      y: 194,
      width: 207,
      height: 262,
      label: pdfCopy.headlineCorrection,
      title: "AFTER",
      body: `${report.rewriteSuggestions.heroLine}\n\nSUPPORT\n${report.rewriteSuggestions.subheadline}\n\nCTA\n${report.rewriteSuggestions.cta}`,
      bodySize: 9.8,
      bodyMin: 8.8,
      titleSize: 12,
      titleMin: 12,
      titleFont: "Helvetica",
      titleTopOffset: 40,
      bodyTopOffset: 76,
      fill: colors.panelSoft,
    });
    drawPanel(contentLeft, 492, contentWidth, 136, colors.panelSoft);
    drawSectionTag("WORK WITH SAHAR", contentLeft + 18, 516, colors.mint);
    drawParagraph(
      "You can use this report as a self-guided fix plan, or work with SAHAR to turn it into a sharper homepage, offer system, and brand direction that is easier to trust and easier to buy.",
      contentLeft + 18,
      540,
      contentWidth - 36,
      10.6,
      5,
    );
    doc.moveTo(contentLeft, 652).lineTo(contentRight, 652).strokeColor(colors.rule).stroke();
    doc.fillColor(colors.textOnDark).font("Times-Roman").fontSize(18).text(
      pdfCopy.backCover,
      contentLeft + 24,
      686,
      {
        width: contentWidth - 48,
        align: "center",
        lineGap: 6,
      },
    );
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9).text(pdfCopy.powered, contentLeft, 64, {
      width: contentWidth,
      align: "center",
      characterSpacing: 1.1,
    });
    doc.fillColor(colors.accent).font("Helvetica").fontSize(10).text("brandmirror.app", contentLeft, 86, {
      width: contentWidth,
      align: "center",
      characterSpacing: 1.2,
    });

    doc.end();
  });
}
