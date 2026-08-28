import { NextRequest, NextResponse } from "next/server";
import { recordApplication } from "@/lib/store";

const ALLOWED_ROLES = ["kasambahay", "driver", "caregiver", "other"];

/**
 * Application-intake write path (server-side only).
 * Validates, rejects bots (honeypot), then records the submission.
 * Supabase (live) when configured, local JSONL (synthetic) otherwise.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["Invalid request body."] }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Silently accept and do nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
  const area = typeof body.area === "string" ? body.area.trim() : "";
  const role = typeof body.role === "string" ? body.role : "";
  const consent = body.consent === true;
  const whoAnswers = body.who_answers === "assisted" ? "assisted" : "self";
  const assistantName =
    typeof body.assistant_name === "string" && body.assistant_name.trim() !== ""
      ? body.assistant_name.trim().slice(0, 120)
      : null;
  const referralCode =
    typeof body.referral_code === "string" && body.referral_code.trim() !== ""
      ? body.referral_code.trim().slice(0, 64)
      : null;

  const errors: string[] = [];
  if (fullName.length < 2) errors.push("Pakilagay ang buong pangalan.");
  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) {
    errors.push("Pakilagay ang tamang mobile number.");
  }
  if (area.length < 2) errors.push("Pakilagay ang inyong siyudad o barangay.");
  if (!ALLOWED_ROLES.includes(role)) errors.push("Pumili ng inyong trabaho o papel sa tahanan.");
  if (!consent) errors.push("Kailangan ang pahintulot sa privacy notice bago mag-submit.");

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  let mode: string;
  try {
    mode = await recordApplication({
      referral_code: referralCode,
      fields: {
        full_name: fullName,
        mobile,
        area,
        role,
        who_answers: whoAnswers,
        assistant_name: assistantName,
      },
      consent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("application store failure:", err);
    return NextResponse.json(
      { ok: false, errors: ["May problema sa pag-imbak ng application. Subukan muli."] },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, mode });
}
