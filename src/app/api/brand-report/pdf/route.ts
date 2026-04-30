import {
  type BrandReport,
  generateBrandReport,
  generateBrandReportPdf,
  generateBrandReportPreviewFromRead,
} from "@/lib/brand-report";
import { type BrandReadResult } from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function parseRequestBody(request: Request): Promise<{
  url?: string;
  language?: string;
  report?: BrandReport;
  readResult?: BrandReadResult;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      report?: BrandReport;
      readResult?: BrandReadResult;
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData().catch(() => null);
    if (!form) return {};

    const rawUrl = form.get("url");
    const rawLanguage = form.get("language");
    const rawReport = form.get("report");
    const rawReadResult = form.get("readResult");

    return {
      url: typeof rawUrl === "string" ? rawUrl : undefined,
      language: typeof rawLanguage === "string" ? rawLanguage : undefined,
      report:
        typeof rawReport === "string" && rawReport.trim()
          ? (JSON.parse(rawReport) as BrandReport)
          : undefined,
      readResult:
        typeof rawReadResult === "string" && rawReadResult.trim()
          ? (JSON.parse(rawReadResult) as BrandReadResult)
          : undefined,
    };
  }

  return {};
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestBody(request);
    const language = getSiteLocale(body.language);
    const report =
      body.report && body.report.url
        ? body.report
        : body.readResult && body.url
          ? await generateBrandReportPreviewFromRead(body.url, body.readResult)
          : await generateBrandReport(body.url || "", language);
    const pdf = await generateBrandReportPdf(report, language);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-report.pdf"`,
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
