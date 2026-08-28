import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const client = createClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "storage not configured" }, { status: 503 });
  }

  const { data, error } = await client
    .from("applications")
    .select("id, referral_code, fields, consent_at, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const header = [
    "id", "full_name", "mobile", "area", "role", "who_answers",
    "assistant_name", "referral_code", "consent_at", "created_at", "status",
  ];
  const rows = (data ?? []).map((row) => {
    const f = (row.fields ?? {}) as Record<string, unknown>;
    return [
      row.id, f.full_name, f.mobile, f.area, f.role, f.who_answers,
      f.assistant_name, row.referral_code, row.consent_at, row.created_at, row.status,
    ].map(csvCell).join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="safe-card-submissions.csv"',
    },
  });
}
