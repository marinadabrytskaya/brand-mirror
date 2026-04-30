import "server-only";

import { normalizeUrl } from "@/lib/brand-read";
import { normalizeCustomerEmail } from "@/lib/customer-email";
import { getSiteLocale, type SiteLocale } from "@/lib/site-i18n";

const PAYSTACK_BASE_URL = "https://api.paystack.co";
export const REPORT_PRICE_ZAR_CENTS = 3_700_00;

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id?: number;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    customer?: {
      email?: string;
      first_name?: string | null;
      last_name?: string | null;
    };
    metadata?: {
      locale?: string;
      product?: string;
      customer_email?: string;
      promo_code?: string;
      discount_percent?: number;
      report_url?: string;
      data_processing_consent?: boolean | string;
      marketing_consent?: boolean | string;
    };
  };
};

export type PaystackCheckoutAccess = {
  reference: string;
  reportUrl: string;
  locale: SiteLocale;
  customerEmail: string | null;
  customerName: string | null;
  amountTotal: number | null;
  currency: string | null;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
};

export function isPaystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to continue.");
  }
  return secretKey;
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !payload) {
    throw new Error("Paystack request failed.");
  }

  return payload;
}

function createReference() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 18);
  return `bm-${Date.now()}-${random}`;
}

export async function createPaystackCheckout({
  origin,
  reportUrl,
  locale,
  email,
  amount,
  promoCode,
  discountPercent,
  dataProcessingConsent,
  marketingConsent,
}: {
  origin: string;
  reportUrl: string;
  locale: SiteLocale;
  email: string;
  amount?: number;
  promoCode?: string | null;
  discountPercent?: number | null;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}) {
  const normalizedUrl = normalizeUrl(reportUrl);
  if (!normalizedUrl) {
    throw new Error("Enter a valid website URL before opening checkout.");
  }

  const normalizedEmail = normalizeCustomerEmail(email);
  if (!normalizedEmail) {
    throw new Error("Enter a valid email address before opening checkout.");
  }

  const reference = createReference();
  const payload = await paystackFetch<PaystackInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      amount: amount ?? REPORT_PRICE_ZAR_CENTS,
      email: normalizedEmail,
      currency: "ZAR",
      reference,
      callback_url: `${origin}/full-report?reference=${encodeURIComponent(reference)}&lang=${locale}`,
      metadata: {
        locale,
        product: "brandmirror_full_report",
        display_price: "$197",
        customer_email: normalizedEmail,
        promo_code: promoCode || undefined,
        discount_percent: discountPercent || undefined,
        data_processing_consent: dataProcessingConsent,
        marketing_consent: marketingConsent,
        report_url: normalizedUrl,
      },
    }),
  });

  if (!payload.status || !payload.data?.authorization_url || !payload.data.reference) {
    throw new Error(payload.message || "Paystack checkout was created without a redirect URL.");
  }

  return {
    checkoutUrl: payload.data.authorization_url,
    reference: payload.data.reference,
    accessCode: payload.data.access_code ?? null,
  };
}

export async function getPaystackCheckoutAccess(reference?: string | null) {
  if (!reference || !isPaystackConfigured()) return null;

  const payload = await paystackFetch<PaystackVerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: "GET" },
  );

  if (!payload.status || payload.data?.status !== "success") {
    return null;
  }

  const reportUrl = normalizeUrl(payload.data.metadata?.report_url);
  if (!reportUrl) return null;

  const firstName = payload.data.customer?.first_name;
  const lastName = payload.data.customer?.last_name;
  const customerName = [firstName, lastName].filter(Boolean).join(" ") || null;

  return {
    reference: payload.data.reference || reference,
    reportUrl,
    locale: getSiteLocale(payload.data.metadata?.locale),
    customerEmail: payload.data.customer?.email ?? payload.data.metadata?.customer_email ?? null,
    customerName,
    amountTotal: payload.data.amount ?? null,
    currency: payload.data.currency ?? null,
    dataProcessingConsent: String(payload.data.metadata?.data_processing_consent) === "true",
    marketingConsent: String(payload.data.metadata?.marketing_consent) === "true",
  } satisfies PaystackCheckoutAccess;
}
