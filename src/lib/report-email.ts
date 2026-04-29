import "server-only";

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
  if (!isReportEmailConfigured()) {
    return { status: "skipped", reason: "not_configured" };
  }

  const filename = `${report.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-report.pdf`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REPORT_EMAIL_FROM,
      to,
      bcc: process.env.REPORT_EMAIL_BCC ? [process.env.REPORT_EMAIL_BCC] : undefined,
      subject: subjectFor(report, locale),
      html: htmlFor(report, locale),
      attachments: [
        {
          filename,
          content: pdf.toString("base64"),
        },
      ],
    }),
  });

  const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
  if (!response.ok) {
    return {
      status: "failed",
      error: payload?.message || "Report email provider rejected the message.",
    };
  }

  return { status: "sent", id: payload?.id || null };
}
