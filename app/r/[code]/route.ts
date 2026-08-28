import { NextRequest, NextResponse } from "next/server";
import { recordReferral } from "@/lib/store";

/**
 * Referral entry point: /r/<advocate-code>
 * Records the landing for measurement, persists the referral id in a cookie,
 * and continues the journey to /apply.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const source = request.nextUrl.searchParams.get("source") === "qr" ? "qr" : "link";

  await recordReferral(code, source, request.nextUrl.pathname);

  const res = NextResponse.redirect(new URL("/apply", request.url));
  res.cookies.set("sc_ref", code, {
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}
