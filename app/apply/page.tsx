import { cookies } from "next/headers";
import Link from "next/link";
import ApplyForm from "@/components/ApplyForm";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const ref = sp.ref ?? cookieStore.get("sc_ref")?.value ?? null;

  return (
    <main className="min-h-screen">
      <div className="dev-banner text-center text-xs px-4 py-1.5">
        PILOT BUILD · Sample application fields pending PRC approval. Synthetic
        data mode until privacy protocol is approved.
      </div>

      <section className="mx-auto max-w-lg px-4 pt-8 pb-14">
        <Link href="/" className="text-sm text-safe-red hover:underline">
          ← Bumalik
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Safe Card Application</h1>
        <p className="mt-2 text-sm text-safe-muted">
          Sagutan ang form na ito para maipadala ang inyong application intake.
          Tatagal lang ng halos dalawang minuto.
        </p>

        <div className="mt-6 rounded-2xl border border-safe-line bg-white p-5 sm:p-6">
          <ApplyForm initialRef={ref} />
        </div>
      </section>
    </main>
  );
}
