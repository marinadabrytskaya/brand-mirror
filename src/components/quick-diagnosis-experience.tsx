"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LanguageSwitcher from "@/components/language-switcher";
import { type BrandReport } from "@/lib/brand-report";
import { bandFor } from "@/lib/score-band";
import siteI18n, { type SiteLocale } from "@/lib/site-i18n";

type ReportResponse = {
  ok: boolean;
  report: BrandReport;
  accessUrl?: string;
  delivery?: {
    emailStatus?: "pending" | "sent" | "skipped" | "failed" | null;
    emailError?: string | null;
  };
};

type ErrorResponse = {
  error?: string;
  detail?: string;
};

const AXIS_BODY: Record<string, keyof BrandReport> = {
  "positioning clarity": "positioningRead",
  positioning: "positioningRead",
  "ai visibility": "toneCheck",
  "visual credibility": "visualIdentityRead",
  visual: "visualIdentityRead",
  "offer specificity": "aboveTheFold",
  offer: "aboveTheFold",
  "conversion readiness": "conversionRead",
  conversion: "conversionRead",
};

function topThreeDeepDives(report: BrandReport) {
  return [...report.scorecard]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => {
      const bodyKey = AXIS_BODY[item.label.toLowerCase()] || "positioningRead";
      return {
        ...item,
        body: String(report[bodyKey] || item.note || ""),
        band: bandFor(item.score),
      };
    });
}

function scoreRows(report: BrandReport) {
  return report.scorecard.map((item) => ({
    ...item,
    band: bandFor(item.score),
  }));
}

function normalizeHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  }
}

export function QuickDiagnosisExperience({
  locale,
  initialUrl = "",
  paymentSessionId = null,
  accessError = "",
}: {
  locale: SiteLocale;
  initialUrl?: string;
  paymentSessionId?: string | null;
  accessError?: string;
}) {
  const copy = siteI18n.siteCopy[locale].fullReport;
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || initialUrl || "");
  const [report, setReport] = useState<BrandReport | null>(null);
  const [status, setStatus] = useState(
    locale === "ru"
      ? "Готовлю Quick Diagnosis..."
      : locale === "es"
        ? "Preparando Quick Diagnosis..."
        : "Preparing Quick Diagnosis...",
  );
  const [error, setError] = useState(accessError);
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);
  const prevReportRef = useRef<BrandReport | null>(null);

  useEffect(() => {
    if (report && !prevReportRef.current && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevReportRef.current = report;
  }, [report]);

  function handleGenerate(nextUrl?: string) {
    const targetUrl = (nextUrl ?? url).trim();
    if (!targetUrl) {
      setError(copy.emptyUrl);
      setStatus("");
      return;
    }

    setError("");
    setStatus(
      locale === "ru"
        ? "Читаю сайт и собираю quick diagnosis..."
        : locale === "es"
          ? "Leyendo el sitio y armando el quick diagnosis..."
          : "Reading the site and building the quick diagnosis...",
    );

    startTransition(async () => {
      try {
        const response = await fetch("/api/quick-diagnosis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: targetUrl,
            language: locale,
            reference: searchParams.get("reference") || undefined,
            sessionId: searchParams.get("session_id") || paymentSessionId || undefined,
            promoToken: searchParams.get("promo_token") || undefined,
          }),
        });

        const payload = (await response.json()) as ReportResponse | ErrorResponse;
        if (!response.ok || !("report" in payload)) {
          const errorPayload = payload as ErrorResponse;
          throw new Error(
            errorPayload.detail ||
              errorPayload.error ||
              "Unable to generate the quick diagnosis right now.",
          );
        }

        setReport(payload.report);
        const emailSent = payload.delivery?.emailStatus === "sent";
        setStatus(
          locale === "ru"
            ? emailSent
              ? "Quick Diagnosis готов. Мы также отправили ссылку на email."
              : "Quick Diagnosis готов."
            : locale === "es"
              ? emailSent
                ? "Quick Diagnosis listo. También enviamos el enlace por email."
                : "Quick Diagnosis listo."
              : emailSent
                ? "Quick Diagnosis ready. We also emailed you the access link."
                : "Quick Diagnosis ready.",
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to generate the quick diagnosis right now.",
        );
        setStatus("");
      }
    });
  }

  useEffect(() => {
    const urlFromParams = searchParams.get("url");
    const targetUrl = urlFromParams || initialUrl;
    if (targetUrl) {
      setUrl(targetUrl);
      handleGenerate(targetUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initialUrl]);

  const rows = useMemo(() => (report ? scoreRows(report) : []), [report]);
  const deepDives = useMemo(() => (report ? topThreeDeepDives(report) : []), [report]);
  const aiVisibility = report?.scorecard.find((item) =>
    item.label.toLowerCase().includes("ai"),
  );
  const evidence = report
    ? [
        ...report.screenshotCallouts.map((item) => ({
          title: item.title,
          body: item.body,
        })),
        ...report.surfaceCaptures.map((item) => ({
          title: item.label,
          body: item.note,
        })),
      ].slice(0, 4)
    : [];

  return (
    <main className="page-shell report-shell min-h-screen bg-[color:var(--background)] px-6 py-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[86rem]">
        <header className="editorial-rule flex flex-col gap-6 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={siteI18n.withLang("/", locale)}
              className="text-sm uppercase tracking-[0.22em] text-[color:var(--foreground-soft)] hover:text-[color:var(--foreground)]"
            >
              {copy.back}
            </Link>
            <p className="section-label mt-8">BrandMirror / $67</p>
            <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.05em] text-[color:var(--foreground)] sm:text-7xl">
              Quick Diagnosis
            </h1>
          </div>
          <div className="max-w-sm">
            <div className="mb-4 flex justify-end sm:mb-6">
              <LanguageSwitcher locale={locale} />
            </div>
            <p className="section-label">Diagnostic layer</p>
            <p className="mt-3 text-base leading-7 text-[color:var(--foreground-soft)]">
              Website evidence, the top 3 commercial deep dives, the AI visibility read, and the ranked fix stack.
            </p>
          </div>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.4fr_0.6fr] lg:py-14">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleGenerate();
            }}
            className="grain-panel rounded-[2rem] border border-[color:var(--line)] p-6 sm:p-8"
          >
            <p className="section-label">Checkout verified</p>
            <label className="mt-8 block text-sm font-medium text-[color:var(--foreground-soft)]">
              Website URL
            </label>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="mt-3 w-full rounded-full border border-[color:var(--line-strong)] bg-transparent px-5 py-3 text-sm text-[color:var(--foreground)] outline-none"
              placeholder="https://example.com"
            />
            <button
              type="submit"
              disabled={isPending}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[rgba(233,239,248,0.96)] px-5 py-3 text-sm font-medium text-[#151b28] disabled:opacity-60"
            >
              {isPending ? "Generating..." : report ? "Regenerate Quick Diagnosis" : "Generate Quick Diagnosis"}
            </button>
            {status ? (
              <p className="mt-5 text-sm leading-6 text-[color:var(--foreground-soft)]">
                {status}
              </p>
            ) : null}
            {error ? (
              <p className="mt-5 rounded-2xl border border-[#E07A5F66] bg-[#E07A5F14] px-4 py-3 text-sm leading-6 text-[#F2B9A9]">
                {error}
              </p>
            ) : null}
          </form>

          <div className="ink-panel rounded-[2rem] border border-[color:var(--line)] p-6 sm:p-8">
            {report ? (
              <>
                <p className="section-label">{normalizeHost(report.url)}</p>
                <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-serif text-5xl leading-none tracking-[-0.05em] text-[color:var(--foreground)]">
                      {report.brandName}
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--foreground-soft)]">
                      {report.snapshot}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-7xl leading-none text-[#6FE0C2]">
                      {report.posterScore}
                    </p>
                    <p className="section-label mt-2">{bandFor(report.posterScore).label}</p>
                  </div>
                </div>

                <div className="editorial-rule mt-8 space-y-4 pt-6">
                  {rows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[1fr_auto] gap-5">
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="section-label">{row.label}</p>
                          <p className="font-mono text-sm text-[color:var(--foreground-soft)]">
                            {row.band.label}
                          </p>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(237,237,242,0.12)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(4, Math.min(100, row.score))}%`,
                              background: row.band.color,
                            }}
                          />
                        </div>
                      </div>
                      <p className="font-serif text-4xl leading-none" style={{ color: row.band.color }}>
                        {row.score}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : isPending ? (
              <div className="min-h-[28rem] rounded-[1.5rem] border border-[color:var(--line)] p-8">
                <p className="section-label opacity-60">Generating…</p>
                <div className="mt-6 space-y-3">
                  <div className="h-3 animate-pulse rounded-full bg-[rgba(237,237,242,0.08)]" style={{ width: "55%" }} />
                  <div className="h-3 animate-pulse rounded-full bg-[rgba(237,237,242,0.06)]" style={{ width: "75%" }} />
                  <div className="h-3 animate-pulse rounded-full bg-[rgba(237,237,242,0.04)]" style={{ width: "40%" }} />
                </div>
                <div className="mt-10 space-y-5">
                  {[62, 78, 55, 83, 70].map((w, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto] gap-5 items-center">
                      <div className="space-y-2">
                        <div className="h-2 animate-pulse rounded-full bg-[rgba(237,237,242,0.08)]" style={{ width: `${w}%` }} />
                        <div className="h-1.5 animate-pulse rounded-full bg-[rgba(237,237,242,0.05)]" />
                      </div>
                      <div className="h-9 w-12 animate-pulse rounded bg-[rgba(237,237,242,0.08)]" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="min-h-[28rem] rounded-[1.5rem] border border-[color:var(--line)] p-8">
                <p className="section-label">BrandMirror</p>
                <p className="mt-5 font-serif text-4xl leading-tight text-[color:var(--foreground)]">
                  Your quick diagnosis will appear here after checkout is verified.
                </p>
              </div>
            )}
          </div>
        </section>

        {report ? (
          <>
            <section ref={resultsRef} className="editorial-rule py-12">
              <p className="section-label">Website Evidence</p>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {evidence.map((item) => (
                  <article key={`${item.title}-${item.body}`} className="ink-panel rounded-[1.5rem] border border-[color:var(--line)] p-6">
                    <h3 className="font-serif text-3xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--foreground-soft)]">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="editorial-rule py-12">
              <p className="section-label">Top 3 Commercial Deep Dives</p>
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {deepDives.map((item) => (
                  <article key={item.label} className="ink-panel rounded-[1.5rem] border border-[color:var(--line)] p-6">
                    <p className="section-label" style={{ color: item.band.color }}>
                      {item.label} / {item.score}
                    </p>
                    <h3 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                      {item.note}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--foreground-soft)]">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-5 py-12 lg:grid-cols-[0.44fr_0.56fr]">
              <div className="ink-panel rounded-[1.5rem] border border-[color:var(--line)] p-6">
                <p className="section-label">AI Visibility Read</p>
                <p className="mt-5 font-serif text-6xl leading-none text-[#6FE0C2]">
                  {aiVisibility?.score ?? "--"}
                </p>
                <p className="mt-5 text-base leading-7 text-[color:var(--foreground-soft)]">
                  {report.toneCheck}
                </p>
              </div>
              <div className="ink-panel rounded-[1.5rem] border border-[color:var(--line)] p-6">
                <p className="section-label">Priority Fix Stack</p>
                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  {[
                    ["Fix now", report.priorityFixes.fixNow, "#E07A5F"],
                    ["Fix next", report.priorityFixes.fixNext, "#E8B04C"],
                    ["Keep", report.priorityFixes.keep, "#6FE0C2"],
                  ].map(([title, items, color]) => (
                    <div key={title as string}>
                      <p className="section-label" style={{ color: color as string }}>
                        {title as string}
                      </p>
                      <div className="mt-4 space-y-3">
                        {(items as string[]).slice(0, 3).map((item) => (
                          <p key={item} className="text-sm leading-6 text-[color:var(--foreground-soft)]">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="editorial-rule flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-label">$149 Full Report</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  Need the full blueprint?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--foreground-soft)]">
                  The full report adds all 5 deep dives, competitor intelligence, commercial impact, brand brief, implementation playbook, and PDF export.
                </p>
              </div>
              <Link
                href={siteI18n.withLang(`/first-read?url=${encodeURIComponent(report.url)}&product=full_report`, locale)}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
              >
                Unlock Full Report
              </Link>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
