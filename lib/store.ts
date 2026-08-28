import { createClient } from "@/lib/supabase";
import { mkdir, appendFile } from "fs/promises";
import path from "path";

type StoreMode = "live" | "synthetic";

async function appendJsonl(filename: string, record: Record<string, unknown>) {
  const abs = path.join(process.cwd(), "data", filename);
  await mkdir(path.dirname(abs), { recursive: true });
  await appendFile(abs, JSON.stringify(record) + "\n", "utf8");
}

/**
 * Record a referral landing (QR or link).
 * Live mode: Supabase `referrals`. Synthetic mode: local JSONL.
 */
export async function recordReferral(
  advocateCode: string,
  source: "qr" | "link",
  path: string
): Promise<StoreMode> {
  const client = createClient();
  if (client) {
    await client.from("referrals").insert({
      advocate_code: advocateCode,
      source,
      path,
    });
    return "live";
  }
  await appendJsonl("referrals.jsonl", {
    advocate_code: advocateCode,
    source,
    path,
    created_at: new Date().toISOString(),
  });
  return "synthetic";
}

/**
 * Record an application-intake submission.
 * Live mode: Supabase `applications`. Synthetic mode: local JSONL.
 */
export async function recordApplication(input: {
  referral_code: string | null;
  fields: Record<string, string>;
  consent_at: string;
}): Promise<StoreMode> {
  const client = createClient();
  if (client) {
    await client.from("applications").insert({
      referral_code: input.referral_code,
      fields: input.fields,
      consent_at: input.consent_at,
      status: "submitted",
    });
    return "live";
  }
  await appendJsonl("applications.jsonl", {
    ...input,
    status: "submitted",
    created_at: new Date().toISOString(),
  });
  return "synthetic";
}
