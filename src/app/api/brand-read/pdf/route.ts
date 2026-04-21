import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  type BrandReadResult,
  generateBrandRead,
} from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";
export const maxDuration = 60;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror";
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

    const scriptPath = path.join(process.cwd(), "scripts", "render_first_read_pdf.py");
    const pdf = execFileSync("python3", [scriptPath], {
      input: Buffer.from(JSON.stringify({ ...payload, language }), "utf8"),
      maxBuffer: 10 * 1024 * 1024,
    });

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
