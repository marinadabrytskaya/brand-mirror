import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: "Stripe checkout is not configured yet.",
          detail: "Add STRIPE_SECRET_KEY before opening checkout.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
    };

    const session = await createCheckoutSession({
      origin: request.nextUrl.origin,
      reportUrl: body.url || "",
      locale: getSiteLocale(body.language),
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to open Stripe checkout right now.",
        detail:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating checkout.",
      },
      { status: 500 },
    );
  }
}
