// @ts-nocheck
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { type BrandReadResult } from "@/lib/brand-read";
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

function buildDiagnosticTagline(result: BrandReadResult): string {
  const ranked = [...DIMENSIONS]
    .map((dimension) => ({
      key: dimension.key,
      value: Number(result[dimension.key] ?? 0),
    }))
    .sort((a, b) => a.value - b.value);

  const weakest = ranked.slice(0, 2).map((item) => item.key);
  const hasAI = weakest.includes("toneCoherence");
  const hasOffer = weakest.includes("offerSpecificity");
  const hasPositioning = weakest.includes("positioningClarity");
  const hasConversion = weakest.includes("conversionReadiness");
  const hasVisual = weakest.includes("visualCredibility");

  if (hasAI && hasOffer) {
    return "The offer is under-named. AI visibility is too weak to sell it.";
  }
  if (hasOffer && hasPositioning) {
    return "The page shows capability before it names what buyers can buy.";
  }
  if (hasAI && hasPositioning) {
    return "AI sees fragments. Buyers still have to name the offer themselves.";
  }
  if (hasAI && hasConversion) {
    return "AI cannot repeat the promise, and the CTA asks too early.";
  }
  if (hasOffer && hasConversion) {
    return "The offer is vague, so the click asks for trust it has not earned.";
  }
  if (hasVisual && hasOffer) {
    return "The page looks better than it sells. The offer is still missing.";
  }
  if (hasVisual && hasConversion) {
    return "The page does not earn enough trust before it asks for action.";
  }
  if (hasAI) {
    return "AI visibility is thin enough to flatten the brand into generic noise.";
  }
  if (hasOffer) {
    return "The offer is still under-named; buyers cannot repeat it fast enough.";
  }
  if (hasPositioning) {
    return "Capability is visible, but the category promise is still buried.";
  }
  if (hasConversion) {
    return "Interest is present, but the page still makes action feel risky.";
  }
  if (hasVisual) {
    return "The visual layer is not earning trust fast enough.";
  }
  return result.tagline || "The signal is present. The page is still making buyers work.";
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
  accent: "#D4C4DC",
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

// ---------------------------------------------------------------------------

export default function FirstReadExperience({ locale }: { locale: SiteLocale }) {
  const copy = siteI18n.siteCopy[locale].firstRead;
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string>(copy.statusInitial);
  const [error, setError] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [result, setResult] = useState<BrandReadResult>(defaultResult);
  const [isDownloadingFreePdf, setIsDownloadingFreePdf] = useState(false);
  const [isTestingFullPdf, setIsTestingFullPdf] = useState(false);
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

  const prodCode = productionCode(result.brandName, result.posterScore);
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

  async function downloadPdfFromResponse(response: Response, filename: string) {
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }

  async function handleDownloadFreePdf() {
    if (!currentUrl) return;
    setError("");
    setIsDownloadingFreePdf(true);
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
          payload.detail || payload.error || "Unable to export the free PDF right now.",
        );
      }

      const filename = `${(result.brandName || "brandmirror").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-first-read.pdf`;
      await downloadPdfFromResponse(response, filename);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to export the free PDF right now.",
      );
    } finally {
      setIsDownloadingFreePdf(false);
    }
  }

  async function handleTestFullPdf() {
    if (!currentUrl) return;
    setError("");
    setIsTestingFullPdf(true);
    try {
      const response = await fetch("/api/brand-report/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: currentUrl, language: locale, readResult: result }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ErrorResponse;
        throw new Error(
          payload.detail || payload.error || "Unable to export the full PDF right now.",
        );
      }

      const filename = `${(result.brandName || "brandmirror").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-full-report.pdf`;
      await downloadPdfFromResponse(response, filename);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to export the full PDF right now.",
      );
    } finally {
      setIsTestingFullPdf(false);
    }
  }

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

        {/* =================== Form + scanner =================== */}
        <section className="mt-12 grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">

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
            tagline={buildDiagnosticTagline(result)}
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
            <div className="mt-8 rounded-xl border px-5 py-5" style={{ borderColor: COLOR.lineSoft, background: "rgba(255,255,255,0.02)" }}>
              <p style={metaLabel}>{copy.currentState}</p>
              <p
                className="mt-3 max-w-[44rem] leading-7"
                style={{ color: COLOR.textSoft, fontSize: "15px" }}
              >
                {result.current}
              </p>
            </div>
          </div>
        </section>

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

        {/* =================== Signal teaser (full version behind paywall) =================== */}
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
          <div className="rounded-xl border p-5" style={{ borderColor: `${COLOR.line}`, background: `${COLOR.line}22` }}>
            <p style={{ ...metaLabel, color: COLOR.text }}>{copy.nextMove.toUpperCase()}</p>
            <p className="mt-3 leading-6" style={{ color: COLOR.textSoft, fontSize: "14px", fontStyle: "italic" }}>
              Available in full report
            </p>
          </div>
        </section>

        <hr
          className="mt-16"
          style={{ border: 0, height: "0.5px", background: COLOR.line }}
        />

        {/* =================== Locked teasers =================== */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Unlock full report */}
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{ borderColor: COLOR.line, background: "rgba(255,255,255,0.02)" }}
          >
            <p style={{ ...metaLabel, color: COLOR.accent }}>UNLOCK&nbsp;FULL&nbsp;REPORT</p>
            <div className="mt-5 flex min-h-[15.5rem] flex-col justify-between">
              <div>
                <div
                  className="inline-flex items-center rounded-full border px-4 py-2"
                  style={{
                    borderColor: "rgba(111,224,194,0.24)",
                    background: "rgba(111,224,194,0.06)",
                    color: "#6FE0C2",
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontSize: "11px",
                    letterSpacing: "0.16em",
                  }}
                >
                  $197 FULL REPORT
                </div>
                <p
                  className="mt-5 max-w-md leading-[1.18]"
                  style={{
                    color: COLOR.text,
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "2rem",
                    fontWeight: 500,
                  }}
                >
                  Unlock the full diagnosis, competitor position, and implementation playbook.
                </p>
                <p
                  className="mt-5 max-w-lg leading-7"
                  style={{ color: COLOR.textSoft, fontSize: "14px" }}
                >
                  Includes signal read, commercial impact scenarios, competitor comparison, implementation playbook, and the downloadable PDF.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href="https://brandmirror.app"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
                    style={{
                      color: "#6FE0C2",
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "12px",
                      letterSpacing: "0.16em",
                    }}
                  >
                    brandmirror.app
                  </a>
                  <Link
                    href={reportHref}
                    className="inline-flex items-center justify-center rounded-full border px-4 py-2 transition hover:bg-white/[0.04]"
                    style={{
                      ...metaLabel,
                      fontSize: "10px",
                      borderColor: "rgba(255,255,255,0.16)",
                      color: COLOR.text,
                    }}
                  >
                    UNLOCK&nbsp;&mdash;&nbsp;$197
                  </Link>
                </div>
                {currentUrl ? (
                  <button
                    type="button"
                    onClick={handleTestFullPdf}
                    disabled={isTestingFullPdf}
                    className="inline-flex items-center justify-center rounded-full border px-4 py-2 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      ...metaLabel,
                      fontSize: "10px",
                      borderColor: "rgba(255,255,255,0.16)",
                      color: COLOR.textSoft,
                    }}
                  >
                    {isTestingFullPdf
                      ? copy.testFullPdfBusy.toUpperCase()
                      : copy.testFullPdfIdle.toUpperCase()}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Fix stack teaser */}
          <div
            className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
            style={{ borderColor: COLOR.line, background: "rgba(255,255,255,0.02)" }}
          >
            <p style={{ ...metaLabel, color: COLOR.accent }}>FIX&nbsp;STACK</p>
            <div className="mt-5 min-h-[15.5rem] space-y-4 pb-16">
              {[
                { label: "FIX NOW", color: "#E07A5F", count: 3 },
                { label: "FIX NEXT", color: "#E8B04C", count: 3 },
                { label: "KEEP", color: "#6FE0C2", count: 3 },
              ].map((band) => (
                <div key={band.label} className="flex items-center gap-4">
                  <div
                    className="flex w-24 items-center justify-center rounded-lg py-3"
                    style={{ background: `${band.color}18`, border: `1px solid ${band.color}30` }}
                  >
                    <span style={{ ...metaLabel, fontSize: "9.5px", color: band.color, letterSpacing: "0.2em" }}>
                      {band.label}
                    </span>
                  </div>
                  <div className="flex max-w-[11.5rem] flex-1 gap-2 pr-6">
                    {Array.from({ length: band.count }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2 flex-1 rounded-full"
                        style={{ background: `${band.color}25` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p
              className="mt-6 leading-6"
              style={{ color: COLOR.textMuted, fontSize: "13px" }}
            >
              What to fix first, what can wait, and what is already earning trust — prioritised by commercial impact.
            </p>
            <div
              className="absolute inset-x-0 bottom-0 border-t px-6 py-5 sm:px-8"
              style={{
                borderColor: COLOR.lineSoft,
                background: "linear-gradient(to bottom, rgba(7,7,10,0.2), rgba(7,7,10,0.96) 42%)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p style={{ ...metaLabel, fontSize: "10px", color: COLOR.accent }}>UNLOCK FULL REPORT</p>
                  <p className="mt-2" style={{ color: COLOR.textSoft, fontSize: "13px" }}>
                    $197 at brandmirror.app — priority fix stack, implementation playbook, competitor position, and PDF export.
                  </p>
                  <a
                    href="https://brandmirror.app"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 underline-offset-4 hover:underline"
                    style={{
                      color: "#6FE0C2",
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "11px",
                      letterSpacing: "0.14em",
                    }}
                  >
                    brandmirror.app
                  </a>
                </div>
                <Link
                  href={reportHref}
                  className="shrink-0 rounded-full border px-4 py-2 transition hover:bg-white/[0.04]"
                  style={{
                    ...metaLabel,
                    fontSize: "10px",
                    borderColor: "rgba(255,255,255,0.16)",
                    color: COLOR.text,
                  }}
                >
                  UNLOCK&nbsp;&mdash;&nbsp;$197
                </Link>
              </div>
            </div>
          </div>
        </section>

        {currentUrl ? (
          <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p style={metaLabel}>FREE REPORT EXPORT</p>
              <p
                className="mt-2 leading-6"
                style={{ color: COLOR.textMuted, fontSize: "12.5px" }}
              >
                Save the free first read as a shareable PDF snapshot.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadFreePdf}
              disabled={isDownloadingFreePdf}
              className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: COLOR.text,
                fontSize: "12.5px",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontWeight: 500,
              }}
            >
              {isDownloadingFreePdf
                ? copy.freePdfBusy.toUpperCase()
                : copy.freePdfIdle.toUpperCase()}
            </button>
          </section>
        ) : null}

        {/* =================== Footer bar =================== */}
        <div
          className="mt-12 flex items-center justify-between border-t pt-6"
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
            fontSize: (brandName || "").length > 20
              ? "clamp(1.6rem, 3.5vw, 2.2rem)"
              : "clamp(2.6rem, 5.5vw, 3.5rem)",
            wordBreak: "break-word",
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
                  gridTemplateColumns: "minmax(128px, 156px) minmax(0, 1fr) 236px",
                  borderBottom:
                    idx === scoreRows.length - 1
                      ? "none"
                      : `0.5px solid ${COLOR.lineSoft}`,
                }}
              >
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
                  className="overflow-hidden rounded-full"
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 132px",
                    alignItems: "center",
                    columnGap: 20,
                    justifyContent: "end",
                  }}
                >
                    <span
                      style={{
                        fontSize: "17px",
                        fontWeight: 500,
                        color: rowBand.color,
                        textAlign: "right",
                        lineHeight: 1,
                      }}
                    >
                      {row.value}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono), ui-monospace, monospace",
                        fontSize: "7px",
                        letterSpacing: "0.2em",
                        color: rowBand.color,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        lineHeight: 1.1,
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

      {/* Band legend */}
      <div className="mt-6">
        <div style={{ ...metaLabel, fontSize: 9.5 }}>INDICATOR&nbsp;SCALE</div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {BANDS.map((item) => {
            const active = pct >= item.lo && pct <= item.hi;
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
