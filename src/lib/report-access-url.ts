import { type SiteLocale } from "@/lib/site-i18n";

export function buildReportAccessUrl({
  origin,
  product,
  locale,
  reference,
  sessionId,
  promoToken,
}: {
  origin: string;
  product?: "quick_diagnosis" | "full_report" | null;
  locale: SiteLocale;
  reference?: string | null;
  sessionId?: string | null;
  promoToken?: string | null;
}) {
  const url = new URL("/my-report", origin);
  url.searchParams.set("lang", locale);
  if (product) url.searchParams.set("product", product);
  if (reference) url.searchParams.set("reference", reference);
  if (sessionId) url.searchParams.set("session_id", sessionId);
  if (promoToken) url.searchParams.set("promo_token", promoToken);
  return url.toString();
}

