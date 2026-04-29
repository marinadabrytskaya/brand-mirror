import { NextResponse } from "next/server";
import { generateBrandReport, generateBrandReportPdf } from "@/lib/brand-report";
import { getSiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { getStoredPaidReport, savePaidReport } from "@/lib/supabase";
import { isReportEmailConfigured, sendBrandReportEmail } from "@/lib/report-email";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      sessionId?: string;
      reference?: string;
    };
    const language = getSiteLocale(body.language);
    const paystackAccess = isPaystackConfigured()
      ? await getPaystackCheckoutAccess(body.reference)
      : null;
    const stripeAccess =
      !paystackAccess && isStripeConfigured()
        ? await getPaidCheckoutAccess(body.sessionId)
        : null;
    const paidAccess = paystackAccess || stripeAccess;

    if ((isPaystackConfigured() || isStripeConfigured()) && !paidAccess) {
      return NextResponse.json(
        {
          error: "Full report is locked until payment is confirmed.",
          detail: "Complete checkout to unlock the paid BrandMirror report.",
        },
        { status: 403 },
      );
    }

    const provider = paystackAccess ? "paystack" : stripeAccess ? "stripe" : null;
    const paymentReference = paystackAccess?.reference || stripeAccess?.sessionId || null;
    const paidEmail = paidAccess?.customerEmail || null;
    const paidLocale = paidAccess?.locale || language;

    if (paymentReference) {
      const stored = await getStoredPaidReport(paymentReference).catch((storeError) => {
        console.warn("Unable to read stored paid report", storeError);
        return null;
      });
      if (stored?.report) {
        return NextResponse.json({
          ok: true,
          report: stored.report,
          delivery: {
            emailStatus: stored.emailStatus,
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
      }).catch((saveError) => {
        console.warn("Unable to save paid report before email", saveError);
      });

      const delivery = isReportEmailConfigured()
        ? await generateBrandReportPdf(report, paidLocale)
            .then((pdf) => sendBrandReportEmail({ to: paidEmail, report, locale: paidLocale, pdf }))
            .catch((emailSendError) => ({
              status: "failed" as const,
              error:
                emailSendError instanceof Error
                  ? emailSendError.message
                  : "Unable to email the report.",
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
      }).catch((saveError) => {
        console.warn("Unable to save paid report after email", saveError);
      });
    }

    return NextResponse.json({
      ok: true,
      report,
      delivery: {
        emailStatus,
        emailError,
      },
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
