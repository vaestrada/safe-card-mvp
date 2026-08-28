"use client";

import { useEffect, useState } from "react";

const ROLES = [
  { value: "kasambahay", label: "Kasambahay (household helper)" },
  { value: "driver", label: "Driver" },
  { value: "caregiver", label: "Caregiver" },
  { value: "other", label: "Iba pa (other)" },
];

type SubmitStatus = "idle" | "sending" | "success" | "error";

export default function ApplyForm({ initialRef }: { initialRef: string | null }) {
  const [referralCode, setReferralCode] = useState<string | null>(initialRef);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [area, setArea] = useState("");
  const [role, setRole] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot, hidden from humans
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Robustness: persist referral through the journey even without cookies
    const stored = window.localStorage.getItem("sc_ref");
    if (stored && !referralCode) setReferralCode(stored);
  }, [referralCode]);

  useEffect(() => {
    if (referralCode) window.localStorage.setItem("sc_ref", referralCode);
  }, [referralCode]);

  function validate(): string[] {
    const errs: string[] = [];
    if (fullName.trim().length < 2) errs.push("Pakilagay ang buong pangalan.");
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      errs.push("Pakilagay ang tamang mobile number.");
    }
    if (area.trim().length < 2) errs.push("Pakilagay ang inyong siyudad o barangay.");
    if (!role) errs.push("Pumili ng inyong trabaho o papel sa tahanan.");
    if (!consent) errs.push("Kailangan ang pahintulot sa privacy notice bago mag-submit.");
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          mobile: mobile.trim(),
          area: area.trim(),
          role,
          referral_code: referralCode,
          consent: true,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrors(data.errors ?? ["May nangyaring problema. Subukan muli."]);
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrors(["May nangyaring problema sa koneksyon. Subukan muli."]);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-safe-line bg-white p-6 text-center">
        <h2 className="text-xl font-bold">Natanggap ang inyong application</h2>
        <p className="mt-2 text-sm text-safe-muted">
          Salamat. Ito ay application intake, hindi pa kumpirmadong enrollment.
          Ang susunod na hakbang ay manggagaling sa Philippine Red Cross.
        </p>
        {referralCode && (
          <p className="mt-2 text-xs text-safe-muted">
            Referral: {referralCode}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.length > 0 && (
        <div className="rounded-lg border border-safe-red bg-red-50 p-3 text-sm text-safe-red">
          {errors.map((e) => (
            <p key={e}>• {e}</p>
          ))}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium">
          Buong pangalan
        </label>
        <input
          id="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Hal. Maria Santos"
          className="mt-1 w-full rounded-lg border border-safe-line bg-white px-3 py-2 text-sm"
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block text-sm font-medium">
          Mobile number
        </label>
        <input
          id="mobile"
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="09XX XXX XXXX"
          className="mt-1 w-full rounded-lg border border-safe-line bg-white px-3 py-2 text-sm"
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="area" className="block text-sm font-medium">
          Siyudad o barangay
        </label>
        <input
          id="area"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Hal. Quezon City"
          className="mt-1 w-full rounded-lg border border-safe-line bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Trabaho o papel sa tahanan
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-lg border border-safe-line bg-white px-3 py-2 text-sm"
        >
          <option value="">Pumili...</option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot: hidden from humans, bots fill it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="rounded-lg border border-safe-line bg-safe-cream p-3">
        <p className="text-xs text-safe-muted">
          <strong className="text-safe-ink">Privacy notice (sample, pending approval):</strong>{" "}
          Ang impormasyong ilalagay mo ay gagamitin lamang para sa Safe Card
          application intake at ipapadala sa mga awtorisadong partido. Hindi ito
          ibebenta o ibabahagi sa iba nang walang pahintulot mo.
        </p>
        <label className="mt-2 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Binasa ko at sumasang-ayon ako sa privacy notice at sa pagproseso ng
            aking impormasyon.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-safe-red px-7 py-3 text-base font-semibold text-white hover:bg-safe-red-dark disabled:opacity-60"
      >
        {status === "sending" ? "Ipinapadala..." : "I-submit ang application"}
      </button>

      {referralCode && (
        <p className="text-center text-xs text-safe-muted">
          Mula sa referral ni: {referralCode}
        </p>
      )}
    </form>
  );
}
