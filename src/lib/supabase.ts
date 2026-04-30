import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type BrandReadResult } from "@/lib/brand-read";
import { type BrandReport } from "@/lib/brand-report";
import { normalizeCustomerEmail } from "@/lib/customer-email";
import { type SiteLocale } from "@/lib/site-i18n";

type EmailStatus = "pending" | "sent" | "skipped" | "failed";

export type BrandMirrorDigestFirstRead = {
  id: string;
  email: string;
  url: string;
  locale: string;
  result: BrandReadResult;
  created_at: string;
};

export type BrandMirrorDigestPaidReport = {
  id: string;
  email: string;
  url: string;
  locale: string;
  provider: string;
  payment_reference: string;
  amount_total: number | null;
  currency: string | null;
  report: BrandReport;
  email_status: EmailStatus;
  email_error: string | null;
  created_at: string;
};

let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return adminClient;
}

async function upsertCustomer(email: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("brandmirror_customers")
    .upsert(
      {
        email,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (error) throw error;
  return data?.id as string | undefined;
}

export async function saveFirstReadLead({
  email,
  url,
  locale,
  result,
}: {
  email: string;
  url: string;
  locale: SiteLocale;
  result: BrandReadResult;
}) {
  if (!isSupabaseConfigured()) return { saved: false, reason: "not_configured" };

  const normalizedEmail = normalizeCustomerEmail(email);
  if (!normalizedEmail) return { saved: false, reason: "invalid_email" };

  const customerId = await upsertCustomer(normalizedEmail);
  const { error } = await getSupabaseAdmin().from("brandmirror_first_reads").insert({
    customer_id: customerId,
    email: normalizedEmail,
    url,
    locale,
    result,
  });

  if (error) throw error;
  return { saved: true };
}

export async function getStoredPaidReport(paymentReference?: string | null) {
  if (!paymentReference || !isSupabaseConfigured()) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("brandmirror_paid_reports")
    .select("report,email_status,email_error")
    .eq("payment_reference", paymentReference)
    .maybeSingle();

  if (error) throw error;
  if (!data?.report) return null;

  return {
    report: data.report as BrandReport,
    emailStatus: (data.email_status || null) as EmailStatus | null,
    emailError: (data.email_error || null) as string | null,
  };
}

export async function savePaidReport({
  email,
  url,
  locale,
  provider,
  paymentReference,
  amountTotal,
  currency,
  report,
  emailStatus,
  emailError,
}: {
  email: string;
  url: string;
  locale: SiteLocale;
  provider: "paystack" | "stripe" | "promo";
  paymentReference: string;
  amountTotal: number | null;
  currency: string | null;
  report: BrandReport;
  emailStatus: EmailStatus;
  emailError?: string | null;
}) {
  if (!isSupabaseConfigured()) return { saved: false, reason: "not_configured" };

  const normalizedEmail = normalizeCustomerEmail(email);
  if (!normalizedEmail) return { saved: false, reason: "invalid_email" };

  const customerId = await upsertCustomer(normalizedEmail);
  const { error } = await getSupabaseAdmin().from("brandmirror_paid_reports").upsert(
    {
      customer_id: customerId,
      email: normalizedEmail,
      url,
      locale,
      provider,
      payment_reference: paymentReference,
      amount_total: amountTotal,
      currency,
      report,
      email_status: emailStatus,
      email_error: emailError || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "payment_reference" },
  );

  if (error) throw error;
  return { saved: true };
}

export async function getBrandMirrorDigest({
  since,
  until,
}: {
  since: Date;
  until: Date;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = getSupabaseAdmin();
  const sinceIso = since.toISOString();
  const untilIso = until.toISOString();

  const [firstReadsResult, paidReportsResult] = await Promise.all([
    supabase
      .from("brandmirror_first_reads")
      .select("id,email,url,locale,result,created_at")
      .gte("created_at", sinceIso)
      .lt("created_at", untilIso)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("brandmirror_paid_reports")
      .select("id,email,url,locale,provider,payment_reference,amount_total,currency,report,email_status,email_error,created_at")
      .gte("created_at", sinceIso)
      .lt("created_at", untilIso)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (firstReadsResult.error) throw firstReadsResult.error;
  if (paidReportsResult.error) throw paidReportsResult.error;

  return {
    firstReads: (firstReadsResult.data || []) as BrandMirrorDigestFirstRead[],
    paidReports: (paidReportsResult.data || []) as BrandMirrorDigestPaidReport[],
  };
}
