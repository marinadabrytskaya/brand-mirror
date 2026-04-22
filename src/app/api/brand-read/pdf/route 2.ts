import PDFDocument from "pdfkit";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type BrandReadResult,
  generateBrandRead,
} from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";
export const maxDuration = 60;

const require = createRequire(import.meta.url);

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror";
}

function localAssetPath(relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

function installPdfkitFontRedirect() {
  const pdfkitEntry = require.resolve("pdfkit/js/pdfkit.js");
  const actualDataDir = path.join(path.dirname(pdfkitEntry), "data");
  const cjsFs = require("fs") as typeof import("node:fs");
  const originalReadFileSync = cjsFs.readFileSync.bind(cjsFs);
  const shouldRedirectPdfkitDataPath = (value: string) =>
    value.includes("pdfkit/js/data/") ||
    value.includes("pdfkit\\js\\data\\") ||
    value.includes("[project]/node_modules/pdfkit/js/data/");

  cjsFs.readFileSync = ((file: import("node:fs").PathOrFileDescriptor, ...args: unknown[]) => {
    if (typeof file === "string" && shouldRedirectPdfkitDataPath(file)) {
      const redirected = path.join(actualDataDir, path.basename(file));
      return originalReadFileSync(redirected, ...(args as []));
    }

    return originalReadFileSync(file, ...(args as []));
  }) as typeof cjsFs.readFileSync;

  return () => {
    cjsFs.readFileSync = originalReadFileSync;
  };
}

function scoreRows(result: BrandReadResult) {
  return [
    ["Positioning clarity", result.positioningClarity],
    ["Offer specificity", result.offerSpecificity],
    ["AI discoverability", result.toneCoherence],
    ["Visual credibility", result.visualCredibility],
    ["Conversion readiness", result.conversionReadiness],
  ] as const;
}

async function renderBrandReadPdf(result: BrandReadResult, url: string) {
  const restorePdfkitFontRedirect = installPdfkitFontRedirect();

  const doc = new PDFDocument({
    size: "LETTER",
    margin: 54,
    info: {
      Title: `${result.brandName} - BrandMirror First Read`,
      Author: "BrandMirror",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const colors = {
    bg: "#07070A",
    panel: "#101014",
    text: "#F4F5F8",
    soft: "#C8CBD4",
    faint: "#7B7F89",
    line: "#24262C",
    accent: "#6FE0C2",
    warn: "#E8B04C",
  };

  const fonts = {
    sans: localAssetPath("../../../../assets/fonts/Arial.ttf"),
    serif: localAssetPath("../../../../assets/fonts/Times New Roman.ttf"),
    serifBold: localAssetPath("../../../../assets/fonts/Times New Roman Bold.ttf"),
  };

  const page = {
    width: doc.page.width,
    height: doc.page.height,
    left: 54,
    right: doc.page.width - 54,
    top: 54,
    bottom: doc.page.height - 54,
    contentWidth: doc.page.width - 108,
  };

  doc.registerFont("sans", fonts.sans);
  doc.registerFont("serif", fonts.serif);
  doc.registerFont("serif-bold", fonts.serifBold);
  doc.font("sans");

  let y = page.top;

  const drawBackground = () => {
    doc.save();
    doc.rect(0, 0, page.width, page.height).fill(colors.bg);
    doc.restore();
  };

  const addPage = () => {
    doc.addPage();
    doc.font("sans");
    drawBackground();
    y = page.top;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > page.bottom) {
      addPage();
    }
  };

  const drawSection = (label: string, body: string, tone = colors.text) => {
    if (!body) return;
    ensureSpace(90);
    doc
      .fillColor(colors.faint)
      .font("sans")
      .fontSize(10)
      .text(label.toUpperCase(), page.left, y, {
        width: page.contentWidth,
        characterSpacing: 3,
      });
    y += 22;
    doc
      .fillColor(tone)
      .font("sans")
      .fontSize(12.5)
      .text(body, page.left, y, {
        width: page.contentWidth,
        lineGap: 4,
      });
    y = doc.y + 24;
  };

  drawBackground();

  doc
    .fillColor(colors.faint)
    .font("sans")
    .fontSize(10)
    .text("BRANDMIRROR / FREE FIRST READ", page.left, y, {
      width: page.contentWidth,
      characterSpacing: 3,
    });

  doc
    .fillColor(colors.faint)
    .font("sans")
    .fontSize(10)
    .text(url, page.left, y, {
      width: page.contentWidth,
      align: "right",
    });

  y += 34;

  doc
    .fillColor(colors.text)
    .font("serif-bold")
    .fontSize(31)
    .text(result.brandName, page.left, y, {
      width: page.contentWidth,
    });

  y = doc.y + 6;

  doc
    .fillColor(colors.accent)
    .font("sans")
    .fontSize(11)
    .text(result.title, page.left, y, {
      width: page.contentWidth,
      characterSpacing: 1.2,
    });

  y = doc.y + 12;

  doc
    .fillColor(colors.soft)
    .font("serif")
    .fontSize(18)
    .text(result.tagline, page.left, y, {
      width: page.contentWidth,
      lineGap: 3,
    });

  y = doc.y + 26;

  doc
    .roundedRect(page.left, y, page.contentWidth, 104, 18)
    .fill(colors.panel);

  doc
    .fillColor(colors.faint)
    .font("sans")
    .fontSize(10)
    .text("POSTER SCORE", page.left + 24, y + 18, {
      width: 160,
      characterSpacing: 3,
    });

  doc
    .fillColor(colors.accent)
    .font("serif-bold")
    .fontSize(42)
    .text(String(result.posterScore), page.left + 24, y + 40, {
      width: 120,
    });

  doc
    .fillColor(colors.text)
    .font("sans")
    .fontSize(20)
    .text(result.scoreBand, page.left + 176, y + 42, {
      width: 180,
    });

  doc
    .fillColor(colors.soft)
    .font("sans")
    .fontSize(11.5)
    .text(result.scoreModifier, page.left + 176, y + 66, {
      width: page.contentWidth - 200,
      lineGap: 3,
    });

  y += 132;

  scoreRows(result).forEach(([label, value], index) => {
    const rowY = y + index * 28;
    doc
      .fillColor(colors.faint)
      .font("sans")
      .fontSize(10.5)
      .text(label.toUpperCase(), page.left, rowY, {
        width: 220,
        characterSpacing: 1.6,
      });
    doc
      .lineWidth(6)
      .strokeColor(colors.line)
      .moveTo(page.left + 230, rowY + 8)
      .lineTo(page.right - 70, rowY + 8)
      .stroke();
    doc
      .lineWidth(6)
      .strokeColor(colors.accent)
      .moveTo(page.left + 230, rowY + 8)
      .lineTo(page.left + 230 + ((page.contentWidth - 300) * value) / 100, rowY + 8)
      .stroke();
    doc
      .fillColor(colors.text)
      .font("sans")
      .fontSize(12)
      .text(String(value), page.right - 44, rowY, {
        width: 44,
        align: "right",
      });
  });

  y += 170;

  drawSection("What the company appears to do", result.whatItDoes);
  drawSection("First diagnosis", result.summary);
  drawSection("Current read", result.current);
  drawSection("Strongest signal", result.strongestSignal, colors.accent);
  drawSection("Main friction", result.mainFriction, colors.warn);
  drawSection("One next move", result.nextMove);
  drawSection("What already feels strong", result.strength);
  drawSection("What is missing", result.gap);
  drawSection("What feels out of sync", result.mismatch);
  drawSection("Tone read", result.voice);
  drawSection("Direction", result.direction);

  ensureSpace(40);
  doc
    .fillColor(colors.faint)
    .font("sans")
    .fontSize(9.5)
    .text("Powered by BrandMirror", page.left, page.bottom - 10, {
      width: page.contentWidth,
      align: "center",
      characterSpacing: 1.8,
    });

  doc.end();

  try {
    return await done;
  } finally {
    restorePdfkitFontRedirect();
  }
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
        "Content-Disposition": `attachment; filename="${slugify(payload.result.brandName)}-first-read.pdf"`,
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
