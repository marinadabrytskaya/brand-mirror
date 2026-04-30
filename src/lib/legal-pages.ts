import type { SiteLocale } from "@/lib/site-i18n";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  contact: string;
  back: string;
  sections: LegalSection[];
};

export const legalPageCopy: Record<
  SiteLocale,
  { privacy: LegalPageCopy; terms: LegalPageCopy }
> = {
  en: {
    privacy: {
      eyebrow: "Privacy",
      title: "Privacy Policy",
      intro:
        "This policy explains what BrandMirror collects, why it collects it, and how to contact us about your data.",
      updated: "Last updated: 30 April 2026",
      contact: "For privacy questions, email hello@saharstudio.com.",
      back: "Back to BrandMirror",
      sections: [
        {
          title: "What we collect",
          body: [
            "When you request a BrandMirror read, we collect the email address you provide, the website URL you submit, your language preference, the generated report output, and basic technical information needed to run and deliver the service.",
            "If you buy a full report, payment details are handled by our payment provider. BrandMirror does not store your full card details.",
          ],
        },
        {
          title: "How we use it",
          body: [
            "We use this information to generate your free read, unlock and deliver paid reports, send your PDF by email, respond to support requests, prevent abuse, and improve the quality of BrandMirror.",
            "If you opt in, we may send occasional SAHAR/BrandMirror updates, offers, and useful articles about branding and AI. You can unsubscribe at any time.",
          ],
        },
        {
          title: "Service providers",
          body: [
            "We use trusted providers for hosting, database storage, email delivery, payment processing, analytics, and AI analysis. They process information only as needed to provide those services.",
          ],
        },
        {
          title: "Retention and requests",
          body: [
            "We keep report and customer records for as long as needed to provide the service, handle support, maintain purchase records, and improve diagnostics.",
            "You can ask us to access, correct, or delete your personal information by emailing hello@saharstudio.com.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "Terms",
      title: "Terms & Refund Policy",
      intro:
        "These terms explain how BrandMirror works, what the paid report includes, and when refunds apply.",
      updated: "Last updated: 30 April 2026",
      contact: "For support or refund questions, email hello@saharstudio.com.",
      back: "Back to BrandMirror",
      sections: [
        {
          title: "The service",
          body: [
            "BrandMirror is an AI-assisted brand and website diagnostic product by SAHAR Studio. It reads one submitted website surface and returns an editorial diagnostic report on positioning, AI visibility, offer clarity, visual credibility, and conversion readiness.",
            "The report is a strategic and creative diagnostic. It is not legal, financial, technical security, or guaranteed revenue advice.",
          ],
        },
        {
          title: "Paid report",
          body: [
            "The full BrandMirror Report costs $197 USD unless a valid promo code changes the amount due at checkout.",
            "After successful payment or approved promo access, the report is generated for the submitted URL and can be viewed, downloaded as a PDF, and emailed to the address provided.",
          ],
        },
        {
          title: "Refund policy",
          body: [
            "Because the report is a digital diagnostic generated for a submitted website, completed and delivered reports are generally non-refundable.",
            "We will review refund requests if you were charged twice, payment succeeded but the report was not delivered, or a technical issue prevented access. Email hello@saharstudio.com within 7 days of purchase with the email used at checkout and the website URL submitted.",
          ],
        },
        {
          title: "Use of the report",
          body: [
            "You may use the recommendations internally, share them with your team or developer, and use them to guide website, messaging, brand, and AI-visibility improvements.",
            "You may not resell BrandMirror reports, copy the product system, or present the diagnostic framework as your own product.",
          ],
        },
      ],
    },
  },
  es: {
    privacy: {
      eyebrow: "Privacidad",
      title: "Política de privacidad",
      intro:
        "Esta política explica qué recopila BrandMirror, por qué lo recopila y cómo contactarnos sobre tus datos.",
      updated: "Última actualización: 30 de abril de 2026",
      contact: "Para preguntas de privacidad, escribe a hello@saharstudio.com.",
      back: "Volver a BrandMirror",
      sections: [
        {
          title: "Qué recopilamos",
          body: [
            "Cuando solicitas una lectura de BrandMirror, recopilamos el email que proporcionas, la URL del sitio que envías, tu preferencia de idioma, el resultado del reporte generado y la información técnica básica necesaria para ejecutar y entregar el servicio.",
            "Si compras un reporte completo, los datos de pago los gestiona nuestro proveedor de pagos. BrandMirror no almacena los datos completos de tu tarjeta.",
          ],
        },
        {
          title: "Cómo lo usamos",
          body: [
            "Usamos esta información para generar tu primera lectura gratuita, desbloquear y entregar reportes pagados, enviar tu PDF por email, responder a solicitudes de soporte, prevenir abuso y mejorar la calidad de BrandMirror.",
            "Si das tu consentimiento, podemos enviarte novedades, ofertas y artículos útiles sobre branding e IA de SAHAR/BrandMirror. Puedes darte de baja en cualquier momento.",
          ],
        },
        {
          title: "Proveedores",
          body: [
            "Usamos proveedores de confianza para hosting, base de datos, envío de emails, pagos, analítica y análisis con IA. Procesan información solo cuando es necesario para prestar esos servicios.",
          ],
        },
        {
          title: "Retención y solicitudes",
          body: [
            "Conservamos registros de reportes y clientes mientras sea necesario para prestar el servicio, gestionar soporte, mantener registros de compra y mejorar los diagnósticos.",
            "Puedes pedir acceso, corrección o eliminación de tu información personal escribiendo a hello@saharstudio.com.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "Términos",
      title: "Términos y política de reembolsos",
      intro:
        "Estos términos explican cómo funciona BrandMirror, qué incluye el reporte pagado y cuándo aplican los reembolsos.",
      updated: "Última actualización: 30 de abril de 2026",
      contact: "Para soporte o reembolsos, escribe a hello@saharstudio.com.",
      back: "Volver a BrandMirror",
      sections: [
        {
          title: "El servicio",
          body: [
            "BrandMirror es un producto de diagnóstico de marca y sitio web asistido por IA, creado por SAHAR Studio. Lee una superficie web enviada y devuelve un reporte editorial sobre posicionamiento, visibilidad en IA, claridad de oferta, credibilidad visual y preparación para convertir.",
            "El reporte es un diagnóstico estratégico y creativo. No es asesoría legal, financiera, de seguridad técnica ni una garantía de ingresos.",
          ],
        },
        {
          title: "Reporte pagado",
          body: [
            "El BrandMirror Report completo cuesta $197 USD salvo que un código promocional válido cambie el importe en checkout.",
            "Después del pago exitoso o acceso aprobado por promo, el reporte se genera para la URL enviada y puede verse, descargarse como PDF y enviarse al email indicado.",
          ],
        },
        {
          title: "Política de reembolso",
          body: [
            "Como el reporte es un diagnóstico digital generado para un sitio enviado, los reportes completados y entregados generalmente no son reembolsables.",
            "Revisaremos solicitudes si hubo doble cargo, el pago fue exitoso pero el reporte no se entregó, o un problema técnico impidió el acceso. Escribe a hello@saharstudio.com dentro de los 7 días posteriores a la compra con el email usado y la URL enviada.",
          ],
        },
        {
          title: "Uso del reporte",
          body: [
            "Puedes usar las recomendaciones internamente, compartirlas con tu equipo o desarrollador y usarlas para mejorar sitio, mensaje, marca y visibilidad en IA.",
            "No puedes revender reportes BrandMirror, copiar el sistema del producto ni presentar el marco diagnóstico como tu propio producto.",
          ],
        },
      ],
    },
  },
  ru: {
    privacy: {
      eyebrow: "Конфиденциальность",
      title: "Политика конфиденциальности",
      intro:
        "Эта политика объясняет, какие данные собирает BrandMirror, зачем они нужны и как связаться с нами по вопросам данных.",
      updated: "Обновлено: 30 апреля 2026",
      contact: "По вопросам конфиденциальности пишите на hello@saharstudio.com.",
      back: "Назад в BrandMirror",
      sections: [
        {
          title: "Что мы собираем",
          body: [
            "Когда вы запрашиваете разбор BrandMirror, мы собираем email, который вы указываете, URL сайта, выбранный язык, результат сгенерированного отчёта и базовую техническую информацию, необходимую для работы и доставки сервиса.",
            "Если вы покупаете полный отчёт, платёжные данные обрабатывает платёжный провайдер. BrandMirror не хранит полные данные вашей карты.",
          ],
        },
        {
          title: "Как мы это используем",
          body: [
            "Мы используем эти данные, чтобы сгенерировать бесплатный первый разбор, открыть и доставить платный отчёт, отправить PDF на email, ответить на запросы поддержки, предотвращать злоупотребления и улучшать качество BrandMirror.",
            "Если вы дали согласие, мы можем иногда отправлять новости, предложения и полезные материалы SAHAR/BrandMirror о брендинге и ИИ. Вы можете отписаться в любой момент.",
          ],
        },
        {
          title: "Провайдеры",
          body: [
            "Мы используем доверенных провайдеров для хостинга, хранения данных, отправки email, обработки платежей, аналитики и AI-анализа. Они обрабатывают информацию только в объёме, необходимом для предоставления этих сервисов.",
          ],
        },
        {
          title: "Хранение и запросы",
          body: [
            "Мы храним записи отчётов и клиентов столько, сколько нужно для предоставления сервиса, поддержки, учёта покупок и улучшения диагностики.",
            "Вы можете запросить доступ, исправление или удаление персональной информации, написав на hello@saharstudio.com.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "Условия",
      title: "Условия и политика возвратов",
      intro:
        "Эти условия объясняют, как работает BrandMirror, что входит в платный отчёт и когда возможен возврат.",
      updated: "Обновлено: 30 апреля 2026",
      contact: "По вопросам поддержки или возврата пишите на hello@saharstudio.com.",
      back: "Назад в BrandMirror",
      sections: [
        {
          title: "Сервис",
          body: [
            "BrandMirror — это AI-assisted продукт для диагностики бренда и сайта от SAHAR Studio. Он читает одну указанную веб-страницу и возвращает редакционный диагностический отчёт по позиционированию, видимости в ИИ, ясности оффера, визуальному доверию и готовности к конверсии.",
            "Отчёт является стратегической и креативной диагностикой. Он не является юридической, финансовой, технической security-консультацией или гарантией выручки.",
          ],
        },
        {
          title: "Платный отчёт",
          body: [
            "Полный BrandMirror Report стоит $197 USD, если действующий промокод не меняет сумму к оплате.",
            "После успешной оплаты или доступа по промокоду отчёт генерируется для указанного URL, его можно посмотреть, скачать как PDF и получить на указанный email.",
          ],
        },
        {
          title: "Политика возврата",
          body: [
            "Поскольку отчёт является цифровой диагностикой, сгенерированной для конкретного сайта, завершённые и доставленные отчёты обычно не подлежат возврату.",
            "Мы рассмотрим возврат, если списание произошло дважды, платёж прошёл, но отчёт не был доставлен, или техническая проблема помешала доступу. Напишите на hello@saharstudio.com в течение 7 дней после покупки, указав email оплаты и URL сайта.",
          ],
        },
        {
          title: "Использование отчёта",
          body: [
            "Вы можете использовать рекомендации внутри своей команды, передавать их разработчику и применять для улучшения сайта, сообщения, бренда и видимости в ИИ.",
            "Нельзя перепродавать отчёты BrandMirror, копировать продуктовую систему или представлять диагностический фреймворк как собственный продукт.",
          ],
        },
      ],
    },
  },
};
