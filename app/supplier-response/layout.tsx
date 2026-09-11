import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Complete Your Product Information — Greendeal Compliance",
};

/**
 * Stage 7.10 — Supplier Response Link (AGENTS.md's "Supplier Response
 * Link" section), distinct from the Public Request Link (app/request).
 * Same minimal public-facing chrome as app/request/layout.tsx and for
 * the same reason: an unauthenticated supplier following a link from an
 * email has no Greendeal account and no role to switch.
 */
export default function SupplierResponseLayout({
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
            <p className="text-xs text-slate-500">
              Complete Your Product Information
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
