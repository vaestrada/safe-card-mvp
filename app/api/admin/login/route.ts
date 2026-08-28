import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/admin";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  const ok = await login(password);
  return NextResponse.json({ ok });
}
