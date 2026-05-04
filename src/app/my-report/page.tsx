import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPaystackCheckoutAccess, isPaystackConfigured } from "@/lib/paystack";
import { getPaidCheckoutAccess, isStripeConfigured } from "@/lib/stripe";
import { getBrandMirrorProduct } from "@/lib/products";
import { verifyPromoToken } from "@/lib/promo";
import { getSiteLocale } from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "Open BrandMirror Report",
  description: "Return to your paid BrandMirror report.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function reportPathFor(product?: string | null) {
  return getBrandMirrorProduct(product) === "quick_diagnosis"
    ? "/quick-diagnosis"
    : "/full-report";
}

function buildRedirectUrl(path: string, params: URLSearchParams) {
  const nextParams = new URLSearchParams();
  for (const key of ["lang", "reference", "session_id", "promo_token"]) {
    const value = params.get(key);
    if (value) nextParams.set(key, value);
  }
  const query = nextParams.toString();
  return query ? `${path}?${query}` : path;
}

export default async function MyReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    const resolvedValue = Array.isArray(value) ? value[0] : value;
    if (resolvedValue) params.set(key, resolvedValue);
  }

  const locale = getSiteLocale(params.get("lang") ?? undefined);
  const promoToken = params.get("promo_token");
  const reference = params.get("reference");
  const sessionId = params.get("session_id");
  const requestedProduct = params.get("product");
  let product = requestedProduct;
  let accessVerified = false;

  const promoAccess = verifyPromoToken(promoToken);
  if (promoAccess) {
    product = promoAccess.product;
    accessVerified = true;
  } else if (isPaystackConfigured() && reference) {
    const access = await getPaystackCheckoutAccess(reference).catch(() => null);
    if (access) {
      product = access.product;
      accessVerified = true;
    }
  } else if (isStripeConfigured() && sessionId) {
    const access = await getPaidCheckoutAccess(sessionId).catch(() => null);
    if (access) {
      product = access.product;
      accessVerified = true;
    }
  }

  if (accessVerified) {
    redirect(buildRedirectUrl(reportPathFor(product), params));
  }

  const title =
    locale === "ru"
      ? "Не удалось открыть отчёт"
      : locale === "es"
        ? "No pudimos abrir el reporte"
        : "We couldn't open this report";
  const body =
    locale === "ru"
      ? "Ссылка не прошла проверку оплаты. Если оплата прошла, напишите нам на hello@saharstudio.com."
      : locale === "es"
        ? "El enlace no pasó la verificación de pago. Si el pago sí se realizó, escríbenos a hello@saharstudio.com."
        : "This access link could not be verified. If payment went through, email hello@saharstudio.com.";

  return (
    <main className="page-shell min-h-screen bg-[color:var(--background)] px-6 py-10 text-[color:var(--foreground)] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[color:var(--line)] bg-[rgba(255,255,255,0.02)] p-8">
        <p className="section-label">BrandMirror</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-7 text-[color:var(--foreground-soft)]">
          {body}
        </p>
        <Link
          href={`/${locale === "en" ? "" : `?lang=${locale}`}`}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-5 py-2.5 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
        >
          BrandMirror
        </Link>
      </div>
    </main>
  );
}
