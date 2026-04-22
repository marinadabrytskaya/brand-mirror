// @ts-nocheck
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { type BrandReadResult } from "@/lib/brand-read";
import { type BrandReport } from "@/lib/brand-report";
import { bandFor, type Band, BANDS, DIMENSIONS } from "@/lib/score-band";
import LanguageSwitcher from "@/components/language-switcher";
import siteI18n from "@/lib/site-i18n";

type SiteLocale = "en" | "es" | "ru";

type ReadResponse = {
  ok: boolean;
  url: string;
  source: "website";
  result: BrandReadResult;
};

type ErrorResponse = {
  error?: string;
  detail?: string;
};

type ReportResponse = {
  ok: boolean;
  report: BrandReport;
};

// ---------------------------------------------------------------------------
// Scanner taxonomy lives in src/lib/score-band.ts. This component only imports
// the `bandFor` helper and the `Band` type so first-read, full-report, and
// PDF all speak the same vocabulary.
// ---------------------------------------------------------------------------

// Deterministic "production file" code — BM-NIK-2026-084 for Nike at 84.
// Abbreviation = first 3 A-Z chars of the first word of the brand name.
function productionCode(brandName: string, score: number): string {
  const first = (brandName || "BRAND").trim().split(/\s+/)[0] ?? "BRD";
  const abbr = first
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(3, "X")
    .slice(0, 3);
  const year = new Date().getFullYear();
  const serial = String(
    Math.max(0, Math.min(999, Math.round(Number.isFinite(score) ? score : 0))),
  ).padStart(3, "0");
  return `BM-${abbr}-${year}-${serial}`;
}

// Stock-ticker-style abbreviation — "$NKE", "$NOTION" clipped to 4 chars.
function tickerSymbol(brandName: string): string {
  const first = (brandName || "BRAND").trim().split(/\s+/)[0] ?? "BRD";
  const abbr = first
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(4, "X")
    .slice(0, 4);
  return `$${abbr}`;
}

// ---------------------------------------------------------------------------
// Default result kept from the original fixture so the page is never empty.
// ---------------------------------------------------------------------------
const defaultResult: BrandReadResult = {
  brandName: "Nera Studio",
  visualWorld: "sage",
  symbol: "strategy",
  title: "The Clearer Signal",
  genre: "Intellectual Mystery",
  tagline: "The brand looks strong. The promise needs sharper edges.",
  posterScore: 75,
  scoreBand: "STABLE",
  scoreModifier:
    "The audience can feel the quality. They still cannot say why the offer matters.",
  whatItDoes:
    "Nera Studio appears to offer a premium creative and strategic service for brands that need a sharper signal and a more coherent commercial presence.",
  summary:
    "The brand looks refined, expensive, and composed. The offer feels more atmospheric than direct.",
  current:
    "At first glance, the visual system creates trust quickly. The friction appears when the viewer tries to understand exactly what is being offered and why it matters now. The brand feels high-quality. The message feels one beat behind.",
  strength:
    "Severe palette, restrained typography, and disciplined layout make the brand feel premium and intentional.",
  gap:
    "The missing piece is speed of understanding. The homepage creates mood before it creates commercial certainty.",
  mismatch:
    "The design suggests confidence and selectiveness. Some of the language still sounds more careful or broad than that visual system implies.",
  voice:
    "The tone is elegant and calm. It needs more edge and more specificity if it wants to convert with the same force as the visuals.",
  direction:
    "Tighten the first headline so a buyer understands the value before they admire the style.",
  amplify:
    "Amplify the restraint, the visual control, and the premium pacing. Those are already working.",
  drop:
    "Drop filler language and any sentence that sounds polished but not precise.",
  positioningClarity: 72,
  toneCoherence: 70,
  visualCredibility: 88,
  offerSpecificity: 64,
  conversionReadiness: 72,
  strongestSignal:
    "The brand already feels controlled, premium, and visually intentional.",
  mainFriction:
    "The homepage lets atmosphere lead too long before the promise becomes commercially explicit.",
  nextMove:
    "Tighten the first headline so a buyer understands the value before they admire the style.",
};

// Shared inline tokens used across the page. Kept as plain objects so the whole
// file is self-contained while we iterate on the direction.
const COLOR = {
  bg: "#07070A",
  text: "#F4F5F8",
  textSoft: "rgba(237,237,242,0.72)",
  textMuted: "rgba(237,237,242,0.46)",
  textFaint: "rgba(237,237,242,0.32)",
  line: "rgba(255,255,255,0.1)",
  lineSoft: "rgba(255,255,255,0.06)",
  liveRed: "#FF3B3B",
} as const;

const metaLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
  fontSize: "10.5px",
  letterSpacing: "0.3em",
  color: COLOR.textMuted,
  textTransform: "uppercase",
};

const terminalText: React.CSSProperties = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
  fontSize: "10.5px",
  letterSpacing: "0.22em",
  color: COLOR.textMuted,
};

function triggerPdfDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Safari can cancel blob downloads if we tear down the link/object URL
  // immediately after click.
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }, 60_000);
}

// ---------------------------------------------------------------------------

export default function FirstReadExperience({ locale }: { locale: SiteLocale }) {
  const copy = siteI18n.siteCopy[locale].firstRead;
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string>(copy.statusInitial);
  const [error, setError] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [result, setResult] = useState<BrandReadResult>(defaultResult);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingFullReport, setIsDownloadingFullReport] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Real clock, client-side only to avoid SSR/CSR hydration mismatch.
  const [clock, setClock] = useState<string>("--:-- GMT");
  useEffect(() => {
    const render = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const offMinutes = -d.getTimezoneOffset();
      const offH = Math.trunc(offMinutes / 60);
      const sign = offH >= 0 ? "+" : "-";
      setClock(`${hh}:${mm} GMT${sign}${Math.abs(offH)}`);
    };
    render();
    const id = window.setInterval(render, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const posterBand = bandFor(result.posterScore);
  const scoreRows = DIMENSIONS.map((d) => ({
    label: d.shortLabel,
    value: result[d.key] as number,
  }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError(copy.emptyUrl);
      setStatus("");
      return;
    }

    setError("");
    setStatus(copy.statusReading);

    startTransition(async () => {
      try {
        const response = await fetch("/api/brand-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: trimmedUrl, language: locale }),
        });

        const payload = (await response.json()) as ReadResponse | ErrorResponse;

        if (!response.ok || !("result" in payload)) {
          const errorPayload = payload as ErrorResponse;
          throw new Error(
            errorPayload.detail ||
              errorPayload.error ||
              "Unable to generate the first read right now.",
          );
        }

        setCurrentUrl(payload.url);
        setResult(payload.result);
        setStatus(copy.statusDone);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to generate the first read right now.",
        );
        setStatus("");
      }
    });
  }

  async function handleDownloadPdf() {
    if (!currentUrl) return;
    setIsDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/brand-read/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: currentUrl, language: locale, result }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ErrorResponse;
        throw new Error(
          payload.detail || payload.error || "Unable to export the PDF right now.",
        );
      }

      const blob = await response.blob();
      triggerPdfDownload(
        blob,
        `${result.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-first-read.pdf`,
      );
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to export the PDF right now.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDownloadFullReportPdf() {
    if (!currentUrl) return;
    setIsDownloadingFullReport(true);
    setError("");

    try {
      const reportResponse = await fetch("/api/brand-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: currentUrl, language: locale }),
      });

      const reportPayload = (await reportResponse.json()) as
        | ReportResponse
        | ErrorResponse;

      if (!reportResponse.ok || !("report" in reportPayload)) {
        const errorPayload = reportPayload as ErrorResponse;
        throw new Error(
          errorPayload.detail ||
            errorPayload.error ||
            "Unable to generate the full report right now.",
        );
      }

      const pdfResponse = await fetch("/api/brand-report/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: currentUrl,
          language: locale,
          report: reportPayload.report,
        }),
      });

      if (!pdfResponse.ok) {
        const payload = (await pdfResponse.json().catch(() => ({}))) as ErrorResponse;
        throw new Error(
          payload.detail || payload.error || "Unable to export the PDF right now.",
        );
      }

      const blob = await pdfResponse.blob();
      triggerPdfDownload(
        blob,
        `${reportPayload.report.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-report.pdf`,
      );
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to export the PDF right now.",
      );
    } finally {
      setIsDownloadingFullReport(false);
    }
  }

  const prodCode = productionCode(result.brandName, result.posterScore);
  const ticker = tickerSymbol(result.brandName);
  const displayHost = (() => {
    try {
      if (currentUrl) return new URL(currentUrl).hostname.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
    return `${(result.brandName || "brand").toLowerCase().replace(/\s+/g, "")}.com`;
  })();

  const reportHref = siteI18n.withLang(
    `/full-report${currentUrl || url ? `?url=${encodeURIComponent(currentUrl || url.trim())}` : ""}`,
    locale,
  );

  return (
    <main
      className="min-h-screen"
      style={{
        background: COLOR.bg,
        color: COLOR.text,
        fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
      }}
    >
      <div className="mx-auto max-w-[86rem] px-5 pb-20 pt-6 sm:px-8 lg:px-12">

        {/* =================== Top terminal bar =================== */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: COLOR.line, ...terminalText }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>BRANDMIRROR</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span>FIRST&nbsp;READ</span>
            <span className="hidden sm:inline" style={{ opacity: 0.4 }}>/</span>
            <span className="hidden items-center gap-2 sm:inline-flex">
              <LiveDot />
              LIVE
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="hidden sm:inline" suppressHydrationWarning>
              {clock}
            </span>
            <span className="hidden sm:inline" style={{ opacity: 0.4 }}>/</span>
            <span>{prodCode}</span>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        {/* =================== Back + headline =================== */}
        <div className="mt-10 flex flex-col gap-5">
          <Link
            href={siteI18n.withLang("/", locale)}
            className="w-fit transition-opacity hover:opacity-100"
            style={{
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontSize: "10.5px",
              letterSpacing: "0.3em",
              color: COLOR.textMuted,
              textTransform: "uppercase",
            }}
          >
            &larr;&nbsp;&nbsp;{copy.back}
          </Link>

          <h1
            className="leading-[0.96] tracking-[-0.04em]"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              fontWeight: 500,
              color: COLOR.text,
            }}
          >
            {copy.title}
          </h1>
          <p
            className="max-w-[42rem] leading-7"
            style={{ color: COLOR.textSoft, fontSize: "15px" }}
          >
            {copy.startBody}
          </p>

          {/* Decorative visual break */}
          <div className="mt-8 flex items-center gap-2">
            <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to right, ${COLOR.line}, transparent)` }} />
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: COLOR.accent }} />
            <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to left, ${COLOR.line}, transparent)` }} />
          </div>
        </div>

        {/* =================== What we measure — horizontal strip =================== */}
        <section className="mt-12 border-y py-7" style={{ borderColor: COLOR.line }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p style={metaLabel}>WHAT&nbsp;WE&nbsp;MEASURE</p>
            <p
              className="max-w-xl leading-6"
              style={{ color: COLOR.textSoft, fontSize: "13.5px" }}
            >
              Five things we look at on a homepage. Each gets a score from 0 to 100.
              The colour tells you whether it is working, wobbling, or in trouble.
            </p>
          </div>
          <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
            {DIMENSIONS.map((d, idx) => (
              <div key={d.key} className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      color: "rgba(237,237,242,0.4)",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "10.5px",
                      letterSpacing: "0.24em",
                      color: COLOR.text,
                      fontWeight: 500,
                    }}
                  >
                    {d.shortLabel}
                  </span>
                </div>
                <p
                  className="mt-3 leading-5"
                  style={{
                    color: "rgba(237,237,242,0.72)",
                    fontSize: "13px",
                  }}
                >
                  {d.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =================== Form + scanner =================== */}
        <section className="mt-14 grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">

          {/* ---------- LEFT: URL entry as terminal card ---------- */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border p-6 sm:p-7"
            style={{
              borderColor: COLOR.line,
              background: "rgba(255,255,255,0.015)",
            }}
          >
            <p style={metaLabel}>{copy.startLabel.toUpperCase()}</p>

            <h2
              className="mt-4 leading-tight tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.75rem",
                fontWeight: 500,
                color: COLOR.text,
              }}
            >
              {copy.startTitle}
            </h2>

            <label
              htmlFor="brand-url"
              className="mt-7 block"
              style={{ ...metaLabel, letterSpacing: "0.24em" }}
            >
              {copy.websiteUrl}
            </label>

            <div
              className="mt-3 flex items-center gap-3 border-b pb-2"
              style={{ borderColor: "rgba(255,255,255,0.22)" }}
            >
              <span
                aria-hidden
                style={{
                  color: "#6FE0C2",
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "13px",
                }}
              >
                &#9656;
              </span>
              <input
                id="brand-url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={copy.urlPlaceholder}
                className="flex-1 bg-transparent outline-none"
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "15px",
                  color: COLOR.text,
                  caretColor: "#6FE0C2",
                  letterSpacing: "0.01em",
                }}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "#6FE0C2",
                  color: "#07070A",
                  fontSize: "12.5px",
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontWeight: 500,
                }}
              >
                {isPending ? (
                  <>
                    <span
                      aria-hidden
                      className="inline-block"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: "#07070A",
                        animation: "bmBlink 1s steps(2, start) infinite",
                      }}
                    />
                    {copy.submitBusy.toUpperCase()}
                  </>
                ) : (
                  <>&#9654; {copy.submitIdle.toUpperCase()}</>
                )}
              </button>
              <p
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  color: COLOR.textMuted,
                  textTransform: "uppercase",
                }}
              >
                {status}
              </p>
            </div>

            {error ? (
              <p
                className="mt-4"
                style={{
                  color: "#F2495C",
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {"\u26A0"}&nbsp;&nbsp;{error}
              </p>
            ) : null}

            <div
              className="mt-8 border-t pt-6"
              style={{ borderColor: COLOR.lineSoft }}
            >
              <p style={metaLabel}>{copy.mechanicLabel}</p>
              <p
                className="mt-3 leading-6"
                style={{ color: COLOR.textSoft, fontSize: "13.5px" }}
              >
                {copy.mechanicBody}
              </p>
            </div>
          </form>

          {/* ---------- RIGHT: scanner readout ---------- */}
          <ScannerReadout
            brandName={result.brandName}
            host={displayHost}
            posterScore={result.posterScore}
            band={posterBand}
            tagline={result.tagline}
            ticker={ticker}
            clock={clock}
            scoreRows={scoreRows}
            isPending={isPending}
            isLive={Boolean(currentUrl)}
          />
        </section>

        {/* =================== Editorial anatomy =================== */}
        <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p style={metaLabel}>{copy.whatItDoes}</p>
            <p
              className="mt-4 leading-7"
              style={{ color: COLOR.textSoft, fontSize: "15px" }}
            >
              {result.whatItDoes}
            </p>
          </div>
          <div>
            <p style={metaLabel}>{copy.firstDiagnosis}</p>
            <p
              className="mt-4 leading-[1.1] tracking-[-0.015em]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)",
                color: COLOR.text,
                fontWeight: 500,
              }}
            >
              {"\u201C"}{result.summary}{"\u201D"}
            </p>
            <p
              className="mt-6 max-w-[44rem] leading-7"
              style={{ color: COLOR.textSoft, fontSize: "15px" }}
            >
              {result.current}
            </p>
          </div>
        </section>

        {currentUrl ? (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center justify-center rounded-full border px-6 py-3 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: "rgba(111,224,194,0.35)",
                color: "#6FE0C2",
                fontSize: "12.5px",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontWeight: 500,
              }}
            >
              {isDownloading
                ? copy.downloadPdfBusy.toUpperCase()
                : copy.downloadPdfIdle.toUpperCase()}
            </button>
            <p
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "10.5px",
                letterSpacing: "0.14em",
                color: isDownloading ? "#6FE0C2" : COLOR.textMuted,
                textTransform: "uppercase",
              }}
            >
              {isDownloading ? copy.downloadPdfBusy : `${copy.freeBadge} / PDF`}
            </p>
          </div>
        ) : null}

        <hr
          className="mt-16"
          style={{ border: 0, height: "0.5px", background: COLOR.line }}
        />

        {/* =================== How to read the scan — legend =================== */}
        <section className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p style={metaLabel}>HOW&nbsp;TO&nbsp;READ&nbsp;THE&nbsp;SCAN</p>
            <h3
              className="mt-4 leading-[1.08] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 500,
                color: COLOR.text,
              }}
            >
              Five indicator tiers. Five dimensions of the signal.
            </h3>
            <p
              className="mt-5 max-w-md leading-7"
              style={{ color: COLOR.textSoft, fontSize: "14.5px" }}
            >
              Each dimension is scored 0&ndash;100 and placed into one of five
              tiers. The colour tells you how alive that signal is right now,
              not just whether it is red or green.
            </p>
          </div>

          {/* Tier legend with blurbs */}
          <div className="grid gap-3 sm:grid-cols-2">
            {BANDS.map((b) => (
              <div
                key={b.key}
                className="rounded-xl border p-4"
                style={{
                  borderColor: `${b.color}40`,
                  background: `${b.color}0D`,
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    style={{
                      fontFamily:
                        "var(--font-mono), ui-monospace, monospace",
                      fontSize: "10.5px",
                      letterSpacing: "0.26em",
                      color: b.color,
                      fontWeight: 500,
                    }}
                  >
                    {b.label}
                  </span>
                  <span
                    style={{
                      fontFamily:
                        "var(--font-mono), ui-monospace, monospace",
                      fontSize: "10.5px",
                      letterSpacing: "0.14em",
                      color: b.color,
                      opacity: 0.8,
                    }}
                  >
                    {b.lo}&ndash;{b.hi}
                  </span>
                </div>
                <p
                  className="mt-3 leading-6"
                  style={{ color: COLOR.textSoft, fontSize: "13.5px" }}
                >
                  {b.blurb}
                </p>
              </div>
            ))}
          </div>
        </section>

        <hr
          className="mt-16"
          style={{ border: 0, height: "0.5px", background: COLOR.line }}
        />

        {/* =================== Signal / Friction / Next move =================== */}
        <section className="mt-12 grid gap-10 sm:grid-cols-3">
          <AnatomyColumn
            label={copy.strongestSignal.toUpperCase()}
            tone="#6FE0C2"
            body={result.strongestSignal}
          />
          <AnatomyColumn
            label={copy.mainFriction.toUpperCase()}
            tone="#E8B04C"
            body={result.mainFriction}
          />
          <AnatomyColumn
            label={copy.nextMove.toUpperCase()}
            tone={COLOR.text}
            body={result.nextMove}
            emphasis
          />
        </section>

        <hr
          className="mt-16"
          style={{ border: 0, height: "0.5px", background: COLOR.line }}
        />

        {/* =================== Unlock bar =================== */}
        <section
          className="mt-12 grid gap-10 rounded-2xl border p-8 sm:grid-cols-2 sm:p-10"
          style={{ borderColor: COLOR.line }}
        >
          <div>
            <p style={metaLabel}>{copy.unlockLabel}</p>
            <div
              className="mt-4 leading-none tracking-[-0.04em]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "3.25rem",
                fontWeight: 500,
                color: COLOR.text,
              }}
            >
              $197
            </div>
            <p
              className="mt-5 max-w-md leading-7"
              style={{ color: COLOR.textSoft, fontSize: "14.5px" }}
            >
              {copy.unlockBody}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={reportHref}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition hover:-translate-y-px"
                style={{
                  background: "#6FE0C2",
                  color: "#07070A",
                  fontSize: "12.5px",
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontWeight: 500,
                }}
              >
                &#9654;&nbsp;&nbsp;{copy.unlockCta.toUpperCase()}
              </Link>
              <Link
                href={siteI18n.withLang("/sample-report", locale)}
                className="inline-flex items-center justify-center rounded-full border px-6 py-3 transition hover:bg-white/[0.04]"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: COLOR.text,
                  fontSize: "12.5px",
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontWeight: 500,
                }}
              >
                {copy.unlockSecondary.toUpperCase()}
              </Link>
            </div>
            {currentUrl ? (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleDownloadFullReportPdf}
                  disabled={isDownloadingFullReport}
                  className="inline-flex items-center justify-center rounded-full border px-6 py-3 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    borderColor: "rgba(111,224,194,0.35)",
                    color: "#6FE0C2",
                    fontSize: "12.5px",
                    letterSpacing: "0.18em",
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontWeight: 500,
                  }}
                >
                  {isDownloadingFullReport
                    ? copy.unlockTestPdfBusy.toUpperCase()
                    : copy.unlockTestPdfIdle.toUpperCase()}
                </button>
                <p
                  style={{
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontSize: "10.5px",
                    letterSpacing: "0.14em",
                    color: isDownloadingFullReport ? "#6FE0C2" : COLOR.textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  {isDownloadingFullReport
                    ? copy.unlockTestPdfBusy
                    : copy.unlockTestPdfNote}
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <p style={metaLabel}>{copy.included}</p>
            <ul className="mt-4 grid gap-0">
              {copy.unlockItems.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 border-b py-2.5"
                  style={{
                    borderColor: COLOR.lineSoft,
                    color: "rgba(237,237,242,0.88)",
                    fontSize: "14px",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      color: "#6FE0C2",
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      lineHeight: 1,
                      marginTop: "2px",
                    }}
                  >
                    &#x2713;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              {copy.unlockNotes.map((note) => (
                <p
                  key={note}
                  className="leading-6"
                  style={{ color: "rgba(237,237,242,0.55)", fontSize: "12.5px" }}
                >
                  {note}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* =================== Footer bar =================== */}
        <div
          className="mt-16 flex items-center justify-between border-t pt-6"
          style={{
            borderColor: COLOR.lineSoft,
            ...terminalText,
            color: COLOR.textFaint,
          }}
        >
          <span>POWERED&nbsp;BY&nbsp;SAHAR</span>
          <span>{prodCode}</span>
        </div>
      </div>

      {/* Small global keyframe for the button pending dot. Kept inline so the
          whole direction lives in one file while we iterate. */}
      <style>{`@keyframes bmBlink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0.2 } }`}</style>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function LiveDot() {
  return (
    <span
      aria-hidden
      style={{
        width: 6,
        height: 6,
        borderRadius: 999,
        background: COLOR.liveRed,
        display: "inline-block",
        boxShadow: "0 0 0 3px rgba(255,59,59,0.18)",
      }}
    />
  );
}

function ScannerReadout({
  brandName,
  host,
  posterScore,
  band,
  tagline,
  ticker,
  clock,
  scoreRows,
  isPending,
  isLive,
}: {
  brandName: string;
  host: string;
  posterScore: number;
  band: Band;
  tagline: string;
  ticker: string;
  clock: string;
  scoreRows: Array<{ label: string; value: number }>;
  isPending: boolean;
  isLive: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(posterScore)));
  // Semi-circle arc from (30,130) to (230,130), r=100. Arc length = π·r ≈ 314.16.
  const arcLen = Math.PI * 100;
  const fill = (pct / 100) * arcLen;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
      style={{
        borderColor: COLOR.line,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <CornerMarks color={band.color} />

      {/* Tiny status strip, reminiscent of a device readout */}
      <div
        className="flex items-center justify-between"
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "10px",
          letterSpacing: "0.26em",
          color: COLOR.textFaint,
          textTransform: "uppercase",
        }}
      >
        <span>
          {isLive ? "LIVE SCAN" : "SAMPLE READOUT"}
        </span>
        <span suppressHydrationWarning>{clock}</span>
      </div>

      {/* Brand name */}
      <div className="mt-10 text-center">
        <div
          className="mx-auto leading-none tracking-[-0.035em]"
          style={{
            color: COLOR.text,
            fontWeight: 500,
            fontSize: "clamp(2.6rem, 5.5vw, 3.5rem)",
          }}
        >
          {(brandName || "brand").toLowerCase()}
        </div>
        <div
          className="mt-3"
          style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "10.5px",
            letterSpacing: "0.26em",
            color: COLOR.textFaint,
            textTransform: "uppercase",
          }}
        >
          {host}
        </div>
      </div>

      {/* Arc gauge */}
      <div className="mt-8 flex justify-center">
        <svg
          viewBox="0 0 260 160"
          width="260"
          height="160"
          role="img"
          aria-label={`Brand readiness ${pct} of 100, ${band.label.toLowerCase()}`}
        >
          <path
            d="M 30 130 A 100 100 0 0 1 230 130"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={13}
            strokeLinecap="round"
          />
          <path
            d="M 30 130 A 100 100 0 0 1 230 130"
            fill="none"
            stroke={band.color}
            strokeWidth={13}
            strokeLinecap="round"
            strokeDasharray={`${fill} ${arcLen + 100}`}
            style={{ transition: "stroke-dasharray 700ms ease, stroke 700ms ease" }}
          />
          <text
            x="130"
            y="100"
            textAnchor="middle"
            fontSize="64"
            fontWeight={500}
            fill={band.color}
            style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
          >
            {pct}
          </text>
          <text
            x="130"
            y="124"
            textAnchor="middle"
            fontSize="10.5"
            fill="rgba(237,237,242,0.5)"
            letterSpacing="2"
            style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
          >
            / 100
          </text>
        </svg>
      </div>

      {/* Verdict */}
      <div className="text-center" style={{ marginTop: -2 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "13px",
            letterSpacing: "0.38em",
            color: band.color,
            fontWeight: 500,
          }}
        >
          {isPending ? "SCANNING\u2026" : band.label}
        </span>
      </div>

      {/* Opening verdict / pull quote */}
      {tagline ? (
        <p
          className="mx-auto mt-6 max-w-md text-center leading-[1.45]"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontStyle: "italic",
            fontSize: "18px",
            color: "rgba(237,237,242,0.86)",
          }}
        >
          {"\u201C"}{tagline}{"\u201D"}
        </p>
      ) : null}

      {/* Sub-scores */}
      <div className="mt-8">
        <div style={{ ...metaLabel, marginBottom: 12 }}>
          SCORE&nbsp;BREAKDOWN
        </div>
        <div className="grid gap-0">
          {scoreRows.map((row, idx) => {
            const rowBand = bandFor(row.value);
            return (
              <div
                key={row.label}
                className="grid items-center gap-4 py-3"
                style={{
                  gridTemplateColumns: "1fr auto",
                  borderBottom:
                    idx === scoreRows.length - 1
                      ? "none"
                      : `0.5px solid ${COLOR.lineSoft}`,
                }}
              >
                <div className="min-w-0">
                  <div
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "10px",
                      letterSpacing: "0.24em",
                      color: "rgba(237,237,242,0.55)",
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    className="mt-2 overflow-hidden rounded-full"
                    style={{ height: 3, background: "rgba(255,255,255,0.07)" }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(0, Math.min(100, row.value))}%`,
                        background: rowBand.color,
                        borderRadius: 999,
                        transition: "width 700ms ease, background 700ms ease",
                      }}
                    />
                  </div>
                </div>
                <div
                  className="flex items-baseline gap-3"
                  style={{ minWidth: 130, justifyContent: "flex-end" }}
                >
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 500,
                      color: rowBand.color,
                    }}
                  >
                    {row.value}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "9.5px",
                      letterSpacing: "0.22em",
                      color: rowBand.color,
                      minWidth: 80,
                      textAlign: "right",
                    }}
                  >
                    {rowBand.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticker card */}
      <div
        className="mt-6 rounded-lg border p-3"
        style={{ borderColor: COLOR.line }}
      >
        <div
          className="flex items-center justify-between gap-3"
          style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "10.5px",
            letterSpacing: "0.2em",
            color: "rgba(237,237,242,0.6)",
            textTransform: "uppercase",
          }}
        >
          <span className="flex flex-wrap items-center gap-2">
            BRANDMIRROR&nbsp;TERMINAL
            <LiveDot />
            LIVE
          </span>
          <span suppressHydrationWarning style={{ whiteSpace: "nowrap" }}>
            {clock}
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: COLOR.text,
            }}
          >
            {(brandName || "brand").toLowerCase()}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <span style={{ color: "rgba(237,237,242,0.55)" }}>
              {ticker}&nbsp;
            </span>
            <span style={{ color: band.color }}>+{pct}.0 RDY</span>
          </span>
        </div>
      </div>

      {/* Band legend */}
      <div className="mt-6">
        <div style={{ ...metaLabel, fontSize: 9.5 }}>INDICATOR&nbsp;SCALE</div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {BANDS.map((item) => {
            const active = item.key === band.key;
            return (
              <div
                key={item.label}
                className="rounded-md px-1.5 py-1.5 text-center"
                style={{
                  background: active ? `${item.color}22` : "rgba(255,255,255,0.02)",
                  border: `0.5px solid ${active ? `${item.color}73` : "rgba(255,255,255,0.06)"}`,
                  opacity: active ? 1 : 0.55,
                  transition:
                    "opacity 400ms ease, background 400ms ease, border-color 400ms ease",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontSize: "9.5px",
                    letterSpacing: "0.14em",
                    color: item.color,
                  }}
                >
                  {item.lo}&ndash;{item.hi}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontSize: "8.5px",
                    letterSpacing: "0.18em",
                    color: item.color,
                    opacity: 0.9,
                    marginTop: 2,
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CornerMarks({ color }: { color: string }) {
  const sz = 12;
  const base: React.CSSProperties = {
    position: "absolute",
    width: sz,
    height: sz,
    opacity: 0.55,
    pointerEvents: "none",
  };
  return (
    <>
      <span
        aria-hidden
        style={{
          ...base,
          top: 10,
          left: 10,
          borderTop: `0.5px solid ${color}`,
          borderLeft: `0.5px solid ${color}`,
        }}
      />
      <span
        aria-hidden
        style={{
          ...base,
          top: 10,
          right: 10,
          borderTop: `0.5px solid ${color}`,
          borderRight: `0.5px solid ${color}`,
        }}
      />
      <span
        aria-hidden
        style={{
          ...base,
          bottom: 10,
          left: 10,
          borderBottom: `0.5px solid ${color}`,
          borderLeft: `0.5px solid ${color}`,
        }}
      />
      <span
        aria-hidden
        style={{
          ...base,
          bottom: 10,
          right: 10,
          borderBottom: `0.5px solid ${color}`,
          borderRight: `0.5px solid ${color}`,
        }}
      />
    </>
  );
}

function AnatomyColumn({
  label,
  tone,
  body,
  emphasis,
}: {
  label: string;
  tone: string;
  body: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: tone,
            display: "inline-block",
          }}
        />
        <span style={metaLabel}>{label}</span>
      </div>
      <p
        className="mt-4 leading-7"
        style={{
          color: emphasis ? COLOR.text : "rgba(237,237,242,0.82)",
          fontSize: emphasis ? "16px" : "15px",
          fontWeight: emphasis ? 500 : 400,
        }}
      >
        {body}
      </p>
    </div>
  );
}
