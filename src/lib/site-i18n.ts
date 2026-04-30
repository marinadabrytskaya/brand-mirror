// @ts-nocheck
export type SiteLocale = "en" | "es" | "ru";

export const SUPPORTED_SITE_LOCALES: SiteLocale[] = ["en", "es", "ru"];

export const SITE_LOCALE_LABELS: Record<SiteLocale, string> = {
  en: "EN",
  es: "ES",
  ru: "RU",
};

export function getSiteLocale(value?: string | string[]): SiteLocale {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate === "es" || candidate === "ru") return candidate;
  return "en";
}

export function withLang(href: string, locale: SiteLocale) {
  const [preHash, hash = ""] = href.split("#");
  const [pathname, query = ""] = preHash.split("?");
  const params = new URLSearchParams(query);
  params.set("lang", locale);
  const nextQuery = params.toString();
  const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
  return hash ? `${nextHref}#${hash}` : nextHref;
}

export const siteCopy = {
  en: {
    landing: {
      brandPowered: "Created by SAHAR",
      navHow: "How it works",
      navOffer: "Offer",
      navSample: "Sample report",
      navSahar: "SAHAR website",
      kicker: "BrandMirror shows what to fix first.",
      title: "AI Brand Audit for Any Website",
      body:
        "Your website may have a leak visitors can feel before they can name it. Enter any homepage and get a free first read of its positioning, AI visibility, offer clarity, visual trust, and conversion readiness.",
      primaryCta: "\u25B6 Read My Brand",
      secondaryCta: "See sample report \u2192",
      heroProofs: [
        "Free first read: 5 scores, strongest asset, main friction.",
        "$197 full report: website evidence, fix stack, competitor read, PDF.",
        "Built for any site that needs to explain value and convert.",
      ],
      signalHeadingLabel: "What it reads",
      signalHeadingTitle:
        "A brand diagnosis for buyers, search engines, and LLMs.",
      signalHeadingBody:
        "BrandMirror reads how clearly a website explains its value, how credible it feels, and whether AI tools can understand, repeat, and recommend the brand.",
      signalColumns: [
        {
          label: "Positioning",
          title: "If buyers can't repeat what you sell in one sentence — you don't have positioning.",
          body:
            "You have atmosphere.",
        },
        {
          label: "AI visibility",
          title: "ChatGPT is your new homepage.",
          body:
            "If it can't explain your brand — neither can your buyers.",
        },
        {
          label: "Visual identity",
          title: "Your visuals speak before your copy does.",
          body:
            "BrandMirror reads what they're saying — and whether it's costing you money.",
        },
      ],
      evidence: {
        eyebrow: "Free first read",
        headline: "See where trust holds and where it breaks.",
        subheadline:
          "A high-end diagnostic board that shows the opening promise, the decision zone, and the places where buyers stop moving.",
        cta: "Read my brand",
        markers: [
          {
            id: "promise",
            label: "Promise",
            title: "Offer lands too slowly",
            note: "The page looks premium fast, but the commercial point arrives late.",
            x: 10,
            y: 16,
          },
          {
            id: "proof",
            label: "Proof",
            title: "Trust is too implied",
            note: "The buyer still has to infer too much before the CTA asks for action.",
            x: 87,
            y: 56,
          },
          {
            id: "fix",
            label: "Fix first",
            title: "Sharpen the first screen",
            note: "State the offer earlier. Keep the premium feel. Cut the delay.",
            x: 18,
            y: 80,
          },
        ],
        verdicts: [
          "Working: premium signal",
          "Broken: offer clarity",
          "Fix first: promise before atmosphere",
        ],
      },
      previewRows: [
        {
          title: "Clarity",
          score: "72",
          copy: "The brand feels premium quickly, but the offer becomes precise too slowly.",
        },
        {
          title: "Premium perception",
          score: "88",
          copy: "Typography, spacing, and restraint create a strong sense of quality and control.",
        },
        {
          title: "Cohesion",
          score: "64",
          copy: "The visual system and the messaging are close, but not yet fully reinforcing the same promise.",
        },
      ],
      how: {
        label: "How it works",
        title: "How it works",
        body:
          "Enter a URL. See the first signal. Unlock the full diagnosis only if the read hits.",
        notes: [
          "The free read shows you the signal.",
          "The $197 report names the leak, the fix, and the commercial cost of doing nothing.",
        ],
        workflow: [
          {
            step: "01",
            title: "Enter your URL",
            body: "BrandMirror reads your homepage the way a cold buyer would. No context. No charity.",
          },
          {
            step: "02",
            title: "Get the first signal",
            body: "Score, friction point, strongest asset, and the one thing buyers sense before they bounce.",
          },
          {
            step: "03",
            title: "Unlock the full report",
            body: "$197 opens the complete breakdown: what works, what leaks, why buyers hesitate — and what to fix first.",
          },
        ],
      },
      fullReport: {
        label: "Full report",
        title: "Start free. Go deeper only if the signal hits.",
        body:
          "The free read shows you the signal. The $197 report names the leak, the fix, and the commercial cost of doing nothing. One or the other. You pick.",
        cardLabel: "BrandMirror report — $197",
        included: "Included",
        items: [
          "What works / what's broken",
          "Why clients don't choose you",
          "Audience mismatch",
          "Positioning read",
          "AI visibility audit",
          "Visual identity read",
          "Above-the-fold audit",
          "Priority fix stack",
          "Commercial impact estimate",
          "Competitor comparison",
          "Implementation playbook",
          "PDF export",
        ],
        notes: [
          "Core scope: one homepage / one primary brand surface.",
          "Built to be affordable enough to buy, but sharp enough to act on.",
        ],
      },
      offers: {
        label: "Pricing",
        title: "The free read shows you the signal.",
        body:
          "The $197 report turns that signal into a full commercial diagnosis: what is working, what is leaking trust, what to fix first, and what the upside looks like when the brand becomes easier to understand, recommend, and choose.",
        layer: "Diagnostic layer",
        rows: [
          {
            name: "Free First Read",
            layer: "Diagnostic layer",
            price: "$0",
            summary:
              "A fast outside read of the homepage: first-screen signal, 5 scores, strongest asset, main friction, and the first reason buyers may hesitate.",
            detail: "Best for seeing whether the diagnosis feels specific before you pay.",
          },
          {
            name: "BrandMirror Report",
            layer: "Diagnostic layer",
            price: "$197",
            summary:
              "The paid diagnosis: score dashboard, website evidence, 5 commercial deep dives, AI visibility read, competitor intelligence, commercial impact, priority fix stack, one-page brand brief, and implementation playbook.",
            detail: "Best for any website owner, team, founder, studio, consultant, or service brand that needs to know what to fix, why it matters, and what to do next.",
          },
          {
            name: "SAHAR Follow-Through",
            layer: "Implementation layer",
            price: "By scope",
            summary:
              "If you want help implementing the fixes, SAHAR can sharpen the positioning, visibility signals, offer clarity, messaging, proof, CTA path, website structure, and broader brand strategy.",
            detail: "Best when you want the diagnosis turned into visible changes, not just a report.",
            actionLabel: "Discuss implementation",
            actionHref: "mailto:hello@saharstudio.com?subject=BrandMirror%20implementation",
          },
        ],
        primaryCta: "\u25B6 UNLOCK FULL REPORT — $197",
        secondaryCta: "See sample report \u2192",
      },
      faq: {
        label: "",
        title: "FAQ",
        body: "",
        items: [
          {
            question: "What is BrandMirror?",
            answer:
              "BrandMirror is an AI website audit for any homepage that needs to explain value and convert. It reads positioning, AI visibility, offer clarity, visual credibility, and conversion readiness.",
          },
          {
            question: "What do I get in the free first read?",
            answer:
              "The free first read gives a fast diagnostic signal: score dashboard, strongest asset, main friction, first diagnosis, and a clear next-step teaser before payment.",
          },
          {
            question: "What is included in the $197 full report?",
            answer:
              "The paid report includes the full first read, score dashboard, website evidence, five commercial deep dives, AI visibility read, competitor intelligence, commercial impact, priority fix stack, one-page brand brief, implementation playbook, and PDF export.",
          },
          {
            question: "Who is BrandMirror best for?",
            answer:
              "BrandMirror is best for websites that already have something valuable to offer but need clearer positioning, offer language, proof, and conversion direction.",
          },
          {
            question: "Can I hand the recommendations to a developer?",
            answer:
              "Yes. The full report includes concrete implementation guidance, including messaging priorities, website structure, AI visibility tasks, metadata/schema checks, and priority fixes.",
          },
        ],
      },
      final: {
        label: "Final cue",
        title:
          "BrandMirror reads what buyers sense before they speak.",
        body:
          "Start with the free signal. If it lands, unlock the full diagnosis and turn the leak into a fix stack.",
        primaryCta: "\u25B6 Read My Brand",
        secondaryCta: "See sample report \u2192",
      },
      legalLine:
        "Powered by SAHAR. BrandMirror is a proprietary diagnostic system by SAHAR Studio. © 2026 SAHAR Studio. All rights reserved.",
      footerAbout:
        "BrandMirror is created by SAHAR Studio, a creative intelligence studio for brand strategy, websites, campaign direction, and AI visibility.",
      footerPrivacy: "Privacy Policy",
      footerTerms: "Terms & Refund Policy",
    },
    firstRead: {
      back: "Back to BrandMirror",
      title: "First signal. Free.",
      mechanicLabel: "Live read",
      mechanicBody:
        "Enter any brand URL to begin. BrandMirror reads your homepage as a cold buyer: no context, no charity, no assumptions.",
      startLabel: "Start here",
      startTitle: "Drop your homepage URL. The scan takes 60 seconds.",
      startHelper: "Drop your homepage URL. The scan takes 60 seconds.",
      startBody:
        "Enter your URL. BrandMirror reads what buyers feel before they decide to leave.",
      websiteUrl: "Website URL",
      urlPlaceholder: "yourbrand.com",
      emailLabel: "Email for report",
      emailPlaceholder: "you@example.com",
      emailRequired: "Enter a valid email address to receive the report.",
      dataConsentLabel:
        "I agree that SAHAR/BrandMirror may process my email and website URL to generate and send my report.",
      dataConsentRequired:
        "Please agree to data processing so we can generate and send your report.",
      marketingConsentLabel:
        "Send me occasional SAHAR/BrandMirror updates, offers, and useful articles on branding and AI. I can unsubscribe anytime.",
      promoLabel: "Promo code",
      promoPlaceholder: "OPTIONAL",
      promoApply: "Apply",
      promoAppliedButton: "Applied",
      promoChecking: "Checking",
      promoEmpty: "Enter a promo code first.",
      promoInvalid: "Promo code is not valid.",
      promoApplied: "{code} applied. {percent}% discount added.",
      promoSubtotal: "BrandMirror Report",
      promoDiscount: "Promo discount",
      promoDueToday: "Due today",
      promoFreeCta: "Open full report — $0",
      promoPayCta: "Pay today",
      checkoutCta: "Unlock — $197",
      checkoutBusy: "Opening checkout...",
      checkoutError: "Unable to open checkout right now.",
      submitIdle: "\u25B6 READ THE SIGNAL",
      submitBusy: "Reading brand...",
      statusInitial: "Enter a URL to begin",
      statusReading: "Scanning homepage copy, AI visibility, visual hierarchy, offer clarity, and conversion path.",
      statusDone: "First read generated. The $197 report is ready to unlock.",
      pdfEmailSending: "Sending your PDF to email...",
      pdfEmailSent: "PDF sent to your email.",
      pdfEmailSkipped: "PDF email is not configured yet; use the download button below.",
      pdfEmailFailed: "The report is ready, but the email could not be sent.",
      statusReady: "Ready to scan \u2192",
      emptyUrl: "Enter a URL to begin",
      invalidUrl: "That doesn't look like a website URL",
      unreachableUrl: "We couldn't reach that page — try the homepage URL",
      diagnosticPreview: "Diagnostic preview",
      generatedLabel: "Generated first read",
      resultTitle: "The first read",
      freeBadge: "Free",
      whatItDoes: "What the company appears to do",
      firstDiagnosis: "First diagnosis",
      currentState: "Current state",
      strongestSignal: "Strongest signal",
      mainFriction: "Main friction",
      nextMove: "Next move",
      freePdfIdle: "Download free read PDF",
      freePdfBusy: "Exporting free PDF...",
      unlockLabel: "Unlock full report",
      unlockBody:
        "Unlock the complete BrandMirror diagnosis with signal read, website surface, five deep dives, competitor intelligence, commercial impact estimate, one-page brand brief, and implementation playbook.",
      included: "Included",
      unlockItems: [
        "Signal read + website surface",
        "5 commercial deep dives",
        "AI visibility audit",
        "Priority fix stack",
        "One-page brand brief",
        "Commercial impact estimate",
        "Competitor comparison",
        "Implementation playbook",
        "PDF export",
      ],
      unlockNotes: [
        "Scope: one website / one primary brand surface.",
        "Format: private web report with downloadable PDF.",
        "Built as a strategic working document, not as a generic upsell wall.",
      ],
      unlockCta: "Unlock the full BrandMirror report — $197",
      unlockSecondary: "See full report structure",
    },
    fullReport: {
      back: "Back to BrandMirror",
      title: "Full report",
      fallbackLabel: "Full report",
      fallbackTitle: "Loading the BrandMirror report surface.",
      mechanicLabel: "Paid diagnostic",
      mechanicBody:
        "The full report turns the first read into a sharper commercial diagnosis with evidence, priorities, and a downloadable PDF.",
      unlockLabel: "Report builder",
      unlockTitle: "Generate the full BrandMirror report.",
      unlockBody:
        "Use the same website from the first read, then export the full diagnosis once the report is ready.",
      websiteUrl: "Website URL",
      urlPlaceholder: "yourbrand.com",
      submitIdle: "Generate full report",
      submitBusy: "Building report...",
      statusInitial: "Enter a website to generate the full report.",
      statusBusy: "Building the full BrandMirror report.",
      statusDone: "Full BrandMirror report generated.",
      emptyUrl: "Enter a website URL to generate the full report.",
      shareable: "Shareable diagnostic",
      reportEyebrow: "Full BrandMirror report",
      reportHeadline: "What is working. What is broken.",
      reportSubheadline:
        "The paid layer explains where trust is holding, where the message is dropping, and what to fix first.",
      paymentVerifyError:
        "We couldn't verify payment for this report.",
      downloadIdle: "Download PDF",
      downloadBusy: "Exporting PDF...",
      sampleCta: "See sample report",
      footerNote:
        "Framed as a vertical diagnostic artifact so the result feels more shareable and more product-like than a generic report cover.",
    },
    sample: {
      back: "Back to BrandMirror",
      title: "Sample report",
      mockClientLabel: "Mock client",
      mockClientBody:
        "Nera Studio, a premium creative practice with a strong visual system and a softer-than-ideal commercial signal.",
      summaryLabel: "Executive summary",
      summaryTitle:
        "The brand looks precise, trusted, and premium. It sounds less explicit than it needs to.",
      summaryBody:
        "BrandMirror reads the gap between what the design system implies and what the messaging confirms. Here, the identity strongly signals quality. The positioning still needs a firmer commercial edge.",
      structureLabel: "Report structure",
      structureTitle: "A strategist's read, formatted like a product output.",
      structureBody:
        "The experience should feel calm, exact, and useful enough to act on immediately. Each section isolates one layer of the brand impression and then resolves it into a practical next move.",
      recommendedMove: "Recommended move",
      frictionLabel: "Friction map",
      actionsLabel: "Priority actions",
      closingLabel: "How this sells the product",
      closingTitle:
        "The output itself should prove why the brand is winning trust, where it is losing it, and why buyers still hesitate.",
      closingBody:
        "This preview is meant to make the product believable: a founder should be able to see the diagnosis, act on it fast, and understand why the paid layer is worth buying.",
      primaryCta: "Read my brand",
      secondaryCta: "Return to landing page",
      scoreRows: [
        { label: "Positioning clarity", score: "72", note: "Strong premise, soft edge." },
        { label: "AI visibility", score: "81", note: "Elegant and controlled." },
        { label: "Visual credibility", score: "89", note: "Highly trusted on sight." },
        { label: "Offer specificity", score: "58", note: "Too delayed." },
      ],
      sections: [
        {
          label: "Positioning read",
          title: "The brand feels premium before it feels precise.",
          body:
            "Nera Studio signals taste, composure, and strategic maturity. The website creates a strong first impression, but the offer statement arrives with too much atmosphere and not enough edge. A buyer understands the quality level before they understand the exact transformation.",
          recommendation:
            "Move the value proposition earlier and sharpen the language around business outcomes without losing the quiet-luxury tone.",
        },
        {
          label: "AI visibility read",
          title: "The voice is intelligent, but slightly withheld.",
          body:
            "The copy sounds elevated and self-aware. That supports the premium impression, yet several sections lean so far into refinement that urgency disappears. The brand is saying 'we are discerning' more clearly than it is saying 'we solve this problem now.'",
          recommendation:
            "Keep the restraint, but introduce one harder-working sentence per section that translates sensibility into consequence.",
        },
        {
          label: "Visual identity read",
          title: "The visual system is doing exceptional trust work.",
          body:
            "Typography, palette, whitespace, and image restraint all support a calm high-end read. The site looks expensive in the right way. The risk is that the visual identity has become the clearest message on the page, which means design quality is carrying more of the sales burden than the offer architecture.",
          recommendation:
            "Preserve the visual severity and use it to frame stronger proof, clearer promises, and more directional calls to action.",
        },
      ],
      frictionMap: [
        "The offer language does not define the before-and-after fast enough.",
        "Emotional atmosphere arrives before commercial certainty.",
        "Proof cues are elegant but slightly buried below the fold.",
        "CTA language is calm, though it could work harder at the point of intent.",
      ],
      nextMoves: [
        "Rewrite the hero promise so the outcome lands in the first screen.",
        "Pair every mood-led section with one commercially explicit sentence.",
        "Introduce proof earlier: named outcomes, client context, or credibility markers.",
        "Keep the current visual restraint and let the copy do more of the conversion work.",
      ],
    },
  },
  es: {
    landing: {
      brandPowered: "Creado por SAHAR",
      navHow: "Cómo funciona",
      navOffer: "Oferta",
      navSample: "Reporte de muestra",
      navSahar: "Sitio de SAHAR",
      kicker: "BrandMirror muestra qué corregir primero.",
      title: "Auditoría de marca con IA para cualquier sitio",
      body:
        "Tu sitio puede tener una fuga que el visitante siente antes de poder nombrarla. Introduce cualquier homepage y recibe una primera lectura gratuita de posicionamiento, visibilidad en IA, claridad de oferta, confianza visual y preparación para convertir.",
      primaryCta: "Lee mi marca",
      secondaryCta: "Ver reporte de muestra",
      heroProofs: [
        "Primera lectura gratis: 5 puntuaciones, activo más fuerte y fricción principal.",
        "Reporte completo de $197: evidencia del sitio, prioridades de corrección, lectura competitiva y PDF.",
        "Hecho para cualquier sitio que necesita explicar valor y convertir.",
      ],
      signalHeadingLabel: "Qué lee",
      signalHeadingTitle:
        "Un diagnóstico de marca para compradores, buscadores y modelos de IA.",
      signalHeadingBody:
        "BrandMirror lee con qué claridad el sitio explica su valor, cuánta confianza genera y si las herramientas de IA pueden entender, repetir y recomendar la marca.",
      signalColumns: [
        {
          label: "Posicionamiento",
          title: "Cómo suena tu oferta en el mercado",
          body:
            "BrandMirror lee qué tan clara aterriza tu oferta, dónde tu promesa se vuelve vaga y si tu posicionamiento se siente de alto nivel, específico o demasiado pulido para convertir.",
        },
        {
          label: "Tono",
          title: "Cómo se comporta la voz de tu marca bajo presión",
          body:
            "Revisa si tu lenguaje se siente agudo, calmado, indulgente, distante, genérico o demasiado cuidadoso. El tono se trata como una señal comercial, no como un ejercicio de redacción.",
        },
        {
          label: "Identidad visual",
          title: "Qué implican tus visuales antes de que alguien lea",
          body:
            "Composición, tipografía, paleta, contención, jerarquía y señales de confianza se revisan juntos para reflejar la impresión completa de la marca, no notas sueltas de diseño.",
        },
      ],
      evidence: {
        eyebrow: "Primera lectura gratis",
        headline: "Mira dónde la confianza se sostiene y dónde se rompe.",
        subheadline:
          "Un tablero de diagnóstico de alto nivel que muestra la promesa de apertura, la zona de decisión y los puntos donde el comprador deja de avanzar.",
        cta: "Lee mi marca",
        markers: [
          {
            id: "promise",
            label: "Promesa",
            title: "La oferta aterriza demasiado tarde",
            note: "La página se siente de alto nivel rápido, pero el punto comercial llega tarde.",
            x: 10,
            y: 16,
          },
          {
            id: "proof",
            label: "Prueba",
            title: "La confianza está demasiado implícita",
            note: "El comprador todavía tiene que inferir demasiado antes de que la llamada a la acción pida avanzar.",
            x: 87,
            y: 56,
          },
          {
            id: "fix",
            label: "Arreglar primero",
            title: "Afina la primera pantalla",
            note: "Declara la oferta antes. Mantén la sensación de alto nivel. Corta la demora.",
            x: 18,
            y: 80,
          },
        ],
        verdicts: [
          "Funciona: señal de alto nivel",
          "Roto: claridad de la oferta",
          "Arreglar primero: promesa antes de atmósfera",
        ],
      },
      previewRows: [
        {
          title: "Claridad",
          score: "72",
          copy: "La marca se siente de alto nivel rápido, pero la oferta se vuelve precisa demasiado tarde.",
        },
        {
          title: "Percepción de alto nivel",
          score: "88",
          copy: "Tipografía, espacio y contención crean una fuerte sensación de calidad y control.",
        },
        {
          title: "Cohesión",
          score: "64",
          copy: "El sistema visual y el mensaje están cerca, pero aún no refuerzan la misma promesa.",
        },
      ],
      how: {
        label: "Cómo funciona",
        title: "Primero la señal gratis. El diagnóstico completo solo cuando ya se siente útil.",
        body:
          "El flujo del producto debe hacer que BrandMirror sea fácil de probar sin regalar todo el reporte. La primera lectura gana el derecho a vender la capa pagada.",
        notes: [
          "La capa gratuita demuestra que BrandMirror detecta la brecha rápido.",
          "La capa pagada le dice al comprador qué funciona, qué está roto, por qué la marca pierde confianza y qué arreglar primero.",
        ],
        workflow: [
          { step: "01", title: "Ingresa tu sitio", body: "BrandMirror toma una primera lectura de la página principal y muestra gratis la impresión inmediata." },
          { step: "02", title: "Revisa la primera señal", body: "Ves el resumen, tres puntuaciones, una fortaleza, un punto de fricción y el siguiente movimiento que vale la pena arreglar." },
          { step: "03", title: "Desbloquea el reporte completo", body: "Paga $197 para abrir el diagnóstico completo con posicionamiento, visibilidad en IA, identidad visual, escenarios de impacto comercial, comparación con competidores y el plan de implementación." },
        ],
      },
      fullReport: {
        label: "Reporte completo",
        title: "La capa de $197 debe sentirse como un mini-producto real.",
        body:
          "Lo que el comprador desbloquea no es más comentario. Es el diagnóstico pagado: qué funciona, qué está roto, por qué la marca no convierte y qué arreglar primero.",
        cardLabel: "Reporte BrandMirror — $197",
        included: "Incluido",
        items: [
          "Qué funciona / qué está roto",
          "Por qué los clientes no te eligen",
          "Desajuste con la audiencia",
          "Lectura de posicionamiento",
          "Auditoría de visibilidad en IA",
          "Lectura de identidad visual",
          "Auditoría del primer pantallazo",
          "Prioridades de corrección",
          "Escenarios de impacto comercial",
          "Comparación con competidores",
          "Plan de implementación",
          "Exportación PDF",
        ],
        notes: [
          "Alcance central: una home / una superficie principal de marca.",
          "Pensado para ser lo bastante accesible para comprarlo y lo bastante agudo para actuar.",
        ],
      },
      offers: {
        label: "Estructura de oferta",
        title: "Una escalera simple: señal gratis, reporte pagado y trabajo más profundo opcional.",
        body:
          "El reporte de $197 convierte esa señal en un diagnóstico comercial completo: qué funciona, dónde se fuga la confianza, qué corregir primero y qué mejora cuando la marca se vuelve más fácil de entender, recomendar y elegir.",
        layer: "Capa de diagnóstico",
        rows: [
          {
            name: "Primera lectura gratis",
            layer: "Capa de diagnóstico",
            price: "$0",
            summary:
              "Una lectura externa rápida de la página principal: señal del primer pantallazo, 5 puntuaciones, activo más fuerte, fricción principal y la primera razón por la que un comprador puede dudar.",
            detail: "Ideal para comprobar si el diagnóstico se siente específico antes de pagar.",
          },
          {
            name: "Reporte BrandMirror",
            layer: "Capa de diagnóstico",
            price: "$197",
            summary:
              "El diagnóstico pagado: panel de puntuaciones, evidencia del sitio, 5 análisis comerciales profundos, lectura de visibilidad en IA, inteligencia competitiva, impacto comercial, prioridades de corrección, brief de marca de una página y playbook de implementación.",
            detail: "Ideal para fundadores y marcas de servicios premium que necesitan saber qué corregir, por qué importa y qué hacer después.",
          },
          {
            name: "Continuación con SAHAR",
            layer: "Capa de implementación",
            price: "Según alcance",
            summary:
              "Si quieres ayuda para implementar las correcciones, SAHAR puede afinar el posicionamiento, señales de visibilidad, claridad de oferta, mensaje, prueba, ruta de CTA, estructura del sitio y estrategia de marca más amplia.",
            detail: "Ideal cuando quieres convertir el diagnóstico en cambios visibles, no solo en un reporte.",
            actionLabel: "Hablar de implementación",
            actionHref: "mailto:hello@saharstudio.com?subject=BrandMirror%20implementation",
          },
        ],
        primaryCta: "Empezar primera lectura gratis",
        secondaryCta: "Revisar estructura del reporte completo",
      },
      faq: {
        label: "",
        title: "FAQ",
        body: "",
        items: [
          {
            question: "¿Qué es BrandMirror?",
            answer:
              "BrandMirror es una auditoría de marca con IA para cualquier homepage que necesita explicar valor y convertir. Lee posicionamiento, visibilidad en IA, claridad de oferta, credibilidad visual y preparación para convertir.",
          },
          {
            question: "¿Qué recibo en la primera lectura gratuita?",
            answer:
              "La primera lectura gratuita entrega una señal diagnóstica rápida: tablero de puntuaciones, activo más fuerte, fricción principal, primer diagnóstico y un teaser claro del siguiente paso antes del pago.",
          },
          {
            question: "¿Qué incluye el reporte completo de $197?",
            answer:
              "El reporte pagado incluye la primera lectura completa, tablero de puntuaciones, evidencia del sitio, cinco análisis comerciales profundos, lectura de visibilidad en IA, inteligencia competitiva, impacto comercial, prioridades de corrección, brief de marca de una página, playbook de implementación y exportación PDF.",
          },
          {
            question: "¿Para quién es mejor BrandMirror?",
            answer:
              "BrandMirror es mejor para sitios que ya tienen algo valioso que ofrecer, pero necesitan posicionamiento, lenguaje de oferta, prueba y dirección de conversión más claros.",
          },
          {
            question: "¿Puedo entregar las recomendaciones a un desarrollador?",
            answer:
              "Sí. El reporte completo incluye guía concreta de implementación: prioridades de mensaje, estructura web, tareas de visibilidad en IA, revisión de metadatos/schema y correcciones prioritarias.",
          },
        ],
      },
      final: {
        label: "Cierre",
        title:
          "Empieza gratis. Luego paga solo si quieres la respuesta dura sobre qué funciona, qué está roto y por qué los compradores dudan.",
        body:
          "Eso hace que la capa gratuita sea creíble, la capa pagada aguda y todo el producto se sienta como un diagnóstico real, no como una revisión blanda de marca.",
        primaryCta: "Lee mi marca",
        secondaryCta: "Ver reporte de muestra",
      },
      legalLine:
        "Powered by SAHAR. BrandMirror es un sistema diagnóstico propietario de SAHAR Studio. © 2026 SAHAR Studio. Todos los derechos reservados.",
      footerAbout:
        "BrandMirror fue creado por SAHAR Studio, un estudio de inteligencia creativa para estrategia de marca, sitios web, dirección de campañas y visibilidad en IA.",
      footerPrivacy: "Política de privacidad",
      footerTerms: "Términos y reembolsos",
    },
    firstRead: {
      back: "Volver a BrandMirror",
      title: "Primera lectura gratis",
      mechanicLabel: "Lectura en vivo",
      mechanicBody:
        "Ingresa cualquier sitio web de marca. BrandMirror lee la página principal como un comprador frío: sin contexto, sin indulgencia y sin suposiciones.",
      startLabel: "Empieza aquí",
      startTitle: "Ingresa un sitio web y deja que BrandMirror lea la primera señal.",
      startBody:
        "La capa gratuita muestra qué está funcionando, qué está rompiendo la confianza y dónde el mensaje empieza a perder al comprador. El reporte completo se abre solo después del pago.",
      websiteUrl: "URL del sitio web",
      urlPlaceholder: "tu-marca.com",
      emailLabel: "Correo para recibir el reporte",
      emailPlaceholder: "tu@email.com",
      emailRequired: "Introduce un email válido para recibir el reporte.",
      dataConsentLabel:
        "Acepto que SAHAR/BrandMirror procese mi email y la URL del sitio para generar y enviar mi reporte.",
      dataConsentRequired:
        "Acepta el procesamiento de datos para que podamos generar y enviar tu reporte.",
      marketingConsentLabel:
        "Quiero recibir novedades, ofertas y artículos útiles sobre branding e IA de SAHAR/BrandMirror. Puedo darme de baja cuando quiera.",
      promoLabel: "Código promocional",
      promoPlaceholder: "OPCIONAL",
      promoApply: "Aplicar",
      promoAppliedButton: "Aplicado",
      promoChecking: "Validando",
      promoEmpty: "Introduce un código promocional primero.",
      promoInvalid: "El código promocional no es válido.",
      promoApplied: "{code} aplicado. {percent}% de descuento añadido.",
      promoSubtotal: "Reporte BrandMirror",
      promoDiscount: "Descuento promocional",
      promoDueToday: "A pagar hoy",
      promoFreeCta: "Abrir reporte completo — $0",
      promoPayCta: "Pagar hoy",
      checkoutCta: "Desbloquear — $197",
      checkoutBusy: "Abriendo pago...",
      checkoutError: "No pudimos abrir el pago ahora.",
      submitIdle: "Lee mi marca",
      submitBusy: "Leyendo marca...",
      statusInitial: "Ingresa un sitio web para generar la primera lectura.",
      statusReading: "Leyendo el sitio y capturando las señales más fuertes.",
      statusDone: "Primera lectura generada. El reporte de $197 está listo para desbloquearse.",
      pdfEmailSending: "Enviando tu PDF por email...",
      pdfEmailSent: "PDF enviado a tu email.",
      pdfEmailSkipped: "El envío de PDF por email aún no está configurado; usa el botón de descarga abajo.",
      pdfEmailFailed: "El reporte está listo, pero no pudimos enviar el email.",
      emptyUrl: "Ingresa un sitio web para generar la primera lectura.",
      diagnosticPreview: "Vista previa del diagnóstico",
      generatedLabel: "Primera lectura generada",
      resultTitle: "La primera lectura",
      freeBadge: "Gratis",
      whatItDoes: "Lo que parece hacer la empresa",
      firstDiagnosis: "Primer diagnóstico",
      currentState: "Estado actual",
      strongestSignal: "Señal más fuerte",
      mainFriction: "Fricción principal",
      nextMove: "Siguiente paso",
      freePdfIdle: "Descargar PDF gratuito",
      freePdfBusy: "Exportando PDF gratuito...",
      unlockLabel: "Desbloquear reporte completo",
      unlockBody:
        "Desbloquea el diagnóstico completo de BrandMirror con lectura de señales, superficie del sitio, 5 análisis profundos, escenarios de impacto comercial y herramientas de implementación que convierten esta lectura en acción.",
      included: "Incluido",
      unlockItems: [
        "Lectura de señales y superficie del sitio",
        "5 análisis comerciales profundos",
        "Auditoría de visibilidad en IA",
        "Arquetipo y póster",
        "Prioridades de corrección",
        "Mapa de implementación a 30 días",
        "Escenarios de impacto comercial",
        "Comparación con competidores",
        "Plan de implementación",
        "Exportación PDF",
      ],
      unlockNotes: [
        "Alcance: un sitio web / una superficie principal de marca.",
        "Formato: reporte web privado con PDF descargable.",
        "Construido como un documento de trabajo estratégico, no como un simple muro de venta adicional.",
      ],
      unlockCta: "Desbloquear el reporte completo de BrandMirror — $197",
      unlockSecondary: "Ver estructura del reporte completo",
      statusReady: "Listo para escanear →",
      invalidUrl: "Eso no parece una URL de sitio web",
      unreachableUrl: "No pudimos acceder a esa página. Prueba con la URL de la página principal.",
      startHelper: "Ingresa la URL de tu página principal. El escaneo tarda 60 segundos.",
      freePdfLabel: "Exportación del reporte gratuito",
      freePdfBody: "Guarda la primera lectura gratuita como una captura PDF fácil de compartir.",
      brandReadLabel: "Lectura de marca",
      brandReadTitle: "El síntoma es visible. El coste comercial necesita nombre.",
      brandReadBody:
        "La lectura gratuita muestra la señal. El reporte completo nombra lo que te está costando y qué corregir primero.",
      currentStateLabel: "Estado actual",
      scanLegendLabel: "Cómo leer el escaneo",
      scanLegendTitle: "Cinco niveles de indicador. Cinco dimensiones de la señal.",
      scanLegendBody:
        "Cada dimensión se puntúa de 0 a 100 y se coloca en uno de cinco niveles. El color muestra qué tan viva está esa señal ahora mismo.",
      fixNowLabel: "Corregir ahora",
      fixNextLabel: "Corregir después",
      keepLabel: "Mantener",
      fixStackLabel: "Pila de corrección",
      fullReportTag: "$197 REPORTE COMPLETO",
      unlockExactFix: "Desbloquea la pila exacta de correcciones detrás de este escaneo.",
      fixStackBody:
        "Qué corregir primero, qué puede esperar y qué ya está ganando confianza, priorizado por impacto comercial.",
      includedInFullReport: "Incluido en el reporte completo",
      fixStackIncluded:
        "Corregir ahora, corregir después y mantener, priorizado por impacto comercial.",
      poweredBy: "Creado por SAHAR",
      bandLabels: {
        flatlining: "Sin señal",
        fragile: "Frágil",
        developing: "En desarrollo",
        stable: "Estable",
        leading: "Líder",
      },
      bandBlurbs: {
        flatlining: "La señal todavía no sostiene confianza ni acción.",
        fragile: "Hay algo útil, pero se rompe demasiado pronto.",
        developing: "La base existe, pero necesita más claridad y prueba.",
        stable: "La señal es legible y puede empezar a vender con más fuerza.",
        leading: "La señal ya está haciendo trabajo comercial real.",
      },
      scanner: {
        enterUrl: "INGRESA URL",
        liveScan: "ESCANEO EN VIVO",
        scanning: "ESCANEANDO",
        awaitingSignal: "ESPERANDO SEÑAL",
        readingSignal: "leyendo señal",
        readyToScan: "listo para escanear",
        firstSignal: "primera señal",
        scanningStatus: "ESCANEANDO...",
        ready: "LISTO",
        scoreBreakdown: "DESGLOSE DE PUNTUACIÓN",
        indicatorScale: "ESCALA DE INDICADORES",
        terminal: [
          "Escaneando texto de la página principal...",
          "Leyendo estructura de señal para IA...",
          "Mapeando camino de conversión...",
          "Analizando jerarquía visual...",
        ],
      },
      dimensionLabels: {
        positioningClarity: "Posicionamiento",
        toneCoherence: "Visibilidad en IA",
        visualCredibility: "Visual",
        offerSpecificity: "Oferta",
        conversionReadiness: "Conversión",
      },
    },
    fullReport: {
      back: "Volver a BrandMirror",
      title: "Reporte completo",
      fallbackLabel: "Reporte completo",
      fallbackTitle: "Cargando la superficie del reporte BrandMirror.",
      mechanicLabel: "Diagnóstico pagado",
      mechanicBody:
        "El reporte completo convierte la primera lectura en un diagnóstico comercial más profundo, con evidencia, prioridades y PDF descargable.",
      unlockLabel: "Generador de reporte",
      unlockTitle: "Genera el reporte completo de BrandMirror.",
      unlockBody:
        "Usa el mismo sitio de la primera lectura y exporta el diagnóstico completo cuando el reporte esté listo.",
      websiteUrl: "URL del sitio web",
      urlPlaceholder: "tu-marca.com",
      submitIdle: "Generar reporte completo",
      submitBusy: "Construyendo reporte...",
      statusInitial: "Ingresa un sitio web para generar el reporte completo.",
      statusBusy: "Construyendo el reporte completo de BrandMirror.",
      statusDone: "Reporte completo de BrandMirror generado.",
      emptyUrl: "Ingresa un sitio web para generar el reporte completo.",
      shareable: "Diagnóstico compartible",
      reportEyebrow: "Reporte completo de BrandMirror",
      reportHeadline: "Qué está funcionando. Qué está roto.",
      reportSubheadline:
        "La capa pagada explica dónde se sostiene la confianza, dónde se cae el mensaje y qué arreglar primero.",
      paymentVerifyError:
        "No pudimos verificar el pago de este reporte.",
      downloadIdle: "Descargar PDF",
      downloadBusy: "Exportando PDF...",
      sampleCta: "Ver reporte de muestra",
      footerNote:
        "Planteado como un artefacto vertical de diagnóstico para que el resultado se sienta más compartible y más producto que una portada de reporte genérica.",
    },
    sample: {
      back: "Volver a BrandMirror",
      title: "Reporte de muestra",
      mockClientLabel: "Cliente ficticio",
      mockClientBody:
        "Nera Studio, una práctica creativa de alto nivel con un sistema visual fuerte y una señal comercial más suave de lo ideal.",
      summaryLabel: "Resumen ejecutivo",
      summaryTitle:
        "La marca se ve precisa, confiable y de alto nivel. Suena menos explícita de lo que necesita.",
      summaryBody:
        "BrandMirror lee la brecha entre lo que implica el sistema de diseño y lo que confirma el mensaje. Aquí, la identidad señala claramente calidad. El posicionamiento todavía necesita un borde comercial más firme.",
      structureLabel: "Estructura del reporte",
      structureTitle: "La lectura de un estratega, presentada como resultado de producto.",
      structureBody:
        "La experiencia debe sentirse calma, exacta y lo bastante útil como para actuar de inmediato. Cada sección aísla una capa de la impresión de marca y luego la resuelve en un próximo movimiento práctico.",
      recommendedMove: "Movimiento recomendado",
      frictionLabel: "Mapa de fricción",
      actionsLabel: "Acciones prioritarias",
      closingLabel: "Cómo esto vende el producto",
      closingTitle:
        "El resultado en sí mismo debe probar por qué la marca está ganando confianza, dónde la está perdiendo y por qué los compradores todavía dudan.",
      closingBody:
        "Esta vista previa está pensada para hacer creíble el producto: un fundador debería poder ver el diagnóstico, actuar rápido y entender por qué la capa pagada merece la compra.",
      primaryCta: "Lee mi marca",
      secondaryCta: "Volver a la landing",
      scoreRows: [
        { label: "Claridad de posicionamiento", score: "72", note: "Premisa fuerte, filo suave." },
        { label: "Coherencia de tono", score: "81", note: "Elegante y controlado." },
        { label: "Credibilidad visual", score: "89", note: "Genera mucha confianza a primera vista." },
        { label: "Especificidad de oferta", score: "58", note: "Demasiado tardía." },
      ],
      sections: [
        {
          label: "Lectura de posicionamiento",
          title: "La marca se siente de alto nivel antes de sentirse precisa.",
          body:
            "Nera Studio señala gusto, compostura y madurez estratégica. El sitio crea una primera impresión fuerte, pero la formulación de la oferta llega con demasiada atmósfera y poco filo. El comprador entiende el nivel de calidad antes de entender la transformación exacta.",
          recommendation:
            "Mueve la propuesta de valor antes y afila el lenguaje alrededor de resultados de negocio sin perder el tono de lujo silencioso.",
        },
        {
          label: "Lectura de tono",
          title: "La voz es inteligente, pero ligeramente contenida.",
          body:
            "La redacción suena elevada y autoconsciente. Eso sostiene la impresión de alto nivel, pero varias secciones empujan tanto la sofisticación que la urgencia desaparece. La marca dice 'somos exigentes' con más claridad de la que dice 'resolvemos este problema ahora'.",
          recommendation:
            "Mantén la contención, pero introduce una frase más trabajadora por sección que traduzca sensibilidad en consecuencia.",
        },
        {
          label: "Lectura de identidad visual",
          title: "El sistema visual está haciendo un trabajo excepcional de confianza.",
          body:
            "Tipografía, paleta, espacio en blanco y contención de imagen sostienen una lectura calma y de gama alta. El sitio se ve caro en el sentido correcto. El riesgo es que la identidad visual se haya convertido en el mensaje más claro de la página, lo que significa que la calidad del diseño está cargando más peso de venta que la arquitectura de la oferta.",
          recommendation:
            "Conserva la severidad visual y úsala para enmarcar pruebas más fuertes, promesas más claras y llamadas a la acción más dirigidas.",
        },
      ],
      frictionMap: [
        "El lenguaje de la oferta no define el antes y el después con suficiente rapidez.",
        "La atmósfera emocional llega antes que la certeza comercial.",
        "Las señales de prueba son elegantes, pero están algo enterradas bajo el pliegue.",
        "El lenguaje de la llamada a la acción es calmado, aunque podría trabajar más en el momento de intención.",
      ],
      nextMoves: [
        "Reescribe la promesa principal para que el resultado aterrice en la primera pantalla.",
        "Empareja cada sección guiada por atmósfera con una frase comercialmente explícita.",
        "Introduce prueba antes: resultados nombrados, contexto de cliente o marcadores de credibilidad.",
        "Mantén la contención visual actual y deja que la redacción haga más trabajo de conversión.",
      ],
    },
  },
  ru: {
    landing: {
      brandPowered: "Создано SAHAR",
      navHow: "Как это работает",
      navOffer: "Предложение",
      navSample: "Пример отчёта",
      navSahar: "Сайт SAHAR",
      kicker: "BrandMirror показывает, что исправить первым.",
      title: "AI-аудит бренда для любого сайта",
      body:
        "У сайта может быть утечка, которую посетитель чувствует раньше, чем может назвать. Вставь любой homepage и получи бесплатный первый разбор позиционирования, видимости в ИИ, ясности оффера, визуального доверия и готовности к конверсии.",
      primaryCta: "Прочитать мой бренд",
      secondaryCta: "Смотреть пример отчёта",
      heroProofs: [
        "Бесплатный первый разбор: 5 оценок, самый сильный актив и главная точка трения.",
        "Полный отчёт за $197: доказательства с сайта, стек правок, конкурентный разбор и PDF.",
        "Для любого сайта, которому нужно объяснить ценность и конвертировать.",
      ],
      signalHeadingLabel: "Что он читает",
      signalHeadingTitle:
        "Диагностика бренда для покупателей, поисковых систем и LLM-моделей.",
      signalHeadingBody:
        "BrandMirror читает, насколько ясно сайт объясняет ценность, вызывает доверие и может быть понят, повторён и рекомендован AI-инструментами.",
      signalColumns: [
        {
          label: "Позиционирование",
          title: "Как звучит твоё предложение на рынке",
          body:
            "BrandMirror читает, насколько ясно приземляется твоё предложение, где обещание становится размытым и ощущается ли позиционирование премиальным, точным или слишком вылизанным, чтобы конвертировать.",
        },
        {
          label: "Видимость в ИИ",
          title: "Насколько инструменты ИИ видят и понимают твой бренд",
          body:
            "Проверяет, могут ли ChatGPT, Gemini и Perplexity найти, правильно описать и порекомендовать твой бренд. Видимость в ИИ рассматривается как коммерческий канал, а не техническая проверка.",
        },
        {
          label: "Визуальная идентичность",
          title: "Что визуал сообщает ещё до того, как человек начал читать",
          body:
            "Композиция, типографика, палитра, сдержанность, иерархия и сигналы доверия читаются вместе, чтобы итоговый разбор отражал полное впечатление от бренда, а не отдельные дизайн-заметки.",
        },
      ],
      evidence: {
        eyebrow: "Бесплатный первый разбор",
        headline: "Увидь, где доверие держится, а где ломается.",
        subheadline:
          "Премиальная диагностическая панель, которая показывает стартовое обещание, зону решения и точки, где покупатель перестаёт двигаться дальше.",
        cta: "Прочитать мой бренд",
        markers: [
          {
            id: "promise",
            label: "Обещание",
            title: "Оффер раскрывается слишком медленно",
            note: "Страница быстро выглядит премиально, но коммерческий смысл приходит поздно.",
            x: 10,
            y: 16,
          },
          {
            id: "proof",
            label: "Доказательство",
            title: "Доверие слишком подразумевается",
            note: "Покупателю всё ещё приходится слишком многое додумывать до того, как призыв к действию просит сделать шаг.",
            x: 87,
            y: 56,
          },
          {
            id: "fix",
            label: "Исправить первым",
            title: "Заостри первый экран",
            note: "Скажи предложение раньше. Сохрани премиальное ощущение. Убери задержку.",
            x: 18,
            y: 80,
          },
        ],
        verdicts: [
          "Работает: премиальный сигнал",
          "Сломано: ясность предложения",
          "Исправить первым: обещание до атмосферы",
        ],
      },
      previewRows: [
        {
          title: "Ясность",
          score: "72",
          copy: "Бренд быстро ощущается премиальным, но предложение становится точным слишком поздно.",
        },
        {
          title: "Премиальное восприятие",
          score: "88",
          copy: "Типографика, ритм и сдержанность создают сильное ощущение качества и контроля.",
        },
        {
          title: "Цельность",
          score: "64",
          copy: "Визуальная система и сообщение близки, но пока не усиливают одно и то же обещание.",
        },
      ],
      how: {
        label: "Как это работает",
        title: "Сначала бесплатный сигнал. Полный диагноз — только когда он уже ощущается полезным.",
        body:
          "Продуктовый путь должен делать BrandMirror лёгким для пробы, не отдавая весь отчёт сразу. Первый разбор зарабатывает право продавать платный слой.",
        notes: [
          "Бесплатный слой доказывает, что BrandMirror быстро видит разрыв.",
          "Платный слой говорит покупателю, что работает, что сломано, почему бренд теряет доверие и что исправить первым.",
        ],
        workflow: [
          { step: "01", title: "Введи свой сайт", body: "BrandMirror берёт первый разбор с главной страницы и бесплатно показывает первое впечатление." },
          { step: "02", title: "Посмотри первый сигнал", body: "Ты видишь резюме, три оценки, одну сильную сторону, одну точку трения и следующий ход, который стоит исправить первым." },
          { step: "03", title: "Открой полный отчёт", body: "Заплати $197 и открой полный диагноз бренда: позиционирование, видимость в ИИ, визуальную идентичность, сценарии коммерческого эффекта, сравнение с конкурентами и план внедрения." },
        ],
      },
      fullReport: {
        label: "Полный отчёт",
        title: "Слой за $197 должен ощущаться как настоящий мини-продукт.",
        body:
          "Покупатель открывает не просто больше комментариев. Он получает платный диагноз: что работает, что сломано, почему бренд не конвертирует и что исправить первым.",
        cardLabel: "Отчёт BrandMirror — $197",
        included: "Включено",
        items: [
          "Что работает / что сломано",
          "Почему клиенты тебя не выбирают",
          "Несовпадение с аудиторией",
          "Разбор позиционирования",
          "Аудит видимости в ИИ",
          "Разбор визуальной идентичности",
          "Аудит первого экрана",
          "Приоритетный список исправлений",
          "Сценарии коммерческого эффекта",
          "Сравнение с конкурентами",
          "План внедрения",
          "Экспорт в PDF",
        ],
        notes: [
          "Базовый охват: одна главная страница / одна главная поверхность бренда.",
          "Достаточно доступно, чтобы купить быстро, и достаточно остро, чтобы по этому действовать.",
        ],
      },
      offers: {
        label: "Структура предложения",
        title: "Простая лестница: бесплатный сигнал, платный отчёт, опционально более глубокая работа.",
        body:
          "Отчёт за $197 превращает этот сигнал в полноценный коммерческий диагноз: что работает, где утекает доверие, что исправить первым и что меняется, когда бренд становится проще понять, рекомендовать и выбрать.",
        layer: "Диагностический слой",
        rows: [
          {
            name: "Бесплатный первый разбор",
            layer: "Диагностический слой",
            price: "$0",
            summary:
              "Быстрый внешний взгляд на главную страницу: сигнал первого экрана, 5 оценок, самый сильный актив, главная точка трения и первая причина, по которой покупатель может сомневаться.",
            detail: "Лучше всего, чтобы понять, насколько конкретным будет диагноз, до оплаты.",
          },
          {
            name: "Отчёт BrandMirror",
            layer: "Диагностический слой",
            price: "$197",
            summary:
              "Платный диагноз: панель оценок, доказательства с сайта, 5 глубоких коммерческих разборов, AI visibility, конкурентная разведка, коммерческий эффект, стек приоритетных правок, бренд-бриф на одну страницу и плейбук внедрения.",
            detail: "Лучше всего для владельцев сайтов, команд, основателей, студий, консультантов и сервисных брендов, которым нужно понять, что исправлять, почему это важно и что делать дальше.",
          },
          {
            name: "Сопровождение SAHAR",
            layer: "Слой внедрения",
            price: "По объёму",
            summary:
              "Если нужна помощь с внедрением правок, SAHAR может усилить позиционирование, visibility-сигналы, ясность оффера, сообщение, proof, CTA-путь, структуру сайта и более широкую бренд-стратегию.",
            detail: "Лучше всего, когда нужно превратить диагноз в видимые изменения, а не просто получить отчёт.",
            actionLabel: "Обсудить внедрение",
            actionHref: "mailto:hello@saharstudio.com?subject=BrandMirror%20implementation",
          },
        ],
        primaryCta: "Начать бесплатный первый разбор",
        secondaryCta: "Посмотреть структуру полного отчёта",
      },
      faq: {
        label: "",
        title: "FAQ",
        body: "",
        items: [
          {
            question: "Что такое BrandMirror?",
            answer:
              "BrandMirror — это AI-аудит сайта для любого homepage, которому нужно объяснить ценность и конвертировать. Он читает позиционирование, видимость в ИИ, ясность оффера, визуальное доверие и готовность к конверсии.",
          },
          {
            question: "Что я получаю в бесплатном первом разборе?",
            answer:
              "Бесплатный первый разбор даёт быстрый диагностический сигнал: панель оценок, самый сильный актив, главную точку трения, первый диагноз и понятный тизер следующего шага до оплаты.",
          },
          {
            question: "Что входит в полный отчёт за $197?",
            answer:
              "Платный отчёт включает полный первый разбор, панель оценок, доказательства с сайта, пять глубоких коммерческих разборов, AI visibility, конкурентную разведку, коммерческий эффект, стек приоритетных правок, бренд-бриф на одну страницу, плейбук внедрения и PDF-экспорт.",
          },
          {
            question: "Кому BrandMirror подходит лучше всего?",
            answer:
              "BrandMirror лучше всего подходит сайтам, у которых уже есть ценное предложение, но которым нужны более ясное позиционирование, оффер, proof и конверсионное направление.",
          },
          {
            question: "Можно ли передать рекомендации разработчику?",
            answer:
              "Да. Полный отчёт включает конкретные задачи для внедрения: приоритеты сообщения, структуру сайта, задачи по видимости в ИИ, проверку metadata/schema и приоритетные правки.",
          },
        ],
      },
      final: {
        label: "Финальный акцент",
        title:
          "Начни бесплатно. А потом плати только если хочешь жёсткий ответ на то, что работает, что сломано и почему покупатель сомневается.",
        body:
          "Это делает бесплатный слой убедительным, платный слой острым, а весь продукт — настоящей диагностикой, а не мягкой проверкой бренда.",
        primaryCta: "Прочитать мой бренд",
        secondaryCta: "Смотреть пример отчёта",
      },
      legalLine:
        "Powered by SAHAR. BrandMirror is a proprietary diagnostic system by SAHAR Studio. © 2026 SAHAR Studio. Все права защищены.",
      footerAbout:
        "BrandMirror создан SAHAR Studio — студией creative intelligence для бренд-стратегии, сайтов, кампаний и видимости в ИИ.",
      footerPrivacy: "Политика конфиденциальности",
      footerTerms: "Условия и возвраты",
    },
    firstRead: {
      back: "Назад в BrandMirror",
      title: "Бесплатный первый разбор",
      mechanicLabel: "Живой разбор",
      mechanicBody:
        "Введите любой сайт бренда. BrandMirror читает главную страницу как холодный покупатель: без контекста, поблажек и допущений.",
      startLabel: "Начни здесь",
      startTitle: "Введи сайт и позволь BrandMirror прочитать первый сигнал.",
      startBody:
        "Бесплатный слой показывает, что работает, что ломает доверие и где сообщение начинает терять покупателя. Полный отчёт открывается только после оплаты.",
      websiteUrl: "URL сайта",
      urlPlaceholder: "vashbrand.com",
      emailLabel: "Эл. почта для отчёта",
      emailPlaceholder: "you@example.com",
      emailRequired: "Введите корректный email, чтобы получить отчёт.",
      dataConsentLabel:
        "Я согласен/согласна, что SAHAR/BrandMirror может обработать мой email и URL сайта, чтобы сгенерировать и отправить отчёт.",
      dataConsentRequired:
        "Подтвердите согласие на обработку данных, чтобы мы могли сгенерировать и отправить отчёт.",
      marketingConsentLabel:
        "Я хочу получать от SAHAR/BrandMirror новости, предложения и полезные статьи о брендинге и ИИ. Я смогу отписаться в любой момент.",
      promoLabel: "Промокод",
      promoPlaceholder: "НЕОБЯЗАТЕЛЬНО",
      promoApply: "Применить",
      promoAppliedButton: "Применён",
      promoChecking: "Проверяю",
      promoEmpty: "Сначала введите промокод.",
      promoInvalid: "Промокод недействителен.",
      promoApplied: "{code} применён. Скидка {percent}% добавлена.",
      promoSubtotal: "Отчёт BrandMirror",
      promoDiscount: "Скидка по промокоду",
      promoDueToday: "К оплате сегодня",
      promoFreeCta: "Открыть полный отчёт — $0",
      promoPayCta: "Оплатить сегодня",
      checkoutCta: "Открыть — $197",
      checkoutBusy: "Открываю оплату...",
      checkoutError: "Не удалось открыть оплату прямо сейчас.",
      submitIdle: "Прочитать мой бренд",
      submitBusy: "Читаю бренд...",
      statusInitial: "Введите сайт, чтобы сгенерировать первый разбор.",
      statusReading: "Читаю сайт и вытягиваю самые сильные сигналы.",
      statusDone: "Первый разбор готов. Отчёт за $197 уже можно открыть.",
      pdfEmailSending: "Отправляю PDF на email...",
      pdfEmailSent: "PDF отправлен на ваш email.",
      pdfEmailSkipped: "Отправка PDF на email пока не настроена; используйте кнопку скачивания ниже.",
      pdfEmailFailed: "Отчёт готов, но письмо не удалось отправить.",
      emptyUrl: "Введите адрес сайта, чтобы сгенерировать первый разбор.",
      diagnosticPreview: "Превью диагностики",
      generatedLabel: "Сгенерированный первый разбор",
      resultTitle: "Первое чтение",
      freeBadge: "Бесплатно",
      whatItDoes: "Чем, похоже, занимается компания",
      firstDiagnosis: "Первый диагноз",
      currentState: "Текущее состояние",
      strongestSignal: "Самый сильный сигнал",
      mainFriction: "Главная точка трения",
      nextMove: "Следующий шаг",
      freePdfIdle: "Скачать бесплатный PDF",
      freePdfBusy: "Собираю бесплатный PDF...",
      unlockLabel: "Открыть полный отчёт",
      unlockBody:
        "Откройте полный диагноз BrandMirror: разбор сигналов, поверхность сайта, 5 глубоких разборов, анализ конкурентов, оценку коммерческого эффекта, одностраничный бренд-бриф и план внедрения.",
      included: "Включено",
      unlockItems: [
        "Разбор сигналов и поверхность сайта",
        "5 глубоких коммерческих разборов",
        "Аудит видимости в ИИ",
        "Приоритетный список исправлений",
        "Одностраничный бренд-бриф",
        "Оценка коммерческого эффекта",
        "Сравнение с конкурентами",
        "Плейбук внедрения",
        "Экспорт PDF",
      ],
      unlockNotes: [
        "Охват: один сайт / одна главная поверхность бренда.",
        "Формат: приватный веб-отчёт со скачиваемым PDF.",
        "Сделано как стратегический рабочий документ, а не как обычная стена допродажи.",
      ],
      unlockCta: "Открыть полный отчёт BrandMirror — $197",
      unlockSecondary: "Посмотреть структуру полного отчёта",
      statusReady: "Готово к сканированию →",
      invalidUrl: "Это не похоже на адрес сайта",
      unreachableUrl: "Не удалось открыть эту страницу. Попробуйте адрес главной страницы.",
      startHelper: "Вставьте адрес главной страницы. Сканирование занимает 60 секунд.",
      freePdfLabel: "Экспорт бесплатного отчёта",
      freePdfBody: "Сохраните бесплатный первый разбор как PDF-снимок, которым удобно делиться.",
      brandReadLabel: "Разбор бренда",
      brandReadTitle: "Симптом виден. Коммерческую цену нужно назвать.",
      brandReadBody:
        "Бесплатный разбор показывает сигнал. Полный отчёт называет, во что он вам обходится, и что исправить первым.",
      currentStateLabel: "Текущее состояние",
      scanLegendLabel: "Как читать сканирование",
      scanLegendTitle: "Пять уровней индикаторов. Пять измерений сигнала.",
      scanLegendBody:
        "Каждое измерение оценивается от 0 до 100 и попадает в один из пяти уровней. Цвет показывает, насколько этот сигнал живой прямо сейчас.",
      fixNowLabel: "Исправить сейчас",
      fixNextLabel: "Исправить следом",
      keepLabel: "Оставить",
      fixStackLabel: "Список исправлений",
      fullReportTag: "$197 ПОЛНЫЙ ОТЧЁТ",
      unlockExactFix: "Откройте точный список исправлений за этим сканированием.",
      fixStackBody:
        "Что исправить первым, что может подождать и что уже зарабатывает доверие — с приоритетом по коммерческому эффекту.",
      includedInFullReport: "Включено в полный отчёт",
      fixStackIncluded:
        "Исправить сейчас, исправить следом и оставить — с приоритетом по коммерческому эффекту.",
      poweredBy: "Создано SAHAR",
      bandLabels: {
        flatlining: "Без сигнала",
        fragile: "Хрупко",
        developing: "Развивается",
        stable: "Стабильно",
        leading: "Лидирует",
      },
      bandBlurbs: {
        flatlining: "Сигнал пока не держит доверие и не ведёт к действию.",
        fragile: "Полезная основа есть, но она слишком быстро ломается.",
        developing: "Основа есть, но ей нужны ясность и доказательства.",
        stable: "Сигнал читается и может продавать сильнее.",
        leading: "Сигнал уже делает реальную коммерческую работу.",
      },
      scanner: {
        enterUrl: "ВВЕДИТЕ URL",
        liveScan: "ЖИВОЕ СКАНИРОВАНИЕ",
        scanning: "СКАНИРУЮ",
        awaitingSignal: "ЖДУ СИГНАЛ",
        readingSignal: "читаю сигнал",
        readyToScan: "готово к сканированию",
        firstSignal: "первый сигнал",
        scanningStatus: "СКАНИРУЮ...",
        ready: "ГОТОВО",
        scoreBreakdown: "РАЗБОР ОЦЕНОК",
        indicatorScale: "ШКАЛА ИНДИКАТОРОВ",
        terminal: [
          "Сканирую текст главной страницы...",
          "Читаю структуру сигнала для ИИ...",
          "Строю путь к конверсии...",
          "Анализирую визуальную иерархию...",
        ],
      },
      dimensionLabels: {
        positioningClarity: "Позиционирование",
        toneCoherence: "Видимость в ИИ",
        visualCredibility: "Визуал",
        offerSpecificity: "Предложение",
        conversionReadiness: "Конверсия",
      },
    },
    fullReport: {
      back: "Назад в BrandMirror",
      title: "Полный отчёт",
      fallbackLabel: "Полный отчёт",
      fallbackTitle: "Загружается поверхность отчёта BrandMirror.",
      mechanicLabel: "Платный диагноз",
      mechanicBody:
        "Полный отчёт превращает первый разбор в более глубокий коммерческий диагноз: с доказательствами, приоритетами и PDF для скачивания.",
      unlockLabel: "Сборка отчёта",
      unlockTitle: "Сгенерируй полный отчёт BrandMirror.",
      unlockBody:
        "Используй тот же сайт из первого разбора и экспортируй полный диагноз, когда отчёт будет готов.",
      websiteUrl: "URL сайта",
      urlPlaceholder: "vashbrand.com",
      submitIdle: "Сгенерировать полный отчёт",
      submitBusy: "Собираю отчёт...",
      statusInitial: "Введите сайт, чтобы сгенерировать полный отчёт.",
      statusBusy: "Собираю полный отчёт BrandMirror.",
      statusDone: "Полный отчёт BrandMirror готов.",
      emptyUrl: "Введите URL сайта, чтобы сгенерировать полный отчёт.",
      shareable: "Диагностика, которой удобно делиться",
      reportEyebrow: "Полный отчёт BrandMirror",
      reportHeadline: "Что работает. Что сломано.",
      reportSubheadline:
        "Платный слой объясняет, где держится доверие, где проваливается сообщение и что исправить первым.",
      paymentVerifyError:
        "Мы не смогли подтвердить оплату этого отчёта.",
      downloadIdle: "Скачать PDF",
      downloadBusy: "Экспортирую PDF...",
      sampleCta: "Смотреть пример отчёта",
      footerNote:
        "Оформлено как вертикальный диагностический артефакт, чтобы результат ощущался более пригодным для пересылки и более продуктовым, чем обычная обложка отчёта.",
    },
    sample: {
      back: "Назад в BrandMirror",
      title: "Пример отчёта",
      mockClientLabel: "Тестовый клиент",
      mockClientBody:
        "Nera Studio — премиальная креативная практика с сильной визуальной системой и более мягким, чем нужно, коммерческим сигналом.",
      summaryLabel: "Краткое резюме",
      summaryTitle:
        "Бренд выглядит точным, надёжным и премиальным. Но звучит менее ясно, чем нужно.",
      summaryBody:
        "BrandMirror читает разрыв между тем, что обещает дизайн-система, и тем, что подтверждает сообщение. Здесь идентичность сильно сигналит качество. Позиционированию всё ещё нужна более жёсткая коммерческая грань.",
      structureLabel: "Структура отчёта",
      structureTitle: "Стратегический разбор, оформленный как продуктовый результат.",
      structureBody:
        "Опыт должен ощущаться спокойным, точным и достаточно полезным, чтобы по нему сразу действовать. Каждая секция изолирует один слой бренд-впечатления и переводит его в практический следующий ход.",
      recommendedMove: "Рекомендуемый ход",
      frictionLabel: "Карта трения",
      actionsLabel: "Приоритетные действия",
      closingLabel: "Как это продаёт продукт",
      closingTitle:
        "Сам результат должен доказывать, почему бренд выигрывает доверие, где он его теряет и почему покупатель всё ещё колеблется.",
      closingBody:
        "Это превью должно делать продукт правдоподобным: основатель должен увидеть диагноз, быстро по нему среагировать и понять, почему платный слой стоит покупки.",
      primaryCta: "Прочитать мой бренд",
      secondaryCta: "Вернуться на лендинг",
      scoreRows: [
        { label: "Ясность позиционирования", score: "72", note: "Сильная основа, мягкая грань." },
        { label: "Цельность тона", score: "81", note: "Элегантно и собранно." },
        { label: "Визуальная достоверность", score: "89", note: "Очень доверительно с первого взгляда." },
        { label: "Точность оффера", score: "58", note: "Слишком поздно." },
      ],
      sections: [
        {
          label: "Разбор позиционирования",
          title: "Бренд ощущается премиальным раньше, чем точным.",
          body:
            "Nera Studio сигналит вкус, собранность и стратегическую зрелость. Сайт создаёт сильное первое впечатление, но формулировка предложения приходит с лишней атмосферой и недостаточно жёсткой гранью. Покупатель понимает уровень качества раньше, чем понимает точную трансформацию.",
          recommendation:
            "Перемести ценностное предложение выше и заостри язык вокруг бизнес-результатов, не теряя тон спокойной роскоши.",
        },
        {
          label: "Разбор тона",
          title: "Голос умный, но немного сдержанный.",
          body:
            "Текст звучит возвышенно и осознанно. Это поддерживает премиальное считывание, но некоторые секции так сильно уходят в утончённость, что срочность исчезает. Бренд яснее говорит “мы разборчивые”, чем “мы решаем эту проблему сейчас”.",
          recommendation:
            "Сохрани сдержанность, но добавь в каждой секции по одной более рабочей фразе, которая переводит вкус в коммерческое последствие.",
        },
        {
          label: "Разбор визуальной идентичности",
          title: "Визуальная система делает исключительную trust-работу.",
          body:
            "Типографика, палитра, свободное пространство и сдержанность изображений поддерживают спокойное премиальное считывание. Сайт выглядит дорого в правильном смысле. Риск в том, что визуальная идентичность стала самым ясным сообщением на странице, а значит дизайн несёт больше продажной нагрузки, чем архитектура предложения.",
          recommendation:
            "Сохрани визуальную строгость и используй её, чтобы обрамить более сильные доказательства, более ясные обещания и более направленные призывы к действию.",
        },
      ],
      frictionMap: [
        "Язык предложения недостаточно быстро показывает состояние до и после.",
        "Эмоциональная атмосфера приходит раньше коммерческой определённости.",
        "Сигналы доказательства элегантны, но чуть зарыты ниже первого экрана.",
        "Язык призыва к действию спокойный, хотя в точке намерения мог бы работать жёстче.",
      ],
      nextMoves: [
        "Перепиши главное обещание так, чтобы результат был ясен уже на первом экране.",
        "Сопроводи каждую атмосферную секцию одной коммерчески явной фразой.",
        "Подними доказательства раньше: названные результаты, клиентский контекст или маркеры доверия.",
        "Сохрани текущую визуальную сдержанность и дай тексту сделать больше работы на конверсию.",
      ],
    },
  },
} as const satisfies Record<SiteLocale, unknown>;

const siteI18n = {
  SUPPORTED_SITE_LOCALES,
  SITE_LOCALE_LABELS,
  getSiteLocale,
  withLang,
  siteCopy,
};

export default siteI18n;
