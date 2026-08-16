"use client";

import { ReactNode, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header onMenuClick={() => setMobileNavOpen((value) => !value)} />
      <div className="flex flex-1">
        <Sidebar className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex" />

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        {/*
          [contain:paint] fixes a real cross-browser quirk: a wide,
          horizontally-scrollable table (see components/ui/table.tsx)
          inside a properly-clipped overflow-x-auto container can still
          leak its full unclipped layout width into
          document.documentElement.scrollWidth, letting the whole page
          scroll sideways into blank space even though every element up
          to <body> correctly reports no overflow. CSS containment
          stops that leak at its source. Portals (Dialog/Toast) target
          document.body directly, not this element, so they're
          unaffected.
        */}
        <main className="min-w-0 flex-1 px-4 py-6 [contain:paint] sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
