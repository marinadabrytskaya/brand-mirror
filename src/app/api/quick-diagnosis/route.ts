import { NextResponse } from "next/server";
import { generateBrandReport } from "@/lib/brand-report";
import { getSiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { savePaidReport } from "@/lib/supabase";
import { verifyPromoToken } from "@/lib/promo";
import { canAccessBrandMirrorProduct } from "@/lib/products";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      sessionId?: string;
      reference?: string;
      promoToken?: string;
    };
    const language = getSiteLocale(body.language);
    const promoAccess = verifyPromoToken(body.promoToken);
    const paystackAccess = isPaystackConfigured()
      ? await getPaystackCheckoutAccess(body.reference)
      : null;
    const stripeAccess =
      !paystackAccess && isStripeConfigured()
        ? await getPaidCheckoutAccess(body.sessionId)
        : null;
    const paidAccess = paystackAccess || stripeAccess || promoAccess;

    if ((isPaystackConfigured() || isStripeConfigured()) && !paidAccess) {
      return NextResponse.json(
        {
          error: "Quick Diagnosis is locked until payment is confirmed.",
          detail: "Complete checkout to unlock the $67 BrandMirror Quick Diagnosis.",
        },
        { status: 403 },
      );
    }

    if (paidAccess && !canAccessBrandMirrorProduct(paidAccess.product, "quick_diagnosis")) {
      return NextResponse.json(
        {
          error: "Quick Diagnosis is locked for this checkout.",
          detail: "This checkout does not unlock BrandMirror Quick Diagnosis.",
        },
        { status: 403 },
      );
    }

    const provider = paystackAccess ? "paystack" : stripeAccess ? "stripe" : promoAccess ? "promo" : null;
    const paymentReference =
      paystackAccess?.reference || stripeAccess?.sessionId || promoAccess?.reference || null;
    const paidEmail = paidAccess?.customerEmail || null;
    const paidLocale = paidAccess?.locale || language;

    const report = await generateBrandReport(
      paidAccess?.reportUrl || body.url || "",
      paidLocale,
    );

    if (provider && paymentReference && paidEmail) {
      await savePaidReport({
        email: paidEmail,
        url: report.url,
        locale: paidLocale,
        provider,
        paymentReference,
        amountTotal: paidAccess?.amountTotal ?? null,
        currency: paidAccess?.currency ?? null,
        report,
        emailStatus: "skipped",
        emailError: "quick_diagnosis_no_pdf",
        dataProcessingConsent: paidAccess?.dataProcessingConsent ?? false,
        marketingConsent: paidAccess?.marketingConsent ?? false,
      }).catch((saveError) => {
        console.warn("Unable to save quick diagnosis", saveError);
      });
    }

    return NextResponse.json({
      ok: true,
      report,
      delivery: {
        emailStatus: "skipped",
        emailError: "quick_diagnosis_no_pdf",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to generate the BrandMirror Quick Diagnosis right now.",
        detail:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the quick diagnosis.",
      },
      { status: 500 },
    );
  }
}
