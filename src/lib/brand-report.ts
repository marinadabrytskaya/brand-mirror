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

type CompetitiveAxisSummary = {
  axis: string;
  yourScore: number;
  competitorAvg: number;
  lead?: number;
  gap?: number;
  leader?: string;
  leaderScore?: number;
  message: string;
};

type CompetitiveLandscape = {
  competitors: Array<{
    name: string;
    url: string;
    scores: {
      positioning: number;
      aiVisibility: number;
      visual: number;
      offer: number;
      conversion: number;
      overall: number;
    };
    tier: string;
    strengths: string[];
    snapshot: string;
  }>;
  analysis: {
    ranking: number;
    gapToLeader: number;
    strengths: CompetitiveAxisSummary[];
    weaknesses: CompetitiveAxisSummary[];
    quickestWin: {
      axis: string;
      currentGap: number;
      targetScore: number;
      message: string;
    } | null;
  };
  industryBenchmark: {
    positioning: number;
    aiVisibility: number;
    visual: number;
    offer: number;
    conversion: number;
    overall: number;
  };
};

type CompetitorCandidate = {
  name: string;
  url: string;
  reason: string;
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
  competitiveLandscape?: CompetitiveLandscape;
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
  competitiveLandscape?: CompetitiveLandscape;
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

function buildSignalTaglineFromScores(
  scores: Array<{ label: string; score: number }>,
  fallback: string,
) {
  const ranked = [...scores].sort((a, b) => a.score - b.score);
  const weakest = ranked.slice(0, 2).map((item) => item.label.toLowerCase());
  const hasAI = weakest.includes("ai visibility");
  const hasOffer = weakest.includes("offer specificity");
  const hasPositioning = weakest.includes("positioning clarity");
  const hasConversion = weakest.includes("conversion readiness");
  const hasVisual = weakest.includes("visual credibility");

  if (hasAI && hasOffer) {
    return "The offer is under-named. AI visibility is too weak to sell it.";
  }
  if (hasOffer && hasPositioning) {
    return "The page shows capability before it names what buyers can buy.";
  }
  if (hasAI && hasPositioning) {
    return "AI sees fragments. Buyers still have to name the offer themselves.";
  }
  if (hasAI && hasConversion) {
    return "AI cannot repeat the promise, and the CTA asks too early.";
  }
  if (hasOffer && hasConversion) {
    return "The offer is vague, so the click asks for trust it has not earned.";
  }
  if (hasVisual && hasOffer) {
    return "The page looks better than it sells. The offer is still missing.";
  }
  if (hasVisual && hasConversion) {
    return "The page does not earn enough trust before it asks for action.";
  }
  if (hasAI) {
    return "AI visibility is thin enough to flatten the brand into generic noise.";
  }
  if (hasOffer) {
    return "The offer is still under-named; buyers cannot repeat it fast enough.";
  }
  if (hasPositioning) {
    return "Capability is visible, but the category promise is still buried.";
  }
  if (hasConversion) {
    return "Interest is present, but the page still makes action feel risky.";
  }
  if (hasVisual) {
    return "The visual layer is not earning trust fast enough.";
  }

  return fallback;
}

function average(values: number[]) {
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
  }
}

function titleToCompanyName(title = "", url = "") {
  const cleaned = normalizeWhitespace(title)
    .replace(/\s*[\-|:|–|—]\s*(Official Site|Home|Homepage|Company|Website).*$/i, "")
    .split(/\s[-|:|–|—]\s/)[0]
    .trim();

  if (cleaned) {
    return truncate(cleaned, 54);
  }

  const host = hostnameOf(url).split(".")[0] || "Competitor";
  return host.charAt(0).toUpperCase() + host.slice(1);
}

function isUsefulCompetitorUrl(candidateUrl: string, currentUrl: string) {
  const host = hostnameOf(candidateUrl);
  const currentHost = hostnameOf(currentUrl);
  if (!host || host === currentHost) return false;

  const blockedHosts = [
    "linkedin.com",
    "facebook.com",
    "instagram.com",
    "x.com",
    "twitter.com",
    "youtube.com",
    "tiktok.com",
    "crunchbase.com",
    "wikipedia.org",
    "semrush.com",
    "ahrefs.com",
    "similarweb.com",
    "zoominfo.com",
    "apollo.io",
    "clutch.co",
    "g2.com",
    "capterra.com",
  ];

  return !blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
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

async function loadRemoteScreenshotSource(url?: string) {
  if (!url) {
    return undefined;
  }

  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  return loadPdfImageSource(screenshotUrl);
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
        label: "AI visibility",
        score: safeAiDiscoverability,
        note: "How clearly AI tools can find, read, and recommend the brand, including its technical AEO readiness.",
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
        "Choose one primary next step and make the route obvious: book, enquire, buy, register, or request a call.",
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
  const fallback = buildFallbackReport(normalized, read);
  const websiteCapture = await captureWebsiteSurface(normalized).catch(() => null);

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
  }

  return fallback;
}

async function identifyCompetitorsWithExa(
  url: string,
  report: Pick<BrandReport, "brandName" | "genre" | "whatItDoes">,
): Promise<CompetitorCandidate[]> {
  const apiKey =
    process.env.EXA_API_KEY ||
    process.env.EXA_API_TOKEN ||
    process.env.EXA_KEY ||
    process.env.EXA_SEARCH_API_KEY ||
    process.env.NEXT_PUBLIC_EXA_API_KEY;
  if (!apiKey) return [];

  const query = [
    `Direct competitors and category alternatives for ${report.brandName}.`,
    `Brand category: ${report.genre}.`,
    `Brand description: ${report.whatItDoes}.`,
    "Return company websites, not directories or social profiles.",
  ].join(" ");

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults: 8,
      contents: {
        highlights: {
          query: `${report.brandName} competitors alternatives ${report.genre}`,
          maxCharacters: 600,
        },
      },
    }),
  }).catch(() => null);

  if (!response?.ok) {
    console.warn("[BrandMirror] Exa competitor search unavailable", response?.status);
    return [];
  }

  const payload = await response.json().catch(() => null);
  const results = Array.isArray(payload?.results) ? payload.results : [];
  const seenHosts = new Set<string>();

  return results
    .map((item: any): CompetitorCandidate | null => {
      const candidateUrl = normalizeUrl(item?.url || "");
      if (!candidateUrl || !isUsefulCompetitorUrl(candidateUrl, url)) return null;

      const host = hostnameOf(candidateUrl);
      if (seenHosts.has(host)) return null;
      seenHosts.add(host);

      const highlight = Array.isArray(item?.highlights)
        ? item.highlights.filter(Boolean).join(" ")
        : "";

      return {
        name: titleToCompanyName(item?.title || "", candidateUrl),
        url: candidateUrl,
        reason: truncate(
          normalizeWhitespace(highlight || item?.text || item?.summary || "Externally surfaced as a relevant category competitor."),
          180,
        ),
      };
    })
    .filter((item): item is CompetitorCandidate => Boolean(item))
    .slice(0, 3);
}

async function identifyCompetitors(
  url: string,
  report: Pick<BrandReport, "brandName" | "genre" | "whatItDoes">,
) {
  const exaCompetitors = await identifyCompetitorsWithExa(url, report);
  if (exaCompetitors.length > 0) {
    return exaCompetitors;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const prompt = `
You are identifying direct competitors for a premium brand audit.

BRAND:
- Name: ${report.brandName}
- URL: ${url}
- Genre: ${report.genre}
- What it does: ${report.whatItDoes}

Return the 3 most direct public competitors for this brand.

Rules:
- Prefer direct competitors over adjacent players.
- Prefer same category, same business model, similar audience, similar market.
- Only include websites with public homepages.
- Avoid directories, marketplaces, portfolio aggregators, or giant irrelevant enterprises.
- Return valid JSON only.

{
  "competitors": [
    { "name": "Competitor name", "url": "https://example.com", "reason": "brief reason" }
  ]
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a competitive intelligence analyst. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content || "";
  const parsed = extractJson(text);
  const currentHost = hostnameOf(url);

  return Array.isArray(parsed?.competitors)
    ? parsed.competitors
        .map((item: any) => ({
          name: normalizeWhitespace(item?.name || ""),
          url: normalizeUrl(item?.url || ""),
          reason: normalizeWhitespace(item?.reason || ""),
        }))
        .filter((item: any) => item.name && item.url && hostnameOf(item.url) !== currentHost)
        .slice(0, 3)
    : [];
}

async function generateCompetitiveLandscape(
  url: string,
  report: BrandReport,
  language: SiteLocale,
): Promise<CompetitiveLandscape | undefined> {
  const competitorsFound = await identifyCompetitors(url, report);
  if (!competitorsFound.length) {
    return undefined;
  }

  const competitorResults = await Promise.allSettled(
    competitorsFound.map(async (competitor) => {
      const read = await generateBrandRead(competitor.url, language);
      const result = read.result;
      return {
        name: competitor.name || result.brandName,
        url: competitor.url,
        scores: {
          positioning: clampScore(result.positioningClarity, 70),
          aiVisibility: clampScore(result.toneCoherence, 70),
          visual: clampScore(result.visualCredibility, 70),
          offer: clampScore(result.offerSpecificity, 70),
          conversion: clampScore(result.conversionReadiness, 70),
          overall: clampScore(result.posterScore, 70),
        },
        tier: result.scoreBand || scoreBandLabel(result.posterScore),
        strengths: [result.strongestSignal, result.summary]
          .filter(Boolean)
          .map((item) => truncate(normalizeWhitespace(item), 140))
          .slice(0, 2),
        snapshot: truncate(
          normalizeWhitespace(result.summary || result.whatItDoes || competitor.reason),
          180,
        ),
      };
    }),
  );

  const competitors = competitorResults
    .filter(
      (
        item,
      ): item is PromiseFulfilledResult<CompetitiveLandscape["competitors"][number]> =>
        item.status === "fulfilled",
    )
    .map((item) => item.value)
    .filter((item) => item.name && item.url);

  if (!competitors.length) {
    return undefined;
  }

  const scoreValue = (label: string, fallback = report.posterScore) =>
    report.scorecard.find((item) => item.label.toLowerCase() === label.toLowerCase())?.score ??
    fallback;

  const yourScores = {
    positioning: scoreValue("Positioning clarity", 70),
    aiVisibility: scoreValue("AI visibility", 70),
    visual: scoreValue("Visual credibility", 70),
    offer: scoreValue("Offer specificity", 70),
    conversion: scoreValue("Conversion readiness", 70),
    overall: clampScore(report.posterScore, 70),
  };

  const axisConfig = [
    { key: "positioning" as const, label: "Positioning Clarity" },
    { key: "aiVisibility" as const, label: "AI Visibility" },
    { key: "visual" as const, label: "Visual Credibility" },
    { key: "offer" as const, label: "Offer Specificity" },
    { key: "conversion" as const, label: "Conversion Readiness" },
  ];

  const strengths: CompetitiveAxisSummary[] = [];
  const weaknesses: CompetitiveAxisSummary[] = [];

  for (const axis of axisConfig) {
    const competitorAvg = average(competitors.map((item) => item.scores[axis.key]));
    const yourScore = yourScores[axis.key];
    const diff = yourScore - competitorAvg;

    if (diff >= 3) {
      strengths.push({
        axis: axis.label,
        yourScore,
        competitorAvg,
        lead: diff,
        message: `Your ${axis.label.toLowerCase()} (${yourScore}) is ahead of the competitive average (${competitorAvg}).`,
      });
    } else if (diff <= -3) {
      const leader = [...competitors].sort((a, b) => b.scores[axis.key] - a.scores[axis.key])[0];
      weaknesses.push({
        axis: axis.label,
        yourScore,
        competitorAvg,
        gap: Math.abs(diff),
        leader: leader.name,
        leaderScore: leader.scores[axis.key],
        message: `${leader.name} leads ${axis.label.toLowerCase()} (${leader.scores[axis.key]}) while your brand is at ${yourScore}.`,
      });
    }
  }

  const sortedOverall = [yourScores.overall, ...competitors.map((item) => item.scores.overall)].sort(
    (a, b) => b - a,
  );
  const ranking = sortedOverall.indexOf(yourScores.overall) + 1;
  const leaderOverall = sortedOverall[0] || yourScores.overall;
  const gapToLeader = Math.max(0, leaderOverall - yourScores.overall);

  const quickestWin =
    weaknesses
      .map((item) => ({
        axis: item.axis,
        currentGap: item.gap || 0,
        targetScore: (item.leaderScore || item.competitorAvg) + 1,
        message: `Lift ${item.axis} by ${Math.max(
          3,
          (item.leaderScore || item.competitorAvg) - item.yourScore + 1,
        )} points to close the fastest visible market gap.`,
      }))
      .sort((a, b) => a.currentGap - b.currentGap)[0] || null;

  return {
    competitors,
    analysis: {
      ranking,
      gapToLeader,
      strengths: strengths.slice(0, 2),
      weaknesses: weaknesses.slice(0, 3),
      quickestWin,
    },
    industryBenchmark: {
      positioning: average([yourScores.positioning, ...competitors.map((item) => item.scores.positioning)]),
      aiVisibility: average([yourScores.aiVisibility, ...competitors.map((item) => item.scores.aiVisibility)]),
      visual: average([yourScores.visual, ...competitors.map((item) => item.scores.visual)]),
      offer: average([yourScores.offer, ...competitors.map((item) => item.scores.offer)]),
      conversion: average([yourScores.conversion, ...competitors.map((item) => item.scores.conversion)]),
      overall: average([yourScores.overall, ...competitors.map((item) => item.scores.overall)]),
    },
  };
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
      label: fallback.scorecard[index]?.label || "Score",
      score: clampScore(
        typeof item.score === "number" && Number.isFinite(item.score)
          ? item.score
          : fallback.scorecard[index]?.score,
        70,
      ),
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
  - Keep scorecard labels exactly as: Positioning clarity, AI visibility, Visual credibility, Offer specificity, Conversion readiness.
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
- AI visibility read: ${firstRead.voice}
- Next move: ${firstRead.direction}
- Strongest signal: ${firstRead.strongestSignal}
- Main friction: ${firstRead.mainFriction}
- Clarity score (positioning): ${firstRead.positioningClarity}
- Visual credibility: ${firstRead.visualCredibility}
- AI visibility: ${firstRead.toneCoherence}
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

Scorecard rules. The scorecard MUST contain exactly five items, in this order: Positioning clarity, AI visibility, Visual credibility, Offer specificity, Conversion readiness. Do not omit any item. Do not add any item. Do not reorder. Each score is an integer 0-100.

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

AI visibility — whether AI tools (ChatGPT, Gemini, Perplexity, Google AI Overviews) can find, accurately describe, and recommend this brand, combining recommendation readiness with a technical AEO layer.
- 0-30   AI tools cannot find or describe the brand at all. The brand is effectively invisible or unreadable to AI systems.
- 30-50  AI tools find the domain but describe it generically or incorrectly. Technical signals and brand clarity are too weak to support confident recommendation.
- 50-70  AI tools find the brand and mostly get the category right, but flatten the specifics. Some metadata or structured signals exist, but not enough to make the offer reliably retrievable.
- 70-85  AI tools can accurately describe the brand and connect it to likely user intent. Category language, naming, metadata, and structure are clear enough to support recommendation.
- 85-100  The brand is optimized for AI visibility. Structured data, consistent naming, clear claims, AI-readable metadata, and accessible technical signals make it easy for AI systems to find, quote, and recommend.

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
    { "label": "AI visibility", "score": 82, "note": "short note" },
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
      ...(report.competitiveLandscape?.analysis.strengths.flatMap((item) => [item.axis, item.message]) || []),
      ...(report.competitiveLandscape?.analysis.weaknesses.flatMap((item) => [item.axis, item.message, item.leader || ""]) || []),
      ...(report.competitiveLandscape?.analysis.quickestWin
        ? [
            report.competitiveLandscape.analysis.quickestWin.axis,
            report.competitiveLandscape.analysis.quickestWin.message,
          ]
        : []),
      ...(report.competitiveLandscape?.competitors.flatMap((item) => [item.snapshot, ...item.strengths]) || []),
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
    competitiveLandscape: report.competitiveLandscape
      ? {
          ...report.competitiveLandscape,
          analysis: {
            ...report.competitiveLandscape.analysis,
            strengths: report.competitiveLandscape.analysis.strengths.map((item) => ({
              ...item,
              axis: next(),
              message: next(),
            })),
            weaknesses: report.competitiveLandscape.analysis.weaknesses.map((item) => ({
              ...item,
              axis: next(),
              message: next(),
              leader: next(),
            })),
            quickestWin: report.competitiveLandscape.analysis.quickestWin
              ? {
                  ...report.competitiveLandscape.analysis.quickestWin,
                  axis: next(),
                  message: next(),
                }
              : null,
          },
          competitors: report.competitiveLandscape.competitors.map((item) => ({
            ...item,
            snapshot: next(),
            strengths: item.strengths.map(() => next()),
          })),
        }
      : undefined,
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

  try {
    report.competitiveLandscape = await generateCompetitiveLandscape(
      normalized,
      report,
      language,
    );
  } catch {
    report.competitiveLandscape = undefined;
  }

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
  let websiteImageSource = await loadPdfImageSource(
    websiteSurface?.imageUrl || report.beforeAfterHero?.currentFrame?.imageUrl,
  );
  if (!websiteImageSource && report.url) {
    const capture = await captureWebsiteSurface(normalizeUrl(report.url)).catch(() => null);
    websiteImageSource = await loadPdfImageSource(capture?.dataUrl);
  }
  if (!websiteImageSource && report.url) {
    websiteImageSource = await loadRemoteScreenshotSource(normalizeUrl(report.url));
  }
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
    const totalPages = 15;
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
          "This report measures five signals that shape that decision: clarity, AI visibility, credibility, specificity, and readiness to act.",
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
        roiTitle: "What can change commercially if the priority fixes land",
        roiIntro:
          "This is a directional impact read: what the brand is likely losing now, what changes after the core fixes, and the percentage lift that becomes more realistic when the page is easier to understand, trust, and act on.",
        roiRecommended: "CURRENT EXTERNAL SIGNAL",
        roiConservative: "LOW VISIBILITY",
        roiRealistic: "MODERATE VISIBILITY",
        roiOptimistic: "STRONGER VISIBILITY",
        roiScale1: "Cautious planning",
        roiScale2: "Working baseline",
        roiScale3: "Upside case",
        roiVisitors: "Likely traffic",
        roiAov: "Qualified visits",
        roiCurrentRevenue: "Likely inquiries",
        roiProjectedLift: "MODELED UPSIDE",
        roiMonthlyLift: "Likely demand lift",
        roiAnnualLift: "Illustrative revenue range",
        roiImplementation: "CONFIDENCE",
        roiCost: "Confidence level",
        roiPayback: "Best use of this model",
        roiAnnualRoi: "Illustrative annual range",
        roiFootnote:
          "Directional percentage ranges based on BrandMirror scores, external visibility signals, and category benchmarks. This is not first-party analytics and not guaranteed revenue.",
        competitiveLabel: "COMPETITIVE POSITION",
        competitiveTitle: "Where you stand in the category right now",
        competitiveAverage: "Competitive avg",
        competitiveLeader: "Leader",
        competitiveQuickestWin: "QUICKEST COMPETITIVE WIN",
        competitiveNoData:
          "Competitive benchmarking is not available for this run, but the ROI scenarios above still show the likely commercial upside of the priority fixes.",
        websiteEvidenceLabel: "CURRENT WEBSITE SURFACE",
        websiteEvidenceTitle:
          "What the buyer sees before the copy has earned trust",
        websiteEvidenceCaption:
          "This is the current above-the-fold surface BrandMirror is diagnosing.",
        heroCalloutLabel: "HERO PROMISE",
        ctaCalloutLabel: "PROOF AND CTA ZONE",
        methodologyBullets: [
          "Positioning Clarity measures how quickly the homepage makes the offer legible.",
          "AI Visibility measures whether AI tools can find, read, and recommend the brand, combining recommendation readiness with a technical AEO layer: metadata, schema, crawler access, and AI-readable structure.",
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
        forBrand: "CURRENT CONTEXT",
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
        commercialCost: "AI VISIBILITY CHECK",
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
        playbookLabel: "IMPLEMENTATION PLAYBOOK",
        playbookTitle: "30-day implementation map",
        playbookIntro:
          "Turn the diagnosis into a clear sequence. Do the highest-leverage clarity fixes first, then strengthen proof and visibility, then scale the page into a stronger commercial system.",
        playbookNow: "NOW",
        playbookNext: "NEXT",
        playbookThen: "THEN",
        playbookCtaLabel: "WORK WITH SAHAR",
        playbookCtaBody:
          "Use this as a self-guided implementation map, or work with SAHAR to turn the diagnosis into sharper positioning, cleaner copy, stronger proof, and a homepage that converts with less resistance.",
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
          "Este reporte mide cinco señales que modelan esa decisión: claridad, visibilidad de IA, credibilidad, especificidad y preparación para convertir.",
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
        roiTitle: "Qué sostiene probablemente la señal actual hoy y qué cambia si los fixes aterrizan",
        roiIntro:
          "Basado en señales externas de visibilidad y en los scores actuales de BrandMirror, esta página muestra dónde probablemente está la marca hoy, qué demanda puede sostener el sitio ahora y qué se vuelve más realista después de aplicar los fixes de mayor palanca.",
        roiRecommended: "SEÑAL EXTERNA ACTUAL",
        roiConservative: "VISIBILIDAD BAJA",
        roiRealistic: "VISIBILIDAD MEDIA",
        roiOptimistic: "VISIBILIDAD MÁS FUERTE",
        roiScale1: "Plan prudente",
        roiScale2: "Base de trabajo",
        roiScale3: "Caso de upside",
        roiVisitors: "Tráfico mensual probable",
        roiAov: "Visitas calificadas / mes",
        roiCurrentRevenue: "Consultas calificadas / mes",
        roiProjectedLift: "UPSIDE MODELADO",
        roiMonthlyLift: "Lift probable de demanda",
        roiAnnualLift: "Rango ilustrativo de ingresos",
        roiImplementation: "CONFIANZA",
        roiCost: "Nivel de confianza",
        roiPayback: "Mejor uso del modelo",
        roiAnnualRoi: "ROI anual",
        roiFootnote:
          "Estimación direccional basada en señales externas de visibilidad, benchmarks de categoría y los priority fixes de este reporte. No es analítica de primera mano ni una promesa de ingresos.",
        competitiveLabel: "POSICIÓN COMPETITIVA",
        competitiveTitle: "Dónde estás hoy dentro de la categoría",
        competitiveAverage: "Promedio competitivo",
        competitiveLeader: "Líder",
        competitiveQuickestWin: "GANANCIA COMPETITIVA MÁS RÁPIDA",
        competitiveNoData:
          "El benchmarking competitivo no está disponible en esta ejecución, pero los escenarios de ROI siguen mostrando el upside comercial más probable de los priority fixes.",
        websiteEvidenceLabel: "SUPERFICIE ACTUAL DEL SITIO",
        websiteEvidenceTitle:
          "Lo que ve el comprador antes de que el copy haya ganado confianza",
        websiteEvidenceCaption:
          "Esta es la superficie above-the-fold actual que BrandMirror está diagnosticando.",
        heroCalloutLabel: "PROMESA HERO",
        ctaCalloutLabel: "ZONA DE PRUEBA Y CTA",
        methodologyBullets: [
          "Positioning Clarity mide qué tan rápido la homepage hace legible la oferta.",
          "AI Visibility mide si las herramientas de IA pueden encontrar, leer y recomendar la marca, combinando legibilidad para IA con una capa técnica de AEO: metadatos, schema, acceso para crawlers y estructura legible por IA.",
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
        forBrand: "CONTEXTO ACTUAL",
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
        commercialCost: "CHEQUEO DE AI VISIBILITY",
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
        playbookLabel: "IMPLEMENTATION PLAYBOOK",
        playbookTitle: "Mapa de implementación a 30 días",
        playbookIntro:
          "Convierte el diagnóstico en una secuencia clara. Primero corrige la claridad con más apalancamiento, luego fortalece la prueba y la visibilidad, y después escala la página como un sistema comercial más fuerte.",
        playbookNow: "AHORA",
        playbookNext: "LUEGO",
        playbookThen: "DESPUÉS",
        playbookCtaLabel: "TRABAJA CON SAHAR",
        playbookCtaBody:
          "Usa este mapa como guía de implementación por tu cuenta, o trabaja con SAHAR para convertir el diagnóstico en un posicionamiento más afilado, mejor copy, más prueba y una homepage que convierta con menos fricción.",
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
          "Этот отчёт измеряет пять сигналов, которые формируют это решение: clarity, AI visibility, credibility, specificity и readiness to act.",
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
        roiTitle: "Что текущий сигнал, скорее всего, поддерживает сейчас — и что меняется после фиксов",
        roiIntro:
          "На основе внешних сигналов видимости и текущих BrandMirror scores эта страница показывает, где бренд, скорее всего, находится сейчас, какой спрос сайт способен удерживать сегодня и что становится реалистичнее после внедрения самых сильных фиксов.",
        roiRecommended: "ТЕКУЩИЙ ВНЕШНИЙ СИГНАЛ",
        roiConservative: "НИЗКАЯ ВИДИМОСТЬ",
        roiRealistic: "СРЕДНЯЯ ВИДИМОСТЬ",
        roiOptimistic: "БОЛЕЕ СИЛЬНАЯ ВИДИМОСТЬ",
        roiScale1: "Осторожный план",
        roiScale2: "Рабочая база",
        roiScale3: "Upside-сценарий",
        roiVisitors: "Вероятный трафик",
        roiAov: "Квалифицированные визиты",
        roiCurrentRevenue: "Вероятные inquiries",
        roiProjectedLift: "МОДЕЛИРУЕМЫЙ UPSIDE",
        roiMonthlyLift: "Вероятный рост спроса",
        roiAnnualLift: "Иллюстративный диапазон выручки",
        roiImplementation: "УРОВЕНЬ УВЕРЕННОСТИ",
        roiCost: "Уровень confidence",
        roiPayback: "Как лучше использовать модель",
        roiAnnualRoi: "ROI за год",
        roiFootnote:
          "Это направленная оценка на основе внешних сигналов видимости, benchmarks категории и priority fixes из отчёта. Это не first-party analytics и не обещание выручки.",
        competitiveLabel: "КОНКУРЕНТНАЯ ПОЗИЦИЯ",
        competitiveTitle: "Где бренд стоит внутри своей категории прямо сейчас",
        competitiveAverage: "Среднее по конкурентам",
        competitiveLeader: "Лидер",
        competitiveQuickestWin: "САМЫЙ БЫСТРЫЙ КОНКУРЕНТНЫЙ ВЫИГРЫШ",
        competitiveNoData:
          "Конкурентный benchmarking недоступен для этого запуска, но ROI-сценарии выше всё равно показывают наиболее вероятный коммерческий upside от priority fixes.",
        websiteEvidenceLabel: "ТЕКУЩАЯ ПОВЕРХНОСТЬ САЙТА",
        websiteEvidenceTitle:
          "Что видит покупатель до того, как текст успевает заслужить доверие",
        websiteEvidenceCaption:
          "Это текущая above-the-fold поверхность, которую BrandMirror использует как главный визуальный слой диагноза.",
        heroCalloutLabel: "HERO-ОБЕЩАНИЕ",
        ctaCalloutLabel: "ЗОНА PROOF И CTA",
        methodologyBullets: [
          "Positioning Clarity измеряет, насколько быстро homepage делает оффер понятным.",
          "AI Visibility измеряет, могут ли AI tools найти бренд, корректно прочитать его и рекомендовать, объединяя recommendation readiness с техническим AEO-слоем: metadata, schema, crawler access и AI-readable structure.",
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
        forBrand: "ТЕКУЩИЙ КОНТЕКСТ",
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
        commercialCost: "AI VISIBILITY CHECK",
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
        playbookLabel: "IMPLEMENTATION PLAYBOOK",
        playbookTitle: "30-day implementation map",
        playbookIntro:
          "Превратите диагноз в понятную последовательность действий. Сначала исправьте самые прибыльные вещи в ясности оффера, затем усилите proof и visibility, а потом дособерите страницу в более сильную коммерческую систему.",
        playbookNow: "NOW",
        playbookNext: "NEXT",
        playbookThen: "THEN",
        playbookCtaLabel: "WORK WITH SAHAR",
        playbookCtaBody:
          "Используйте это как self-guided implementation map, или работайте с SAHAR, чтобы превратить диагноз в более острое positioning, более ясный copy, более сильный proof и homepage, который конвертит с меньшим сопротивлением.",
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

    const formatAxisTitle = (label: string) => {
      const upper = bodyCopy(label).toUpperCase();
      if (upper === "AI VISIBILITY") return "AI\nVISIBILITY";
      if (upper === "POSITIONING CLARITY") return "POSITIONING\nCLARITY";
      if (upper === "VISUAL CREDIBILITY") return "VISUAL\nCREDIBILITY";
      if (upper === "OFFER SPECIFICITY") return "OFFER\nSPECIFICITY";
      if (upper === "CONVERSION READINESS") return "CONVERSION\nREADINESS";
      return upper.replace(" ", "\n");
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

    const drawRoundedImageFit = (
      source: Buffer | string | undefined,
      x: number,
      y: number,
      width: number,
      height: number,
      radius = 14,
    ) => {
      if (!source) {
        return false;
      }

      doc.save();
      try {
        doc.roundedRect(x, y, width, height, radius).clip();
        doc.image(source, x, y, {
          fit: [width, height],
          align: "center",
          valign: "center",
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

    const drawGauge = (centerX: number, centerY: number, radius: number, score: number, color: string) => {
      const drawArc = (start: number, end: number, strokeColor: string, thickness: number) => {
        const steps = 32;
        let prevX = centerX + Math.cos(start) * radius;
        let prevY = centerY + Math.sin(start) * radius;
        for (let i = 1; i <= steps; i += 1) {
          const t = i / steps;
          const angle = start + (end - start) * t;
          const nextX = centerX + Math.cos(angle) * radius;
          const nextY = centerY + Math.sin(angle) * radius;
          doc.moveTo(prevX, prevY).lineTo(nextX, nextY).lineWidth(thickness).strokeColor(strokeColor).stroke();
          prevX = nextX;
          prevY = nextY;
        }
      };

      drawArc(Math.PI, 0, colors.rule, 8);
      drawArc(Math.PI, Math.PI * (1 - score / 100), color, 8);
    };

    const drawCenteredText = (
      text: string,
      font: "Helvetica" | "Times-Roman" | "Times-Bold",
      size: number,
      centerX: number,
      y: number,
      color = colors.textOnDark,
    ) => {
      doc.fillColor(color)
        .font(font)
        .fontSize(size)
        .text(text, centerX - doc.widthOfString(text) / 2, y);
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

    const drawBulletItems = (
      items: string[],
      x: number,
      y: number,
      width: number,
      options: {
        maxItems?: number;
        fontSize?: number;
        minSize?: number;
        lineGap?: number;
        itemGap?: number;
        maxHeight?: number;
        color?: string;
      } = {},
    ) => {
      const {
        maxItems = items.length,
        fontSize = 10,
        minSize = 8.6,
        lineGap = 4,
        itemGap = 7,
        maxHeight = 120,
        color = colors.mutedOnDark,
      } = options;
      let cursorY = y;
      const bottomY = y + maxHeight;
      for (const item of uniqueItems(items, maxItems)) {
        if (cursorY >= bottomY - 18) break;
        const clean = bodyCopy(item);
        const remaining = Math.max(18, bottomY - cursorY);
        const fitted = fitTextToBox(clean, width - 16, remaining, fontSize, minSize, lineGap, "Helvetica");
        doc.fillColor(color).font("Helvetica").fontSize(fitted.size).text("-", x, cursorY, { width: 8 });
        doc.fillColor(color)
          .font(fitted.font)
          .fontSize(fitted.size)
          .text(fitted.text, x + 14, cursorY, {
            width: width - 14,
            lineGap: fitted.lineGap,
          });
        cursorY = doc.y + itemGap;
      }
      return cursorY;
    };

    const stripBrandLead = (text: string) => {
      const clean = bodyCopy(text);
      const brandPattern = new RegExp(`^(for\\s+)?${report.brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[\\s—:-]*`, "i");
      return clean.replace(brandPattern, "").replace(/^For\s+/i, "").trim();
    };

    const stripAiLayerSentences = (text: string) => {
      const clean = bodyCopy(text);
      const sentences = clean
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
      const filtered = sentences.filter((sentence) => {
        const probe = sentence.toLowerCase();
        return !/(ai visibility|ai discover|structured data|schema|metadata|crawler|robots\.txt|sitemap|llms\.txt|technical aeo|search engines?)/i.test(
          probe,
        );
      });
      return filtered.length ? filtered.join(" ") : clean;
    };

    const buildCoverPosterTagline = () => {
      const cleanTagline = bodyCopy(report.tagline || "");
      const diagnosticPattern =
        /(score|page|cta|conversion|trust|offer|ai visibility|discoverability|readiness|does not|still needs|too weak|too thin|unnamed|asks too early)/i;
      if (cleanTagline && cleanTagline.length < 120 && !diagnosticPattern.test(cleanTagline)) {
        return firstSentence(cleanTagline, cleanTagline);
      }

      const primary = (report.archetypeRead?.primary || "").toLowerCase();
      const secondary = (report.archetypeRead?.secondary || "").toLowerCase();
      const archetypeTaglines: Array<[RegExp, string]> = [
        [/sage.*magician|magician.*sage/, "Knowledge becomes infrastructure."],
        [/sage/, "Knowledge, made usable."],
        [/magician/, "The impossible, made operational."],
        [/caregiver/, "A quiet return to what heals."],
        [/creator/, "A world shaped with intention."],
        [/ruler/, "Control, clarity, and the architecture of trust."],
        [/explorer/, "For the ones building beyond the map."],
        [/innocent/, "A cleaner promise for a calmer yes."],
        [/hero/, "The work begins where certainty ends."],
        [/lover/, "Designed to be felt before it is chosen."],
        [/jester/, "A sharper signal with a lighter pulse."],
        [/everyman/, "A practical promise for real people."],
        [/outlaw/, "A category line, redrawn."],
      ];
      const archetypePair = [primary, secondary].filter(Boolean).join(" ");
      const matched = archetypeTaglines.find(([pattern]) => pattern.test(archetypePair));
      if (matched) return matched[1];

      const knownFor = firstSentence(report.brandKnownFor || report.whatItDoes || "", "");
      if (knownFor && knownFor.length < 120) {
        return knownFor.replace(/\.$/, ".");
      }
      return "A signal with a world behind it.";
    };

    const scoreByLabel = (label: string) =>
      report.scorecard.find((item) => item.label.toLowerCase() === label.toLowerCase());

    const aiVisibilityRead = /ai|schema|metadata|crawler|llms|visibility|discoverability|aeo/i.test(report.toneCheck)
      ? report.toneCheck
      : [
          report.toneCheck,
          "AI visibility also depends on clear category nouns, metadata, schema, FAQ support, and consistent naming across the page.",
        ].filter(Boolean).join(" ");

    const scorePages = [
      {
        label: "Positioning clarity",
        title: "Positioning Clarity",
        diagnosis: report.positioningRead,
        quote: report.whatsBroken[0] || report.aboveTheFold,
        implication: report.headlineCorrection.currentProblem,
      },
      {
        label: "AI visibility",
        title: "AI Visibility",
        diagnosis: aiVisibilityRead,
        quote: report.audienceMismatch[1] || aiVisibilityRead,
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
      { title: "Positioning Clarity", body: "Does the buyer know what you are within one read?" },
      { title: "AI Visibility", body: "Can AI tools find, read, and recommend the brand clearly and consistently?" },
      { title: "Visual Credibility", body: "Does the design earn the price and the promise?" },
      { title: "Offer Specificity", body: "Could someone repeat what you sell without your help?" },
      { title: "Conversion Readiness", body: "When someone is ready, is there a door to walk through?" },
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
      "AI Visibility": {
        low: "Add clearer category language, explicit service nouns, stronger metadata, and technical AEO signals so AI tools can quote the brand without guessing.",
        mid: "Tighten naming consistency across headline, metadata, schema, and supporting copy so AI summaries stop flattening the offer.",
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
        low: "Choose the one action the visitor should take next: book, enquire, buy, register, or request a call. Put that route in the hero and repeat it after proof.",
        mid: "Make the CTA operational, not decorative: say what happens after the click and remove competing paths that dilute the decision.",
      },
    } as const;

    const concreteImplementationByAxis = [
      {
        title: "Positioning",
        axis: "Positioning Clarity",
        body:
          report.priorityFixes.fixNow[0] ||
          "Rewrite the first screen so it states what the company does, for whom, and what changes in one read.",
      },
      {
        title: "AI Visibility",
        axis: "AI Visibility",
        body:
          "Add exact category nouns to the H1, title tag, meta description, and schema. Keep naming identical across the homepage, metadata, and directory profiles.",
      },
      {
        title: "Offer",
        axis: "Offer Specificity",
        body:
          report.priorityFixes.fixNow[1] ||
          "Replace broad sector language with 2-3 named offers or use cases, each with a buyer, an outcome, and one proof cue.",
      },
      {
        title: "Conversion",
        axis: "Conversion Readiness",
        body:
          "Define the primary conversion route: Book, Enquire, Buy, Register, or Request a call. Put that CTA in the hero, repeat it after the first proof block, and add one line explaining what happens after the click.",
      },
      {
        title: "Visual",
        axis: "Visual Credibility",
        body:
          "Keep the premium restraint, but make it earn trust: tighten spacing, strengthen section hierarchy, and move authority cues higher in the page.",
      },
    ];

    const practicalImpactByAxis: Record<string, string> = {
      "Positioning Clarity":
        "The buyer can explain the brand faster, so fewer good visitors leave before the offer lands.",
      "AI Visibility":
        "External systems can describe the brand more accurately, so category discovery becomes less generic.",
      "Visual Credibility":
        "The page earns more trust before the copy has to defend the offer.",
      "Offer Specificity":
        "More buyers can repeat what is sold, who it is for, and why it matters now.",
      "Conversion Readiness":
        "Qualified visitors know exactly how to move from interest to booking, enquiry, checkout, or call request.",
    };

    const practicalFixForAxis = (axisLabel: string, score: number) => {
      const mapped = concreteImplementationByAxis.find((item) => item.axis === axisLabel);
      if (mapped?.body) return mapped.body;
      const moves = practicalMoves[axisLabel as keyof typeof practicalMoves];
      return score < 70 ? moves?.low || "" : moves?.mid || "";
    };

    const allImplementationRows = scorePages
      .map((item) => {
        const issue =
          item.title === "AI Visibility"
            ? "AI systems need clearer category nouns, metadata, schema, and consistent naming before they can describe the brand confidently."
            : item.title === "Conversion Readiness"
              ? "The page needs a clearer action path: what to click, what happens next, and whether the visitor is booking, buying, registering, or enquiring."
              : firstSentence(stripBrandLead(item.score.note || item.diagnosis), item.score.note) ||
                firstSentence(stripBrandLead(item.diagnosis), "This axis is slowing the page down.");
        return {
          axis: item.title,
          score: item.score.score,
          color: bandColor(item.score.score),
          issue,
          fix: practicalFixForAxis(item.title, item.score.score),
          impact: practicalImpactByAxis[item.title] || "The page becomes easier to understand, trust, and act on.",
        };
      })
      .sort((a, b) => a.score - b.score);
    const implementationRows = uniqueItems(
      [
        ...allImplementationRows.filter((row) => row.score < 70).map((row) => row.axis),
        ...allImplementationRows.map((row) => row.axis),
      ],
      5,
    )
      .map((axis) => allImplementationRows.find((row) => row.axis === axis))
      .filter((row): row is (typeof allImplementationRows)[number] => Boolean(row));

    const sprintNow = uniqueItems(
      [
        "Rewrite the opening promise so it names the buyer, offer, and outcome in one read.",
        "Choose the primary conversion event and make the CTA explicit: Book, Enquire, Buy, Register, or Request a call.",
        "Remove vague mood copy that does not explain what is being sold.",
      ],
      3,
    );

    const sprintNext = uniqueItems(
      [
        "Add exact category nouns to the H1, title tag, meta description, and schema.",
        "Tighten section hierarchy so each block earns trust before asking for action.",
        "Turn broad service language into 2-3 concrete use cases or deliverables.",
      ],
      3,
    );

    const sprintThen = uniqueItems(
      [
        "Turn the sharpened message into service pages, proof blocks, and sales assets.",
        "Publish FAQ support and consistent naming so external systems can read the brand clearly.",
        "Review CTA clicks, enquiry quality, and proof order; tighten what still creates hesitation.",
      ],
      3,
    );

    const scoreAverage =
      scorePages.reduce((sum, item) => sum + item.score.score, 0) / Math.max(scorePages.length, 1);
    const currentSignalSummary =
      scoreAverage < 65
        ? "Right now the homepage likely leaks too much clarity to convert weak attention into steady qualified demand."
        : scoreAverage < 78
          ? "The current signal is credible, but the offer, proof, and CTA still are not working together tightly enough."
          : "The page already carries some trust, but the upside only becomes real if the sharpened message gets repeated beyond the homepage.";
    const currentTrafficBand =
      scoreAverage < 65
        ? "Low hundreds / month"
        : scoreAverage < 78
          ? "Low-to-mid hundreds / month"
          : "Mid hundreds / month";
    const currentInquiryBand =
      scoreAverage < 65 ? "1-3 serious inquiries" : scoreAverage < 78 ? "2-4 serious inquiries" : "3-5 serious inquiries";
    const afterFixTrafficBand =
      scoreAverage < 65
        ? "Mid hundreds / month"
        : scoreAverage < 78
          ? "Mid hundreds to low thousands / month"
          : "High hundreds to low thousands / month";
    const afterFixInquiryBand =
      scoreAverage < 65 ? "2-5 serious inquiries" : scoreAverage < 78 ? "4-7 serious inquiries" : "5-9 serious inquiries";
    const afterFixImpactBand =
      scoreAverage < 65
        ? "+8% to +14% more qualified demand"
        : scoreAverage < 78
          ? "+12% to +20% more qualified demand"
          : "+16% to +24% more qualified demand";
    const clarityLiftBand =
      scoreAverage < 65
        ? "+10% to +16% clarity lift"
        : scoreAverage < 78
          ? "+8% to +14% clarity lift"
          : "+6% to +10% clarity lift";
    const aiVisibilityLiftBand =
      (scoreByLabel("AI visibility")?.score ?? scoreAverage) < 60
        ? "+15% to +25% AI visibility lift"
        : (scoreByLabel("AI visibility")?.score ?? scoreAverage) < 75
          ? "+10% to +18% AI visibility lift"
          : "+6% to +12% AI visibility lift";
    const conversionLiftBand =
      (scoreByLabel("Conversion readiness")?.score ?? scoreAverage) < 70
        ? "+8% to +15% conversion readiness lift"
        : "+5% to +10% conversion readiness lift";
    const impactReason =
      report.priorityFixes.fixNow[0] ||
      "Sharper positioning, a named offer, stronger proof placement, and cleaner AI visibility make the homepage easier to understand and easier to choose.";
    const visibilityConfidence = report.competitiveLandscape?.competitors?.length
      ? "Moderate"
      : websiteImageSource
        ? "Low to moderate"
        : "Low";
    const competitiveContext = report.competitiveLandscape
      ? {
          label: `COMPETITIVE CONTEXT / ${report.competitiveLandscape.competitors.length} PEERS`,
          body: [
            `Current rank estimate: ${report.competitiveLandscape.analysis.ranking}/${report.competitiveLandscape.competitors.length + 1}.`,
            `Industry benchmark: ${report.competitiveLandscape.industryBenchmark.overall}/100 overall.`,
            report.competitiveLandscape.analysis.quickestWin
              ? `Fastest visible gap: ${report.competitiveLandscape.analysis.quickestWin.axis}.`
              : `Closest peers: ${report.competitiveLandscape.competitors.map((item) => item.name).slice(0, 2).join(", ")}.`,
          ].join(" "),
        }
      : {
          label: "CATEGORY CONTEXT",
          body:
            "The commercial read uses the current scores, visible market signal, and category context. Competitor benchmarks only appear when direct peers are clean enough to compare.",
        };

    const displayUrl = report.url.replace(/^https?:\/\//, "");

    // Page 1: Cover
    pageNumber += 1;
    doc.addPage();
    doc.rect(0, 0, pageWidth, pageHeight).fill(colors.dark);
    if (archetypePosterSource) {
      doc.save();
      doc.image(archetypePosterSource, 0, 0, {
        width: pageWidth,
        height: pageHeight,
      });
      doc.restore();
      doc.save();
      doc.fillOpacity(0.24);
      doc.rect(0, 0, pageWidth, pageHeight).fill(colors.dark);
      doc.restore();
    }
    doc.fillColor(colors.accent).font("Helvetica").fontSize(9).text("BRANDMIRROR / FULL REPORT", contentLeft, 42, {
      characterSpacing: 2.3,
    });
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9).text(displayUrl, contentRight - 170, 42, {
      width: 170,
      align: "right",
    });
    const coverTitle = fitHeading(report.brandName, contentWidth - 92, 108, 36, 28, -2);
    doc.fillColor(colors.textOnDark).font(coverTitle.font).fontSize(coverTitle.size).text(coverTitle.text, 86, 168, {
      width: contentWidth - 60,
      lineGap: coverTitle.lineGap,
      align: "center",
    });
    const coverTitleBottom = doc.y;
    doc.fillColor(colors.accent).font("Helvetica").fontSize(10.5).text(pdfCopy.coverSub, 96, coverTitleBottom + 20, {
      width: contentWidth - 80,
      align: "center",
      characterSpacing: 1.9,
    });
    const coverPosterLine = buildCoverPosterTagline();
    const coverTagline = fitTextToBox(
      truncate(coverPosterLine, 160),
      contentWidth - 176,
      52,
      15.5,
      12.4,
      5,
      "Times-Roman",
    );
    doc.fillColor(colors.mutedOnDark).font(coverTagline.font).fontSize(coverTagline.size).text(coverTagline.text, 144, coverTitleBottom + 62, {
      width: contentWidth - 176,
      align: "center",
      lineGap: coverTagline.lineGap,
    });
    doc.fillColor(colors.accent).font("Helvetica").fontSize(8.5).text("REPORT ID", contentLeft, 706, {
      characterSpacing: 1.5,
    });
    doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(13.5).text(reportId, contentLeft, 724);
    doc.text(`${overallScore}/100  ${getBandForScore(overallScore)}`, contentLeft, 742, {
      width: 240,
      align: "left",
      characterSpacing: 0.4,
    });
    doc.moveTo(contentLeft, 758).lineTo(contentRight, 758).strokeColor(colors.rule).stroke();
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(8.5).text(pdfCopy.powered, contentLeft, 772, {
      width: 220,
      lineBreak: false,
    });
    doc.text(today, contentRight - 120, 772, { width: 120, align: "right", lineBreak: false });

    // Page 2: Live Scan
    addBasePage();
    const centerX = pageWidth / 2;
    drawSectionTag("LIVE SCAN", contentLeft, 74, colors.mutedOnDark);
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9.5).text(`${today}  GMT+2`, contentRight - 112, 74, {
      width: 112,
      align: "right",
      characterSpacing: 2,
    });
    const scanTitle = fitHeading(bodyCopy(report.brandName).toLowerCase(), contentWidth - 124, 62, 25, 18, -1.2, "Helvetica");
    doc.fillColor(colors.textOnDark).font(scanTitle.font).fontSize(scanTitle.size).text(scanTitle.text, contentLeft + 62, 94, {
      width: contentWidth - 124,
      align: "center",
      lineGap: scanTitle.lineGap,
    });
    drawCenteredText(displayUrl.toUpperCase(), "Helvetica", 8.6, centerX, 158, colors.mutedOnDark);
    drawGauge(centerX, 284, 60, overallScore, bandColor(overallScore));
    drawCenteredText(String(overallScore), "Helvetica", 40, centerX, 268, bandColor(overallScore));
    drawCenteredText("/ 100", "Helvetica", 9.6, centerX, 322, colors.mutedOnDark);
    drawCenteredText(getBandForScore(overallScore), "Helvetica", 10.5, centerX, 348, bandColor(overallScore));
    const liveScanTagline = buildSignalTaglineFromScores(
      scorePages.map((item) => ({ label: item.label, score: item.score.score })),
      truncate(report.tagline || "", 120),
    );
    const liveTagline = fitTextToBox(liveScanTagline, contentWidth - 160, 44, 15.2, 12.6, 4, "Times-Roman");
    doc.fillColor(colors.textOnDark).font(liveTagline.font).fontSize(liveTagline.size).text(liveTagline.text, contentLeft + 80, 376, {
      width: contentWidth - 160,
      align: "center",
      lineGap: liveTagline.lineGap,
    });
    drawSectionTag("SCORE BREAKDOWN", contentLeft, 422, colors.mutedOnDark);
    const scoreStartY = 438;
    scorePages.forEach((item, index) => {
      const rowY = scoreStartY + index * 44;
      const scoreColor = bandColor(item.score.score);
      doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(10).text(item.label.toUpperCase(), contentLeft, rowY, {
        characterSpacing: 2,
      });
      const barX = contentLeft + 132;
      const barW = contentWidth - 304;
      doc.moveTo(barX, rowY + 18).lineTo(barX + barW, rowY + 18).lineWidth(4).strokeColor(colors.rule).stroke();
      doc.moveTo(barX, rowY + 18).lineTo(barX + barW * (item.score.score / 100), rowY + 18).lineWidth(4).strokeColor(scoreColor).stroke();
      doc.fillColor(scoreColor).font("Helvetica").fontSize(16.5).text(String(item.score.score), contentRight - 150, rowY + 4, {
        width: 44,
        align: "right",
      });
      doc.fillColor(scoreColor).font("Helvetica").fontSize(8.4).text(
        getBandForScore(item.score.score),
        contentRight - 86,
        rowY + 8,
        {
          width: 86,
          align: "left",
          characterSpacing: 1.0,
        },
      );
      doc.moveTo(contentLeft, rowY + 32).lineTo(contentRight, rowY + 32).lineWidth(0.8).strokeColor(colors.darkRule).stroke();
    });
    drawSectionTag("INDICATOR SCALE", contentLeft, 682, colors.mutedOnDark);
    [
      { label: "0-30", name: "FLATLINING", color: "#B65C5C" },
      { label: "30-50", name: "FRAGILE", color: colors.terracotta },
      { label: "50-70", name: "DEVELOPING", color: colors.amber },
      { label: "70-85", name: "STABLE", color: colors.mint },
      { label: "85-100", name: "LEADING", color: colors.accent },
    ].forEach((item, index) => {
      const pillW = 82;
      const pillGap = 8;
      const x = contentLeft + (contentWidth - pillW * 5 - pillGap * 4) / 2 + index * (pillW + pillGap);
      drawPanel(x, 694, pillW, 34, item.color === colors.amber ? colors.panelSoft : colors.panel);
      doc.fillColor(item.color).font("Helvetica").fontSize(9.4).text(item.label, x, 709, {
        width: pillW,
        align: "center",
        characterSpacing: 1,
      });
      doc.font("Helvetica").fontSize(7.7).text(item.name, x, 702, {
        width: pillW,
        align: "center",
        characterSpacing: 1.4,
      });
    });

    // Page 3: First Read
    addBasePage();
    const page3TitleBottom = drawPageLabel("FIRST READ", "What the company does, what it signals, and how the page lands before trust is earned", { width: 330, maxFont: 24, minFont: 20, maxHeight: 106 });
    const page3Top = Math.max(page3TitleBottom + 18, 176);
    const firstReadWhatItDoes =
      bodyCopy(report.whatItDoes || (report as any).summary || report.snapshot || report.brandKnownFor || "");
    const firstReadDiagnosis =
      bodyCopy(report.snapshot || (report as any).summary || report.scoreModifier || "");
    const firstReadCurrent =
      bodyCopy(report.whatItSignals || (report as any).current || report.mixedSignals || report.positioningRead || "");
    drawSectionTag("WHAT IT DOES", contentLeft, page3Top);
    const firstReadWidth = contentWidth;
    const whatItDoesBox = fitTextToBox(firstReadWhatItDoes, firstReadWidth, 94, 11, 10.4, 6);
    let firstReadY = drawParagraph(whatItDoesBox.text, contentLeft, page3Top + 24, firstReadWidth, whatItDoesBox.size, 6) + 22;
    drawSectionTag("FIRST DIAGNOSIS", contentLeft, firstReadY);
    const snapshotBox = fitTextToBox(firstReadDiagnosis, firstReadWidth, 94, 11, 10.4, 6);
    firstReadY = drawParagraph(snapshotBox.text, contentLeft, firstReadY + 24, firstReadWidth, snapshotBox.size, 6) + 22;
    drawSectionTag("CURRENT STATE", contentLeft, firstReadY);
    const currentBox = fitTextToBox(firstReadCurrent, firstReadWidth, 210, 11, 10.4, 6);
    drawParagraph(currentBox.text, contentLeft, firstReadY + 24, firstReadWidth, currentBox.size, 6);

    // Page 4: What We Measure
    addBasePage();
    const page4TitleBottom = drawPageLabel(pdfCopy.whatThisIsLabel, "What the report measures", {
      width: 320,
      maxFont: 24,
      minFont: 20,
      maxHeight: 92,
    });
    const page4Y = Math.max(page4TitleBottom + 18, 174);
    drawParagraph(pdfCopy.whatThisIsIntro[0], contentLeft, page4Y, contentWidth, 10.8, 6);
    drawParagraph(pdfCopy.whatThisIsIntro[1], contentLeft, page4Y + 92, contentWidth, 10.8, 6);
    const axisCardWidth = (contentWidth - 18) / 2;
    const axisCardHeight = 88;
    metricCards.forEach((item, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const isLast = index === metricCards.length - 1;
      const cardWidth = isLast ? contentWidth : axisCardWidth;
      const cardX = isLast ? contentLeft : contentLeft + column * (axisCardWidth + 18);
      const cardY = page4Y + 208 + row * 104;
      drawPanel(cardX, cardY, cardWidth, axisCardHeight, index % 2 === 0 ? colors.panelSoft : colors.panel);
      drawSectionTag(item.title.toUpperCase(), cardX + 16, cardY + 16, colors.accent);
      const fitMetric = fitTextToBox(item.body, cardWidth - 32, 38, 10.2, 9.2, 4);
      drawParagraph(fitMetric.text, cardX + 16, cardY + 34, cardWidth - 32, fitMetric.size, fitMetric.lineGap);
    });

    const renderCommercialImpactPage = () => {
      addBasePage();
      const page5TitleBottom = drawPageLabel(pdfCopy.roiLabel, "Current signal, after the fixes, and likely commercial lift", {
        width: 430,
        maxFont: 24,
        minFont: 19,
        maxHeight: 92,
      });
      drawParagraph(
        "This is not a revenue promise. It is a directional read of what changes when the homepage becomes easier to understand, trust, recommend, and act on.",
        contentLeft,
        Math.max(page5TitleBottom + 14, 168),
        contentWidth,
        10.2,
        5,
      );

      const impactRows = [
        {
          label: "01 / CURRENT SIGNAL",
          title: "Where the brand likely stands today",
          accent: colors.terracotta,
          body: currentSignalSummary,
          metrics: [
            { label: "Likely traffic", value: currentTrafficBand },
            { label: "Serious demand", value: currentInquiryBand },
          ],
        },
        {
          label: "02 / AFTER CORE FIXES",
          title: "What becomes easier after the priority fixes",
          accent: colors.amber,
          body: "The offer lands sooner, proof sits closer to the decision, and the AI-readable layer has clearer nouns, schema, metadata, and category language.",
          metrics: [
            { label: "Clarity", value: clarityLiftBand },
            { label: "AI visibility", value: aiVisibilityLiftBand },
            { label: "Conversion", value: conversionLiftBand },
          ],
        },
        {
          label: "03 / COMMERCIAL LIFT",
          title: "What that can unlock",
          accent: colors.mint,
          body: "More of the right people understand what is sold, why it matters, and what to do next. That is where the practical demand lift comes from.",
          metrics: [
            { label: "Qualified demand", value: afterFixImpactBand },
            { label: "After-fix demand", value: afterFixInquiryBand },
          ],
        },
      ];

      impactRows.forEach((row, index) => {
        const y = 236 + index * 138;
        drawPanel(contentLeft, y, contentWidth, 118, colors.panelSoft);
        doc.roundedRect(contentLeft, y, 10, 118, 5).fill(row.accent);
        drawSectionTag(row.label, contentLeft + 24, y + 18, row.accent);
        doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(14.2).text(row.title, contentLeft + 24, y + 40, {
          width: 220,
          lineGap: 2,
        });
        const bodyFit = fitTextToBox(row.body, 238, 28, 7.7, 6.8, 2.6);
        drawParagraph(bodyFit.text, contentLeft + 24, y + 84, 238, bodyFit.size, bodyFit.lineGap);
        const metricW = row.metrics.length === 3 ? 74 : 112;
        const metricGap = row.metrics.length === 3 ? 8 : 16;
        const metricStart = contentRight - row.metrics.length * metricW - (row.metrics.length - 1) * metricGap;
        row.metrics.forEach((metric, metricIndex) => {
          const x = metricStart + metricIndex * (metricW + metricGap);
          drawSectionTag(metric.label.toUpperCase(), x, y + 34, colors.textMuted);
          const compactValue = metric.value
            .replace(/\s+to\s+/g, "-")
            .replace(/\+(\d+)%-\+(\d+)%/g, "+$1-$2%")
            .replace(/\s+more qualified demand/g, " demand")
            .replace(/\s+readiness lift/g, " lift");
          const metricFit = fitTextToBox(compactValue, metricW, 48, 10.2, 7.2, 2.6, "Helvetica");
          doc.fillColor(row.accent).font("Helvetica").fontSize(metricFit.size).text(metricFit.text, x, y + 56, {
            width: metricW,
            lineGap: metricFit.lineGap,
          });
        });
      });

      if (report.competitiveLandscape?.competitors?.length) {
        drawPanel(contentLeft, 660, contentWidth, 62, colors.panel);
        drawSectionTag(competitiveContext.label, contentLeft + 18, 680, colors.accent);
        drawParagraph(competitiveContext.body, contentLeft + 184, 672, contentWidth - 204, 8.2, 3.5);
      } else {
        doc.fillColor(colors.textMuted).font("Helvetica").fontSize(8.8).text(
          "Directional ranges use BrandMirror scores, visible market signal, and category context. Competitor benchmarks appear only when direct peers are clean enough to compare.",
          contentLeft,
          672,
          { width: contentWidth, lineGap: 3 },
        );
      }
    };

    // Page 6: Signal Read Part 1
    addBasePage();
    const page6TitleBottom = drawPageLabel("SIGNAL READ", "What is missing and where the signal starts to drift", {
      width: 344,
      maxFont: 28,
      minFont: 22,
      maxHeight: 118,
    });
    const signalCardWidth = (contentWidth - 18) / 2;
      drawTextCard({
        x: contentLeft,
        y: page6TitleBottom + 18,
        width: signalCardWidth,
        height: 470,
        label: pdfCopy.brandPromises,
        body: stripAiLayerSentences(report.whatIsMissing || report.whatsBroken.join(" ")),
        bodySize: 10.6,
        bodyMin: 8.2,
        bodyTopOffset: 50,
      });
      drawTextCard({
        x: contentLeft + signalCardWidth + 18,
        y: page6TitleBottom + 18,
        width: signalCardWidth,
        height: 470,
        label: pdfCopy.pageDelivers,
        body: stripAiLayerSentences(report.mixedSignals),
        bodySize: 10.6,
        bodyMin: 8.2,
        bodyTopOffset: 50,
      });

    // Page 6: Website Surface
    addBasePage();
    const page8TitleBottom = drawPageLabel(pdfCopy.websiteEvidenceLabel, pdfCopy.websiteEvidenceTitle, {
      width: 320,
      maxFont: 24,
      minFont: 20,
      maxHeight: 92,
    });
    const page8ImageY = Math.max(page8TitleBottom + 20, 170);
    const websiteImageHeight = 270;
    if (websiteImageSource) {
      drawRoundedImage(websiteImageSource, contentLeft, page8ImageY, contentWidth, websiteImageHeight, 18, {
        x: heroCallout?.x,
        y: heroCallout?.y,
      });
    } else {
      drawPanel(contentLeft, page8ImageY, contentWidth, websiteImageHeight, colors.panelSoft);
      drawSectionTag("ANALYZED URL", contentLeft + 18, page8ImageY + 22, colors.textMuted);
        doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(14).text(displayUrl, contentLeft + 18, page8ImageY + 42, {
        width: contentWidth - 36,
      });
      doc.fillColor(colors.textMuted).font("Helvetica").fontSize(10).text(
        "Live screenshot was not captured for this run. The diagnostic below is based on content and signal analysis of the page.",
        contentLeft + 18,
        page8ImageY + 74,
        { width: contentWidth - 36, lineGap: 4 },
      );
    }
    const websiteCalloutWidth = (contentWidth - 18) / 2;
    [
      {
        label: pdfCopy.heroCalloutLabel,
        title: heroCallout?.title || "Hero promise",
        body: "The first screen needs a faster expression of what is offered, who it is for, and why the value matters now.",
      },
      {
        label: pdfCopy.ctaCalloutLabel,
        title: ctaCallout?.title || "Proof and CTA zone",
        body: "The proof and next step need to work together so the CTA feels earned instead of carrying the conversion alone.",
      },
    ].forEach((item, index) => {
      const x = contentLeft + index * (websiteCalloutWidth + 18);
      drawTextCard({
        x,
        y: page8ImageY + websiteImageHeight + 22,
        width: websiteCalloutWidth,
        height: 194,
        label: item.label,
        title: item.title,
        body: item.body,
        bodySize: 9.4,
        bodyMin: 7.8,
        titleSize: 15.5,
        titleMin: 12.5,
      });
    });
    drawParagraph(pdfCopy.websiteEvidenceCaption, contentLeft, page8ImageY + websiteImageHeight + 232, contentWidth, 9.6, 4);

    // Pages 7-11: axis deep dives
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
      drawSectionTag(pdfCopy.whatScoreTells.toUpperCase(), contentLeft, 178, colors.textOnDark);
      const diagnosisText = fitTextToBox(bodyCopy(item.diagnosis), 268, 300, 10.2, 8.4, 4.2, "Helvetica");
      drawParagraph(diagnosisText.text, contentLeft, 206, 260, diagnosisText.size, diagnosisText.lineGap);
      const sidePanelX = 342;
      const sidePanelW = contentRight - sidePanelX;
      drawPanel(sidePanelX, 206, sidePanelW, item.title === "Visual Credibility" && websiteImageSource ? 338 : 304);
      if (item.title === "Visual Credibility" && websiteImageSource) {
        drawSectionTag("CURRENT SURFACE", sidePanelX + 20, 230, colors.textMuted);
        drawRoundedImage(
          websiteImageSource,
          sidePanelX + 20,
          254,
          sidePanelW - 40,
          92,
          12,
          { x: report.beforeAfterHero.currentFrame.focusX, y: report.beforeAfterHero.currentFrame.focusY },
        );
        drawSectionTag(pdfCopy.revealingLine, sidePanelX + 20, 366);
        const revealVisual = fitTextToBox(stripBrandLead(firstSentence(item.quote)), sidePanelW - 40, 52, 9.2, 8.0, 3.4, "Helvetica");
        doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(revealVisual.size).text(revealVisual.text, sidePanelX + 20, 386, {
          width: sidePanelW - 40,
          lineGap: revealVisual.lineGap,
        });
        drawSectionTag("WHAT THIS MEANS", sidePanelX + 20, 458, colors.textMuted);
        const implicationVisual = fitTextToBox(stripBrandLead(item.implication), sidePanelW - 40, 72, 8.2, 7.2, 2.8, "Helvetica");
        drawParagraph(implicationVisual.text, sidePanelX + 20, 478, sidePanelW - 40, implicationVisual.size, implicationVisual.lineGap);
      } else {
        drawSectionTag(pdfCopy.revealingLine, sidePanelX + 20, 232);
        const revealText = fitTextToBox(stripBrandLead(firstSentence(item.quote)), sidePanelW - 40, 96, 9.6, 8.2, 3.5, "Helvetica");
        doc.fillColor(colors.textOnDark).font("Helvetica").fontSize(revealText.size).text(revealText.text, sidePanelX + 20, 252, {
          width: sidePanelW - 40,
          lineGap: revealText.lineGap,
        });
        drawSectionTag("WHAT THIS MEANS", sidePanelX + 20, 396, colors.textMuted);
        const implicationText = fitTextToBox(stripBrandLead(item.implication), sidePanelW - 40, 90, 8.4, 7.4, 3.2, "Helvetica");
        drawParagraph(implicationText.text, sidePanelX + 20, 416, sidePanelW - 40, implicationText.size, implicationText.lineGap);
      }
      drawScoreMeter(contentLeft, 650, contentWidth, item.score.score);
      drawSectionTag(pdfCopy.benchmark.toUpperCase(), contentLeft, 618, colors.textOnDark);
      if (index === 4) {
        // no-op, keeps page count readable
      }
    });

    renderCommercialImpactPage();

    // Page 13: Priority Fix Stack
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
      drawPanel(contentLeft, bandTop, contentWidth, 118);
      doc.roundedRect(contentLeft, bandTop, 122, 118, 16).fill(band.color);
      doc.fillColor(band.title === pdfCopy.keep ? colors.dark : colors.textOnDark).font("Helvetica").fontSize(12).text(band.title, contentLeft + 18, bandTop + 43, {
        characterSpacing: 1.8,
      });
      drawBulletItems(band.items, contentLeft + 148, bandTop + 18, 312, {
        maxItems: 3,
        fontSize: 9.8,
        minSize: 8.4,
        maxHeight: 82,
        itemGap: 5,
      });
      bandTop += 132;
    });

    // Page 14: Implementation Playbook I
    addBasePage();
    const playbookTitleBottom = drawPageLabel(pdfCopy.playbookLabel, "From diagnosis to practical fixes", {
      width: 390,
      maxFont: 27,
      minFont: 21,
      maxHeight: 112,
    });
    drawParagraph(
      "This page translates the read into applied work: what is slowing trust, what to change, and what can improve when that change lands.",
      contentLeft,
      Math.max(playbookTitleBottom + 16, 174),
      contentWidth,
      10.2,
      5,
    );

    const tableTop = 206;
    const playbookRowH = 96;
    implementationRows.forEach((row, index) => {
      const y = tableTop + index * 104;
      drawPanel(contentLeft, y, contentWidth, playbookRowH, colors.panelSoft);
      doc.roundedRect(contentLeft, y, 104, playbookRowH, 16).fill(row.color);
      doc.fillColor(row.color === colors.mint ? colors.dark : colors.textOnDark)
        .font("Helvetica")
        .fontSize(8.6)
        .text(row.axis.toUpperCase(), contentLeft + 16, y + 18, {
          width: 72,
          characterSpacing: 1.1,
          lineGap: 2,
        });
      doc.font("Helvetica").fontSize(19).text(String(row.score), contentLeft + 58, y + 56, {
        width: 30,
        align: "right",
      });
      const issueX = contentLeft + 126;
      const fixX = contentLeft + 252;
      const changeX = contentLeft + 424;
      drawSectionTag("ISSUE", issueX, y + 14, colors.textMuted);
      const issueFit = fitTextToBox(row.issue, 108, 58, 8.3, 7.2, 2.6);
      drawParagraph(issueFit.text, issueX, y + 32, 108, issueFit.size, issueFit.lineGap);
      drawSectionTag("FIX", fixX, y + 14, colors.accent);
      const fixFit = fitTextToBox(row.fix, 152, 58, 8.3, 7.2, 2.6);
      drawParagraph(fixFit.text, fixX, y + 32, 152, fixFit.size, fixFit.lineGap);
      drawSectionTag("CHANGE", changeX, y + 14, row.color);
      const impactFit = fitTextToBox(row.impact, 88, 58, 8.1, 7.0, 2.5);
      drawParagraph(impactFit.text, changeX, y + 32, 88, impactFit.size, impactFit.lineGap);
    });

    // Page 15: Work with SAHAR
    addBasePage();
    drawPageLabel(pdfCopy.playbookLabel, "30-day implementation sprint", {
      width: 390,
      maxFont: 27,
      minFont: 21,
      maxHeight: 112,
    });
    const sprintIntro = fitTextToBox(
      "Use this as a self-guided sprint, or bring it into a working session with SAHAR. The goal is simple: make the page clearer, easier to trust, easier for AI to read, and easier to act on.",
      contentWidth,
      46,
      10.8,
      9.6,
      4,
    );
    drawParagraph(sprintIntro.text, contentLeft, 176, contentWidth, sprintIntro.size, sprintIntro.lineGap);
    const sprintBands = [
      {
        label: pdfCopy.playbookNow,
        subtitle: "Days 1-7",
        items: sprintNow,
        color: colors.terracotta,
      },
      {
        label: pdfCopy.playbookNext,
        subtitle: "Days 8-21",
        items: sprintNext,
        color: colors.amber,
      },
      {
        label: pdfCopy.playbookThen,
        subtitle: "Days 22-30",
        items: sprintThen,
        color: colors.mint,
      },
    ];
    sprintBands.forEach((band, index) => {
      const y = 238 + index * 112;
      drawPanel(contentLeft, y, contentWidth, 94, colors.panelSoft);
      doc.roundedRect(contentLeft, y, 108, 94, 16).fill(band.color);
      doc.fillColor(band.color === colors.mint ? colors.dark : colors.textOnDark)
        .font("Helvetica")
        .fontSize(13)
        .text(band.label, contentLeft + 20, y + 30, { characterSpacing: 2.2 });
      doc.font("Helvetica").fontSize(8.2).text(band.subtitle.toUpperCase(), contentLeft + 20, y + 52, {
        width: 74,
        characterSpacing: 1.4,
      });
      drawBulletItems(band.items, contentLeft + 130, y + 16, contentWidth - 154, {
        maxItems: 3,
        fontSize: 8.2,
        minSize: 7.1,
        lineGap: 2.5,
        itemGap: 4,
        maxHeight: 62,
      });
    });

    drawPanel(contentLeft, 584, contentWidth, 144, colors.panelSoft);
    drawSectionTag(pdfCopy.playbookCtaLabel, contentLeft + 20, 606, colors.mint);
    doc.fillColor(colors.textOnDark).font("Times-Bold").fontSize(17.5).text("Want SAHAR to build the sharper version?", contentLeft + 20, 632, {
      width: contentWidth - 196,
      lineGap: 2,
    });
    drawParagraph(
      "Bring this report into a working session. We turn the highest-leverage fixes into a focused homepage sprint: clearer positioning, stronger proof, cleaner AI visibility, and a cleaner next step.",
      contentLeft + 20,
      678,
      contentWidth - 206,
      9.0,
      4,
    );
    doc.fillColor(colors.accent).font("Helvetica").fontSize(10.8).text("BOOK THE NEXT STEP", contentRight - 154, 640, {
      width: 142,
      align: "right",
      characterSpacing: 1.2,
    });
    doc.fillColor(colors.mint).font("Helvetica").fontSize(15.5).text("saharstudio.com", contentRight - 174, 670, {
      width: 162,
      align: "right",
      link: "https://saharstudio.com",
      underline: true,
    });
    doc.fillColor(colors.mutedOnDark).font("Helvetica").fontSize(9.2).text("Bring the report. Leave with the next page version.", contentRight - 174, 696, {
      width: 142,
      align: "right",
    });

    doc.end();
  });
}
