import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  type BrandReadResult,
  generateBrandRead,
} from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";
import { DIMENSIONS, bandFor } from "@/lib/score-band";

export const runtime = "nodejs";
export const maxDuration = 60;

const PAGE = {
  width: 612,
  height: 792,
  marginX: 54,
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

function slugify(value: string) {
  return String(value || "brandmirror").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror";
}

function scoreRows(result: BrandReadResult) {
  return DIMENSIONS.map((dimension) => [
    dimension.label,
    safeNumber(result[dimension.key]),
  ] as const);
}

function safeText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function hexToRgbColor(value: string) {
  const normalized = value.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;
  const parsed = Number.parseInt(expanded, 16);
  return rgb(((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255);
}

function wrapText(text: string, font: PDFFont, size: number, width: number) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
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

function fitHeadlineLines(text: string, font: PDFFont, width: number, maxSize = 31, minSize = 20) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const lines = wrapText(text, font, size, width);
    if (lines.length <= 2) {
      return { lines, size, lineHeight: size * 1.04 };
    }
  }
  const lines = wrapText(text, font, minSize, width);
  return { lines: lines.slice(0, 2), size: minSize, lineHeight: minSize * 1.04 };
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

async function renderBrandReadPdf(result: BrandReadResult, url: string) {
  const pdf = await PDFDocument.create();
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const posterBand = bandFor(safeNumber(result.posterScore));
  const posterBandColor = hexToRgbColor(posterBand.color);
  const safeUrl = safeText(url);
  const contentWidth = PAGE.width - PAGE.marginX * 2;
  const safeBrandName = safeText(result.brandName, "BrandMirror");
  const safeTitle = safeText(result.title, "Free brand read");
  const normalizedBrand = safeBrandName.toLowerCase();
  const subtitleText =
    safeTitle.toLowerCase().includes(normalizedBrand.slice(0, Math.min(normalizedBrand.length, 18)))
      ? "Free brand read"
      : safeTitle;

  const addPage = () => {
    const page = pdf.addPage([PAGE.width, PAGE.height]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE.width,
      height: PAGE.height,
      color: COLORS.bg,
    });
    return page;
  };

  const drawLabel = (page: PDFPage, text: string, x: number, atY: number, color = COLORS.faint) => {
    page.drawText(safeText(text).toUpperCase(), {
      x,
      y: atY,
      size: 10,
      font: sans,
      color,
    });
  };

  const drawTierCard = (
    page: PDFPage,
    x: number,
    y: number,
    width: number,
    label: string,
    range: string,
    color: ReturnType<typeof rgb>,
    body: string,
  ) => {
    page.drawRectangle({ x, y, width, height: 60, color: COLORS.panel });
    page.drawText(label, {
      x: x + 12,
      y: y + 41,
      size: 9.5,
      font: sansBold,
      color,
    });
    page.drawText(range, {
      x: x + width - 46,
      y: y + 41,
      size: 9,
      font: sans,
      color,
    });
    drawWrapped(page, body, sans, 8.6, x + 12, y + 24, width - 24, COLORS.soft, 11);
  };

  const page1 = addPage();
  let y = PAGE.height - PAGE.marginY;

  drawLabel(page1, "BrandMirror / Free First Read", PAGE.marginX, y);
  page1.drawText(safeUrl, {
    x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(safeUrl, 10),
    y,
    size: 10,
    font: sans,
    color: COLORS.faint,
  });
  y -= 34;

  const headline = fitHeadlineLines(safeBrandName, serifBold, contentWidth, 31, 21);
  for (const line of headline.lines) {
    page1.drawText(line, {
      x: PAGE.marginX,
      y,
      size: headline.size,
      font: serifBold,
      color: COLORS.text,
    });
    y -= headline.lineHeight;
  }
  y -= 10;

  page1.drawText(subtitleText, {
    x: PAGE.marginX,
    y,
    size: 11,
    font: sans,
    color: posterBandColor,
  });
  y -= 22;

  y = drawWrapped(page1, safeText(result.tagline), serif, 18, PAGE.marginX, y, contentWidth, COLORS.soft, 22);
  y -= 20;

  page1.drawRectangle({
    x: PAGE.marginX,
    y: y - 84,
    width: contentWidth,
    height: 104,
    color: COLORS.panel,
  });

  drawLabel(page1, "Brand signal score", PAGE.marginX + 24, y);
  page1.drawText(String(safeNumber(result.posterScore)), {
    x: PAGE.marginX + 24,
    y: y - 42,
    size: 42,
    font: serifBold,
    color: posterBandColor,
  });
  page1.drawText(safeText(result.scoreBand, posterBand.label), {
    x: PAGE.marginX + 176,
    y: y - 20,
    size: 20,
    font: sansBold,
    color: posterBandColor,
  });
  drawWrapped(
    page1,
    safeText(result.scoreModifier),
    sans,
    11.5,
    PAGE.marginX + 176,
    y - 42,
    contentWidth - 200,
    COLORS.soft,
    15,
  );
  y -= 132;

  scoreRows(result).forEach(([label, value], index) => {
    const rowY = y - index * 28;
    const rowBand = bandFor(value);
    const rowBandColor = hexToRgbColor(rowBand.color);
    page1.drawText(label.toUpperCase(), {
      x: PAGE.marginX,
      y: rowY,
      size: 10.5,
      font: sans,
      color: COLORS.faint,
    });

    const lineLeft = PAGE.marginX + 230;
    const lineRight = PAGE.width - PAGE.marginX - 70;

    page1.drawLine({
      start: { x: lineLeft, y: rowY + 6 },
      end: { x: lineRight, y: rowY + 6 },
      thickness: 6,
      color: COLORS.line,
    });
    page1.drawLine({
      start: { x: lineLeft, y: rowY + 6 },
      end: { x: lineLeft + ((lineRight - lineLeft) * value) / 100, y: rowY + 6 },
      thickness: 6,
      color: rowBandColor,
    });
    const numeric = String(value);
    page1.drawText(numeric, {
      x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(numeric, 12),
      y: rowY,
      size: 12,
      font: sansBold,
      color: rowBandColor,
    });
  });
  y -= 166;

  drawLabel(page1, "What the company appears to do", PAGE.marginX, y);
  y -= 20;
  y = drawWrapped(page1, safeText(result.whatItDoes), sans, 11.4, PAGE.marginX, y, contentWidth, COLORS.text, 17);
  y -= 10;
  drawLabel(page1, "First diagnosis", PAGE.marginX, y);
  y -= 20;
  y = drawWrapped(page1, safeText(result.summary), serif, 15.5, PAGE.marginX, y, contentWidth, COLORS.soft, 21);
  y -= 12;
  drawLabel(page1, "Current state", PAGE.marginX, y);
  y -= 20;
  drawWrapped(page1, safeText(result.current), sans, 11.2, PAGE.marginX, y, contentWidth, COLORS.text, 17);

  page1.drawText("Powered by SAHAR / saharstudio.com", {
    x: PAGE.width / 2 - sans.widthOfTextAtSize("Powered by SAHAR / saharstudio.com", 9.5) / 2,
    y: 24,
    size: 9.5,
    font: sans,
    color: COLORS.faint,
  });

  const page2 = addPage();
  let y2 = PAGE.height - PAGE.marginY;
  drawLabel(page2, "BrandMirror / Free First Read", PAGE.marginX, y2);
  page2.drawText(safeUrl, {
    x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(safeUrl, 10),
    y: y2,
    size: 10,
    font: sans,
    color: COLORS.faint,
  });
  y2 -= 34;

  drawLabel(page2, "How to read the scan", PAGE.marginX, y2);
  y2 -= 22;
  y2 = drawWrapped(
    page2,
    "Five indicator tiers. Five dimensions of the signal.",
    serifBold,
    19,
    PAGE.marginX,
    y2,
    contentWidth,
    COLORS.text,
    22,
  );
  y2 -= 8;

  const tierWidth = (contentWidth - 12) / 2;
  const tiers = [
    ["FLATLINING", "0-30", "#B65C5C", "The signal is broken, absent, or actively costing trust."],
    ["FRAGILE", "30-50", "#C97B6B", "A base exists, but it still collapses under pressure."],
    ["DEVELOPING", "50-70", "#E8B04C", "The page is working in parts, but still leaks confidence."],
    ["STABLE", "70-85", "#6FE0C2", "The brand is clear enough to build trust and sharpen."],
    ["LEADING", "85-100", "#D4C4DC", "The brand is structured strongly enough to sell before it explains."],
  ] as const;
  drawTierCard(page2, PAGE.marginX, y2 - 60, tierWidth, tiers[0][0], tiers[0][1], hexToRgbColor(tiers[0][2]), tiers[0][3]);
  drawTierCard(page2, PAGE.marginX + tierWidth + 12, y2 - 60, tierWidth, tiers[1][0], tiers[1][1], hexToRgbColor(tiers[1][2]), tiers[1][3]);
  drawTierCard(page2, PAGE.marginX, y2 - 132, tierWidth, tiers[2][0], tiers[2][1], hexToRgbColor(tiers[2][2]), tiers[2][3]);
  drawTierCard(page2, PAGE.marginX + tierWidth + 12, y2 - 132, tierWidth, tiers[3][0], tiers[3][1], hexToRgbColor(tiers[3][2]), tiers[3][3]);
  drawTierCard(page2, PAGE.marginX, y2 - 204, contentWidth, tiers[4][0], tiers[4][1], hexToRgbColor(tiers[4][2]), tiers[4][3]);
  y2 -= 244;

  const signalWidth = (contentWidth - 24) / 3;
  const signalY = y2 - 96;
  [
    { label: "Strongest signal", body: safeText(result.strongestSignal), color: COLORS.accent },
    { label: "Main friction", body: safeText(result.mainFriction), color: COLORS.warn },
    { label: "Next move", body: "Available in full report", color: COLORS.soft },
  ].forEach((card, index) => {
    const x = PAGE.marginX + index * (signalWidth + 12);
    page2.drawRectangle({ x, y: signalY, width: signalWidth, height: 116, color: COLORS.panel });
    drawLabel(page2, card.label, x + 16, signalY + 90, card.color);
    drawWrapped(page2, card.body, sans, 11.2, x + 16, signalY + 62, signalWidth - 32, card.color === COLORS.soft ? COLORS.soft : COLORS.text, 17);
  });
  y2 = signalY - 24;

  const teaserY = y2 - 232;
  const teaserWidth = (contentWidth - 20) / 2;
  page2.drawRectangle({ x: PAGE.marginX, y: teaserY, width: teaserWidth, height: 220, color: COLORS.panel });
  drawLabel(page2, "Headline rewrite", PAGE.marginX + 16, teaserY + 194, COLORS.accent);
  ["AFTER", "SUPPORTING LINE", "CTA"].forEach((line, idx) => {
    const yy = teaserY + 154 - idx * 52;
    page2.drawText(line, { x: PAGE.marginX + 16, y: yy + 24, size: 9, font: sans, color: COLORS.faint });
    page2.drawRectangle({ x: PAGE.marginX + 16, y: yy, width: teaserWidth - 32, height: 22, color: rgb(20/255,20/255,24/255) });
  });
  page2.drawRectangle({
    x: PAGE.marginX + 16,
    y: teaserY + 24,
    width: teaserWidth - 32,
    height: 138,
    color: rgb(7 / 255, 7 / 255, 10 / 255),
    opacity: 0.55,
  });
  page2.drawText("INCLUDED IN FULL REPORT", {
    x: PAGE.marginX + 40,
    y: teaserY + 20,
    size: 10,
    font: sansBold,
    color: COLORS.text,
  });

  const fixX = PAGE.marginX + teaserWidth + 20;
  page2.drawRectangle({ x: fixX, y: teaserY, width: teaserWidth, height: 220, color: COLORS.panel });
  drawLabel(page2, "Fix stack", fixX + 16, teaserY + 194, COLORS.accent);
  [
    { label: "FIX NOW", color: rgb(224/255,122/255,95/255) },
    { label: "FIX NEXT", color: COLORS.warn },
    { label: "KEEP", color: COLORS.accent },
  ].forEach((row, idx) => {
    const yy = teaserY + 142 - idx * 48;
    page2.drawRectangle({ x: fixX + 16, y: yy, width: 86, height: 28, color: rgb(row.color.red * 0.18, row.color.green * 0.18, row.color.blue * 0.18) });
    page2.drawText(row.label, { x: fixX + 28, y: yy + 9, size: 9.2, font: sansBold, color: row.color });
    for (let i = 0; i < 3; i += 1) {
      page2.drawLine({
        start: { x: fixX + 122 + i * 64, y: yy + 14 },
        end: { x: fixX + 172 + i * 64, y: yy + 14 },
        thickness: 6,
        color: rgb(row.color.red * 0.24, row.color.green * 0.24, row.color.blue * 0.24),
      });
    }
  });
  page2.drawText("INCLUDED IN FULL REPORT", {
    x: fixX + 40,
    y: teaserY + 20,
    size: 10,
    font: sansBold,
    color: COLORS.text,
  });
  y2 = teaserY - 24;

  page2.drawRectangle({
    x: PAGE.marginX,
    y: y2 - 126,
    width: contentWidth,
    height: 138,
    color: COLORS.panel,
  });
  drawLabel(page2, "Unlock full report", PAGE.marginX + 20, y2 - 18, COLORS.accent);
  const ctaY = drawWrapped(
    page2,
    "Unlock the full BrandMirror report to see the sharpest rewrite direction, the full fix stack, ROI upside, competitor comparison, and the implementation playbook.",
    serif,
    18,
    PAGE.marginX + 20,
    y2 - 48,
    contentWidth - 40,
    COLORS.text,
    22,
  );
  page2.drawText("brandmirror.app", {
    x: PAGE.marginX + 20,
    y: ctaY - 10,
    size: 13,
    font: sansBold,
    color: posterBandColor,
  });
  page2.drawText("$197 full report", {
    x: PAGE.width - PAGE.marginX - 20 - sansBold.widthOfTextAtSize("$197 full report", 13),
    y: ctaY - 10,
    size: 13,
    font: sansBold,
    color: posterBandColor,
  });

  page2.drawText("Powered by SAHAR / saharstudio.com", {
    x: PAGE.width / 2 - sans.widthOfTextAtSize("Powered by SAHAR / saharstudio.com", 9.5) / 2,
    y: 24,
    size: 9.5,
    font: sans,
    color: COLORS.faint,
  });

  return Buffer.from(await pdf.save());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      result?: BrandReadResult;
    };
    const language = getSiteLocale(body.language);
    const payload =
      body.result && body.url
        ? { url: body.url, result: body.result }
        : await generateBrandRead(body.url || "", language);

    const pdf = await renderBrandReadPdf(payload.result, payload.url);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slugify(safeText(payload.result.brandName, "brandmirror"))}-first-read.pdf"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unable to export the free BrandMirror PDF right now.",
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
