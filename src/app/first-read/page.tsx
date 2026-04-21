import type { Metadata } from "next";
import FirstReadExperience from "@/components/first-read-experience";
import siteI18n from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "First Read",
  description: "Generate the free BrandMirror first-read experience.",
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
