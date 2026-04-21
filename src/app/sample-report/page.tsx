import type { Metadata } from "next";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import { getSiteLocale, siteCopy, withLang } from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "Sample Report",
  description: "Preview the BrandMirror diagnostic output experience.",
};

export default async function SampleReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = getSiteLocale(params.lang);
  const copy = siteCopy[locale].sample;

  return (
    <main className="page-shell report-shell min-h-screen bg-[color:var(--background)] px-6 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[86rem]">
        <header className="editorial-rule flex flex-col gap-6 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={withLang("/", locale)}
              className="text-sm uppercase tracking-[0.22em] text-[color:var(--foreground-soft)] hover:text-[color:var(--foreground)]"
            >
              {copy.back}
            </Link>
            <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.05em] text-[color:var(--foreground)] sm:text-7xl">
              {copy.title}
            </h1>
          </div>
          <div className="max-w-sm">
            <div className="mb-4 flex justify-end sm:mb-6">
              <LanguageSwitcher locale={locale} />
            </div>
            <p className="section-label">{copy.mockClientLabel}</p>
            <p className="mt-3 text-base leading-7 text-[color:var(--foreground-soft)]">
              {copy.mockClientBody}
            </p>
          </div>
        </header>

        <section className="grid gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
          <div className="ink-panel rounded-[2rem] border border-[rgba(243,236,223,0.14)] p-6 sm:p-8">
            <p className="section-label">{copy.summaryLabel}</p>
            <p className="mt-5 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#f6efe2]">
              {copy.summaryTitle}
            </p>
            <p className="mt-6 max-w-xl text-base leading-7 text-[rgba(243,236,223,0.74)]">
              {copy.summaryBody}
            </p>
          </div>

          <div className="editorial-rule grid gap-5 border-[rgba(243,236,223,0.12)] pt-2">
            {copy.scoreRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-3 border-b border-[rgba(243,236,223,0.12)] pb-5 sm:grid-cols-[1fr_4.5rem_1fr]"
              >
                <p className="text-sm uppercase tracking-[0.18em] text-[rgba(243,236,223,0.58)]">
                  {row.label}
                </p>
                <p className="font-serif text-5xl leading-none tracking-[-0.06em] text-[#a8bddf]">
                  {row.score}
                </p>
                <p className="text-sm leading-6 text-[rgba(243,236,223,0.72)]">
                  {row.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-12 pb-10 lg:grid-cols-[0.38fr_0.62fr]">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <p className="section-label">{copy.structureLabel}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#f6efe2]">
              {copy.structureTitle}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-[rgba(243,236,223,0.72)]">
              {copy.structureBody}
            </p>
          </div>

          <div className="space-y-8">
            {copy.sections.map((section) => (
              <article
                key={section.label}
                className="ink-panel rounded-[2rem] border border-[rgba(243,236,223,0.14)] p-6 sm:p-8"
              >
                <p className="section-label text-[rgba(243,236,223,0.58)]">{section.label}</p>
                <h3 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#f6efe2]">
                  {section.title}
                </h3>
                <p className="mt-5 text-base leading-7 text-[rgba(243,236,223,0.72)]">
                  {section.body}
                </p>
                <div className="editorial-rule mt-6 border-[rgba(243,236,223,0.12)] pt-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgba(243,236,223,0.58)]">
                    {copy.recommendedMove}
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#f6efe2]">
                    {section.recommendation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 pb-10 pt-6 lg:grid-cols-2 lg:pt-10">
          <div className="ink-panel rounded-[2rem] border border-[rgba(243,236,223,0.14)] p-6 sm:p-8">
            <p className="section-label text-[rgba(243,236,223,0.6)]">
              {copy.frictionLabel}
            </p>
            <div className="editorial-rule mt-5 space-y-4 pt-5">
              {copy.frictionMap.map((item) => (
                <p
                  key={item}
                  className="border-b border-[rgba(243,236,223,0.12)] pb-4 text-sm leading-7 text-[rgba(243,236,223,0.74)] last:border-b-0 last:pb-0"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="ink-panel rounded-[2rem] border border-[rgba(243,236,223,0.14)] p-6 sm:p-8">
            <p className="section-label">{copy.actionsLabel}</p>
            <div className="editorial-rule mt-5 space-y-4 border-[rgba(243,236,223,0.12)] pt-5">
              {copy.nextMoves.map((item) => (
                <p
                  key={item}
                  className="border-b border-[rgba(243,236,223,0.12)] pb-4 text-sm leading-7 text-[rgba(243,236,223,0.72)] last:border-b-0 last:pb-0"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-8 pt-6 lg:pb-14">
          <div className="editorial-rule grid gap-6 border-[rgba(243,236,223,0.12)] pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <p className="section-label">{copy.closingLabel}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#f6efe2] sm:text-5xl">
                {copy.closingTitle}
              </h2>
            </div>
            <div>
              <p className="text-base leading-7 text-[rgba(243,236,223,0.72)]">
                {copy.closingBody}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={withLang("/#offers", locale)}
                  className="inline-flex items-center justify-center rounded-full bg-[rgba(233,239,248,0.96)] px-6 py-3 text-sm font-medium text-[#151b28] shadow-[0_14px_34px_rgba(5,7,12,0.24)] hover:-translate-y-0.5 hover:bg-[rgba(244,247,252,0.98)]"
                >
                  {copy.primaryCta}
                </Link>
                <Link
                  href={withLang("/", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-[rgba(243,236,223,0.18)] px-6 py-3 text-sm font-medium text-[#f6efe2] hover:bg-[rgba(255,255,255,0.06)]"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
