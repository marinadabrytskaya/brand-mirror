import { NextResponse } from "next/server";
import { generateBrandReport } from "@/lib/brand-report";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
    };
    const report = await generateBrandReport(body.url || "", getSiteLocale(body.language));

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to generate the full BrandMirror report right now.",
        detail:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the report.",
      },
      { status: 500 },
    );
  }
}
