import "server-only";

import PDFDocument from "pdfkit";
import path from "node:path";
import { type BrandReport } from "@/lib/brand-report";
import { type SiteLocale } from "@/lib/site-i18n";
import { bandFor } from "@/lib/score-band";

const AXIS_BODY: Record<string, keyof BrandReport> = {
  "positioning clarity": "positioningRead",
  positioning: "positioningRead",
  "ai visibility": "toneCheck",
  "visual credibility": "visualIdentityRead",
  visual: "visualIdentityRead",
  "offer specificity": "aboveTheFold",
  offer: "aboveTheFold",
  "conversion readiness": "conversionRead",
  conversion: "conversionRead",
};

const PDF_COPY = {
  en: {
    eyebrow: "BRANDMIRROR QUICK DIAGNOSIS",
    score: "Overall readiness",
    evidence: "Website evidence",
    deepDives: "Top 3 commercial deep dives",
    ai: "AI visibility read",
    fixes: "Priority fix stack",
    fixNow: "Fix now",
    fixNext: "Fix next",
    keep: "Keep",
    saharLabel: "Want SAHAR to implement this?",
    saharBody:
      "SAHAR can turn these findings into visible changes: sharper positioning, clearer offer language, stronger AI visibility signals, website structure, proof, messaging, and CTA flow.",
    footer: "BrandMirror by SAHAR / saharstudio.com",
  },
  es: {
    eyebrow: "BRANDMIRROR QUICK DIAGNOSIS",
    score: "Preparación general",
    evidence: "Evidencia del sitio",
    deepDives: "Top 3 lecturas comerciales",
    ai: "Lectura de visibilidad en IA",
    fixes: "Prioridad de corrección",
    fixNow: "Corregir ahora",
    fixNext: "Corregir después",
    keep: "Mantener",
    saharLabel: "¿Quieres que SAHAR lo implemente?",
    saharBody:
      "SAHAR puede convertir estos hallazgos en cambios visibles: posicionamiento más claro, oferta más precisa, mejores señales para IA, estructura web, prueba, mensajes y flujo de CTA.",
    footer: "BrandMirror by SAHAR / saharstudio.com",
  },
  ru: {
    eyebrow: "BRANDMIRROR QUICK DIAGNOSIS",
    score: "Общая готовность",
    evidence: "Доказательства с сайта",
    deepDives: "Топ-3 коммерческих разбора",
    ai: "AI visibility read",
    fixes: "Priority fix stack",
    fixNow: "Исправить сейчас",
    fixNext: "Исправить дальше",
    keep: "Оставить",
    saharLabel: "Хотите, чтобы SAHAR это внедрил?",
    saharBody:
      "SAHAR может превратить эти выводы в видимые правки: более точное позиционирование, ясный offer, сильные AI visibility signals, структуру сайта, proof, messaging и CTA flow.",
    footer: "BrandMirror by SAHAR / saharstudio.com",
  },
} satisfies Record<SiteLocale, Record<string, string>>;

function topThreeDeepDives(report: BrandReport) {
  return [...report.scorecard]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => {
      const bodyKey = AXIS_BODY[item.label.toLowerCase()] || "positioningRead";
      return {
        ...item,
        body: String(report[bodyKey] || item.note || ""),
        band: bandFor(item.score),
      };
    });
}

function getEvidence(report: BrandReport) {
  return [
    ...report.screenshotCallouts.map((item) => ({
      title: item.title,
      body: item.body,
    })),
    ...report.surfaceCaptures.map((item) => ({
      title: item.label,
      body: item.note,
    })),
  ].slice(0, 4);
}

function normalizeHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  }
}

function truncate(value: string, max = 420) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1).trim()}…` : normalized;
}

export async function generateQuickDiagnosisPdf(
  report: BrandReport,
  language: SiteLocale = "en",
) {
  const copy = PDF_COPY[language] || PDF_COPY.en;
  const fontDir = path.join(process.cwd(), "src/assets/fonts");
  const overallScore = Math.round(
    report.scorecard.reduce((sum, item) => sum + item.score, 0) / Math.max(report.scorecard.length, 1),
  );
  const overallBand = bandFor(overallScore);
  const deepDives = topThreeDeepDives(report);
  const evidence = getEvidence(report);
  const aiVisibility = report.scorecard.find((item) => item.label.toLowerCase().includes("ai"));

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      autoFirstPage: false,
      size: "A4",
      margins: { top: 44, bottom: 44, left: 48, right: 48 },
      info: {
        Title: `${report.brandName} BrandMirror Quick Diagnosis`,
        Author: "BrandMirror",
        Subject: "BrandMirror Quick Diagnosis",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Sans", path.join(fontDir, "Arial.ttf"));
    doc.registerFont("SansBold", path.join(fontDir, "Arial.ttf"));
    doc.registerFont("Serif", path.join(fontDir, "Times New Roman.ttf"));
    doc.registerFont("SerifBold", path.join(fontDir, "Times New Roman Bold.ttf"));

    const colors = {
      dark: "#080A0E",
      panel: "#141820",
      rule: "#2B3342",
      text: "#F5F5F3",
      muted: "#B8BCC8",
      soft: "#8E95A3",
      mint: "#6FE0C2",
      amber: "#E8B04C",
      accent: "#D4C4DC",
    };
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const left = 48;
    const width = pageWidth - left * 2;

    function addPage() {
      doc.addPage();
      doc.rect(0, 0, pageWidth, pageHeight).fill(colors.dark);
      doc
        .strokeColor("rgba(111,224,194,0.22)")
        .lineWidth(0.8)
        .rect(28, 28, pageWidth - 56, pageHeight - 56)
        .stroke();
      doc.font("Sans").fontSize(8).fillColor(colors.soft).text(copy.footer, left, pageHeight - 34, {
        width,
        align: "center",
        characterSpacing: 1.4,
      });
      doc.y = 54;
    }

    function ensureSpace(height: number) {
      if (doc.y + height > pageHeight - 62) addPage();
    }

    function section(label: string) {
      ensureSpace(58);
      doc.moveDown(1.1);
      doc.strokeColor(colors.rule).lineWidth(0.8).moveTo(left, doc.y).lineTo(left + width, doc.y).stroke();
      doc.moveDown(1.2);
      doc.font("Sans").fontSize(8.5).fillColor(colors.mint).text(label.toUpperCase(), {
        characterSpacing: 2.4,
      });
      doc.moveDown(0.6);
    }

    function paragraph(text: string, options: { size?: number; color?: string; width?: number } = {}) {
      doc
        .font("Sans")
        .fontSize(options.size || 10.2)
        .fillColor(options.color || colors.muted)
        .text(truncate(text), {
          width: options.width || width,
          lineGap: 4,
        });
    }

    function bullet(text: string, bulletColor = colors.mint) {
      ensureSpace(40);
      const y = doc.y + 5;
      doc.circle(left + 4, y, 2).fill(bulletColor);
      doc.x = left + 16;
      paragraph(text, { width: width - 16 });
      doc.x = left;
      doc.moveDown(0.35);
    }

    addPage();
    doc.font("Sans").fontSize(8.5).fillColor(colors.mint).text(copy.eyebrow, {
      characterSpacing: 2.6,
      align: "center",
    });
    doc.moveDown(1.1);
    doc.font("SerifBold").fontSize(44).fillColor(colors.text).text(report.brandName, {
      width,
      align: "center",
      lineGap: -4,
    });
    doc.moveDown(0.2);
    doc.font("Sans").fontSize(9).fillColor(colors.soft).text(normalizeHost(report.url).toUpperCase(), {
      width,
      align: "center",
      characterSpacing: 1.4,
    });
    doc.moveDown(1.8);
    doc.font("SerifBold").fontSize(56).fillColor(overallBand.color).text(String(overallScore), {
      width,
      align: "center",
    });
    doc.font("Sans").fontSize(9).fillColor(colors.muted).text("/ 100", {
      width,
      align: "center",
    });
    doc.moveDown(0.4);
    doc.font("Sans").fontSize(9).fillColor(overallBand.color).text(overallBand.label, {
      width,
      align: "center",
      characterSpacing: 2.2,
    });
    doc.moveDown(1.5);
    doc.font("Serif").fontSize(16).fillColor(colors.text).text(report.tagline, {
      width,
      align: "center",
      lineGap: 4,
    });

    section(copy.score);
    report.scorecard.forEach((item) => {
      const band = bandFor(item.score);
      ensureSpace(34);
      const y = doc.y;
      doc.font("Sans").fontSize(9).fillColor(colors.text).text(item.label.toUpperCase(), left, y, {
        width: 220,
        characterSpacing: 1.7,
      });
      doc.rect(left + 245, y + 5, 170, 4).fill("#27303D");
      doc.rect(left + 245, y + 5, Math.max(8, Math.min(170, item.score * 1.7)), 4).fill(band.color);
      doc.font("SerifBold").fontSize(22).fillColor(band.color).text(String(item.score), left + 430, y - 5, {
        width: 48,
        align: "right",
      });
      doc.y = y + 34;
    });

    section(copy.evidence);
    evidence.forEach((item) => {
      ensureSpace(64);
      doc.font("SerifBold").fontSize(14).fillColor(colors.text).text(item.title, { width });
      doc.moveDown(0.25);
      paragraph(item.body);
      doc.moveDown(0.4);
    });

    section(copy.deepDives);
    deepDives.forEach((item) => {
      ensureSpace(96);
      doc.font("Sans").fontSize(8.5).fillColor(item.band.color).text(`${item.label.toUpperCase()} / ${item.score}`, {
        characterSpacing: 1.8,
      });
      doc.moveDown(0.25);
      doc.font("SerifBold").fontSize(16).fillColor(colors.text).text(truncate(item.note, 150), { width });
      doc.moveDown(0.25);
      paragraph(item.body, { size: 9.8 });
      doc.moveDown(0.65);
    });

    section(copy.ai);
    if (aiVisibility) {
      doc.font("SerifBold").fontSize(30).fillColor(bandFor(aiVisibility.score).color).text(String(aiVisibility.score), {
        continued: true,
      });
      doc.font("Sans").fontSize(9).fillColor(colors.muted).text(" / 100");
      doc.moveDown(0.4);
    }
    paragraph(report.toneCheck);

    section(copy.fixes);
    [
      [copy.fixNow, report.priorityFixes.fixNow, colors.amber],
      [copy.fixNext, report.priorityFixes.fixNext, colors.mint],
      [copy.keep, report.priorityFixes.keep, colors.accent],
    ].forEach(([title, items, color]) => {
      ensureSpace(78);
      doc.font("Sans").fontSize(8.5).fillColor(color as string).text(String(title).toUpperCase(), {
        characterSpacing: 2,
      });
      doc.moveDown(0.4);
      (items as string[]).slice(0, 3).forEach((item) => bullet(item, color as string));
    });

    section(copy.saharLabel);
    paragraph(copy.saharBody);

    doc.end();
  });
}
