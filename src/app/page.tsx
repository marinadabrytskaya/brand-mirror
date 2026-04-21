import Link from "next/link";
import DiagnosticEvidenceBoard from "@/components/diagnostic-evidence-board";
import LanguageSwitcher from "@/components/language-switcher";
import siteI18n from "@/lib/site-i18n";

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
  const heroPoster = locale === "ru" ? "/poster images/Sage2.png" : "/poster images/Creator2.png";
  const heroMarkers = {
    en: [
      {
        id: "hero-promise",
        label: "promise",
        title: "The offer reveals itself too late.",
        note: "The page looks premium immediately, but the commercial meaning arrives one beat behind.",
        x: 79,
        y: 14,
      },
    ],
    es: [
      {
        id: "hero-promise",
        label: "promesa",
        title: "La oferta se revela demasiado tarde.",
        note: "La página se siente premium rápido, pero el significado comercial llega un paso después.",
        x: 79,
        y: 14,
      },
    ],
    ru: [
      {
        id: "hero-promise",
        label: "обещание",
        title: "Оффер раскрывается слишком поздно.",
        note: "Страница быстро выглядит premium, но коммерческий смысл приходит на один шаг позже.",
        x: 79,
        y: 14,
      },
    ],
  }[locale];
  const heroPosterCopy = {
    en: {
      label: "Poster artifact",
      title: "The poster becomes part of the diagnosis.",
      body: "A shareable supporting visual built from the same read, not a decorative extra.",
      cue: "Shareable layer",
    },
    es: {
      label: "Artefacto póster",
      title: "El póster se vuelve parte del diagnóstico.",
      body: "Una capa visual compartible construida desde la misma lectura, no un extra decorativo.",
      cue: "Capa compartible",
    },
    ru: {
      label: "Постер-артефакт",
      title: "Постер становится частью диагноза.",
      body: "Поддерживающий визуальный слой, который рождается из того же анализа, а не работает как декор.",
      cue: "Слой для шеринга",
    },
  }[locale];

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

          <div className="grid flex-1 items-center gap-10 pb-4 pt-8 lg:grid-cols-[1.04fr_0.96fr] lg:pt-8">
            <div className="max-w-2xl">
              <p className="section-label soft-fade-up">{copy.kicker}</p>
              <p className="soft-fade-up mt-4 font-serif text-[clamp(4.5rem,15vw,8.8rem)] leading-[0.88] tracking-[-0.06em] text-[color:var(--foreground)]">
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
              <div className="editorial-rule mt-14 grid gap-6 pt-6 text-sm text-[color:var(--foreground-soft)] sm:grid-cols-3">
                {copy.heroProofs.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="soft-fade-up-slow relative lg:min-h-[42rem]">
              <div className="relative mx-auto max-w-[42rem] lg:ml-auto lg:mr-0">
                <DiagnosticEvidenceBoard
                  brandName="BrandMirror"
                  websiteLabel="diagnostic preview"
                  eyebrow={copy.evidence.eyebrow}
                  headline={copy.evidence.headline}
                  subheadline={copy.evidence.subheadline}
                  cta={copy.evidence.cta}
                  scores={copy.previewRows.map((row) => ({
                    label: row.title,
                    value: row.score,
                    note: row.copy,
                  }))}
                  markers={heroMarkers}
                  verdicts={[]}
                  className="homepage-board relative z-10"
                />
              </div>
              <div className="hero-artifact-strip grain-panel mt-5 overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)]">
                <div className="hero-artifact-poster">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPoster}
                    alt="BrandMirror poster artifact"
                    className="h-full w-full object-cover"
                  />
                  <div className="hero-artifact-overlay" />
                  <div className="hero-artifact-caption">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[rgba(236,233,244,0.62)]">
                      {heroPosterCopy.label}
                    </p>
                    <p className="mt-2 font-serif text-[1.35rem] leading-[0.98] tracking-[-0.04em] text-[#f3f1f7]">
                      {heroPosterCopy.title}
                    </p>
                  </div>
                </div>
                <div className="hero-artifact-copy">
                  <p className="section-label">{heroPosterCopy.cue}</p>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--foreground-soft)]">
                    {heroPosterCopy.body}
                  </p>
                </div>
              </div>
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
