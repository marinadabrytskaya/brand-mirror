import {
  type BrandReport,
  generateBrandReport,
  generateBrandReportPdf,
} from "@/lib/brand-report";
import { normalizeUrl } from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { verifyPromoToken } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function parseRequestBody(request: Request): Promise<{
  url?: string;
  language?: string;
  report?: BrandReport;
  sessionId?: string;
  reference?: string;
  promoToken?: string;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      report?: BrandReport;
      sessionId?: string;
      reference?: string;
      promoToken?: string;
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData().catch(() => null);
    if (!form) return {};

    const rawUrl = form.get("url");
    const rawLanguage = form.get("language");
    const rawReport = form.get("report");
    const rawSessionId = form.get("sessionId");
    const rawReference = form.get("reference");
    const rawPromoToken = form.get("promoToken");

    return {
      url: typeof rawUrl === "string" ? rawUrl : undefined,
      language: typeof rawLanguage === "string" ? rawLanguage : undefined,
      report:
        typeof rawReport === "string" && rawReport.trim()
          ? (JSON.parse(rawReport) as BrandReport)
          : undefined,
      sessionId: typeof rawSessionId === "string" ? rawSessionId : undefined,
      reference: typeof rawReference === "string" ? rawReference : undefined,
      promoToken: typeof rawPromoToken === "string" ? rawPromoToken : undefined,
    };
  }

  return {};
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestBody(request);
    const requestedLanguage = getSiteLocale(body.language);
    const promoAccess = verifyPromoToken(body.promoToken);
    const paystackAccess = isPaystackConfigured()
      ? await getPaystackCheckoutAccess(body.reference)
      : null;
    const stripeAccess =
      !paystackAccess && isStripeConfigured()
        ? await getPaidCheckoutAccess(body.sessionId)
        : null;
    const paidAccess = paystackAccess || stripeAccess || promoAccess;

    if (!paidAccess) {
      return new Response(
        JSON.stringify({
          error: "Full report PDF is locked until payment is confirmed.",
          detail: "Complete checkout or use a valid promo code before exporting the full report PDF.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    const paidUrl = normalizeUrl(paidAccess.reportUrl);
    if (!paidUrl) {
      return new Response(
        JSON.stringify({
          error: "Full report PDF could not be exported.",
          detail: "The paid checkout did not include a valid report URL.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }
    const providedReportUrl = normalizeUrl(body.report?.url || body.url || "");
    const report =
      body.report && body.report.url && providedReportUrl && providedReportUrl === paidUrl
        ? body.report
        : await generateBrandReport(paidUrl, paidAccess.locale || requestedLanguage);
    const language = paidAccess.locale || requestedLanguage;
    const pdf = await generateBrandReportPdf(report, language);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-report.pdf"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unable to export the BrandMirror PDF right now.",
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
