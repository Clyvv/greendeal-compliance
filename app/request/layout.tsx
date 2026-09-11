import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Request Compliance Information — Greendeal Compliance",
};

/**
 * Stage 7.4 — deliberately outside app/(app) (see that group's
 * layout). No AppShell, no Header/Sidebar, no RoleSwitcher: an
 * unauthenticated external visitor following a link from an email has
 * no Greendeal account and no "role" to switch (AGENTS.md §9's role
 * switcher is a Supplier/Manufacturer prototype concept that simply
 * doesn't apply here). This is the entire public-facing chrome —
 * intentionally minimal, just enough to establish trust (branding +
 * what this page is) before anything else loads.
 */
export default function PublicRequestLayout({
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
              Request Compliance Information
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
