import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getSiteLocale } from "@/lib/site-i18n";
import { createPaystackCheckout, isPaystackConfigured } from "@/lib/paystack";
import { normalizeCustomerEmail } from "@/lib/customer-email";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!isPaystackConfigured() && !isStripeConfigured()) {
      return NextResponse.json(
        {
          error: "Checkout is not configured yet.",
          detail: "Add PAYSTACK_SECRET_KEY before opening checkout.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      email?: string;
    };
    const locale = getSiteLocale(body.language);
    const email = normalizeCustomerEmail(body.email);
    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required before checkout.",
          detail: "Enter a valid email address so we can deliver the report.",
        },
        { status: 400 },
      );
    }

    if (isPaystackConfigured()) {
      const checkout = await createPaystackCheckout({
        origin: request.nextUrl.origin,
        reportUrl: body.url || "",
        locale,
        email,
      });

      return NextResponse.json({
        ok: true,
        provider: "paystack",
        checkoutUrl: checkout.checkoutUrl,
        reference: checkout.reference,
      });
    }

    const session = await createCheckoutSession({
      origin: request.nextUrl.origin,
      reportUrl: body.url || "",
      locale,
    });

    return NextResponse.json({
      ok: true,
      provider: "stripe",
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to open checkout right now.",
        detail:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating checkout.",
      },
      { status: 500 },
    );
  }
}
