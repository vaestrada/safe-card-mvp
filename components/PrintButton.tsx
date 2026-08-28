"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mb-4 w-full rounded-lg bg-safe-red px-4 py-2 text-sm font-semibold text-white hover:bg-safe-red-dark print:hidden"
    >
      I-print ang poster
    </button>
  );
}
