import type { Metadata } from "next";
import { Suspense } from "react";
import { normalizeUrl } from "@/lib/brand-read";
import { QuickDiagnosisExperience } from "@/components/quick-diagnosis-experience";
import { getSiteLocale, type SiteLocale } from "@/lib/site-i18n";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { verifyPromoToken } from "@/lib/promo";
import { canAccessBrandMirrorProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Private Quick Diagnosis",
  description: "Access a paid BrandMirror quick diagnosis.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function QuickDiagnosisFallback({ locale }: { locale: SiteLocale }) {
  const title =
    locale === "ru"
      ? "Quick Diagnosis загружается"
      : locale === "es"
        ? "Quick Diagnosis se está cargando"
        : "Quick Diagnosis is loading";

  return (
    <main className="page-shell report-shell min-h-screen bg-[color:var(--background)] px-6 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[86rem]">
        <div className="ink-panel rounded-[2rem] border border-[rgba(243,236,223,0.14)] p-8">
          <p className="section-label">BrandMirror</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#f6efe2]">
            {title}
          </h1>
        </div>
      </div>
    </main>
  );
}

export default async function QuickDiagnosisPage({
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
    if (canAccessBrandMirrorProduct(promoAccess.product, "quick_diagnosis")) {
      paidAccess = promoAccess;
    } else {
      accessError = "This checkout does not unlock Quick Diagnosis.";
    }
  } else if (promoToken) {
    accessError = "We couldn't verify payment for this Quick Diagnosis.";
  } else if (isPaystackConfigured() && reference) {
    try {
      paidAccess = await getPaystackCheckoutAccess(reference);
      if (!paidAccess) {
        accessError = "We couldn't verify payment for this Quick Diagnosis.";
      } else if (!canAccessBrandMirrorProduct(paidAccess.product, "quick_diagnosis")) {
        paidAccess = null;
        accessError = "This checkout does not unlock Quick Diagnosis.";
      }
    } catch (error) {
      accessError =
        error instanceof Error
          ? error.message
          : "We couldn't verify payment for this Quick Diagnosis.";
    }
  } else if (isStripeConfigured() && sessionId) {
    try {
      paidAccess = await getPaidCheckoutAccess(sessionId);
      if (!paidAccess) {
        accessError = "We couldn't verify payment for this Quick Diagnosis.";
      } else if (!canAccessBrandMirrorProduct(paidAccess.product, "quick_diagnosis")) {
        paidAccess = null;
        accessError = "This checkout does not unlock Quick Diagnosis.";
      }
    } catch (error) {
      accessError =
        error instanceof Error
          ? error.message
          : "We couldn't verify payment for this Quick Diagnosis.";
    }
  }

  return (
    <Suspense fallback={<QuickDiagnosisFallback locale={locale} />}>
      <QuickDiagnosisExperience
        locale={locale}
        initialUrl={paidAccess?.reportUrl || requestedUrl || ""}
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
