// @ts-nocheck
import PDFDocument from "pdfkit";
import * as fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { type SiteLocale } from "@/lib/site-i18n";
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
import { requestOpenAIJsonText } from "@/lib/openai-json";
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
  const pdfkitEntry = require.resolve("pdfkit/js/pdfkit.js");
  const actualDataDir = path.join(path.dirname(pdfkitEntry), "data");
  const cjsFs = require("fs") as typeof import("node:fs");
  const originalReadFileSync = cjsFs.readFileSync.bind(cjsFs);
  const shouldRedirectPdfkitDataPath = (value: string) =>
    value.includes("pdfkit/js/data/") || value.includes("pdfkit\\js\\data\\");

  const redirectedReadFileSync = ((file: fs.PathOrFileDescriptor, ...args: unknown[]) => {
    if (typeof file === "string" && shouldRedirectPdfkitDataPath(file)) {
      const redirected = path.join(actualDataDir, path.basename(file));
      return originalReadFileSync(redirected, ...(args as []));
    }

    return originalReadFileSync(file, ...(args as []));
  }) as typeof cjsFs.readFileSync;

  cjsFs.readFileSync = redirectedReadFileSync;

  return () => {
    cjsFs.readFileSync = originalReadFileSync;
  };
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
  const industryHint = {
    world: read.visualWorld,
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

  const aiDiscoverabilityRead =
    "AI can only recommend what it can classify quickly and restate without guessing. Right now the brand is clear enough to intrigue, but not yet explicit enough on category, audience, and retrieval cues to be effortlessly recommended in a real answer engine query. The site needs sharper language around who it is for, what it specifically does, and what proof supports that claim.";

  return {
    url,
    brandName: read.brandName,
    visualWorld: read.visualWorld,
    title: read.title,
    genre: read.genre,
    tagline: read.tagline,
    posterScore: read.posterScore,
    scoreBand: read.scoreBand,
    scoreModifier: read.scoreModifier,
    whatItDoes: read.whatItDoes,
    snapshot: read.summary,
    whatItSignals: read.current,
    whatIsMissing: read.gap,
    whatToDoNext: read.direction,
    whatToAmplify: read.amplify,
    whatToDrop: read.drop,
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
        imageUrl: resolveWorldPoster(read.visualWorld),
        note: "Poster layer used to frame the dominant visual world the brand suggests.",
        captureMethod: "poster",
      },
    ],
    screenshotCallouts: [
      {
        zone: "hero-promise",
        title: "Hero promise",
        body: read.gap,
        x: 12,
        y: 13,
      },
      {
        zone: "proof-cta",
        title: "Proof and CTA zone",
        body: read.nextMove,
        x: 57,
        y: 62,
      },
    ],
    scorecard: [
      {
        label: "Positioning clarity",
        score: read.positioningClarity,
        note: "How quickly the offer becomes legible on the homepage.",
      },
      {
        label: "Offer specificity",
        score: read.offerSpecificity,
        note: "How directly the brand explains what it does and why it matters.",
      },
      {
        label: "AI discoverability",
        score: read.toneCoherence,
        note: "How easily AI could classify, retrieve, and recommend this business.",
      },
      {
        label: "Visual credibility",
        score: read.visualCredibility,
        note: "How strongly the visual system implies quality and trust.",
      },
      {
        label: "Conversion readiness",
        score: read.conversionReadiness,
        note: "How prepared the page feels to turn interest into a confident next step.",
      },
    ],
    positioningRead: read.current,
    toneCheck: aiDiscoverabilityRead,
    visualIdentityRead: read.strength,
    aboveTheFold: read.gap,
    conversionRead:
      "The site creates interest and aesthetic trust, but it still leaves too much of the buying logic implicit. A stronger sense of proof, process, and expected outcome would make the next step feel more justified.",
    strategicDirection:
      "This brand should not move toward louder marketing. It should move toward sharper commercial clarity inside the premium signal it already owns. The strategy is to keep the atmosphere, but make the promise, proof, and decision path far more explicit so the brand reads as both desirable and commercially precise.",
    ...buildArchetypeLayer({
      brandName: read.brandName,
      visualWorld: read.visualWorld,
      industryHint,
      toneCheck: read.voice,
      messagingPriorities: [
        "Make the first line do more work: audience, outcome, and difference should all be visible quickly.",
      ],
      positioningMoves: [
        "Move from broad brand mood to a more explicit commercial claim that says who the offer is for and why it matters now.",
      ],
      rewriteSuggestions: {
        heroLine: `${read.brandName} helps clients understand the value faster, without losing the premium feel.`,
      },
    }),
    audienceRead: baseAudienceRead,
    verbalImage: {
      nameSignal: `${read.brandName} sounds like it should stand for a clear signal, not a vague category story.`,
      headlineSignal: "The opening line is still too soft for the level of visual control the brand already has.",
      firstScreenTone: "The first screen sounds considered, but not decisive enough.",
      risk: "If the first words stay softer than the first impression, the brand will look more confident than it sounds.",
    },
    namingFit: {
      verdict: "Partial fit: the name is strong enough to own a role, but the homepage still has to define that role faster.",
      roleMatch: `The name can support a ${formatWorldName(read.visualWorld).toLowerCase()} position, but the page is not locking that role in quickly enough.`,
      risk: "If the opening stays broad, the name will carry style before it carries meaning.",
      correction: "Use the hero to tell people exactly what kind of brand this is and what commercial territory it owns.",
    },
    headlineCorrection: {
      currentProblem: "The current first line is still building mood before it states the offer in business terms.",
      correctionLogic: "The headline should do three things fast: identify who it is for, state what changes, and make the value legible without a second read.",
      rewrittenDirection: `${read.brandName} helps clients understand the value faster, without losing the premium feel.`,
    },
    brandKnownFor: `${read.brandName} should be known for the clarity of its signal, not just the taste of its presentation.`,
    industryFit: {
      expectedArchetype: read.visualWorld.charAt(0).toUpperCase() + read.visualWorld.slice(1),
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
      read.strongestSignal,
      "The visual system already creates a premium first impression.",
      "There is already enough point of view here to feel distinct rather than generic.",
    ],
    whatsBroken: [
      read.mainFriction,
      "The homepage leans on atmosphere before a concrete commercial promise.",
      "The visitor still has to infer too much about the offer before feeling ready to act.",
    ],
    whyNotConverting: [
      "The first screen creates mood faster than it creates certainty.",
      "The CTA appears before enough proof, process, or offer clarity has been built.",
      "The brand looks more resolved than the commercial story feels.",
    ],
    audienceMismatch: buildAudienceMismatchLayer(baseAudienceRead),
    mixedSignals: read.mismatch,
    frictionMap: [
      read.mainFriction,
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
        read.nextMove,
        "Bring the core value proposition into the first screen.",
        "Add a visible proof or credibility cue before the midpoint of the page.",
      ],
      fixNext: [
        "Tighten section-level copy so each block earns its place.",
        "Introduce proof or specificity earlier in the homepage flow.",
        "Make the CTA language more outcome-led so it feels like a natural decision, not just an invitation.",
      ],
      keep: [
        read.strongestSignal,
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
      heroLine: `${read.brandName} helps clients understand the value faster, without losing the premium feel.`,
      subheadline:
        "A sharper headline, clearer offer framing, and more immediate certainty would make the current visual system convert more effectively.",
      cta: "See how it works",
    },
    beforeAfterHero: {
      currentFrame: {
        label: "Before",
        title: "Current hero",
        body: read.gap,
        focusX: 18,
        focusY: 18,
      },
      rewrittenFrame: {
        eyebrow: "After",
        headline: `${read.brandName} helps clients understand the value faster, without losing the premium feel.`,
        subheadline:
          "A sharper headline, clearer offer framing, and more immediate certainty would make the current visual system convert more effectively.",
        cta: "See how it works",
        note:
          "The rewritten hero should increase clarity without flattening the cinematic feel that already makes the brand memorable.",
        posterUrl: resolveWorldPoster(read.visualWorld),
      },
    },
    brandWorldAlternatives: [
      {
        world: read.visualWorld,
        title: `${read.brandName} currently reads as ${formatWorldName(read.visualWorld)}`,
        tagline: read.tagline,
        note: "This is the dominant visual archetype the current site is already reinforcing.",
        posterUrl: resolveWorldPoster(read.visualWorld),
        isCurrent: true,
      },
      ...WORLD_ADJACENCY[read.visualWorld].map((world, index) => ({
        world,
        title: `${formatWorldName(world)} is the adjacent lane`,
        tagline: index === 0 ? read.direction : read.mismatch,
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
        body: read.gap,
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
        body: read.nextMove,
        focusX: 72,
        focusY: 70,
      },
    ],
    strategicNextMove:
      "Once the homepage is sharpened, the wider brand system should follow the same logic: one clearer promise, stronger proof sequencing, and a more explicit path from attention to action.",
  };
}

export async function generateBrandReportPreviewFromRead(
  urlInput: string,
  read: BrandReadResult,
  language: SiteLocale = "en",
) {
  const normalized = normalizeUrl(urlInput);
  if (!normalized) {
    throw new Error("Please enter a valid website URL.");
  }

  const fallback = buildFallbackReport(normalized, read);

  if (language !== "en") {
    return localizeBrandReport(fallback, language);
  }

  return fallback;
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
  const apiKey = process.env.GEMINI_API_KEY;
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (!hasOpenAI && !apiKey) return null;
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
  - Keep scorecard labels exactly as: Positioning clarity, Offer specificity, AI discoverability, Visual credibility, Conversion readiness.
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
- Tone read: ${firstRead.voice}
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

Scorecard rules. The scorecard MUST contain exactly five items, in this order: Positioning clarity, Offer specificity, AI discoverability, Visual credibility, Conversion readiness. Do not omit any item. Do not add any item. Do not reorder. Each score is an integer 0-100.

Scoring rubric. Anchor every score to the bands below rather than going on feel. The bands are: 0-30 FLATLINING, 30-50 FRAGILE, 50-70 DEVELOPING, 70-85 STABLE, 85-100 LEADING. A brand most people would call "strong" usually lives in 70-85. 85+ is reserved for pages that already convert before the copy does any explaining.

CALIBRATION GUARDS — apply these before every score.
- 85-100 is rare. Reserved for brands visually indistinguishable from a top-10 player in their category (Stripe, Linear, Aesop, Arc, Hermès, Apple). A WordPress theme, Squarespace template, generic dark-gradient SaaS hero, or stock-photo-heavy B2B page caps at 75.
- Do not place more than ONE axis above 85 unless at least three other axes are already comfortably above 75. A brand cannot be "leading" on one thing while being ordinary on the rest.
- Default to 60-80 for most brands. If your instinct says "this feels solid", that is STABLE (70-85), not LEADING. Move the number down if you catch yourself being generous.

Positioning clarity — how quickly the homepage makes the offer legible to a first-time visitor.
- 0-40   the visitor cannot say what this company does after 10 seconds. Hero is mood-only or the promise is buried.
- 40-70  category is guessable, exact offer is not. Page leans on insider shorthand.
- 70-85  offer and audience are legible inside the hero frame.
- 85-100  offer, audience, and reason-to-care all land before the first scroll.

AI discoverability — whether AI systems could confidently discover, classify, and recommend this business in response to a real user query.
- 0-40   AI cannot reliably tell who this business is for, what it specifically offers, where it operates, or in which queries it should appear.
- 40-70  AI can roughly infer the category, but recommendation would still be generic or hesitant because the service, audience, geography, or proof are too weak or too implied.
- 70-85  The site gives clear enough signals for AI to match the business to relevant user queries with reasonable confidence. Category, audience, service scope, and trust cues are present in language the model can restate without guessing.
- 85-100  The business is highly discoverable and recommendable by AI. The site makes category, audience, location or service scope, differentiation, and proof immediately legible.

Visual credibility — whether the design signals quality, control, and category trust.
- 0-40   template feel, stock imagery, typographic inconsistency. The design undercuts the price.
- 40-70  competent but generic. Nothing marks this as category-leader.
- 70-85  considered, intentional, on-brand. A buyer would accept a premium price without flinching.
- 85-100  unmistakable. Visual system does conversion work before copy has to help.

Offer specificity — how directly the page explains what exactly is sold, to whom, and why it matters now.
- 0-40   offer is implied, never stated. Reader leaves still unsure what they would be buying.
- 40-70  the what is present but the for-whom and why-now are vague.
- 70-85  what / who / why are on the page, even if the reader has to move past the hero to find them.
- 85-100  the first screen states the offer concretely, with who it is for and what it resolves.

Conversion readiness — whether the page has earned a confident next step by the time a motivated buyer looks for one.
- 0-40   no clear next step, or a generic "learn more" that does not match intent.
- 40-70  CTAs exist but are underpowered — weak proof, vague value, mismatched commitment.
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
    { "label": "Offer specificity", "score": 71, "note": "short note" },
    { "label": "AI discoverability", "score": 82, "note": "short note" },
    { "label": "Visual credibility", "score": 86, "note": "short note" },
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

  if (hasOpenAI) {
    const text = await requestOpenAIJsonText(prompt, {
      timeoutMs: 110000,
    });

    return extractJson(text) as RawBrandReport;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  );

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
      ink: "#17130f",
      paper: "#f5f0eb",
      paperSoft: "#eee4d6",
      dark: "#1a1a1a",
      darkSoft: "#24211d",
      textOnDark: "#f0ebe3",
      mutedOnDark: "#cfc4b5",
      textOnLight: "#2d2d2d",
      mutedOnLight: "#6d6459",
      accent: "#c9a84c",
      terracotta: "#b85c38",
      rule: "#d8ccbc",
      darkRule: "#4a433a",
      success: "#738a61",
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
    const totalPages = includeWebsiteEvidencePage ? 17 : 16;
    let pageNumber = 0;
    const overallScore = Math.round(
      report.scorecard.reduce((sum, item) => sum + item.score, 0) / Math.max(report.scorecard.length, 1),
    );
    const pdfCopy = {
      en: {
        coverSub: "YOUR BRANDMIRROR REPORT",
        powered: "Powered by Sahar",
        footer: "Your brand is already speaking. This is what it is saying.",
        whatThisIsLabel: "WHAT THIS REPORT IS",
        whatThisIsTitle:
          "A product audit built to close the gap between perception and conversion",
        whatThisIsIntro: [
          `This report is not a moodboard and not a generic checklist. It is a commercial read of how ${report.brandName} is being understood the moment a buyer lands on the page.`,
          "Use it in this order: read the score dashboard first, then the diagnosis pages, then the fix stack and action plan.",
          "Every BrandMirror report is built on a five-axis scoring system designed to track the distance between how the brand looks and how confidently it sells.",
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
        websiteEvidenceLabel: "CURRENT WEBSITE SURFACE",
        websiteEvidenceTitle:
          "What the buyer sees before the copy has earned trust",
        websiteEvidenceCaption:
          "This is the current above-the-fold surface BrandMirror is diagnosing.",
        heroCalloutLabel: "HERO PROMISE",
        ctaCalloutLabel: "PROOF AND CTA ZONE",
        methodologyBullets: [
          "Positioning Clarity measures how quickly the homepage makes the offer legible.",
          "AI Discoverability measures whether AI could confidently classify and recommend the business.",
          "Visual Credibility measures whether the design signals quality and control.",
          "Offer Specificity measures how directly the page explains what it does and why it matters.",
          "Conversion Readiness measures whether the page has earned a confident next step.",
        ],
        readingScale: "READING THE SCALE",
        legend: [
          { title: "0-30", body: "Critical. The signal is weak, confusing, or actively costing trust." },
          { title: "30-70", body: "Developing. There is potential here, but the page still makes buyers work too hard." },
          { title: "70-100", body: "Strong. The brand is creating clarity, trust, and momentum with less friction." },
        ],
        whatScoreTells: "What this score is telling us",
        revealingLine: "MOST REVEALING LINE",
        forBrand: `FOR ${report.brandName.toUpperCase()}`,
        benchmark: "Benchmark",
        archetypeLabel: "BRAND ARCHETYPE",
        archetypeTitle: `${report.archetypeRead.primary} with ${report.archetypeRead.secondary} pull`,
        archetypeExpect: "What buyers expect from this role",
        archetypeSoWhat: "SO WHAT DOES THIS MEAN COMMERCIALLY?",
        gapLabel: "THE GAP DIAGNOSIS",
        gapTitle:
          "The mismatch between what the brand promises and what the page currently delivers",
        brandPromises: "WHAT YOUR BRAND PROMISES",
        pageDelivers: "WHAT THE PAGE CURRENTLY DELIVERS",
        commercialCost: "The commercial cost of this gap",
        fixesLabel: "PRIORITY FIX STACK",
        fixesTitle:
          "What to fix now, what can wait, and what is already earning its keep",
        fixNow: "FIX NOW",
        fixNext: "FIX NEXT",
        keep: "KEEP",
        plan7Label: "7-DAY ACTION PLAN",
        plan7Title:
          "What to change first to sharpen the message without losing the premium feel",
        day: "DAY",
        headlineCorrection: "HEADLINE CORRECTION",
        plan30Label: "30-DAY ACTION PLAN",
        plan30Title: "The structural changes that make the brand easier to choose",
        next30: "Next 30 days",
        campaignDirection: "Campaign direction",
        directionCues: "DIRECTION CUES",
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
        powered: "Powered by Sahar",
        footer: "Tu marca ya está hablando. Esto es lo que está diciendo.",
        whatThisIsLabel: "QUÉ ES ESTE REPORTE",
        whatThisIsTitle:
          "Una auditoría de producto diseñada para cerrar la brecha entre percepción y conversión",
        whatThisIsIntro: [
          `Este reporte no es un moodboard ni un checklist genérico. Es una lectura comercial de cómo se entiende ${report.brandName} en el momento en que un comprador aterriza en la página.`,
          "Léelo en este orden: primero el panel de scores, luego las páginas de diagnóstico, y después el stack de fixes y el plan de acción.",
          "Cada reporte BrandMirror se construye sobre un sistema de cinco ejes pensado para medir la distancia entre cómo se ve la marca y cuán bien vende.",
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
        websiteEvidenceLabel: "SUPERFICIE ACTUAL DEL SITIO",
        websiteEvidenceTitle:
          "Lo que ve el comprador antes de que el copy haya ganado confianza",
        websiteEvidenceCaption:
          "Esta es la superficie above-the-fold actual que BrandMirror está diagnosticando.",
        heroCalloutLabel: "PROMESA HERO",
        ctaCalloutLabel: "ZONA DE PRUEBA Y CTA",
        methodologyBullets: [
          "Positioning Clarity mide qué tan rápido la homepage hace legible la oferta.",
          "AI Discoverability mide si la IA podría clasificar y recomendar el negocio con confianza.",
          "Visual Credibility mide si el diseño comunica calidad y control.",
          "Offer Specificity mide qué tan directo es el sitio al explicar lo que hace y por qué importa.",
          "Conversion Readiness mide si la página ya ganó el derecho a pedir el siguiente paso.",
        ],
        readingScale: "CÓMO LEER LA ESCALA",
        legend: [
          { title: "0-40", body: "Crítico. La señal es débil, confusa o está dañando la confianza." },
          { title: "40-70", body: "En desarrollo. Hay potencial, pero la página todavía obliga demasiado al comprador." },
          { title: "70-100", body: "Fuerte. La marca ya está generando claridad, confianza y momentum." },
        ],
        whatScoreTells: "Qué nos está diciendo este score",
        revealingLine: "LÍNEA MÁS REVELADORA",
        forBrand: `PARA ${report.brandName.toUpperCase()}`,
        benchmark: "Benchmark",
        archetypeLabel: "ARQUETIPO DE MARCA",
        archetypeTitle: `${report.archetypeRead.primary} con un pull hacia ${report.archetypeRead.secondary}`,
        archetypeExpect: "Qué espera el comprador de este rol",
        archetypeSoWhat: "¿QUÉ SIGNIFICA ESTO COMERCIALMENTE?",
        gapLabel: "DIAGNÓSTICO DE LA BRECHA",
        gapTitle:
          "La diferencia entre lo que promete la marca y lo que la página realmente entrega",
        brandPromises: "LO QUE TU MARCA PROMETE",
        pageDelivers: "LO QUE LA PÁGINA ENTREGA",
        commercialCost: "El coste comercial de esta brecha",
        fixesLabel: "STACK DE FIXES PRIORITARIOS",
        fixesTitle:
          "Qué arreglar ahora, qué puede esperar y qué ya está trabajando a favor de la marca",
        fixNow: "ARREGLAR AHORA",
        fixNext: "ARREGLAR DESPUÉS",
        keep: "MANTENER",
        plan7Label: "PLAN DE 7 DÍAS",
        plan7Title:
          "Qué cambiar primero para afilar el mensaje sin perder el tono premium",
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
        powered: "Powered by Sahar",
        footer: "Твой бренд уже говорит. Вот что он говорит.",
        whatThisIsLabel: "ЧТО ЭТО ЗА ОТЧЁТ",
        whatThisIsTitle:
          "Продуктовая аудит-версия, которая закрывает разрыв между восприятием и конверсией",
        whatThisIsIntro: [
          `Это не moodboard и не generic checklist. Это коммерческое чтение того, как считывается ${report.brandName} в момент, когда покупатель попадает на страницу.`,
          "Читай его так: сначала score dashboard, потом страницы диагноза, потом stack fixes и action plan.",
          "Каждый отчёт BrandMirror строится на системе из пяти осей, которая измеряет разрыв между тем, как бренд выглядит, и тем, насколько уверенно он продаёт.",
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
        websiteEvidenceLabel: "ТЕКУЩАЯ ПОВЕРХНОСТЬ САЙТА",
        websiteEvidenceTitle:
          "Что видит покупатель до того, как текст успевает заслужить доверие",
        websiteEvidenceCaption:
          "Это текущая above-the-fold поверхность, которую BrandMirror использует как главный визуальный слой диагноза.",
        heroCalloutLabel: "HERO-ОБЕЩАНИЕ",
        ctaCalloutLabel: "ЗОНА PROOF И CTA",
        methodologyBullets: [
          "Positioning Clarity измеряет, насколько быстро homepage делает оффер понятным.",
          "AI Discoverability измеряет, сможет ли ИИ уверенно классифицировать и рекомендовать этот бизнес.",
          "Visual Credibility измеряет, сигналит ли дизайн качество и контроль.",
          "Offer Specificity измеряет, насколько прямо страница объясняет, что она делает и почему это важно.",
          "Conversion Readiness измеряет, заслужила ли страница право попросить следующий шаг.",
        ],
        readingScale: "КАК ЧИТАТЬ ШКАЛУ",
        legend: [
          { title: "0-40", body: "Критично. Сигнал слабый, запутанный или уже ломает доверие." },
          { title: "40-70", body: "В развитии. Потенциал есть, но страница всё ещё заставляет покупателя слишком много додумывать." },
          { title: "70-100", body: "Сильно. Бренд уже создаёт ясность, доверие и движение вперёд." },
        ],
        whatScoreTells: "Что нам говорит этот score",
        revealingLine: "САМАЯ ПОКАЗАТЕЛЬНАЯ ЛИНИЯ",
        forBrand: `ДЛЯ ${report.brandName.toUpperCase()}`,
        benchmark: "Ориентир",
        archetypeLabel: "АРХЕТИП БРЕНДА",
        archetypeTitle: `${report.archetypeRead.primary} с тягой к ${report.archetypeRead.secondary}`,
        archetypeExpect: "Что покупатель ждёт от этой роли",
        archetypeSoWhat: "И ЧТО ЭТО ЗНАЧИТ КОММЕРЧЕСКИ?",
        gapLabel: "ДИАГНОЗ РАЗРЫВА",
        gapTitle:
          "Несовпадение между тем, что бренд обещает, и тем, что страница реально даёт",
        brandPromises: "ЧТО ОБЕЩАЕТ БРЕНД",
        pageDelivers: "ЧТО РЕАЛЬНО ДАЁТ СТРАНИЦА",
        commercialCost: "Коммерческая цена этого разрыва",
        fixesLabel: "СТЕК ПРИОРИТЕТНЫХ FIXES",
        fixesTitle:
          "Что исправить сейчас, что может подождать и что уже работает на бренд",
        fixNow: "ИСПРАВИТЬ СЕЙЧАС",
        fixNext: "ИСПРАВИТЬ СЛЕДОМ",
        keep: "ОСТАВИТЬ",
        plan7Label: "ПЛАН НА 7 ДНЕЙ",
        plan7Title:
          "Что поменять первым, чтобы сделать сообщение острее и не потерять premium feel",
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
      .slice(0, 3)}-${new Date().getFullYear()}-${Buffer.from(report.url)
      .toString("base64")
      .replace(/[^A-Z0-9]/gi, "")
      .slice(0, 3)
      .toUpperCase()}`;
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

    const addBasePage = (mode: "light" | "dark") => {
      pageNumber += 1;
      doc.addPage();
      doc.rect(0, 0, pageWidth, pageHeight).fill(mode === "dark" ? colors.dark : colors.paper);
      doc.fillColor(mode === "dark" ? colors.accent : colors.accent)
        .font("Helvetica")
        .fontSize(9)
        .text("BRANDMIRROR", contentLeft, 36, { characterSpacing: 2.4 });
      doc.fillColor(mode === "dark" ? colors.mutedOnDark : colors.mutedOnLight)
        .font("Helvetica")
        .fontSize(9)
        .text(`${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`, contentRight - 56, 36, {
          width: 56,
          align: "right",
          characterSpacing: 1.2,
        });
      doc.moveTo(contentLeft, 760)
        .lineTo(contentRight, 760)
        .strokeColor(mode === "dark" ? colors.darkRule : colors.rule)
        .lineWidth(0.8)
        .stroke();
      doc.fillColor(mode === "dark" ? colors.mutedOnDark : colors.mutedOnLight)
        .font("Helvetica")
        .fontSize(8)
        .text(pdfCopy.footer, contentLeft, 772, {
          width: 280,
        });
    };

    const drawPageLabel = (label: string, title: string, mode: "light" | "dark") => {
      doc.fillColor(mode === "dark" ? colors.accent : colors.accent)
        .font("Helvetica")
        .fontSize(10)
        .text(label, contentLeft, 72, { characterSpacing: 2 });
      doc.fillColor(mode === "dark" ? colors.textOnDark : colors.ink)
        .font("Times-Bold")
        .fontSize(28)
        .text(title, contentLeft, 102, {
          width: contentWidth - 40,
          lineGap: -1,
        });
      return doc.y;
    };

    const drawParagraph = (
      text: string,
      x: number,
      y: number,
      width: number,
      mode: "light" | "dark",
      fontSize = 11,
      lineGap = 5,
    ) => {
      doc.fillColor(mode === "dark" ? colors.mutedOnDark : colors.mutedOnLight)
        .font("Helvetica")
        .fontSize(fontSize)
        .text(bodyCopy(text), x, y, { width, lineGap });
      return doc.y;
    };

    const drawBulletBlock = (
      heading: string,
      items: string[],
      x: number,
      y: number,
      width: number,
      mode: "light" | "dark",
      max = items.length,
    ) => {
      doc.fillColor(mode === "dark" ? colors.textOnDark : colors.ink)
        .font("Times-Bold")
        .fontSize(18)
        .text(heading, x, y, { width });
      let nextY = y + 28;
      for (const item of uniqueItems(items, max)) {
        doc.fillColor(mode === "dark" ? colors.mutedOnDark : colors.mutedOnLight)
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

    const drawScoreMeter = (x: number, y: number, width: number, score: number, mode: "light" | "dark") => {
      doc.roundedRect(x, y, width, 8, 4).fill(mode === "dark" ? "#332f2a" : "#e2d6c6");
      doc.roundedRect(x, y, Math.max(8, width * (score / 100)), 8, 4).fill(colors.accent);
      [0, 40, 70, 100].forEach((tick) => {
        const tickX = x + width * (tick / 100);
        doc.moveTo(tickX, y + 12).lineTo(tickX, y + 18).strokeColor(mode === "dark" ? colors.mutedOnDark : colors.mutedOnLight).stroke();
      });
      doc.fillColor(mode === "dark" ? colors.mutedOnDark : colors.mutedOnLight)
        .font("Helvetica")
        .fontSize(8)
        .text("0", x - 2, y + 20);
      doc.text("70", x + width * 0.7 - 6, y + 20);
      doc.text("100", x + width - 14, y + 20);
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
        label: "Offer specificity",
        title: "Offer Specificity",
        diagnosis: report.aboveTheFold,
        quote: report.namingFit.correction,
        implication: report.offerOpportunities[0] || report.whatsBroken[1] || report.aboveTheFold,
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

    // Page 1: cover
    pageNumber += 1;
    doc.addPage();
    doc.rect(0, 0, pageWidth, pageHeight).fill(colors.dark);
    if (archetypePosterSource) {
      const coverX = 36;
      const coverY = 30;
      const coverWidth = pageWidth - 72;
      const coverHeight = pageHeight - 96;

      drawRoundedImage(archetypePosterSource, coverX, coverY, coverWidth, coverHeight, 24);

      doc.save();
      doc.fillOpacity(0.18);
      doc.roundedRect(coverX, coverY, coverWidth, 112, 24).fill(colors.dark);
      doc.fillOpacity(0.48);
      doc.rect(coverX, coverY + coverHeight - 264, coverWidth, 264).fill(colors.dark);
      doc.restore();

      doc.fillColor(colors.accent).font("Helvetica").fontSize(10).text("BRANDMIRROR", coverX + 22, coverY + 22, {
        characterSpacing: 2.4,
      });

      doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(46).text(report.brandName, coverX + 28, coverY + 188, {
        width: coverWidth - 56,
        align: "center",
        lineGap: -2,
      });
      doc.fillColor(colors.textOnDark).font("Times-Roman").fontSize(20).text(report.tagline, coverX + 64, coverY + 306, {
        width: coverWidth - 128,
        align: "center",
        lineGap: 4,
      });
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(11).text(report.genre, coverX + 32, coverY + 390, {
        width: coverWidth - 64,
        align: "center",
        characterSpacing: 2.1,
      });

      doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(15).text(
        `RATED ${report.posterScore} · ${report.scoreBand}`,
        coverX + 28,
        coverY + coverHeight - 122,
        {
          width: coverWidth - 56,
          align: "center",
          characterSpacing: 0.4,
        },
      );
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(10.5).text(
        truncate(report.scoreModifier, 120),
        coverX + 72,
        coverY + coverHeight - 92,
        {
          width: coverWidth - 144,
          align: "center",
          lineGap: 4,
        },
      );
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9).text(
        "brandmirror.app",
        coverX + 28,
        coverY + coverHeight - 42,
        {
          width: coverWidth - 56,
          align: "center",
          characterSpacing: 1.2,
        },
      );

      doc.moveTo(contentLeft, 792).lineTo(contentRight, 792).strokeColor(colors.accent).lineWidth(1).stroke();
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(8.5).text(pdfCopy.powered, contentLeft, 804, {
        width: 180,
        align: "left",
        characterSpacing: 1.1,
      });
      doc.text(reportId, contentRight - 160, 804, {
        width: 160,
        align: "right",
        characterSpacing: 1.3,
      });
    } else {
      doc.fillColor(colors.accent).font("Helvetica").fontSize(10).text("BRANDMIRROR", contentLeft, 56, {
        characterSpacing: 2.4,
      });
      doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(42).text(report.brandName, contentLeft, 262, {
        width: contentWidth,
        align: "center",
      });
      doc.moveTo(200, 336).lineTo(395, 336).strokeColor(colors.accent).lineWidth(1).stroke();
      doc.fillColor(colors.accent).font("Helvetica").fontSize(12).text(pdfCopy.coverSub, contentLeft, 354, {
        width: contentWidth,
        align: "center",
        characterSpacing: 1.8,
      });
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(11).text(today, contentLeft, 382, {
        width: contentWidth,
        align: "center",
      });
      doc.fillColor(colors.textOnDark).font("Times-Roman").fontSize(22).text(pdfCopy.footer, 118, 564, {
        width: 360,
        align: "center",
        lineGap: 4,
      });
      doc.moveTo(contentLeft, 744).lineTo(contentRight, 744).strokeColor(colors.accent).lineWidth(1).stroke();
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9).text(pdfCopy.powered, contentLeft, 760, {
        width: 180,
        align: "left",
        characterSpacing: 1.1,
      });
      doc.text(reportId, contentRight - 160, 760, { width: 160, align: "right", characterSpacing: 1.3 });
    }

    // Page 2: what this report is
    addBasePage("light");
    const whatThisBottom = drawPageLabel(pdfCopy.whatThisIsLabel, pdfCopy.whatThisIsTitle, "light");
    const introText = pdfCopy.whatThisIsIntro;
    let introY = Math.max(whatThisBottom + 26, 176);
    for (const paragraph of introText) {
      introY = drawParagraph(paragraph, contentLeft, introY, 286, "light", 12, 7) + 18;
    }
    const snapshotX = 362;
    const snapshotY = Math.max(whatThisBottom + 12, 176);
    const snapshotWidth = 177;
    doc.roundedRect(snapshotX, snapshotY, snapshotWidth, 248, 14).fill(colors.paperSoft);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.reportSnapshot, snapshotX + 20, snapshotY + 22, {
      characterSpacing: 1.8,
    });
    doc.fillColor(colors.ink).font("Times-Bold").fontSize(22).text(`${overallScore}/100`, snapshotX + 20, snapshotY + 52);
    doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(11).text(pdfCopy.overallReadiness, snapshotX + 20, snapshotY + 84, {
      width: 132,
    });
    doc.fillColor(colors.ink).font("Times-Bold").fontSize(15).text(report.title, snapshotX + 20, snapshotY + 126, {
      width: 138,
      lineGap: 0,
    });
    const snapshotTextY = doc.y + 18;
    doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(10.5).text(truncate(report.snapshot, 185), snapshotX + 20, snapshotTextY, {
      width: 138,
      lineGap: 5,
    });

    // Page 3: score dashboard
    addBasePage("dark");
    drawPageLabel(pdfCopy.scoreDashboardLabel, pdfCopy.scoreDashboardTitle, "dark");
    const cardTop = 208;
    const cardWidth = 87;
    const gap = 10;
    scorePages.forEach((item, index) => {
      const x = contentLeft + index * (cardWidth + gap);
      doc.roundedRect(x, cardTop, cardWidth, 348, 12).fill(colors.darkSoft);
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(8).text(item.title.toUpperCase(), x + 12, cardTop + 16, {
        width: cardWidth - 24,
        characterSpacing: 1.1,
      });
      doc.fillColor(colors.accent).font("Helvetica").fontSize(28).text(String(item.score.score), x + 12, cardTop + 44, {
        width: cardWidth - 24,
      });
      doc.roundedRect(x + 33, cardTop + 100, 20, 160, 10).fill("#3a342c");
      const fillHeight = Math.max(18, 160 * (item.score.score / 100));
      doc.roundedRect(x + 33, cardTop + 260 - fillHeight, 20, fillHeight, 10).fill(index === 3 ? colors.terracotta : colors.accent);
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9).text(truncate(item.score.note, 70), x + 12, cardTop + 282, {
        width: cardWidth - 24,
        lineGap: 4,
      });
    });
    doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(20).text(pdfCopy.scoreSentence, contentLeft, 608, {
      width: contentWidth,
      align: "center",
    });
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(11).text(
      pdfCopy.scoreSub,
      110,
      640,
      { width: 375, align: "center", lineGap: 5 },
    );
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(
      language === "es"
        ? "Comparte tu score y etiqueta a @brandmirror."
        : language === "ru"
          ? "Поделись своим score и отметь @brandmirror."
          : "Share your score and tag @brandmirror.",
      contentLeft,
      700,
      { width: contentWidth, align: "center", characterSpacing: 1.2 },
    );

    // Page 4: methodology
    addBasePage("light");
    drawPageLabel(pdfCopy.methodologyLabel, pdfCopy.methodologyTitle, "light");
    let methodY = 176;
    pdfCopy.methodologyBullets.forEach((item) => {
      doc.fillColor(colors.ink).font("Helvetica").fontSize(11).text(`- ${item}`, contentLeft, methodY, {
        width: 270,
        lineGap: 6,
      });
      methodY = doc.y + 12;
    });
    doc.roundedRect(360, 176, 179, 328, 14).fill("#efe6d9");
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.readingScale, 382, 198, {
      characterSpacing: 1.7,
    });
    let legendY = 236;
    pdfCopy.legend.forEach((item, index) => {
      doc.roundedRect(382, legendY, 135, 64, 12).fill(index === 0 ? "#ead7cf" : index === 1 ? "#eadfc9" : "#dde4d3");
      doc.fillColor(colors.ink).font("Helvetica").fontSize(14).text(item.title, 398, legendY + 14);
      doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(10).text(item.body, 398, legendY + 32, {
        width: 103,
        lineGap: 4,
      });
      legendY += 84;
    });

    if (includeWebsiteEvidencePage) {
      addBasePage("light");
      drawPageLabel(pdfCopy.websiteEvidenceLabel, pdfCopy.websiteEvidenceTitle, "light");
      doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(11).text(
        pdfCopy.websiteEvidenceCaption,
        contentLeft,
        170,
        { width: 320, lineGap: 5 },
      );
      drawRoundedImage(
        websiteImageSource,
        contentLeft,
        208,
        contentWidth,
        300,
        16,
        { x: heroCallout?.x, y: heroCallout?.y },
      );
      const calloutTop = 536;
      const calloutWidth = (contentWidth - 18) / 2;
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
        const x = contentLeft + index * (calloutWidth + 18);
        doc.roundedRect(x, calloutTop, calloutWidth, 156, 14).fill(colors.paperSoft);
        doc.fillColor(colors.accent).font("Helvetica").fontSize(8.5).text(item.label, x + 18, calloutTop + 18, {
          width: calloutWidth - 36,
          characterSpacing: 1.4,
        });
        doc.fillColor(colors.ink).font("Times-Bold").fontSize(18).text(item.title, x + 18, calloutTop + 42, {
          width: calloutWidth - 36,
          lineGap: 1,
        });
        doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(10.5).text(truncate(item.body, 180), x + 18, doc.y + 12, {
          width: calloutWidth - 36,
          lineGap: 5,
        });
      });
    }

    // Score axis pages
    scorePages.forEach((item) => {
      addBasePage("light");
      doc.rect(0, 0, pageWidth, 156).fill(colors.dark);
      doc.fillColor(colors.accent).font("Helvetica").fontSize(10).text(item.title.toUpperCase(), contentLeft, 72, {
        characterSpacing: 2,
      });
      doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(30).text(item.title, contentLeft, 104);
      doc.fillColor(colors.accent).font("Helvetica").fontSize(40).text(String(item.score.score), contentRight - 74, 92, {
        width: 56,
        align: "right",
      });
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(10).text(item.score.note, contentLeft, 190, {
        width: 246,
        lineGap: 5,
      });
      doc.fillColor(colors.ink).font("Times-Bold").fontSize(20).text(pdfCopy.whatScoreTells, contentLeft, 246, {
        width: 246,
      });
      drawParagraph(item.diagnosis, contentLeft, 278, 246, "light", 12, 7);
      doc.roundedRect(338, 246, 201, 214, 14).fill(colors.paperSoft);
      let calloutBodyY = 294;
      if (item.title === "Visual Credibility" && websiteImageSource) {
        drawRoundedImage(
          websiteImageSource,
          358,
          264,
          161,
          86,
          12,
          {
            x: report.beforeAfterHero.currentFrame.focusX,
            y: report.beforeAfterHero.currentFrame.focusY,
          },
        );
        doc.fillColor(colors.accent).font("Helvetica").fontSize(8.5).text(pdfCopy.revealingLine, 358, 362, {
          width: 161,
          characterSpacing: 1.4,
        });
        calloutBodyY = 386;
      } else {
        doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.revealingLine, 358, 268, {
          characterSpacing: 1.5,
        });
      }
      doc.fillColor(colors.ink).font("Times-Roman").fontSize(14).text(truncate(firstSentence(item.quote), 140), 358, calloutBodyY, {
        width: 161,
        lineGap: 4,
      });
      const calloutMetaY = Math.max(doc.y + 12, item.title === "Visual Credibility" ? 412 : 376);
      doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.forBrand, 358, calloutMetaY, {
        characterSpacing: 1.5,
      });
      doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(10).text(truncate(item.implication, 170), 358, calloutMetaY + 24, {
        width: 161,
        lineGap: 5,
      });
      drawScoreMeter(contentLeft, 610, contentWidth, item.score.score, "light");
      doc.fillColor(colors.ink).font("Times-Bold").fontSize(16).text(pdfCopy.benchmark, contentLeft, 562);
      doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(11).text(
        language === "es"
          ? item.score.score >= 80
            ? "Este eje ya le está dando una ventaja real a la marca."
            : item.score.score >= 65
              ? "Este eje tiene base, pero todavía pierde momentum."
              : "Este eje está frenando la confianza y necesita corrección directa."
          : language === "ru"
            ? item.score.score >= 80
              ? "Эта ось уже даёт бренду реальное преимущество."
              : item.score.score >= 65
                ? "У этой оси уже есть база, но она всё ещё теряет momentum."
                : "Эта ось тормозит доверие и требует прямой коррекции."
            : item.score.score >= 80
              ? "This axis is already giving the brand an advantage."
              : item.score.score >= 65
                ? "This axis has a foundation, but it is still leaking momentum."
                : "This axis is slowing trust and needs direct correction.",
        contentLeft + 96,
        564,
        { width: 387, lineGap: 5 },
      );
    });

    // Page 10: archetype
    addBasePage("dark");
    drawPageLabel(pdfCopy.archetypeLabel, pdfCopy.archetypeTitle, "dark");
    drawParagraph(report.archetypeRead.rationale, contentLeft, 176, contentWidth, "dark", 12, 7);
    doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(18).text(pdfCopy.archetypeExpect, contentLeft, 274);
    let archY = 304;
    for (const item of uniqueItems([
      report.industryFit.assessment,
      report.industryFit.leverage,
      ...report.expectationGap,
    ], 3)) {
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(11).text(`- ${item}`, contentLeft, archY, {
        width: 224,
        lineGap: 5,
      });
      archY = doc.y + 10;
    }
    doc.roundedRect(320, 256, 219, 284, 16).fill(colors.darkSoft);
    if (archetypePosterSource) {
      drawRoundedImage(archetypePosterSource, 342, 278, 175, 108, 12);
    }
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.archetypeSoWhat, 342, archetypePosterSource ? 406 : 282, {
      width: 175,
      characterSpacing: 1.4,
    });
    let soWhatY = archetypePosterSource ? 438 : 328;
    archetypeSoWhat.forEach((line) => {
      doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(11).text(`- ${line}`, 342, soWhatY, {
        width: 175,
        lineGap: 5,
      });
      soWhatY = doc.y + 12;
    });

    // Page 11: gap diagnosis
    addBasePage("light");
    drawPageLabel(pdfCopy.gapLabel, pdfCopy.gapTitle, "light");
    doc.moveTo(297, 176).lineTo(297, 654).strokeColor(colors.rule).stroke();
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.brandPromises, contentLeft, 176, {
      characterSpacing: 1.5,
    });
    drawBulletBlock("", promiseBullets, contentLeft, 198, 205, "light", 3);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.pageDelivers, 325, 176, {
      characterSpacing: 1.5,
    });
    drawBulletBlock("", deliverBullets, 325, 198, 214, "light", 3);
    doc.roundedRect(contentLeft, 520, contentWidth, 110, 14).fill(colors.paperSoft);
    doc.fillColor(colors.ink).font("Times-Bold").fontSize(18).text(pdfCopy.commercialCost, 76, 546);
    drawParagraph(
      truncate(report.mixedSignals || report.whyNotConverting.join(" "), 260),
      76,
      574,
      443,
      "light",
      11,
      6,
    );

    // Page 12: priority fix stack
    addBasePage("dark");
    drawPageLabel(pdfCopy.fixesLabel, pdfCopy.fixesTitle, "dark");
    const bands = [
      { title: pdfCopy.fixNow, items: report.priorityFixes.fixNow, color: colors.terracotta },
      { title: pdfCopy.fixNext, items: report.priorityFixes.fixNext, color: colors.accent },
      { title: pdfCopy.keep, items: report.priorityFixes.keep, color: colors.success },
    ];
    let bandY = 184;
    bands.forEach((band) => {
      doc.roundedRect(contentLeft, bandY, contentWidth, 144, 16).fill(colors.darkSoft);
      doc.roundedRect(contentLeft, bandY, 132, 144, 16).fill(band.color);
      doc.fillColor(band.title === "KEEP" ? colors.ink : colors.textOnDark).font("Helvetica").fontSize(12).text(band.title, contentLeft + 20, bandY + 26, {
        characterSpacing: 1.8,
      });
      let itemY = bandY + 24;
      band.items.slice(0, 3).forEach((item) => {
        doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(11).text(`- ${item}`, 206, itemY, {
          width: 300,
          lineGap: 5,
        });
        itemY = doc.y + 10;
      });
      bandY += 164;
    });

    // Page 13: 7-day action plan
    addBasePage("light");
    drawPageLabel(pdfCopy.plan7Label, pdfCopy.plan7Title, "light");
    doc.moveTo(104, 188).lineTo(104, 602).strokeColor(colors.accent).lineWidth(1.2).stroke();
    let dayY = 204;
    report.actionPlan.next7Days.slice(0, 3).forEach((item, index) => {
      doc.circle(104, dayY + 8, 7).fill(colors.accent);
      doc.fillColor(colors.ink).font("Helvetica").fontSize(10).text(`${pdfCopy.day} ${index + 1}-${index + 2}`, 126, dayY, {
        characterSpacing: 1.1,
      });
      drawParagraph(item, 126, dayY + 18, 240, "light", 11, 6);
      dayY += 128;
    });
    doc.roundedRect(392, 188, 147, 328, 14).fill(colors.paperSoft);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.headlineCorrection, 412, 210, {
      characterSpacing: 1.5,
    });
    doc.fillColor(colors.ink).font("Times-Bold").fontSize(18).text(report.rewriteSuggestions.heroLine, 412, 242, {
      width: 107,
      lineGap: 4,
    });
    doc.fillColor(colors.mutedOnLight).font("Helvetica").fontSize(10).text(report.rewriteSuggestions.subheadline, 412, 336, {
      width: 107,
      lineGap: 5,
    });
    doc.fillColor(colors.terracotta).font("Helvetica").fontSize(10).text(report.rewriteSuggestions.cta, 412, 452, {
      width: 107,
      lineGap: 4,
    });

    // Page 14: 30-day plan
    addBasePage("light");
    drawPageLabel(pdfCopy.plan30Label, pdfCopy.plan30Title, "light");
    let longY = 180;
    longY = drawBulletBlock(pdfCopy.next30, report.actionPlan.next30Days, contentLeft, longY, 270, "light", 3) + 18;
    drawBulletBlock(pdfCopy.campaignDirection, report.campaignAngles.map((item) => `${item.title}: ${item.angle}`), contentLeft, longY, 270, "light", 2);
    doc.roundedRect(358, 180, 181, 360, 14).fill(colors.paperSoft);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(pdfCopy.directionCues, 380, 204, {
      characterSpacing: 1.6,
    });
    let cueY = 236;
    uniqueItems([
      ...report.visualCodes.palette.slice(0, 3),
      ...report.toneOfVoice.slice(0, 2),
      report.brandKnownFor,
    ], 6).forEach((item) => {
      doc.fillColor(colors.ink).font("Helvetica").fontSize(10).text(item, 380, cueY, {
        width: 137,
        lineGap: 4,
      });
      cueY = doc.y + 12;
      doc.moveTo(380, cueY).lineTo(517, cueY).strokeColor(colors.rule).stroke();
      cueY += 12;
    });

    // Page 15: what comes next
    addBasePage("dark");
    drawPageLabel(pdfCopy.nextLabel, pdfCopy.nextTitle, "dark");
    const nextCards = pdfCopy.nextCards;
    nextCards.forEach((card, index) => {
      const x = contentLeft + index * 161;
      doc.roundedRect(x, 214, 149, 320, 16).fill(colors.darkSoft);
      doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text(card.icon, x + 18, 238, {
        characterSpacing: 1.7,
      });
      doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(18).text(card.title, x + 18, 270, {
        width: 113,
        lineGap: 1,
      });
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(11).text(card.body, x + 18, 354, {
        width: 113,
        lineGap: 5,
      });
      doc.fillColor(colors.accent).font("Helvetica").fontSize(16).text(card.price, x + 18, 474);
    });

    // Page 16: back cover
    addBasePage("dark");
    doc.rect(0, 0, pageWidth, pageHeight).fill(colors.dark);
    doc.fillColor(colors.accent).font("Helvetica").fontSize(11).text("BRANDMIRROR", contentLeft, 300, {
      width: contentWidth,
      align: "center",
      characterSpacing: 2.8,
    });
    doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(26).text(
      pdfCopy.backCover,
      contentLeft,
      336,
      {
        width: contentWidth,
        align: "center",
        lineGap: 6,
      },
    );
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(11).text(
      report.url.replace(/^https?:\/\//, ""),
      contentLeft,
      452,
      { width: contentWidth, align: "center" },
    );
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9).text(pdfCopy.powered, contentLeft, 736, {
      width: contentWidth,
      align: "center",
      characterSpacing: 1.2,
    });

    doc.end();
  });
}
