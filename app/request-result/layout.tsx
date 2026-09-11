import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Your Requested Information — Greendeal Compliance",
};

/**
 * Stage 7.12 — Request Result Link (AGENTS.md's "Request Result Link"
 * section), for a PUBLIC_REQUEST_LINK-origin requester who has no
 * Greendeal account. Same minimal public-facing chrome as
 * app/request/layout.tsx (Stage 7.4) and app/supplier-response/layout.tsx
 * (Stage 7.10), and for the same reason.
 */
export default function RequestResultLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-sm font-bold text-white"
            aria-hidden="true"
          >
            GC
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">
              Greendeal Compliance
            </p>
            <p className="text-xs text-slate-500">Your Requested Information</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
