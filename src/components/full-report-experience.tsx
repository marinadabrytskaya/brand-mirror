// @ts-nocheck
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type BrandReport } from "@/lib/brand-report";
import DiagnosticEvidenceBoard from "@/components/diagnostic-evidence-board";
import LanguageSwitcher from "@/components/language-switcher";
import siteI18n from "@/lib/site-i18n";
import { bandFor } from "@/lib/score-band";

type SiteLocale = "en" | "es" | "ru";

type ReportResponse = {
  ok: boolean;
  report: BrandReport;
};

type ErrorResponse = {
  error?: string;
  detail?: string;
};

function ReportSection({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <article className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
      <p className="section-label text-[rgba(237,237,242,0.58)]">{label}</p>
      <h3 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
        {title}
      </h3>
      <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
        {body}
      </p>
    </article>
  );
}

function ListBlock({
  label,
  title,
  items,
}: {
  label: string;
  title: string;
  items: string[];
}) {
  return (
    <article className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
      <p className="section-label text-[rgba(237,237,242,0.58)]">{label}</p>
      <h3 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
        {title}
      </h3>
      <div className="editorial-rule mt-5 space-y-4 border-[rgba(237,237,242,0.12)] pt-5">
        {items.map((item) => (
          <p
            key={item}
            className="border-b border-[rgba(237,237,242,0.12)] pb-4 text-sm leading-7 text-[rgba(237,237,242,0.72)] last:border-b-0 last:pb-0"
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}

function ScreenshotCallout({
  index,
  zone,
  title,
  body,
  x,
  y,
  locale = "en",
}: {
  index: number;
  zone: "hero-promise" | "proof-cta";
  title: string;
  body: string;
  x: number;
  y: number;
  locale?: SiteLocale;
}) {
  const zoneLabels = {
    en: { hero: "Hero promise", proof: "Proof + CTA" },
    es: { hero: "Promesa principal", proof: "Prueba + llamada" },
    ru: { hero: "Главное обещание", proof: "Доказательство + призыв" },
  }[locale];
  const zoneLabel = zone === "hero-promise" ? zoneLabels.hero : zoneLabels.proof;
  const alignClass =
    zone === "hero-promise"
      ? "items-start"
      : "items-end";
  const stackClass =
    zone === "hero-promise"
      ? ""
      : "flex-row-reverse text-right";

  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: zone === "proof-cta" ? "translate(-100%, -8%)" : "translate(0, -8%)",
        width: "clamp(10.5rem, 15vw, 13rem)",
        maxWidth: "calc(100% - 1.5rem)",
      }}
    >
      <div className={`flex gap-3 ${stackClass} ${alignClass}`}>
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(237,237,242,0.3)] bg-[rgba(17,15,13,0.86)] text-[11px] font-medium text-[#F4F5F8] shadow-[0_12px_26px_rgba(8,6,4,0.2)]">
          0{index + 1}
        </span>
        <div className={`flex flex-col gap-2 ${alignClass}`}>
          <span className="h-8 w-px bg-[linear-gradient(180deg,rgba(237,237,242,0.62),rgba(237,237,242,0.12))]" />
          <div className="overflow-hidden rounded-[1rem] border border-[rgba(237,237,242,0.14)] bg-[rgba(18,16,13,0.84)] px-3 py-2.5 text-[#F4F5F8] shadow-[0_18px_40px_rgba(10,8,6,0.24)] backdrop-blur-md">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[rgba(237,237,242,0.56)]">
              {zoneLabel}
            </p>
            <h4
              className="mt-1.5 font-serif text-lg leading-[1.02] tracking-[-0.03em] text-[#F4F5F8]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </h4>
            <p
              className="mt-1.5 text-[11px] leading-5 text-[rgba(237,237,242,0.74)]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualCropCard({
  label,
  title,
  body,
  imageUrl,
  focusX,
  focusY,
  aspectClass = "aspect-[5/4]",
  clampBody = false,
}: {
  label: string;
  title: string;
  body: string;
  imageUrl?: string;
  focusX: number;
  focusY: number;
  aspectClass?: string;
  clampBody?: boolean;
}) {
  return (
    <article className="ink-panel overflow-hidden rounded-[1.8rem] border border-[rgba(237,237,242,0.14)]">
      <div className={`${aspectClass} bg-[color:var(--background-strong)]`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${focusX}% ${focusY}%` }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-[color:var(--foreground-soft)]">
            No visual crop available for this frame.
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="section-label text-[rgba(237,237,242,0.58)]">{label}</p>
        <h3 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.03em] text-[#F4F5F8]">
          {title}
        </h3>
        <p
          className="mt-3 text-sm leading-6 text-[rgba(237,237,242,0.72)]"
          style={
            clampBody
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {body}
        </p>
      </div>
    </article>
  );
}

function HeroRewriteMockup({
  posterUrl,
  eyebrow,
  headline,
  subheadline,
  cta,
  note,
}: {
  posterUrl: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  cta: string;
  note: string;
}) {
  return (
    <article className="ink-panel overflow-hidden rounded-[1.8rem] border border-[rgba(237,237,242,0.14)]">
      <div
        className="relative aspect-[5/4] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(18, 15, 13, 0.18), rgba(18, 15, 13, 0.74)), url(${posterUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,8,6,0.82),rgba(10,8,6,0.28)_56%,rgba(10,8,6,0.14))]" />
        <div className="relative flex h-full flex-col justify-between p-6 text-[#F4F5F8] sm:p-7">
          <div>
            <p className="section-label text-[rgba(237,237,242,0.64)]">{eyebrow}</p>
            <h3 className="mt-4 max-w-md font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-[#F4F5F8]">
              {headline}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-[rgba(237,237,242,0.78)]">
              {subheadline}
            </p>
          </div>
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-[rgba(237,237,242,0.22)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(237,237,242,0.72)]">
              {cta}
            </span>
            <p className="max-w-md text-sm leading-7 text-[rgba(237,237,242,0.72)]">{note}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function PosterLensCard({
  posterUrl,
  brandName,
  genre,
  tagline,
  scoreBand,
  scoreModifier,
  posterScore,
}: {
  posterUrl: string;
  brandName: string;
  genre: string;
  tagline: string;
  scoreBand: string;
  scoreModifier: string;
  posterScore: number;
}) {
  return (
    <article className="ink-panel overflow-hidden rounded-[1.8rem] border border-[rgba(237,237,242,0.14)]">
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(17, 15, 13, 0.22), rgba(17, 15, 13, 0.68)), url(${posterUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 text-[#F4F5F8]">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[rgba(237,237,242,0.62)]">
            A Sahar production
          </p>
          <div>
            <h3 className="max-w-sm font-serif text-[3.45rem] leading-[0.9] tracking-[-0.06em] text-[#F4F5F8]">
              {brandName}
            </h3>
            <p className="mt-4 max-w-sm font-serif text-[1.48rem] italic leading-[1.08] text-[rgba(237,237,242,0.9)]">
              {tagline}
            </p>
            <p className="mt-5 text-[10px] uppercase tracking-[0.26em] text-[rgba(237,237,242,0.5)]">
              {genre}
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-base uppercase tracking-[0.14em] text-[rgba(237,237,242,0.92)]">
                RATED {posterScore} · {scoreBand}
              </p>
              <p className="max-w-sm text-sm leading-6 text-[rgba(237,237,242,0.76)]">
                {scoreModifier}
              </p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(237,237,242,0.54)]">
              brandmirror.app
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function MoodboardChipGroup({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={`${label}-${item}`}
            className="rounded-full border border-[color:var(--line)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[color:var(--foreground-soft)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReportCoverCard({
  brandName,
  whatItDoes,
  snapshot,
  reportId,
  overallScore,
  scoreBand,
  locale,
}: {
  brandName: string;
  whatItDoes: string;
  snapshot: string;
  reportId: string;
  overallScore: number;
  scoreBand: string;
  locale: SiteLocale;
}) {
  const coverCopy = {
    en: {
      label: "BrandMirror report",
      meta: "A diagnostic read of what the brand signals and what to fix next",
    },
    es: {
      label: "Reporte BrandMirror",
      meta: "Una lectura diagnóstica de lo que la marca señala y qué corregir después",
    },
    ru: {
      label: "Отчёт BrandMirror",
      meta: "Диагностический разбор того, что сигналит бренд и что исправить дальше",
    },
  }[locale];
  const isLongName = brandName.length > 24;
  return (
    <section className="pb-10">
      <div className="ink-panel report-cover-card rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-7 sm:p-10">
        <p className="section-label text-[rgba(237,237,242,0.6)]">{coverCopy.label}</p>
        <h2
          className="mt-5 font-serif leading-[0.92] tracking-[-0.06em] text-[#F4F5F8]"
          style={{
            fontSize: isLongName ? "clamp(2rem, 5vw, 3.6rem)" : "clamp(3.4rem, 8vw, 6.4rem)",
            wordBreak: "break-word",
          }}
        >
          {brandName}
        </h2>
        {whatItDoes ? (
          <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(237,237,242,0.58)]">
            {whatItDoes}
          </p>
        ) : null}
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[rgba(237,237,242,0.78)]">
          {snapshot}
        </p>
        <div className="report-cover-meta mt-8 flex flex-col gap-3 pt-5 text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <span>{coverCopy.meta}</span>
          <span>{reportId} · {overallScore}/100 · {scoreBand}</span>
        </div>
      </div>
    </section>
  );
}

function ScoreDashboardBlock({
  posterScore,
  scoreBand,
  scoreModifier,
  scorecard,
  scoreLabels,
  locale,
}: {
  posterScore: number;
  scoreBand: string;
  scoreModifier: string;
  scorecard: { label: string; score: number; note: string }[];
  scoreLabels: Record<string, string>;
  locale: SiteLocale;
}) {
  const overallBand = bandFor(posterScore);
  const scoreCopy = {
    en: {
      label: "Score dashboard",
      readiness: "Overall brand readiness",
      reveal: "What the scores reveal",
      body: "Each axis is scored 0–100 across five tiers: Flatlining, Fragile, Developing, Stable, and Leading. The colour of each score reflects which tier that signal currently sits in.",
    },
    es: {
      label: "Panel de puntuaciones",
      readiness: "Preparación general de la marca",
      reveal: "Qué revelan las puntuaciones",
      body: "Cada eje se puntúa de 0 a 100 en cinco niveles: sin señal, frágil, en desarrollo, estable y líder. El color de cada puntuación refleja en qué nivel se encuentra ahora esa señal.",
    },
    ru: {
      label: "Панель оценок",
      readiness: "Общая готовность бренда",
      reveal: "Что показывают оценки",
      body: "Каждая ось оценивается от 0 до 100 по пяти уровням: без сигнала, хрупко, развивается, стабильно и лидирует. Цвет каждой оценки показывает, на каком уровне сейчас находится этот сигнал.",
    },
  }[locale];
  return (
    <section className="pb-10">
      <div className="ink-panel report-score-shell rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-7 sm:p-10">
        <p className="section-label text-[rgba(237,237,242,0.6)]">{scoreCopy.label}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="report-score-core rounded-[1.8rem] p-8 text-center">
            <p className="font-serif text-[clamp(4rem,10vw,6.4rem)] leading-none tracking-[-0.07em] text-[#F4F5F8]">
              {posterScore}/100
            </p>
            <p className="mt-4 text-base leading-7 text-[rgba(237,237,242,0.74)]">
              {scoreCopy.readiness}
            </p>
            <p
              className="mt-5 text-xs uppercase tracking-[0.24em]"
              style={{ color: overallBand.color }}
            >
              {scoreBand}
            </p>
            <p className="mt-4 font-serif text-2xl italic leading-tight text-[rgba(237,237,242,0.92)]">
              {scoreModifier}
            </p>
          </div>
          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="section-label text-[rgba(237,237,242,0.56)]">{scoreCopy.reveal}</p>
              <h3 className="mt-4 max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] text-[#F4F5F8]">
                {scoreModifier}
              </h3>
            </div>
            <div className="editorial-rule border-[rgba(237,237,242,0.12)] pt-5">
              <p className="max-w-xl text-sm leading-7 text-[rgba(237,237,242,0.7)]">
                {scoreCopy.body}
              </p>
            </div>
          </div>
        </div>
        <div className="report-score-grid mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {scorecard.map((row) => {
            const band = bandFor(row.score);
            return (
              <div
                key={row.label}
                className="rounded-[1.4rem] p-4"
                style={{
                  border: `1px solid ${band.color}30`,
                  background: `${band.color}12`,
                }}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(237,237,242,0.56)]">
                  {scoreLabels[row.label] || row.label}
                </p>
                <p
                  className="mt-3 font-serif text-5xl leading-none tracking-[-0.06em]"
                  style={{ color: band.color }}
                >
                  {row.score}
                </p>
                <p className="mt-1 text-[9.5px] uppercase tracking-[0.18em]" style={{ color: band.color, opacity: 0.7 }}>
                  {band.label}
                </p>
                <p className="mt-2 text-xs leading-6 text-[rgba(237,237,242,0.68)]">
                  {row.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getCanonicalOverallScore(report: BrandReport) {
  const scores = report.scorecard.map((item) => item.score);
  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1),
  );
}

function getScoreByLabel(report: BrandReport, label: string, fallbackScore: number) {
  return (
    report.scorecard.find((item) => item.label.toLowerCase() === label.toLowerCase()) ?? {
      label,
      score: fallbackScore,
      note: "",
    }
  );
}

function firstSentence(text = "", fallback = "") {
  const cleaned = (text || fallback || "").trim();
  return cleaned.match(/[^.!?]+[.!?]/)?.[0]?.trim() || cleaned;
}

function buildPdfAlignedScorePages(report: BrandReport, locale: SiteLocale = "en") {
  const overallScore = getCanonicalOverallScore(report);
  const fallbackCopy = {
    en: {
      aiVisibility:
        "AI visibility also depends on clear category nouns, metadata, schema, FAQ support, and consistent naming across the page.",
      conversion:
        "Choose one primary action - Book, Enquire, Buy, Register, or Request a call - and explain what happens after the click.",
    },
    es: {
      aiVisibility:
        "La visibilidad en IA también depende de categorías claras, metadatos, datos estructurados, FAQs y naming consistente en toda la página.",
      conversion:
        "Elige una acción principal - reservar, consultar, comprar, registrarse o solicitar una llamada - y explica qué ocurre después del clic.",
    },
    ru: {
      aiVisibility:
        "Видимость в ИИ также зависит от ясных названий категории, метаданных, структурированных данных, FAQ и единого нейминга по всей странице.",
      conversion:
        "Выбери одно главное действие - забронировать, оставить заявку, купить, зарегистрироваться или запросить звонок - и объясни, что происходит после клика.",
    },
  }[locale];
  const aiVisibilityScore = getScoreByLabel(report, "AI visibility", overallScore).score;
  const aiVisibilityRead = aiVisibilityScore >= 70
    ? report.toneCheck
    : /ai|schema|metadata|crawler|llms|visibility|discoverability|aeo/i.test(report.toneCheck)
    ? report.toneCheck
    : [
        report.toneCheck,
        fallbackCopy.aiVisibility,
      ].filter(Boolean).join(" ");

  return [
    {
      label: "Positioning clarity",
      title: "Positioning Clarity",
      diagnosis: report.positioningRead,
      quote: report.whatsBroken[0] || report.aboveTheFold,
      implication: report.headlineCorrection.currentProblem,
    },
    {
      label: "AI visibility",
      title: "AI Visibility",
      diagnosis: aiVisibilityRead,
      quote: report.audienceMismatch[1] || aiVisibilityRead,
      implication: report.verbalImage.firstScreenTone,
    },
    {
      label: "Visual credibility",
      title: "Visual Credibility",
      diagnosis: report.visualIdentityRead,
      quote: report.whatWorks[0] || report.visualIdentityRead,
      implication: report.mixedSignals,
    },
    {
      label: "Offer specificity",
      title: "Offer Specificity",
      diagnosis: report.aboveTheFold,
      quote: report.namingFit.correction,
      implication: report.offerOpportunities[0] || report.whatsBroken[1] || report.aboveTheFold,
    },
    {
      label: "Conversion readiness",
      title: "Conversion Readiness",
      diagnosis: report.conversionRead,
      quote: report.whyNotConverting[1] || report.conversionRead,
      implication: fallbackCopy.conversion,
    },
  ].map((item) => ({
    ...item,
    score: getScoreByLabel(report, item.label, overallScore),
  }));
}

function getReportFixFirst(report: BrandReport) {
  return (
    report.priorityFixes?.fixNow?.find((item) => item.trim().length > 0) ||
    report.whatToDoNext ||
    report.strategicNextMove ||
    report.headlineCorrection?.rewrittenDirection ||
    report.rewriteSuggestions?.heroLine ||
    ""
  );
}

function PdfAlignedReportSections({
  report,
  labels,
  locale,
  featuredSurface,
  heroCallout,
  proofCallout,
  scoreLabels,
}: {
  report: BrandReport;
  labels: Record<string, string | string[]>;
  locale: SiteLocale;
  featuredSurface?: BrandReport["surfaceCaptures"][number];
  heroCallout?: BrandReport["screenshotCallouts"][number];
  proofCallout?: BrandReport["screenshotCallouts"][number];
  scoreLabels: Record<string, string>;
}) {
  const copy = {
    en: {
      firstRead: "First read",
      firstReadTitle: "What the company does, what it signals, and how the page lands before trust is earned",
      firstDiagnosis: "First diagnosis",
      currentState: "Current state",
      measure: "What we measure",
      measureTitle: "What the report measures",
      measureIntro:
        "BrandMirror reads the brand the way a sharp buyer reads the first screen: before the copy has fully explained itself, before the proof has earned trust, before the click has happened. This report measures five signals that shape that decision: clarity, AI visibility, credibility, specificity, and readiness to act.",
      signalRead: "Signal read",
      signalTitle: "What is missing and where the signal starts to drift",
      surface: "Website surface",
      surfaceTitle: "The live homepage surface behind the diagnosis",
      axisDeepDives: "Axis deep dives",
      axisTitle: "What each score means and what it is costing",
      whatScoreTells: "What the score tells us",
      revealingLine: "Revealing line",
      whatThisMeans: "What this means",
      benchmark: "Benchmark",
      commercial: "Commercial impact",
      commercialTitle: "Current signal, after the fixes, and likely commercial lift",
      commercialNote:
        "This is not a revenue promise. It is a directional read of what changes when the homepage becomes easier to understand, trust, recommend, and act on.",
      currentSignal: "Current signal",
      afterFixes: "After core fixes",
      commercialLift: "Commercial lift",
      competitors: "Competitor intelligence",
      competitorsTitle: "Three peers the buyer may compare against",
      recommendations: "Recommendations",
      recommendationsTitle: "The highest-leverage fixes from the PDF",
      priority: "Priority fix stack",
      priorityTitle: "The editing order before the 30-day implementation map",
      brief: "One page brand brief",
      implementation: "Implementation playbook",
      implementationTitle: "How to execute the priority stack without repeating it",
      now: "Now",
      next: "Next",
      then: "Then",
      days1: "Days 1-7",
      days2: "Days 8-21",
      days3: "Days 22-30",
    },
    es: {
      firstRead: "Primera lectura",
      firstReadTitle: "Qué hace la empresa, qué señala y cómo aterriza la página antes de ganar confianza",
      firstDiagnosis: "Primer diagnóstico",
      currentState: "Estado actual",
      measure: "Qué medimos",
      measureTitle: "Qué mide el reporte",
      measureIntro:
        "BrandMirror lee la marca como la lee un comprador agudo en la primera pantalla: antes de que el copy termine de explicarse, antes de que la prueba gane confianza, antes del clic. Este reporte mide cinco señales que modelan esa decisión: claridad, visibilidad de IA, credibilidad, especificidad y preparación para convertir.",
      signalRead: "Lectura de señal",
      signalTitle: "Qué falta y dónde empieza a desviarse la señal",
      surface: "Superficie del sitio",
      surfaceTitle: "La superficie real de la página principal detrás del diagnóstico",
      axisDeepDives: "Lecturas por eje",
      axisTitle: "Qué significa cada puntuación y qué está costando",
      whatScoreTells: "Qué nos dice la puntuación",
      revealingLine: "Línea reveladora",
      whatThisMeans: "Qué significa",
      benchmark: "Referencia",
      commercial: "Impacto comercial",
      commercialTitle: "Señal actual, después de los arreglos y posible mejora comercial",
      commercialNote:
        "No es una promesa de ingresos. Es una lectura direccional de lo que cambia cuando la página es más fácil de entender, confiar, recomendar y accionar.",
      currentSignal: "Señal actual",
      afterFixes: "Después de los arreglos clave",
      commercialLift: "Mejora comercial",
      competitors: "Inteligencia competitiva",
      competitorsTitle: "Tres pares contra los que el comprador puede comparar",
      recommendations: "Recomendaciones",
      recommendationsTitle: "Los arreglos de mayor apalancamiento del PDF",
      priority: "Pila de prioridades",
      priorityTitle: "El orden de edición antes del mapa de implementación de 30 días",
      brief: "Brief de marca de una página",
      implementation: "Playbook de implementación",
      implementationTitle: "Cómo ejecutar la pila prioritaria sin repetirla",
      now: "Ahora",
      next: "Después",
      then: "Luego",
      days1: "Días 1-7",
      days2: "Días 8-21",
      days3: "Días 22-30",
    },
    ru: {
      firstRead: "Первое считывание",
      firstReadTitle: "Что делает компания, что она сигналит и как страница воспринимается до появления доверия",
      firstDiagnosis: "Первый диагноз",
      currentState: "Текущее состояние",
      measure: "Что мы измеряем",
      measureTitle: "Что измеряет отчёт",
      measureIntro:
        "BrandMirror читает бренд так, как его читает внимательный покупатель на первом экране: до того, как текст всё объяснил, до того, как доказательство заслужило доверие, до клика. Этот отчёт измеряет пять сигналов, которые формируют это решение: ясность, видимость в ИИ, убедительность, конкретность и готовность к действию.",
      signalRead: "Считывание сигнала",
      signalTitle: "Чего не хватает и где сигнал начинает расходиться",
      surface: "Поверхность сайта",
      surfaceTitle: "Живая главная страница, на которой основан диагноз",
      axisDeepDives: "Разбор по осям",
      axisTitle: "Что означает каждая оценка и во что это обходится",
      whatScoreTells: "Что показывает оценка",
      revealingLine: "Показательная строка",
      whatThisMeans: "Что это значит",
      benchmark: "Ориентир",
      commercial: "Коммерческий эффект",
      commercialTitle: "Текущий сигнал, эффект после правок и вероятный коммерческий рост",
      commercialNote:
        "Это не обещание выручки. Это направленный разбор того, что меняется, когда главная страница становится понятнее, убедительнее, проще для рекомендации и действия.",
      currentSignal: "Текущий сигнал",
      afterFixes: "После ключевых правок",
      commercialLift: "Коммерческий рост",
      competitors: "Конкурентная разведка",
      competitorsTitle: "Три игрока, с которыми покупатель может сравнить бренд",
      recommendations: "Рекомендации",
      recommendationsTitle: "Самые сильные правки из PDF",
      priority: "Стек приоритетных правок",
      priorityTitle: "Порядок редактирования до 30-дневной карты внедрения",
      brief: "Бренд-бриф на одну страницу",
      implementation: "Плейбук внедрения",
      implementationTitle: "Как выполнить стек приоритетов без повторов",
      now: "Сейчас",
      next: "Дальше",
      then: "Затем",
      days1: "Дни 1-7",
      days2: "Дни 8-21",
      days3: "Дни 22-30",
    },
  }[locale];

  const overallScore = getCanonicalOverallScore(report);
  const scorePages = buildPdfAlignedScorePages(report, locale);
  const measureCards = {
    en: [
      { title: "Positioning Clarity", body: "Does the buyer know what you are within one read?" },
      { title: "AI Visibility", body: "Can AI tools find, read, and recommend the brand clearly and consistently?" },
      { title: "Visual Credibility", body: "Does the design earn the price and the promise?" },
      { title: "Offer Specificity", body: "Could someone repeat what you sell without your help?" },
      { title: "Conversion Readiness", body: "When someone is ready, is there a door to walk through?" },
    ],
    es: [
      { title: "Claridad de posicionamiento", body: "¿El comprador entiende qué eres en una sola lectura?" },
      { title: "Visibilidad en IA", body: "¿Las herramientas de IA pueden encontrar, leer y recomendar la marca con claridad?" },
      { title: "Credibilidad visual", body: "¿El diseño sostiene el precio y la promesa?" },
      { title: "Especificidad de la oferta", body: "¿Alguien podría repetir lo que vendes sin tu ayuda?" },
      { title: "Preparación para convertir", body: "Cuando alguien está listo, ¿hay una puerta clara por la que avanzar?" },
    ],
    ru: [
      { title: "Ясность позиционирования", body: "Понимает ли покупатель, что это за бренд, с первого считывания?" },
      { title: "Видимость в ИИ", body: "Могут ли инструменты ИИ найти, прочитать и рекомендовать бренд ясно и последовательно?" },
      { title: "Визуальная убедительность", body: "Зарабатывает ли дизайн заявленную цену и обещание?" },
      { title: "Точность предложения", body: "Сможет ли человек повторить, что вы продаёте, без вашей помощи?" },
      { title: "Готовность к конверсии", body: "Когда человек готов, есть ли понятная дверь для следующего шага?" },
    ],
  }[locale];
  const scoreAverage = scorePages.reduce((sum, item) => sum + item.score.score, 0) / Math.max(scorePages.length, 1);
  const localizedFlowCopy = {
    en: {
      currentSignal: [
        "Right now the homepage likely leaks too much clarity to convert weak attention into steady qualified demand.",
        "The current signal is credible, but the offer, proof, and CTA still are not working together tightly enough.",
        "The page already carries some trust, but the upside only becomes real if the sharpened message gets repeated beyond the homepage.",
      ],
      recommendations: [
        {
          title: scoreLabels["AI visibility"] || "AI Visibility",
          body:
            "If someone asks ChatGPT, Perplexity, or Google AI Overview about this category, the brand needs clearer entity signals before it becomes easy to surface.",
          fix:
            "Add entity definition, FAQ/schema support, consistent category nouns, metadata, and crawler-friendly technical signals.",
        },
        {
          title: scoreLabels["Offer specificity"] || "Offer Clarity",
          body:
            "The services exist, but they are not named sharply enough. Category language describes the space, not the thing a buyer can purchase.",
          fix:
            "Name the core offers, give each one an outcome statement, and make the homepage answer: what do I get, and what changes for me?",
        },
        {
          title: scoreLabels["Conversion readiness"] || "Conversion Logic",
          body:
            "Interest can arrive before the path forward feels obvious. The page needs one primary action that dominates the decision zone.",
          fix:
            "Choose one route - Book, Enquire, Buy, Register, or Request a call. Place it in the hero, repeat it after proof, and explain what happens next.",
        },
      ],
      sprintNow: [
        "Rewrite the opening promise so it names the buyer, offer, and outcome in one read.",
        "Clarify why the existing CTA is the right next move.",
        "Remove vague mood copy that does not explain what is being sold.",
      ],
      sprintNext: [
        "Keep exact category nouns consistent across the H1, title tag, meta description, schema, and profiles.",
        "Tighten section hierarchy so each block earns trust before asking for action.",
        "Turn broad service language into 2-3 concrete use cases or deliverables.",
      ],
      sprintThen: [
        "Turn the sharpened message into service pages, proof blocks, and sales assets.",
        "Keep FAQ support and naming consistent so external systems can read the brand clearly.",
        "Review CTA clicks, enquiry quality, and proof order; tighten what still creates hesitation.",
      ],
    },
    es: {
      currentSignal: [
        "Ahora mismo la homepage pierde demasiada claridad como para convertir atención débil en demanda cualificada constante.",
        "La señal actual es creíble, pero la oferta, la prueba y el CTA todavía no trabajan juntos con suficiente precisión.",
        "La página ya sostiene cierta confianza, pero el potencial solo se vuelve real si el mensaje afinado se repite más allá de la homepage.",
      ],
      recommendations: [
        {
          title: scoreLabels["AI visibility"] || "Visibilidad en IA",
          body:
            "Si alguien pregunta a ChatGPT, Perplexity o Google AI Overview sobre esta categoría, la marca necesita señales de entidad más claras para aparecer con facilidad.",
          fix:
            "Añadir definición de entidad, soporte de FAQ/datos estructurados, nombres de categoría consistentes, metadatos y señales técnicas fáciles de rastrear.",
        },
        {
          title: scoreLabels["Offer specificity"] || "Claridad de oferta",
          body:
            "Los servicios existen, pero no están nombrados con suficiente precisión. El lenguaje de categoría describe el espacio, no lo que el comprador puede comprar.",
          fix:
            "Nombrar las ofertas principales, dar a cada una una promesa de resultado y hacer que la homepage responda: qué recibo y qué cambia para mí.",
        },
        {
          title: scoreLabels["Conversion readiness"] || "Lógica de conversión",
          body:
            "El interés puede llegar antes de que el camino hacia delante se sienta obvio. La página necesita una acción principal que domine la zona de decisión.",
          fix:
            "Elegir una ruta - reservar, consultar, comprar, registrarse o solicitar una llamada. Ponerla en el hero, repetirla después de la prueba y explicar qué ocurre después.",
        },
      ],
      sprintNow: [
        "Reescribir la promesa inicial para que nombre comprador, oferta y resultado en una sola lectura.",
        "Elegir el evento principal de conversión y hacer explícito el CTA.",
        "Eliminar copy de ambiente que no explica qué se vende.",
      ],
      sprintNext: [
        "Mantener nombres de categoría consistentes en H1, title tag, meta description, datos estructurados y perfiles.",
        "Ajustar la jerarquía de secciones para que cada bloque gane confianza antes de pedir acción.",
        "Convertir lenguaje amplio de servicios en 2-3 casos de uso o entregables concretos.",
      ],
      sprintThen: [
        "Convertir el mensaje afinado en páginas de servicio, bloques de prueba y activos de venta.",
        "Mantener FAQs y naming consistente para que los sistemas externos puedan leer la marca con claridad.",
        "Revisar clics de CTA, calidad de consultas y orden de prueba; ajustar lo que aún crea duda.",
      ],
    },
    ru: {
      currentSignal: [
        "Сейчас главная страница, скорее всего, теряет слишком много ясности, чтобы превращать слабое внимание в стабильный квалифицированный спрос.",
        "Текущий сигнал выглядит убедительно, но предложение, доказательства и CTA всё ещё не работают вместе достаточно точно.",
        "Страница уже несёт часть доверия, но рост станет реальным только если уточнённое сообщение начнёт повторяться за пределами главной страницы.",
      ],
      recommendations: [
        {
          title: scoreLabels["AI visibility"] || "Видимость в ИИ",
          body:
            "Если человек спросит ChatGPT, Perplexity или Google AI Overview об этой категории, бренду нужны более ясные сигналы сущности, чтобы его было легче найти.",
          fix:
            "Добавить определение сущности, FAQ/структурированные данные, единые названия категории, метаданные и технические сигналы, доступные для поисковых роботов.",
        },
        {
          title: scoreLabels["Offer specificity"] || "Ясность предложения",
          body:
            "Услуги есть, но они названы недостаточно точно. Категорийный язык описывает пространство, а не то, что покупатель может купить.",
          fix:
            "Назвать ключевые предложения, дать каждому обещание результата и сделать так, чтобы главная страница отвечала: что я получаю и что для меня меняется.",
        },
        {
          title: scoreLabels["Conversion readiness"] || "Логика конверсии",
          body:
            "Интерес может появиться раньше, чем путь вперёд станет очевидным. Странице нужно одно главное действие, которое ведёт зону решения.",
          fix:
            "Выбрать один путь - забронировать, оставить заявку, купить, зарегистрироваться или запросить звонок. Поставить его в hero, повторить после доказательств и объяснить, что будет дальше.",
        },
      ],
      sprintNow: [
        "Переписать первое обещание так, чтобы в одном считывании были покупатель, предложение и результат.",
        "Выбрать главное конверсионное действие и сделать CTA явным.",
        "Убрать атмосферный текст, который не объясняет, что именно продаётся.",
      ],
      sprintNext: [
        "Держать точные названия категории едиными в H1, title tag, meta description, structured data и внешних профилях.",
        "Уточнить иерархию секций, чтобы каждый блок зарабатывал доверие до просьбы о действии.",
        "Превратить широкий язык услуг в 2-3 конкретных сценария использования или результата.",
      ],
      sprintThen: [
        "Развернуть уточнённое сообщение в страницы услуг, блоки доказательств и материалы продаж.",
        "Поддерживать FAQ и единый нейминг, чтобы внешние системы могли ясно прочитать бренд.",
        "Проверить клики по CTA, качество заявок и порядок доказательств; усилить то, что всё ещё вызывает сомнение.",
      ],
    },
  }[locale];
  const currentSignalSummary =
    scoreAverage < 65
      ? localizedFlowCopy.currentSignal[0]
      : scoreAverage < 78
        ? localizedFlowCopy.currentSignal[1]
        : localizedFlowCopy.currentSignal[2];
  const aiScore = getScoreByLabel(report, "AI visibility", overallScore).score;
  const conversionScore = getScoreByLabel(report, "Conversion readiness", overallScore).score;
  const recommendationRows = [
    {
      ...localizedFlowCopy.recommendations[0],
      ...(aiScore >= 70
        ? {
            body:
              "The AI-readable layer is already functioning. The opportunity is consistency, not a rebuild.",
            fix:
              "Keep the same category nouns, service names, proof language, and metadata across pages, FAQs, profiles, and directory listings.",
          }
        : {}),
      score: aiScore,
    },
    {
      ...localizedFlowCopy.recommendations[1],
      score: getScoreByLabel(report, "Offer specificity", overallScore).score,
    },
    {
      ...localizedFlowCopy.recommendations[2],
      ...(conversionScore >= 70
        ? {
            body:
              "The action path exists. The next gain is making proof, expectations, and the primary route feel more connected.",
            fix:
              "Keep one primary CTA dominant, then place proof and a plain what-happens-next line close to that existing action.",
          }
        : {}),
      score: conversionScore,
    },
  ];
  const sprintNow = [
    recommendationRows[1]?.fix,
    recommendationRows[2]?.fix,
    localizedFlowCopy.sprintNow[2],
  ].filter(Boolean);
  const sprintNext = [
    localizedFlowCopy.sprintNext[1],
    recommendationRows[0]?.fix,
    localizedFlowCopy.sprintNext[2],
  ].filter(Boolean);
  const extendLanguageLine =
    locale === "es"
      ? "Extender el lenguaje afinado a páginas de servicio, bloques de prueba, activos de venta y perfiles externos."
      : locale === "ru"
        ? "Развернуть уточнённый язык в страницы услуг, блоки доказательств, материалы продаж и внешние профили."
        : "Extend the refined language into service pages, proof blocks, sales assets, and partner profiles.";
  const sprintThen = [
    localizedFlowCopy.sprintThen[2],
    extendLanguageLine,
  ].filter(Boolean);

  return (
    <>
      <section className="grid gap-8 pb-10 lg:grid-cols-[0.95fr_1.05fr]">
        <ReportSection
          label={copy.firstRead}
          title={copy.firstReadTitle}
          body={report.whatItDoes}
        />
        <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
          <p className="section-label text-[rgba(237,237,242,0.58)]">{copy.firstDiagnosis}</p>
          <p className="mt-5 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
            {report.snapshot}
          </p>
          <div className="editorial-rule mt-6 border-[rgba(237,237,242,0.12)] pt-6">
            <p className="section-label text-[rgba(237,237,242,0.58)]">{copy.currentState}</p>
            <p className="mt-4 text-base leading-7 text-[rgba(237,237,242,0.74)]">
              {report.whatItSignals}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
          <p className="section-label text-[rgba(237,237,242,0.58)]">{copy.measure}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
            {copy.measureTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(237,237,242,0.74)]">
            {copy.measureIntro}
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {measureCards.map((item) => {
              return (
                <article key={item.title} className="rounded-[1.35rem] border border-[rgba(237,237,242,0.12)] bg-[rgba(237,237,242,0.045)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(237,237,242,0.56)]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[rgba(237,237,242,0.68)]">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-8 pb-10 lg:grid-cols-2">
        <ReportSection label={copy.signalRead} title={copy.signalTitle} body={report.whatIsMissing} />
        <ReportSection label={labels.mixedSignalsLabel} title={labels.mixedSignalsTitle} body={report.mixedSignals} />
      </section>

      <section className="pb-10">
        <div className="editorial-rule pt-8">
          <p className="section-label">{copy.surface}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
            {copy.surfaceTitle}
          </h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <VisualCropCard
            label={labels.heroFrame}
            title={heroCallout?.title || labels.heroPromise}
            body={heroCallout?.body || report.aboveTheFold}
            imageUrl={featuredSurface?.imageUrl}
            focusX={heroCallout?.x || 18}
            focusY={heroCallout?.y || 18}
            aspectClass="aspect-[6/5]"
          />
          <VisualCropCard
            label={labels.decisionFrame}
            title={proofCallout?.title || labels.proofCtaZone}
            body={proofCallout?.body || report.conversionRead}
            imageUrl={featuredSurface?.imageUrl}
            focusX={proofCallout?.x || 62}
            focusY={proofCallout?.y || 62}
            aspectClass="aspect-[6/5]"
          />
        </div>
      </section>

      <section className="pb-10">
        <div className="editorial-rule pt-8">
          <p className="section-label">{copy.axisDeepDives}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
            {copy.axisTitle}
          </h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {scorePages.map((item) => {
            const band = bandFor(item.score.score);
            return (
              <article key={`deep-${item.label}`} className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="section-label text-[rgba(237,237,242,0.58)]">{scoreLabels[item.label] || item.title}</p>
                    <h3 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                      {copy.whatScoreTells}
                    </h3>
                  </div>
                  <p className="font-serif text-6xl leading-none tracking-[-0.06em]" style={{ color: band.color }}>
                    {item.score.score}
                  </p>
                </div>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">{item.diagnosis}</p>
                <div className="editorial-rule mt-6 grid gap-5 border-[rgba(237,237,242,0.12)] pt-6 md:grid-cols-2">
                  <div>
                    <p className="section-label text-[rgba(237,237,242,0.56)]">{copy.revealingLine}</p>
                    <p className="mt-3 text-sm leading-7 text-[rgba(237,237,242,0.74)]">{firstSentence(item.quote)}</p>
                  </div>
                  <div>
                    <p className="section-label text-[rgba(237,237,242,0.56)]">{copy.whatThisMeans}</p>
                    <p className="mt-3 text-sm leading-7 text-[rgba(237,237,242,0.74)]">{item.implication}</p>
                  </div>
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.18em]" style={{ color: band.color }}>
                  {copy.benchmark}: {band.label}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 pb-10 lg:grid-cols-3">
        <ReportSection label={copy.commercial} title={copy.currentSignal} body={currentSignalSummary} />
        <ReportSection label={copy.afterFixes} title={copy.commercialTitle} body={copy.commercialNote} />
        <ReportSection label={copy.commercialLift} title={labels.strategicTitle} body={report.strategicDirection} />
      </section>

      {report.competitiveLandscape?.competitors?.length ? (
        <section className="pb-10">
          <div className="editorial-rule pt-8">
            <p className="section-label">{copy.competitors}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
              {copy.competitorsTitle}
            </h2>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {report.competitiveLandscape.competitors.slice(0, 3).map((competitor) => (
              <article key={competitor.url} className="ink-panel rounded-[1.8rem] border border-[rgba(237,237,242,0.14)] p-6">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{competitor.url.replace(/^https?:\/\//, "")}</p>
                <h3 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {competitor.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[rgba(237,237,242,0.72)]">
                  {competitor.strengths[0] || competitor.snapshot}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="pb-10">
        <div className="editorial-rule pt-8">
          <p className="section-label">{copy.recommendations}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
            {copy.recommendationsTitle}
          </h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {recommendationRows.map((row) => {
            const band = bandFor(row.score);
            return (
              <article key={row.title} className="ink-panel rounded-[1.8rem] border border-[rgba(237,237,242,0.14)] p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-3xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">{row.title}</h3>
                  <p className="font-serif text-5xl leading-none tracking-[-0.06em]" style={{ color: band.color }}>
                    {row.score}
                  </p>
                </div>
                <p className="mt-5 text-sm leading-7 text-[rgba(237,237,242,0.72)]">{row.body}</p>
                <p className="mt-5 text-sm leading-7 text-[#F4F5F8]">{row.fix}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 pb-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
          <p className="section-label">{copy.priority}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
            {copy.priorityTitle}
          </h2>
          <div className="editorial-rule mt-6 space-y-6 border-[rgba(237,237,242,0.12)] pt-6">
            {[
              [labels.fixNow, report.priorityFixes.fixNow, "#E07A5F"],
              [labels.fixNext, report.priorityFixes.fixNext, "#E8B04C"],
              [labels.keep, report.priorityFixes.keep, "#6FE0C2"],
            ].map(([label, items, color]) => (
              <div key={label as string}>
                <p className="text-sm uppercase tracking-[0.18em]" style={{ color: color as string }}>
                  {label as string}
                </p>
                <div className="mt-3 space-y-3">
                  {(items as string[]).slice(0, 2).map((item) => (
                    <p key={item} className="text-sm leading-7 text-[rgba(237,237,242,0.72)]">{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
          <p className="section-label">{copy.brief}</p>
          <div className="editorial-rule mt-6 space-y-5 border-[rgba(237,237,242,0.12)] pt-6">
            <p className="text-base leading-7 text-[#F4F5F8]">{report.rewriteSuggestions.heroLine}</p>
            <p className="text-sm leading-7 text-[rgba(237,237,242,0.72)]">{report.rewriteSuggestions.subheadline}</p>
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--accent)]">{report.rewriteSuggestions.cta}</p>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="editorial-rule pt-8">
          <p className="section-label">{copy.implementation}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
            {copy.implementationTitle}
          </h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            [copy.now, copy.days1, sprintNow, "#E07A5F"],
            [copy.next, copy.days2, sprintNext, "#E8B04C"],
            [copy.then, copy.days3, sprintThen, "#6FE0C2"],
          ].map(([title, days, items, color]) => (
            <article key={title as string} className="ink-panel rounded-[1.8rem] border border-[rgba(237,237,242,0.14)] p-6">
              <p className="section-label" style={{ color: color as string }}>{days as string}</p>
              <h3 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">{title as string}</h3>
              <div className="editorial-rule mt-5 space-y-3 border-[rgba(237,237,242,0.12)] pt-5">
                {(items as string[]).map((item) => (
                  <p key={item} className="text-sm leading-7 text-[rgba(237,237,242,0.72)]">{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function FullReportExperience({
  locale,
  initialUrl = "",
  paymentSessionId = null,
  accessError = "",
}: {
  locale: SiteLocale;
  initialUrl?: string;
  paymentRequired?: boolean;
  paymentUnlocked?: boolean;
  paymentSessionId?: string | null;
  accessError?: string;
}) {
  const copy = siteI18n.siteCopy[locale].fullReport;
  const labels = {
    en: {
      whatItDoes: "What the company appears to do",
      snapshot: "Snapshot",
      signalsLabel: "What it signals",
      signalsTitle: "How the brand comes across right now",
      missingLabel: "What is missing",
      missingTitle: "What the site still is not making clear enough",
      mixedSignalsLabel: "Mixed signals",
      mixedSignalsTitle: "Where the visual and verbal layers drift apart",
      nextLabel: "What to do next",
      nextTitle: "What needs to change first",
      amplifyLabel: "What to amplify",
      amplifyTitle: "What is already helping the brand",
      dropLabel: "What to drop",
      dropTitle: "What is weakening the read",
      worksLabel: "What works",
      worksTitle: "What is already working",
      brokenLabel: "What's broken",
      brokenTitle: "What is costing trust",
      convertLabel: "Why it is not converting",
      convertTitle: "Why the page is not closing the gap",
      audienceMismatchLabel: "Audience mismatch",
      audienceMismatchTitle: "Where the message is missing the buyer",
      fixLabel: "What to fix first",
      fixTitle: "The first fixes with the biggest upside",
      audienceRead: "Audience read",
      audienceTitle: "Who they are and what they still need to hear",
      tone: "Tone of voice",
      looking: "What they are looking for",
      feel: "What they need to feel",
      hear: "What they need to hear",
      strategic: "Strategic direction",
      strategicTitle: "What this brand needs to become clearer about",
      frameLabel: "Strategic frame",
      frameTitle: "What this report is forcing",
      archetype: "Archetype read",
      knownFor: "What this brand should be known for",
      industryFit: "Industry fit",
      expectationGap: "Expectation gap",
      verbalImage: "Verbal image",
      namingFit: "Naming fit",
      headlineCorrection: "Headline correction logic",
      tests: "Archetype tests",
      trustGaps: "Trust gaps",
      frictionMap: "Friction map",
      positioningMoves: "Positioning strategy",
      messagingPriorities: "Messaging strategy",
      offerStrategy: "Offer strategy",
      fixNow: "Fix now",
      fixNext: "Fix next",
      keep: "Keep",
      campaignAngles: "Campaign direction",
      action7: "Next 7 days",
      action30: "Next 30 days",
      brandMyth: "Brand myth",
      brandMythTitle: "The legend this brand is already trying to tell",
      verbalImageTitle: "What the name, hero line, and first-screen tone are teaching people to expect",
      nameSignal: "Name signal",
      headlineSignal: "Headline signal",
      firstScreenTone: "First-screen tone",
      risk: "Risk",
      verdict: "Verdict",
      roleMatch: "Role match",
      correction: "Correction",
      archetypeTestsTitle: "Which archetypal tests the brand is still failing",
      namingFitTitle: "Whether the name is helping the sale or making the homepage do extra work",
      headlineCorrectionTitle: "How the first line has to change to close the gap faster",
      currentProblem: "Current problem",
      correctionLogic: "Correction logic",
      rewrittenDirection: "Rewritten direction",
      knownForTitle: "The answer to ‘what is this brand actually known for?’",
      industryFitTitle: "Category expectation versus the role this brand is trying to play",
      expectedArchetype: "Expected archetype",
      aestheticDirections: "Aesthetic directions",
      aestheticDirectionsTitle: "The aesthetic lanes this brand can credibly own",
      direction: "Direction",
      culturalAssociations: "Cultural associations",
      filmsAndEras: "Films and eras",
      artAndMusic: "Art and music",
      film: "Film",
      era: "Era",
      art: "Art",
      music: "Music",
      visualCodes: "Visual codes",
      visualCodesTitle: "What the brand should look like in detail",
      palette: "Palette",
      textures: "Textures",
      symbols: "Symbols",
      forms: "Forms",
      visualEvidenceStrip: "Visual evidence strip",
      visualEvidenceTitle: "The first screen, isolated into the two moments that matter most",
      visualEvidenceBody: "Instead of scattering the report across too many visuals, this pulls focus back to the homepage itself: the promise the buyer sees first, and the decision zone where trust either lands or drops.",
      heroFrame: "Hero frame",
      heroPromise: "Hero promise",
      decisionFrame: "Decision frame",
      proofCtaZone: "Proof and CTA zone",
      beforeAfterHeroFrame: "Before / after hero frame",
      beforeAfterHeroTitle: "The current promise versus the sharper version this brand wants",
      beforeAfterHeroBody: "This is where the report shifts from diagnosis into a more directed visual strategy: what the hero is doing now, and what a clearer commercial version could feel like without losing atmosphere.",
      websiteCapture: "Website capture",
      websiteCaptureTitle: "The live homepage surface this diagnosis is based on",
      websiteCaptureBody: "One clean capture is enough here. The goal is not to pile on visuals, but to tie the diagnosis back to the real page without repeating the same evidence in three different ways.",
      websiteEvidence: "Website evidence",
      openSurface: "Open surface",
      noLivePreview: "No live preview available yet for this surface.",
      positioningRead: "Positioning read",
      positioningReadTitle: "What the offer is saying",
      visualIdentity: "Visual identity",
      visualIdentityTitle: "What the visual system implies",
      aboveTheFold: "Above the fold",
      aboveTheFoldTitle: "What happens in the first screen",
      commercialRead: "Commercial read",
      commercialReadTitle: "What is helping or slowing the next step",
      frictionMapTitle: "Where the page is losing certainty",
      trustGapsTitle: "What still needs to be proven",
      offerOpportunities: "Offer opportunities",
      offerOpportunitiesTitle: "Where the commercial story can get sharper",
      positioningStrategyTitle: "How the brand should be framed",
      messagingStrategyTitle: "What the communication must do",
      offerStrategyTitle: "How the offer should feel easier to buy",
      rewriteSuggestions: "Rewrite suggestions",
      heroLine: "Hero line",
      subheadline: "Subheadline",
      cta: "CTA",
      action30Title: "Your roadmap for the next 30 days",
      whatComesNext: "What comes next",
      whatComesNextTitle: "Three ways to use this diagnosis",
      nextUseCases: [
        "Do it yourself — use the fix stack and action plan as your roadmap.",
        "BrandMirror Reviewed — guided walkthrough of the diagnosis and next moves.",
        "Work with Sahar — turn the diagnosis into a full brand and website rebuild.",
      ],
      strategicContinuation: "Strategic continuation",
      strategicContinuationTitle: "What this strategy should extend into next",
    },
    es: {
      whatItDoes: "Lo que parece hacer la empresa",
      snapshot: "Resumen",
      signalsLabel: "Lo que está señalando",
      signalsTitle: "Cómo se percibe la marca ahora mismo",
      missingLabel: "Lo que falta",
      missingTitle: "Lo que el sitio todavía no está dejando claro",
      mixedSignalsLabel: "Señales mezcladas",
      mixedSignalsTitle: "Dónde se separan lo visual y lo verbal",
      nextLabel: "Qué hacer después",
      nextTitle: "Qué debe cambiar primero",
      amplifyLabel: "Qué amplificar",
      amplifyTitle: "Qué ya está ayudando a la marca",
      dropLabel: "Qué soltar",
      dropTitle: "Qué está debilitando la lectura",
      worksLabel: "Qué funciona",
      worksTitle: "Lo que ya está funcionando",
      brokenLabel: "Qué está roto",
      brokenTitle: "Lo que está costando confianza",
      convertLabel: "Por qué no convierte",
      convertTitle: "Por qué la página no está cerrando la brecha",
      audienceMismatchLabel: "Desajuste de audiencia",
      audienceMismatchTitle: "Dónde el mensaje está fallando al comprador",
      fixLabel: "Qué corregir primero",
      fixTitle: "Las primeras correcciones con mayor ventaja",
      audienceRead: "Lectura de audiencia",
      audienceTitle: "Quiénes son y qué todavía necesitan oír",
      tone: "Tono de voz",
      looking: "Qué están buscando",
      feel: "Qué necesitan sentir",
      hear: "Qué necesitan oír",
      strategic: "Dirección estratégica",
      strategicTitle: "Qué necesita aclarar mejor esta marca",
      frameLabel: "Marco estratégico",
      frameTitle: "Lo que este reporte obliga a aclarar",
      archetype: "Lectura de arquetipo",
      knownFor: "Por qué debería ser conocida esta marca",
      industryFit: "Encaje con la categoría",
      expectationGap: "Brecha de expectativas",
      verbalImage: "Imagen verbal",
      namingFit: "Encaje del nombre",
      headlineCorrection: "Lógica de corrección del titular",
      tests: "Pruebas arquetípicas",
      trustGaps: "Brechas de confianza",
      frictionMap: "Mapa de fricción",
      positioningMoves: "Estrategia de posicionamiento",
      messagingPriorities: "Estrategia de mensaje",
      offerStrategy: "Estrategia de oferta",
      fixNow: "Arreglar ahora",
      fixNext: "Arreglar después",
      keep: "Mantener",
      campaignAngles: "Dirección de campaña",
      action7: "Próximos 7 días",
      action30: "Próximos 30 días",
      brandMyth: "Mito de marca",
      brandMythTitle: "La leyenda que esta marca ya intenta contar",
      verbalImageTitle: "Lo que el nombre, la frase principal y el tono del primer pantallazo enseñan a esperar",
      nameSignal: "Señal del nombre",
      headlineSignal: "Señal del titular",
      firstScreenTone: "Tono del primer pantallazo",
      risk: "Riesgo",
      verdict: "Veredicto",
      roleMatch: "Encaje con el rol",
      correction: "Corrección",
      archetypeTestsTitle: "Qué pruebas arquetípicas la marca todavía no supera",
      namingFitTitle: "Si el nombre ayuda a vender o hace que la página principal trabaje de más",
      headlineCorrectionTitle: "Cómo debe cambiar la primera frase para cerrar la brecha más rápido",
      currentProblem: "Problema actual",
      correctionLogic: "Lógica de corrección",
      rewrittenDirection: "Dirección reescrita",
      knownForTitle: "La respuesta a “por qué se conoce realmente esta marca”",
      industryFitTitle: "Expectativa de la categoría frente al rol que esta marca intenta ocupar",
      expectedArchetype: "Arquetipo esperado",
      aestheticDirections: "Direcciones estéticas",
      aestheticDirectionsTitle: "Los carriles estéticos que esta marca puede poseer con credibilidad",
      direction: "Dirección",
      culturalAssociations: "Asociaciones culturales",
      filmsAndEras: "Películas y épocas",
      artAndMusic: "Arte y música",
      film: "Película",
      era: "Época",
      art: "Arte",
      music: "Música",
      visualCodes: "Códigos visuales",
      visualCodesTitle: "Cómo debería verse la marca en detalle",
      palette: "Paleta",
      textures: "Texturas",
      symbols: "Símbolos",
      forms: "Formas",
      visualEvidenceStrip: "Tira de evidencia visual",
      visualEvidenceTitle: "El primer pantallazo, aislado en los dos momentos que más importan",
      visualEvidenceBody: "En lugar de dispersar el reporte en demasiados elementos visuales, esto devuelve el foco a la página principal: la promesa que el comprador ve primero y la zona de decisión donde la confianza aterriza o cae.",
      heroFrame: "Marco principal",
      heroPromise: "Promesa principal",
      decisionFrame: "Marco de decisión",
      proofCtaZone: "Zona de prueba y llamada",
      beforeAfterHeroFrame: "Antes / después del marco principal",
      beforeAfterHeroTitle: "La promesa actual frente a la versión más precisa que esta marca necesita",
      beforeAfterHeroBody: "Aquí el reporte pasa del diagnóstico a una estrategia visual más dirigida: qué hace ahora el primer pantallazo y cómo podría sentirse una versión comercial más clara sin perder atmósfera.",
      websiteCapture: "Captura del sitio",
      websiteCaptureTitle: "La superficie real de la página principal en la que se basa este diagnóstico",
      websiteCaptureBody: "Una captura limpia es suficiente aquí. El objetivo no es acumular visuales, sino conectar el diagnóstico con la página real sin repetir la misma evidencia de tres maneras.",
      websiteEvidence: "Evidencia del sitio",
      openSurface: "Abrir superficie",
      noLivePreview: "Todavía no hay vista previa en vivo para esta superficie.",
      positioningRead: "Lectura de posicionamiento",
      positioningReadTitle: "Qué está diciendo la oferta",
      visualIdentity: "Identidad visual",
      visualIdentityTitle: "Qué implica el sistema visual",
      aboveTheFold: "Primer pantallazo",
      aboveTheFoldTitle: "Qué ocurre en el primer pantallazo",
      commercialRead: "Lectura comercial",
      commercialReadTitle: "Qué ayuda o frena el siguiente paso",
      frictionMapTitle: "Dónde la página pierde certeza",
      trustGapsTitle: "Lo que todavía necesita demostrarse",
      offerOpportunities: "Oportunidades de oferta",
      offerOpportunitiesTitle: "Dónde la historia comercial puede volverse más precisa",
      positioningStrategyTitle: "Cómo debería enmarcarse la marca",
      messagingStrategyTitle: "Qué debe hacer la comunicación",
      offerStrategyTitle: "Cómo hacer que la oferta se sienta más fácil de comprar",
      rewriteSuggestions: "Sugerencias de reescritura",
      heroLine: "Frase principal",
      subheadline: "Subtítulo",
      cta: "Llamada a la acción",
      action30Title: "Tu hoja de ruta para los próximos 30 días",
      whatComesNext: "Qué viene después",
      whatComesNextTitle: "Tres formas de usar este diagnóstico",
      nextUseCases: [
        "Hazlo tú: usa la pila de correcciones y el plan de acción como hoja de ruta.",
        "BrandMirror revisado: recorrido guiado por el diagnóstico y los próximos movimientos.",
        "Trabaja con Sahar: convierte el diagnóstico en una reconstrucción completa de marca y sitio web.",
      ],
      strategicContinuation: "Continuación estratégica",
      strategicContinuationTitle: "En qué debería extenderse esta estrategia después",
    },
    ru: {
      whatItDoes: "Чем, похоже, занимается компания",
      snapshot: "Снимок",
      signalsLabel: "Что он сообщает",
      signalsTitle: "Как бренд считывается прямо сейчас",
      missingLabel: "Чего не хватает",
      missingTitle: "Что сайт всё ещё не проясняет достаточно быстро",
      mixedSignalsLabel: "Смешанные сигналы",
      mixedSignalsTitle: "Где визуальный и вербальный слои расходятся",
      nextLabel: "Что делать дальше",
      nextTitle: "Что должно измениться первым",
      amplifyLabel: "Что усилить",
      amplifyTitle: "Что уже помогает бренду",
      dropLabel: "Что убрать",
      dropTitle: "Что ослабляет этот разбор",
      worksLabel: "Что работает",
      worksTitle: "Что уже работает",
      brokenLabel: "Что сломано",
      brokenTitle: "Что стоит доверия",
      convertLabel: "Почему не конвертирует",
      convertTitle: "Почему страница не закрывает этот разрыв",
      audienceMismatchLabel: "Несовпадение с аудиторией",
      audienceMismatchTitle: "Где сообщение не попадает в покупателя",
      fixLabel: "Что исправить первым",
      fixTitle: "Первые исправления с самым большим эффектом",
      audienceRead: "Разбор аудитории",
      audienceTitle: "Кто они и что им всё ещё нужно услышать",
      tone: "Тон голоса",
      looking: "Что они ищут",
      feel: "Что им нужно почувствовать",
      hear: "Что им нужно услышать",
      strategic: "Стратегическое направление",
      strategicTitle: "В чём этому бренду нужно стать яснее",
      frameLabel: "Стратегическая рамка",
      frameTitle: "К чему подталкивает этот отчёт",
      archetype: "Архетипный разбор",
      knownFor: "Чем этот бренд должен быть известен",
      industryFit: "Соответствие категории",
      expectationGap: "Разрыв ожиданий",
      verbalImage: "Вербальный образ",
      namingFit: "Соответствие названия",
      headlineCorrection: "Логика коррекции заголовка",
      tests: "Архетипические проверки",
      trustGaps: "Разрывы доверия",
      frictionMap: "Карта трения",
      positioningMoves: "Стратегия позиционирования",
      messagingPriorities: "Стратегия сообщения",
      offerStrategy: "Стратегия оффера",
      fixNow: "Исправить сейчас",
      fixNext: "Исправить следом",
      keep: "Оставить",
      campaignAngles: "Направление кампании",
      action7: "Следующие 7 дней",
      action30: "Следующие 30 дней",
      brandMyth: "Миф бренда",
      brandMythTitle: "Легенда, которую этот бренд уже пытается рассказать",
      verbalImageTitle: "Чему название, первая фраза и тон первого экрана учат людей ожидать",
      nameSignal: "Сигнал названия",
      headlineSignal: "Сигнал заголовка",
      firstScreenTone: "Тон первого экрана",
      risk: "Риск",
      verdict: "Вердикт",
      roleMatch: "Соответствие роли",
      correction: "Коррекция",
      archetypeTestsTitle: "Какие архетипические проверки бренд всё ещё не проходит",
      namingFitTitle: "Помогает ли название продаже или заставляет главную страницу работать за него",
      headlineCorrectionTitle: "Как должна измениться первая строка, чтобы быстрее закрыть разрыв",
      currentProblem: "Текущая проблема",
      correctionLogic: "Логика коррекции",
      rewrittenDirection: "Переписанное направление",
      knownForTitle: "Ответ на вопрос: чем этот бренд на самом деле должен быть известен",
      industryFitTitle: "Ожидание категории против роли, которую пытается занять бренд",
      expectedArchetype: "Ожидаемый архетип",
      aestheticDirections: "Эстетические направления",
      aestheticDirectionsTitle: "Эстетические линии, которые этот бренд может убедительно занять",
      direction: "Направление",
      culturalAssociations: "Культурные ассоциации",
      filmsAndEras: "Фильмы и эпохи",
      artAndMusic: "Искусство и музыка",
      film: "Фильм",
      era: "Эпоха",
      art: "Искусство",
      music: "Музыка",
      visualCodes: "Визуальные коды",
      visualCodesTitle: "Как бренд должен выглядеть в деталях",
      palette: "Палитра",
      textures: "Текстуры",
      symbols: "Символы",
      forms: "Формы",
      visualEvidenceStrip: "Лента визуальных доказательств",
      visualEvidenceTitle: "Первый экран, разделённый на два самых важных момента",
      visualEvidenceBody: "Вместо того чтобы распылять отчёт на слишком много визуалов, этот блок возвращает фокус к самой главной странице: обещанию, которое покупатель видит первым, и зоне решения, где доверие либо закрепляется, либо падает.",
      heroFrame: "Главный кадр",
      heroPromise: "Главное обещание",
      decisionFrame: "Кадр решения",
      proofCtaZone: "Зона доказательства и призыва",
      beforeAfterHeroFrame: "До / после главного кадра",
      beforeAfterHeroTitle: "Текущее обещание против более точной версии, которая нужна бренду",
      beforeAfterHeroBody: "Здесь отчёт переходит от диагностики к более направленной визуальной стратегии: что главный экран делает сейчас и какой могла бы быть более ясная коммерческая версия без потери атмосферы.",
      websiteCapture: "Снимок сайта",
      websiteCaptureTitle: "Живая поверхность главной страницы, на которой основан диагноз",
      websiteCaptureBody: "Одного чистого снимка здесь достаточно. Цель не в том, чтобы нагромождать визуалы, а в том, чтобы связать диагноз с реальной страницей без повтора одного и того же доказательства тремя способами.",
      websiteEvidence: "Доказательство с сайта",
      openSurface: "Открыть поверхность",
      noLivePreview: "Для этой поверхности пока нет живого превью.",
      positioningRead: "Разбор позиционирования",
      positioningReadTitle: "Что говорит предложение",
      visualIdentity: "Визуальная идентичность",
      visualIdentityTitle: "Что подразумевает визуальная система",
      aboveTheFold: "Первый экран",
      aboveTheFoldTitle: "Что происходит на первом экране",
      commercialRead: "Коммерческий разбор",
      commercialReadTitle: "Что помогает или замедляет следующий шаг",
      frictionMapTitle: "Где страница теряет определённость",
      trustGapsTitle: "Что всё ещё нужно доказать",
      offerOpportunities: "Возможности предложения",
      offerOpportunitiesTitle: "Где коммерческая история может стать точнее",
      positioningStrategyTitle: "Как нужно рамкировать бренд",
      messagingStrategyTitle: "Что должна сделать коммуникация",
      offerStrategyTitle: "Как сделать предложение проще для покупки",
      rewriteSuggestions: "Предложения по переписыванию",
      heroLine: "Главная строка",
      subheadline: "Подзаголовок",
      cta: "Призыв к действию",
      action30Title: "Дорожная карта на следующие 30 дней",
      whatComesNext: "Что дальше",
      whatComesNextTitle: "Три способа использовать этот диагноз",
      nextUseCases: [
        "Сделать самостоятельно — использовать список исправлений и план действий как дорожную карту.",
        "Разбор с BrandMirror — пройти диагноз и следующие шаги с сопровождением.",
        "Работать с Sahar — превратить диагноз в полную перестройку бренда и сайта.",
      ],
      strategicContinuation: "Стратегическое продолжение",
      strategicContinuationTitle: "Куда этой стратегии нужно расшириться дальше",
    },
  }[locale];
  const scoreLabels: Record<string, string> =
    locale === "es"
      ? {
          "Positioning clarity": "Claridad de posicionamiento",
          "AI visibility": "Visibilidad en IA",
          "Visual credibility": "Credibilidad visual",
          "Offer specificity": "Especificidad de la oferta",
          "Conversion readiness": "Preparación para convertir",
        }
      : locale === "ru"
        ? {
            "Positioning clarity": "Ясность позиционирования",
            "AI visibility": "Видимость в ИИ",
            "Visual credibility": "Визуальная убедительность",
            "Offer specificity": "Точность предложения",
            "Conversion readiness": "Готовность к конверсии",
          }
        : {};
  const previewCopy = {
    en: {
      websiteFallback: "full report preview",
      scores: [
        { label: "Clarity", value: "72", note: "Offer lands too slowly." },
        { label: "Trust", value: "68", note: "Proof is arriving too late." },
      ],
      working: "Working",
      broken: "Broken",
      fixFirst: "Fix first",
      workingTitle: "What already holds",
      brokenTitle: "What is costing trust",
      workingFallback: "The brand already has authority.",
      brokenFallback: "The CTA arrives too early.",
      premiumSignal: "premium signal",
      trustGap: "trust gap",
      sharpenPromise: "sharpen the promise",
      fallbackMarkers: [
        { label: "Working", title: "Premium signal", note: "The brand already feels controlled and credible." },
        { label: "Broken", title: "Offer clarity", note: "The buyer still has to infer too much." },
      ],
    },
    es: {
      websiteFallback: "vista previa del reporte completo",
      scores: [
        { label: "Claridad", value: "72", note: "La oferta aterriza demasiado despacio." },
        { label: "Confianza", value: "68", note: "La prueba llega demasiado tarde." },
      ],
      working: "Funciona",
      broken: "Roto",
      fixFirst: "Corregir primero",
      workingTitle: "Lo que ya se sostiene",
      brokenTitle: "Lo que cuesta confianza",
      workingFallback: "La marca ya tiene autoridad.",
      brokenFallback: "La llamada a la acción llega demasiado pronto.",
      premiumSignal: "señal de alto nivel",
      trustGap: "brecha de confianza",
      sharpenPromise: "afinar la promesa",
      fallbackMarkers: [
        { label: "Funciona", title: "Señal de alto nivel", note: "La marca ya se siente controlada y creíble." },
        { label: "Roto", title: "Claridad de la oferta", note: "El comprador todavía tiene que inferir demasiado." },
      ],
    },
    ru: {
      websiteFallback: "превью полного отчёта",
      scores: [
        { label: "Ясность", value: "72", note: "Предложение раскрывается слишком медленно." },
        { label: "Доверие", value: "68", note: "Доказательство приходит слишком поздно." },
      ],
      working: "Работает",
      broken: "Сломано",
      fixFirst: "Исправить первым",
      workingTitle: "Что уже держится",
      brokenTitle: "Что стоит доверия",
      workingFallback: "У бренда уже есть авторитет.",
      brokenFallback: "Призыв к действию появляется слишком рано.",
      premiumSignal: "премиальный сигнал",
      trustGap: "разрыв доверия",
      sharpenPromise: "заострить обещание",
      fallbackMarkers: [
        { label: "Работает", title: "Премиальный сигнал", note: "Бренд уже ощущается собранным и достоверным." },
        { label: "Сломано", title: "Ясность предложения", note: "Покупателю всё ещё приходится слишком многое додумывать." },
      ],
    },
  }[locale];
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || initialUrl || "");
  const [report, setReport] = useState<BrandReport | null>(null);
  const [status, setStatus] = useState<string>(copy.statusInitial);
  const [error, setError] = useState(accessError);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);

  function handleGenerate(nextUrl?: string) {
    const targetUrl = (nextUrl ?? url).trim();
    if (!targetUrl) {
      setError(copy.emptyUrl);
      setStatus("");
      return;
    }

    setError("");
    setStatus(copy.statusBusy);

    startTransition(async () => {
      try {
        const response = await fetch("/api/brand-report", {
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
              "Unable to generate the full report right now.",
          );
        }

        setReport(payload.report);
        setStatus(copy.statusDone);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to generate the full report right now.",
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

  async function handleDownloadPdf() {
    if (!report) return;
    setIsDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/brand-report/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: report.url,
          language: locale,
          report,
          reference: searchParams.get("reference") || undefined,
          sessionId: searchParams.get("session_id") || paymentSessionId || undefined,
          promoToken: searchParams.get("promo_token") || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ErrorResponse;
        throw new Error(
          payload.detail || payload.error || "Unable to export the PDF right now.",
        );
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${report.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brandmirror"}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
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

  const posterUrl = report
    ? ({
        ruler: "/poster images/Ruler2.png",
        sage: "/poster images/Sage2.png",
        magician: "/poster images/Magician2.png",
        creator: "/poster images/Creator2.png",
        lover: "/poster images/Lover2.png",
        caregiver: "/poster images/Caregiver2.png",
        hero: "/poster images/Hero2.png",
        rebel: "/poster images/Rebel2.png",
        explorer: "/poster images/Explorer2.png",
        everyman: "/poster images/Everyman2.png",
        innocent: "/poster images/Innocent2.png",
        jester: "/poster images/Jester2.png",
      } as const)[report.visualWorld] || "/poster images/Creator2.png"
    : "";
  const featuredSurface =
    report?.surfaceCaptures.find((surface) => surface.kind === "website") || null;
  const heroCallout = report?.screenshotCallouts.find(
    (callout) => callout.zone === "hero-promise",
  );
  const proofCallout = report?.screenshotCallouts.find(
    (callout) => callout.zone === "proof-cta",
  );
  const beforeAfterHero = report?.beforeAfterHero;
  const beforeFrame = beforeAfterHero?.currentFrame;
  const afterFrame = beforeAfterHero?.rewrittenFrame;
  const reportId = report
    ? `BM-${(report.brandName || "BRAND").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) || "BM"}-2026-001`
    : "";
  const boardFrameLabels =
    locale === "ru"
      ? { offer: "Предложение", proof: "Доказательства", cta: "Действие", decision: "Решение" }
      : locale === "es"
        ? { offer: "Oferta", proof: "Prueba", cta: "Acción", decision: "Decisión" }
        : { offer: "Offer", proof: "Proof", cta: "CTA", decision: "Decision" };
  const canonicalOverallScore = report ? getCanonicalOverallScore(report) : 0;
  const canonicalScoreBand = report ? bandFor(canonicalOverallScore).label : "";
  const canonicalScorecard = report
    ? buildPdfAlignedScorePages(report, locale).map((item) => item.score)
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
            <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.05em] text-[color:var(--foreground)] sm:text-7xl">
              {copy.title}
            </h1>
          </div>
          <div className="max-w-sm">
            <div className="mb-4 flex justify-end sm:mb-6">
              <LanguageSwitcher locale={locale} />
            </div>
            <p className="section-label">{copy.mechanicLabel}</p>
            <p className="mt-3 text-base leading-7 text-[color:var(--foreground-soft)]">
              {copy.mechanicBody}
            </p>
          </div>
        </header>

        <section className="report-hero-grid grid gap-8 py-10 lg:grid-cols-[0.52fr_0.48fr] lg:py-14">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleGenerate();
            }}
            className="grain-panel report-intro-panel rounded-[2rem] border border-[color:var(--line)] p-6 sm:p-8"
          >
            <p className="section-label">{copy.unlockLabel}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
              {copy.unlockTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--foreground-soft)]">
              {copy.unlockBody}
            </p>
            <div className="editorial-rule mt-8 pt-6">
              <label
                htmlFor="report-url"
                className="text-sm uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]"
              >
                {copy.websiteUrl}
              </label>
              <input
                id="report-url"
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={copy.urlPlaceholder}
                className="mt-3 w-full rounded-[1.3rem] border border-[color:var(--line-strong)] bg-transparent px-5 py-4 text-base text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--foreground-soft)] focus:border-[color:var(--accent)]"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-full bg-[#6FE0C2] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#06110E] shadow-[0_14px_34px_rgba(5,7,12,0.24)] hover:-translate-y-0.5 hover:bg-[#84efd4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? copy.submitBusy : copy.submitIdle}
                </button>
                <p className="text-sm leading-6 text-[color:var(--foreground-soft)]">
                  {status}
                </p>
              </div>
              {error ? (
                <p className="mt-4 text-sm leading-6 text-[#F2495C]">{error}</p>
              ) : null}
            </div>
          </form>

          <div className="report-preview-stack space-y-5">
            <p className="section-label text-[color:var(--foreground-soft)]">
              {copy.shareable}
            </p>
            <DiagnosticEvidenceBoard
              brandName={report?.brandName || "BrandMirror"}
              websiteLabel={report?.url || previewCopy.websiteFallback}
              eyebrow={copy.reportEyebrow}
              headline={report?.title || copy.reportHeadline}
              subheadline={
                report?.tagline ||
                copy.reportSubheadline
              }
              cta={report?.rewriteSuggestions.cta || copy.downloadIdle}
              frameLabels={boardFrameLabels}
              scores={
                report
                  ? canonicalScorecard.slice(0, 3).map((row) => ({
                      label: scoreLabels[row.label] || row.label,
                      value: String(row.score),
                      note: row.note,
                    }))
                  : previewCopy.scores
              }
              markers={
                report
                  ? [
                      {
                        id: "working",
                        label: previewCopy.working,
                        title: previewCopy.workingTitle,
                        note: report.whatWorks[0] || previewCopy.workingFallback,
                        x: 64,
                        y: 14,
                      },
                      {
                        id: "broken",
                        label: previewCopy.broken,
                        title: previewCopy.brokenTitle,
                        note: report.whatsBroken[0] || previewCopy.brokenFallback,
                        x: 76,
                        y: 62,
                      },
                    ]
                  : [
                      { id: "working", ...previewCopy.fallbackMarkers[0], x: 64, y: 14 },
                      { id: "broken", ...previewCopy.fallbackMarkers[1], x: 76, y: 62 },
                    ]
              }
              verdicts={
                report
                  ? [
                      `${previewCopy.working}: ${report.whatWorks[0] || previewCopy.premiumSignal}`,
                      `${previewCopy.broken}: ${report.whatsBroken[0] || previewCopy.trustGap}`,
                      `${previewCopy.fixFirst}: ${getReportFixFirst(report) || previewCopy.sharpenPromise}`,
                    ]
                  : [
                      `${previewCopy.working}: ${previewCopy.premiumSignal}`,
                      `${previewCopy.broken}: ${previewCopy.trustGap}`,
                      `${previewCopy.fixFirst}: ${previewCopy.sharpenPromise}`,
                    ]
              }
              compact
              className={`${report ? "brandmirror-reveal brandmirror-reveal-delay" : ""} homepage-board mx-auto max-w-[33rem]`}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!report || isDownloading}
                className="inline-flex items-center justify-center rounded-full bg-[#6FE0C2] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#06110E] shadow-[0_14px_34px_rgba(5,7,12,0.24)] hover:-translate-y-0.5 hover:bg-[#84efd4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                  {isDownloading ? copy.downloadBusy : copy.downloadIdle}
              </button>
              <Link
                href={siteI18n.withLang("/sample-report", locale)}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(111,224,194,0.28)] px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#F4F5F8] hover:bg-[rgba(111,224,194,0.08)]"
              >
                {copy.sampleCta}
              </Link>
            </div>
            <p className="max-w-md text-sm leading-6 text-[color:var(--foreground-soft)]">
              {copy.footerNote}
            </p>
          </div>
        </section>

        {report ? (
          <div className="report-stage">
            <ReportCoverCard
              brandName={report.brandName}
              whatItDoes={report.whatItDoes}
              snapshot={report.snapshot}
              reportId={reportId}
              overallScore={canonicalOverallScore}
              scoreBand={canonicalScoreBand}
              locale={locale}
            />

            <ScoreDashboardBlock
              posterScore={canonicalOverallScore}
              scoreBand={canonicalScoreBand}
              scoreModifier={report.scoreModifier}
              scorecard={canonicalScorecard}
              scoreLabels={scoreLabels}
              locale={locale}
            />

            <PdfAlignedReportSections
              report={report}
              labels={labels}
              locale={locale}
              featuredSurface={featuredSurface}
              heroCallout={heroCallout}
              proofCallout={proofCallout}
              scoreLabels={scoreLabels}
            />

            {false ? (
            <>
            <section className="grid gap-10 pb-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.whatItDoes}</p>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.72)]">
                  {report.whatItDoes}
                </p>
                <div className="editorial-rule mt-6 border-[rgba(237,237,242,0.12)] pt-6">
                  <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.snapshot}</p>
                  <p className="mt-5 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                    {report.snapshot}
                  </p>
                  <p className="mt-6 text-base leading-7 text-[rgba(237,237,242,0.72)]">
                    {report.url}
                  </p>
                </div>
              </div>

              <div className="ink-panel grid gap-5 rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 pt-8 sm:p-8">
                {report.scorecard.map((row) => {
                  const band = bandFor(row.score);
                  return (
                    <div
                      key={row.label}
                      className="grid gap-3 border-b border-[rgba(237,237,242,0.12)] pb-5 sm:grid-cols-[1fr_4.5rem_1fr]"
                    >
                      <p className="text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.58)]">
                        {scoreLabels[row.label] || row.label}
                      </p>
                      <p
                        className="font-serif text-5xl leading-none tracking-[-0.06em]"
                        style={{ color: band.color }}
                      >
                        {row.score}
                      </p>
                      <p className="text-sm leading-6 text-[rgba(237,237,242,0.72)]">
                        {row.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ReportSection
                label={labels.signalsLabel}
                title={labels.signalsTitle}
                body={report.whatItSignals}
              />
              <ReportSection
                label={labels.missingLabel}
                title={labels.missingTitle}
                body={report.whatIsMissing}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ReportSection
                label={labels.mixedSignalsLabel}
                title={labels.mixedSignalsTitle}
                body={report.mixedSignals}
              />
              <ReportSection
                label={labels.nextLabel}
                title={labels.nextTitle}
                body={report.whatToDoNext}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ReportSection
                label={labels.amplifyLabel}
                title={labels.amplifyTitle}
                body={report.whatToAmplify}
              />
              <ReportSection
                label={labels.dropLabel}
                title={labels.dropTitle}
                body={report.whatToDrop}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ListBlock
                label={labels.worksLabel}
                title={labels.worksTitle}
                items={report.whatWorks}
              />
              <ListBlock
                label={labels.brokenLabel}
                title={labels.brokenTitle}
                items={report.whatsBroken}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ListBlock
                label={labels.convertLabel}
                title={labels.convertTitle}
                items={report.whyNotConverting}
              />
              <ListBlock
                label={labels.audienceMismatchLabel}
                title={labels.audienceMismatchTitle}
                items={report.audienceMismatch}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ListBlock
                label={labels.fixLabel}
                title={labels.fixTitle}
                items={report.priorityFixes.fixNow}
              />
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.audienceRead}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.audienceTitle}
                </h2>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {report.audienceRead.primaryAudience}
                </p>
                <div className="editorial-rule mt-6 space-y-6 border-[rgba(237,237,242,0.12)] pt-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.58)]">
                      {labels.tone}
                    </p>
                    <div className="mt-3 space-y-3">
                      {report.toneOfVoice.map((item) => (
                        <p
                          key={`tone-${item}`}
                          className="border-b border-[rgba(237,237,242,0.12)] pb-3 text-sm leading-7 text-[rgba(237,237,242,0.72)] last:border-b-0 last:pb-0"
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                  {(
                    [
                      [labels.looking, report.audienceRead.whatTheyAreLookingFor],
                      [labels.feel, report.audienceRead.whatTheyNeedToFeel],
                      [labels.hear, report.audienceRead.whatTheyNeedToHear],
                    ] as Array<[string, string[]]>
                  ).map(([heading, items]) => (
                    <div key={heading}>
                      <p className="text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.58)]">
                        {heading}
                      </p>
                      <div className="mt-3 space-y-3">
                        {items.map((item) => (
                          <p
                            key={item}
                            className="border-b border-[rgba(237,237,242,0.12)] pb-3 text-sm leading-7 text-[rgba(237,237,242,0.72)] last:border-b-0 last:pb-0"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">
                  {labels.strategic}
                </p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.strategicTitle}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {report.strategicDirection}
                </p>
              </div>
              <ListBlock
                label={labels.frameLabel}
                title={labels.frameTitle}
                items={report.expectationGap.length > 0
                  ? report.expectationGap.slice(0, 3)
                  : [report.strategicNextMove || "Align the signal with the commercial intent."]}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.archetype}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {locale === "es"
                    ? `${report.archetypeRead.primary} con una atracción secundaria hacia ${report.archetypeRead.secondary}`
                    : locale === "ru"
                      ? `${report.archetypeRead.primary} со вторичным тяготением к ${report.archetypeRead.secondary}`
                      : `${report.archetypeRead.primary} with a secondary pull toward ${report.archetypeRead.secondary}`}
                </h2>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {report.archetypeRead.rationale}
                </p>
              </div>
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">{labels.brandMyth}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.brandMythTitle}
                </h2>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {report.brandMyth}
                </p>
              </div>
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.verbalImage}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.verbalImageTitle}
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    [labels.nameSignal, report.verbalImage.nameSignal],
                    [labels.headlineSignal, report.verbalImage.headlineSignal],
                    [labels.firstScreenTone, report.verbalImage.firstScreenTone],
                    [labels.risk, report.verbalImage.risk],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.58)]">
                        {label}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[rgba(237,237,242,0.72)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <ListBlock
                label={labels.tests}
                title={labels.archetypeTestsTitle}
                items={report.archetypeTests.map((item) => `${item.name}: ${item.verdict}`)}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.namingFit}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.namingFitTitle}
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    [labels.verdict, report.namingFit.verdict],
                    [labels.roleMatch, report.namingFit.roleMatch],
                    [labels.risk, report.namingFit.risk],
                    [labels.correction, report.namingFit.correction],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.58)]">
                        {label}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[rgba(237,237,242,0.72)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">{labels.headlineCorrection}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.headlineCorrectionTitle}
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    [labels.currentProblem, report.headlineCorrection.currentProblem],
                    [labels.correctionLogic, report.headlineCorrection.correctionLogic],
                    [labels.rewrittenDirection, report.headlineCorrection.rewrittenDirection],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.56)]">
                        {label}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[rgba(237,237,242,0.76)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ReportSection
                label={labels.knownFor}
                title={labels.knownForTitle}
                body={report.brandKnownFor}
              />
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.industryFit}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.industryFitTitle}
                </h2>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {labels.expectedArchetype}: {report.industryFit.expectedArchetype}
                </p>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  <p className="text-sm leading-7 text-[rgba(237,237,242,0.72)]">
                    {report.industryFit.assessment}
                  </p>
                  <p className="text-sm leading-7 text-[#F4F5F8]">
                    {report.industryFit.leverage}
                  </p>
                  {report.expectationGap.map((item) => (
                    <p
                      key={item}
                      className="border-b border-[rgba(237,237,242,0.12)] pb-4 text-sm leading-7 text-[rgba(237,237,242,0.72)] last:border-b-0 last:pb-0"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="pb-10">
              <div className="editorial-rule pt-8">
                <p className="section-label">{labels.aestheticDirections}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  {labels.aestheticDirectionsTitle}
                </h2>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {report.aestheticDirections.map((direction) => (
                  <article
                    key={direction.name}
                    className="ink-panel rounded-[1.8rem] border border-[rgba(237,237,242,0.14)] p-6"
                  >
                    <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.direction}</p>
                    <h3 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                      {direction.name}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[rgba(237,237,242,0.72)]">
                      {direction.note}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ListBlock
                label={labels.culturalAssociations}
                title={labels.filmsAndEras}
                items={[
                  ...report.culturalAssociations.films.map((item) => `${labels.film}: ${item}`),
                  ...report.culturalAssociations.eras.map((item) => `${labels.era}: ${item}`),
                ]}
              />
              <ListBlock
                label={labels.culturalAssociations}
                title={labels.artAndMusic}
                items={[
                  ...report.culturalAssociations.art.map((item) => `${labels.art}: ${item}`),
                  ...report.culturalAssociations.music.map((item) => `${labels.music}: ${item}`),
                ]}
              />
            </section>

            <section className="pb-10">
              <ListBlock
                label={labels.visualCodes}
                title={labels.visualCodesTitle}
                items={[
                  `${labels.palette}: ${report.visualCodes.palette.join(", ")}`,
                  `${labels.textures}: ${report.visualCodes.textures.join(", ")}`,
                  `${labels.symbols}: ${report.visualCodes.symbols.join(", ")}`,
                  `${labels.forms}: ${report.visualCodes.forms.join(", ")}`,
                ]}
              />
            </section>

            <section className="pb-10">
              <div className="editorial-rule pt-8">
                <p className="section-label">{labels.visualEvidenceStrip}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  {labels.visualEvidenceTitle}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--foreground-soft)]">
                  {labels.visualEvidenceBody}
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <VisualCropCard
                  label={labels.heroFrame}
                  title={heroCallout?.title || labels.heroPromise}
                  body={heroCallout?.body || report.aboveTheFold}
                  imageUrl={featuredSurface?.imageUrl}
                  focusX={heroCallout?.x || 18}
                  focusY={heroCallout?.y || 18}
                  aspectClass="aspect-[6/5]"
                />
                <VisualCropCard
                  label={labels.decisionFrame}
                  title={proofCallout?.title || labels.proofCtaZone}
                  body={proofCallout?.body || report.conversionRead}
                  imageUrl={featuredSurface?.imageUrl}
                  focusX={proofCallout?.x || 62}
                  focusY={proofCallout?.y || 62}
                  aspectClass="aspect-[6/5]"
                />
              </div>
            </section>

            {beforeFrame && afterFrame ? (
            <section className="pb-10">
              <div className="editorial-rule pt-8">
                <p className="section-label">{labels.beforeAfterHeroFrame}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  {labels.beforeAfterHeroTitle}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--foreground-soft)]">
                  {labels.beforeAfterHeroBody}
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <VisualCropCard
                  label={beforeFrame.label}
                  title={beforeFrame.title}
                  body={beforeFrame.body}
                  imageUrl={beforeFrame.imageUrl}
                  focusX={beforeFrame.focusX}
                  focusY={beforeFrame.focusY}
                  aspectClass="aspect-[16/10]"
                />
                <HeroRewriteMockup
                  posterUrl={afterFrame.posterUrl}
                  eyebrow={afterFrame.eyebrow}
                  headline={afterFrame.headline}
                  subheadline={afterFrame.subheadline}
                  cta={afterFrame.cta}
                  note={afterFrame.note}
                />
              </div>
            </section>
            ) : null}

            <section className="pb-10">
              <div className="editorial-rule pt-8">
                <p className="section-label">Next-step moodboard</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  A cleaner visual direction for what should happen next
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--foreground-soft)]">
                  This is not a second gallery. It is the distilled direction
                  layer: the visual cues worth carrying forward, and the ones worth dropping.
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
                <PosterLensCard
                  posterUrl={posterUrl}
                  brandName={report.brandName}
                  genre={report.genre}
                  tagline={report.tagline}
                  scoreBand={report.scoreBand}
                  scoreModifier={report.scoreModifier}
                  posterScore={report.posterScore}
                />
	                <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
	                  <p className="section-label text-[rgba(237,237,242,0.58)]">Direction cues</p>
	                  <h3 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
	                    What the next iteration should borrow and what it should avoid
	                  </h3>
	                  <p className="mt-4 text-base leading-7 text-[rgba(237,237,242,0.72)]">
	                    {report.brandMyth}
	                  </p>
	                  <div className="editorial-rule mt-6 space-y-6 border-[rgba(237,237,242,0.12)] pt-6">
                    <MoodboardChipGroup label="Palette" items={report.visualCodes.palette} />
                    <MoodboardChipGroup label="Textures" items={report.visualCodes.textures} />
                    <MoodboardChipGroup label="Symbols" items={report.visualCodes.symbols} />
                    <MoodboardChipGroup label="Forms" items={report.visualCodes.forms} />
                    <MoodboardChipGroup
                      label="Cultural references"
                      items={[
                        ...report.culturalAssociations.films,
                        ...report.culturalAssociations.eras,
                        ...report.culturalAssociations.art,
                        ...report.culturalAssociations.music,
                      ].slice(0, 8)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="pb-10">
              <div className="editorial-rule pt-8">
                <p className="section-label">{labels.websiteCapture}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  {labels.websiteCaptureTitle}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--foreground-soft)]">
                  {labels.websiteCaptureBody}
                </p>
              </div>

              {featuredSurface ? (
                <div className="mt-8">
	                  <div className="ink-panel overflow-hidden rounded-[2rem] border border-[rgba(237,237,242,0.14)]">
	                    <div className="border-b border-[rgba(237,237,242,0.12)] px-5 py-4 sm:px-6">
                      <p className="section-label">{labels.websiteEvidence}</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
	                          <h3 className="font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
	                            {featuredSurface.label}
	                          </h3>
	                          <p className="mt-3 max-w-2xl text-sm leading-7 text-[rgba(237,237,242,0.72)]">
	                            {featuredSurface.note}
	                          </p>
                        </div>
                        {featuredSurface.href ? (
                          <a
                            href={featuredSurface.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-sm uppercase tracking-[0.18em] text-[color:var(--accent)]"
                          >
                            {labels.openSurface}
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <div className="bg-[color:var(--background-strong)] p-3 sm:p-4">
	                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-[rgba(237,237,242,0.12)] bg-[linear-gradient(180deg,#1d2433,#0f141e)] shadow-[0_20px_60px_rgba(4,7,13,0.34)]">
                        {featuredSurface.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featuredSurface.imageUrl}
                            alt={featuredSurface.label}
                            className="h-full w-full object-cover object-top"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-[color:var(--foreground-soft)]">
                            {labels.noLivePreview}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,10,0.08),rgba(15,12,10,0.12)_35%,rgba(15,12,10,0.22))]" />
                        {report.screenshotCallouts.map((callout, index) => (
                          <ScreenshotCallout
                            key={`${callout.title}-${index}`}
                            index={index}
                            zone={callout.zone}
                            title={callout.title}
                            body={callout.body}
                            x={callout.x}
                            y={callout.y}
                            locale={locale}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ReportSection
                label={labels.positioningRead}
                title={labels.positioningReadTitle}
                body={report.positioningRead}
              />
              <ReportSection
                label={labels.visualIdentity}
                title={labels.visualIdentityTitle}
                body={report.visualIdentityRead}
              />
              <ReportSection
                label={labels.aboveTheFold}
                title={labels.aboveTheFoldTitle}
                body={report.aboveTheFold}
              />
              <ReportSection
                label={labels.commercialRead}
                title={labels.commercialReadTitle}
                body={report.conversionRead}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">
                  {labels.mixedSignalsLabel}
                </p>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {report.mixedSignals}
                </p>
              </div>
              <ListBlock
                label={labels.frictionMap}
                title={labels.frictionMapTitle}
                items={report.frictionMap}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ListBlock
                label={labels.trustGaps}
                title={labels.trustGapsTitle}
                items={report.trustGaps}
              />
              <ListBlock
                label={labels.offerOpportunities}
                title={labels.offerOpportunitiesTitle}
                items={report.offerOpportunities}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-3">
              <ListBlock
                label={labels.positioningMoves}
                title={labels.positioningStrategyTitle}
                items={report.positioningMoves}
              />
              <ListBlock
                label={labels.messagingPriorities}
                title={labels.messagingStrategyTitle}
                items={report.messagingPriorities}
              />
              <ListBlock
                label={labels.offerStrategy}
                title={labels.offerStrategyTitle}
                items={report.offerStrategy}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label">{labels.fixLabel}</p>
                <div className="editorial-rule mt-5 space-y-5 border-[rgba(237,237,242,0.12)] pt-5">
                  {(
                    [
                      [labels.fixNow, report.priorityFixes.fixNow, "#E07A5F"],
                      [labels.fixNext, report.priorityFixes.fixNext, "#E8B04C"],
                      [labels.keep, report.priorityFixes.keep, "#6FE0C2"],
                    ] as Array<[string, string[], string]>
                  ).map(([label, items, color]) => (
                    <div key={label}>
                      <p
                        className="text-sm uppercase tracking-[0.18em]"
                        style={{ color }}
                      >
                        {label}
                      </p>
                      <div className="mt-3 space-y-3">
                        {(items as string[]).map((item) => (
                          <p key={item} className="text-sm leading-7 text-[rgba(237,237,242,0.72)]">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">
                  {labels.rewriteSuggestions}
                </p>
                <div className="editorial-rule mt-5 space-y-5 pt-5">
                  {[
                    [labels.heroLine, report.rewriteSuggestions.heroLine],
                    [labels.subheadline, report.rewriteSuggestions.subheadline],
                    [labels.cta, report.rewriteSuggestions.cta],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm uppercase tracking-[0.18em] text-[rgba(237,237,242,0.58)]">
                        {label}
                      </p>
                      <p className="mt-3 text-base leading-7 text-[rgba(237,237,242,0.78)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ListBlock
                label={labels.action30}
                title={labels.action30Title}
                items={report.actionPlan.next30Days}
              />
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">{labels.whatComesNext}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.whatComesNextTitle}
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    ...labels.nextUseCases,
                  ].map((item) => (
                    <p key={item} className="text-sm leading-7 text-[rgba(237,237,242,0.72)]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="pb-12">
              <div className="editorial-rule pt-8">
                <p className="section-label">{labels.strategicContinuation}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  {labels.strategicContinuationTitle}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-[rgba(237,237,242,0.72)]">
                  {report.strategicNextMove}
                </p>
              </div>
            </section>
            </>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
