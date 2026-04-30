import { NextRequest, NextResponse } from "next/server";
import { getPromoDiscount } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    promoCode?: string;
  };
  const promoDiscount = getPromoDiscount(body.promoCode);

  if (!promoDiscount) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        error: "Promo code is not valid.",
        detail: "Check the promo code and try again.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    valid: true,
    promoCode: promoDiscount.code,
    discountPercent: promoDiscount.percentOff,
  });
}
