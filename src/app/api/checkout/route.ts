import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getSiteLocale } from "@/lib/site-i18n";
import { createPaystackCheckout, isPaystackConfigured, REPORT_PRICE_ZAR_CENTS } from "@/lib/paystack";
import { normalizeCustomerEmail } from "@/lib/customer-email";
import { applyPromoDiscount, createPromoToken, getPromoDiscount } from "@/lib/promo";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      email?: string;
      promoCode?: string;
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
    const promoDiscount = getPromoDiscount(body.promoCode);
    if (body.promoCode && !promoDiscount) {
      return NextResponse.json(
        {
          error: "Promo code is not valid.",
          detail: "Check the promo code and try again.",
        },
        { status: 400 },
      );
    }

    const discountedAmount = applyPromoDiscount(REPORT_PRICE_ZAR_CENTS, promoDiscount);
    if (promoDiscount && (promoDiscount.percentOff === 100 || discountedAmount === 0)) {
      const promoToken = createPromoToken({
        reportUrl: body.url || "",
        locale,
        email,
        promoCode: promoDiscount.code,
      });

      return NextResponse.json({
        ok: true,
        provider: "promo",
        checkoutUrl: `${request.nextUrl.origin}/full-report?promo_token=${encodeURIComponent(promoToken)}&lang=${locale}`,
        promoCode: promoDiscount.code,
        discountPercent: promoDiscount.percentOff,
      });
    }

    if (!isPaystackConfigured() && !isStripeConfigured()) {
      return NextResponse.json(
        {
          error: "Checkout is not configured yet.",
          detail: "Add PAYSTACK_SECRET_KEY before opening checkout.",
        },
        { status: 503 },
      );
    }

    if (isPaystackConfigured()) {
      const checkout = await createPaystackCheckout({
        origin: request.nextUrl.origin,
        reportUrl: body.url || "",
        locale,
        email,
        amount: discountedAmount,
        promoCode: promoDiscount?.code,
        discountPercent: promoDiscount?.percentOff,
      });

      return NextResponse.json({
        ok: true,
        provider: "paystack",
        checkoutUrl: checkout.checkoutUrl,
        reference: checkout.reference,
        promoCode: promoDiscount?.code ?? null,
        discountPercent: promoDiscount?.percentOff ?? 0,
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
