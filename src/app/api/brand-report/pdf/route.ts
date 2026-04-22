import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  type BrandReport,
  generateBrandReport,
} from "@/lib/brand-report";
import { getSiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

const PAGE = {
  width: 612,
  height: 792,
  marginX: 52,
  marginY: 54,
};

const COLORS = {
  bg: rgb(7 / 255, 7 / 255, 10 / 255),
  panel: rgb(16 / 255, 16 / 255, 20 / 255),
  text: rgb(244 / 255, 245 / 255, 248 / 255),
  soft: rgb(200 / 255, 203 / 255, 212 / 255),
  faint: rgb(123 / 255, 127 / 255, 137 / 255),
  line: rgb(36 / 255, 38 / 255, 44 / 255),
  accent: rgb(111 / 255, 224 / 255, 194 / 255),
  warn: rgb(232 / 255, 176 / 255, 76 / 255),
};

function safeText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeList(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.map((item) => safeText(item)).filter(Boolean);
}

function slugify(value: string) {
  return safeText(value, "brandmirror").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror";
}

function wrapText(text: string, font: PDFFont, size: number, width: number) {
  const words = safeText(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let current = words[0];

  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${current} ${words[index]}`;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[index];
    }
  }

  lines.push(current);
  return lines;
}

function drawWrapped(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  x: number,
  y: number,
  width: number,
  color: ReturnType<typeof rgb>,
  lineHeight = size * 1.35,
) {
  const lines = wrapText(text, font, size, width);
  let cursor = y;

  for (const line of lines) {
    page.drawText(line, { x, y: cursor, size, font, color });
    cursor -= lineHeight;
  }

  return cursor;
}

async function renderBrandReportPdf(report: BrandReport, url: string) {
  const pdf = await PDFDocument.create();
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const contentWidth = PAGE.width - PAGE.marginX * 2;

  const addPage = () => {
    const page = pdf.addPage([PAGE.width, PAGE.height]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE.width,
      height: PAGE.height,
      color: COLORS.bg,
    });
    page.drawText("Powered by BrandMirror", {
      x: PAGE.width / 2 - sans.widthOfTextAtSize("Powered by BrandMirror", 9.5) / 2,
      y: 24,
      size: 9.5,
      font: sans,
      color: COLORS.faint,
    });
    return page;
  };

  let page = addPage();
  let y = PAGE.height - PAGE.marginY;

  const ensureSpace = (needed: number) => {
    if (y - needed < PAGE.marginY) {
      page = addPage();
      y = PAGE.height - PAGE.marginY;
    }
  };

  const drawLabel = (text: string, x: number, atY: number, color = COLORS.faint) => {
    page.drawText(safeText(text).toUpperCase(), {
      x,
      y: atY,
      size: 10,
      font: sans,
      color,
    });
  };

  const drawSection = (label: string, body: string, color = COLORS.text) => {
    const text = safeText(body);
    if (!text) return;
    ensureSpace(90);
    drawLabel(label, PAGE.marginX, y);
    y -= 22;
    y = drawWrapped(page, text, sans, 12, PAGE.marginX, y, contentWidth, color, 18);
    y -= 12;
  };

  const drawBullets = (label: string, items: string[], bulletColor = COLORS.soft) => {
    const rows = safeList(items);
    if (!rows.length) return;
    ensureSpace(40 + rows.length * 20);
    drawLabel(label, PAGE.marginX, y);
    y -= 22;
    for (const item of rows) {
      ensureSpace(26);
      page.drawCircle({
        x: PAGE.marginX + 6,
        y: y + 5,
        size: 2.4,
        color: bulletColor,
      });
      y = drawWrapped(page, item, sans, 11.5, PAGE.marginX + 18, y, contentWidth - 18, COLORS.text, 16);
      y -= 6;
    }
    y -= 8;
  };

  drawLabel("BrandMirror / Full Report", PAGE.marginX, y);
  const safeUrl = safeText(url, safeText(report.url));
  page.drawText(safeUrl, {
    x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(safeUrl, 10),
    y,
    size: 10,
    font: sans,
    color: COLORS.faint,
  });
  y -= 34;

  page.drawText(safeText(report.brandName, "BrandMirror Report"), {
    x: PAGE.marginX,
    y,
    size: 30,
    font: serifBold,
    color: COLORS.text,
  });
  y -= 28;

  page.drawText(safeText(report.title, "Full Brand Report"), {
    x: PAGE.marginX,
    y,
    size: 11,
    font: sans,
    color: COLORS.accent,
  });
  y -= 20;

  y = drawWrapped(page, safeText(report.tagline), serif, 17, PAGE.marginX, y, contentWidth, COLORS.soft, 22);
  y -= 20;

  page.drawRectangle({
    x: PAGE.marginX,
    y: y - 92,
    width: contentWidth,
    height: 112,
    color: COLORS.panel,
  });

  drawLabel("Poster score", PAGE.marginX + 24, y);
  page.drawText(String(safeNumber(report.posterScore)), {
    x: PAGE.marginX + 24,
    y: y - 42,
    size: 42,
    font: serifBold,
    color: COLORS.accent,
  });
  page.drawText(safeText(report.scoreBand, "STABLE"), {
    x: PAGE.marginX + 176,
    y: y - 18,
    size: 20,
    font: sansBold,
    color: COLORS.text,
  });
  drawWrapped(
    page,
    safeText(report.scoreModifier),
    sans,
    11.5,
    PAGE.marginX + 176,
    y - 40,
    contentWidth - 200,
    COLORS.soft,
    15,
  );
  y -= 136;

  const scorecard = Array.isArray(report.scorecard) ? report.scorecard : [];
  if (scorecard.length) {
    ensureSpace(34 + scorecard.length * 28);
    drawLabel("Score breakdown", PAGE.marginX, y);
    y -= 24;
    scorecard.forEach((row) => {
      const label = safeText(row?.label);
      const score = safeNumber(row?.score);
      page.drawText(label.toUpperCase(), {
        x: PAGE.marginX,
        y,
        size: 10.5,
        font: sans,
        color: COLORS.faint,
      });
      const lineLeft = PAGE.marginX + 220;
      const lineRight = PAGE.width - PAGE.marginX - 70;
      page.drawLine({
        start: { x: lineLeft, y: y + 6 },
        end: { x: lineRight, y: y + 6 },
        thickness: 6,
        color: COLORS.line,
      });
      page.drawLine({
        start: { x: lineLeft, y: y + 6 },
        end: { x: lineLeft + ((lineRight - lineLeft) * score) / 100, y: y + 6 },
        thickness: 6,
        color: COLORS.accent,
      });
      const numeric = String(score);
      page.drawText(numeric, {
        x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(numeric, 12),
        y,
        size: 12,
        font: sansBold,
        color: COLORS.text,
      });
      y -= 28;
    });
    y -= 10;
  }

  drawSection("Snapshot", safeText(report.snapshot));
  drawSection("What it signals", safeText(report.whatItSignals));
  drawSection("What is missing", safeText(report.whatIsMissing), COLORS.warn);
  drawSection("What to do next", safeText(report.whatToDoNext), COLORS.accent);
  drawSection("Positioning read", safeText(report.positioningRead));
  drawSection("AI discoverability", safeText(report.toneCheck));
  drawSection("Visual identity", safeText(report.visualIdentityRead));
  drawSection("Above the fold", safeText(report.aboveTheFold));
  drawSection("Conversion read", safeText(report.conversionRead));
  drawSection("Strategic direction", safeText(report.strategicDirection));

  drawBullets("What works", report.whatWorks);
  drawBullets("What's broken", report.whatsBroken, COLORS.warn);
  drawBullets("Why it's not converting", report.whyNotConverting);
  drawBullets("Friction map", report.frictionMap);
  drawBullets("Trust gaps", report.trustGaps);
  drawBullets("Offer opportunities", report.offerOpportunities);
  drawBullets("Positioning moves", report.positioningMoves);
  drawBullets("Messaging priorities", report.messagingPriorities);
  drawBullets("Offer strategy", report.offerStrategy);

  const fixes = report.priorityFixes || { fixNow: [], fixNext: [], keep: [] };
  drawBullets("Fix now", fixes.fixNow, COLORS.warn);
  drawBullets("Fix next", fixes.fixNext);
  drawBullets("Keep", fixes.keep, COLORS.accent);

  const suggestions = report.rewriteSuggestions || { heroLine: "", subheadline: "", cta: "" };
  drawSection("Rewrite suggestion / hero line", safeText(suggestions.heroLine), COLORS.accent);
  drawSection("Rewrite suggestion / subheadline", safeText(suggestions.subheadline));
  drawSection("Rewrite suggestion / CTA", safeText(suggestions.cta));

  const actionPlan = report.actionPlan || { next7Days: [], next30Days: [] };
  drawBullets("Next 7 days", actionPlan.next7Days, COLORS.accent);
  drawBullets("Next 30 days", actionPlan.next30Days);
  drawSection("Strategic next move", safeText(report.strategicNextMove), COLORS.accent);

  return Buffer.from(await pdf.save());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      report?: BrandReport;
      sessionId?: string;
    };
    const language = getSiteLocale(body.language);
    const paidAccess = isStripeConfigured()
      ? await getPaidCheckoutAccess(body.sessionId)
      : null;

    if (isStripeConfigured() && !paidAccess) {
      return new Response(
        JSON.stringify({
          error: "Full report PDF is locked until payment is confirmed.",
          detail: "Complete checkout to unlock the paid BrandMirror PDF.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    const report =
      body.report &&
      body.report.url &&
      (!paidAccess || body.report.url === paidAccess.reportUrl)
        ? body.report
        : await generateBrandReport(paidAccess?.reportUrl || body.url || "", language);

    const pdf = await renderBrandReportPdf(report, paidAccess?.reportUrl || body.url || report.url);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slugify(safeText(report.brandName, "brandmirror"))}-report.pdf"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unable to export the BrandMirror PDF right now.",
        detail:
          error instanceof Error
            ? error.message
            : "Something went wrong while exporting the PDF.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
