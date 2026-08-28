import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the SERVICE ROLE key.
 * Never expose this client to the browser.
 *
 * Returns null when Supabase is not configured, which switches the
 * app into SYNTHETIC MODE (local JSONL store) per the pilot guardrails:
 * no real applicant data is collected until privacy/consent protocol
 * is approved and the project-owned Supabase instance is provisioned.
 */
export function createClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
