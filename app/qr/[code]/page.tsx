import { headers } from "next/headers";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

/**
 * Advocate QR poster: /qr/<advocate-code>
 * A printable card an advocate can pin or share. The QR always points at the
 * same deployment it is served from, with ?source=qr for measurement.
 */
export default async function QrPosterPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Advocate display name from the pilot roster (fall back to the code).
  let advocateName: string | null = null;
  const client = createClient();
  if (client) {
    const { data, error } = await client
      .from("advocates")
      .select("full_name")
      .eq("code", code)
      .maybeSingle();
    if (!error && data) advocateName = data.full_name;
  }

  // Absolute referral URL from the live request (works on preview and prod).
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const target = `${proto}://${host}/r/${encodeURIComponent(code)}?source=qr`;

  const qrSvg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#1c1a17", light: "#ffffff" },
  });

  return (
    <main className="min-h-screen print:bg-white">
      <div className="dev-banner text-center text-xs px-4 py-1.5 print:hidden">
        PILOT BUILD · Advocate QR poster · Content pending PRC approval
      </div>

      <section className="mx-auto max-w-md px-4 py-10 print:max-w-full print:py-0">
        <PrintButton />

        <div className="rounded-2xl border border-safe-line bg-white p-6 text-center shadow-sm print:border-0 print:shadow-none">
          <img
            src="/wordmark.svg"
            alt="Safe Card"
            className="mx-auto h-10 w-auto"
          />
          <p className="mt-1 text-sm font-semibold text-safe-ink">
            Referral poster ni {advocateName ?? code}
          </p>
          <p className="mt-1 text-xs text-safe-muted">
            I-scan para matutunan at ma-apply ang Safe Card
          </p>

          <div
            className="mx-auto mt-5 w-56 print:w-64"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />

          <p className="mt-4 text-xs text-safe-muted break-all">
            {target}
          </p>

          <div className="mt-5 space-y-2 text-left text-xs text-safe-muted">
            <p>1. I-scan ang QR gamit ang cellphone camera.</p>
            <p>2. Basahin ang mga benepisyo sa simpleng salita.</p>
            <p>3. Sagutan ang maikling application form.</p>
          </div>

          <p className="mt-5 border-t border-safe-line pt-3 text-[10px] text-safe-muted">
            Application intake lamang ito, hindi awtomatikong enrollment o
            coverage. Pilot content subject to Philippine Red Cross approval.
          </p>
        </div>
      </section>
    </main>
  );
}
