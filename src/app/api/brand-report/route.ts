import { NextResponse } from "next/server";
import { generateBrandReport } from "@/lib/brand-report";
import { getSiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      sessionId?: string;
    };
    const language = getSiteLocale(body.language);
    const paidAccess = isStripeConfigured()
      ? await getPaidCheckoutAccess(body.sessionId)
      : null;

    if (isStripeConfigured() && !paidAccess) {
      return NextResponse.json(
        {
          error: "Full report is locked until payment is confirmed.",
          detail: "Complete checkout to unlock the paid BrandMirror report.",
        },
        { status: 403 },
      );
    }

    const report = await generateBrandReport(
      paidAccess?.reportUrl || body.url || "",
      language,
    );

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
