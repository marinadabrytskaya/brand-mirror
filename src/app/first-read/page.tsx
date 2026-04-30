import type { Metadata } from "next";
import FirstReadExperience from "@/components/first-read-experience";
import siteI18n from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "Free AI Brand Audit",
  description:
    "Run a free BrandMirror first read to see your positioning, AI visibility, offer clarity, visual trust, and conversion readiness.",
  alternates: {
    canonical: "/first-read",
  },
};

export default async function FirstReadPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = siteI18n.getSiteLocale(params.lang);

  return <FirstReadExperience locale={locale} />;
}
