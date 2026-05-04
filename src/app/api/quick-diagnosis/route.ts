import { NextResponse } from "next/server";
import { generateBrandReport } from "@/lib/brand-report";
import { getSiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { getStoredPaidReport, savePaidReport } from "@/lib/supabase";
import { isReportEmailConfigured, sendQuickDiagnosisEmail } from "@/lib/report-email";
import { verifyPromoToken } from "@/lib/promo";
import { canAccessBrandMirrorProduct } from "@/lib/products";
import { buildReportAccessUrl } from "@/lib/report-access-url";
import { generateQuickDiagnosisPdf } from "@/lib/quick-diagnosis-pdf";

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
    const origin = new URL(request.url).origin;
    const reportAccessUrl = buildReportAccessUrl({
      origin,
      product: "quick_diagnosis",
      locale: paidLocale,
      reference: paystackAccess?.reference || null,
      sessionId: stripeAccess?.sessionId || null,
      promoToken: body.promoToken || null,
    });
    const fullReportUrl = new URL("/first-read", origin);
    fullReportUrl.searchParams.set("product", "full_report");
    fullReportUrl.searchParams.set("lang", paidLocale);
    fullReportUrl.searchParams.set("url", paidAccess?.reportUrl || body.url || "");
    if (paidEmail) fullReportUrl.searchParams.set("email", paidEmail);
    if (paystackAccess?.reference) {
      fullReportUrl.searchParams.set("upgrade_reference", paystackAccess.reference);
    }
    if (stripeAccess?.sessionId) {
      fullReportUrl.searchParams.set("upgrade_session_id", stripeAccess.sessionId);
    }

    if (paymentReference) {
      const stored = await getStoredPaidReport(paymentReference).catch((storedError) => {
        console.warn("Unable to load stored quick diagnosis", storedError);
        return null;
      });
      if (stored?.report) {
        return NextResponse.json({
          ok: true,
          report: stored.report,
          accessUrl: reportAccessUrl,
          delivery: {
            emailStatus: stored.emailStatus || "skipped",
            emailError: stored.emailError,
          },
        });
      }
    }

    const report = await generateBrandReport(
      paidAccess?.reportUrl || body.url || "",
      paidLocale,
    );
    let emailStatus: "pending" | "sent" | "skipped" | "failed" = "skipped";
    let emailError: string | null = null;

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
        emailStatus: "pending",
        dataProcessingConsent: paidAccess?.dataProcessingConsent ?? false,
        marketingConsent: paidAccess?.marketingConsent ?? false,
      }).catch((saveError) => {
        console.warn("Unable to save quick diagnosis", saveError);
      });

      const delivery = isReportEmailConfigured()
        ? await generateQuickDiagnosisPdf(report, paidLocale)
            .then((pdf) =>
              sendQuickDiagnosisEmail({
                to: paidEmail,
                report,
                locale: paidLocale,
                reportUrl: reportAccessUrl,
                fullReportUrl: fullReportUrl.toString(),
                pdf,
              }),
            )
            .catch((emailSendError) => ({
              status: "failed" as const,
              error:
                emailSendError instanceof Error
                  ? emailSendError.message
                  : "Unable to email the quick diagnosis.",
            }))
        : { status: "skipped" as const, reason: "not_configured" as const };

      emailStatus = delivery.status;
      emailError =
        delivery.status === "failed"
          ? delivery.error
          : delivery.status === "skipped"
            ? delivery.reason
            : null;

      await savePaidReport({
        email: paidEmail,
        url: report.url,
        locale: paidLocale,
        provider,
        paymentReference,
        amountTotal: paidAccess?.amountTotal ?? null,
        currency: paidAccess?.currency ?? null,
        report,
        emailStatus,
        emailError,
        dataProcessingConsent: paidAccess?.dataProcessingConsent ?? false,
        marketingConsent: paidAccess?.marketingConsent ?? false,
      }).catch((saveError) => {
        console.warn("Unable to save quick diagnosis email status", saveError);
      });
    }

    return NextResponse.json({
      ok: true,
      report,
      accessUrl: reportAccessUrl,
      delivery: {
        emailStatus,
        emailError,
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
