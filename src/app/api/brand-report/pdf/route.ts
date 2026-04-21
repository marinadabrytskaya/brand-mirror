import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  type BrandReport,
  generateBrandReport,
} from "@/lib/brand-report";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      report?: BrandReport;
    };
    const language = getSiteLocale(body.language);
    const report =
      body.report && body.report.url
        ? body.report
        : await generateBrandReport(body.url || "", language);
    const scriptPath = path.join(process.cwd(), "scripts", "render_brand_report_pdf.py");
    const pdf = execFileSync("python3", [scriptPath], {
      input: Buffer.from(JSON.stringify({ report, language }), "utf8"),
      maxBuffer: 20 * 1024 * 1024,
    });

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
