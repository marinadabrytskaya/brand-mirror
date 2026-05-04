import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getSiteLocale } from "@/lib/site-i18n";
import { createPaystackCheckout, getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { normalizeCustomerEmail } from "@/lib/customer-email";
import { hasDataProcessingConsent, hasMarketingConsent } from "@/lib/customer-consent";
import { applyPromoDiscount, createPromoToken, getPromoDiscount } from "@/lib/promo";
import {
  FULL_REPORT_PRODUCT,
  getBrandMirrorProduct,
  getBrandMirrorProductConfig,
  QUICK_DIAGNOSIS_PRODUCT,
  QUICK_TO_FULL_UPGRADE_USD_CENTS,
  QUICK_TO_FULL_UPGRADE_ZAR_CENTS,
} from "@/lib/products";
import { normalizeUrl } from "@/lib/brand-read";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function getQuickDiagnosisUpgradeCredit({
  product,
  reportUrl,
  email,
  upgradeReference,
  upgradeSessionId,
}: {
  product: ReturnType<typeof getBrandMirrorProduct>;
  reportUrl?: string;
  email: string;
  upgradeReference?: string | null;
  upgradeSessionId?: string | null;
}) {
  if (product !== FULL_REPORT_PRODUCT || (!upgradeReference && !upgradeSessionId)) {
    return null;
  }

  const normalizedUrl = normalizeUrl(reportUrl || "");
  const access = upgradeReference
    ? await getPaystackCheckoutAccess(upgradeReference)
    : await getPaidCheckoutAccess(upgradeSessionId);

  if (!access || access.product !== QUICK_DIAGNOSIS_PRODUCT) {
    throw new Error("Quick Diagnosis credit could not be verified.");
  }

  const accessEmail = normalizeCustomerEmail(access.customerEmail || "");
  if (!accessEmail || accessEmail !== email) {
    throw new Error("Use the same email address from your Quick Diagnosis purchase to apply the credit.");
  }

  if (!normalizedUrl || access.reportUrl !== normalizedUrl) {
    throw new Error("Quick Diagnosis credit can only be applied to the same website URL.");
  }

  return {
    usdCents: QUICK_TO_FULL_UPGRADE_USD_CENTS,
    zarCents: QUICK_TO_FULL_UPGRADE_ZAR_CENTS,
    originalUsdCreditCents: getBrandMirrorProductConfig(QUICK_DIAGNOSIS_PRODUCT).usdCents,
    originalZarCreditCents: getBrandMirrorProductConfig(QUICK_DIAGNOSIS_PRODUCT).zarCents,
    upgradeFromReference: upgradeReference || null,
    upgradeFromSessionId: upgradeSessionId || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      email?: string;
      promoCode?: string;
      product?: string;
      upgradeReference?: string;
      upgradeSessionId?: string;
      dataProcessingConsent?: boolean;
      marketingConsent?: boolean;
    };
    const locale = getSiteLocale(body.language);
    const product = getBrandMirrorProduct(body.product);
    const productConfig = getBrandMirrorProductConfig(product);
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
    const dataProcessingConsent = hasDataProcessingConsent(body.dataProcessingConsent);
    const marketingConsent = hasMarketingConsent(body.marketingConsent);
    if (!dataProcessingConsent) {
      return NextResponse.json(
        {
          error: "Data processing consent is required before checkout.",
          detail: "Please agree to data processing so we can generate and deliver your report.",
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

    const upgradeCredit = await getQuickDiagnosisUpgradeCredit({
      product,
      reportUrl: body.url,
      email,
      upgradeReference: body.upgradeReference,
      upgradeSessionId: body.upgradeSessionId,
    });
    const baseZarAmount = upgradeCredit?.zarCents ?? productConfig.zarCents;
    const baseUsdAmount = upgradeCredit?.usdCents ?? productConfig.usdCents;
    const discountedAmount = applyPromoDiscount(baseZarAmount, promoDiscount);
    const discountedUsdAmount = applyPromoDiscount(baseUsdAmount, promoDiscount);
    if (promoDiscount && (promoDiscount.percentOff === 100 || discountedAmount === 0)) {
      const promoToken = createPromoToken({
        reportUrl: body.url || "",
        locale,
        email,
        promoCode: promoDiscount.code,
        product,
        dataProcessingConsent,
        marketingConsent,
      });

      return NextResponse.json({
        ok: true,
        provider: "promo",
        checkoutUrl: `${request.nextUrl.origin}${productConfig.successPath}?promo_token=${encodeURIComponent(promoToken)}&lang=${locale}`,
        product,
        promoCode: promoDiscount.code,
        discountPercent: promoDiscount.percentOff,
        quickDiagnosisCredit: upgradeCredit?.originalUsdCreditCents ?? 0,
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
        product,
        promoCode: promoDiscount?.code,
        discountPercent: promoDiscount?.percentOff,
        quickDiagnosisCredit: upgradeCredit?.originalZarCreditCents,
        upgradeFromReference: upgradeCredit?.upgradeFromReference,
        upgradeFromSessionId: upgradeCredit?.upgradeFromSessionId,
        dataProcessingConsent,
        marketingConsent,
      });

      return NextResponse.json({
        ok: true,
        provider: "paystack",
        checkoutUrl: checkout.checkoutUrl,
        reference: checkout.reference,
        product,
        promoCode: promoDiscount?.code ?? null,
        discountPercent: promoDiscount?.percentOff ?? 0,
        quickDiagnosisCredit: upgradeCredit?.originalUsdCreditCents ?? 0,
      });
    }

    const session = await createCheckoutSession({
      origin: request.nextUrl.origin,
      reportUrl: body.url || "",
      locale,
      email,
      product,
      amountUsdCents: discountedUsdAmount,
      quickDiagnosisCredit: upgradeCredit?.originalUsdCreditCents,
      upgradeFromReference: upgradeCredit?.upgradeFromReference,
      upgradeFromSessionId: upgradeCredit?.upgradeFromSessionId,
      dataProcessingConsent,
      marketingConsent,
    });

    return NextResponse.json({
      ok: true,
      provider: "stripe",
      checkoutUrl: session.url,
      sessionId: session.id,
      product,
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
