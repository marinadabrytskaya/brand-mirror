import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { normalizeUrl } from "@/lib/brand-read";
import { normalizeCustomerEmail } from "@/lib/customer-email";
import { getSiteLocale, type SiteLocale } from "@/lib/site-i18n";

const PROMO_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type PromoDiscount = {
  code: string;
  percentOff: number;
};

export type PromoAccess = {
  reference: string;
  reportUrl: string;
  locale: SiteLocale;
  customerEmail: string;
  customerName: string | null;
  amountTotal: number;
  currency: string;
  promoCode: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
};

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function getPromoSecret() {
  return (
    process.env.PROMO_TOKEN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.PAYSTACK_SECRET_KEY ||
    "brandmirror-local-promo-secret"
  );
}

function sign(payload: string) {
  return createHmac("sha256", getPromoSecret()).update(payload).digest("base64url");
}

function normalizePromoCode(code?: string | null) {
  return (code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

export function getPromoDiscount(code?: string | null): PromoDiscount | null {
  const normalizedCode = normalizePromoCode(code);
  if (!normalizedCode) return null;

  const entries = (process.env.PROMO_CODES || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const entry of entries) {
    const [rawCode, rawPercent] = entry.split(":");
    const candidate = normalizePromoCode(rawCode);
    const percentOff = Math.max(0, Math.min(100, Number(rawPercent || 0)));
    if (candidate && candidate === normalizedCode && percentOff > 0) {
      return { code: candidate, percentOff };
    }
  }

  return null;
}

export function applyPromoDiscount(amount: number, discount: PromoDiscount | null) {
  if (!discount) return amount;
  return Math.max(0, Math.round(amount * (1 - discount.percentOff / 100)));
}

export function createPromoToken({
  reportUrl,
  locale,
  email,
  promoCode,
  dataProcessingConsent,
  marketingConsent,
}: {
  reportUrl: string;
  locale: SiteLocale;
  email: string;
  promoCode: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}) {
  const normalizedUrl = normalizeUrl(reportUrl);
  const normalizedEmail = normalizeCustomerEmail(email);
  if (!normalizedUrl || !normalizedEmail) {
    throw new Error("Promo unlock needs a valid URL and email.");
  }

  const payload = base64url(
    JSON.stringify({
      ref: `promo-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 14)}`,
      url: normalizedUrl,
      locale,
      email: normalizedEmail,
      code: normalizePromoCode(promoCode),
      dataProcessingConsent,
      marketingConsent,
      exp: Date.now() + PROMO_TOKEN_TTL_MS,
    }),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyPromoToken(token?: string | null): PromoAccess | null {
  if (!token || !token.includes(".")) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const decoded = (() => {
    try {
      return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
        ref?: string;
        url?: string;
        locale?: string;
        email?: string;
        code?: string;
        dataProcessingConsent?: boolean;
        marketingConsent?: boolean;
        exp?: number;
      };
    } catch {
      return null;
    }
  })();
  if (!decoded) return null;

  if (!decoded.exp || decoded.exp < Date.now()) return null;
  const reportUrl = normalizeUrl(decoded.url);
  const customerEmail = normalizeCustomerEmail(decoded.email);
  if (!decoded.ref || !reportUrl || !customerEmail || !decoded.code) return null;

  return {
    reference: decoded.ref,
    reportUrl,
    locale: getSiteLocale(decoded.locale),
    customerEmail,
    customerName: null,
    amountTotal: 0,
    currency: "USD",
    promoCode: decoded.code,
    dataProcessingConsent: decoded.dataProcessingConsent === true,
    marketingConsent: decoded.marketingConsent === true,
  };
}
