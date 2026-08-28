"use client";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.reload();
      }}
      className="rounded-lg bg-safe-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-80"
    >
      Logout
    </button>
  );
}
