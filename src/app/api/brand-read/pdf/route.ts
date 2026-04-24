import {
  PDFDocument,
  PDFHexString,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import {
  type BrandReadResult,
  generateBrandRead,
} from "@/lib/brand-read";
import { captureWebsiteSurface } from "@/lib/site-capture";
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

function fitBodyText(
  text: string,
  font: PDFFont,
  width: number,
  height: number,
  maxSize = 11.4,
  minSize = 9.6,
  lineHeightRatio = 1.48,
) {
  const clean = safeText(text);
  for (let size = maxSize; size >= minSize; size -= 0.2) {
    const lineHeight = size * lineHeightRatio;
    const lines = wrapText(clean, font, size, width);
    if (lines.length * lineHeight <= height) {
      return { lines, size, lineHeight };
    }
  }
  const size = minSize;
  const lineHeight = size * lineHeightRatio;
  const maxLines = Math.max(2, Math.floor(height / lineHeight));
  const lines = wrapText(clean, font, size, width).slice(0, maxLines);
  if (lines.length) {
    const last = lines.length - 1;
    lines[last] = `${lines[last].replace(/[ ,.;:]+$/, "")}...`;
  }
  return { lines, size, lineHeight };
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

function addExternalLink(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  url: string,
) {
  const link = page.doc.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFHexString.fromText(url),
    },
  });

  const linkRef = page.doc.context.register(link);
  page.node.addAnnot(linkRef);
}

async function loadPdfImageBytes(imageUrl?: string) {
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
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return undefined;
    }
  }

  return undefined;
}

async function renderBrandReadPdf(
  result: BrandReadResult,
  url: string,
  websiteCaptureDataUrl?: string,
) {
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
  const websiteImageBytes = await loadPdfImageBytes(websiteCaptureDataUrl);
  const websiteImage = websiteImageBytes
    ? websiteCaptureDataUrl?.includes("image/jpeg")
      ? await pdf.embedJpg(websiteImageBytes)
      : await pdf.embedPng(websiteImageBytes)
    : undefined;
  const normalizedBrand = safeBrandName.toLowerCase();
  const normalizedTitle = safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const compactBrand = normalizedBrand.replace(/[^a-z0-9]+/g, " ").trim();
  const subtitleText =
    normalizedTitle.includes(compactBrand) || compactBrand.includes(normalizedTitle)
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

  const drawTierBadge = (
    page: PDFPage,
    x: number,
    y: number,
    width: number,
    label: string,
    range: string,
    color: ReturnType<typeof rgb>,
    highlighted = false,
  ) => {
    page.drawRectangle({
      x,
      y,
      width,
      height: 58,
      color: highlighted ? rgb(color.red * 0.16, color.green * 0.16, color.blue * 0.16) : COLORS.panel,
      borderColor: rgb(color.red * 0.55, color.green * 0.55, color.blue * 0.55),
      borderWidth: highlighted ? 1.2 : 0.8,
    });
    page.drawText(range, {
      x: x + width / 2 - sans.widthOfTextAtSize(range, 9.5) / 2,
      y: y + 34,
      size: 9.5,
      font: sansBold,
      color,
    });
    page.drawText(label, {
      x: x + width / 2 - sans.widthOfTextAtSize(label, 8.8) / 2,
      y: y + 16,
      size: 8.8,
      font: sans,
      color,
    });
  };

  const tiers = [
    ["FLATLINING", "0-30", "#B65C5C", "The signal is broken, absent, or actively costing trust."],
    ["FRAGILE", "30-50", "#C97B6B", "A base exists, but it still collapses under pressure."],
    ["DEVELOPING", "50-70", "#E8B04C", "The page is working in parts, but still leaks confidence."],
    ["STABLE", "70-85", "#6FE0C2", "The brand is clear enough to build trust and sharpen."],
    ["LEADING", "85-100", "#D4C4DC", "The brand is structured strongly enough to sell before it explains."],
  ] as const;

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

  drawLabel(page1, "How to read the scan", PAGE.marginX, y);
  y -= 24;
  y = drawWrapped(
    page1,
    "Five indicator tiers. Five dimensions of the signal.",
    serifBold,
    18,
    PAGE.marginX,
    y,
    contentWidth,
    COLORS.text,
    22,
  );
  const badgeY = y - 64;
  const badgeGap = 8;
  const badgeWidth = (contentWidth - badgeGap * 4) / 5;
  const activeBand = safeText(result.scoreBand, posterBand.label).toUpperCase();
  tiers.forEach(([label, range, hex], index) => {
    const badgeX = PAGE.marginX + index * (badgeWidth + badgeGap);
    drawTierBadge(
      page1,
      badgeX,
      badgeY,
      badgeWidth,
      label,
      range,
      hexToRgbColor(hex),
      label === activeBand,
    );
  });

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

  drawLabel(page2, "First read", PAGE.marginX, y2);
  y2 -= 22;
  y2 = drawWrapped(
    page2,
    "What the homepage says, where trust begins, and what the full report unlocks next.",
    serifBold,
    19,
    PAGE.marginX,
    y2,
    contentWidth,
    COLORS.text,
    22,
  );
  y2 -= 12;

  const sectionBody = (
    label: string,
    body: string,
    height: number,
  ) => {
    drawLabel(page2, label, PAGE.marginX, y2);
    y2 -= 20;
    const fitted = fitBodyText(body, sans, contentWidth, height, 11.2, 9.8, 1.5);
    fitted.lines.forEach((line) => {
      page2.drawText(line, {
        x: PAGE.marginX,
        y: y2,
        size: fitted.size,
        font: sans,
        color: COLORS.text,
      });
      y2 -= fitted.lineHeight;
    });
    y2 -= 12;
  };

  sectionBody("What the company appears to do", safeText(result.whatItDoes), 72);
  sectionBody("First diagnosis", safeText(result.summary), 74);
  sectionBody("Current state", safeText(result.current), 120);

  const signalWidth = (contentWidth - 24) / 3;
  const signalY = Math.max(110, y2 - 118);
  [
    { label: "Strongest signal", body: safeText(result.strongestSignal), color: COLORS.accent },
    { label: "Main friction", body: safeText(result.mainFriction), color: COLORS.warn },
    { label: "Next move", body: "Available in full report", color: COLORS.soft },
  ].forEach((card, index) => {
    const x = PAGE.marginX + index * (signalWidth + 12);
    page2.drawRectangle({ x, y: signalY, width: signalWidth, height: 116, color: COLORS.panel });
    drawLabel(page2, card.label, x + 16, signalY + 90, card.color);
    const fitted = fitBodyText(card.body, sans, signalWidth - 32, 54, 11.2, 9.2, 1.48);
    let cardY = signalY + 62;
    fitted.lines.forEach((line) => {
      page2.drawText(line, {
        x: x + 16,
        y: cardY,
        size: fitted.size,
        font: sans,
        color: card.color === COLORS.soft ? COLORS.soft : COLORS.text,
        });
        cardY -= fitted.lineHeight;
      });
  });
  page2.drawText("Powered by SAHAR / saharstudio.com", {
    x: PAGE.width / 2 - sans.widthOfTextAtSize("Powered by SAHAR / saharstudio.com", 9.5) / 2,
    y: 24,
    size: 9.5,
    font: sans,
    color: COLORS.faint,
  });

  const page3 = addPage();
  let y3 = PAGE.height - PAGE.marginY;
  drawLabel(page3, "BrandMirror / Free First Read", PAGE.marginX, y3);
  page3.drawText(safeUrl, {
    x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(safeUrl, 10),
    y: y3,
    size: 10,
    font: sans,
    color: COLORS.faint,
  });
  y3 -= 34;

  drawLabel(page3, "Unlock", PAGE.marginX, y3, COLORS.accent);
  y3 -= 22;

  const teaserY = y3 - 200;
  const teaserWidth = (contentWidth - 20) / 2;
  page3.drawRectangle({
    x: PAGE.marginX,
    y: teaserY,
    width: teaserWidth,
    height: 188,
    color: COLORS.panel,
    borderColor: COLORS.line,
    borderWidth: 1,
  });
  drawLabel(page3, "Unlock full report", PAGE.marginX + 16, teaserY + 170, COLORS.accent);
  const unlockFit = fitBodyText(
    "Unlock the full report for competitor comparison, commercial impact scenarios, and the implementation playbook that shows what to do now, next, and then.",
    serif,
    teaserWidth - 32,
    92,
    14.6,
    12.2,
    1.32,
  );
  let unlockY = teaserY + 136;
  unlockFit.lines.forEach((line) => {
    page3.drawText(line, {
      x: PAGE.marginX + 16,
      y: unlockY,
      size: unlockFit.size,
      font: serif,
      color: COLORS.text,
    });
    unlockY -= unlockFit.lineHeight;
  });
  const linkText = "brandmirror.app";
  const linkY = teaserY + 44;
  page3.drawText(linkText, {
    x: PAGE.marginX + 16,
    y: linkY,
    size: 12.5,
    font: sansBold,
    color: posterBandColor,
  });
  page3.drawLine({
    start: { x: PAGE.marginX + 16, y: linkY - 2 },
    end: { x: PAGE.marginX + 16 + sansBold.widthOfTextAtSize(linkText, 12.5), y: linkY - 2 },
    thickness: 0.8,
    color: posterBandColor,
  });
  addExternalLink(
    page3,
    PAGE.marginX + 16,
    linkY - 2,
    sansBold.widthOfTextAtSize(linkText, 12.5),
    16,
    "https://brandmirror.app",
  );
  page3.drawText("$197 full report", {
    x: PAGE.marginX + 16,
    y: teaserY + 24,
    size: 10.5,
    font: sansBold,
    color: COLORS.text,
  });
  page3.drawText("Competitors · ROI · playbook · PDF", {
    x: PAGE.marginX + 16,
    y: teaserY + 8,
    size: 8.8,
    font: sans,
    color: COLORS.soft,
  });

  const fixX = PAGE.marginX + teaserWidth + 20;
  page3.drawRectangle({
    x: fixX,
    y: teaserY,
    width: teaserWidth,
    height: 188,
    color: COLORS.panel,
    borderColor: COLORS.line,
    borderWidth: 1,
  });
  drawLabel(page3, "Fix stack", fixX + 16, teaserY + 170, COLORS.accent);
  [
    { label: "FIX NOW", color: rgb(224/255,122/255,95/255) },
    { label: "FIX NEXT", color: COLORS.warn },
    { label: "KEEP", color: COLORS.accent },
  ].forEach((row, idx) => {
    const yy = teaserY + 130 - idx * 38;
    page3.drawRectangle({ x: fixX + 16, y: yy, width: 104, height: 28, color: rgb(row.color.red * 0.18, row.color.green * 0.18, row.color.blue * 0.18) });
    page3.drawText(row.label, { x: fixX + 30, y: yy + 9, size: 9.2, font: sansBold, color: row.color });
    for (let i = 0; i < 3; i += 1) {
      const barX = fixX + 132 + i * 34;
      page3.drawLine({
        start: { x: barX, y: yy + 14 },
        end: { x: barX + 18, y: yy + 14 },
        thickness: 6,
        color: rgb(row.color.red * 0.24, row.color.green * 0.24, row.color.blue * 0.24),
      });
    }
  });
  page3.drawText("Unlock full report — $197", {
    x: fixX + 18,
    y: teaserY + 26,
    size: 10,
    font: sansBold,
    color: COLORS.text,
  });
  page3.drawText("brandmirror.app", {
    x: fixX + 18,
    y: teaserY + 10,
    size: 9.8,
    font: sansBold,
    color: COLORS.accent,
  });
  addExternalLink(
    page3,
    fixX + 18,
    teaserY + 22,
    sansBold.widthOfTextAtSize("Unlock full report — $197", 10),
    16,
    "https://brandmirror.app",
  );
  addExternalLink(
    page3,
    fixX + 18,
    teaserY + 8,
    sansBold.widthOfTextAtSize("brandmirror.app", 9.8),
    14,
    "https://brandmirror.app",
  );
  page3.drawText("Powered by SAHAR / saharstudio.com", {
    x: PAGE.width / 2 - sans.widthOfTextAtSize("Powered by SAHAR / saharstudio.com", 9.5) / 2,
    y: 24,
    size: 9.5,
    font: sans,
    color: COLORS.faint,
  });

  if (websiteImage) {
    const page4 = addPage();
    let y4 = PAGE.height - PAGE.marginY;

    drawLabel(page4, "BrandMirror / Free First Read", PAGE.marginX, y4);
    page4.drawText(safeUrl, {
      x: PAGE.width - PAGE.marginX - sans.widthOfTextAtSize(safeUrl, 10),
      y: y4,
      size: 10,
      font: sans,
      color: COLORS.faint,
    });
    y4 -= 34;

    drawLabel(page4, "Website surface", PAGE.marginX, y4);
    y4 -= 22;
    y4 = drawWrapped(
      page4,
      "A live above-the-fold capture of the homepage BrandMirror is diagnosing.",
      serifBold,
      18,
      PAGE.marginX,
      y4,
      contentWidth,
      COLORS.text,
      22,
    );
    y4 -= 16;

    const imageBoxHeight = 456;
    page4.drawRectangle({
      x: PAGE.marginX,
      y: y4 - imageBoxHeight,
      width: contentWidth,
      height: imageBoxHeight,
      color: COLORS.panel,
    });

    const targetWidth = contentWidth;
    const scale = Math.min(targetWidth / websiteImage.width, imageBoxHeight / websiteImage.height);
    const imageWidth = websiteImage.width * scale;
    const imageHeight = websiteImage.height * scale;
    const imageX = PAGE.marginX + (targetWidth - imageWidth) / 2;
    const imageY = y4 - imageBoxHeight + (imageBoxHeight - imageHeight) / 2;

    page4.drawImage(websiteImage, {
      x: imageX,
      y: imageY,
      width: imageWidth,
      height: imageHeight,
    });

    const noteY = y4 - imageBoxHeight - 26;
    drawLabel(page4, "Why this matters", PAGE.marginX, noteY, COLORS.accent);
    drawWrapped(
      page4,
      "This screenshot lets the free read show the exact visual surface a first-time visitor sees before the deeper diagnosis, ROI calculator, competitor comparison, and implementation playbook in the full report.",
      sans,
      11.1,
      PAGE.marginX,
      noteY - 20,
      contentWidth,
      COLORS.soft,
      17,
    );

    page4.drawText("Powered by SAHAR / saharstudio.com", {
      x: PAGE.width / 2 - sans.widthOfTextAtSize("Powered by SAHAR / saharstudio.com", 9.5) / 2,
      y: 24,
      size: 9.5,
      font: sans,
      color: COLORS.faint,
    });
  }

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

    const websiteCapture = await captureWebsiteSurface(payload.url).catch(() => null);

    const pdf = await renderBrandReadPdf(
      payload.result,
      payload.url,
      websiteCapture?.dataUrl,
    );

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
