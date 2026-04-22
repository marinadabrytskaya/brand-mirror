import {
  type BrandReport,
  generateBrandReport,
  generateBrandReportPdf,
  generateBrandReportPreviewFromRead,
} from "@/lib/brand-report";
import { type BrandReadResult } from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      report?: BrandReport;
      readResult?: BrandReadResult;
    };
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
