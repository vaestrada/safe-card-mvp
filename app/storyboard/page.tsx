import Link from "next/link";

export default function StoryboardPage() {
  return (
    <main className="min-h-screen">
      <div className="dev-banner text-center text-xs px-4 py-1.5">
        PILOT BUILD · Sample storyboard. Final benefit wording subject to PRC
        approval.
      </div>

      <section className="mx-auto max-w-2xl px-4 pt-10 pb-14">
        <Link href="/" className="text-sm text-safe-red hover:underline">
          ← Bumalik
        </Link>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
          Ang kuwento ni Ate Liza
        </h1>
        <p className="mt-2 text-sm text-safe-muted">
          Isang senaryo sa simpleng salita kung paano gumagana ang Safe Card
          para sa mga kasambahay, driver, at caregiver.
        </p>

        <div className="mt-6 space-y-4">
          {[
            {
              step: "Frame 1",
              title: "May nagtiwala sa kanya",
              body: "Nasa bahay si Ate Liza, naglilinis. Inabot ng estudyanteng amo niya ang isang QR code: \"Ate, para po ito sa inyo. Safe Card ng Red Cross.\"",
            },
            {
              step: "Frame 2",
              title: "Basahin muna, intindihin muna",
              body: "I-scan ni Ate Liza ang QR. Makikita niya ang mga benepisyo sa simpleng salita: ambulance sa emergency, dugo kung kailangan, tulong kapag na-ospital dahil sa aksidente.",
            },
            {
              step: "Frame 3",
              title: "Dalawang minuto lang",
              body: "Sasagutan niya ang maikling form sa cellphone: pangalan, number, lugar. May privacy notice bago i-submit, kaya alam niya kung saan mapupunta ang impormasyon niya.",
            },
            {
              step: "Frame 4",
              title: "Ang susunod na hakbang",
              body: "Tapos na ang application. Darating ang susunod na hakbang mula sa Philippine Red Cross. Hindi pa ito awtomatikong enrollment; application pa lang ito.",
            },
          ].map((f) => (
            <div key={f.step} className="rounded-xl border border-safe-line bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-safe-red">
                {f.step}
              </p>
              <h2 className="mt-1 font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-safe-muted">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/apply"
            className="inline-block rounded-lg bg-safe-red px-7 py-3 text-base font-semibold text-white hover:bg-safe-red-dark"
          >
            Subukan ang application form
          </Link>
        </div>
      </section>
    </main>
  );
}
