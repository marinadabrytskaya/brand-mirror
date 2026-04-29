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

function SurfaceMethodLabel() {
  return <p className="section-label">Website evidence</p>;
}

function ScreenshotCallout({
  index,
  zone,
  title,
  body,
  x,
  y,
}: {
  index: number;
  zone: "hero-promise" | "proof-cta";
  title: string;
  body: string;
  x: number;
  y: number;
}) {
  const zoneLabel = zone === "hero-promise" ? "Hero promise" : "Proof + CTA";
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
}: {
  brandName: string;
  whatItDoes: string;
  snapshot: string;
  reportId: string;
}) {
  const isLongName = brandName.length > 24;
  return (
    <section className="pb-10">
      <div className="ink-panel report-cover-card rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-7 sm:p-10">
        <p className="section-label text-[rgba(237,237,242,0.6)]">BrandMirror report</p>
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
          <span>A diagnostic read of what the brand signals and what to fix next</span>
          <span>{reportId}</span>
        </div>
      </div>
    </section>
  );
}

function HowWeReadBrandsBlock({
  brandName,
  genre,
}: {
  brandName: string;
  genre: string;
}) {
  return (
    <section className="pb-10">
      <div className="ink-panel report-story-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-7 sm:p-10">
        <p className="section-label">How We Read Brands</p>
        <h2 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.05em] text-[#F4F5F8]">
          Most brand audits give you a checklist. We give you a verdict.
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 text-base leading-7 text-[rgba(237,237,242,0.76)]">
            <p>
              Every brand is telling a story whether it means to or not. The
              colours, the words, the offer, the website — all of it is
              sending a signal before a buyer has made a conscious decision.
            </p>
            <p>
              BrandMirror reads that signal the way a sharp audience reads a
              film in the first ten minutes: what lands, what feels off, and
              what makes someone stay or leave.
            </p>
            <p>
              We reverse-engineer that first decision and turn it into a score,
              a genre, a fix stack, and a set of next moves.
            </p>
          </div>
          <div className="report-story-side rounded-[1.6rem] p-5">
            <p className="section-label">The genre</p>
            <p className="mt-4 text-base leading-7 text-[rgba(237,237,242,0.74)]">
              Every brand has a genre — the narrative logic an audience uses to
              make sense of it. Right now {brandName} is reading as{" "}
              <span className="text-[#F4F5F8]">{genre}</span>.
            </p>
            <div className="editorial-rule mt-5 space-y-4 border-[rgba(237,237,242,0.12)] pt-5 text-sm leading-7 text-[rgba(237,237,242,0.68)]">
              <p>Positioning Clarity — can someone explain the offer without your help?</p>
              <p>AI Visibility — can AI tools find, read, and recommend your brand?</p>
              <p>Visual Credibility — does the surface match the price being asked?</p>
              <p>Offer Specificity — does the proposition arrive fast enough to buy?</p>
              <p>Conversion Readiness — is there a clear next step when the buyer is ready?</p>
            </div>
          </div>
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
}: {
  posterScore: number;
  scoreBand: string;
  scoreModifier: string;
  scorecard: { label: string; score: number; note: string }[];
}) {
  const overallBand = bandFor(posterScore);
  return (
    <section className="pb-10">
      <div className="ink-panel report-score-shell rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-7 sm:p-10">
        <p className="section-label text-[rgba(237,237,242,0.6)]">Score dashboard</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="report-score-core rounded-[1.8rem] p-8 text-center">
            <p className="font-serif text-[clamp(4rem,10vw,6.4rem)] leading-none tracking-[-0.07em] text-[#F4F5F8]">
              {posterScore}/100
            </p>
            <p className="mt-4 text-base leading-7 text-[rgba(237,237,242,0.74)]">
              Overall brand readiness
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
              <p className="section-label text-[rgba(237,237,242,0.56)]">What the scores reveal</p>
              <h3 className="mt-4 max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] text-[#F4F5F8]">
                {scoreModifier}
              </h3>
            </div>
            <div className="editorial-rule border-[rgba(237,237,242,0.12)] pt-5">
              <p className="max-w-xl text-sm leading-7 text-[rgba(237,237,242,0.7)]">
                Each axis is scored 0–100 across five tiers: Flatlining, Fragile, Developing, Stable, and Leading. The colour of each score reflects which tier that signal currently sits in.
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
                  {row.label}
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
      fixTitle: "Las primeras correcciones con mayor upside",
      audienceRead: "Lectura de audiencia",
      audienceTitle: "Quiénes son y qué todavía necesitan oír",
      tone: "Tone of voice",
      looking: "Qué están buscando",
      feel: "Qué necesitan sentir",
      hear: "Qué necesitan oír",
      strategic: "Dirección estratégica",
      strategicTitle: "Qué necesita aclarar mejor esta marca",
      frameLabel: "Marco estratégico",
      frameTitle: "Lo que este reporte está forzando",
      archetype: "Lectura de arquetipo",
      knownFor: "Por qué debería ser conocida esta marca",
      industryFit: "Encaje con la categoría",
      expectationGap: "Brecha de expectativas",
      verbalImage: "Imagen verbal",
      namingFit: "Encaje del naming",
      headlineCorrection: "Lógica de corrección del headline",
      tests: "Tests arquetípicos",
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
    },
    ru: {
      whatItDoes: "Чем, похоже, занимается компания",
      snapshot: "Снимок",
      signalsLabel: "Что он сигналит",
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
      dropTitle: "Что ослабляет это чтение",
      worksLabel: "Что работает",
      worksTitle: "Что уже работает",
      brokenLabel: "Что сломано",
      brokenTitle: "Что стоит доверия",
      convertLabel: "Почему не конвертирует",
      convertTitle: "Почему страница не закрывает этот разрыв",
      audienceMismatchLabel: "Audience mismatch",
      audienceMismatchTitle: "Где сообщение не попадает в покупателя",
      fixLabel: "Что исправить первым",
      fixTitle: "Первые исправления с самым большим upside",
      audienceRead: "Чтение аудитории",
      audienceTitle: "Кто они и что им всё ещё нужно услышать",
      tone: "Tone of voice",
      looking: "Что они ищут",
      feel: "Что им нужно почувствовать",
      hear: "Что им нужно услышать",
      strategic: "Стратегическое направление",
      strategicTitle: "В чём этому бренду нужно стать яснее",
      frameLabel: "Стратегическая рамка",
      frameTitle: "К чему подталкивает этот отчёт",
      archetype: "Архетипный разбор",
      knownFor: "Чем этот бренд должен быть известен",
      industryFit: "Fit с категорией",
      expectationGap: "Разрыв ожиданий",
      verbalImage: "Verbal image",
      namingFit: "Naming fit",
      headlineCorrection: "Логика коррекции headline",
      tests: "Архетипические тесты",
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
            "AI visibility": "AI-видимость",
            "Visual credibility": "Визуальная убедительность",
            "Offer specificity": "Точность оффера",
            "Conversion readiness": "Готовность к конверсии",
          }
        : {};
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
        body: JSON.stringify({ url: report.url, language: locale, report }),
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
              websiteLabel={report?.url || "full report preview"}
              eyebrow={copy.reportEyebrow}
              headline={report?.title || copy.reportHeadline}
              subheadline={
                report?.tagline ||
                copy.reportSubheadline
              }
              cta={report?.rewriteSuggestions.cta || copy.downloadIdle}
              scores={
                report
                  ? report.scorecard.slice(0, 3).map((row) => ({
                      label: row.label,
                      value: String(row.score),
                      note: row.note,
                    }))
                  : [
                      { label: "Clarity", value: "72", note: "Offer lands too slowly." },
                      { label: "Trust", value: "68", note: "Proof is arriving too late." },
                    ]
              }
              markers={
                report
                  ? [
                      {
                        id: "working",
                        label: "Working",
                        title: "What already holds",
                        note: report.whatWorks[0] || "The brand already has authority.",
                        x: 76,
                        y: 14,
                      },
                      {
                        id: "broken",
                        label: "Broken",
                        title: "What is costing trust",
                        note: report.whatsBroken[0] || "The CTA arrives too early.",
                        x: 76,
                        y: 62,
                      },
                    ]
                  : [
                      {
                        id: "working",
                        label: "Working",
                        title: "Premium signal",
                        note: "The brand already feels controlled and credible.",
                        x: 76,
                        y: 14,
                      },
                      {
                        id: "broken",
                        label: "Broken",
                        title: "Offer clarity",
                        note: "The buyer still has to infer too much.",
                        x: 76,
                        y: 62,
                      },
                    ]
              }
              verdicts={
                report
                  ? [
                      `Working: ${report.whatWorks[0] || "premium signal"}`,
                      `Broken: ${report.whatsBroken[0] || "trust gap"}`,
                      `Fix first: ${report.priorityFixes.fixNow[0] || "sharpen the promise"}`,
                    ]
                  : ["Working: premium signal", "Broken: trust gap", "Fix first: sharpen the promise"]
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
            />

            <HowWeReadBrandsBlock
              brandName={report.brandName}
              genre={report.genre}
            />

            <ScoreDashboardBlock
              posterScore={report.posterScore}
              scoreBand={report.scoreBand}
              scoreModifier={report.scoreModifier}
              scorecard={report.scorecard}
            />

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
                  {report.archetypeRead.primary} with a secondary pull toward {report.archetypeRead.secondary}
                </h2>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {report.archetypeRead.rationale}
                </p>
              </div>
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">Brand myth</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  The legend this brand is already trying to tell
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
                  What the name, hero line, and first-screen tone are teaching people to expect
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    ["Name signal", report.verbalImage.nameSignal],
                    ["Headline signal", report.verbalImage.headlineSignal],
                    ["First-screen tone", report.verbalImage.firstScreenTone],
                    ["Risk", report.verbalImage.risk],
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
                title="Which archetypal tests the brand is still failing"
                items={report.archetypeTests.map((item) => `${item.name}: ${item.verdict}`)}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.namingFit}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  Whether the name is helping the sale or making the homepage do extra work
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    ["Verdict", report.namingFit.verdict],
                    ["Role match", report.namingFit.roleMatch],
                    ["Risk", report.namingFit.risk],
                    ["Correction", report.namingFit.correction],
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
                  How the first line has to change to close the gap faster
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    ["Current problem", report.headlineCorrection.currentProblem],
                    ["Correction logic", report.headlineCorrection.correctionLogic],
                    ["Rewritten direction", report.headlineCorrection.rewrittenDirection],
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
                title="The answer to ‘what is this brand actually known for?’"
                body={report.brandKnownFor}
              />
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.58)]">{labels.industryFit}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  Category expectation versus the role this brand is trying to play
                </h2>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  Expected archetype: {report.industryFit.expectedArchetype}
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
                <p className="section-label">Aesthetic directions</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  The aesthetic lanes this brand can credibly own
                </h2>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {report.aestheticDirections.map((direction) => (
                  <article
                    key={direction.name}
                    className="ink-panel rounded-[1.8rem] border border-[rgba(237,237,242,0.14)] p-6"
                  >
                    <p className="section-label text-[rgba(237,237,242,0.58)]">Direction</p>
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
                label="Cultural associations"
                title="Films and eras"
                items={[
                  ...report.culturalAssociations.films.map((item) => `Film: ${item}`),
                  ...report.culturalAssociations.eras.map((item) => `Era: ${item}`),
                ]}
              />
              <ListBlock
                label="Cultural associations"
                title="Art and music"
                items={[
                  ...report.culturalAssociations.art.map((item) => `Art: ${item}`),
                  ...report.culturalAssociations.music.map((item) => `Music: ${item}`),
                ]}
              />
            </section>

            <section className="pb-10">
              <ListBlock
                label="Visual codes"
                title="What the brand should look like in detail"
                items={[
                  `Palette: ${report.visualCodes.palette.join(", ")}`,
                  `Textures: ${report.visualCodes.textures.join(", ")}`,
                  `Symbols: ${report.visualCodes.symbols.join(", ")}`,
                  `Forms: ${report.visualCodes.forms.join(", ")}`,
                ]}
              />
            </section>

            <section className="pb-10">
              <div className="editorial-rule pt-8">
                <p className="section-label">Visual evidence strip</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  The first screen, isolated into the two moments that matter most
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--foreground-soft)]">
                  Instead of scattering the report across too many visuals, this
                  pulls focus back to the homepage itself: the promise the buyer
                  sees first, and the decision zone where trust either lands or drops.
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <VisualCropCard
                  label="Hero frame"
                  title={heroCallout?.title || "Hero promise"}
                  body={heroCallout?.body || report.aboveTheFold}
                  imageUrl={featuredSurface?.imageUrl}
                  focusX={heroCallout?.x || 18}
                  focusY={heroCallout?.y || 18}
                  aspectClass="aspect-[6/5]"
                />
                <VisualCropCard
                  label="Decision frame"
                  title={proofCallout?.title || "Proof and CTA zone"}
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
                <p className="section-label">Before / after hero frame</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  The current promise versus the sharper version this brand wants
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--foreground-soft)]">
                  This is where the report shifts from diagnosis into a more
                  directed visual strategy: what the hero is doing now, and what
                  a clearer commercial version could feel like without losing
                  atmosphere.
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
                <p className="section-label">Website capture</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                  The live homepage surface this diagnosis is based on
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--foreground-soft)]">
                  One clean capture is enough here. The goal is not to pile on
                  visuals, but to tie the diagnosis back to the real page without
                  repeating the same evidence in three different ways.
                </p>
              </div>

              {featuredSurface ? (
                <div className="mt-8">
	                  <div className="ink-panel overflow-hidden rounded-[2rem] border border-[rgba(237,237,242,0.14)]">
	                    <div className="border-b border-[rgba(237,237,242,0.12)] px-5 py-4 sm:px-6">
                      <SurfaceMethodLabel />
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
                            Open surface
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
                            No live preview available yet for this surface.
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
                label="Positioning read"
                title="What the offer is saying"
                body={report.positioningRead}
              />
              <ReportSection
                label="Visual identity"
                title="What the visual system implies"
                body={report.visualIdentityRead}
              />
              <ReportSection
                label="Above the fold"
                title="What happens in the first screen"
                body={report.aboveTheFold}
              />
              <ReportSection
                label="Commercial read"
                title="What is helping or slowing the next step"
                body={report.conversionRead}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">
                  Mixed signals
                </p>
                <p className="mt-5 text-base leading-7 text-[rgba(237,237,242,0.74)]">
                  {report.mixedSignals}
                </p>
              </div>
              <ListBlock
                label="Friction map"
                title="Where the page is losing certainty"
                items={report.frictionMap}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <ListBlock
                label="Trust gaps"
                title="What still needs to be proven"
                items={report.trustGaps}
              />
              <ListBlock
                label="Offer opportunities"
                title="Where the commercial story can get sharper"
                items={report.offerOpportunities}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-3">
              <ListBlock
                label="Positioning strategy"
                title="How the brand should be framed"
                items={report.positioningMoves}
              />
              <ListBlock
                label="Messaging strategy"
                title="What the communication must do"
                items={report.messagingPriorities}
              />
              <ListBlock
                label="Offer strategy"
                title="How the offer should feel easier to buy"
                items={report.offerStrategy}
              />
            </section>

            <section className="grid gap-8 pb-10 lg:grid-cols-2">
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label">Priority fix stack</p>
                <div className="editorial-rule mt-5 space-y-5 border-[rgba(237,237,242,0.12)] pt-5">
                  {(
                    [
                      ["Fix now", report.priorityFixes.fixNow, "#E07A5F"],
                      ["Fix next", report.priorityFixes.fixNext, "#E8B04C"],
                      ["Keep", report.priorityFixes.keep, "#6FE0C2"],
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
                  Rewrite suggestions
                </p>
                <div className="editorial-rule mt-5 space-y-5 pt-5">
                  {[
                    ["Hero line", report.rewriteSuggestions.heroLine],
                    ["Subheadline", report.rewriteSuggestions.subheadline],
                    ["CTA", report.rewriteSuggestions.cta],
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
                label="30-day action plan"
                title="Your roadmap for the next 30 days"
                items={report.actionPlan.next30Days}
              />
              <div className="ink-panel rounded-[2rem] border border-[rgba(237,237,242,0.14)] p-6 sm:p-8">
                <p className="section-label text-[rgba(237,237,242,0.6)]">What comes next</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  Three ways to use this diagnosis
                </h2>
                <div className="editorial-rule mt-6 space-y-4 border-[rgba(237,237,242,0.12)] pt-6">
                  {[
                    "Do it yourself — use the fix stack and action plan as your roadmap.",
                    "BrandMirror Reviewed — guided walkthrough of the diagnosis and next moves.",
                    "Work with Sahar — turn the diagnosis into a full brand and website rebuild.",
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
                <p className="section-label">Strategic continuation</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#F4F5F8]">
                  What this strategy should extend into next
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-[rgba(237,237,242,0.72)]">
                  {report.strategicNextMove}
                </p>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
