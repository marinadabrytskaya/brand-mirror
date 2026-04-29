import type { Metadata } from "next";
import { Suspense } from "react";
import { normalizeUrl } from "@/lib/brand-read";
import { FullReportExperience } from "@/components/full-report-experience";
import { getSiteLocale, siteCopy, type SiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { verifyPromoToken } from "@/lib/promo";

export const metadata: Metadata = {
  title: "Full Report",
  description: "Generate the full BrandMirror report and export it as PDF.",
};

function FullReportFallback({ locale }: { locale: SiteLocale }) {
  const copy = siteCopy[locale].fullReport;

  return (
    <main className="page-shell report-shell min-h-screen bg-[color:var(--background)] px-6 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[86rem]">
        <div className="ink-panel report-cover-card rounded-[2rem] border border-[rgba(243,236,223,0.14)] p-8">
          <p className="section-label">{copy.fallbackLabel}</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#f6efe2]">
            {copy.fallbackTitle}
          </h1>
        </div>
      </div>
    </main>
  );
}

export default async function FullReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = getSiteLocale(params.lang);
  const requestedUrl = normalizeUrl(
    Array.isArray(params.url) ? params.url[0] : params.url,
  );
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const reference = Array.isArray(params.reference)
    ? params.reference[0]
    : params.reference;
  const promoToken = Array.isArray(params.promo_token)
    ? params.promo_token[0]
    : params.promo_token;
  let paidAccess = null;
  let accessError = "";

  const promoAccess = verifyPromoToken(promoToken);

  if (promoAccess) {
    paidAccess = promoAccess;
  } else if (promoToken) {
    accessError =
      siteCopy[locale].fullReport.paymentVerifyError ||
      "We couldn't verify payment for this report.";
  } else if (isPaystackConfigured() && reference) {
    try {
      paidAccess = await getPaystackCheckoutAccess(reference);
      if (!paidAccess) {
        accessError =
          siteCopy[locale].fullReport.paymentVerifyError ||
          "We couldn't verify payment for this report.";
      }
    } catch (error) {
      accessError =
        error instanceof Error
          ? error.message
          : siteCopy[locale].fullReport.paymentVerifyError ||
            "We couldn't verify payment for this report.";
    }
  } else if (isStripeConfigured() && sessionId) {
    try {
      paidAccess = await getPaidCheckoutAccess(sessionId);
      if (!paidAccess) {
        accessError =
          siteCopy[locale].fullReport.paymentVerifyError ||
          "We couldn't verify payment for this report.";
      }
    } catch (error) {
      accessError =
        error instanceof Error
          ? error.message
          : siteCopy[locale].fullReport.paymentVerifyError ||
            "We couldn't verify payment for this report.";
    }
  }

  return (
    <Suspense fallback={<FullReportFallback locale={locale} />}>
      <FullReportExperience
        locale={locale}
        initialUrl={paidAccess?.reportUrl || requestedUrl || ""}
        paymentRequired={isPaystackConfigured() || isStripeConfigured()}
        paymentUnlocked={Boolean(paidAccess)}
        paymentSessionId={
          paidAccess && "sessionId" in paidAccess
            ? paidAccess.sessionId
            : paidAccess && "reference" in paidAccess
              ? paidAccess.reference
              : null
        }
        accessError={accessError}
      />
    </Suspense>
  );
}
