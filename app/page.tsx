import { cookies } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const ref = cookieStore.get("sc_ref")?.value ?? null;

  const applyHref = ref ? `/apply?ref=${encodeURIComponent(ref)}` : "/apply";

  return (
    <main className="min-h-screen">
      <div className="dev-banner text-center text-xs px-4 py-1.5">
        PILOT BUILD · Iteration 01 · Copy and benefits shown are sample content
        pending PRC approval
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-2xl px-4 pt-14 pb-10 text-center">
        <p className="text-sm font-medium tracking-wide text-safe-red uppercase">
          Safe Card Pilot
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
          Proteksyon na naiintindihan mo, sa isang tap.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-safe-muted">
          Isang simpleng paraan para matutunan at ma-apply ang Safe Card ng
          Philippine Red Cross, mula sa taong pinagkakatiwalaan mo.
        </p>
        <div className="mt-7">
          <Link
            href={applyHref}
            className="inline-block rounded-lg bg-safe-red px-7 py-3 text-base font-semibold text-white shadow-sm hover:bg-safe-red-dark"
          >
            Mag-apply dito
          </Link>
          <Link
            href="/storyboard"
            className="ml-3 inline-block rounded-lg border border-safe-line bg-white px-7 py-3 text-base font-semibold text-safe-ink hover:bg-safe-cream"
          >
            Basahin ang kuwento
          </Link>
        </div>
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/og.png"
          aria-label="Isang kasambahay na nakatingin sa kanyang cellphone, may pag-asa"
          className="mx-auto mt-8 w-full max-w-2xl rounded-xl border border-safe-line shadow-sm"
        >
          <source src="/assets/hero.mp4" type="video/mp4" />
          <img
            src="/assets/og.png"
            alt="Isang kasambahay na nakatingin sa kanyang cellphone, may pag-asa"
          />
        </video>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-2xl px-4 pb-12">
        <h2 className="text-lg font-semibold">Ano ang makukuha mo</h2>
        <p className="mt-1 text-sm text-safe-muted">
          Sample benefits from PRC materials. Final wording subject to PRC
          confirmation before the pilot goes live.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["Emergency ambulance service", "Sakaling may emergency, may sasagot."],
            ["One unit of whole blood", "Kung kailangan mo o ng pamilya mo."],
            ["Accident hospitalization coverage", "Tulong kapag na-ospital dahil sa aksidente."],
            ["Dengue-related assistance", "Suporta sa panahon ng sakit."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-safe-line bg-white p-4">
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="mt-1 text-sm text-safe-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-safe-line bg-white">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <h2 className="text-lg font-semibold">Paano ito gumagana</h2>
          <ol className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe-red text-xs font-bold text-white">1</span>
              <span>I-tap ang QR o link na ibinigay ng advocate na pinagkakatiwalaan mo.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe-red text-xs font-bold text-white">2</span>
              <span>Basahin ang mga benepisyo sa simpleng salita.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe-red text-xs font-bold text-white">3</span>
              <span>Sagutan ang maikling application form. Susunod na hakbang ay confirmation.</span>
            </li>
          </ol>
          <p className="mt-6 text-xs text-safe-muted">
            Ang submission na ito ay application intake, hindi awtomatikong
            enrollment o coverage, hanggang kumpirmahin ng Philippine Red Cross.
          </p>
        </div>
      </section>

      <footer className="mx-auto max-w-2xl px-4 py-8 text-center text-xs text-safe-muted">
        <div className="mb-3 flex items-center justify-center gap-3">
          <img src="/assets/prc-logo.png" alt="Philippine Red Cross logo" className="h-10 w-auto opacity-80" />
          <span className="text-left">
            Program reference: Philippine Red Cross Safe Card.
            <br />
            Logo shown pending formal PRC approval for this pilot.
          </span>
        </div>
        Safe Card MVP · Iteration 01 · VibeCodersPH pilot · Aug 2026
      </footer>
    </main>
  );
}
