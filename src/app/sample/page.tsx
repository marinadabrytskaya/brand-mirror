import { redirect } from "next/navigation";
import siteI18n from "@/lib/site-i18n";

type SampleRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SampleRedirect({ searchParams }: SampleRedirectProps) {
  const params = await searchParams;
  const locale = siteI18n.getSiteLocale(params.lang);
  redirect(siteI18n.withLang("/sample-report", locale));
}
