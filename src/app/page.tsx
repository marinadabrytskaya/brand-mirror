import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import siteI18n from "@/lib/site-i18n";

const heroScanRows = [
  { label: "Positioning", value: 72, status: "Stable", color: "#6FE0C2" },
  { label: "AI Visibility", value: 54, status: "Developing", color: "#F4B63F" },
  { label: "Visual", value: 75, status: "Stable", color: "#6FE0C2" },
  { label: "Offer", value: 64, status: "Developing", color: "#F4B63F" },
  { label: "Conversion", value: 72, status: "Stable", color: "#6FE0C2" },
];

function HeroLiveScan({ cta }: { cta: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(111,224,194,0.28)] bg-[#090A0D] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:p-7">
      <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#6FE0C2]/70" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#6FE0C2]/70" />

      <div className="flex items-center justify-between gap-4 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[rgba(237,237,242,0.42)]">
        <span>Live scan</span>
        <span>BrandMirror</span>
      </div>

      <div className="mt-8 text-center">
        <p className="font-sans text-[clamp(2rem,5vw,3.7rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-[#F4F5F8]">
          your first read
        </p>
        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.34em] text-[rgba(237,237,242,0.38)]">
          homepage / AI visibility / offer / conversion
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
        The buyer senses value. The offer still needs words AI can repeat.
      </p>

      <div className="mt-8 space-y-3">
        {heroScanRows.map((row) => (
          <div
            key={row.label}
            className="grid items-center gap-4 border-t border-[rgba(255,255,255,0.06)] pt-3"
            style={{ gridTemplateColumns: "118px minmax(150px,1fr) 52px 82px" }}
          >
            <span className="whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.24em] text-[rgba(237,237,242,0.52)]">
              {row.label}
            </span>
            <span className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <span
                className="block h-full rounded-full"
                style={{ width: `${row.value}%`, background: row.color }}
              />
            </span>
            <span
              className="text-right font-sans text-[2rem] font-semibold leading-none tabular-nums"
              style={{ color: row.color }}
            >
              {row.value}
            </span>
            <span
              className="text-left font-mono text-[0.48rem] uppercase tracking-[0.2em]"
              style={{ color: row.color }}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(255,255,255,0.1)] px-4 py-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[rgba(237,237,242,0.44)]">
          Free first read
        </span>
        <span className="text-sm font-medium text-[#6FE0C2]">{cta} →</span>
      </div>
    </div>
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

  return (
    <main className="page-shell homepage-shell bg-[color:var(--background)]">
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
              <LanguageSwitcher locale={locale} />
            </div>
          </header>

          <div className="grid flex-1 items-center gap-10 pb-4 pt-8 lg:grid-cols-[0.88fr_1.12fr] lg:pt-8">
            <div className="max-w-xl">
              <p className="section-label soft-fade-up">{copy.kicker}</p>
              <p className="soft-fade-up mt-4 font-serif text-[clamp(4.2rem,12vw,8rem)] leading-[0.88] tracking-[-0.06em] text-[color:var(--foreground)]">
                BrandMirror
              </p>
              <h1 className="soft-fade-up-delay mt-6 max-w-xl font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[color:var(--foreground)] sm:text-5xl lg:text-6xl">
                {copy.title}
              </h1>
              <p className="soft-fade-up-slow mt-6 max-w-xl text-base leading-7 text-[color:var(--foreground-soft)] sm:text-lg">
                {copy.body}
              </p>
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

            <div className="soft-fade-up-slow relative">
              <Link
                href={siteI18n.withLang("/first-read", locale)}
                className="block transition duration-500 hover:-translate-y-1"
                aria-label={copy.primaryCta}
              >
                <HeroLiveScan cta={copy.primaryCta} />
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
            <div className="editorial-rule mt-10 space-y-5 pt-6">
              {copy.how.notes.map((item) => (
                <p key={item} className="text-base leading-7 text-[color:var(--foreground-soft)]">
                  {item}
                </p>
              ))}
            </div>
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

          <div className="ink-panel rounded-[2.25rem] border border-[rgba(243,236,223,0.14)] p-6 sm:p-8 lg:p-10">
            <p className="section-label text-[rgba(243,236,223,0.56)]">
              {copy.fullReport.cardLabel}
            </p>
            <div className="editorial-rule mt-6 space-y-4 pt-6">
              {copy.fullReport.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-6 border-b border-[rgba(243,236,223,0.12)] pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgba(243,236,223,0.7)]">
                    {item}
                  </p>
                  <span className="text-xs uppercase tracking-[0.22em] text-[rgba(243,236,223,0.48)]">
                    {copy.fullReport.included}
                  </span>
                </div>
              ))}
            </div>
            <div className="editorial-rule mt-8 grid gap-4 pt-5 text-sm text-[rgba(243,236,223,0.7)] sm:grid-cols-2">
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
            {copy.offers.rows.map((offer) => (
              <div
                key={offer.name}
                className="grid gap-5 border-b border-[color:var(--line)] py-8 md:grid-cols-[1.1fr_9rem_1.35fr]"
              >
                <div>
                  <h3 className="font-serif text-4xl leading-none tracking-[-0.04em] text-[color:var(--foreground)]">
                    {offer.name}
                  </h3>
                  <p className="mt-3 text-sm uppercase tracking-[0.22em] text-[color:var(--foreground-soft)]">
                    {copy.offers.layer}
                  </p>
                </div>
                <p className="font-serif text-5xl leading-none tracking-[-0.06em] text-[color:var(--accent)]">
                  {offer.price}
                </p>
                <div>
                  <p className="text-base leading-7 text-[color:var(--foreground-soft)]">
                    {offer.summary}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-soft)]">
                    {offer.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={siteI18n.withLang("/first-read", locale)}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-medium text-[#f6f0e6] hover:-translate-y-0.5 hover:bg-[#24201c]"
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
        </div>
      </section>

      <section className="px-6 pb-16 pt-10 sm:px-8 lg:px-12 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="ink-panel rounded-[2.3rem] border border-[rgba(243,236,223,0.14)] px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
            <p className="section-label text-[rgba(243,236,223,0.6)]">
              {copy.final.label}
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[#f6efe2] sm:text-5xl lg:text-6xl">
                  {copy.final.title}
                </h2>
              </div>
              <div>
                <p className="text-base leading-7 text-[rgba(243,236,223,0.72)]">
                  {copy.final.body}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={siteI18n.withLang("/first-read", locale)}
                    className="inline-flex items-center justify-center rounded-full bg-[#f6efe2] px-6 py-3 text-sm font-medium text-[#1b1815] hover:-translate-y-0.5"
                  >
                    {copy.final.primaryCta}
                  </Link>
                  <Link
                    href={siteI18n.withLang("/sample-report", locale)}
                    className="inline-flex items-center justify-center rounded-full border border-[rgba(243,236,223,0.24)] px-6 py-3 text-sm font-medium text-[#f6efe2] hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    {copy.final.secondaryCta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
