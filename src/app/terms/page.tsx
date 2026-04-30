import type { Metadata } from "next";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import { legalPageCopy } from "@/lib/legal-pages";
import siteI18n from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "Terms & Refund Policy",
  description:
    "BrandMirror terms, paid report scope, use of reports, and refund policy for the $197 full report.",
  alternates: {
    canonical: "/terms",
  },
};

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = siteI18n.getSiteLocale(params.lang);
  const copy = legalPageCopy[locale].terms;

  return (
    <main className="page-shell homepage-shell min-h-screen bg-[color:var(--background)] px-6 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="editorial-rule flex flex-col gap-5 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={siteI18n.withLang("/", locale)}
              className="font-serif text-2xl tracking-[-0.04em] text-[color:var(--foreground)]"
            >
              BrandMirror
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.26em] text-[color:var(--foreground-soft)]">
              {copy.eyebrow}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={siteI18n.withLang("/privacy", locale)}
              className="rounded-full border border-[color:var(--line-strong)] px-4 py-2 text-sm text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
            >
              {legalPageCopy[locale].privacy.title}
            </Link>
            <LanguageSwitcher locale={locale} />
          </div>
        </header>

        <section className="py-16 sm:py-20">
          <p className="section-label">{copy.updated}</p>
          <h1 className="mt-5 max-w-3xl font-serif text-[clamp(3.2rem,8vw,6.8rem)] leading-[0.9] tracking-[-0.06em] text-[color:var(--foreground)]">
            {copy.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[color:var(--foreground-soft)]">
            {copy.intro}
          </p>
        </section>

        <section className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {copy.sections.map((section) => (
            <article
              key={section.title}
              className="grid gap-6 py-8 md:grid-cols-[0.34fr_0.66fr]"
            >
              <h2 className="font-serif text-3xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                {section.title}
              </h2>
              <div className="space-y-5 text-base leading-8 text-[color:var(--foreground-soft)]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <footer className="flex flex-col gap-4 py-10 text-sm text-[color:var(--foreground-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.contact}</p>
          <Link
            href={siteI18n.withLang("/", locale)}
            className="text-[color:var(--foreground)] hover:text-[#6FE0C2]"
          >
            {copy.back}
          </Link>
        </footer>
      </div>
    </main>
  );
}
