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

  let page = addPage();
  let y = PAGE.height - PAGE.marginY;
  const contentWidth = PAGE.width - PAGE.marginX * 2;

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
    if (!body) return;
    ensureSpace(90);
    drawLabel(label, PAGE.marginX, y);
    y -= 22;
    y = drawWrapped(page, body, sans, 12.5, PAGE.marginX, y, contentWidth, color, 18);
    y -= 12;
  };

  drawLabel("BrandMirror / Free First Read", PAGE.marginX, y);
  page.drawText(url, {
    x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(safeText(url), 10),
    y,
    size: 10,
    font: sans,
    color: COLORS.faint,
  });
  y -= 34;

  page.drawText(safeText(result.brandName, "BrandMirror"), {
    x: PAGE.marginX,
    y,
    size: 31,
    font: serifBold,
    color: COLORS.text,
  });
  y -= 28;

  page.drawText(safeText(result.title, "First Read"), {
    x: PAGE.marginX,
    y,
    size: 11,
    font: sans,
    color: COLORS.accent,
  });
  y -= 22;

  y = drawWrapped(page, safeText(result.tagline), serif, 18, PAGE.marginX, y, contentWidth, COLORS.soft, 22);
  y -= 20;

  page.drawRectangle({
    x: PAGE.marginX,
    y: y - 84,
    width: contentWidth,
    height: 104,
    color: COLORS.panel,
  });

  drawLabel("Poster score", PAGE.marginX + 24, y);
  page.drawText(String(safeNumber(result.posterScore)), {
    x: PAGE.marginX + 24,
    y: y - 42,
    size: 42,
    font: serifBold,
    color: COLORS.accent,
  });
  page.drawText(safeText(result.scoreBand, bandFor(safeNumber(result.posterScore)).label), {
    x: PAGE.marginX + 176,
    y: y - 20,
    size: 20,
    font: sansBold,
    color: COLORS.text,
  });
  drawWrapped(
    page,
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
    page.drawText(label.toUpperCase(), {
      x: PAGE.marginX,
      y: rowY,
      size: 10.5,
      font: sans,
      color: COLORS.faint,
    });

    const lineLeft = PAGE.marginX + 230;
    const lineRight = PAGE.width - PAGE.marginX - 70;

    page.drawLine({
      start: { x: lineLeft, y: rowY + 6 },
      end: { x: lineRight, y: rowY + 6 },
      thickness: 6,
      color: COLORS.line,
    });
    page.drawLine({
      start: { x: lineLeft, y: rowY + 6 },
      end: { x: lineLeft + ((lineRight - lineLeft) * value) / 100, y: rowY + 6 },
      thickness: 6,
      color: COLORS.accent,
    });
    const numeric = String(value);
    page.drawText(numeric, {
      x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(numeric, 12),
      y: rowY,
      size: 12,
      font: sansBold,
      color: COLORS.text,
    });
  });
  y -= 170;

  drawSection("What the company appears to do", safeText(result.whatItDoes));
  drawSection("First diagnosis", safeText(result.summary));
  drawSection("Current read", safeText(result.current));
  drawSection("Strongest signal", safeText(result.strongestSignal), COLORS.accent);
  drawSection("Main friction", safeText(result.mainFriction), COLORS.warn);
  drawSection("One next move", safeText(result.nextMove));
  drawSection("What already feels strong", safeText(result.strength));
  drawSection("What is missing", safeText(result.gap));
  drawSection("What feels out of sync", safeText(result.mismatch));
  drawSection("Tone read", safeText(result.voice));
  drawSection("Direction", safeText(result.direction));

  page.drawText("Powered by BrandMirror", {
    x: PAGE.width / 2 - sans.widthOfTextAtSize("Powered by BrandMirror", 9.5) / 2,
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
