import "server-only";

import { type BrandReadResult } from "@/lib/brand-read";
import { type BrandReport } from "@/lib/brand-report";
import { type SiteLocale } from "@/lib/site-i18n";

type ReportEmailResult =
  | { status: "skipped"; reason: "not_configured" }
  | { status: "sent"; id: string | null }
  | { status: "failed"; error: string };

export function isReportEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.REPORT_EMAIL_FROM);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function subjectFor(report: BrandReport, locale: SiteLocale) {
  if (locale === "ru") return `Ваш BrandMirror отчёт: ${report.brandName}`;
  if (locale === "es") return `Tu reporte BrandMirror: ${report.brandName}`;
  return `Your BrandMirror report: ${report.brandName}`;
}

function firstReadSubjectFor(result: BrandReadResult, locale: SiteLocale) {
  if (locale === "ru") return `Ваш бесплатный BrandMirror PDF: ${result.brandName}`;
  if (locale === "es") return `Tu PDF gratuito de BrandMirror: ${result.brandName}`;
  return `Your free BrandMirror PDF: ${result.brandName}`;
}

function htmlFor(report: BrandReport, locale: SiteLocale) {
  const intro =
    locale === "ru"
      ? "Ваш полный отчёт BrandMirror готов. PDF прикреплён к письму."
      : locale === "es"
        ? "Tu reporte completo de BrandMirror está listo. El PDF está adjunto."
        : "Your full BrandMirror report is ready. The PDF is attached.";

  const next =
    locale === "ru"
      ? "Первое, что стоит исправить:"
      : locale === "es"
        ? "Lo primero que conviene corregir:"
        : "The first thing to fix:";

  return `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.55;">
      <p>${intro}</p>
      <h1 style="font-size: 24px; margin: 24px 0 8px;">${escapeHtml(report.brandName)}</h1>
      <p style="margin: 0 0 18px; color: #555;">${escapeHtml(report.tagline)}</p>
      <p><strong>${next}</strong> ${escapeHtml(report.strategicNextMove)}</p>
      <p style="margin-top: 28px; color: #666;">BrandMirror by SAHAR</p>
    </div>
  `;
}

function firstReadHtmlFor(result: BrandReadResult, locale: SiteLocale, fullReportUrl: string) {
  const intro =
    locale === "ru"
      ? "Ваш бесплатный BrandMirror PDF готов. Он прикреплён к письму."
      : locale === "es"
        ? "Tu PDF gratuito de BrandMirror está listo. Está adjunto a este email."
        : "Your free BrandMirror PDF is ready. It is attached to this email.";

  const cta =
    locale === "ru"
      ? "Хотите полную версию? В неё входят 5 глубоких разборов, AI visibility audit, конкурентная разведка, commercial impact, priority fix stack и implementation playbook."
      : locale === "es"
        ? "¿Quieres la versión completa? Incluye 5 lecturas profundas, auditoría de visibilidad en IA, inteligencia competitiva, impacto comercial, pila de prioridades y playbook de implementación."
        : "Want the full version? It includes 5 deep dives, the AI visibility audit, competitor intelligence, commercial impact, priority fix stack, and the implementation playbook.";

  const button =
    locale === "ru"
      ? "Открыть полный отчёт за $197"
      : locale === "es"
        ? "Desbloquear el reporte completo por $197"
        : "Unlock the full report for $197";

  return `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.55;">
      <p>${intro}</p>
      <h1 style="font-size: 24px; margin: 24px 0 8px;">${escapeHtml(result.brandName)}</h1>
      <p style="margin: 0 0 18px; color: #555;">${escapeHtml(result.summary || result.title || "")}</p>
      <p>${escapeHtml(cta)}</p>
      <p style="margin: 24px 0;">
        <a href="${escapeHtml(fullReportUrl)}" style="background: #111; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 999px; display: inline-block;">
          ${escapeHtml(button)}
        </a>
      </p>
      <p style="margin-top: 28px; color: #666;">BrandMirror by SAHAR</p>
    </div>
  `;
}

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  filename: string;
  pdf: Buffer;
}): Promise<ReportEmailResult> {
  if (!isReportEmailConfigured()) {
    return { status: "skipped", reason: "not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REPORT_EMAIL_FROM,
      to: payload.to,
      bcc: process.env.REPORT_EMAIL_BCC ? [process.env.REPORT_EMAIL_BCC] : undefined,
      subject: payload.subject,
      html: payload.html,
      attachments: [
        {
          filename: payload.filename,
          content: payload.pdf.toString("base64"),
        },
      ],
    }),
  });

  const responsePayload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
  if (!response.ok) {
    return {
      status: "failed",
      error: responsePayload?.message || "Report email provider rejected the message.",
    };
  }

  return { status: "sent", id: responsePayload?.id || null };
}

export async function sendBrandReportEmail({
  to,
  report,
  locale,
  pdf,
}: {
  to: string;
  report: BrandReport;
  locale: SiteLocale;
  pdf: Buffer;
}): Promise<ReportEmailResult> {
  const filename = `${report.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-report.pdf`;
  return sendEmail({
    to,
    subject: subjectFor(report, locale),
    html: htmlFor(report, locale),
    filename,
    pdf,
  });
}

export async function sendBrandReadEmail({
  to,
  result,
  locale,
  pdf,
  fullReportUrl,
}: {
  to: string;
  result: BrandReadResult;
  locale: SiteLocale;
  pdf: Buffer;
  fullReportUrl: string;
}): Promise<ReportEmailResult> {
  const filename = `${result.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-first-read.pdf`;
  return sendEmail({
    to,
    subject: firstReadSubjectFor(result, locale),
    html: firstReadHtmlFor(result, locale, fullReportUrl),
    filename,
    pdf,
  });
}
