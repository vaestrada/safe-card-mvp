import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase";
import AdminLoginForm from "@/components/AdminLoginForm";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  referral_code: string | null;
  fields: Record<string, unknown>;
  consent_at: string;
  created_at: string;
  status: string;
};

type FunnelRow = {
  advocate_code: string;
  landings: number;
  submissions: number;
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-sm px-4 py-16">
          <h1 className="text-2xl font-bold">Safe Card Admin</h1>
          <p className="mt-2 text-sm text-safe-muted">
            Para sa pilot team lamang. I-enter ang admin password para makita
            ang mga submissions.
          </p>
          <AdminLoginForm />
          <p className="mt-6 text-center text-xs text-safe-muted">
            <Link href="/" className="text-safe-red hover:underline">← Bumalik sa site</Link>
          </p>
        </section>
      </main>
    );
  }

  const client = createClient();
  const applications: ApplicationRow[] = [];
  const funnel: FunnelRow[] = [];

  if (client) {
    const { data: apps } = await client
      .from("applications")
      .select("id, referral_code, fields, consent_at, created_at, status")
      .order("created_at", { ascending: false });
    applications.push(...((apps as ApplicationRow[]) ?? []));

    const { data: fun } = await client
      .from("referral_funnel")
      .select("advocate_code, landings, submissions");
    funnel.push(...((fun as FunnelRow[]) ?? []));
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Safe Card Admin</h1>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export"
              className="rounded-lg border border-safe-line bg-white px-4 py-2 text-sm font-semibold text-safe-ink hover:bg-safe-cream"
            >
              I-export ang CSV
            </a>
            <LogoutButton />
          </div>
        </div>
        <p className="mt-2 text-sm text-safe-muted">
          Intake submissions para sa pilot. Ang Philippine Red Cross ang
          makikipag-ugnayan sa mga aplikante.
        </p>

        {/* Funnel */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-safe-line bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-safe-muted">Total submissions</p>
            <p className="mt-1 text-3xl font-bold">{applications.length}</p>
          </div>
          <div className="rounded-xl border border-safe-line bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-safe-muted">Referral landings</p>
            <p className="mt-1 text-3xl font-bold">
              {funnel.reduce((sum, f) => sum + f.landings, 0)}
            </p>
          </div>
          <div className="rounded-xl border border-safe-line bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-safe-muted">Conversion</p>
            <p className="mt-1 text-3xl font-bold">
              {(() => {
                const landings = funnel.reduce((s, f) => s + f.landings, 0);
                if (!landings) return "n/a";
                return `${Math.round((applications.length / landings) * 100)}%`;
              })()}
            </p>
          </div>
        </div>

        {/* Per-advocate funnel */}
        {funnel.length > 0 && (
          <div className="mt-6 rounded-xl border border-safe-line bg-white p-4">
            <h2 className="font-semibold">Bawat advocate</h2>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-safe-muted">
                  <th className="py-1 pr-2">Advocate</th>
                  <th className="py-1 pr-2">Landings</th>
                  <th className="py-1 pr-2">Submissions</th>
                  <th className="py-1">Rate</th>
                </tr>
              </thead>
              <tbody>
                {funnel.map((f) => (
                  <tr key={f.advocate_code} className="border-t border-safe-line">
                    <td className="py-2 pr-2">{f.advocate_code}</td>
                    <td className="py-2 pr-2">{f.landings}</td>
                    <td className="py-2 pr-2">{f.submissions}</td>
                    <td className="py-2">
                      {f.landings ? `${Math.round((f.submissions / f.landings) * 100)}%` : "n/a"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submissions table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-safe-line bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-safe-muted">
                <th className="px-4 py-3">Pangalan</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Sino ang sumagot</th>
                <th className="px-4 py-3">Referral</th>
                <th className="px-4 py-3">Petsa</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-safe-muted">
                    Wala pang submissions.
                  </td>
                </tr>
              )}
              {applications.map((a) => {
                const f = a.fields ?? {};
                return (
                  <tr key={a.id} className="border-t border-safe-line">
                    <td className="px-4 py-2">
                      {String(f.full_name ?? "")}
                      {f.assistant_name ? (
                        <span className="block text-xs text-safe-muted">
                          tinulungan ni {String(f.assistant_name)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2">{String(f.mobile ?? "")}</td>
                    <td className="px-4 py-2">{String(f.area ?? "")}</td>
                    <td className="px-4 py-2">{String(f.role ?? "")}</td>
                    <td className="px-4 py-2">
                      {f.who_answers === "assisted" ? "May tumulong" : "Sarili"}
                    </td>
                    <td className="px-4 py-2">{a.referral_code ?? "-"}</td>
                    <td className="px-4 py-2">
                      {new Date(a.created_at).toLocaleString("en-PH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
