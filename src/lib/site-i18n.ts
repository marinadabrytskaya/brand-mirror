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
      kicker: "BrandMirror finds it in 60 seconds. Free.",
      title: "Your brand has a leak.",
      body:
        "Buyers land on your homepage, sense something is off, and leave. They can't name it. BrandMirror can.",
      primaryCta: "\u25B6 Read My Brand",
      secondaryCta: "See sample report \u2192",
      heroProofs: [
        "Free first signal before asking for payment.",
        "Paid report only when the diagnosis already feels specific.",
        "Built to explain why the brand is not converting.",
      ],
      signalHeadingLabel: "What it reads",
      signalHeadingTitle:
        "Buyers don't read your brand. They feel it.",
      signalHeadingBody:
        "BrandMirror reads what they feel — before they decide to leave.",
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
          "The $197 report names the leak, the fix, and the commercial cost of doing nothing. One or the other. You pick.",
        layer: "Standalone product layer",
        rows: [
          {
            name: "Free First Read",
            price: "$0",
            summary:
              "A fast outside read of the homepage: scanner readout, 5 scores, first diagnosis, strongest signal, main friction, and locked next-step teasers.",
            detail: "Best as the try-before-you-buy layer.",
          },
          {
            name: "BrandMirror Report",
            price: "$197",
            summary:
              "The full paid report: first read, score dashboard, signal read, website surface, 5 deep dives, archetype + poster, fix stack, and 30-day plan.",
            detail: "Best for founders and premium service brands that need clear next actions.",
          },
          {
            name: "Sahar Follow-Through",
            price: "Optional",
            summary:
              "If the report surfaces deeper issues, Sahar can help apply the diagnosis through messaging, website, or brand strategy work.",
            detail: "Secondary upsell after value is delivered.",
          },
        ],
        primaryCta: "\u25B6 UNLOCK FULL REPORT — $197",
        secondaryCta: "See sample report \u2192",
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
    },
    firstRead: {
      back: "Back to BrandMirror",
      title: "First signal. Free.",
      mechanicLabel: "Live engine",
      mechanicBody:
        "Active. Enter any brand URL to begin. BrandMirror reads your homepage as a cold buyer — no context, no charity, no assumptions.",
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
      checkoutCta: "Unlock — $197",
      checkoutBusy: "Opening checkout...",
      checkoutError: "Unable to open checkout right now.",
      submitIdle: "\u25B6 READ THE SIGNAL",
      submitBusy: "Reading brand...",
      statusInitial: "Enter a URL to begin",
      statusReading: "Scanning homepage copy, AI visibility, visual hierarchy, offer clarity, and conversion path.",
      statusDone: "First read generated. The $197 report is ready to unlock.",
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
      testFullPdfIdle: "Test full report PDF",
      testFullPdfBusy: "Building full PDF...",
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
      mechanicLabel: "Paid layer mechanic",
      mechanicBody:
        "This route is the transferred second layer: the fuller report that sits behind the first read and supports PDF export.",
      unlockLabel: "Unlock logic",
      unlockTitle: "Generate the full BrandMirror report for the paid layer.",
      unlockBody:
        "Right now this is the transferred mechanic. Next we can attach it to checkout so this route becomes the post-payment result surface.",
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
      kicker: "Primera lectura gratis para marcas que deberían convertir mejor",
      title: "Deja que BrandMirror lea la primera señal.",
      body:
        "Introduce un sitio web. Recibe la primera lectura diagnóstica: score, señal, fricción y la razón más clara por la que el comprador duda.",
      primaryCta: "Lee mi marca",
      secondaryCta: "Ver reporte de muestra",
      heroProofs: [
        "Señal gratuita antes de pedir pago.",
        "Reporte de pago solo cuando el diagnóstico ya se siente específico.",
        "Diseñado para explicar por qué la marca no está convirtiendo.",
      ],
      signalHeadingLabel: "Qué lee",
      signalHeadingTitle:
        "Un diagnóstico de marca que trata gusto, tono y claridad como un solo sistema.",
      signalHeadingBody:
        "BrandMirror está hecho para mostrar lo que los compradores perciben antes de poder explicarlo. El resultado debe sentirse como un diagnóstico comercial, no como una lista de comentarios.",
      signalColumns: [
        {
          label: "Posicionamiento",
          title: "Cómo suena tu oferta en el mercado",
          body:
            "BrandMirror lee qué tan clara aterriza tu oferta, dónde tu promesa se vuelve vaga y si tu posicionamiento se siente premium, específico o demasiado pulido para convertir.",
        },
        {
          label: "Tono",
          title: "Cómo se comporta la voz de tu marca bajo presión",
          body:
            "Revisa si tu lenguaje se siente agudo, calmado, indulgente, distante, genérico o demasiado cuidadoso. El tono se trata como una señal comercial, no como un ejercicio de copy.",
        },
        {
          label: "Identidad visual",
          title: "Qué implican tus visuales antes de que alguien lea",
          body:
            "Layout, tipografía, paleta, contención, jerarquía y señales de confianza se revisan juntos para reflejar la impresión completa de la marca, no notas sueltas de diseño.",
        },
      ],
      evidence: {
        eyebrow: "Primera lectura gratis",
        headline: "Mira dónde la confianza se sostiene y dónde se rompe.",
        subheadline:
          "Un tablero de diagnóstico premium que muestra la promesa de apertura, la zona de decisión y los puntos donde el comprador deja de avanzar.",
        cta: "Lee mi marca",
        markers: [
          {
            id: "promise",
            label: "Promesa",
            title: "La oferta aterriza demasiado tarde",
            note: "La página se siente premium rápido, pero el punto comercial llega tarde.",
            x: 10,
            y: 16,
          },
          {
            id: "proof",
            label: "Prueba",
            title: "La confianza está demasiado implícita",
            note: "El comprador todavía tiene que inferir demasiado antes de que el CTA pida acción.",
            x: 87,
            y: 56,
          },
          {
            id: "fix",
            label: "Arreglar primero",
            title: "Afina la primera pantalla",
            note: "Declara la oferta antes. Mantén la sensación premium. Corta la demora.",
            x: 18,
            y: 80,
          },
        ],
        verdicts: [
          "Funciona: señal premium",
          "Roto: claridad de la oferta",
          "Arreglar primero: promesa antes de atmósfera",
        ],
      },
      previewRows: [
        {
          title: "Claridad",
          score: "72",
          copy: "La marca se siente premium rápido, pero la oferta se vuelve precisa demasiado tarde.",
        },
        {
          title: "Percepción premium",
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
          { step: "01", title: "Ingresa tu web", body: "BrandMirror toma una primera lectura de la home y muestra la impresión inmediata gratis." },
          { step: "02", title: "Revisa la primera señal", body: "Ves el snapshot, tres scores, una fortaleza, un punto de fricción y el siguiente movimiento que vale la pena arreglar." },
          { step: "03", title: "Desbloquea el reporte completo", body: "Paga $197 para abrir el diagnóstico completo con posicionamiento, visibilidad en IA, identidad visual, escenarios de impacto comercial, comparación con competidores y el implementation playbook." },
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
          "Auditoría above the fold",
          "Priority fix stack",
          "Escenarios de impacto comercial",
          "Comparación con competidores",
          "Implementation playbook",
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
          "Esto mantiene a BrandMirror vendible como producto standalone y le da al comprador una razón clara para pagar: claridad más fuerte sobre por qué la marca convierte o no.",
        layer: "Capa de producto standalone",
        rows: [
          {
            name: "Primera lectura gratis",
            price: "$0",
            summary:
              "Una lectura externa rápida de la home: scanner readout, 5 scores, primer diagnóstico, señal más fuerte, fricción principal y teasers bloqueados del siguiente paso.",
            detail: "Ideal como capa de prueba antes de comprar.",
          },
          {
            name: "Reporte BrandMirror",
            price: "$197",
            summary:
              "El reporte pagado completo: first read, score dashboard, signal read, website surface, 5 deep dives, archetype + poster, fix stack y plan de 30 días.",
            detail: "Ideal para founders y marcas de servicio premium que necesitan próximos pasos claros.",
          },
          {
            name: "Continuación con Sahar",
            price: "Opcional",
            summary:
              "Si el reporte muestra problemas más profundos, Sahar puede aplicar el diagnóstico en messaging, web o estrategia de marca.",
            detail: "Upsell secundario después de entregar valor.",
          },
        ],
        primaryCta: "Empezar primera lectura gratis",
        secondaryCta: "Revisar estructura del reporte completo",
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
    },
    firstRead: {
      back: "Volver a BrandMirror",
      title: "Primera lectura gratis",
      mechanicLabel: "Mecánica en vivo",
      mechanicBody:
        "Esta página ahora usa la lógica transferida de Brand Review para leer un sitio real y producir la capa gratuita de BrandMirror.",
      startLabel: "Empieza aquí",
      startTitle: "Ingresa un sitio web y deja que BrandMirror lea la primera señal.",
      startBody:
        "La capa gratuita muestra qué está funcionando, qué está rompiendo la confianza y dónde el mensaje empieza a perder al comprador. El reporte completo se abre solo después del pago.",
      websiteUrl: "URL del sitio web",
      urlPlaceholder: "tu-marca.com",
      emailLabel: "Email para recibir el reporte",
      emailPlaceholder: "tu@email.com",
      emailRequired: "Introduce un email válido para recibir el reporte.",
      checkoutCta: "Desbloquear — $197",
      checkoutBusy: "Abriendo checkout...",
      checkoutError: "No pudimos abrir el checkout ahora.",
      submitIdle: "Lee mi marca",
      submitBusy: "Leyendo marca...",
      statusInitial: "Ingresa un sitio web para generar la primera lectura.",
      statusReading: "Leyendo el sitio y capturando las señales más fuertes.",
      statusDone: "Primera lectura generada. El reporte de $197 está listo para desbloquearse.",
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
      testFullPdfIdle: "Probar PDF completo",
      testFullPdfBusy: "Generando PDF completo...",
      unlockLabel: "Desbloquear reporte completo",
      unlockBody:
        "Desbloquea el diagnóstico completo de BrandMirror con signal read, website surface, 5 deep dives, escenarios de impacto comercial y herramientas de implementación que convierten esta lectura en acción.",
      included: "Incluido",
      unlockItems: [
        "Signal read + website surface",
        "5 deep dives comerciales",
        "Auditoría de visibilidad en IA",
        "Archetype + poster",
        "Priority fix stack",
        "Mapa de implementación a 30 días",
        "Escenarios de impacto comercial",
        "Comparación con competidores",
        "Playbook de implementación",
        "Exportación PDF",
      ],
      unlockNotes: [
        "Alcance: un sitio web / una superficie principal de marca.",
        "Formato: reporte web privado con PDF descargable.",
        "Construido como un documento de trabajo estratégico, no como un simple muro de upsell.",
      ],
      unlockCta: "Desbloquear el reporte completo de BrandMirror — $197",
      unlockSecondary: "Ver estructura del reporte completo",
    },
    fullReport: {
      back: "Volver a BrandMirror",
      title: "Reporte completo",
      fallbackLabel: "Reporte completo",
      fallbackTitle: "Cargando la superficie del reporte BrandMirror.",
      mechanicLabel: "Mecánica de la capa pagada",
      mechanicBody:
        "Esta ruta es la segunda capa transferida: el reporte más completo que se sitúa detrás de la primera lectura y soporta exportación PDF.",
      unlockLabel: "Lógica de desbloqueo",
      unlockTitle: "Genera el reporte completo de BrandMirror para la capa pagada.",
      unlockBody:
        "Ahora mismo esta es la mecánica transferida. Lo siguiente es conectarla al checkout para que esta ruta se convierta en la superficie posterior al pago.",
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
        "Nera Studio, una práctica creativa premium con un sistema visual fuerte y una señal comercial más suave de lo ideal.",
      summaryLabel: "Resumen ejecutivo",
      summaryTitle:
        "La marca se ve precisa, confiable y premium. Suena menos explícita de lo que necesita.",
      summaryBody:
        "BrandMirror lee la brecha entre lo que implica el sistema de diseño y lo que confirma el mensaje. Aquí, la identidad señala claramente calidad. El posicionamiento todavía necesita un borde comercial más firme.",
      structureLabel: "Estructura del reporte",
      structureTitle: "La lectura de un estratega, formateada como output de producto.",
      structureBody:
        "La experiencia debe sentirse calma, exacta y lo bastante útil como para actuar de inmediato. Cada sección aísla una capa de la impresión de marca y luego la resuelve en un próximo movimiento práctico.",
      recommendedMove: "Movimiento recomendado",
      frictionLabel: "Mapa de fricción",
      actionsLabel: "Acciones prioritarias",
      closingLabel: "Cómo esto vende el producto",
      closingTitle:
        "El resultado en sí mismo debe probar por qué la marca está ganando confianza, dónde la está perdiendo y por qué los compradores todavía dudan.",
      closingBody:
        "Esta vista previa está pensada para hacer creíble el producto: un founder debería poder ver el diagnóstico, actuar rápido y entender por qué la capa pagada merece la compra.",
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
          title: "La marca se siente premium antes de sentirse precisa.",
          body:
            "Nera Studio señala gusto, compostura y madurez estratégica. El sitio crea una primera impresión fuerte, pero la formulación de la oferta llega con demasiada atmósfera y poco filo. El comprador entiende el nivel de calidad antes de entender la transformación exacta.",
          recommendation:
            "Mueve la propuesta de valor antes y afila el lenguaje alrededor de resultados de negocio sin perder el tono de lujo silencioso.",
        },
        {
          label: "Lectura de tono",
          title: "La voz es inteligente, pero ligeramente contenida.",
          body:
            "El copy suena elevado y autoconsciente. Eso sostiene la impresión premium, pero varias secciones empujan tanto la sofisticación que la urgencia desaparece. La marca dice 'somos exigentes' con más claridad de la que dice 'resolvemos este problema ahora'.",
          recommendation:
            "Mantén la contención, pero introduce una frase más trabajadora por sección que traduzca sensibilidad en consecuencia.",
        },
        {
          label: "Lectura de identidad visual",
          title: "El sistema visual está haciendo un trabajo excepcional de confianza.",
          body:
            "Tipografía, paleta, espacio en blanco y contención de imagen sostienen una lectura calma y high-end. El sitio se ve caro en el sentido correcto. El riesgo es que la identidad visual se haya convertido en el mensaje más claro de la página, lo que significa que la calidad del diseño está cargando más peso de venta que la arquitectura de la oferta.",
          recommendation:
            "Conserva la severidad visual y úsala para enmarcar pruebas más fuertes, promesas más claras y llamadas a la acción más dirigidas.",
        },
      ],
      frictionMap: [
        "El lenguaje de la oferta no define el antes y el después con suficiente rapidez.",
        "La atmósfera emocional llega antes que la certeza comercial.",
        "Las señales de prueba son elegantes, pero están algo enterradas bajo el pliegue.",
        "El lenguaje del CTA es calmado, aunque podría trabajar más en el momento de intención.",
      ],
      nextMoves: [
        "Reescribe la promesa del hero para que el resultado aterrice en la primera pantalla.",
        "Empareja cada sección guiada por mood con una frase comercialmente explícita.",
        "Introduce prueba antes: resultados nombrados, contexto de cliente o marcadores de credibilidad.",
        "Mantén la contención visual actual y deja que el copy haga más trabajo de conversión.",
      ],
    },
  },
  ru: {
    landing: {
      brandPowered: "Создано SAHAR",
      navHow: "Как это работает",
      navOffer: "Оффер",
      navSample: "Пример отчёта",
      kicker: "Бесплатный first read для брендов, которым нужно конвертировать лучше",
      title: "Дай BrandMirror прочитать первый сигнал.",
      body:
        "Вставь сайт и получи первый диагноз: score, сильный сигнал, friction и главную причину, почему покупатель сомневается.",
      primaryCta: "Прочитать мой бренд",
      secondaryCta: "Смотреть пример отчёта",
      heroProofs: [
        "Сначала бесплатный сигнал, потом уже оплата.",
        "Платный отчёт открывается только когда диагноз уже кажется точным.",
        "Продукт сделан, чтобы объяснить, почему бренд не конвертирует.",
      ],
      signalHeadingLabel: "Что он читает",
      signalHeadingTitle:
        "Диагностика бренда, которая рассматривает вкус, тон и ясность как одну систему.",
      signalHeadingBody:
        "BrandMirror создан, чтобы показать то, что покупатель чувствует раньше, чем может это сформулировать. Результат должен ощущаться как коммерческий диагноз, а не как набор комментариев.",
      signalColumns: [
        {
          label: "Позиционирование",
          title: "Как звучит твой оффер в рынке",
          body:
            "BrandMirror читает, насколько ясно приземляется твой оффер, где обещание становится размытым и ощущается ли позиционирование премиальным, точным или слишком polished, чтобы конвертировать.",
        },
        {
          label: "AI-видимость",
          title: "Насколько AI-инструменты видят и понимают твой бренд",
          body:
            "Проверяет, могут ли ChatGPT, Gemini и Perplexity найти, правильно описать и порекомендовать твой бренд. AI-видимость рассматривается как коммерческий канал, а не технический чеклист.",
        },
        {
          label: "Визуальная идентичность",
          title: "Что визуал сообщает ещё до того, как человек начал читать",
          body:
            "Лэйаут, типографика, палитра, сдержанность, иерархия и trust cues читаются вместе, чтобы итоговый разбор отражал полное впечатление от бренда, а не отдельные дизайн-заметки.",
        },
      ],
      evidence: {
        eyebrow: "Бесплатный first read",
        headline: "Увидь, где доверие держится, а где ломается.",
        subheadline:
          "Премиальный диагностический board, который показывает стартовое обещание, decision zone и точки, где покупатель перестаёт двигаться дальше.",
        cta: "Прочитать мой бренд",
        markers: [
          {
            id: "promise",
            label: "Обещание",
            title: "Оффер раскрывается слишком медленно",
            note: "Страница быстро выглядит premium, но коммерческий смысл приходит поздно.",
            x: 10,
            y: 16,
          },
          {
            id: "proof",
            label: "Доказательство",
            title: "Доверие слишком подразумевается",
            note: "Покупателю всё ещё приходится слишком многое додумывать до того, как CTA просит действия.",
            x: 87,
            y: 56,
          },
          {
            id: "fix",
            label: "Исправить первым",
            title: "Заостри первый экран",
            note: "Скажи оффер раньше. Сохрани premium feel. Убери задержку.",
            x: 18,
            y: 80,
          },
        ],
        verdicts: [
          "Работает: premium signal",
          "Сломано: offer clarity",
          "Исправить первым: promise before atmosphere",
        ],
      },
      previewRows: [
        {
          title: "Ясность",
          score: "72",
          copy: "Бренд быстро ощущается премиальным, но оффер становится точным слишком поздно.",
        },
        {
          title: "Премиальное восприятие",
          score: "88",
          copy: "Типографика, ритм и сдержанность создают сильное ощущение качества и контроля.",
        },
        {
          title: "Цельность",
          score: "64",
          copy: "Визуальная система и messaging близки, но пока не усиливают одно и то же обещание.",
        },
      ],
      how: {
        label: "Как это работает",
        title: "Сначала бесплатный сигнал. Полный диагноз — только когда он уже ощущается полезным.",
        body:
          "Продуктовый flow должен делать BrandMirror лёгким для пробы, не отдавая весь отчёт сразу. First read зарабатывает право продавать платный слой.",
        notes: [
          "Бесплатный слой доказывает, что BrandMirror быстро видит разрыв.",
          "Платный слой говорит покупателю, что работает, что сломано, почему бренд теряет доверие и что исправить первым.",
        ],
        workflow: [
          { step: "01", title: "Введи свой сайт", body: "BrandMirror берёт first read с главной страницы и бесплатно показывает первое впечатление." },
          { step: "02", title: "Посмотри первый сигнал", body: "Ты видишь snapshot, три score, одну сильную сторону, одну friction point и следующий ход, который стоит исправить первым." },
          { step: "03", title: "Открой полный отчёт", body: "Заплати $197 и открой полный диагноз бренда: позиционирование, AI visibility, визуальная идентичность, сценарии коммерческого эффекта, сравнение с конкурентами и implementation playbook." },
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
          "Audience mismatch",
          "Разбор позиционирования",
          "Аудит AI visibility",
          "Разбор визуальной идентичности",
          "Аудит первого экрана",
          "Priority fix stack",
          "Сценарии коммерческого эффекта",
          "Сравнение с конкурентами",
          "Implementation playbook",
          "Экспорт в PDF",
        ],
        notes: [
          "Базовый scope: одна homepage / одна главная поверхность бренда.",
          "Достаточно доступно, чтобы купить быстро, и достаточно sharp, чтобы по этому действовать.",
        ],
      },
      offers: {
        label: "Структура оффера",
        title: "Простая лестница: бесплатный сигнал, платный отчёт, опционально более глубокая работа.",
        body:
          "Так BrandMirror остаётся самостоятельным продуктом и одновременно даёт покупателю ясную причину платить: более точное понимание, почему бренд конвертирует или нет.",
        layer: "Слой standalone-продукта",
        rows: [
          {
            name: "Бесплатный First Read",
            price: "$0",
            summary:
              "Быстрый внешний взгляд на homepage: scanner readout, 5 score, first diagnosis, strongest signal, main friction и locked teasers следующего шага.",
            detail: "Лучше всего как try-before-you-buy слой.",
          },
          {
            name: "BrandMirror Report",
            price: "$197",
            summary:
              "Полный платный отчёт: first read, score dashboard, signal read, website surface, 5 deep dives, archetype + poster, fix stack и 30-day plan.",
            detail: "Лучше всего для founders и premium service brands, которым нужны ясные следующие шаги.",
          },
          {
            name: "Sahar Follow-Through",
            price: "Опционально",
            summary:
              "Если отчёт показывает более глубокие проблемы, Sahar может помочь применить диагноз через messaging, website или brand strategy.",
            detail: "Вторичный upsell после того, как ценность уже доставлена.",
          },
        ],
        primaryCta: "Начать бесплатный first read",
        secondaryCta: "Посмотреть структуру полного отчёта",
      },
      final: {
        label: "Финальный акцент",
        title:
          "Начни бесплатно. А потом плати только если хочешь жёсткий ответ на то, что работает, что сломано и почему покупатель сомневается.",
        body:
          "Это делает бесплатный слой убедительным, платный слой sharp, а весь продукт — настоящей диагностикой, а не мягким brand review.",
        primaryCta: "Прочитать мой бренд",
        secondaryCta: "Смотреть пример отчёта",
      },
    },
    firstRead: {
      back: "Назад в BrandMirror",
      title: "Бесплатный first read",
      mechanicLabel: "Живая механика",
      mechanicBody:
        "Эта страница уже использует перенесённую логику Brand Review, чтобы читать реальный сайт и выдавать бесплатный слой BrandMirror.",
      startLabel: "Начни здесь",
      startTitle: "Введи сайт и позволь BrandMirror прочитать первый сигнал.",
      startBody:
        "Бесплатный слой показывает, что работает, что ломает доверие и где сообщение начинает терять покупателя. Полный отчёт открывается только после оплаты.",
      websiteUrl: "URL сайта",
      urlPlaceholder: "yourbrand.com",
      emailLabel: "Email для отчёта",
      emailPlaceholder: "you@example.com",
      emailRequired: "Введите корректный email, чтобы получить отчёт.",
      checkoutCta: "Открыть — $197",
      checkoutBusy: "Открываю оплату...",
      checkoutError: "Не удалось открыть оплату прямо сейчас.",
      submitIdle: "Прочитать мой бренд",
      submitBusy: "Читаю бренд...",
      statusInitial: "Введите сайт, чтобы сгенерировать first read.",
      statusReading: "Читаю сайт и вытягиваю самые сильные сигналы.",
      statusDone: "First read готов. Отчёт за $197 уже можно открыть.",
      emptyUrl: "Введите URL сайта, чтобы сгенерировать first read.",
      diagnosticPreview: "Превью диагностики",
      generatedLabel: "Сгенерированный first read",
      resultTitle: "Первое чтение",
      freeBadge: "Бесплатно",
      whatItDoes: "Чем, похоже, занимается компания",
      firstDiagnosis: "Первый диагноз",
      currentState: "Текущее состояние",
      strongestSignal: "Самый сильный сигнал",
      mainFriction: "Главная friction point",
      nextMove: "Следующий шаг",
      freePdfIdle: "Скачать free PDF",
      freePdfBusy: "Собираю free PDF...",
      testFullPdfIdle: "Тест full report PDF",
      testFullPdfBusy: "Собираю full PDF...",
      unlockLabel: "Открыть полный отчёт",
      unlockBody:
        "Откройте полный диагноз BrandMirror: signal read, website surface, 5 deep dives, competitor intelligence, commercial impact estimate, one-page brand brief и implementation playbook.",
      included: "Включено",
      unlockItems: [
        "Signal read + website surface",
        "5 коммерческих deep dives",
        "Аудит AI visibility",
        "Priority fix stack",
        "One-page brand brief",
        "Commercial impact estimate",
        "Сравнение с конкурентами",
        "Плейбук внедрения",
        "Экспорт PDF",
      ],
      unlockNotes: [
        "Scope: один сайт / одна главная поверхность бренда.",
        "Формат: приватный web-report с downloadable PDF.",
        "Сделано как стратегический рабочий документ, а не как generic upsell wall.",
      ],
      unlockCta: "Открыть полный отчёт BrandMirror — $197",
      unlockSecondary: "Посмотреть структуру полного отчёта",
    },
    fullReport: {
      back: "Назад в BrandMirror",
      title: "Полный отчёт",
      fallbackLabel: "Полный отчёт",
      fallbackTitle: "Загружается поверхность отчёта BrandMirror.",
      mechanicLabel: "Механика платного слоя",
      mechanicBody:
        "Этот маршрут — перенесённый второй слой: более полный отчёт, который стоит за first read и поддерживает экспорт в PDF.",
      unlockLabel: "Логика разблокировки",
      unlockTitle: "Сгенерируй полный отчёт BrandMirror для платного слоя.",
      unlockBody:
        "Пока это перенесённая механика. Следующим шагом можно привязать checkout, чтобы этот маршрут стал результатом после оплаты.",
      websiteUrl: "URL сайта",
      urlPlaceholder: "yourbrand.com",
      submitIdle: "Сгенерировать полный отчёт",
      submitBusy: "Собираю отчёт...",
      statusInitial: "Введите сайт, чтобы сгенерировать полный отчёт.",
      statusBusy: "Собираю полный отчёт BrandMirror.",
      statusDone: "Полный отчёт BrandMirror готов.",
      emptyUrl: "Введите URL сайта, чтобы сгенерировать полный отчёт.",
      shareable: "Шерибл-диагностика",
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
        "Оформлено как вертикальный диагностический артефакт, чтобы результат ощущался более shareable и более product-like, чем обычная обложка отчёта.",
    },
    sample: {
      back: "Назад в BrandMirror",
      title: "Пример отчёта",
      mockClientLabel: "Тестовый клиент",
      mockClientBody:
        "Nera Studio — премиальная креативная практика с сильной визуальной системой и более мягким, чем нужно, коммерческим сигналом.",
      summaryLabel: "Executive summary",
      summaryTitle:
        "Бренд выглядит точным, надёжным и premium. Но звучит менее ясно, чем нужно.",
      summaryBody:
        "BrandMirror читает разрыв между тем, что обещает дизайн-система, и тем, что подтверждает messaging. Здесь identity сильно сигналит качество. Позиционированию всё ещё нужен более жёсткий коммерческий edge.",
      structureLabel: "Структура отчёта",
      structureTitle: "Стратегический разбор, оформленный как продуктовый output.",
      structureBody:
        "Опыт должен ощущаться спокойным, точным и достаточно полезным, чтобы по нему сразу действовать. Каждая секция изолирует один слой бренд-впечатления и переводит его в практический следующий ход.",
      recommendedMove: "Рекомендуемый ход",
      frictionLabel: "Карта фрикции",
      actionsLabel: "Приоритетные действия",
      closingLabel: "Как это продаёт продукт",
      closingTitle:
        "Сам output должен доказывать, почему бренд выигрывает доверие, где он его теряет и почему покупатель всё ещё колеблется.",
      closingBody:
        "Это превью должно делать продукт правдоподобным: founder должен увидеть диагноз, быстро по нему среагировать и понять, почему платный слой стоит покупки.",
      primaryCta: "Прочитать мой бренд",
      secondaryCta: "Вернуться на лендинг",
      scoreRows: [
        { label: "Ясность позиционирования", score: "72", note: "Сильная premise, мягкий edge." },
        { label: "Цельность тона", score: "81", note: "Элегантно и собранно." },
        { label: "Визуальная достоверность", score: "89", note: "Очень доверительно с первого взгляда." },
        { label: "Точность оффера", score: "58", note: "Слишком поздно." },
      ],
      sections: [
        {
          label: "Разбор позиционирования",
          title: "Бренд ощущается premium раньше, чем точным.",
          body:
            "Nera Studio сигналит вкус, собранность и стратегическую зрелость. Сайт создаёт сильное первое впечатление, но формулировка оффера приходит с лишней атмосферой и недостаточным edge. Покупатель понимает уровень качества раньше, чем понимает точную трансформацию.",
          recommendation:
            "Перемести value proposition выше и заостри язык вокруг бизнес-результатов, не теряя quiet-luxury tone.",
        },
        {
          label: "Разбор тона",
          title: "Голос умный, но немного сдержанный.",
          body:
            "Текст звучит elevated и self-aware. Это поддерживает premium read, но некоторые секции так сильно уходят в refinement, что urgency исчезает. Бренд яснее говорит “мы разборчивые”, чем “мы решаем эту проблему сейчас”.",
          recommendation:
            "Сохрани сдержанность, но добавь в каждой секции по одной более hard-working фразе, которая переводит sensibility в consequence.",
        },
        {
          label: "Разбор визуальной идентичности",
          title: "Визуальная система делает исключительную trust-работу.",
          body:
            "Типографика, палитра, whitespace и image restraint поддерживают спокойный high-end read. Сайт выглядит дорого в правильном смысле. Риск в том, что visual identity стала самым ясным сообщением на странице, а значит дизайн несёт больше продажной нагрузки, чем offer architecture.",
          recommendation:
            "Сохрани визуальную строгость и используй её, чтобы обрамить более сильные proof-блоки, более ясные обещания и более направленные calls to action.",
        },
      ],
      frictionMap: [
        "Язык оффера недостаточно быстро показывает before-and-after.",
        "Эмоциональная атмосфера приходит раньше коммерческой определённости.",
        "Proof cues elegant, но чуть зарыты ниже фолда.",
        "Язык CTA спокойный, хотя в точке намерения мог бы работать жёстче.",
      ],
      nextMoves: [
        "Перепиши hero promise так, чтобы результат был ясен уже на первом экране.",
        "Сопроводи каждый mood-led section одной коммерчески явной фразой.",
        "Подними proof раньше: named outcomes, client context или credibility markers.",
        "Сохрани текущую visual restraint и дай copy сделать больше conversion-work.",
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
