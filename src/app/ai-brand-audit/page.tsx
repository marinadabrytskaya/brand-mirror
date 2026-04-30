import type { Metadata } from "next";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";
import siteI18n from "@/lib/site-i18n";

const pageCopy = {
  en: {
    eyebrow: "AI Brand Audit",
    title: "AI Brand Audit for Any Website",
    description:
      "BrandMirror reads a homepage the way a buyer, search engine, and AI system encounter it: positioning, AI visibility, offer clarity, visual credibility, and conversion readiness.",
    primaryCta: "Run a free first read",
    secondaryCta: "See sample report",
    back: "BrandMirror",
    sections: [
      {
        title: "What BrandMirror audits",
        body:
          "BrandMirror evaluates the first public brand surface of a website. It looks at whether the page can explain what is sold, who it is for, why it matters, whether the offer is specific, whether the visual system creates trust, and whether AI systems can understand and repeat the brand without guessing.",
      },
      {
        title: "Why AI visibility is part of the brand audit",
        body:
          "Buyers now discover and compare brands through search, AI assistants, summaries, and recommendation engines. A brand can look polished and still be hard for ChatGPT, Gemini, Perplexity, or Google AI surfaces to describe. BrandMirror treats AI readability as a commercial signal, not a separate technical checklist.",
      },
      {
        title: "What the full report gives you",
        body:
          "The paid BrandMirror Report turns the scan into a structured diagnosis: score dashboard, website evidence, five commercial deep dives, competitor intelligence, commercial impact, priority fix stack, one-page brand brief, implementation playbook, PDF export, and email delivery.",
      },
    ],
    checks: [
      "Positioning clarity",
      "AI visibility and repeatability",
      "Offer specificity",
      "Visual credibility",
      "Conversion readiness",
      "Competitor cues",
      "Priority fixes",
      "Implementation playbook",
    ],
    faq: [
      {
        question: "Is BrandMirror a website audit or a brand audit?",
        answer:
          "It is a brand audit through the website. BrandMirror uses the homepage as the evidence surface because that is where buyers, search engines, and AI systems often meet the brand first.",
      },
      {
        question: "Can I use it for any website?",
        answer:
          "Yes. BrandMirror can read any public homepage, including service businesses, studios, consultants, SaaS products, personal brands, and ecommerce brands.",
      },
      {
        question: "Does the report include AI visibility recommendations?",
        answer:
          "Yes. The report checks whether the brand is easy for AI systems to understand, repeat, and recommend, then turns that into practical website and messaging fixes.",
      },
    ],
  },
  es: {
    eyebrow: "Auditoría de marca con IA",
    title: "Auditoría de marca con IA para cualquier sitio",
    description:
      "BrandMirror lee una homepage como la encuentran un comprador, un buscador y un sistema de IA: posicionamiento, visibilidad en IA, claridad de oferta, credibilidad visual y preparación para convertir.",
    primaryCta: "Empezar lectura gratis",
    secondaryCta: "Ver reporte de muestra",
    back: "BrandMirror",
    sections: [
      {
        title: "Qué audita BrandMirror",
        body:
          "BrandMirror evalúa la primera superficie pública de marca de un sitio. Mira si la página explica qué se vende, para quién es, por qué importa, si la oferta es específica, si el sistema visual crea confianza y si los sistemas de IA pueden entender y repetir la marca sin adivinar.",
      },
      {
        title: "Por qué la visibilidad en IA forma parte de la auditoría",
        body:
          "Los compradores descubren y comparan marcas a través de buscadores, asistentes de IA, resúmenes y motores de recomendación. Una marca puede verse pulida y aun así ser difícil de describir para ChatGPT, Gemini, Perplexity o superficies de IA de Google.",
      },
      {
        title: "Qué entrega el reporte completo",
        body:
          "El BrandMirror Report pagado convierte el escaneo en un diagnóstico estructurado: panel de puntuaciones, evidencia del sitio, cinco análisis comerciales profundos, inteligencia competitiva, impacto comercial, prioridades de corrección, brief de marca, playbook de implementación, PDF y entrega por email.",
      },
    ],
    checks: [
      "Claridad de posicionamiento",
      "Visibilidad y repetibilidad en IA",
      "Especificidad de oferta",
      "Credibilidad visual",
      "Preparación para conversión",
      "Señales competitivas",
      "Correcciones prioritarias",
      "Playbook de implementación",
    ],
    faq: [
      {
        question: "¿BrandMirror es una auditoría web o de marca?",
        answer:
          "Es una auditoría de marca a través del sitio. BrandMirror usa la homepage como superficie de evidencia porque ahí es donde compradores, buscadores y sistemas de IA suelen encontrar primero la marca.",
      },
      {
        question: "¿Puedo usarlo para cualquier sitio?",
        answer:
          "Sí. BrandMirror puede leer cualquier homepage pública: negocios de servicios, estudios, consultores, SaaS, marcas personales y ecommerce.",
      },
      {
        question: "¿Incluye recomendaciones de visibilidad en IA?",
        answer:
          "Sí. El reporte revisa si la marca es fácil de entender, repetir y recomendar para sistemas de IA, y lo convierte en correcciones prácticas de web y mensaje.",
      },
    ],
  },
  ru: {
    eyebrow: "AI-аудит бренда",
    title: "AI-аудит бренда для любого сайта",
    description:
      "BrandMirror читает homepage так, как его встречают покупатель, поисковая система и AI: позиционирование, видимость в ИИ, ясность оффера, визуальное доверие и готовность к конверсии.",
    primaryCta: "Начать бесплатный разбор",
    secondaryCta: "Смотреть пример отчёта",
    back: "BrandMirror",
    sections: [
      {
        title: "Что аудирует BrandMirror",
        body:
          "BrandMirror оценивает первую публичную бренд-поверхность сайта. Он смотрит, объясняет ли страница, что продаётся, для кого это, почему это важно, насколько конкретен оффер, создаёт ли визуальная система доверие и могут ли AI-системы понять и повторить бренд без догадок.",
      },
      {
        title: "Почему видимость в ИИ — часть бренд-аудита",
        body:
          "Покупатели всё чаще находят и сравнивают бренды через поиск, AI-ассистентов, summaries и рекомендательные системы. Бренд может выглядеть красиво, но оставаться трудным для описания в ChatGPT, Gemini, Perplexity или AI-поверхностях Google.",
      },
      {
        title: "Что даёт полный отчёт",
        body:
          "Платный BrandMirror Report превращает скан в структурированный диагноз: панель оценок, доказательства с сайта, пять коммерческих deep dives, конкурентный разбор, коммерческий эффект, приоритетные правки, бренд-бриф, implementation playbook, PDF и доставку на email.",
      },
    ],
    checks: [
      "Ясность позиционирования",
      "Видимость и повторяемость в ИИ",
      "Конкретность оффера",
      "Визуальное доверие",
      "Готовность к конверсии",
      "Конкурентные сигналы",
      "Приоритетные правки",
      "План внедрения",
    ],
    faq: [
      {
        question: "BrandMirror — это аудит сайта или бренда?",
        answer:
          "Это бренд-аудит через сайт. BrandMirror использует homepage как evidence surface, потому что именно там покупатели, поисковые системы и AI чаще всего впервые встречают бренд.",
      },
      {
        question: "Можно использовать для любого сайта?",
        answer:
          "Да. BrandMirror может читать любой публичный homepage: сервисные бизнесы, студии, консультантов, SaaS, личные бренды и ecommerce.",
      },
      {
        question: "В отчёте есть рекомендации по AI visibility?",
        answer:
          "Да. Отчёт проверяет, легко ли AI-системам понять, повторить и рекомендовать бренд, а затем превращает это в практические правки для сайта и сообщения.",
      },
    ],
  },
} as const;

export const metadata: Metadata = {
  title: "AI Brand Audit for Any Website",
  description:
    "BrandMirror is an AI brand audit for any website. Audit positioning, AI visibility, offer clarity, visual credibility, and conversion readiness.",
  alternates: {
    canonical: "/ai-brand-audit",
  },
  keywords: [
    "AI brand audit",
    "AI website audit",
    "AI visibility audit",
    "brand audit for website",
    "homepage audit",
    "brand positioning audit",
  ],
  openGraph: {
    title: "AI Brand Audit for Any Website | BrandMirror",
    description:
      "Audit any homepage for positioning, AI visibility, offer clarity, visual credibility, and conversion readiness.",
    url: "/ai-brand-audit",
    type: "website",
  },
};

function buildStructuredData(copy: (typeof pageCopy)[keyof typeof pageCopy]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AI Brand Audit for Any Website",
      url: absoluteUrl("/ai-brand-audit"),
      description: copy.description,
      isPartOf: {
        "@type": "WebSite",
        name: "BrandMirror",
        url: SITE_URL,
      },
      about: [
        "AI brand audit",
        "AI visibility audit",
        "website brand audit",
        "homepage conversion audit",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "BrandMirror AI Brand Audit",
      serviceType: "AI brand audit",
      provider: {
        "@type": "Organization",
        name: "SAHAR Studio",
        url: "https://saharstudio.com",
      },
      areaServed: "Worldwide",
      url: absoluteUrl("/ai-brand-audit"),
      offers: {
        "@type": "Offer",
        price: "197",
        priceCurrency: "USD",
        url: absoluteUrl("/first-read"),
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "BrandMirror",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "AI Brand Audit",
          item: absoluteUrl("/ai-brand-audit"),
        },
      ],
    },
  ];
}

export default async function AiBrandAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = siteI18n.getSiteLocale(params.lang);
  const copy = pageCopy[locale];
  const structuredData = buildStructuredData(copy);

  return (
    <main className="page-shell homepage-shell min-h-screen bg-[color:var(--background)] px-6 py-6 sm:px-8 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-7xl">
        <header className="editorial-rule flex flex-col gap-5 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={siteI18n.withLang("/", locale)}
              className="font-serif text-2xl tracking-[-0.04em] text-[color:var(--foreground)]"
            >
              BrandMirror
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.26em] text-[color:var(--foreground-soft)]">
              {copy.eyebrow}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={siteI18n.withLang("/first-read", locale)}
              className="rounded-full border border-[color:var(--line-strong)] px-4 py-2 text-sm text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
            >
              {copy.primaryCta}
            </Link>
            <LanguageSwitcher locale={locale} />
          </div>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
          <div>
            <p className="section-label">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.4rem,8vw,7.3rem)] leading-[0.88] tracking-[-0.06em] text-[color:var(--foreground)]">
              {copy.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[color:var(--foreground-soft)]">
              {copy.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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

          <div className="grid gap-3 border-y border-[color:var(--line)] py-5 sm:grid-cols-2">
            {copy.checks.map((check) => (
              <p
                key={check}
                className="rounded-none border-t border-[color:var(--line)] pt-3 text-sm font-medium leading-6 text-[color:var(--foreground-soft)] first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
              >
                {check}
              </p>
            ))}
          </div>
        </section>

        <section className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {copy.sections.map((section) => (
            <article
              key={section.title}
              className="grid gap-6 py-9 md:grid-cols-[0.36fr_0.64fr]"
            >
              <h2 className="font-serif text-3xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                {section.title}
              </h2>
              <p className="text-base leading-8 text-[color:var(--foreground-soft)]">
                {section.body}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-12 py-20 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="section-label">FAQ</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)] sm:text-5xl">
              AI Brand Audit FAQ
            </h2>
          </div>
          <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {copy.faq.map((item) => (
              <article key={item.question} className="grid gap-4 py-6 sm:grid-cols-[0.45fr_0.55fr]">
                <h3 className="font-serif text-2xl leading-tight tracking-[-0.03em] text-[color:var(--foreground)]">
                  {item.question}
                </h3>
                <p className="text-base leading-7 text-[color:var(--foreground-soft)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
