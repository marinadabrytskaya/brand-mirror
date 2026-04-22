import "server-only";

import Stripe from "stripe";
import { normalizeUrl } from "@/lib/brand-read";
import { getSiteLocale, type SiteLocale } from "@/lib/site-i18n";

const STRIPE_API_VERSION = "2026-03-25.dahlia";
const REPORT_PRICE_USD_CENTS = 19_700;

let stripeSingleton: Stripe | null = null;

export type PaidCheckoutAccess = {
  sessionId: string;
  reportUrl: string;
  locale: SiteLocale;
  customerEmail: string | null;
  customerName: string | null;
  amountTotal: number | null;
  currency: string | null;
};

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to continue.");
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
    });
  }

  return stripeSingleton;
}

export async function createCheckoutSession({
  origin,
  reportUrl,
  locale,
}: {
  origin: string;
  reportUrl: string;
  locale: SiteLocale;
}) {
  const normalizedUrl = normalizeUrl(reportUrl);
  if (!normalizedUrl) {
    throw new Error("Enter a valid website URL before opening checkout.");
  }

  const stripe = getStripe();
  const successUrl = `${origin}/full-report?session_id={CHECKOUT_SESSION_ID}&lang=${locale}`;
  const cancelUrl = `${origin}/first-read?url=${encodeURIComponent(normalizedUrl)}&lang=${locale}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_creation: "always",
    billing_address_collection: "auto",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: REPORT_PRICE_USD_CENTS,
          product_data: {
            name: "BrandMirror Full Report",
            description:
              "Paid diagnostic layer with full report access and PDF export.",
          },
        },
      },
    ],
    metadata: {
      locale,
      product: "brandmirror_full_report",
      report_url: normalizedUrl,
    },
  });

  if (!session.url) {
    throw new Error("Stripe checkout session was created without a redirect URL.");
  }

  return session;
}

export async function getPaidCheckoutAccess(sessionId?: string | null) {
  if (!sessionId || !isStripeConfigured()) return null;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid"
  ) {
    return null;
  }

  const reportUrl = normalizeUrl(session.metadata?.report_url);
  if (!reportUrl) return null;

  return {
    sessionId: session.id,
    reportUrl,
    locale: getSiteLocale(session.metadata?.locale),
    customerEmail: session.customer_details?.email ?? null,
    customerName: session.customer_details?.name ?? null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
  } satisfies PaidCheckoutAccess;
}
