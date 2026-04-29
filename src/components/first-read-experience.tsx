// @ts-nocheck
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { type BrandReadResult } from "@/lib/brand-read";
import { bandFor, type Band, BANDS, DIMENSIONS } from "@/lib/score-band";
import LanguageSwitcher from "@/components/language-switcher";
import siteI18n from "@/lib/site-i18n";
import { normalizeCustomerEmail } from "@/lib/customer-email";
import {
  buildBrandReadParagraphs,
  buildExpandedSignal,
  buildLiveScanTagline,
  buildNextMoveCliffhanger,
  buildScopeLine,
  fullReportIncludesForLocale,
  refundLineForLocale,
} from "@/lib/free-report-copy";

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

type CheckoutResponse = {
  ok: boolean;
  checkoutUrl?: string;
  error?: string;
  detail?: string;
};

type FirstReadCopy = (typeof siteI18n.siteCopy)[SiteLocale]["firstRead"];

// ---------------------------------------------------------------------------
// Scanner taxonomy lives in src/lib/score-band.ts. This component only imports
// the `bandFor` helper and the `Band` type so first-read, full-report, and
// PDF all speak the same vocabulary.
// ---------------------------------------------------------------------------

function formatLocalClock(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const offMinutes = -d.getTimezoneOffset();
  const offH = Math.trunc(offMinutes / 60);
  const sign = offH >= 0 ? "+" : "-";
  return `${hh}:${mm} GMT${sign}${Math.abs(offH)}`;
}

function normalizeUrl(value: string):
  | { ok: true; url: string; host: string }
  | { ok: false; reason: "empty" | "invalid" } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  if (/\s/.test(trimmed)) return { ok: false, reason: "invalid" };

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!host.includes(".") || host.length < 4) {
      return { ok: false, reason: "invalid" };
    }
    return { ok: true, url: parsed.toString(), host };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic "production file" code — generated from the URL, not a static score.
function productionCode(brandName: string, sourceUrl: string): string {
  const normalized = normalizeUrl(sourceUrl);
  const source = normalized.ok ? normalized.host.split(".")[0] : brandName;
  const abbr = (source || "BRAND")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(3, "X")
    .slice(0, 3);
  const year = new Date().getFullYear();
  const serial = String(hashString(`${sourceUrl || brandName}-${year}`) % 1000).padStart(3, "0");
  return `BM-${abbr}-${year}-${serial}`;
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
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [status, setStatus] = useState<string>(copy.statusInitial);
  const [error, setError] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [result, setResult] = useState<BrandReadResult>(defaultResult);
  const [isTestingFullPdf, setIsTestingFullPdf] = useState(false);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [clock, setClock] = useState<string>(() => formatLocalClock());
  useEffect(() => {
    const render = () => setClock(formatLocalClock());
    render();
    const id = window.setInterval(render, 1_000);
    return () => window.clearInterval(id);
  }, []);

  const posterBand = bandFor(result.posterScore);
  const dimensionLabels = copy.dimensionLabels ?? {};
  const scoreRows = DIMENSIONS.map((d) => ({
    label: dimensionLabels[d.key] ?? d.shortLabel,
    key: d.key,
    value: result[d.key] as number,
  }));
  const brandReadParagraphs = buildBrandReadParagraphs(result, locale);
  const nextMoveParagraphs = buildNextMoveCliffhanger(result, locale);
  const localizedFullReportIncludes = fullReportIncludesForLocale(locale);
  const localizedRefundLine = refundLineForLocale(locale);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const checkedUrl = normalizeUrl(url);
    if (!checkedUrl.ok) {
      setError(checkedUrl.reason === "empty" ? copy.emptyUrl : copy.invalidUrl);
      setStatus("");
      return;
    }

    const checkedEmail = normalizeCustomerEmail(email);
    if (!checkedEmail) {
      setError(copy.emailRequired ?? "Enter a valid email address to receive the report.");
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
          body: JSON.stringify({ url: checkedUrl.url, language: locale, email: checkedEmail }),
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
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to generate the first read right now.";
        const lowerMessage = message.toLowerCase();
        const looksUnreachable =
          lowerMessage.includes("couldn't reach") ||
          lowerMessage.includes("could not reach") ||
          lowerMessage.includes("failed to fetch") ||
          lowerMessage.includes("timeout") ||
          lowerMessage.includes("unreachable") ||
          lowerMessage.includes("page could not");
        setError(looksUnreachable ? copy.unreachableUrl : message);
        setStatus("");
      }
    });
  }

  const normalizedPreviewUrl = normalizeUrl(url);
  const hasUrlInput = url.trim().length > 0;
  const hasResult = Boolean(currentUrl);
  const scannerMode = isPending
    ? "scanning"
    : currentUrl
      ? "live"
      : normalizedPreviewUrl.ok
        ? "ready"
        : "idle";
  const reportSourceUrl = currentUrl || (normalizedPreviewUrl.ok ? normalizedPreviewUrl.url : url.trim());
  const prodCode = reportSourceUrl ? productionCode(result.brandName, reportSourceUrl) : "BM-READY";
  const displayHost = (() => {
    try {
      if (currentUrl) return new URL(currentUrl).hostname.replace(/^www\./, "");
      if (normalizedPreviewUrl.ok) return normalizedPreviewUrl.host;
    } catch {
      /* fall through */
    }
    return copy.scanner?.enterUrl ?? "ENTER URL";
  })();

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

  async function handleOpenCheckout() {
    const checkedUrl = normalizeUrl(reportSourceUrl);
    if (!checkedUrl.ok) {
      setError(copy.invalidUrl);
      return;
    }

    const checkedEmail = normalizeCustomerEmail(email);
    if (!checkedEmail) {
      setError(copy.emailRequired ?? "Enter a valid email address to receive the report.");
      return;
    }

    setError("");
    setIsOpeningCheckout(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: checkedUrl.url,
          language: locale,
          email: checkedEmail,
          promoCode: promoCode.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as CheckoutResponse;
      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(
          payload.detail || payload.error || copy.checkoutError || "Unable to open checkout right now.",
        );
      }

      window.location.href = payload.checkoutUrl;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : copy.checkoutError || "Unable to open checkout right now.",
      );
    } finally {
      setIsOpeningCheckout(false);
    }
  }

  return (
    <main
      className="page-shell report-shell min-h-screen"
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
            className={`brandmirror-scan-entry rounded-2xl border p-6 sm:p-7 ${
              scannerMode === "idle" && !hasUrlInput ? "brandmirror-scan-entry-idle" : ""
            }`}
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
              className={`brandmirror-url-field mt-3 flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                scannerMode === "idle" && !hasUrlInput
                  ? "brandmirror-url-field-idle"
                  : scannerMode === "ready"
                    ? "brandmirror-url-field-ready"
                    : scannerMode === "scanning"
                      ? "brandmirror-url-field-scanning"
                      : ""
              }`}
              style={{
                borderColor: normalizedPreviewUrl.ok ? "rgba(111,224,194,0.55)" : "rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.018)",
              }}
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
                className="min-w-0 flex-1 bg-transparent outline-none"
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "15px",
                  color: COLOR.text,
                  caretColor: "#6FE0C2",
                  letterSpacing: "0.01em",
                }}
              />
            </div>

            <p
              className="mt-2"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "10.5px",
                letterSpacing: "0.14em",
                color: normalizedPreviewUrl.ok ? "#6FE0C2" : COLOR.textMuted,
                textTransform: "uppercase",
              }}
            >
              {normalizedPreviewUrl.ok ? copy.statusReady : copy.startHelper}
            </p>

            <label
              htmlFor="customer-email"
              className="mt-5 block"
              style={{ ...metaLabel, letterSpacing: "0.24em" }}
            >
              {(copy.emailLabel ?? "Email for report").toUpperCase()}
            </label>

            <div
              className="mt-3 flex items-center gap-3 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: normalizeCustomerEmail(email)
                  ? "rgba(111,224,194,0.55)"
                  : "rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.018)",
              }}
            >
              <span
                aria-hidden
                style={{
                  color: "#D4C4DC",
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "13px",
                }}
              >
                @
              </span>
              <input
                id="customer-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.emailPlaceholder ?? "you@example.com"}
                className="min-w-0 flex-1 bg-transparent outline-none"
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
                className={`brandmirror-read-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${
                  scannerMode === "idle" || scannerMode === "ready" ? "brandmirror-read-button-idle" : ""
                }`}
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
                  <>{copy.submitIdle.toUpperCase()}</>
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
              tagline={buildLiveScanTagline(result, locale)}
              clock={clock}
              scoreRows={scoreRows}
              isPending={isPending}
              isLive={Boolean(currentUrl)}
              mode={scannerMode}
              copy={copy}
            />
        </section>

        {hasResult ? (
          <>
        <p
          className="mt-4 text-center"
          style={{
            ...terminalText,
            color: COLOR.textMuted,
            fontSize: "10px",
            letterSpacing: "0.13em",
          }}
          suppressHydrationWarning
        >
          {buildScopeLine(clock, locale)}
        </p>

        {currentUrl ? (
          <section
            className="mt-8 flex flex-col gap-4 rounded-2xl border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            style={{
              borderColor: COLOR.lineSoft,
              background: "rgba(255,255,255,0.018)",
            }}
          >
            <div>
              <p style={{ ...metaLabel, color: COLOR.accent }}>
                {(copy.freePdfLabel ?? "FREE REPORT EXPORT").toUpperCase()}
              </p>
              <p
                className="mt-2 leading-6"
                style={{ color: COLOR.textMuted, fontSize: "13.5px" }}
              >
                {copy.freePdfBody ?? "Save the free first read as a shareable PDF snapshot."}
              </p>
            </div>
            <form action="/api/brand-read/pdf" method="post">
              <input type="hidden" name="url" value={currentUrl} />
              <input type="hidden" name="language" value={locale} />
              <input type="hidden" name="result" value={JSON.stringify(result)} />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 transition hover:bg-white/[0.04]"
                style={{
                  borderColor: "rgba(111,224,194,0.34)",
                  color: COLOR.text,
                  fontSize: "12.5px",
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontWeight: 500,
                }}
              >
                {copy.freePdfIdle.toUpperCase()}
              </button>
            </form>
          </section>
        ) : null}

        {/* =================== Editorial anatomy =================== */}
        <section className="mt-20 grid gap-8 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p style={metaLabel}>{(copy.brandReadLabel ?? "BRAND READ").toUpperCase()}</p>
            <h3
              className="mt-4 leading-[1.05] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3.1rem)",
                color: COLOR.text,
                fontWeight: 500,
              }}
            >
              {copy.brandReadTitle ?? "The symptom is visible. The commercial cost needs naming."}
            </h3>
            <p
              className="mt-5 max-w-md leading-7"
              style={{ color: COLOR.textSoft, fontSize: "15px" }}
            >
              {copy.brandReadBody ??
                "The free read surfaces the signal. The full report names what it's costing you — and what to fix first."}
            </p>
          </div>
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              borderColor: COLOR.lineSoft,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <p style={{ ...metaLabel, color: COLOR.accent }}>
              {(copy.currentStateLabel ?? copy.currentState ?? "CURRENT STATE").toUpperCase()}
            </p>
            <div className="mt-5 space-y-5">
              {brandReadParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="max-w-[48rem] leading-7"
                  style={{
                    color: "rgba(237,237,242,0.76)",
                    fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                  }}
                >
                  {paragraph}
                </p>
              ))}
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
            <p style={metaLabel}>{(copy.scanLegendLabel ?? "HOW TO READ THE SCAN").toUpperCase()}</p>
            <h3
              className="mt-4 leading-[1.08] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 500,
                color: COLOR.text,
              }}
            >
              {copy.scanLegendTitle ?? "Five indicator tiers. Five dimensions of the signal."}
            </h3>
            <p
              className="mt-5 max-w-md leading-7"
              style={{ color: COLOR.textSoft, fontSize: "14.5px" }}
            >
              {copy.scanLegendBody ??
                "Each dimension is scored 0–100 and placed into one of five tiers. The colour tells you how alive that signal is right now."}
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
                    {copy.bandLabels?.[b.key] ?? b.label}
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
                  {copy.bandBlurbs?.[b.key] ?? b.blurb}
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
            body={buildExpandedSignal(result, "strongest", locale)}
          />
          <AnatomyColumn
            label={copy.mainFriction.toUpperCase()}
            tone="#E8B04C"
            body={buildExpandedSignal(result, "friction", locale)}
          />
          <div className="rounded-xl border p-5" style={{ borderColor: `${COLOR.line}`, background: `${COLOR.line}22` }}>
            <p style={{ ...metaLabel, color: COLOR.text }}>{copy.nextMove.toUpperCase()}</p>
            <div className="mt-3 space-y-3">
              {nextMoveParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="leading-6"
                  style={{
                    color: index === nextMoveParagraphs.length - 1 ? COLOR.text : COLOR.textSoft,
                    fontSize: "13.5px",
                    fontStyle: index === 0 ? "italic" : "normal",
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
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
            <p style={{ ...metaLabel, color: COLOR.accent }}>
              {(copy.unlockLabel ?? "UNLOCK FULL REPORT").toUpperCase()}
            </p>
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
                  {copy.fullReportTag ?? "$197 FULL REPORT"}
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
                  {copy.unlockExactFix ?? "Unlock the exact fix stack behind this scan."}
                </p>
                <ol className="mt-5 space-y-2">
                  {localizedFullReportIncludes.slice(0, 7).map((item, index) => (
                    <li
                      key={item}
                      className="grid grid-cols-[1.6rem_1fr] gap-2 leading-6"
                      style={{ color: COLOR.textSoft, fontSize: "13.5px" }}
                    >
                      <span style={{ color: "#6FE0C2", fontFamily: "var(--font-mono), ui-monospace, monospace" }}>
                        {index + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
                <p
                  className="mt-5 rounded-xl border px-4 py-3 leading-6"
                  style={{
                    borderColor: "rgba(111,224,194,0.18)",
                    background: "rgba(111,224,194,0.05)",
                    color: COLOR.text,
                    fontSize: "13.5px",
                  }}
                >
                  {localizedRefundLine}
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <label
                  htmlFor="promo-code"
                  style={{ ...metaLabel, letterSpacing: "0.24em" }}
                >
                  {(copy.promoLabel ?? "Promo code").toUpperCase()}
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                  style={{
                    borderColor: promoCode.trim()
                      ? "rgba(212,196,220,0.48)"
                      : "rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.018)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      color: "#D4C4DC",
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "13px",
                    }}
                  >
                    %
                  </span>
                  <input
                    id="promo-code"
                    name="promoCode"
                    type="text"
                    autoComplete="off"
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                    placeholder={copy.promoPlaceholder ?? "OPTIONAL"}
                    className="min-w-0 flex-1 bg-transparent uppercase outline-none"
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "15px",
                      color: COLOR.text,
                      caretColor: "#D4C4DC",
                      letterSpacing: "0.06em",
                    }}
                  />
                </div>
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
                  <button
                    type="button"
                    onClick={handleOpenCheckout}
                    disabled={isOpeningCheckout}
                    className="inline-flex items-center justify-center rounded-full border px-4 py-2 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      ...metaLabel,
                      fontSize: "10px",
                      borderColor: "rgba(255,255,255,0.16)",
                      color: COLOR.text,
                    }}
                  >
                    {isOpeningCheckout
                      ? (copy.checkoutBusy ?? "Opening checkout...").toUpperCase()
                      : (copy.checkoutCta ?? copy.unlockCta ?? "Unlock — $197").toUpperCase()}
                  </button>
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
            <p style={{ ...metaLabel, color: COLOR.accent }}>
              {(copy.fixStackLabel ?? "FIX STACK").toUpperCase()}
            </p>
            <div className="mt-5 min-h-[15.5rem] space-y-4 pb-16">
              {[
                { label: copy.fixNowLabel ?? "FIX NOW", color: "#E07A5F", count: 3 },
                { label: copy.fixNextLabel ?? "FIX NEXT", color: "#E8B04C", count: 3 },
                { label: copy.keepLabel ?? "KEEP", color: "#6FE0C2", count: 3 },
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
            {copy.fixStackBody ??
              "What to fix first, what can wait, and what is already earning trust — prioritised by commercial impact."}
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
                  <p style={{ ...metaLabel, fontSize: "10px", color: COLOR.accent }}>
                    {(copy.includedInFullReport ?? "INCLUDED IN FULL REPORT").toUpperCase()}
                  </p>
                  <p className="mt-2" style={{ color: COLOR.textSoft, fontSize: "13px" }}>
                    {copy.fixStackIncluded ??
                      "Fix Now, Fix Next, and Keep — prioritized by commercial impact."}
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
                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  disabled={isOpeningCheckout}
                  className="shrink-0 rounded-full border px-4 py-2 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    ...metaLabel,
                    fontSize: "10px",
                    borderColor: "rgba(255,255,255,0.16)",
                    color: COLOR.text,
                  }}
                >
                  {isOpeningCheckout
                    ? (copy.checkoutBusy ?? "Opening checkout...").toUpperCase()
                    : (copy.checkoutCta ?? copy.unlockCta ?? "Unlock — $197").toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================== Footer bar =================== */}
        <div
          className="mt-12 flex items-center justify-between border-t pt-6"
          style={{
            borderColor: COLOR.lineSoft,
            ...terminalText,
            color: COLOR.textFaint,
          }}
        >
          <span>{(copy.poweredBy ?? "POWERED BY SAHAR").toUpperCase()}</span>
          <span>{prodCode}</span>
        </div>
          </>
        ) : null}
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
  mode,
  copy,
}: {
  brandName: string;
  host: string;
  posterScore: number;
  band: Band;
  tagline: string;
  clock: string;
  scoreRows: Array<{ label: string; key: string; value: number }>;
  isPending: boolean;
  isLive: boolean;
  mode: "idle" | "ready" | "scanning" | "live";
  copy?: FirstReadCopy;
}) {
  const scannerCopy = copy?.scanner ?? {};
  const localizedBandLabels = copy?.bandLabels ?? {};
  const terminalLines = scannerCopy.terminal ?? [
    "Scanning homepage copy...",
    "Reading AI signal structure...",
    "Mapping conversion path...",
    "Analyzing visual hierarchy...",
  ];
  const labelForBand = (item: Band) => localizedBandLabels[item.key] ?? item.label;
  const showLiveScores = mode === "live";
  const showScanMotion = mode === "scanning";
  const idleColor = mode === "idle" ? "#6FE0C2" : "#D8C5E0";
  const activeBand = showLiveScores ? band : bandFor(showScanMotion ? 47 : 0);
  const pct = Math.max(0, Math.min(100, Math.round(posterScore)));
  // Semi-circle arc from (30,130) to (230,130), r=100. Arc length = π·r ≈ 314.16.
  const arcLen = Math.PI * 100;
  const displayPct = showLiveScores ? pct : showScanMotion ? 47 : null;
  const fill = ((displayPct ?? 18) / 100) * arcLen;
  const displayName = showLiveScores
    ? (brandName || "brand").toLowerCase()
    : showScanMotion
      ? scannerCopy.readingSignal ?? "reading signal"
      : mode === "ready"
        ? scannerCopy.readyToScan ?? "ready to scan"
        : scannerCopy.firstSignal ?? "first signal";
  const displaySubline =
    showLiveScores || mode === "ready" || showScanMotion
      ? host
      : scannerCopy.enterUrl ?? "ENTER URL";

  return (
    <div
      className={`brandmirror-readout-panel relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${
        mode === "idle" ? "brandmirror-readout-idle" : mode === "ready" ? "brandmirror-readout-ready" : ""
      } ${mode === "scanning" ? "brandmirror-readout-scanning" : ""}`}
      style={{
        borderColor: COLOR.line,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <CornerMarks color={showLiveScores ? band.color : idleColor} />

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
          {isLive
            ? scannerCopy.liveScan ?? "LIVE SCAN"
            : mode === "scanning"
              ? scannerCopy.scanning ?? "SCANNING"
              : scannerCopy.awaitingSignal ?? "AWAITING SIGNAL"}
        </span>
        <span suppressHydrationWarning>{clock}</span>
      </div>

      {mode === "scanning" ? (
        <div className="brandmirror-scan-terminal" aria-hidden>
          {terminalLines.map((line, index) => (
            <span key={line} style={{ animationDelay: `${index * 180}ms` }}>
              &gt; {line}
            </span>
          ))}
        </div>
      ) : null}

      {/* Brand name */}
      <div className="mt-10 text-center">
        <div
          className="mx-auto leading-none tracking-[-0.035em]"
          style={{
            color: COLOR.text,
            fontWeight: 500,
            fontSize: displayName.length > 20
              ? "clamp(1.6rem, 3.5vw, 2.2rem)"
              : "clamp(2.6rem, 5.5vw, 3.5rem)",
            wordBreak: "break-word",
          }}
        >
          {displayName}
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
          {displaySubline}
        </div>
      </div>

      {/* Arc gauge */}
      <div className="mt-8 flex justify-center">
        <svg
          viewBox="0 0 260 160"
          width="260"
          height="160"
          role="img"
          aria-label={`Brand readiness ${pct} of 100, ${labelForBand(band).toLowerCase()}`}
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
            stroke={showLiveScores ? band.color : idleColor}
            strokeWidth={13}
            strokeLinecap="round"
            strokeDasharray={`${fill} ${arcLen + 100}`}
            className={showLiveScores ? "" : "brandmirror-gauge-probe"}
            style={{ transition: "stroke-dasharray 700ms ease, stroke 700ms ease" }}
          />
          <text
            x="130"
            y="100"
            textAnchor="middle"
            fontSize="64"
            fontWeight={500}
            fill={showLiveScores ? band.color : idleColor}
            style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
          >
            {displayPct ?? "\u2014\u2014"}
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
            color: showLiveScores ? band.color : idleColor,
            fontWeight: 500,
          }}
        >
          {isPending
            ? scannerCopy.scanningStatus ?? "SCANNING\u2026"
            : showLiveScores
              ? labelForBand(band)
              : mode === "ready"
                ? scannerCopy.ready ?? "READY"
                : scannerCopy.awaitingSignal ?? "AWAITING SIGNAL"}
        </span>
      </div>

      {/* Opening verdict / pull quote */}
      {showLiveScores && tagline ? (
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
          {scannerCopy.scoreBreakdown ?? "SCORE BREAKDOWN"}
        </div>
        <div className="grid gap-0">
          {scoreRows.map((row, idx) => {
            const rowBand = showLiveScores ? bandFor(row.value) : activeBand;
            const ghostWidth = showScanMotion ? `${38 + idx * 4}%` : mode === "ready" ? "24%" : "14%";
            return (
              <div
                key={row.label}
                className="grid items-center gap-5 py-4"
                style={{
                  gridTemplateColumns: "minmax(120px, 170px) minmax(0, 1fr) 94px",
                  borderBottom:
                    idx === scoreRows.length - 1
                      ? "none"
                      : `0.5px solid ${COLOR.lineSoft}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontSize: "11px",
                    letterSpacing: "0.24em",
                    color: "rgba(237,237,242,0.58)",
                    lineHeight: 1.2,
                  }}
                >
                  {row.label}
                </div>
                <div
                  className={`overflow-hidden rounded-full ${
                    showLiveScores ? "" : "brandmirror-scorebar-idle"
                  }`}
                  style={{ height: 4, background: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: showLiveScores
                        ? `${Math.max(0, Math.min(100, row.value))}%`
                        : ghostWidth,
                      background: rowBand.color,
                      borderRadius: 999,
                      transition: "width 700ms ease, background 700ms ease",
                      opacity: showLiveScores ? 1 : 0.65,
                    }}
                  />
                </div>
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    color: rowBand.color,
                    textAlign: "right",
                    lineHeight: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "38px",
                      fontWeight: 600,
                      lineHeight: 0.9,
                    }}
                  >
                    {showLiveScores ? row.value : "\u2014"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "8px",
                      letterSpacing: "0.22em",
                      whiteSpace: "nowrap",
                      lineHeight: 1.1,
                    }}
                  >
                    {showLiveScores ? labelForBand(rowBand) : ""}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Band legend */}
      <div className="mt-6">
        <div style={{ ...metaLabel, fontSize: 9.5 }}>
          {scannerCopy.indicatorScale ?? "INDICATOR SCALE"}
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {BANDS.map((item) => {
            const active = showLiveScores && pct >= item.lo && pct <= item.hi;
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
                  {labelForBand(item)}
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
