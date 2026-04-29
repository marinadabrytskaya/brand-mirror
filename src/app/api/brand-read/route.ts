import { NextResponse } from "next/server";
import { generateBrandRead } from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";
import { normalizeCustomerEmail } from "@/lib/customer-email";
import { saveFirstReadLead } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
      email?: string;
    };
    const email = normalizeCustomerEmail(body.email);
    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required before the free report.",
          detail: "Enter a valid email address to receive your BrandMirror report.",
        },
        { status: 400 },
      );
    }

    const locale = getSiteLocale(body.language);
    const payload = await generateBrandRead(body.url || "", locale);
    await saveFirstReadLead({
      email,
      url: payload.url,
      locale,
      result: payload.result,
    }).catch((saveError) => {
      console.warn("Unable to save first read lead", saveError);
    });

    return NextResponse.json({
      ok: true,
      ...payload,
    });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    const detail =
      typeof error === "object" &&
      error !== null &&
      "publicDetail" in error &&
      typeof error.publicDetail === "string"
        ? error.publicDetail
        : error instanceof Error
          ? error.message
          : "Something went wrong while reading the website.";

    return NextResponse.json(
      {
        error: "Unable to generate the brand read right now.",
        detail,
      },
      { status },
    );
  }
}
