import type { Metadata } from "next";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import { getSiteLocale, siteCopy, withLang } from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "Sample Report",
  description: "Preview the BrandMirror diagnostic output experience.",
};

const sampleScores = [
  { label: "Positioning", value: 72, status: "Stable", color: "#6FE0C2" },
  { label: "AI Visibility", value: 70, status: "Stable", color: "#6FE0C2" },
  { label: "Visual", value: 88, status: "Leading", color: "#6FE0C2" },
  { label: "Offer", value: 64, status: "Developing", color: "#F4B63F" },
  { label: "Conversion", value: 72, status: "Stable", color: "#6FE0C2" },
];

const sampleFindings = [
  {
    label: "Current state",
    title: "The symptom is visible. The commercial cost needs naming.",
    body:
      "Nera Studio already feels controlled, premium, and visually intentional. The leak is not taste. It is that atmosphere leads too long before the offer becomes commercially explicit.",
  },
  {
    label: "Strongest signal",
    title: "The visual system is already earning trust.",
    body:
      "Typography, pacing, palette, and restraint create a high-end read before the copy has to defend it. The full report protects that strength instead of flattening it.",
  },
  {
    label: "Main friction",
    title: "The buyer understands the mood before the business reason.",
    body:
      "The page creates desire, but it asks buyers to infer what changes for them. The first fix is to name the transformation without damaging the premium restraint.",
  },
];

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

function SampleGauge() {
  return (
    <svg viewBox="0 0 260 160" width="260" height="160" aria-hidden>
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
        fontWeight="650"
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
  );
}

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
      <div className="mx-auto max-w-7xl">
        <header className="editorial-rule flex flex-col gap-5 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={withLang("/", locale)}
              className="font-mono text-xs uppercase tracking-[0.24em] text-[color:var(--foreground-soft)] hover:text-[color:var(--foreground)]"
            >
              {copy.back}
            </Link>
            <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.06em] text-[color:var(--foreground)] sm:text-7xl">
              Nera Studio sample read
            </h1>
          </div>
          <div className="flex items-end justify-between gap-5 sm:block">
            <div className="mb-0 sm:mb-5">
              <LanguageSwitcher locale={locale} />
            </div>
            <p className="max-w-sm text-sm leading-6 text-[color:var(--foreground-soft)]">
              A real-feeling preview of the free read and the paid diagnostic style.
            </p>
          </div>
        </header>

        <section className="grid gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-14">
          <div>
            <p className="section-label">Sample client</p>
            <h2 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.05em] text-[color:var(--foreground)] sm:text-6xl">
              A premium brand with a visible signal and a soft commercial edge.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--foreground-soft)]">
              This is the kind of output a visitor should see when they ask for a sample: score,
              friction, what is working, and the shape of the fix.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(111,224,194,0.28)] bg-[#090A0D] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:p-7">
            <ScanCornerMarks />
            <div className="flex items-center justify-between gap-4 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[rgba(237,237,242,0.42)]">
              <span>Live scan</span>
              <span>BrandMirror</span>
            </div>
            <div className="mt-8 text-center">
              <p className="font-sans text-[clamp(2.4rem,5vw,4.4rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-[#F4F5F8]">
                nera studio
              </p>
              <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.34em] text-[rgba(237,237,242,0.38)]">
                sample report / brandmirror.app
              </p>
            </div>
            <div className="mt-7 flex justify-center">
              <SampleGauge />
            </div>
            <p className="mx-auto mt-1 max-w-md text-center font-serif text-xl italic leading-snug text-[rgba(244,245,248,0.9)]">
              The visual trust is there. The commercial promise still arrives late.
            </p>
            <div className="mt-8 space-y-3">
              {sampleScores.map((row) => (
                <div
                  key={row.label}
                  className="grid items-center gap-4 border-t border-[rgba(255,255,255,0.06)] pt-3"
                  style={{ gridTemplateColumns: "124px minmax(128px,1fr) 112px" }}
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
                  <span className="flex items-baseline justify-end gap-2">
                    <span
                      className="font-sans text-4xl font-semibold leading-none tabular-nums"
                      style={{ color: row.color }}
                    >
                      {row.value}
                    </span>
                    <span
                      className="font-mono text-[0.56rem] uppercase tracking-[0.18em]"
                      style={{ color: row.color }}
                    >
                      {row.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 py-8 lg:grid-cols-3">
          {sampleFindings.map((finding) => (
            <article
              key={finding.label}
              className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(111,224,194,0.18)] bg-[#090A0D] p-6 sm:p-7"
            >
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#6FE0C2]">
                {finding.label}
              </p>
              <h3 className="mt-5 font-serif text-3xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                {finding.title}
              </h3>
              <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.72)]">
                {finding.body}
              </p>
            </article>
          ))}
        </section>

        <section className="py-10 lg:py-14">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-[rgba(111,224,194,0.24)] bg-[#090A0D] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:p-8 lg:p-10">
            <ScanCornerMarks />
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <p className="section-label text-[rgba(111,224,194,0.78)]">
                  Full report preview
                </p>
                <h2 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.05em] text-[#F4F5F8] sm:text-5xl">
                  The paid report turns the read into exact fixes.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-[rgba(237,237,242,0.7)]">
                  It names what to keep, what to fix first, what can wait, and what the
                  commercial upside looks like when the signal becomes easier to read.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  "Fix Now: the highest-impact blocker, named and solved.",
                  "Competitor comparison: where they are easier to understand.",
                  "Commercial impact: what can improve after the fixes land.",
                  "Implementation playbook: what to do now, next, and then.",
                ].map((item) => (
                  <div
                    key={item}
                    className="border-b border-[rgba(111,224,194,0.12)] pb-4 text-base leading-7 text-[rgba(237,237,242,0.78)] last:border-b-0 last:pb-0"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-10 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={withLang("/first-read", locale)}
              className="inline-flex items-center justify-center rounded-full bg-[#6FE0C2] px-6 py-3 text-sm font-semibold text-[#06110E] hover:-translate-y-0.5 hover:bg-[#84efd4]"
            >
              {copy.primaryCta}
            </Link>
            <Link
              href={withLang("/", locale)}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(111,224,194,0.28)] px-6 py-3 text-sm font-medium text-[#F4F5F8] hover:bg-[rgba(111,224,194,0.08)]"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
