import { NextResponse } from "next/server";
import { sendBrandMirrorDigestEmail } from "@/lib/report-email";
import { getBrandMirrorDigest } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

function digestWindow(until: Date) {
  const utcDay = until.getUTCDay();
  const daysBack = utcDay === 0 ? 4 : utcDay === 3 ? 3 : 4;
  return {
    since: new Date(until.getTime() - daysBack * DAY_MS),
    until,
  };
}

function recipientsFromEnv() {
  const raw = process.env.REPORT_DIGEST_TO || process.env.REPORT_EMAIL_BCC || process.env.REPORT_EMAIL_FROM || "";
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function publicErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const candidate = error as { message?: unknown; error?: unknown; code?: unknown };
    if (typeof candidate.message === "string") {
      return candidate.code ? `${candidate.message} (${String(candidate.code)})` : candidate.message;
    }
    if (typeof candidate.error === "string") return candidate.error;
  }
  return "Unable to send BrandMirror digest.";
}

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { ok: false, error: "CRON_SECRET is not configured." },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const to = recipientsFromEnv();
    if (!to.length) {
      return NextResponse.json(
        { ok: false, error: "REPORT_DIGEST_TO is not configured." },
        { status: 500 },
      );
    }

    const now = new Date();
    const { since, until } = digestWindow(now);
    const { firstReads, paidReports } = await getBrandMirrorDigest({ since, until });
    const delivery = await sendBrandMirrorDigestEmail({
      to,
      since,
      until,
      firstReads,
      paidReports,
    });

    return NextResponse.json({
      ok: delivery.status === "sent",
      since: since.toISOString(),
      until: until.toISOString(),
      firstReads: firstReads.length,
      paidReports: paidReports.length,
      recipients: to.length,
      delivery,
    });
  } catch (error) {
    console.error("Unable to send BrandMirror digest", error);
    return NextResponse.json(
      {
        ok: false,
        error: publicErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
