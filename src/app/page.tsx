import type { Metadata } from "next";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import { refundLineForLocale } from "@/lib/free-report-copy";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";
import siteI18n from "@/lib/site-i18n";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

function buildHomeStructuredData(
  faqItems: ReadonlyArray<{ question: string; answer: string }>,
) {
  return [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAHAR Studio",
    url: SITE_URL,
    brand: {
      "@type": "Brand",
      name: "BrandMirror",
      url: SITE_URL,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BrandMirror",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "BrandMirror is an AI brand audit for any homepage that needs to explain value and convert. It reads positioning, AI visibility, offer clarity, visual credibility, and conversion readiness.",
    offers: {
      "@type": "Offer",
      price: "197",
      priceCurrency: "USD",
      url: absoluteUrl("/first-read"),
      availability: "https://schema.org/InStock",
    },
    publisher: {
      "@type": "Organization",
      name: "SAHAR Studio",
      url: SITE_URL,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
  ];
}

const heroLiveScanCopy = {
  en: {
    status: "Live scan",
    title: "your first read",
    scope: "homepage / AI visibility / offer / conversion",
    quote: "The buyer senses value. The offer still needs words AI can repeat.",
    badge: "Free first read",
    rows: ["Positioning", "AI Visibility", "Visual", "Offer", "Conversion"],
  },
  es: {
    status: "Escaneo en vivo",
    title: "tu primera lectura",
    scope: "página principal / visibilidad en IA / oferta / conversión",
    quote: "El comprador percibe valor. La oferta aún necesita palabras que la IA pueda repetir.",
    badge: "Primera lectura gratis",
    rows: ["Posicionamiento", "Visibilidad en IA", "Visual", "Oferta", "Conversión"],
  },
  ru: {
    status: "Живое сканирование",
    title: "твой первый разбор",
    scope: "главная / видимость в ИИ / предложение / конверсия",
    quote: "Покупатель чувствует ценность. Предложению всё ещё нужны слова, которые ИИ сможет повторить.",
    badge: "Бесплатный первый разбор",
    rows: ["Позиционирование", "Видимость в ИИ", "Визуал", "Предложение", "Конверсия"],
  },
} as const;

const heroScanValues = [
  { value: 72, color: "#6FE0C2" },
  { value: 54, color: "#F4B63F" },
  { value: 75, color: "#6FE0C2" },
  { value: 64, color: "#F4B63F" },
  { value: 72, color: "#6FE0C2" },
];

function HeroLiveScan({ cta, locale }: { cta: string; locale: "en" | "es" | "ru" }) {
  const liveCopy = heroLiveScanCopy[locale];
  const rows = heroScanValues.map((row, index) => ({
    ...row,
    label: liveCopy.rows[index],
  }));
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(111,224,194,0.28)] bg-[#090A0D] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:p-7">
      <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#6FE0C2]/70" />

      <div className="flex items-center justify-between gap-4 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[rgba(237,237,242,0.42)]">
        <span>{liveCopy.status}</span>
        <span>BrandMirror</span>
      </div>

      <div className="mt-8 text-center">
        <p className="font-sans text-[clamp(2rem,5vw,3.7rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-[#F4F5F8]">
          {liveCopy.title}
        </p>
        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.34em] text-[rgba(237,237,242,0.38)]">
          {liveCopy.scope}
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <svg viewBox="0 0 260 160" width="238" height="148" aria-hidden>
          <path
            d="M 30 130 A 100 100 0 0 1 230 130"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeLinecap="round"
            strokeWidth="14"
          />
          <path
            d="M 30 130 A 100 100 0 0 1 230 130"
            fill="none"
            stroke="#F4B63F"
            strokeDasharray="214 420"
            strokeLinecap="round"
            strokeWidth="14"
          />
          <text
            x="130"
            y="100"
            fill="#F4B63F"
            fontSize="62"
            fontWeight="600"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
          >
            68
          </text>
          <text
            x="130"
            y="126"
            fill="rgba(237,237,242,0.58)"
            fontSize="11"
            letterSpacing="2"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
          >
            / 100
          </text>
        </svg>
      </div>

      <p className="mx-auto -mt-1 max-w-sm text-center font-serif text-xl italic leading-snug text-[rgba(244,245,248,0.9)]">
        {liveCopy.quote}
      </p>

      <div className="mt-8 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,6.9rem)_minmax(4rem,1fr)_3.5rem] items-center gap-3 border-t border-[rgba(255,255,255,0.06)] pt-3 sm:grid-cols-[150px_minmax(128px,1fr)_74px] sm:gap-4"
          >
            <span className="truncate font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[rgba(237,237,242,0.68)] sm:text-[0.82rem] sm:tracking-[0.15em]">
              {row.label}
            </span>
            <span className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <span
                className="block h-full rounded-full"
                style={{ width: `${row.value}%`, background: row.color }}
              />
            </span>
            <span
              className="text-right font-sans text-[2rem] font-semibold leading-none tabular-nums sm:text-[2.45rem]"
              style={{ color: row.color }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(255,255,255,0.1)] px-4 py-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[rgba(237,237,242,0.44)]">
          {liveCopy.badge}
        </span>
        <span className="text-sm font-medium text-[#6FE0C2]">{cta} →</span>
      </div>
    </div>
  );
}

function ScanCornerMarks() {
  return (
    <>
      <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#6FE0C2]/70" />
    </>
  );
}

function SectionHeading({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="section-label">{label}</p>
      <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--foreground-soft)] sm:text-lg">
        {body}
      </p>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = siteI18n.getSiteLocale(params.lang);
  const copy = siteI18n.siteCopy[locale].landing;
  const refundLine = refundLineForLocale(locale);
  const structuredData = buildHomeStructuredData(copy.faq.items);

  return (
    <main className="page-shell homepage-shell bg-[color:var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative min-h-[100svh] px-6 pb-10 pt-3 sm:px-8 lg:px-12">
        <div className="drift pointer-events-none absolute -left-24 top-36 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(123,154,161,0.24),_transparent_68%)] blur-2xl" />
        <div className="drift-delay pointer-events-none absolute right-0 top-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,_rgba(205,180,214,0.2),_transparent_62%)] blur-3xl" />
        <div className="mx-auto flex min-h-[calc(100svh-0.75rem)] max-w-7xl flex-col">
          <header className="editorial-rule flex items-center justify-between py-4">
            <div>
              <p className="font-serif text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">
                BrandMirror
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.26em] text-[color:var(--foreground-soft)]">
                {copy.brandPowered}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <nav className="hidden items-center gap-6 text-sm text-[color:var(--foreground-soft)] md:flex">
                <a href="#how-it-works" className="hover:text-[color:var(--foreground)]">
                  {copy.navHow}
                </a>
                <a href="#offers" className="hover:text-[color:var(--foreground)]">
                  {copy.navOffer}
                </a>
                <Link
                  href={siteI18n.withLang("/sample-report", locale)}
                  className="rounded-full border border-[color:var(--line-strong)] px-4 py-2 text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                >
                  {copy.navSample}
                </Link>
              </nav>
              <a
                href="https://saharstudio.com"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--foreground)] hover:bg-[color:var(--surface)] sm:px-4 sm:text-sm sm:normal-case sm:tracking-normal"
              >
                {copy.navSahar}
              </a>
              <LanguageSwitcher locale={locale} />
            </div>
          </header>

          <div className="grid flex-1 items-center gap-10 pb-4 pt-8 lg:grid-cols-[0.88fr_1.12fr] lg:pt-8">
            <div className="min-w-0 max-w-xl">
              <p className="section-label soft-fade-up">{copy.kicker}</p>
              <p className="soft-fade-up mt-4 max-w-[44rem] font-serif text-[clamp(3.3rem,8vw,6.4rem)] leading-[0.9] tracking-[-0.06em] text-[color:var(--foreground)]">
                BrandMirror
              </p>
              <h1 className="soft-fade-up-delay mt-6 max-w-xl font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[color:var(--foreground)] sm:text-5xl lg:text-6xl">
                {copy.title}
              </h1>
              <p className="soft-fade-up-slow mt-6 max-w-xl text-base leading-7 text-[color:var(--foreground-soft)] sm:text-lg">
                {copy.body}
              </p>
              <div className="soft-fade-up-slow mt-6 grid gap-3 border-y border-[color:var(--line)] py-5 sm:grid-cols-3">
                {copy.heroProofs.map((proof) => (
                  <p
                    key={proof}
                    className="text-sm font-medium leading-6 text-[color:var(--foreground-soft)]"
                  >
                    {proof}
                  </p>
                ))}
              </div>
              <div className="soft-fade-up-slow mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={siteI18n.withLang("/first-read", locale)}
                  className="inline-flex items-center justify-center rounded-full bg-[rgba(233,239,248,0.96)] px-6 py-3 text-sm font-medium text-[#151b28] shadow-[0_14px_34px_rgba(5,7,12,0.24)] hover:-translate-y-0.5 hover:bg-[rgba(244,247,252,0.98)]"
                >
                  {copy.primaryCta}
                </Link>
                <Link
                  href={siteI18n.withLang("/sample-report", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 py-3 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="soft-fade-up-slow relative min-w-0">
              <Link
                href={siteI18n.withLang("/first-read", locale)}
                className="block transition duration-500 hover:-translate-y-1"
                aria-label={copy.primaryCta}
              >
                <HeroLiveScan cta={copy.primaryCta} locale={locale} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label={copy.signalHeadingLabel}
            title={copy.signalHeadingTitle}
            body={copy.signalHeadingBody}
          />
          <div className="editorial-rule mt-14 grid gap-12 pt-8 lg:grid-cols-3">
            {copy.signalColumns.map((column) => (
              <div key={column.label} className="max-w-sm">
                <p className="section-label">{column.label}</p>
                <h3 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                  {column.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[color:var(--foreground-soft)]">
                  {column.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.46fr_0.54fr]">
          <div className="lg:sticky lg:top-12 lg:self-start">
            <SectionHeading
              label={copy.how.label}
              title={copy.how.title}
              body={copy.how.body}
            />
          </div>

          <div className="space-y-6">
            {copy.how.workflow.map((item) => (
              <div
                key={item.step}
                className="grain-panel rounded-[2rem] border border-[color:var(--line)] p-6 sm:p-8"
              >
                <div className="grid gap-4 sm:grid-cols-[4rem_1fr]">
                  <p className="font-serif text-6xl leading-none tracking-[-0.06em] text-[color:var(--accent)]">
                    {item.step}
                  </p>
                  <div>
                    <h3 className="font-serif text-3xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-base leading-7 text-[color:var(--foreground-soft)]">
                      {item.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.43fr_0.57fr]">
          <div>
            <SectionHeading
              label={copy.fullReport.label}
              title={copy.fullReport.title}
              body={copy.fullReport.body}
            />
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] border border-[rgba(111,224,194,0.24)] bg-[#090A0D] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:p-8 lg:p-10">
            <ScanCornerMarks />
            <p className="section-label text-[rgba(111,224,194,0.78)]">
              {copy.fullReport.cardLabel}
            </p>
            <div className="editorial-rule mt-6 space-y-4 pt-6">
              {copy.fullReport.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-6 border-b border-[rgba(111,224,194,0.12)] pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgba(244,245,248,0.76)]">
                    {item}
                  </p>
                  <span className="text-xs uppercase tracking-[0.22em] text-[rgba(111,224,194,0.72)]">
                    {copy.fullReport.included}
                  </span>
                </div>
              ))}
            </div>
            <div className="editorial-rule mt-8 grid gap-4 pt-5 text-sm text-[rgba(237,237,242,0.64)] sm:grid-cols-2">
              {copy.fullReport.notes.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="offers" className="px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
            <SectionHeading
              label={copy.offers.label}
              title={copy.offers.title}
              body={copy.offers.body}
            />
          <div className="editorial-rule mt-14 pt-2">
            {copy.offers.rows.map((offer) => {
              const isFixedPrice = offer.price.startsWith("$");

              return (
                <div
                  key={offer.name}
                  className="grid gap-5 border-b border-[color:var(--line)] py-8 md:grid-cols-[minmax(0,1.05fr)_minmax(7.5rem,10rem)_minmax(0,1.55fr)] md:gap-8 lg:gap-10"
                >
                  <div>
                    <h3 className="font-serif text-4xl leading-none tracking-[-0.04em] text-[color:var(--foreground)]">
                      {offer.name}
                    </h3>
                    <p className="mt-3 text-sm uppercase tracking-[0.22em] text-[color:var(--foreground-soft)]">
                      {offer.layer}
                    </p>
                  </div>
                  <p
                    className={`max-w-[10rem] font-serif leading-none tracking-[-0.04em] text-[color:var(--accent)] md:pr-4 ${
                      isFixedPrice ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
                    }`}
                  >
                    {offer.price}
                  </p>
                  <div>
                    <p className="text-base leading-7 text-[color:var(--foreground-soft)]">
                      {offer.summary}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-soft)]">
                      {offer.detail}
                    </p>
                    {"actionHref" in offer && offer.actionHref ? (
                      <a
                        href={offer.actionHref}
                        className="mt-5 inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-5 py-2.5 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                      >
                        {offer.actionLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={siteI18n.withLang("/first-read", locale)}
              className="inline-flex items-center justify-center rounded-full bg-[#6FE0C2] px-6 py-3 text-sm font-semibold text-[#06110E] shadow-[0_14px_34px_rgba(5,7,12,0.24)] hover:-translate-y-0.5 hover:bg-[#84efd4]"
            >
              {copy.offers.primaryCta}
            </Link>
            <Link
              href={siteI18n.withLang("/sample-report", locale)}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 py-3 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
            >
              {copy.offers.secondaryCta}
            </Link>
          </div>
          <p className="mt-4 text-sm font-medium text-[color:var(--foreground-soft)]">
            {refundLine}
          </p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.4fr_0.6fr]">
          <div>
            <SectionHeading
              label={copy.faq.label}
              title={copy.faq.title}
              body={copy.faq.body}
            />
          </div>

          <div className="editorial-rule divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {copy.faq.items.map((item) => (
              <div key={item.question} className="grid gap-4 py-6 sm:grid-cols-[0.48fr_0.52fr]">
                <h3 className="font-serif text-2xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                  {item.question}
                </h3>
                <p className="text-base leading-7 text-[color:var(--foreground-soft)]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 pt-10 sm:px-8 lg:px-12 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.3rem] border border-[rgba(111,224,194,0.24)] bg-[#090A0D] px-6 py-10 shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:px-8 lg:px-12 lg:py-14">
            <ScanCornerMarks />
            <p className="section-label text-[rgba(111,224,194,0.78)]">
              {copy.final.label}
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[#F4F5F8] sm:text-5xl lg:text-6xl">
                  {copy.final.title}
                </h2>
              </div>
              <div>
                <p className="text-base leading-7 text-[rgba(237,237,242,0.72)]">
                  {copy.final.body}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={siteI18n.withLang("/first-read", locale)}
                    className="inline-flex items-center justify-center rounded-full bg-[#6FE0C2] px-6 py-3 text-sm font-semibold text-[#06110E] hover:-translate-y-0.5 hover:bg-[#84efd4]"
                  >
                    {copy.final.primaryCta}
                  </Link>
                  <Link
                    href={siteI18n.withLang("/sample-report", locale)}
                    className="inline-flex items-center justify-center rounded-full border border-[rgba(111,224,194,0.28)] px-6 py-3 text-sm font-medium text-[#F4F5F8] hover:bg-[rgba(111,224,194,0.08)]"
                  >
                    {copy.final.secondaryCta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 pb-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[color:var(--line)] pt-6 text-xs uppercase tracking-[0.16em] text-[color:var(--foreground-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.legalLine}</p>
          <a
            href="https://saharstudio.com"
            className="text-[color:var(--foreground)] hover:text-[#6FE0C2]"
          >
            saharstudio.com
          </a>
        </div>
      </footer>
    </main>
  );
}
