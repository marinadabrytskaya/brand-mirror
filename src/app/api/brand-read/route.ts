import { NextResponse } from "next/server";
import { generateBrandRead } from "@/lib/brand-read";
import { getSiteLocale } from "@/lib/site-i18n";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      language?: string;
    };
    const payload = await generateBrandRead(body.url || "", getSiteLocale(body.language));

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
