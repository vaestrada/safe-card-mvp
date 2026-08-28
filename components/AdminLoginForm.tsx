"use client";

import { useState } from "react";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.reload();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setSending(false);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {error && (
        <p className="rounded-lg border border-safe-red bg-red-50 p-3 text-sm text-safe-red">
          Mali ang password. Subukan muli.
        </p>
      )}
      <div>
        <label htmlFor="admin_password" className="block text-sm font-medium">
          Admin password
        </label>
        <input
          id="admin_password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-safe-line bg-white px-3 py-2 text-sm"
          autoFocus
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-safe-red px-4 py-2 text-sm font-semibold text-white hover:bg-safe-red-dark disabled:opacity-60"
      >
        {sending ? "Sinusuri..." : "Pumasok"}
      </button>
    </form>
  );
}
